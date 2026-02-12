from django.urls import path, re_path, include
from . import views

urlpatterns = [
    # 1. 구체적인 주소들을 위에 배치
    path('', views.login_view, name='login'),
    path('accounts/', include('allauth.urls')),
    path('main/', views.main_view, name='main'),
    path('mypage/', views.mypage_view, name='mypage'),
    path('meeting/<int:meeting_id>/detail/', views.meeting_detail_view, name='meeting_detail'),
    path('meeting/<int:meeting_id>/board/', views.meeting_board_view, name='meeting_board'),
    path('meeting/<int:meeting_id>/ocr/', views.meeting_ocr_view, name='meeting_ocr'),
    path('api/meeting/<int:meeting_id>/schedule/', views.meeting_schedule_view, name='meeting_schedule'),
    path('api/meeting/<int:meeting_id>/ocr/upload/', views.ocr_upload_view, name='ocr_upload'),
    path('accounts/3rdparty/login/cancelled/', views.login_cancelled_view, name='login_cancelled'),
    path('accounts/login/', views.login_view, name='login'),
    # 2. 마지막에 Catch-all (리액트 라우팅용)
    # 위에서 안 걸러진 모든 주소(예: 리액트 내부 경로)는 main_view로 보냄
    re_path(r'^.*$', views.main_view), 
]