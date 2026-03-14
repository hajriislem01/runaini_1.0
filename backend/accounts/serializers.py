from rest_framework import serializers
from .models import Group, CustomUser, CoachProfile, PlayerProfile , SubGroup , Academy

from rest_framework import serializers
from .models import Academy


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

   