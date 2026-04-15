from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ExerciseTemplate
from .serializers import ExerciseTemplateSerializer


class ExerciseTemplateViewSet(viewsets.ModelViewSet):
    serializer_class   = ExerciseTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Retourne :
        - Tous les exercices par défaut (is_default=True)
        - Les exercices créés par ce coach (is_default=False)
        """
        user = self.request.user
        try:
            coach = user.coach_profile
        except Exception:
            coach = None

        from django.db.models import Q
        queryset = ExerciseTemplate.objects.filter(
            Q(is_default=True) |
            Q(coach=coach, is_default=False)
        )

        # ── Filtres ───────────────────────────────────────────────────────────
        category  = self.request.query_params.get('category')
        intensity = self.request.query_params.get('intensity')
        search    = self.request.query_params.get('search')
        mine_only = self.request.query_params.get('mine')

        if category:   queryset = queryset.filter(category=category)
        if intensity:  queryset = queryset.filter(intensity=intensity)
        if mine_only:  queryset = queryset.filter(is_default=False, coach=coach)
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset.order_by('category', 'name')

    def perform_create(self, serializer):
        """Le coach crée un nouvel exercice — sauvegardé dans sa bibliothèque"""
        user = self.request.user
        try:
            coach = user.coach_profile
        except Exception:
            coach = None
        serializer.save(
            is_default=False,
            coach=coach,
            academy=getattr(user, 'academy', None),
        )

    def destroy(self, request, *args, **kwargs):
        """Un coach ne peut supprimer que ses propres exercices"""
        instance = self.get_object()
        if instance.is_default:
            return Response(
                {'error': 'Cannot delete default exercises.'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            if instance.coach != request.user.coach_profile:
                return Response(
                    {'error': 'You can only delete your own exercises.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Exception:
            pass
        return super().destroy(request, *args, **kwargs)

    # ─────────────────────────────────────────────────────────────────────────
    # ACTION : Bibliothèque groupée par catégorie (pour le frontend)
    # GET /api/exercises/grouped/
    # ─────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='grouped')
    def grouped(self, request):
        queryset = self.get_queryset()
        serialized = ExerciseTemplateSerializer(
            queryset, many=True, context={'request': request}
        ).data

        categories = [
            'technical', 'tactical', 'physical',
            'mental', 'match_prep', 'recovery'
        ]
        grouped = {}
        for cat in categories:
            grouped[cat] = [ex for ex in serialized if ex['category'] == cat]

        return Response(grouped)