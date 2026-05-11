from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Event, EventParticipant, PlayerProfile
from .serializers import EventSerializer, EventParticipantSerializer
from .permissions import IsAdmin


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    queryset = Event.objects.all()

    def get_queryset(self):
        user = self.request.user
        queryset = Event.objects.filter(
            academy=user.academy
        ).prefetch_related('participants__player', 'groups', 'subgroups', 'target_coaches', 'target_players')

        if user.role == 'admin':
            return queryset

        from django.db.models import Q

        if user.role == 'coach':
            profile = user.coach_profile
            queryset = queryset.filter(
                Q(target_coaches=profile) |
                Q(groups__assigned_coaches=profile) |
                Q(groups__full_access_coaches=profile) |
                Q(subgroups__assigned_coaches=profile) |
                Q(target_players__group__assigned_coaches=profile) |
                Q(target_players__group__full_access_coaches=profile) |
                Q(target_players__subgroup__assigned_coaches=profile)
            ).distinct()

        elif user.role == 'player':
            profile = user.player_profile
            queryset = queryset.filter(
                Q(target_players=profile) |
                Q(groups=profile.group) |
                Q(subgroups=profile.subgroup)
            ).distinct()

        # Optional filters
        event_type = self.request.query_params.get('type')
        status_filter = self.request.query_params.get('status')

        if event_type:
            queryset = queryset.filter(type=event_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        event = serializer.save(academy=self.request.user.academy)
        from .signals import send_event_notifications
        send_event_notifications(event)

    def perform_update(self, serializer):
        event = serializer.save()
        from .signals import send_event_notifications
        send_event_notifications(event)

    @action(detail=True, methods=['post'], url_path='add-participant')
    def add_participant(self, request, pk=None):
        event = self.get_object()
        player_id = request.data.get('player_id')
        if not player_id:
            return Response({'error': 'player_id is required'}, status=400)
        try:
            player = PlayerProfile.objects.get(id=player_id, academy=request.user.academy)
        except PlayerProfile.DoesNotExist:
            return Response({'error': 'Player not found'}, status=404)
        participant, created = EventParticipant.objects.get_or_create(
            event=event, player=player, defaults={'status': 'pending'}
        )
        if not created:
            return Response({'error': 'Player already added'}, status=400)
        return Response(EventParticipantSerializer(participant).data, status=201)

    @action(detail=True, methods=['patch'], url_path='participant/(?P<participant_id>[^/.]+)')
    def update_participant(self, request, pk=None, participant_id=None):
        event = self.get_object()
        try:
            participant = EventParticipant.objects.get(id=participant_id, event=event)
        except EventParticipant.DoesNotExist:
            return Response({'error': 'Participant not found'}, status=404)
        new_status = request.data.get('status')
        if new_status not in ['pending', 'accepted', 'rejected']:
            return Response({'error': 'Invalid status'}, status=400)
        participant.status = new_status
        participant.save()
        return Response(EventParticipantSerializer(participant).data)

    @action(detail=True, methods=['delete'], url_path='remove-participant/(?P<participant_id>[^/.]+)')
    def remove_participant(self, request, pk=None, participant_id=None):
        event = self.get_object()
        try:
            participant = EventParticipant.objects.get(id=participant_id, event=event)
            participant.delete()
            return Response({'message': 'Participant removed'}, status=204)
        except EventParticipant.DoesNotExist:
            return Response({'error': 'Participant not found'}, status=404)

    @action(detail=True, methods=['patch'], url_path='complete')
    def complete_event(self, request, pk=None):
        event = self.get_object()
        winner = request.data.get('winner', '')
        event.status = 'completed'
        event.winner = winner
        event.save()
        return Response(EventSerializer(event).data)