from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError
from .models import CustomUser, CoachProfile, PlayerProfile, Group, SubGroup, Academy
from .serializers import PlayerProfileSerializer
from .permissions import IsAdmin


class AdminSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        if data.get("role") != "admin":
            return Response({"error": "Only admin signup is allowed"}, status=403)

        try:
            # ✅ Crée l'académie automatiquement avec le nom fourni
            academy = Academy.objects.create(
                name=data.get("academy_name", f"{data['username']}'s Academy"),
            )

            user = CustomUser.objects.create(
                username=data["username"],
                email=data["email"],
                password=make_password(data["password"]),
                role="admin",
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                phone=data.get("phone", ""),
                club=data.get("club", ""),
                academy=academy  # ✅ Assigne l'académie à l'admin
            )

            token = Token.objects.create(user=user)
            return Response({
                "token": token.key,
                "academy_id": academy.id,
                "academy_name": academy.name
            }, status=201)

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
                academy=request.user.academy  # ✅ hérite l'académie de l'admin
            )

            CoachProfile.objects.create(
                user=user,
                specialization=data.get("specialization", ""),
                years_of_experience=data.get("years_of_experience", 0),
                certification=data.get("certification", ""),
                notes=data.get("notes", "")
            )

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
            user = CustomUser.objects.create(
                username=data["username"],
                email=data["email"],
                password=make_password(data["password"]),
                role="player",
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                phone=data.get("phone", ""),
                academy=request.user.academy  # ✅ hérite l'académie de l'admin
            )

            # Group — doit appartenir à la même académie
            group_instance = None
            group_id = data.get("group")
            if group_id:
                try:
                    group_instance = Group.objects.get(
                        id=group_id,
                        academy=request.user.academy  # ✅ sécurité
                    )
                except Group.DoesNotExist:
                    return Response({"error": "Invalid group"}, status=400)

            # SubGroup optionnel
            subgroup_instance = None
            subgroup_id = data.get("subgroup")
            if subgroup_id:
                try:
                    subgroup_instance = SubGroup.objects.get(id=subgroup_id)
                except SubGroup.DoesNotExist:
                    return Response({"error": "Invalid subgroup"}, status=400)

            player = PlayerProfile.objects.create(
                user=user,
                full_name=data["full_name"],
                height=data.get("height", 0),
                weight=data.get("weight", 0),
                position=data.get("position", "Midfielder"),
                status=data.get("status", "Active"),
                group=group_instance,
                subgroup=subgroup_instance,
                phone=data.get("phone", ""),
                address=data.get("address", ""),
                notes=data.get("notes", ""),
                academy=request.user.academy  # ✅ hérite l'académie de l'admin
            )

            serializer = PlayerProfileSerializer(player)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response(
                {"error": "Username or email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )