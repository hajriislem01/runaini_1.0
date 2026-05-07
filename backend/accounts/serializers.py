from rest_framework import serializers
from .models import (
    Payment, Group, CustomUser, CoachProfile, PlayerProfile,
    SubGroup, Academy, Event, EventParticipant,
    PlayerReport, TrainingSession, ExerciseTemplate, Notification
)
from django.db import models



# ─── 1. Academy ───────────────────────────────────────────────────────────────
class AcademySerializer(serializers.ModelSerializer):
    logo_url     = serializers.SerializerMethodField()
    home_kit_url = serializers.SerializerMethodField()
    away_kit_url = serializers.SerializerMethodField()

    class Meta:
        model  = Academy
        fields = [
            'id', 'name', 'founded', 'country', 'city',
            'primary_color', 'secondary_color', 'color_3', 'color_4',
            'secondary_color_active', 'color_3_active', 'color_4_active',
            'header_text_color',
            'gradient_angle', 'border_radius_style',
            'philosophy', 'achievements',
            'logo', 'logo_url',
            'email', 'phone', 'website', 'facebook', 'instagram',
            'home_kit', 'home_kit_url',
            'away_kit', 'away_kit_url',
            'technical_director', 'head_coach_name', 'fitness_coach', 'medical_staff',
            'stadium_name', 'stadium_location', 'has_gym', 'has_cafeteria', 'has_dormitory',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'logo_url', 'home_kit_url', 'away_kit_url']
        extra_kwargs = {
            'logo':     {'required': False, 'allow_null': True},
            'home_kit': {'required': False, 'allow_null': True},
            'away_kit': {'required': False, 'allow_null': True},
        }

    def get_logo_url(self, obj):     return self._get_image_url(obj.logo)
    def get_home_kit_url(self, obj): return self._get_image_url(obj.home_kit)
    def get_away_kit_url(self, obj): return self._get_image_url(obj.away_kit)

    def _get_image_url(self, image_field):
        if not image_field:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(image_field.url)
        return f"http://127.0.0.1:8000{image_field.url}"


# ─── 2. CustomUser (minimal) ──────────────────────────────────────────────────
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = ['id', 'username', 'email', 'role', 'date_joined']


# ─── 3. SubGroup ──────────────────────────────────────────────────────────────
class SubGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SubGroup
        fields = ['id', 'name', 'group']


