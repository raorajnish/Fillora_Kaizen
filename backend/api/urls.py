from django.urls import path
from . import views

urlpatterns = [
    path('social-login/', views.social_login, name='social_login'),
    path('analyze-page/', views.analyze_page, name='analyze_page'),
    path('analyze/', views.analyze_with_ai, name='analyze_with_ai'),
    path('fill-form/', views.fill_form, name='fill_form'),
    path('history/', views.history, name='history'),
    path('model/', views.model_settings, name='model_settings'),
    path('chat/', views.chat, name='chat'),
    path('profile/', views.profile, name='profile'),
]

