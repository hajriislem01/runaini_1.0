from rest_framework.routers import DefaultRouter
from .views import CoachViewSet, PlayerViewSet, GroupViewSet, SubGroupViewSet , EventViewSet , PaymentViewSet

router = DefaultRouter()
router.register(r'coaches', CoachViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'subgroups', SubGroupViewSet)
router.register(r'events', EventViewSet)
router.register(r'payments', PaymentViewSet)
urlpatterns = router.urls