# ─── 4. Coach (pour lecture dans GroupSerializer) ─────────────────────────────
class CoachSerializer(serializers.ModelSerializer):
    email         = serializers.EmailField()
    password      = serializers.CharField(write_only=True, required=False, allow_blank=True)
    coach_profile = serializers.SerializerMethodField()
    groups        = serializers.SerializerMethodField()
    subgroups     = serializers.SerializerMethodField()

    class Meta:
        model  = CustomUser
        # ✅ photo et bio retirés — ils sont dans CoachProfile, pas CustomUser
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 'password',
            'role', 'phone', 'club',
            'coach_profile', 'groups', 'subgroups',
        ]
        extra_kwargs = {'role': {'default': 'coach'}}

    def get_coach_profile(self, obj):
        if hasattr(obj, 'coach_profile'):
            profile = obj.coach_profile
            photo_url = None
            if profile.photo:
                request = self.context.get('request')
                photo_url = request.build_absolute_uri(profile.photo.url) if request else f"http://127.0.0.1:8000{profile.photo.url}"

            return {
                'id':                  profile.id,
                'specialization':      profile.specialization,
                'years_of_experience': profile.years_of_experience,
                'certification':       profile.certification,
                'status':              profile.status,
                'address':             profile.address,
                'bio':                 profile.bio,
                'notes':               profile.notes,
                'photo':               photo_url,
            }
        return None

    def get_groups(self, obj):
        if hasattr(obj, 'coach_profile'):
            # Return groups where coach is assigned
            groups = obj.coach_profile.assigned_groups.all()
            return [{'id': g.id, 'name': g.name, 'full_access': g in obj.coach_profile.full_access_groups.all()} for g in groups]
        return []

    def get_subgroups(self, obj):
        if hasattr(obj, 'coach_profile'):
            profile = obj.coach_profile
            # Return subgroups based on logic:
            # 1. All subgroups for full_access groups
            # 2. Specifically assigned subgroups
            from .models import SubGroup
            full_access_ids = profile.full_access_groups.values_list('id', flat=True)
            
            subgroups = SubGroup.objects.filter(
                models.Q(group_id__in=full_access_ids) |
                models.Q(assigned_coaches=profile)
            ).distinct()
            
            return [{'id': s.id, 'name': s.name, 'group': s.group.id} for s in subgroups]
        return []

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.role = 'coach'
        user.save()
        return user

    def update(self, instance, validated_data):
        initial_data = getattr(self, 'initial_data', {})
        print(f"📥 Received for update (validated): {validated_data}")
        print(f"📥 Full payload (initial): {initial_data}")
        
        # 1. Handle base CustomUser (Role, Credentials, Contact)
        user_instance = instance
        
        password = initial_data.get('password')
        if password and str(password).strip():
            user_instance.set_password(password)

        if 'username' in initial_data:
            user_instance.username = initial_data['username']
        if 'first_name' in initial_data:
            user_instance.first_name = initial_data['first_name']
        if 'last_name' in initial_data:
            user_instance.last_name = initial_data['last_name']
        if 'email' in initial_data:
            user_instance.email = initial_data['email']
        if 'phone' in initial_data:
            user_instance.phone = initial_data['phone']
        if 'club' in initial_data:
            user_instance.club = initial_data['club']
            
        user_instance.save()
        print("✅ user_instance modified & saved!")
            
        # 2. Handle nested CoachProfile (Metrics, Credentials)
        coach_instance = getattr(user_instance, 'coach_profile', None)
        if coach_instance:
            if 'specialization' in initial_data:
                coach_instance.specialization = initial_data['specialization']
            if 'years_of_experience' in initial_data:
                try:
                    coach_instance.years_of_experience = int(initial_data['years_of_experience'] or 0)
                except ValueError:
                    coach_instance.years_of_experience = 0
            if 'certification' in initial_data:
                coach_instance.certification = initial_data['certification']
                
            coach_instance.save()
            print("✅ coach_instance modified & saved!")
            
            # ✅ NEW: Multi-Group Assignment Logic
            # payload format expected: 
            # assignments: [ { group_id: 1, full_access: true, subgroups: [] }, { group_id: 2, full_access: false, subgroups: [10, 11] } ]
            assignments = initial_data.get('assignments', [])
            if isinstance(assignments, list) and len(assignments) > 0:
                # Clear existing if we are doing a full sync
                coach_instance.assigned_groups.clear()
                coach_instance.assigned_subgroups.clear()
                coach_instance.full_access_groups.clear()
                
                from .models import Group, SubGroup
                for ass in assignments:
                    gid = ass.get('group_id')
                    try:
                        group_obj = Group.objects.get(id=gid)
                        coach_instance.assigned_groups.add(group_obj)
                        
                        if ass.get('full_access'):
                            coach_instance.full_access_groups.add(group_obj)
                        else:
                            sg_ids = ass.get('subgroups', [])
                            for sid in sg_ids:
                                try:
                                    sg_obj = SubGroup.objects.get(id=sid, group=group_obj)
                                    coach_instance.assigned_subgroups.add(sg_obj)
                                except SubGroup.DoesNotExist:
                                    pass
                    except Group.DoesNotExist:
                        pass
            
            # Legacy fields (single selection support for simple forms/backwards compat)
            elif 'group' in initial_data:
                group_id = initial_data.get('group')
                coach_instance.assigned_groups.clear()
                coach_instance.full_access_groups.clear()
                if group_id:
                    from .models import Group
                    try:
                        g = Group.objects.get(id=group_id)
                        coach_instance.assigned_groups.add(g)
                        coach_instance.full_access_groups.add(g) # Simple selection = full access
                    except Group.DoesNotExist: pass
                
                if 'subgroup' in initial_data:
                    subgroup_id = initial_data.get('subgroup')
                    coach_instance.assigned_subgroups.clear()
                    if subgroup_id:
                        from .models import SubGroup
                        try:
                            s = SubGroup.objects.get(id=subgroup_id)
                            coach_instance.assigned_subgroups.add(s)
                            # If they selected a specific subgroup, maybe they shouldn't have full access?
                            # Usually simple forms only allow one or the other.
                        except SubGroup.DoesNotExist: pass
            
            
        return user_instance


