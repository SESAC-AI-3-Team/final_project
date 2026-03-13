import os
import gc
import json
import time
import torch
import re
import requests
import collections
import jiwer
from PIL import Image
from transformers import AutoProcessor, AutoModel
from safetensors.torch import load_file

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DATASET_JSONL = os.path.join(BASE_DIR, 'dataset', 'jsonl', 'val_augmented.jsonl')
DATASET_JSONL = os.path.join(BASE_DIR, 'dataset', 'jsonl', 'val.jsonl')
DATASET_IMG_DIR = os.path.join(BASE_DIR, 'dataset', 'images')
MAX_PIXELS = 1280 * 28 * 28
FIELDS = ["상호명", "사업자번호", "날짜", "합계"]

def clean_ocr_text(raw_text):
    raw_text = re.sub(r'<\|LOC_\d+\|>', '', raw_text)
    raw_text = re.sub(r'<\|[A-Z_]+\|>', '', raw_text)
    return raw_text.strip()

def post_process_dict(d: dict) -> dict:
    res = dict(d)
    if res.get("사업자번호"):
        biz = re.sub(r'\D', '', res["사업자번호"])
        if len(biz) == 10:
            res["사업자번호"] = f"{biz[:3]}-{biz[3:5]}-{biz[5:]}"
    if res.get("날짜"):
        date_str = res["날짜"].strip()
        m1 = re.match(r'^(\d{2})[-./](\d{1,2})[-./](\d{1,2})$', date_str)
        if m1:
            res["날짜"] = f"20{m1.group(1)}-{int(m1.group(2)):02d}-{int(m1.group(3)):02d}"
        else:
            m2 = re.match(r'^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$', date_str)
            if m2:
                res["날짜"] = f"{m2.group(1)}-{int(m2.group(2)):02d}-{int(m2.group(3)):02d}"
    if res.get("합계"):
        # 콤마, 공백 및 숫자 이외의 문자를 전부 제거 (숫자가 여러 개 콤마로 나열된 경우 앞의 하나만 취함)
        total_str = res["합계"].strip()
        # "17,900, 5,000" 형태일 경우 정규식으로 첫 번째 숫자 덩어리만 추출
        m = re.match(r'^([\d,]+)', total_str)
        if m:
            total = m.group(1).replace(',', '')
            res["합계"] = total
        else:
            res["합계"] = re.sub(r'[^\d]', '', total_str)
            
    return res

def _extract_gt_fields(text_info):
    res = {k: "" for k in FIELDS}
    for idx, t in enumerate(text_info):
        text = t.get('text', '')
        if t.get('tag') == 'mask':
            for k in FIELDS:
                if text == f"{k}은?" or text == f"{k}는?":
                    if idx + 1 < len(text_info):
                        res[k] = text_info[idx+1].get('text', '').strip()
    return post_process_dict(res)

def _regex_extract(ocr: str) -> dict:
    lines = [l.strip() for l in ocr.split('\n') if l.strip()]
    biz_match = re.search(r'\b(\d{3}[-–]\d{2}[-–]\d{5}|\d{10})\b', ocr)
    biz_no = biz_match.group(1) if biz_match else ""

    date_match = re.search(
        r'(?:(20\d{2})[./년]\s*(\d{1,2})[./월]\s*(\d{1,2})|(\d{2})[./년-]\s*(\d{1,2})[./월-]\s*(\d{1,2}))', ocr
    )
    date = ""
    if date_match:
        g = date_match.groups()
        if g[0]: date = f"{g[0]}-{int(g[1]):02d}-{int(g[2]):02d}"
        else: yr = int(g[3]); date = f"20{yr:02d}-{int(g[4]):02d}-{int(g[5]):02d}"

    total = ""
    for pat in [
        r'(?:결제대상금액|결제금액|총결제금액|총합계|합\s*계)\s*[:\s]*([0-9,]+)',
        r'합\s+계\s*[:\s]*([0-9,]+)',
        r'합\s*계\s*[:\s]*([0-9,]+)',
    ]:
        m = re.search(pat, ocr)
        if m: 
            total = m.group(1).replace(',', '')
            break
    if not total:
        amounts = re.findall(r'\b([1-9][0-9]{2,6})\b', ocr)
        if amounts: total = max(amounts, key=lambda x: int(x))

    store = ""
    store_match = re.search(r'(?:상\s*호|가맹점명|상호명)\s*[:\s]+([^\n]+)', ocr)
    if store_match:
        store = store_match.group(1).strip().split()[0]
    else:
        if biz_no:
            for i, line in enumerate(lines):
                if biz_no.replace('-', '') in line.replace('-', ''):
                    before = line[:line.replace('-', '').find(biz_no.replace('-', ''))].strip()
                    if before and len(before) > 1: store = before
                    elif i > 0: store = lines[i - 1]
                    else: store = lines[0] if lines else ""
                    break
    if not store: store = lines[0] if lines else ""
    store = re.sub(r'^["\'\s\"]+|["\'\s\"]+$', '', store)
    
    return post_process_dict({"상호명": store, "사업자번호": biz_no, "날짜": date, "합계": total})

