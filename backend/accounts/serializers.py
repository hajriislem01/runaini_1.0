from rest_framework import serializers
from .models import (
    Payment, Group, CustomUser, CoachProfile, PlayerProfile,
    SubGroup, Academy, Event, EventParticipant,
    PlayerReport, TrainingSession, ExerciseTemplate
)


# ─── 1. Academy ───────────────────────────────────────────────────────────────
class AcademySerializer(serializers.ModelSerializer):
    logo_url     = serializers.SerializerMethodField()
    home_kit_url = serializers.SerializerMethodField()
    away_kit_url = serializers.SerializerMethodField()

    class Meta:
        model  = Academy
        fields = [
            'id', 'name', 'founded', 'country', 'city', 'colors',
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
    password      = serializers.CharField(write_only=True)
    coach_profile = serializers.SerializerMethodField()
    groups        = serializers.SerializerMethodField()

    class Meta:
        model  = CustomUser
        # ✅ photo et bio retirés — ils sont dans CoachProfile, pas CustomUser
        fields = [
            'id', 'username', 'email', 'password',
            'role', 'phone', 'club',
            'coach_profile', 'groups',
        ]
        extra_kwargs = {'role': {'default': 'coach'}}

    def get_coach_profile(self, obj):
        if hasattr(obj, 'coach_profile'):
            profile = obj.coach_profile
            return {
                'id':                  profile.id,
                'specialization':      profile.specialization,
                'years_of_experience': profile.years_of_experience,
                'certification':       profile.certification,
                'status':              profile.status,
                'address':             profile.address,
                'bio':                 profile.bio,
                'photo':               profile.photo.url if profile.photo else None,
            }
        return None

    def get_groups(self, obj):
        if hasattr(obj, 'coach_profile'):
            groups = obj.coach_profile.groups.all()
            return [{'id': g.id, 'name': g.name} for g in groups]
        return []

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.role = 'coach'
        user.save()
        return user


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
    coach      = serializers.PrimaryKeyRelatedField(
        queryset=CoachProfile.objects.all(), required=False, allow_null=True
    )
    coach_detail = CoachSerializer(source='coach.user', read_only=True)
    subgroups    = SubGroupSerializer(many=True, read_only=True)

    class Meta:
        model  = Group
        fields = ['id', 'name', 'coach', 'coach_detail', 'subgroups']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.coach and instance.coach.user:
            representation['coach'] = CoachSerializer(instance.coach.user).data
        else:
            representation['coach'] = None
        representation.pop('coach_detail', None)
        return representation


# ─── 7. PlayerProfile ─────────────────────────────────────────────────────────
class PlayerProfileSerializer(serializers.ModelSerializer):
    user     = CustomUserSerializer(read_only=True)
    group    = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), required=False, allow_null=True
    )
    subgroup = serializers.PrimaryKeyRelatedField(
        queryset=SubGroup.objects.all(), required=False, allow_null=True
    )
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model  = PlayerProfile
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

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

    class Meta:
        model  = EventParticipant
        fields = ['id', 'player', 'player_name', 'player_position', 'status', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class EventSerializer(serializers.ModelSerializer):
    participants       = EventParticipantSerializer(many=True, read_only=True)
    group_name         = serializers.CharField(source='group.name',    read_only=True)
    subgroup_name      = serializers.CharField(source='subgroup.name', read_only=True, allow_null=True)
    participants_count = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'description', 'type', 'date', 'location',
            'target_academy', 'status', 'winner',
            'group', 'group_name',
            'subgroup', 'subgroup_name',
            'academy',
            'participants', 'participants_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'academy', 'created_at', 'updated_at']

    def get_participants_count(self, obj):
        return obj.participants.count()


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