# ─── 5. CoachProfile (pour GET/PATCH /api/coachprofile/) ─────────────────────
class CoachProfileSerializer(serializers.ModelSerializer):
    # Champs lus depuis CustomUser
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name  = serializers.CharField(source='user.last_name',  read_only=True)
    email      = serializers.CharField(source='user.email',      read_only=True)
    username   = serializers.CharField(source='user.username',   read_only=True)
    phone      = serializers.CharField(source='user.phone',      read_only=True)
    photo_url  = serializers.SerializerMethodField()

    class Meta:
        model  = CoachProfile
        fields = [
            'id',
            'first_name', 'last_name', 'email', 'username', 'phone',
            'specialization', 'years_of_experience', 'certification',
            'status', 'address', 'notes',
            'photo', 'photo_url', 'bio',
        ]
        extra_kwargs = {
            'photo': {'required': False, 'allow_null': True},
        }

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.photo.url)
        return f'http://127.0.0.1:8000{obj.photo.url}'


# ─── 6. Group ─────────────────────────────────────────────────────────────────
class GroupSerializer(serializers.ModelSerializer):
    subgroups = serializers.SerializerMethodField()

    class Meta:
        model  = Group
        fields = ['id', 'name', 'subgroups']

    def get_subgroups(self, obj):
        # Filter subgroups based on current user if it's a coach
        request = self.context.get('request')
        user = request.user if request else None
        
        all_subgroups = obj.subgroups.all()
        
        if user and user.role == 'coach' and hasattr(user, 'coach_profile'):
            profile = user.coach_profile
            # 1. If group is in full_access_groups, return all
            if obj in profile.full_access_groups.all():
                return SubGroupSerializer(all_subgroups, many=True).data
            
            # 2. Otherwise return only specifically assigned subgroups
            assigned = all_subgroups.filter(assigned_coaches=profile)
            return SubGroupSerializer(assigned, many=True).data
            
        return SubGroupSerializer(all_subgroups, many=True).data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Note: coach relation is gone from model, but if we want to show who is assigned, 
        # we could list assigned_coaches.
        representation['assigned_coaches'] = [
            {'id': c.user.id, 'name': c.user.username} 
            for c in instance.assigned_coaches.all()
        ]
        return representation


