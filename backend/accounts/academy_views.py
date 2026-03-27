from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Academy
from .serializers import AcademySerializer
from .permissions import IsAdmin


class AcademyView(APIView):
  
    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        academy = request.user.academy
        if not academy:
            return Response({"error": "No academy found"}, status=404)
        serializer = AcademySerializer(
            academy, data=request.data,
            partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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