from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from .models import PlayerReport, PlayerProfile
from .serializers import PlayerReportSerializer


class PlayerReportViewSet(viewsets.ModelViewSet):
    serializer_class   = PlayerReportSerializer
    permission_classes = [IsAuthenticated]

    # ── Queryset filtré par académie + rôle ───────────────────────────────────
    def get_queryset(self):
        user     = self.request.user
        queryset = PlayerReport.objects.filter(
            academy=user.academy
        ).select_related(
            'player', 'player__group', 'coach__user'
        )

        # Coach → seulement ses joueurs
        if user.role == 'coach':
            try:
                queryset = queryset.filter(coach=user.coach_profile)
            except Exception:
                return PlayerReport.objects.none()

        # ── Filtres query params ──────────────────────────────────────────────
        player_id = self.request.query_params.get('player')
        month     = self.request.query_params.get('month')
        group_id  = self.request.query_params.get('group')

        if player_id: queryset = queryset.filter(player__id=player_id)
        if month:     queryset = queryset.filter(month=month)
        if group_id:  queryset = queryset.filter(player__group__id=group_id)

        return queryset

    # ── Création — assigne academy + coach automatiquement ────────────────────
    def perform_create(self, serializer):
        user         = self.request.user
        coach_profile= None
        if user.role == 'coach':
            try:
                coach_profile = user.coach_profile
            except Exception:
                pass
        serializer.save(
            academy=user.academy,
            coach=coach_profile,
        )

    # ── PUT / PATCH — recalcul automatique ────────────────────────────────────
    def perform_update(self, serializer):
        serializer.save()

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : KPI Analysis — données pour les graphes CoachAnalysis
    # GET /api/reports/kpi-analysis/?player=<id>&months=6
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='kpi-analysis')
    def kpi_analysis(self, request):
        player_id = request.query_params.get('player')
        months    = int(request.query_params.get('months', 6))

        if not player_id:
            return Response({'error': 'player_id required'}, status=400)

        # Vérifier accès
        try:
            player = PlayerProfile.objects.get(
                id=player_id,
                academy=request.user.academy
            )
        except PlayerProfile.DoesNotExist:
            return Response({'error': 'Player not found'}, status=404)

        # Derniers N rapports du joueur
        reports = (
            PlayerReport.objects
            .filter(player=player)
            .order_by('-month')[:months]
        )
        reports_list = list(reversed(reports))

        if not reports_list:
            return Response({'reports': [], 'group_avg': []})

        # Moyenne du groupe pour les mêmes mois
        months_list = [r.month for r in reports_list]
        group_reports = (
            PlayerReport.objects
            .filter(
                academy=request.user.academy,
                player__group=player.group,
                month__in=months_list
            )
            .values('month')
            .annotate(
                avg_technical=Avg('technical_avg'),
                avg_tactical=Avg('tactical_avg'),
                avg_physical=Avg('physical_avg'),
                avg_mental=Avg('mental_avg'),
                avg_overall=Avg('overall_score'),
            )
            .order_by('month')
        )

        serialized_reports = PlayerReportSerializer(
            reports_list,
            many=True,
            context={'request': request}
        ).data

        return Response({
            'player': {
                'id':       player.id,
                'name':     player.full_name,
                'position': player.position,
                'group':    player.group.name if player.group else '—',
            },
            'reports':   serialized_reports,
            'group_avg': list(group_reports),
        })

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : Summary mensuel — vue rapide pour CoachDashboard
    # GET /api/reports/monthly-summary/?month=2026-03
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='monthly-summary')
    def monthly_summary(self, request):
        month = request.query_params.get('month')
        if not month:
            return Response({'error': 'month required'}, status=400)

        user     = request.user
        queryset = PlayerReport.objects.filter(
            academy=user.academy,
            month=month
        )
        if user.role == 'coach':
            try:
                queryset = queryset.filter(coach=user.coach_profile)
            except Exception:
                return Response({'evaluated': 0, 'avg_overall': 0, 'alerts': []})

        stats = queryset.aggregate(
            count=Count('id'),
            avg_overall=Avg('overall_score'),
            avg_technical=Avg('technical_avg'),
            avg_tactical=Avg('tactical_avg'),
            avg_physical=Avg('physical_avg'),
            avg_mental=Avg('mental_avg'),
        )

        # Alertes automatiques
        alerts = []
        low_scores = queryset.filter(overall_score__lt=6.0)
        for r in low_scores:
            alerts.append({
                'type':   'danger',
                'player': r.player.full_name,
                'msg':    f"Overall score {r.overall_score}/10 — needs attention",
            })
        injured = queryset.filter(is_injured=True)
        for r in injured:
            alerts.append({
                'type':   'danger',
                'player': r.player.full_name,
                'msg':    "Currently injured",
            })
        low_school = queryset.filter(
            school_grade_avg__isnull=False,
            school_grade_avg__lt=10
        )
        for r in low_school:
            alerts.append({
                'type':   'warning',
                'player': r.player.full_name,
                'msg':    f"School grade {r.school_grade_avg}/20",
            })

        return Response({
            'month':         month,
            'evaluated':     stats['count'] or 0,
            'avg_overall':   round(stats['avg_overall'] or 0, 1),
            'avg_technical': round(stats['avg_technical'] or 0, 1),
            'avg_tactical':  round(stats['avg_tactical'] or 0, 1),
            'avg_physical':  round(stats['avg_physical'] or 0, 1),
            'avg_mental':    round(stats['avg_mental'] or 0, 1),
            'alerts':        alerts[:10],
        })

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : Player history — tous les rapports d'un joueur
    # GET /api/reports/player-history/?player=<id>
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='player-history')
    def player_history(self, request):
        player_id = request.query_params.get('player')
        if not player_id:
            return Response({'error': 'player_id required'}, status=400)

        reports = (
            PlayerReport.objects
            .filter(player__id=player_id, academy=request.user.academy)
            .order_by('month')
        )
        serialized = PlayerReportSerializer(
            reports, many=True, context={'request': request}
        ).data
        return Response(serialized)