# ─── 7. PlayerProfile ─────────────────────────────────────────────────────────
class PlayerProfileSerializer(serializers.ModelSerializer):
    # # تعريف الحقول الخاصة بحساب المستخدم كحقول للكتابة فقط لتمكين التحديث من خلال ملف اللاعب
    user      = CustomUserSerializer(read_only=True)
    username  = serializers.CharField(write_only=True, required=False)
    email     = serializers.EmailField(write_only=True, required=False)
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password     = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate_username(self, value):
        user = self.instance.user if self.instance else None
        academy = user.academy if user else None
        
        # If academy is not set on the user yet, try to get it from the context
        if not academy and 'request' in self.context:
            academy = self.context['request'].user.academy

        if CustomUser.objects.filter(username=value, academy=academy).exclude(id=user.id if user else None).exists():
            raise serializers.ValidationError("This username is already taken in your academy.")
        return value

    def validate_email(self, value):
        user = self.instance.user if self.instance else None
        if CustomUser.objects.filter(email=value).exclude(id=user.id if user else None).exists():
            raise serializers.ValidationError("This email is already in use globally.")
        return value

    group     = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), required=False, allow_null=True
    )
    subgroup  = serializers.PrimaryKeyRelatedField(
        queryset=SubGroup.objects.all(), required=False, allow_null=True
    )
    photo_url = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model  = PlayerProfile
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

    def get_profile_picture(self, obj):
        return self.get_photo_url(obj)

    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        email    = validated_data.pop('email',    None)
        
        current_password = validated_data.pop('current_password', None)
        new_password     = validated_data.pop('new_password', None)

        user = instance.user

        if username:
            user.username = username
        if email:
            user.email = email
            
        if current_password and new_password:
            if not user.check_password(current_password):
                raise serializers.ValidationError({"error": "Incorrect current password."})
            user.set_password(new_password)
        elif new_password:
            raise serializers.ValidationError({"error": "Current password is required to change password."})

        user.save()
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.group:
            representation['group'] = GroupSerializer(instance.group).data
        if instance.subgroup:
            representation['subgroup'] = SubGroupSerializer(instance.subgroup).data
        return representation

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.photo.url)
        return f'http://127.0.0.1:8000{obj.photo.url}'


# ─── 8. Event ─────────────────────────────────────────────────────────────────
class EventParticipantSerializer(serializers.ModelSerializer):
    player_name     = serializers.CharField(source='player.full_name', read_only=True)
    player_position = serializers.CharField(source='player.position',  read_only=True)
    player_photo    = serializers.SerializerMethodField()

    class Meta:
        model  = EventParticipant
        fields = ['id', 'player', 'player_name', 'player_position', 'player_photo', 'status', 'joined_at']
        read_only_fields = ['id', 'joined_at']

    def get_player_photo(self, obj):
        if obj.player.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.player.photo.url)
            return f'http://127.0.0.1:8000{obj.player.photo.url}'
        return None


class EventSerializer(serializers.ModelSerializer):
    participants       = EventParticipantSerializer(many=True, read_only=True)
    groups             = serializers.PrimaryKeyRelatedField(many=True, queryset=Group.objects.all(), required=False)
    subgroups          = serializers.PrimaryKeyRelatedField(many=True, queryset=SubGroup.objects.all(), required=False)
    target_coaches     = serializers.PrimaryKeyRelatedField(many=True, queryset=CoachProfile.objects.all(), required=False)
    target_players     = serializers.PrimaryKeyRelatedField(many=True, queryset=PlayerProfile.objects.all(), required=False)
    
    groups_detail      = serializers.SerializerMethodField()
    subgroups_detail   = serializers.SerializerMethodField()
    coaches_detail     = serializers.SerializerMethodField()
    players_detail     = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'description', 'type', 'date', 'location',
            'target_academy', 'status', 'winner',
            'groups', 'groups_detail',
            'subgroups', 'subgroups_detail',
            'target_coaches', 'coaches_detail',
            'target_players', 'players_detail',
            'academy',
            'participants', 'participants_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'academy', 'created_at', 'updated_at']

    def get_groups_detail(self, obj):
        return [{'id': g.id, 'name': g.name} for g in obj.groups.all()]

    def get_subgroups_detail(self, obj):
        return [{'id': s.id, 'name': s.name, 'group_name': s.group.name} for s in obj.subgroups.all()]

    def get_coaches_detail(self, obj):
        coaches = set(obj.target_coaches.all())
        selected_subgroups = obj.subgroups.all()
        selected_subgroups_group_ids = [sg.group.id for sg in selected_subgroups]

        for g in obj.groups.all():
            if g.id in selected_subgroups_group_ids:
                # Subgroup is explicitly selected for this group; skip group-level aggregation
                continue
            coaches.update(g.assigned_coaches.all())
            coaches.update(g.full_access_coaches.all())
            for sg in g.subgroups.all():
                coaches.update(sg.assigned_coaches.all())
        for sg in selected_subgroups:
            coaches.update(sg.assigned_coaches.all())
            coaches.update(sg.group.full_access_coaches.all())

        def get_photo(c):
            if c.photo:
                request = self.context.get('request')
                return request.build_absolute_uri(c.photo.url) if request else f"http://127.0.0.1:8000{c.photo.url}"
            return None

        return [
            {
                'id': c.id, 
                'name': f"{c.user.first_name} {c.user.last_name}".strip() or c.user.username,
                'photo': get_photo(c)
            } for c in coaches
        ]

    def get_players_detail(self, obj):
        players = set(obj.target_players.all())
        selected_subgroups = obj.subgroups.all()
        selected_subgroups_group_ids = [sg.group.id for sg in selected_subgroups]

        for g in obj.groups.all():
            if g.id in selected_subgroups_group_ids:
                continue
            players.update(g.players.all())
        for sg in selected_subgroups:
            players.update(sg.players.all())

        def get_photo(p):
            if p.photo:
                request = self.context.get('request')
                return request.build_absolute_uri(p.photo.url) if request else f"http://127.0.0.1:8000{p.photo.url}"
            return None

        return [
            {
                'id': p.id, 
                'name': p.full_name,
                'photo': get_photo(p),
                'position': p.position
            } for p in players
        ]

    def get_participants_count(self, obj):
        players = set(obj.target_players.all())
        selected_subgroups = obj.subgroups.all()
        selected_subgroups_group_ids = [sg.group.id for sg in selected_subgroups]

        for g in obj.groups.all():
            if g.id in selected_subgroups_group_ids:
                continue
            players.update(g.players.all())
        for sg in selected_subgroups:
            players.update(sg.players.all())
            
        explicit_players = set([p.player for p in obj.participants.all()])
        total_players = players.union(explicit_players)
        
        return len(total_players)


