from django.urls import path, include
from .views import (
    AdminSignupView, LoginView, CoachSignupView,
    PlayerSignupView, AcademyView
)
from django.conf.urls.static import static
from django.conf import settings
urlpatterns = [
    path('signup/', AdminSignupView.as_view(), name='admin-signup'),
    path('signup/coach/', CoachSignupView.as_view(), name='coach-signup'),
    path('players/signup/', PlayerSignupView.as_view(), name='player-signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('academy/', AcademyView.as_view(), name='academy'),  # ✅ nouveau
    path('', include('accounts.api_urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)