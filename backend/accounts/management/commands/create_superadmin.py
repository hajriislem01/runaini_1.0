from django.apps import apps
from django.contrib.auth.hashers import make_password

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a platform user with role superadmin (for /super-admin-portal)."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, type=str)
        parser.add_argument("--password", required=True, type=str)
        parser.add_argument(
            "--username",
            type=str,
            default="",
            help="Defaults to the part of the email before @ if omitted.",
        )

    def handle(self, *args, **options):
        CustomUser = apps.get_model("accounts", "CustomUser")
        email = options["email"].strip().lower()
        password = options["password"]
        username = (options["username"] or "").strip() or email.split("@")[0]

        if CustomUser.objects.filter(email=email).exists():
            self.stderr.write(self.style.ERROR(f"A user with email {email} already exists."))
            return

        CustomUser.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            role="superadmin",
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Super admin created: {email} (role=superadmin)."))