def _llm_extract(ocr: str) -> dict:
    prompt = f'''
당신은 한국 영수증(Korean Receipt) 정보 추출 전문가입니다. 
다음 영수증 OCR 텍스트에서 4가지 핵심 정보를 찾아 JSON 형식으로만 반환하세요.

[추출 대상 및 가이드라인]
1. "상호명": 가맹점, 매장, 회사 이름 (예: 스타벅스, (주)아성다이소, CU 등)
2. "사업자번호": 10자리 숫자로 구성된 사업자등록번호. 주로 '사업자번호', '등록번호' 등의 키워드 뒤에 123-45-67890 또는 1234567890 형태로 등장합니다. (하이픈 포함 무방)
3. "날짜": 결제일, 승인일, 거래일. 숫자 형태의 날짜를 찾아 YYYY-MM-DD 형태로 변환하세요. (예: 25-04-19 -> 25-04-19, 2024.12.31 -> 2024-12-31)
4. "합계": 총 결제금액, 받은금액, 합계 등 영수증의 최종 청구/결제 금액 딱 1개만 추출하세요. (예: 17,900, 5,000, 26,200 처럼 여러 개를 나열하지 말고 가장 중요한 결제 금액 하나만 추출). 숫자에서 쉼표(,)는 제외하고 순수 숫자만 반환하세요 (예: 17900).

[출력 형식 제한]
- 반드시 JSON 객체만 출력해야 하며, 마크다운 코드 블록이나 추가적인 설명은 절대 포함하지 마세요.
- JSON key는 정확히 "상호명", "사업자번호", "날짜", "합계" 4개만 사용하세요.
- 텍스트에서 정보를 찾을 수 없거나 인식할 수 없는 경우, 해당 key의 값은 빈 문자열("")로 설정하세요.

[OCR 텍스트]
{ocr}
'''
    try:
        res = requests.post("http://localhost:11434/api/generate", json={
            "model": "llama3.2",
            "prompt": prompt,
            "format": "json",
            "stream": False
        }, timeout=30)
        if res.status_code == 200:
            content = res.json().get('response', '{}')
            parsed = json.loads(content)
            # print(parsed)
            return post_process_dict({k: str(parsed.get(k, "")) for k in FIELDS})
            
    except Exception as e:
        print(f"Ollama error: {e}")
    return post_process_dict({k: "" for k in FIELDS})

def _calc_f1(pred, gt):
    if not pred and not gt: return 1.0
    if not pred or not gt: return 0.0
    pc = list(pred.replace(' ', ''))
    gc = list(gt.replace(' ', ''))
    common = sum((collections.Counter(pc) & collections.Counter(gc)).values())
    p = common / len(pc) if pc else 0.0
    r = common / len(gc) if gc else 0.0
    if p + r == 0: return 0.0
    return 2 * p * r / (p + r)

def evaluate_method(method_name, extract_fn, ocr_raw, gt_dict):
    t0 = time.time()
    pred_dict = extract_fn(ocr_raw)
    t1 = time.time()
    speed = t1 - t0

    res = {}
    for k in FIELDS:
        gt = gt_dict.get(k, "")
        pred = pred_dict.get(k, "")
        
        is_not_null = 1.0 if str(pred).strip() else 0.0
        
        is_correct = 0.0
        if not pred and not gt:
            is_correct = 1.0
        elif not pred or not gt:
            is_correct = 0.0
        elif k == "상호명":
            pred_clean = pred.replace(" ", "")
            gt_clean = gt.replace(" ", "")
            if pred_clean in gt_clean or gt_clean in pred_clean:
                is_correct = 1.0
            else:
                is_correct = 1.0 if pred == gt else 0.0
        else:
            is_correct = 1.0 if pred == gt else 0.0
            
        acc = is_correct
        f1 = 1.0 if is_correct == 1.0 else _calc_f1(pred, gt)
        
        res[k] = {"not_null": is_not_null, "acc": acc, "f1": f1}
    
    return res, speed

