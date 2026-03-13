import os
import mimetypes
import boto3
from io import BytesIO
from PIL import Image, ImageOps, ExifTags
from botocore.client import Config

# ——— 설정 ———
ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
SECRET_KEY = os.getenv("R2_SECRET_KEY")
ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
BUCKET    = os.getenv("R2_BUCKET")

def create_r2():
    r2 = boto3.client(
        's3',
        endpoint_url=f'https://{ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name='auto',
        config=Config(signature_version='s3v4'),
    )
    return r2

def fix_image_orientation(img):
    try:
        # ImageOps.exif_transpose handles most EXIF orientation issues automatically
        img = ImageOps.exif_transpose(img)
    except Exception as e:
        print(f"EXIF Orientation fix failed: {e}")
    return img

def upload_file_obj_to_r2(file_obj, object_key, content_type='application/octet-stream'):
    """
    메모리나 버퍼에 있는 파일 객체(또는 PIL Image)를 직접 R2에 업로드합니다.
    """
    r2 = create_r2()
    extra_args = {'ContentType': content_type}

    try:
        # 만약 이미 BytesIO 버퍼라면 그대로 업로드
        if hasattr(file_obj, 'seek') and not isinstance(file_obj, Image.Image):
            r2.upload_fileobj(file_obj, BUCKET, object_key, ExtraArgs=extra_args)
        else:
            # Image 객체이거나 다른 파일 객체인 경우 처리
            if isinstance(file_obj, Image.Image):
                img = file_obj
            else:
                img = Image.open(file_obj)
            
            img_format = img.format if img.format else 'JPEG'
            img = fix_image_orientation(img)
            
            buffer = BytesIO()
            img.save(buffer, format=img_format)
            buffer.seek(0)
            r2.upload_fileobj(buffer, BUCKET, object_key, ExtraArgs=extra_args)
            
        print(f"✅ Uploaded (Obj) → {BUCKET}/{object_key} (ContentType: {content_type})")
        return f"{object_key}"
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return None

def delete_file_from_r2(object_key):
    """
    R2에서 파일을 삭제합니다.
    """
    if not object_key:
        return False
        
    r2 = create_r2()
    # 만약 백슬래시가 포함되어 있다면 슬래시로 변경 (저장 시 replace('/', '\\') 처리가 되어 있는 경우 대비)
    object_key = object_key.replace('\\', '/')
    
    try:
        r2.delete_object(Bucket=BUCKET, Key=object_key)
        print(f"✅ Deleted → {BUCKET}/{object_key}")
        return True
    except Exception as e:
        print(f"❌ Deletion failed: {e}")
        return False
