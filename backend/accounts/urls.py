from django.urls import path, include
from .views import (
    AdminSignupView, LoginView, CoachSignupView,
    PlayerSignupView, AcademyView , AcademyDirectoryView , CoachProfileView
)

urlpatterns = [
    path('signup/', AdminSignupView.as_view(), name='admin-signup'),
    path('signup/coach/', CoachSignupView.as_view(), name='coach-signup'),
    path('players/signup/', PlayerSignupView.as_view(), name='player-signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('academy/', AcademyView.as_view(), name='academy'),
    path('academies/', AcademyDirectoryView.as_view(), name='academy-directory'),
    path('coachprofile/', CoachProfileView.as_view(), name='coach-profile'),
    path('', include('accounts.api_urls')),  # ✅ toujours en dernier
]
