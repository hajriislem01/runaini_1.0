from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .models import AcademyLeadRequest
from .serializers import AcademyLeadRequestCreateSerializer


class AcademyLeadCreateView(APIView):
    """Public endpoint: submit name, academy, email, phone (lead)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AcademyLeadRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Thank you — we received your request. Our team will reach out shortly."},
            status=status.HTTP_201_CREATED,
        )
