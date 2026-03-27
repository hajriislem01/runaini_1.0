from rest_framework import serializers
from .models import Payment , Group, CustomUser, CoachProfile, PlayerProfile , SubGroup , Academy , Event, EventParticipant



class AcademySerializer(serializers.ModelSerializer):
    # ✅ Pour la LECTURE — retourne URL complète
    logo_url = serializers.SerializerMethodField()
    home_kit_url = serializers.SerializerMethodField()
    away_kit_url = serializers.SerializerMethodField()

    class Meta:
        model = Academy
        fields = [
            'id', 'name', 'founded', 'country', 'city', 'colors',
            'philosophy', 'achievements',
            'logo', 'logo_url',           # logo = écriture, logo_url = lecture
            'email', 'phone', 'website', 'facebook', 'instagram',
            'home_kit', 'home_kit_url',   # home_kit = écriture, home_kit_url = lecture
            'away_kit', 'away_kit_url',   # away_kit = écriture, away_kit_url = lecture
            'technical_director', 'head_coach_name', 'fitness_coach', 'medical_staff',
            'stadium_name', 'stadium_location', 'has_gym', 'has_cafeteria', 'has_dormitory',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'logo_url', 'home_kit_url', 'away_kit_url']
        extra_kwargs = {
            'logo': {'required': False, 'allow_null': True},
            'home_kit': {'required': False, 'allow_null': True},
            'away_kit': {'required': False, 'allow_null': True},
        }

    def get_logo_url(self, obj):
        return self._get_image_url(obj.logo)

    def get_home_kit_url(self, obj):
        return self._get_image_url(obj.home_kit)

    def get_away_kit_url(self, obj):
        return self._get_image_url(obj.away_kit)

    def _get_image_url(self, image_field):
        if not image_field:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(image_field.url)
        return f"http://127.0.0.1:8000{image_field.url}"

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'date_joined']


class CoachSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    coach_profile = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()  

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'role', 'phone', 'club', 'coach_profile', 'groups']
        extra_kwargs = {'role': {'default': 'coach'}}

    def get_coach_profile(self, obj):
        if hasattr(obj, 'coach_profile'):
            return {'id': obj.coach_profile.id}
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
    

class SubGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubGroup
        fields = ['id', 'name', 'group']


class GroupSerializer(serializers.ModelSerializer):
    coach = serializers.PrimaryKeyRelatedField(queryset=CoachProfile.objects.all(), required=False, allow_null=True)
    coach_detail = CoachSerializer(source='coach.user', read_only=True)
    subgroups = SubGroupSerializer(many=True, read_only=True) 

    class Meta:
        model = Group
        fields = ['id', 'name', 'coach', 'coach_detail', 'subgroups']
    
    def to_representation(self, instance):
        """Override to include nested coach data"""
        representation = super().to_representation(instance)
        # Replace coach ID with full coach object (user data)
        if instance.coach and instance.coach.user:
            representation['coach'] = CoachSerializer(instance.coach.user).data
        else:
            representation['coach'] = None
        # Remove coach_detail as it's redundant
        representation.pop('coach_detail', None)
        return representation



class PlayerProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), required=False, allow_null=True)
    subgroup = serializers.PrimaryKeyRelatedField(queryset=SubGroup.objects.all(), required=False, allow_null=True)
    
  
    
    class Meta:
        model = PlayerProfile
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }
    
    def to_representation(self, instance):
        """Override to include nested group and subgroup data"""
        representation = super().to_representation(instance)
        # Replace group ID with full group object
        if instance.group:
            representation['group'] = GroupSerializer(instance.group).data
        # Replace subgroup ID with full subgroup object
        if instance.subgroup:
            representation['subgroup'] = SubGroupSerializer(instance.subgroup).data
        return representation



class EventParticipantSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.full_name', read_only=True)
    player_position = serializers.CharField(source='player.position', read_only=True)

    class Meta:
        model = EventParticipant
        fields = ['id', 'player', 'player_name', 'player_position', 'status', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class EventSerializer(serializers.ModelSerializer):
    participants = EventParticipantSerializer(many=True, read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    subgroup_name = serializers.CharField(source='subgroup.name', read_only=True, allow_null=True)
    participants_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
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


class PaymentSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.full_name', read_only=True)
    player_position = serializers.CharField(source='player.position', read_only=True)
    group_name = serializers.CharField(source='player.group.name', read_only=True)
    receipt_url = serializers.SerializerMethodField()

    class Meta:
        model = Payment
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