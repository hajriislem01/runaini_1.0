from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, CoachProfile, PlayerProfile
from .models import Group , SubGroup
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'role', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
    ('Rôle et infos supplémentaires', {'fields': ('role', 'phone', 'club')}),
)



@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'coach')


    def has_add_permission(self, request):
        return request.user.role == 'admin'

    def has_change_permission(self, request, obj=None):
        return request.user.role == 'admin'

    def has_delete_permission(self, request, obj=None):
        return request.user.role == 'admin'
@admin.register(SubGroup)
class SubGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'group')
    list_filter = ('group',)
class PlayerProfileAdmin(admin.ModelAdmin):
    search_fields = ('full_name', 'user__username')
    list_filter = ('status', 'position')
    list_display = ('full_name', 'position', 'status', 'get_groups')

    def get_groups(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])
    
    get_groups.short_description = "Groups"


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(CoachProfile)
admin.site.register(PlayerProfile, PlayerProfileAdmin)