# ─── 9. Payment ───────────────────────────────────────────────────────────────
class PaymentSerializer(serializers.ModelSerializer):
    player_name     = serializers.CharField(source='player.full_name',    read_only=True)
    player_position = serializers.CharField(source='player.position',     read_only=True)
    group_name      = serializers.CharField(source='player.group.name',   read_only=True)
    receipt_url     = serializers.SerializerMethodField()

    class Meta:
        model  = Payment
        fields = [
            'id', 'player', 'player_name', 'player_position', 'group_name',
            'amount', 'payment_date', 'month', 'method', 'status',
            'receipt', 'receipt_url', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'academy', 'created_at', 'updated_at']

    def get_receipt_url(self, obj):
        if not obj.receipt:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.receipt.url)
        return f"http://127.0.0.1:8000{obj.receipt.url}"


# ─── 10. PlayerReport ─────────────────────────────────────────────────────────
class PlayerReportSerializer(serializers.ModelSerializer):
    player_name     = serializers.CharField(source='player.full_name',  read_only=True)
    player_position = serializers.CharField(source='player.position',   read_only=True)
    group_name      = serializers.CharField(source='player.group.name', read_only=True, default='—')
    coach_name      = serializers.SerializerMethodField()
    attendance_pct  = serializers.SerializerMethodField()

    class Meta:
        model  = PlayerReport
        fields = '__all__'
        read_only_fields = [
            'id', 'academy', 'coach', 'overall_score',
            'created_at', 'updated_at',
            'player_name', 'player_position', 'group_name',
            'coach_name', 'attendance_pct',
        ]

    def get_coach_name(self, obj):
        if obj.coach and obj.coach.user:
            u    = obj.coach.user
            name = f"{u.first_name} {u.last_name}".strip()
            return name or u.username
        return ''

    def get_attendance_pct(self, obj):
        if obj.attendance_total and obj.attendance_total > 0:
            return round((obj.attendance_present / obj.attendance_total) * 100, 1)
        return 0

    def validate(self, data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'academy'):
            player = data.get('player')
            if player and player.academy != request.user.academy:
                raise serializers.ValidationError("Player does not belong to your academy.")
        return data


