"""
ocr_service.py — Django용 PaddleOCR-VL 서비스 모듈
====================================================
서버 시작 시 load_ocr_model()을 1회 호출하여 모델을 메모리에 올려두고,
요청마다 run_ocr()을 통해 빠르게 추론합니다.
"""

import os
import sys
import re
import glob
import shutil
import json
import requests
from PIL import Image, ImageOps


# ============================================================
# ★ 경로 설정 (ocr/start.py 와 동일)
# ============================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OCR_DIR  = os.path.join(BASE_DIR, 'ocr')

MODEL_PATH      = os.path.join(OCR_DIR, 'PaddleOCR-VL-SFT-recipt')
# BASE_MODEL_PATH = os.path.join(OCR_DIR, 'PaddleOCR-VL-1.5')
FT_WEIGHTS      = os.path.join(MODEL_PATH, "model-00001-of-00001.safetensors")
MAX_PIXELS      = 1280 * 28 * 28
FIELDS          = ["상호명", "사업자번호", "날짜", "합계"]

# DEVICE는 torch 로드 이후에 결정 (lazy)
_DEVICE = None

def _get_device():
    """torch를 lazy import 후 device 반환"""
    global _DEVICE
    if _DEVICE is None:
        import torch
        _DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    return _DEVICE

# 전역 모델 상태 (서버 수명 동안 유지)
_processor = None
_model     = None
_is_loaded = False


# ============================================================
# [1] 모델 로드 (AppConfig.ready() 에서 1회 호출)
# ============================================================
def load_ocr_model():
    """서버 시작 시 1회 호출 — 전역 모델 초기화"""
    global _processor, _model, _is_loaded

    if _is_loaded:
        print("[OCR] 이미 로드되었습니다. 스킵.")
        return

    try:
        import torch
        from transformers import AutoProcessor, AutoModel
        from safetensors.torch import load_file

        device = _get_device()

        print("📦 [OCR] 모델 로딩 중...")
        _processor = AutoProcessor.from_pretrained(
            "PaddlePaddle/PaddleOCR-VL-1.5",
            trust_remote_code=True,
        )
        _model = AutoModel.from_pretrained(
            "PaddlePaddle/PaddleOCR-VL-1.5",
            torch_dtype=torch.bfloat16 if device == "cuda" else torch.float32,
            trust_remote_code=True,
        ).to(device).eval()

        # 파인튜닝 가중치 적용
        if load_file(FT_WEIGHTS):
            ft = load_file(FT_WEIGHTS)
            _model.load_state_dict(ft, strict=False)
            print(f"✅ [OCR] 파인튜닝 가중치 로드: {os.path.basename(FT_WEIGHTS)}")
        else:
            print(f"⚠️  [OCR] 파인튜닝 가중치 없음 ({FT_WEIGHTS}) — 베이스 모델로 실행")

        _is_loaded = True
        print(f"✅ [OCR] 모델 로드 완료 (device={device})\n")

    except Exception as e:
        print(f"❌ [OCR] 모델 로드 실패: {e}")
        # 서버 시작 실패를 막기 위해 예외를 올리지 않고 로그만 남김


# ============================================================
# [2] OCR 추론
# ============================================================
def _extract_ocr_text(image: Image.Image) -> str:
    """PIL Image → OCR 원문 텍스트"""
    messages = [{
        "role": "user",
        "content": [
            {"type": "image", "image": image},
            {"type": "text",  "text":  "OCR:"},
        ],
    }]
    device = _get_device()
    inputs = _processor.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt",
        images_kwargs={
            "size": {
                "shortest_edge": _processor.image_processor.min_pixels,
                "longest_edge": MAX_PIXELS,
            }
        },
    ).to(device)

    import torch
    with torch.no_grad():
        outputs = _model.generate(
            **inputs,
            max_new_tokens=512,
            do_sample=False,
            repetition_penalty=1.05,
            use_cache=True,
        )

    generated = outputs[0][inputs["input_ids"].shape[-1]:-1]
    raw = _processor.decode(generated)
    # LOC 토큰 제거
    raw = re.sub(r'<\|LOC_\d+\|>', '', raw)
    raw = re.sub(r'<\|[A-Z_]+\|>', '', raw)
    return raw.strip()


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
        total_str = res["합계"].strip()
        m = re.match(r'^([\d,]+)', total_str)
        if m:
            total = m.group(1).replace(',', '')
            res["합계"] = total
        else:
            res["합계"] = re.sub(r'[^\d]', '', total_str)
            
    return res

