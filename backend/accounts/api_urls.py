# api_urls.py
from rest_framework.routers import DefaultRouter
from .views import CoachViewSet , PlayerViewSet , GroupViewSet , SubGroupViewSet
router = DefaultRouter()
router.register(r'coaches', CoachViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'subgroups', SubGroupViewSet)

urlpatterns = router.urls
