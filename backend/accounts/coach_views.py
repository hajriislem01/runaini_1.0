from rest_framework import viewsets, permissions
from .models import CustomUser
from .serializers import CoachSerializer


class CoachViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role="coach")
    serializer_class = CoachSerializer
    permission_classes = [permissions.IsAuthenticated]