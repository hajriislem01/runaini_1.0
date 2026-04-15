from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import CoachProfile
from .serializers import CoachProfileSerializer


class CoachProfileView(APIView):
    """
    GET   /api/coachprofile/  → récupère le profil du coach connecté
    PUT   /api/coachprofile/  → met à jour le profil (full update)
    PATCH /api/coachprofile/  → met à jour le profil (partial update + photo)
    """
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if request.user.role != 'coach':
            return Response({'error': 'Only coaches can access this endpoint'}, status=403)

        profile, _ = CoachProfile.objects.get_or_create(user=request.user)
        serializer = CoachProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial=False):
        if request.user.role != 'coach':
            return Response({'error': 'Only coaches can access this endpoint'}, status=403)

        profile, _ = CoachProfile.objects.get_or_create(user=request.user)

        # ── Mise à jour champs CustomUser ─────────────────────────────────────
        user         = request.user
        user_changed = False
        for field in ['first_name', 'last_name', 'email', 'phone']:
            if field in request.data:
                setattr(user, field, request.data[field])
                user_changed = True

        # Changement de mot de passe
        if request.data.get('new_password') and request.data.get('current_password'):
            if not user.check_password(request.data['current_password']):
                return Response({'error': 'Current password is incorrect'}, status=400)
            user.set_password(request.data['new_password'])
            user_changed = True

        if user_changed:
            user.save()

        # ── Mise à jour CoachProfile via serializer ───────────────────────────
        serializer = CoachProfileSerializer(
            profile,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)