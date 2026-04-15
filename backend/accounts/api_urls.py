from rest_framework.routers import DefaultRouter

# ✅ Importer PlayerViewSet depuis player_views (pas views)
from .views import CoachViewSet, GroupViewSet, SubGroupViewSet, EventViewSet, PaymentViewSet
from .player_views import PlayerViewSet                    # ← le bon avec me() et context
from .player_report_views import PlayerReportViewSet
from .training_views import TrainingSessionViewSet
from .exercise_template_views import ExerciseTemplateViewSet

router = DefaultRouter()
router.register(r'coaches',   CoachViewSet,           basename='coaches')
router.register(r'players',   PlayerViewSet,          basename='players')  # ← le bon
router.register(r'groups',    GroupViewSet,           basename='groups')
router.register(r'subgroups', SubGroupViewSet,        basename='subgroups')
router.register(r'events',    EventViewSet,           basename='events')
router.register(r'payments',  PaymentViewSet,         basename='payments')
router.register(r'reports',   PlayerReportViewSet,    basename='reports')
router.register(r'trainings', TrainingSessionViewSet, basename='trainings')
router.register(r'exercises', ExerciseTemplateViewSet,basename='exercises')

urlpatterns = router.urls