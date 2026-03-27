# ✅ Ajoute dans academy_views.py ou crée coach_profile_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import CustomUser, CoachProfile
from .serializers import CoachSerializer
from django.contrib.auth.hashers import make_password


class CoachProfileView(APIView):
    """
    GET  /api/coach/profile/  → récupère le profil du coach connecté
    PUT  /api/coach/profile/  → met à jour le profil du coach connecté
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if request.user.role != 'coach':
            return Response({'error': 'Only coaches can access this endpoint'}, status=403)

        user = request.user
        
        # ✅ Crée le profil si n'existe pas
        coach_profile, created = CoachProfile.objects.get_or_create(user=user)

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'specialization': coach_profile.specialization,
            'years_of_experience': coach_profile.years_of_experience,
            'certification': coach_profile.certification,
            'status': coach_profile.status,
            'address': coach_profile.address,
            'notes': coach_profile.notes,
        })
    def put(self, request):
        if request.user.role != 'coach':
            return Response({'error': 'Only coaches can access this endpoint'}, status=403)

        user = request.user
        data = request.data

        # ✅ Mise à jour CustomUser
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']

        # ✅ Changement de mot de passe
        if data.get('new_password') and data.get('current_password'):
            if not user.check_password(data['current_password']):
                return Response({'error': 'Current password is incorrect'}, status=400)
            user.set_password(data['new_password'])

        user.save()

        # ✅ Mise à jour CoachProfile
        try:
            coach_profile = user.coach_profile
            if 'specialization' in data:
                coach_profile.specialization = data['specialization']
            if 'years_of_experience' in data:
                coach_profile.years_of_experience = data['years_of_experience']
            if 'certification' in data:
                coach_profile.certification = data['certification']
            if 'address' in data:
                coach_profile.address = data['address']
            if 'notes' in data:
                coach_profile.notes = data['notes']
            coach_profile.save()
        except CoachProfile.DoesNotExist:
            pass

        return Response({
            'message': 'Profile updated successfully',
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
        })