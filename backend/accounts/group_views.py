from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Group, SubGroup
from .serializers import GroupSerializer, SubGroupSerializer
from .permissions import IsAdmin


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    queryset = Group.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        # ✅ Coach voit seulement ses groupes assignés
        if user.role == 'coach':
            try:
                return Group.objects.filter(
                    academy=user.academy,
                    coach=user.coach_profile
                )
            except Exception:
                return Group.objects.none()
        # ✅ Admin voit tous les groupes de son académie
        return Group.objects.filter(academy=user.academy)

    def perform_create(self, serializer):
        serializer.save(academy=self.request.user.academy)


class SubGroupViewSet(viewsets.ModelViewSet):
    serializer_class = SubGroupSerializer
    permission_classes = [IsAuthenticated]
    queryset = SubGroup.objects.all()

    def get_queryset(self):
        user = self.request.user
        queryset = SubGroup.objects.filter(
            group__academy=user.academy
        )
        # ✅ Coach voit seulement les subgroups de ses groupes
        if user.role == 'coach':
            try:
                queryset = queryset.filter(
                    group__coach=user.coach_profile
                )
            except Exception:
                return SubGroup.objects.none()

        group_id = self.request.query_params.get('group')
        if group_id:
            queryset = queryset.filter(group__id=group_id)
        return queryset