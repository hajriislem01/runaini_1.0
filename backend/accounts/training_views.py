from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from .models import TrainingSession
from .serializers import TrainingSessionSerializer, TrainingSessionListSerializer


class TrainingSessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return TrainingSessionListSerializer
        return TrainingSessionSerializer

    # ── Queryset filtré par académie + rôle ───────────────────────────────────
    def get_queryset(self):
        user     = self.request.user
        queryset = TrainingSession.objects.filter(
            academy=user.academy
        ).prefetch_related('groups', 'subgroups')

        # Coach → seulement ses séances
        if user.role == 'coach':
            try:
                queryset = queryset.filter(coach=user.coach_profile)
            except Exception:
                return TrainingSession.objects.none()

        # ── Filtres query params ──────────────────────────────────────────────
        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        category  = self.request.query_params.get('category')
        group_id  = self.request.query_params.get('group')
        player_id = self.request.query_params.get('player')

        if date_from:  queryset = queryset.filter(date__gte=date_from)
        if date_to:    queryset = queryset.filter(date__lte=date_to)
        if category:   queryset = queryset.filter(category__contains=category)
        if group_id:   queryset = queryset.filter(groups__id=group_id)

        # Séances contenant un exercice pour un joueur spécifique
        if player_id:
            # Filtrer les séances dont les exercises JSON contiennent ce player_id dans assigned_players
            all_sessions = queryset
            matching_ids = []
            pid_int = int(player_id)
            for session in all_sessions:
                for ex in (session.exercises or []):
                    try:
                        assigned = ex.get('assigned_players', [])
                        # Compatibility with old single assigned_to if any
                        if str(ex.get('assigned_to')) == str(player_id) or pid_int in assigned or str(player_id) in assigned:
                            matching_ids.append(session.id)
                            break
                    except Exception:
                        pass
            queryset = queryset.filter(id__in=matching_ids)

        return queryset

    # ── Création + assignation academy/coach ──────────────────────────────────
    def perform_create(self, serializer):
        user          = self.request.user
        coach_profile = None
        if user.role == 'coach':
            try:
                coach_profile = user.coach_profile
            except Exception:
                pass
        session = serializer.save(
            academy=user.academy,
            coach=coach_profile,
        )
        # Générer les séances récurrentes si nécessaire
        if session.recurrence != 'none' and session.recurrence_end:
            self._generate_recurring_sessions(session)

    def _generate_recurring_sessions(self, parent):
        """Crée les séances récurrentes à partir de la séance parente"""
        DAY_MAP = {
            'Mon':0,'Tue':1,'Wed':2,'Thu':3,'Fri':4,'Sat':5,'Sun':6
        }
        DELTA_MAP = {
            'weekly':   7,
            'biweekly': 14,
            'monthly':  30,
        }

        days = parent.recurrence_days  # ex: ["Tue","Thu"]
        delta_days = DELTA_MAP.get(parent.recurrence, 7)
        current = parent.date + timedelta(days=1)
        created = 0
        max_sessions = 100  # Sécurité

        while current <= parent.recurrence_end and created < max_sessions:
            day_name = current.strftime('%a')  # 'Mon','Tue'...
            if not days or day_name in days:
                TrainingSession.objects.create(
                    coach          = parent.coach,
                    academy        = parent.academy,
                    title          = parent.title,
                    description    = parent.description,
                    category       = parent.category,
                    level          = parent.level,
                    location       = parent.location,
                    date           = current,
                    start_time     = parent.start_time,
                    end_time       = parent.end_time,
                    exercises      = parent.exercises,
                    recurrence     = 'none',  # Les enfants ne récurrent pas
                    parent_session = parent,
                )
                created += 1

            # Avancer
            if days:
                current += timedelta(days=1)
            else:
                current += timedelta(days=delta_days)

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : Séances d'un joueur spécifique (exercices individuels)
    # GET /api/trainings/player-exercises/?player=<id>
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='player-exercises')
    def player_exercises(self, request):
        player_id = request.query_params.get('player')
        if not player_id:
            return Response({'error': 'player_id required'}, status=400)

        sessions = TrainingSession.objects.filter(
            academy=request.user.academy
        ).order_by('-date')

        result = []
        for session in sessions:
            individual = [
                ex for ex in (session.exercises or [])
                if str(ex.get('assigned_to')) == str(player_id) or (ex.get('assigned_players') and int(player_id) in [int(pid) for pid in ex.get('assigned_players', [])])
            ]
            if individual:
                result.append({
                    'session_id':    session.id,
                    'session_title': session.title,
                    'date':          str(session.date),
                    'start_time':    str(session.start_time),
                    'coach_name':    session.coach.user.get_full_name() if session.coach else '',
                    'exercises':     individual,
                })

        return Response(result)

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : Résumé pour le dashboard coach
    # GET /api/trainings/summary/
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        user = request.user
        qs   = self.get_queryset()
        today = date.today()

        upcoming  = qs.filter(date__gte=today).count()
        this_week = qs.filter(
            date__gte=today,
            date__lte=today + timedelta(days=7)
        )

        return Response({
            'total':          qs.count(),
            'upcoming':       upcoming,
            'this_week':      TrainingSessionListSerializer(
                this_week, many=True, context={'request': request}
            ).data,
            'past':           qs.filter(date__lt=today).count(),
        })

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : Bibliothèque d'exercices du coach
    # GET /api/trainings/exercise-library/
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='exercise-library')
    def exercise_library(self, request):
        """Récupère tous les exercices uniques créés par ce coach"""
        user = request.user
        qs   = self.get_queryset()

        seen_names = set()
        library    = []

        for session in qs:
            for ex in (session.exercises or []):
                name = ex.get('name', '').strip()
                if name and name not in seen_names:
                    seen_names.add(name)
                    library.append({
                        'name':         name,
                        'category':     ex.get('category', 'technical'),
                        'duration':     ex.get('duration', 15),
                        'sets':         ex.get('sets', 3),
                        'reps':         ex.get('reps', 10),
                        'intensity':    ex.get('intensity', 'medium'),
                        'instructions': ex.get('instructions', ''),
                    })

        return Response(library)