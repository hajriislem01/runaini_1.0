from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import PlayerProfile
from .serializers import PlayerProfileSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    serializer_class = PlayerProfileSerializer
    permission_classes = [IsAuthenticated]
    queryset = PlayerProfile.objects.all()

    def get_queryset(self):
        user = self.request.user
        queryset = PlayerProfile.objects.filter(
            academy=user.academy
        )
        # ✅ Coach voit seulement les joueurs de ses groupes
        if user.role == 'coach':
            try:
                queryset = queryset.filter(
                    group__coach=user.coach_profile
                )
            except Exception:
                return PlayerProfile.objects.none()

        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group__id=group_id)
        return queryset