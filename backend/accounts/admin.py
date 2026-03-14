from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, CoachProfile, PlayerProfile, Group, SubGroup, Academy


@admin.register(Academy)
class AcademyAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'country', 'email', 'phone')
    search_fields = ('name', 'city', 'country')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs  # superuser voit tout
        return qs.filter(id=request.user.academy_id)  # admin voit seulement la sienne


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'role', 'academy', 'is_staff', 'is_active']
    list_filter = ['role', 'academy']
    search_fields = ['username', 'email']
    fieldsets = UserAdmin.fieldsets + (
        ('Rôle et infos supplémentaires', {'fields': ('role', 'phone', 'club', 'academy')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(academy=request.user.academy)


@admin.register(CoachProfile)
class CoachProfileAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'get_academy', 'status', 'specialization')
    list_filter = ('status',)
    search_fields = ('user__username', 'user__email')

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Coach'

    def get_academy(self, obj):
        return obj.user.academy
    get_academy.short_description = 'Academy'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user__academy=request.user.academy)


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'coach', 'academy')
    list_filter = ('academy',)
    search_fields = ('name',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(academy=request.user.academy)

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj and obj.academy != request.user.academy:
            return False
        return request.user.role == 'admin'

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj and obj.academy != request.user.academy:
            return False
        return request.user.role == 'admin'

    def save_model(self, request, obj, form, change):
        if not change and not obj.academy:
            obj.academy = request.user.academy
        super().save_model(request, obj, form, change)


@admin.register(SubGroup)
class SubGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'group', 'get_academy')
    list_filter = ('group__academy',)
    search_fields = ('name', 'group__name')

    def get_academy(self, obj):
        return obj.group.academy
    get_academy.short_description = 'Academy'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(group__academy=request.user.academy)


@admin.register(PlayerProfile)
class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'position', 'status', 'group', 'academy')
    list_filter = ('status', 'position', 'academy')
    search_fields = ('full_name', 'user__username')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(academy=request.user.academy)

    def save_model(self, request, obj, form, change):
        if not change and not obj.academy:
            obj.academy = request.user.academy
        super().save_model(request, obj, form, change)