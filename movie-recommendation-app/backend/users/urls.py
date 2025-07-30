from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('refresh/', views.refresh_token, name='refresh_token'),
    path('change-password/', views.change_password, name='change_password'),
    
    # Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('stats/', views.user_stats, name='user_stats'),
] 