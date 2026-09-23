from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from .views import (
    AdminSignupView, LoginView, CoachSignupView,
    PlayerSignupView, AcademyView , AcademyDirectoryView , CoachProfileView , PlayerViewSet
)
from .lead_views import AcademyLeadCreateView
from .superadmin_views import (
    SuperAdminLeadListView,
    SuperAdminApproveLeadView,
    SuperAdminLeadRejectView,
    SuperAdminLeadArchiveView,
    SuperAdminAcademyListView,
    SuperAdminAcademyDetailView,
    SuperAdminAcademyManualCreateView,
    SuperAdminStatsView,
)

urlpatterns = [
    path('leads/academy-request/', AcademyLeadCreateView.as_view(), name='academy-lead-create'),
    path('super-admin/leads/', SuperAdminLeadListView.as_view(), name='super-admin-leads'),
    path('super-admin/leads/<int:pk>/approve/', SuperAdminApproveLeadView.as_view(), name='super-admin-approve-lead'),
    path('super-admin/leads/<int:pk>/reject/', SuperAdminLeadRejectView.as_view(), name='super-admin-reject-lead'),
    path('super-admin/leads/<int:pk>/archive/', SuperAdminLeadArchiveView.as_view(), name='super-admin-archive-lead'),
    path('super-admin/academies/', SuperAdminAcademyListView.as_view(), name='super-admin-academies'),
    path('super-admin/academies/create/', SuperAdminAcademyManualCreateView.as_view(), name='super-admin-academy-create'),
    path('super-admin/academies/<int:pk>/', SuperAdminAcademyDetailView.as_view(), name='super-admin-academy-detail'),
    path('super-admin/stats/', SuperAdminStatsView.as_view(), name='super-admin-stats'),
    path('signup/', AdminSignupView.as_view(), name='admin-signup'),
    path('signup/coach/', CoachSignupView.as_view(), name='coach-signup'),
    path('players/signup/', PlayerSignupView.as_view(), name='player-signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('academy/', AcademyView.as_view(), name='academy'),
    path('academies/', AcademyDirectoryView.as_view(), name='academy-directory'),
    path('coachprofile/', CoachProfileView.as_view(), name='coach-profile'),
    
    path('attendance/coach/players/', __import__('accounts.attendance_views', fromlist=['']).get_coach_attendance_players, name='attendance-coach-players'),
    path('attendance/coach/mark/', __import__('accounts.attendance_views', fromlist=['']).mark_attendance, name='attendance-coach-mark'),
    path('attendance/admin/report/', __import__('accounts.attendance_views', fromlist=['']).get_admin_attendance_report, name='attendance-admin-report'),
    path('attendance/player/my/', __import__('accounts.attendance_views', fromlist=['']).get_player_my_attendance, name='attendance-player-my'),

    path('', include('accounts.api_urls')),  # ✅ toujours en dernier
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)