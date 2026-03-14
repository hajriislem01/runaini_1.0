# views.py — fichier central qui regroupe tous les imports
from .auth_views import AdminSignupView, LoginView, CoachSignupView, PlayerSignupView
from .coach_views import CoachViewSet
from .player_views import PlayerViewSet
from .group_views import GroupViewSet, SubGroupViewSet
from .academy_views import AcademyView 