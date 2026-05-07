from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import PlayerProfile
from .serializers import PlayerProfileSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    serializer_class   = PlayerProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user     = self.request.user
        queryset = PlayerProfile.objects.filter(academy=user.academy)

        if user.role == 'coach':
            try:
                profile = user.coach_profile
                # Players where:
                # 1. Coach has full access to the group
                # 2. Coach is assigned to the specific subgroup
                # 3. Coach is assigned to the group AND player has no subgroup
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(group__full_access_coaches=profile) |
                    Q(subgroup__assigned_coaches=profile) |
                    (Q(group__assigned_coaches=profile) & Q(subgroup__isnull=True))
                ).distinct()
            except Exception:
                return PlayerProfile.objects.none()

        group_ids = self.request.query_params.getlist('group_id') or self.request.query_params.getlist('group')
        subgroup_ids = self.request.query_params.getlist('subgroup_id') or self.request.query_params.getlist('subgroup')

        # Parse comma-separated lists if they were passed as a single string
        if len(group_ids) == 1 and ',' in group_ids[0]:
            group_ids = group_ids[0].split(',')
        if len(subgroup_ids) == 1 and ',' in subgroup_ids[0]:
            subgroup_ids = subgroup_ids[0].split(',')

        # Filter out invalid string representations
        invalid_values = ['null', 'undefined', '']
        valid_groups = [g for g in group_ids if g and g not in invalid_values]
        valid_subgroups = [s for s in subgroup_ids if s and s not in invalid_values]

        try:
            if valid_subgroups:
                # If subgroup is provided, ONLY filter by subgroup
                subgroup_ids_int = [int(sid) for sid in valid_subgroups]
                queryset = queryset.filter(subgroup__id__in=subgroup_ids_int)
            elif valid_groups:
                # If ONLY group is provided, return all players in the group AND its subgroups
                group_ids_int = [int(gid) for gid in valid_groups]
                queryset = queryset.filter(group__id__in=group_ids_int)
        except ValueError:
            # Prevent 500 crash by returning an empty queryset
            return PlayerProfile.objects.none()

        return queryset

    @action(detail=False, methods=['get', 'patch'], url_path='me',
            parser_classes=[MultiPartParser, FormParser, JSONParser])
    def me(self, request):
        """
        GET   /api/players/me/  → profil du joueur connecté
        PATCH /api/players/me/  → mettre à jour son profil (photo, phone...)
        """
        # Vérifier que l'utilisateur est bien un joueur
        if request.user.role != 'player':
            return Response(
                {'error': 'Only players can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Récupérer le profil lié au compte connecté
        try:
            profile = request.user.player_profile
        except PlayerProfile.DoesNotExist:
            return Response(
                {'error': 'No player profile linked to this account'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ── GET ──────────────────────────────────────────────────────────────
        if request.method == 'GET':
            serializer = PlayerProfileSerializer(
                profile, context={'request': request}
            )
            return Response(serializer.data)

        # ── PATCH ─────────────────────────────────────────────────────────────
        serializer = PlayerProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)