def _pure_regex_extract(ocr: str) -> dict:
    """한국 영수증 정규식 필드 추출 (ocr/start.py 의 regex_extract 동일)"""
    lines = [l.strip() for l in ocr.split('\n') if l.strip()]

    # ─ 사업자번호 ─
    biz_match = re.search(r'\b(\d{3}[-–]\d{2}[-–]\d{5}|\d{10})\b', ocr)
    biz_no = biz_match.group(1) if biz_match else ""

    # ─ 날짜 ─
    date_match = re.search(
        r'(?:'
        r'(20\d{2})[./년]\s*(\d{1,2})[./월]\s*(\d{1,2})'
        r'|(\d{2})[./년-]\s*(\d{1,2})[./월-]\s*(\d{1,2})'
        r')',
        ocr
    )
    if date_match:
        g = date_match.groups()
        if g[0]:
            date = f"{g[0]}-{int(g[1]):02d}-{int(g[2]):02d}"
        else:
            yr = int(g[3])
            date = f"20{yr:02d}-{int(g[4]):02d}-{int(g[5]):02d}"
    else:
        date = ""

    # ─ 합계 ─
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
        if amounts:
            total = max(amounts, key=lambda x: int(x))

    # ─ 상호명 ─
    store_match = re.search(r'(?:상\s*호|가맹점명|상호명)\s*[:\s]+([^\n]+)', ocr)
    if store_match:
        store = store_match.group(1).strip().split()[0]
    else:
        if biz_no:
            for i, line in enumerate(lines):
                if biz_no.replace('-', '') in line.replace('-', ''):
                    before = line[:line.replace('-', '').find(
                        biz_no.replace('-', ''))].strip()
                    if before and len(before) > 1:
                        store = before
                    elif i > 0:
                        store = lines[i - 1]
                    else:
                        store = lines[0] if lines else ""
                    break
            else:
                store = lines[0] if lines else ""
        else:
            store = lines[0] if lines else ""

    store = re.sub(r'^["\'\s\"]+|["\'\s\"]+$', '', store)

    return {
        "상호명":    store,
        "사업자번호": biz_no,
        "날짜":      date,
        "합계":      total,
    }

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
    ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip('/')
    try:
        res = requests.post(f"{ollama_base_url}/api/generate", json={
            "model": "llama3.2",
            "prompt": prompt,
            "format": "json",
            "stream": False
        }, timeout=30)
        if res.status_code == 200:
            content = res.json().get('response', '{}')
            parsed = json.loads(content)
            print(parsed)
            return post_process_dict({k: str(parsed.get(k, "")) for k in FIELDS})
        else:
            print(res.status_code)
    except Exception as e:
        print(f"Ollama error: {e}")
    return post_process_dict({k: "" for k in FIELDS})

def _regex_extract(ocr: str) -> dict:
    regex_pred = _pure_regex_extract(ocr)
    llm_pred = _llm_extract(ocr)
    
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
            hybrid_pred[k] = llm_val if llm_val else regex_pred.get(k, "")
            
    return post_process_dict(hybrid_pred)


# ============================================================
# [3] 외부에서 호출하는 메인 함수
# ============================================================
def is_model_ready() -> bool:
    """모델이 로드되었는지 확인"""
    return _is_loaded


def run_ocr(image: Image.Image) -> dict:
    """
    PIL Image 를 받아 OCR 결과 dict 를 반환합니다.

    Returns:
        {
            'success': bool,
            '상호명': str,
            '사업자번호': str,
            '날짜': str,      # YYYY-MM-DD
            '합계': str,      # 숫자만
            'ocr_raw': str,   # OCR 원문
            'error': str,     # 실패 시
        }
    """
    if not _is_loaded:
        return {
            'success': False,
            'error': 'OCR 모델이 아직 로드되지 않았습니다. 잠시 후 다시 시도하세요.',
        }

    try:
        ocr_text = _extract_ocr_text(image)
        print(ocr_text)
        fields   = _regex_extract(ocr_text)
        return {
            'success': True,
            'ocr_raw': ocr_text,
            **fields,
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'OCR 처리 중 오류: {str(e)}',
        }