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
                queryset = queryset.filter(group__coach=user.coach_profile)
            except Exception:
                return PlayerProfile.objects.none()

        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group__id=group_id)

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