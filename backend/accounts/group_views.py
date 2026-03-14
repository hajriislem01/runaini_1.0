from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Group, SubGroup
from .serializers import GroupSerializer, SubGroupSerializer
from .permissions import IsAdmin


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    queryset = Group.objects.all()  # ✅ requis par le router

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # ✅ Filtre par académie de l'admin connecté
        return Group.objects.filter(academy=self.request.user.academy)

    def perform_create(self, serializer):
        # ✅ Assigne automatiquement l'académie à la création
        serializer.save(academy=self.request.user.academy)


class SubGroupViewSet(viewsets.ModelViewSet):
    serializer_class = SubGroupSerializer
    permission_classes = [IsAuthenticated]
    queryset = SubGroup.objects.all()  # ✅ requis par le router

    def get_queryset(self):
        # ✅ Filtre par académie de l'admin connecté
        queryset = SubGroup.objects.filter(
            group__academy=self.request.user.academy
        )
        group_id = self.request.query_params.get('group')
        if group_id:
            queryset = queryset.filter(group__id=group_id)
        return queryset