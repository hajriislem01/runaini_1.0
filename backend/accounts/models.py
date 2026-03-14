from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError


class Academy(models.Model):
    name = models.CharField(max_length=100)
    founded = models.CharField(max_length=4, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    colors = models.CharField(max_length=100, blank=True, null=True)
    philosophy = models.TextField(blank=True, null=True)
    achievements = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='academy/logos/', blank=True, null=True)

    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)

    home_kit = models.ImageField(upload_to='academy/kits/', blank=True, null=True)
    away_kit = models.ImageField(upload_to='academy/kits/', blank=True, null=True)

    technical_director = models.CharField(max_length=100, blank=True, null=True)
    head_coach_name = models.CharField(max_length=100, blank=True, null=True)
    fitness_coach = models.CharField(max_length=100, blank=True, null=True)
    medical_staff = models.CharField(max_length=100, blank=True, null=True)

    stadium_name = models.CharField(max_length=100, blank=True, null=True)
    stadium_location = models.CharField(max_length=100, blank=True, null=True)
    has_gym = models.BooleanField(default=False)
    has_cafeteria = models.BooleanField(default=False)
    has_dormitory = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('coach', 'Coach'),
        ('player', 'Player'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='admin')
    phone = models.CharField(max_length=20, blank=True, null=True)
    club = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)

    # ✅ Lien vers l'académie
    academy = models.ForeignKey(
        Academy,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class CoachProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='coach_profile'
    )
    specialization = models.CharField(max_length=255, blank=True, null=True)
    years_of_experience = models.PositiveIntegerField(blank=True, null=True)
    certification = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[('Active', 'Active'), ('Inactive', 'Inactive'), ('On Leave', 'On Leave')],
        default='Active'
    )
    address = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Coach Profile: {self.user.username}"


class Group(models.Model):
    name = models.CharField(max_length=100)
    coach = models.ForeignKey(
        CoachProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="groups"
    )
    # ✅ Lien vers l'académie
    academy = models.ForeignKey(
        Academy,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='groups'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # ✅ Nom unique par académie
        unique_together = [['name', 'academy']]

    def __str__(self):
        return self.name


class SubGroup(models.Model):
    name = models.CharField(max_length=100)
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="subgroups"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["group", "name"],
                name="unique_subgroup_per_group"
            )
        ]
        indexes = [
            models.Index(fields=["group", "name"])
        ]

    def __str__(self):
        return f"{self.group.name} - {self.name}"


class PlayerProfile(models.Model):
    POSITION_CHOICES = [
        ('Midfielder', 'Milieu'),
        ('Defender', 'Défenseur'),
        ('Forward', 'Attaquant'),
        ('Goalkeeper', 'Gardien'),
    ]

    STATUS_CHOICES = [
        ('Active', 'Actif'),
        ('Inactive', 'Inactif'),
        ('Injured', 'Blessé')
    ]

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='player_profile'
    )
    full_name = models.CharField(max_length=100)
    height = models.DecimalField(max_digits=5, decimal_places=2)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    position = models.CharField(max_length=20, choices=POSITION_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    group = models.ForeignKey(
        Group,
        on_delete=models.PROTECT,
        related_name="players"
    )
    subgroup = models.ForeignKey(
        SubGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="players"
    )
    # ✅ Lien vers l'académie
    academy = models.ForeignKey(
        Academy,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='players'
    )

    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def clean(self):
        if self.subgroup and self.group:
            if self.subgroup.group != self.group:
                raise ValidationError("SubGroup must belong to selected Group")

    def __str__(self):
        return self.full_names