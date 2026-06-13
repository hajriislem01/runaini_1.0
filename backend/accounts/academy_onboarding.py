"""Shared logic for creating an academy and its primary admin user."""
# pyrefly: ignore [missing-import]
from django.contrib.auth.hashers import make_password

from .models import Academy, CustomUser


def create_academy_with_admin(
    *,
    academy_name,
    email,
    password,
    username,
    first_name='',
    last_name='',
    phone='',
    club='',
    billing_plan='trial',
):
    """
    Creates an Academy and a CustomUser with role admin linked to it.
    Caller must validate uniqueness of email/username and wrap in transaction if needed.
    """
    academy = Academy.objects.create(
        name=academy_name,
        email=email,
        phone=phone or '',
        billing_plan=billing_plan,
        subscription_status='trial' if billing_plan == 'trial' else 'active',
    )
    user = CustomUser.objects.create(
        username=username,
        email=email,
        password=make_password(password),
        role='admin',
        first_name=first_name or '',
        last_name=last_name or '',
        phone=phone or '',
        club=club or '',
        academy=academy,
    )
    return academy, user
