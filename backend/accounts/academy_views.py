from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Academy
from .serializers import AcademySerializer
from .permissions import IsAdmin


class AcademyView(APIView):
  
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdmin()]

    def get(self, request):
        academy = request.user.academy
        if not academy:
            return Response({"error": "No academy found"}, status=404)
        serializer = AcademySerializer(academy, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if request.user.academy:
            return Response({"error": "Admin already has an academy"}, status=400)
        serializer = AcademySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            academy = serializer.save()
            request.user.academy = academy
            request.user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response({
            "errors": serializer.errors,
            "received_keys": list(request.data.keys()),
            "content_type": request.content_type
        }, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        academy = request.user.academy
        if not academy:
            return Response({"error": "No academy found"}, status=404)

        user = request.user
        user_changed = False

        # Handle password change
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if new_password:
            if not current_password:
                return Response({"error": "Current password is required"}, status=400)
            if not user.check_password(current_password):
                return Response({"error": "Current password is incorrect"}, status=400)
            if len(new_password) < 8:
                return Response({"error": "New password must be at least 8 characters long"}, status=400)
            
            user.set_password(new_password)
            user_changed = True

        if user_changed:
            user.save()

        # If it's only a password update (no other academy fields except maybe current/new password)
        # Avoid running AcademySerializer on empty data or if only password keys are sent
        if len(request.data) <= 2 and new_password:
             serializer = AcademySerializer(academy, context={'request': request})
             return Response(serializer.data)

        serializer = AcademySerializer(
            academy, data=request.data,
            partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response({
            "errors": serializer.errors,
            "received_keys": list(request.data.keys()),
            "content_type": request.content_type
        }, status=status.HTTP_400_BAD_REQUEST)


class AcademyDirectoryView(APIView):
  
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filtre optionnel par pays
        country = request.query_params.get('country')
        city = request.query_params.get('city')
        search = request.query_params.get('search')

        academies = Academy.objects.all()

        # ✅ Exclut l'académie de l'admin connecté (optionnel)
        # academies = academies.exclude(id=request.user.academy_id)

        if country:
            academies = academies.filter(country=country)
        if city:
            academies = academies.filter(city__icontains=city)
        if search:
            academies = academies.filter(name__icontains=search)

        serializer = AcademySerializer(
            academies, many=True, context={'request': request}
        )
        return Response(serializer.data)