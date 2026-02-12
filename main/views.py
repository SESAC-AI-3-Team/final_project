from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from .utils.upload import upload_to_r2

# Create your views here.

def login_view(request):
    return render(request, 'react_index.html')

def login_cancelled_view(request):
    return render(request, 'react_index.html')

def main_view(request):
    return render(request, 'react_index.html')

def mypage_view(request):
    return render(request, 'react_index.html')

def meeting_detail_view(request, meeting_id):
    return render(request, 'react_index.html')

def meeting_board_view(request, meeting_id):
    return render(request, 'react_index.html')

def meeting_ocr_view(request, meeting_id):
    return render(request, 'react_index.html')

def meeting_schedule_view(request, meeting_id):
    return render(request, 'react_index.html')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def ocr_upload_view(request, meeting_id):
    if request.method == 'POST':
        try:
            if 'image' not in request.FILES:
                return JsonResponse({'error': 'No image file provided'}, status=400)
            
            image_file = request.FILES['image']
            
            # 임시 파일 저장 디렉토리 확인
            import os
            from django.conf import settings
            import time
            
            temp_dir = os.path.join(settings.BASE_DIR, 'temp')
            if not os.path.exists(temp_dir):
                os.makedirs(temp_dir)
                
            # 파일명 생성 및 저장
            filename = f"ocr_{meeting_id}_{int(time.time())}_{image_file.name}"
            temp_path = os.path.join(temp_dir, filename)
            
            with open(temp_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)
            
            print(f"Uploading file to R2: {temp_path}")
            
            # R2 업로드 수행
            upload_to_r2(temp_path)
            
            # (선택사항) 업로드 후 임시 파일 삭제
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return JsonResponse({
                'message': 'Upload successful',
                'filename': filename,
            })
            
        except Exception as e:
            print(f"Error during upload: {e}")
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)
