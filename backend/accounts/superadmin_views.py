from django.db import transaction
from django.db.models import Count, OuterRef, Q, Subquery
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .permissions import IsSuperAdmin

def _get_models():
    from .models import Academy, AcademyLeadRequest, CustomUser, PlayerProfile
    return Academy, AcademyLeadRequest, CustomUser, PlayerProfile

def _get_serializers():
    from .serializers import (
        AcademyLeadRequestReadSerializer,
        SuperAdminApproveLeadSerializer,
        SuperAdminManualAcademySerializer,
        SuperAdminAcademyListSerializer,
        SuperAdminCoachUserSerializer,
        SuperAdminPlayerRowSerializer,
        SuperAdminAdminUserSerializer,
    )
    return (
        AcademyLeadRequestReadSerializer,
        SuperAdminApproveLeadSerializer,
        SuperAdminManualAcademySerializer,
        SuperAdminAcademyListSerializer,
        SuperAdminCoachUserSerializer,
        SuperAdminPlayerRowSerializer,
        SuperAdminAdminUserSerializer,
    )

def _pending_lead_or_404(pk):
    _, AcademyLeadRequest, _, _ = _get_models()
    try:
        lead = AcademyLeadRequest.objects.get(pk=pk)
    except AcademyLeadRequest.DoesNotExist:
        return None, Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)
    if lead.status != AcademyLeadRequest.STATUS_PENDING:
        return None, Response(
            {"error": "Only pending requests can be processed this way."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return lead, None


class SuperAdminLeadListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        _, AcademyLeadRequest, _, _ = _get_models()
        serializers = _get_serializers()
        status_filter = request.query_params.get("status", "pending")
        allowed = {"pending", "approved", "rejected", "archived", "all"}
        if status_filter not in allowed:
            status_filter = "pending"
        qs = AcademyLeadRequest.objects.all().order_by("-created_at")
        if status_filter != "all":
            qs = qs.filter(status=status_filter)
        return Response(serializers[0](qs, many=True).data)


class SuperAdminApproveLeadView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, pk):
        Academy, AcademyLeadRequest, CustomUser, _ = _get_models()
        serializers = _get_serializers()
        from .academy_onboarding import create_academy_with_admin
        
        try:
            lead = AcademyLeadRequest.objects.get(pk=pk)
        except AcademyLeadRequest.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)

        if lead.status != AcademyLeadRequest.STATUS_PENDING:
            return Response({"error": "This request has already been processed"}, status=status.HTTP_400_BAD_REQUEST)

        ser = serializers[1](data=request.data)
        ser.is_valid(raise_exception=True)
        vd = ser.validated_data

        if CustomUser.objects.filter(email=lead.email).exists():
            return Response(
                {"error": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = (vd.get("username") or "").strip() or lead.email

        try:
            with transaction.atomic():
                academy, user = create_academy_with_admin(
                    academy_name=lead.academy_name,
                    email=lead.email,
                    password=vd["password"],
                    username=username,
                    first_name=vd.get("first_name") or "",
                    last_name=vd.get("last_name") or "",
                    phone=vd.get("phone") or lead.phone or "",
                    club=vd.get("club") or "",
                    billing_plan=vd.get("billing_plan") or "trial",
                )
                lead.status = AcademyLeadRequest.STATUS_APPROVED
                lead.processed_at = timezone.now()
                lead.processed_by = request.user
                lead.created_academy = academy
                lead.save(update_fields=["status", "processed_at", "processed_by", "created_academy"])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Academy and admin account created."}, status=status.HTTP_201_CREATED)


class SuperAdminLeadRejectView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, pk):
        lead, err = _pending_lead_or_404(pk)
        if err: return err
        lead.status = 'rejected'
        lead.processed_at = timezone.now()
        lead.processed_by = request.user
        lead.save(update_fields=["status", "processed_at", "processed_by"])
        return Response({"detail": "Lead rejected."})


class SuperAdminLeadArchiveView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, pk):
        lead, err = _pending_lead_or_404(pk)
        if err: return err
        lead.status = 'archived'
        lead.processed_at = timezone.now()
        lead.processed_by = request.user
        lead.save(update_fields=["status", "processed_at", "processed_by"])
        return Response({"detail": "Lead archived."})


class SuperAdminAcademyListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        Academy, _, CustomUser, _ = _get_models()
        serializers = _get_serializers()
        
        admin_email_sq = Subquery(
            CustomUser.objects.filter(academy_id=OuterRef("pk"), role="admin")
            .order_by("id").values("email")[:1]
        )
        admin_first_sq = Subquery(
            CustomUser.objects.filter(academy_id=OuterRef("pk"), role="admin")
            .order_by("id").values("first_name")[:1]
        )
        admin_last_sq = Subquery(
            CustomUser.objects.filter(academy_id=OuterRef("pk"), role="admin")
            .order_by("id").values("last_name")[:1]
        )
        qs = Academy.objects.annotate(
            coach_count=Count("users", filter=Q(users__role="coach"), distinct=True),
            player_count=Count("players", distinct=True),
            admin_email=admin_email_sq,
            admin_first_name=admin_first_sq,
            admin_last_name=admin_last_sq,
        ).order_by("-created_at")
        
        return Response(serializers[3](qs, many=True).data)


class SuperAdminAcademyDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, pk):
        Academy, _, CustomUser, PlayerProfile = _get_models()
        serializers = _get_serializers()
        
        academy = get_object_or_404(Academy, pk=pk)
        admin = CustomUser.objects.filter(academy=academy, role="admin").order_by("id").first()
        coaches = CustomUser.objects.filter(academy=academy, role="coach").select_related("coach_profile").order_by("email")
        players = PlayerProfile.objects.filter(academy=academy).select_related("user").order_by("full_name")
        
        return Response({
            "academy": {
                "id": academy.id,
                "name": academy.name,
                "email": academy.email,
                "billing_plan": academy.billing_plan,
                "subscription_status": academy.subscription_status,
                "created_at": academy.created_at,
            },
            "primary_admin": serializers[6](admin).data if admin else None,
            "coach_count": coaches.count(),
            "player_count": players.count(),
            "coaches": serializers[4](coaches, many=True).data,
            "players": serializers[5](players, many=True).data,
        })


class SuperAdminAcademyManualCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        Academy, _, CustomUser, _ = _get_models()
        serializers = _get_serializers()
        from .academy_onboarding import create_academy_with_admin
        
        ser = serializers[2](data=request.data)
        ser.is_valid(raise_exception=True)
        vd = ser.validated_data
        email = vd["email"].strip().lower()
        
        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

        username = (vd.get("username") or "").strip() or email
        try:
            with transaction.atomic():
                academy, user = create_academy_with_admin(
                    academy_name=vd["academy_name"],
                    email=email,
                    password=vd["password"],
                    username=username,
                    first_name=vd.get("first_name") or "",
                    last_name=vd.get("last_name") or "",
                    phone=vd.get("phone") or "",
                    club=vd.get("club") or "",
                    billing_plan=vd.get("billing_plan") or "trial",
                )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Academy created."}, status=status.HTTP_201_CREATED)


class SuperAdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        Academy, AcademyLeadRequest, CustomUser, _ = _get_models()
        return Response({
            "academy_count": Academy.objects.count(),
            "coach_count": CustomUser.objects.filter(role="coach").count(),
            "player_count": CustomUser.objects.filter(role="player").count(),
            "admin_count": CustomUser.objects.filter(role="admin").count(),
            "pending_leads": AcademyLeadRequest.objects.filter(status='pending').count(),
            "approved_leads": AcademyLeadRequest.objects.filter(status='approved').count(),
            "plans_distribution": list(
                Academy.objects.values("billing_plan")
                .annotate(count=Count("id"))
                .order_by("-count")
            ),
        })
