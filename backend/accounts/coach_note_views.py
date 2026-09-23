from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import CoachNote
from .serializers import CoachNoteSerializer
from .permissions import IsCoach


class CoachNoteViewSet(viewsets.ModelViewSet):
    """Private notes a coach jots down for themself in the KPI Advanced workspace."""

    serializer_class   = CoachNoteSerializer
    permission_classes = [IsAuthenticated, IsCoach]

    def get_queryset(self):
        user = self.request.user
        queryset = CoachNote.objects.filter(
            coach=user.coach_profile,
            academy=user.academy,
        )
        player_id = self.request.query_params.get('player')
        if player_id:
            queryset = queryset.filter(player_id=player_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(coach=user.coach_profile, academy=user.academy)
