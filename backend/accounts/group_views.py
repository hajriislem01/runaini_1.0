from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Group, SubGroup
from .serializers import GroupSerializer, SubGroupSerializer
from .permissions import IsAdmin


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response({"error": "Not allowed"}, status=403)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response({"error": "Not allowed"}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response({"error": "Not allowed"}, status=403)
        return super().destroy(request, *args, **kwargs)


class SubGroupViewSet(viewsets.ModelViewSet):
    queryset = SubGroup.objects.all()
    serializer_class = SubGroupSerializer
    permission_classes = [IsAuthenticated, IsAdmin]