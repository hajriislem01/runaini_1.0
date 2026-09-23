from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from .models import PlayerReport, PlayerProfile, PlayerAttendance
from .serializers import PlayerReportSerializer
from .ai_report_service import generate_report_texts, AIReportError


def _attendance_for_month(player, month):
    """Real attendance count for a player during a given 'YYYY-MM' month — the single source of truth."""
    try:
        year, mon = (int(x) for x in month.split('-')[:2])
    except (ValueError, AttributeError):
        return 0, 0
    qs = PlayerAttendance.objects.filter(player=player, date__year=year, date__month=mon)
    total = qs.count()
    present = qs.filter(status='Present').count()
    return present, total


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
        player  = serializer.validated_data.get('player')
        month   = serializer.validated_data.get('month')
        present, total = _attendance_for_month(player, month)
        serializer.save(
            academy=user.academy,
            coach=coach_profile,
            attendance_present=present,
            attendance_total=total,
        )

    # ── PUT / PATCH — recalcul automatique ────────────────────────────────────
    def perform_update(self, serializer):
        player = serializer.instance.player
        month  = serializer.validated_data.get('month', serializer.instance.month)
        present, total = _attendance_for_month(player, month)
        serializer.save(attendance_present=present, attendance_total=total)

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : Attendance stats — pour pré-remplir automatiquement l'évaluation
    # GET /api/reports/attendance-stats/?player=<id>&month=2026-03
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='attendance-stats')
    def attendance_stats(self, request):
        player_id = request.query_params.get('player')
        month     = request.query_params.get('month')
        if not player_id or not month:
            return Response({'error': 'player and month are required'}, status=400)

        try:
            player = PlayerProfile.objects.get(id=player_id, academy=request.user.academy)
        except PlayerProfile.DoesNotExist:
            return Response({'error': 'Player not found'}, status=404)

        present, total = _attendance_for_month(player, month)
        return Response({'attendance_present': present, 'attendance_total': total})

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : Génération IA des textes (points forts / à améliorer / objectif)
    # POST /api/reports/generate-report-texts/
    # Body: scores + contexte saisis dans le modal d'évaluation (pas encore
    # sauvegardés) — la clé Gemini reste côté serveur.
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='generate-report-texts')
    def generate_report_texts_action(self, request):
        data      = request.data
        player_id = data.get('player')
        month     = data.get('month')
        if not player_id or not month:
            return Response({'error': 'player and month are required'}, status=400)

        try:
            player = PlayerProfile.objects.get(id=player_id, academy=request.user.academy)
        except PlayerProfile.DoesNotExist:
            return Response({'error': 'Player not found'}, status=404)

        scores_piliers = {
            'technical': data.get('technical_avg'),
            'tactical':  data.get('tactical_avg'),
            'physical':  data.get('physical_avg'),
            'mental':    data.get('mental_avg'),
        }
        valid_avgs = [float(v) for v in scores_piliers.values() if v]
        score_global = round(sum(valid_avgs) / len(valid_avgs), 1) if valid_avgs else 0

        player_data = {
            'nom':     player.full_name,
            'poste':   player.position,
            'periode': month,
            'score_global': score_global,
            'scores_piliers': scores_piliers,
            'sous_scores': {
                'technical': data.get('technical_scores', {}),
                'tactical':  data.get('tactical_scores', {}),
                'physical':  data.get('physical_scores', {}),
                'mental':    data.get('mental_scores', {}),
            },
            'contexte': {
                'fatigue':                data.get('fatigue_level'),
                'sommeil':                data.get('sleep_quality'),
                'blessure':               bool(data.get('is_injured')),
                'note_ecole_sur_20':      data.get('school_grade_avg'),
                'assiduite_ecole_pct':    data.get('school_attendance'),
                'comportement_ecole_sur_10': data.get('school_behaviour'),
                'presence_entrainement':  f"{data.get('attendance_present', 0)}/{data.get('attendance_total', 0)}",
            },
        }

        try:
            texts = generate_report_texts(player_data)
        except AIReportError as exc:
            return Response({'error': str(exc)}, status=502)

        return Response(texts)

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