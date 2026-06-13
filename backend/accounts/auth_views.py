from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.db import transaction
from .models import CustomUser, CoachProfile, PlayerProfile, Group, SubGroup
from .serializers import PlayerProfileSerializer
from .permissions import IsAdmin, IsSuperAdmin
from .academy_onboarding import create_academy_with_admin


class AdminSignupView(APIView):
    """Create academy + primary admin. Restricted to platform super admins."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        data = request.data

        if data.get("role") != "admin":
            return Response({"error": "Only admin academy accounts can be created here"}, status=403)

        required = ("username", "email", "password", "academy_name")
        if not all(data.get(f) for f in required):
            return Response({"error": f"Missing required fields: {', '.join(required)}"}, status=400)

        if CustomUser.objects.filter(email=data["email"]).exists():
            return Response({"error": "A user with this email already exists"}, status=400)

        try:
            academy, user = create_academy_with_admin(
                academy_name=data.get("academy_name", f"{data['username']}'s Academy"),
                email=data["email"],
                password=data["password"],
                username=data["username"],
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                phone=data.get("phone", ""),
                club=data.get("club", ""),
                billing_plan=data.get("billing_plan", "trial"),
            )
            token = Token.objects.create(user=user)
            return Response(
                {
                    "token": token.key,
                    "academy_id": academy.id,
                    "academy_name": academy.name,
                    "billing_plan": academy.billing_plan,
                },
                status=201,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email et mot de passe requis"}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "Identifiants invalides"}, status=401)

        if user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "username": user.username,
                    "academy_id": user.academy_id  # ✅ retourne l'ID de l'académie
                }
            }, status=200)
        else:
            return Response({"error": "Identifiants invalides"}, status=401)


class CoachSignupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "admin":
            return Response({"error": "Only admins can create coaches"}, status=403)

        data = request.data
        required_fields = ['username', 'email', 'password']

        if not all(field in data for field in required_fields):
            return Response({"error": "Missing required fields"}, status=400)

        try:
            user = CustomUser.objects.create(
                username=data["username"],
                email=data["email"],
                password=make_password(data["password"]),
                role="coach",
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                phone=data.get("phone", ""),
                club=data.get("club", ""),
                academy=request.user.academy
            )

            # ✅ The Profile is ALREADY created by the post_save signal in signals.py
            # Just update it with the extra data
            coach_profile = user.coach_profile
            coach_profile.specialization = data.get("specialization", "")
            coach_profile.years_of_experience = data.get("years_of_experience", 0)
            coach_profile.certification = data.get("certification", "")
            coach_profile.notes = data.get("notes", "")
            coach_profile.save()

            # ✅ Assigne le groupe au coach
            group_id = data.get("group")
            if group_id:
                Group.objects.filter(
                    id=group_id,
                    academy=request.user.academy
                ).update(coach=coach_profile)

            return Response({"message": "Coach account created successfully"}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class PlayerSignupView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        data = request.data
        required_fields = ['username', 'email', 'password', 'full_name']

        if not all(field in data for field in required_fields):
            return Response(
                {"error": f"Missing required fields: {', '.join(required_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                user = CustomUser.objects.create(
                    username=data["username"],
                    email=data["email"],
                    password=make_password(data["password"]),
                    role="player",
                    first_name=data.get("first_name", ""),
                    last_name=data.get("last_name", ""),
                    phone=data.get("phone", ""),
                    academy=request.user.academy
                )

                # Fetch Group & SubGroup
                group_instance = None
                group_id = data.get("group")
                if group_id:
                    try:
                        group_instance = Group.objects.get(
                            id=group_id,
                            academy=request.user.academy
                        )
                    except Group.DoesNotExist:
                        raise Exception("Invalid group: Group does not exist in your academy")

                subgroup_instance = None
                subgroup_id = data.get("subgroup")
                if subgroup_id:
                    try:
                        subgroup_instance = SubGroup.objects.get(id=subgroup_id)
                    except SubGroup.DoesNotExist:
                        raise Exception("Invalid subgroup")

                # Mapping & Profile Update
                # post_save signal created the profile, we retrieve it here
                player = user.player_profile
                player.full_name = data["full_name"]
                
                # Careful mapping of decimal fields to avoid NULL errors or bad formats
                def clean_decimal(val):
                    if val is None or str(val).strip() == "":
                        return None
                    try:
                        return float(val)
                    except (ValueError, TypeError):
                        return None

                player.height = clean_decimal(data.get("height"))
                player.weight = clean_decimal(data.get("weight"))
                player.position = data.get("position") or "Midfielder"
                player.status = data.get("status") or "Active"
                player.group = group_instance
                player.subgroup = subgroup_instance
                player.phone = data.get("phone", "")
                player.address = data.get("address", "")
                player.notes = data.get("notes", "")
                player.academy = request.user.academy
                
                player.save()

                serializer = PlayerProfileSerializer(player)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
