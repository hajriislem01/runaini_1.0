from rest_framework import viewsets, permissions
from .models import CustomUser
from .serializers import CoachSerializer


class CoachViewSet(viewsets.ModelViewSet):
    serializer_class = CoachSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CustomUser.objects.filter(role="coach")  # ✅ requis par le router

    def get_queryset(self):
        # ✅ Filtre par académie de l'admin connecté
        return CustomUser.objects.filter(
            role="coach",
            academy=self.request.user.academy
        )