# ─── 11. TrainingSession ──────────────────────────────────────────────────────
class TrainingSessionSerializer(serializers.ModelSerializer):
    coach_name              = serializers.SerializerMethodField()
    duration_minutes        = serializers.ReadOnlyField()
    total_exercise_duration = serializers.ReadOnlyField()
    groups_detail           = serializers.SerializerMethodField()
    participants_count      = serializers.SerializerMethodField()
    individual_exercises    = serializers.ReadOnlyField()
    group_exercises         = serializers.ReadOnlyField()

    class Meta:
        model  = TrainingSession
        fields = '__all__'
        read_only_fields = [
            'id', 'coach', 'academy', 'created_at', 'updated_at',
            'coach_name', 'duration_minutes', 'total_exercise_duration',
            'groups_detail', 'participants_count',
            'individual_exercises', 'group_exercises',
        ]

    def get_coach_name(self, obj):
        if obj.coach and obj.coach.user:
            u = obj.coach.user
            return f"{u.first_name} {u.last_name}".strip() or u.username
        return ''

    def get_groups_detail(self, obj):
        return [{'id': g.id, 'name': g.name} for g in obj.groups.all()]

    def get_participants_count(self, obj):
        from .models import PlayerProfile
        return PlayerProfile.objects.filter(
            group__in=obj.groups.all(),
            academy=obj.academy
        ).count()

    def validate_exercises(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Exercises must be a list.")
        for ex in value:
            if not ex.get('name'):
                raise serializers.ValidationError("Each exercise must have a name.")
            if ex.get('duration', 0) < 0:
                raise serializers.ValidationError("Exercise duration cannot be negative.")
        return value

    def validate(self, data):
        if data.get('start_time') and data.get('end_time'):
            if data['end_time'] <= data['start_time']:
                raise serializers.ValidationError("End time must be after start time.")
        if data.get('recurrence') != 'none' and not data.get('recurrence_end'):
            raise serializers.ValidationError(
                "Recurrence end date is required when recurrence is set."
            )
        return data


class TrainingSessionListSerializer(serializers.ModelSerializer):
    coach_name         = serializers.SerializerMethodField()
    duration_minutes   = serializers.ReadOnlyField()
    participants_count = serializers.SerializerMethodField()
    groups_detail      = serializers.SerializerMethodField()
    exercise_count     = serializers.SerializerMethodField()

    class Meta:
        model  = TrainingSession
        fields = [
            'id', 'title', 'category', 'level', 'date',
            'start_time', 'end_time', 'location',
            'coach_name', 'duration_minutes', 'participants_count',
            'groups_detail', 'exercise_count', 'recurrence',
        ]

    def get_coach_name(self, obj):
        if obj.coach and obj.coach.user:
            u = obj.coach.user
            return f"{u.first_name} {u.last_name}".strip() or u.username
        return ''

    def get_participants_count(self, obj):
        from .models import PlayerProfile
        return PlayerProfile.objects.filter(
            group__in=obj.groups.all(),
            academy=obj.academy
        ).count()

    def get_groups_detail(self, obj):
        return [{'id': g.id, 'name': g.name} for g in obj.groups.all()]

    def get_exercise_count(self, obj):
        return len(obj.exercises or [])


# ─── 12. ExerciseTemplate ─────────────────────────────────────────────────────
class ExerciseTemplateSerializer(serializers.ModelSerializer):
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model  = ExerciseTemplate
        fields = [
            'id', 'name', 'category', 'intensity',
            'duration', 'sets', 'reps', 'instructions',
            'is_default', 'is_mine', 'created_at',
        ]
        read_only_fields = ['id', 'is_default', 'created_at', 'is_mine']

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if not request or obj.is_default:
            return False
        try:
            return obj.coach == request.user.coach_profile
        except Exception:
            return False

    def validate_duration(self, value):
        if value < 1:
            raise serializers.ValidationError("Duration must be at least 1 minute.")
        if value > 180:
            raise serializers.ValidationError("Duration cannot exceed 180 minutes.")
        return value

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']