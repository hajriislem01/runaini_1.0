from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
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

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            print("❌ COACH UPDATE VALIDATION ERROR:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_update(serializer)
        return Response(serializer.data)