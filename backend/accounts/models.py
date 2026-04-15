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
    photo = models.ImageField(upload_to='coach_photos/', null=True, blank=True)
    bio   = models.TextField(blank=True)
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
    photo = models.ImageField(upload_to='player_photos/', null=True, blank=True)
    bio   = models.TextField(blank=True)
    def clean(self):
        if self.subgroup and self.group:
            if self.subgroup.group != self.group:
                raise ValidationError("SubGroup must belong to selected Group")

    def __str__(self):
        return self.full_name
    

class Event(models.Model):
    TYPE_CHOICES = [
        ('Match Friendly', 'Match Friendly'),
        ('Tournament', 'Tournament'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Match Friendly')
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    target_academy = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    winner = models.CharField(max_length=200, blank=True, null=True)

    group = models.ForeignKey(
        'Group',
        on_delete=models.CASCADE,
        related_name='events'
    )
    subgroup = models.ForeignKey(
        'SubGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='events'
    )
    academy = models.ForeignKey(
        'Academy',
        on_delete=models.CASCADE,
        related_name='events'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.title} ({self.type})"


class EventParticipant(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    player = models.ForeignKey(
        'PlayerProfile',
        on_delete=models.CASCADE,
        related_name='event_participations'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['event', 'player']]

    def __str__(self):
        return f"{self.player.full_name} - {self.event.title}"



class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('check', 'Check'),
        ('online', 'Online Payment'),
    ]

    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Late', 'Late'),
    ]

    player = models.ForeignKey(
        'PlayerProfile',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    academy = models.ForeignKey(
        'Academy',
        on_delete=models.CASCADE,
        related_name='payments'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    month = models.CharField(max_length=7)  # format: "2026-03"
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Completed')
    receipt = models.FileField(upload_to='payments/receipts/', blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-payment_date', '-created_at']
        # ✅ Un joueur ne peut payer qu'une fois par mois
        unique_together = [['player', 'month']]

    def __str__(self):
        return f"{self.player.full_name} - {self.month} - {self.amount}"
    

class PlayerReport(models.Model):
    """Évaluation mensuelle d'un joueur par son coach"""
 
    # ── Relations ────────────────────────────────────────────────────────────
    player  = models.ForeignKey(
        'PlayerProfile',
        on_delete=models.CASCADE,
        related_name='reports'
    )
    coach   = models.ForeignKey(
        'CoachProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reports'
    )
    academy = models.ForeignKey(
        'Academy',
        on_delete=models.CASCADE,
        related_name='reports'
    )
 
    # ── Mois ─────────────────────────────────────────────────────────────────
    month = models.CharField(max_length=7)  # "2026-03"
 
    # ── Pilier 1 — Technical & Tactical (coach) ───────────────────────────────
    technical_scores = models.JSONField(default=dict, blank=True)
    technical_avg    = models.FloatField(default=0)
 
    tactical_scores  = models.JSONField(default=dict, blank=True)
    tactical_avg     = models.FloatField(default=0)
 
    # ── Pilier 2 — Physical & Mental (coach + player) ─────────────────────────
    physical_scores  = models.JSONField(default=dict, blank=True)
    physical_avg     = models.FloatField(default=0)
 
    mental_scores    = models.JSONField(default=dict, blank=True)
    mental_avg       = models.FloatField(default=0)
 
    # Player self-report
    fatigue_level    = models.IntegerField(null=True, blank=True)   # 1-5
    sleep_quality    = models.IntegerField(null=True, blank=True)   # 1-5
    pain_location    = models.CharField(max_length=100, blank=True)
 
    # ── Pilier 3 — Health & Academic (admin + player) ─────────────────────────
    is_injured        = models.BooleanField(default=False)
    injury_details    = models.TextField(blank=True)
    medical_cert_valid= models.BooleanField(default=True)
 
    school_grade_avg  = models.FloatField(null=True, blank=True)   # /20
    school_attendance = models.FloatField(null=True, blank=True)   # %
    school_behaviour  = models.IntegerField(null=True, blank=True) # 1-10
 
    # ── Score global (calculé automatiquement) ────────────────────────────────
    overall_score = models.FloatField(default=0)
 
    # ── Textes obligatoires ───────────────────────────────────────────────────
    strength   = models.TextField()
    to_improve = models.TextField()
    objective  = models.TextField()
    comment    = models.TextField(blank=True)
 
    # ── Présence ──────────────────────────────────────────────────────────────
    attendance_present = models.IntegerField(default=0)
    attendance_total   = models.IntegerField(default=0)
 
    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        ordering       = ['-month', '-created_at']
        unique_together = [['player', 'month']]
 
    def __str__(self):
        return f"{self.player.full_name} — {self.month}"
 
    def compute_overall(self):
        """Calcule le score global à partir des 4 piliers"""
        scores = [self.technical_avg, self.tactical_avg, self.physical_avg, self.mental_avg]
        valid  = [s for s in scores if s and s > 0]
        self.overall_score = round(sum(valid) / len(valid), 1) if valid else 0.0
 
    def save(self, *args, **kwargs):
        self.compute_overall()
        super().save(*args, **kwargs)

class TrainingSession(models.Model):
    """Séance d'entraînement créée par un coach"""
 
    CATEGORY_CHOICES = [
        ('technical',  'Technical'),
        ('tactical',   'Tactical'),
        ('physical',   'Physical'),
        ('mental',     'Mental'),
        ('match_prep', 'Match Prep'),
        ('recovery',   'Recovery'),
    ]
 
    LEVEL_CHOICES = [
        ('A', 'A — Beginner'),
        ('B', 'B — Intermediate'),
        ('C', 'C — Advanced'),
        ('D', 'D — Elite'),
    ]
 
    RECURRENCE_CHOICES = [
        ('none',      'No recurrence'),
        ('weekly',    'Weekly'),
        ('biweekly',  'Every 2 weeks'),
        ('monthly',   'Monthly'),
    ]
 
    # ── Relations ────────────────────────────────────────────────────────────
    coach   = models.ForeignKey(
        'CoachProfile',
        on_delete=models.CASCADE,
        related_name='training_sessions'
    )
    academy = models.ForeignKey(
        'Academy',
        on_delete=models.CASCADE,
        related_name='training_sessions'
    )
 
    # ── Participants ──────────────────────────────────────────────────────────
    groups    = models.ManyToManyField('Group',    blank=True, related_name='training_sessions')
    subgroups = models.ManyToManyField('SubGroup', blank=True, related_name='training_sessions')
 
    # ── Détails ───────────────────────────────────────────────────────────────
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='technical')
    level       = models.CharField(max_length=1,  choices=LEVEL_CHOICES,    default='B')
    location    = models.CharField(max_length=200, blank=True, default='Main Field')
 
    # ── Horaire ───────────────────────────────────────────────────────────────
    date       = models.DateField()
    start_time = models.TimeField()
    end_time   = models.TimeField()
 
    
    exercises = models.JSONField(default=list, blank=True)
 
    # ── Récurrence ────────────────────────────────────────────────────────────
    recurrence      = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, default='none')
    recurrence_days = models.JSONField(default=list, blank=True)  # ["Mon","Wed","Fri"]
    recurrence_end  = models.DateField(null=True, blank=True)
 
    # ── Parent (pour séances générées par récurrence) ─────────────────────────
    parent_session = models.ForeignKey(
        'self',
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='recurring_sessions'
    )
 
    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        ordering = ['date', 'start_time']
 
    def __str__(self):
        return f"{self.title} — {self.date}"
 
    @property
    def duration_minutes(self):
        """Durée calculée en minutes"""
        from datetime import datetime
        start = datetime.combine(self.date, self.start_time)
        end   = datetime.combine(self.date, self.end_time)
        return int((end - start).total_seconds() / 60)
 
    @property
    def total_exercise_duration(self):
        """Durée totale des exercices en minutes"""
        return sum(ex.get('duration', 0) for ex in (self.exercises or []))
 
    @property
    def individual_exercises(self):
        """Exercices assignés à un joueur spécifique"""
        return [ex for ex in (self.exercises or []) if ex.get('assigned_to') != 'all']
 
    @property
    def group_exercises(self):
        """Exercices pour tout le groupe"""
        return [ex for ex in (self.exercises or []) if ex.get('assigned_to') == 'all']
    

class ExerciseTemplate(models.Model):
    """
    Bibliothèque d'exercices réutilisables.
    - is_default=True  → exercices pré-chargés par Runaini (visibles par tous)
    - is_default=False → exercices créés par le coach (visibles par lui seul)
    """
 
    CATEGORY_CHOICES = [
        ('technical',  'Technical'),
        ('tactical',   'Tactical'),
        ('physical',   'Physical'),
        ('mental',     'Mental'),
        ('match_prep', 'Match Prep'),
        ('recovery',   'Recovery'),
    ]
 
    INTENSITY_CHOICES = [
        ('low',    'Low'),
        ('medium', 'Medium'),
        ('high',   'High'),
    ]
 
    # ── Identité ──────────────────────────────────────────────────────────────
    name         = models.CharField(max_length=200)
    category     = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='technical')
    intensity    = models.CharField(max_length=10, choices=INTENSITY_CHOICES, default='medium')
    duration     = models.IntegerField(default=15, help_text="Duration in minutes")
    sets         = models.IntegerField(default=3)
    reps         = models.IntegerField(default=10)
    instructions = models.TextField(blank=True)
 
    # ── Ownership ─────────────────────────────────────────────────────────────
    is_default = models.BooleanField(default=False)   # pré-chargé Runaini
    coach      = models.ForeignKey(
        'CoachProfile', null=True, blank=True,
        on_delete=models.CASCADE, related_name='exercise_templates'
    )
    academy = models.ForeignKey(
        'Academy', null=True, blank=True,
        on_delete=models.CASCADE, related_name='exercise_templates'
    )
 
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ['category', 'name']
 
    def __str__(self):
        return f"{self.name} ({self.category})"