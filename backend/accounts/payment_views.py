from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Sum, Count
from .models import Payment, PlayerProfile
from .serializers import PaymentSerializer
from .permissions import IsAdmin
from datetime import date


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Payment.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        # ✅ Isolation par académie
        queryset = Payment.objects.filter(
            academy=self.request.user.academy
        ).select_related('player', 'player__group')

        month         = self.request.query_params.get('month')
        group_id      = self.request.query_params.get('group')
        subgroup_id   = self.request.query_params.get('subgroup')
        player_id     = self.request.query_params.get('player')
        method        = self.request.query_params.get('method')
        status_filter = self.request.query_params.get('status')

        if month:
            queryset = queryset.filter(month=month)
        if group_id:
            queryset = queryset.filter(player__group__id=group_id)
        if subgroup_id:
            queryset = queryset.filter(player__subgroup__id=subgroup_id)
        if player_id:
            queryset = queryset.filter(player__id=player_id)
        if method:
            queryset = queryset.filter(method=method)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Payment Validation Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # ✅ Tentative d'assigner l'académie
        # 1. Priorité à l'académie de l'admin/coach connecté
        user = self.request.user
        academy = getattr(user, 'academy', None)
        
        # 2. Si l'admin n'a pas d'académie, on prend celle du joueur
        if not academy:
            player = serializer.validated_data.get('player')
            if player and player.academy:
                academy = player.academy
        
        # 3. Si on est coach, on peut aussi l'avoir via le profil coach
        if not academy and hasattr(user, 'coach_profile'):
            academy = user.coach_profile.academy

        if not academy:
            print(f"DEBUG: No academy found for user {user.username} (ID: {user.id})")
            raise serializers.ValidationError({
                "academy": "No academy associated. Please link your account or the player to an academy."
            })

        serializer.save(academy=academy)

    # ✅ Stats du mois courant ou d'un mois donné
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        month       = request.query_params.get('month', date.today().strftime('%Y-%m'))
        group_id    = request.query_params.get('group')
        subgroup_id = request.query_params.get('subgroup')

        players_qs = PlayerProfile.objects.filter(academy=request.user.academy)
        if group_id:
            players_qs = players_qs.filter(group__id=group_id)
        if subgroup_id:
            players_qs = players_qs.filter(subgroup__id=subgroup_id)

        total_players = players_qs.count()

        payments_qs = Payment.objects.filter(academy=request.user.academy, month=month)
        if group_id:
            payments_qs = payments_qs.filter(player__group__id=group_id)
        if subgroup_id:
            payments_qs = payments_qs.filter(player__subgroup__id=subgroup_id)

        paid_player_ids = payments_qs.filter(
            status='Completed'
        ).values_list('player_id', flat=True)

        total_collected = payments_qs.filter(
            status='Completed'
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'month': month,
            'total_players': total_players,
            'paid_count': len(paid_player_ids),
            'unpaid_count': total_players - len(paid_player_ids),
            'total_collected': float(total_collected),
            'paid_player_ids': list(paid_player_ids),
        })

    # ✅ Liste des joueurs non payés pour un mois
    @action(detail=False, methods=['get'], url_path='unpaid-players')
    def unpaid_players(self, request):
        month       = request.query_params.get('month', date.today().strftime('%Y-%m'))
        group_id    = request.query_params.get('group')
        subgroup_id = request.query_params.get('subgroup')

        paid_ids = Payment.objects.filter(
            academy=request.user.academy,
            month=month,
            status='Completed'
        ).values_list('player_id', flat=True)

        unpaid_qs = PlayerProfile.objects.filter(
            academy=request.user.academy
        ).exclude(id__in=paid_ids)

        if group_id:
            unpaid_qs = unpaid_qs.filter(group__id=group_id)
        if subgroup_id:
            unpaid_qs = unpaid_qs.filter(subgroup__id=subgroup_id)

        from .serializers import PlayerProfileSerializer
        serializer = PlayerProfileSerializer(unpaid_qs, many=True)
        return Response(serializer.data)