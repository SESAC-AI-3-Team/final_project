from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate

# Create your views here.

def login_view(request):
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

