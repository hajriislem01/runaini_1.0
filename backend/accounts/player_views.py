from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import PlayerProfile
from .serializers import PlayerProfileSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = PlayerProfile.objects.all()
    serializer_class = PlayerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group__id=group_id)
        return queryset