def main():
    if not os.path.exists(DATASET_JSONL):
        print(f"Dataset not found: {DATASET_JSONL}")
        return

    with open(DATASET_JSONL, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    total_lines = len(lines)
        
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    print(f"Loading processor and Base Model...", flush=True)
    try:
        processor = AutoProcessor.from_pretrained(
                "PaddlePaddle/PaddleOCR-VL-1.5",
                trust_remote_code=True,
            )

        model = AutoModel.from_pretrained(
                "PaddlePaddle/PaddleOCR-VL-1.5",
                torch_dtype=torch.bfloat16 if device == "cuda" else torch.float32,
                trust_remote_code=True,
            ).to(device).eval()
        ft_weights_path = os.path.join(BASE_DIR, 'model', 'paddle_sft', 'model-00001-of-00001.safetensors')
        ft_weights_dict = load_file(ft_weights_path)
        model.load_state_dict(ft_weights_dict, strict=False)
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    metrics = {
        "Regex": {"speed": 0.0, "samples": 0, "fields": {k: {"not_null": 0.0, "acc": 0.0, "f1": 0.0} for k in FIELDS}},
        "LLM":   {"speed": 0.0, "samples": 0, "fields": {k: {"not_null": 0.0, "acc": 0.0, "f1": 0.0} for k in FIELDS}},
        "RE+LLM": {"speed": 0.0, "samples": 0, "fields": {k: {"not_null": 0.0, "acc": 0.0, "f1": 0.0} for k in FIELDS}},
    }
    
    md_output_path = os.path.join(BASE_DIR, 'extraction_results.md')
    with open(md_output_path, 'w', encoding='utf-8') as md_f:
        md_f.write("# Regex vs LLM vs RE+LLM Extraction Results\n\n")
    
    for i, line in enumerate(lines):
        # if i >= 50: # Limit for testing
        #     break
        try:
            data = json.loads(line)
            img_url = data['image_info'][0]['image_url']
            img_basename = os.path.basename(img_url)
            local_img_path = os.path.join(DATASET_IMG_DIR, img_basename)
            if not os.path.exists(local_img_path): continue
                
            ocr_idx = next(idx for idx, t in enumerate(data['text_info']) if t.get('text') == 'OCR:' and t.get('tag') == 'mask')
            gt_dict = _extract_gt_fields(data['text_info'])
            
            image = Image.open(local_img_path).convert("RGB")
            messages = [{"role": "user", "content": [{"type": "image", "image": image}, {"type": "text", "text": "OCR:"}]}]
            
            inputs = processor.apply_chat_template(messages, add_generation_prompt=True, tokenize=True, return_dict=True, return_tensors="pt", images_kwargs={"size": {"shortest_edge": processor.image_processor.min_pixels, "longest_edge": MAX_PIXELS}}).to(device)
            
            with torch.no_grad():
                outputs = model.generate(**inputs, max_new_tokens=512, do_sample=False, repetition_penalty=1.05, use_cache=True)
            
            generated = outputs[0][inputs["input_ids"].shape[-1]:-1]
            pred = processor.decode(generated)
            ocr_raw = clean_ocr_text(pred)
            
            t0 = time.time()
            regex_pred = _regex_extract(ocr_raw)
            regex_spd = time.time() - t0
            
            t0 = time.time()
            llm_pred = _llm_extract(ocr_raw)
            llm_spd = time.time() - t0
            
            # RE+LLM Logic
            t0 = time.time()
            hybrid_pred = {}
            for k in FIELDS:
                if k == "사업자번호":
                    llm_val = llm_pred.get(k, "")
                    if re.match(r'^\d{3}-\d{2}-\d{5}$', llm_val):
                        hybrid_pred[k] = llm_val
                    else:
                        hybrid_pred[k] = regex_pred.get(k, "")
                else:
                    llm_val = llm_pred.get(k, "")
                    # 상호명, 날짜, 합계는 LLM을 우선으로 함. LLM이 비어있으면 정규식결과 사용
                    hybrid_pred[k] = llm_val if llm_val else regex_pred.get(k, "")
            hybrid_pred = post_process_dict(hybrid_pred)
            hybrid_spd = (time.time() - t0) + max(regex_spd, llm_spd) # 둘 다 끝난 뒤 판단하므로, 가장 오래 걸린시간 + 로직시간
            
            for m_name, pred_dict, spd in [("Regex", regex_pred, regex_spd), ("LLM", llm_pred, llm_spd), ("RE+LLM", hybrid_pred, hybrid_spd)]:
                metrics[m_name]["speed"] += spd
                metrics[m_name]["samples"] += 1
                for k in FIELDS:
                    gt = gt_dict.get(k, "")
                    pred = pred_dict.get(k, "")
                    
                    is_correct = 0.0
                    if not pred and not gt:
                        is_correct = 1.0
                    elif not pred or not gt:
                        is_correct = 0.0
                    elif k == "상호명":
                        pred_clean = pred.replace(" ", "")
                        gt_clean = gt.replace(" ", "")
                        if pred_clean in gt_clean or gt_clean in pred_clean:
                            is_correct = 1.0
                        else:
                            is_correct = 1.0 if pred == gt else 0.0
                    else:
                        is_correct = 1.0 if pred == gt else 0.0

                    metrics[m_name]["fields"][k]["not_null"] += 1.0 if str(pred).strip() else 0.0
                    metrics[m_name]["fields"][k]["acc"] += is_correct
                    metrics[m_name]["fields"][k]["f1"] += 1.0 if is_correct == 1.0 else _calc_f1(pred, gt)
            
            with open(md_output_path, 'a', encoding='utf-8') as md_f:
                md_f.write(f"## Sample {i+1}\n")
                md_f.write(f"**Image:** `{img_basename}`\n\n")
                md_f.write(f"**OCR Raw:**\n```text\n{ocr_raw}\n```\n\n")
                md_f.write("| Field | Ground Truth | Regex | LLM | RE+LLM |\n")
                md_f.write("|---|---|---|---|---|\n")
                for k in FIELDS:
                    gt = gt_dict.get(k, "").replace('\n', ' ')
                    rx = regex_pred.get(k, "").replace('\n', ' ')
                    llm = llm_pred.get(k, "").replace('\n', ' ')
                    hyb = hybrid_pred.get(k, "").replace('\n', ' ')
                    md_f.write(f"| {k} | `{gt}` | `{rx}` | `{llm}` | `{hyb}` |\n")
                md_f.write("\n---\n\n")
                        
            print(f"진행상황: {i+1}/{total_lines} 완료", flush=True)

        except Exception as e:
            print(f"Error processing line {i}: {e}")
            continue

    # Reporting
    for m_name in metrics:
        n = metrics[m_name]["samples"]
        if n == 0: continue
        print(f"\n{'='*75}")
        print(f"[{m_name}] 결과요약 (샘플 수: {n}, 건당 평균속도: {metrics[m_name]['speed']/n:.2f}s)")
        print(f"{'필드명':<10} | {'추출률(NotNull)':<15} | {'정확도(Acc)':<12} | {'F1-Score':<10}")
        print("-" * 75)
        
        avg_notnull = 0; avg_acc = 0; avg_f1 = 0
        for k in FIELDS:
            not_null = metrics[m_name]['fields'][k]['not_null'] / n
            acc = metrics[m_name]['fields'][k]['acc'] / n
            f1 = metrics[m_name]['fields'][k]['f1'] / n
            avg_notnull += not_null; avg_acc += acc; avg_f1 += f1
            print(f"{k:<10} | {not_null*100:>13.1f}% | {acc*100:>10.1f}% | {f1*100:>8.1f}%")
        
        print("-" * 75)
        print(f"{'전체평균':<10} | {avg_notnull/4*100:>13.1f}% | {avg_acc/4*100:>10.1f}% | {avg_f1/4*100:>8.1f}%")
    print("="*75)

if __name__ == "__main__":
    main()
