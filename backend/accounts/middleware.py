from django.http import JsonResponse

def _is_public_admin_signup_path(path):
    """True only for POST /api/signup/ (academy admin), not coach or player signup."""
    p = path.rstrip("/")
    return p.endswith("/signup")


class SuperAdminAcademySignupGateMiddleware:
    """
    Blocks unauthenticated or non–super-admin POST requests to /api/signup/.
    Uses lazy imports to prevent startup deadlocks.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "POST" and _is_public_admin_signup_path(request.path):
            try:
                # Lazy import to avoid circular dependencies during startup
                from rest_framework.authtoken.models import Token
                
                auth = request.META.get("HTTP_AUTHORIZATION", "")
                if not auth.startswith("Token "):
                    return JsonResponse(
                        {
                            "detail": "Academy self-registration is disabled. Submit a request from the website or contact support.",
                        },
                        status=403,
                    )
                
                key = auth.split(" ", 1)[1].strip()
                token = Token.objects.select_related("user").get(key=key)
                user = token.user
                
                if getattr(user, "role", None) != "superadmin":
                    return JsonResponse(
                        {"detail": "Only a super administrator may create new academy admin accounts."},
                        status=403,
                    )
            except Exception:
                # If DB is not ready or token is invalid, fail safely
                return JsonResponse(
                    {"detail": "Authorization failed during academy registration gate."},
                    status=403,
                )

        return self.get_response(request)
