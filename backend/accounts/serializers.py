

from rest_framework import serializers
from .models import Group, CustomUser, CoachProfile, PlayerProfile , SubGroup



class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']

class CoachSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    coach_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'role', 'phone', 'club', 'coach_profile']
        extra_kwargs = {'role': {'default': 'coach'}}

    def get_coach_profile(self, obj):
        """Return coach profile ID if it exists"""
        if hasattr(obj, 'coach_profile'):
            return {'id': obj.coach_profile.id}
        return None

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)  # Hash password
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
    subgroups = SubGroupSerializer(many=True, read_only=True)  # utilise related_name="subgroups"

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

# serializers.py
class PlayerProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), required=False, allow_null=True)
    subgroup = serializers.PrimaryKeyRelatedField(queryset=SubGroup.objects.all(), required=False, allow_null=True)
    
    # Nested serializers for read operations
    group_detail = GroupSerializer(source='group', read_only=True)
    subgroup_detail = SubGroupSerializer(source='subgroup', read_only=True)
    
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

   