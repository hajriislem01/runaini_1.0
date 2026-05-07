from .models import CustomUser, CoachProfile, PlayerProfile, Academy, Notification, TrainingSession, Event
from django.db.models.signals import post_save, pre_save, m2m_changed
from django.dispatch import receiver
from django.core.files.storage import default_storage

# --- Profiling & Relationship Management ---

@receiver(post_save, sender=CustomUser)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'coach' and not hasattr(instance, 'coach_profile'):
            CoachProfile.objects.create(user=instance)
        elif instance.role == 'player' and not hasattr(instance, 'player_profile'):
            PlayerProfile.objects.create(user=instance, full_name=instance.get_full_name())
    else:
        if instance.role == 'coach':
            if not hasattr(instance, 'coach_profile'):
                CoachProfile.objects.create(user=instance)
            if hasattr(instance, 'player_profile'):
                instance.player_profile.delete()
        elif instance.role == 'player':
            if not hasattr(instance, 'player_profile'):
                PlayerProfile.objects.create(user=instance, full_name=instance.get_full_name())
            if hasattr(instance, 'coach_profile'):
                instance.coach_profile.delete()


# --- Media Cleanup Logic ---

def delete_old_file(instance, field_name):
    """Helper to delete old files from storage when updated or removed."""
    if not instance.pk:
        return
    
    try:
        old_instance = instance.__class__.objects.get(pk=instance.pk)
        old_file = getattr(old_instance, field_name)
        new_file = getattr(instance, field_name)

        if old_file and old_file != new_file:
            if default_storage.exists(old_file.name):
                default_storage.delete(old_file.name)
    except Exception:
        pass

@receiver(pre_save, sender=Academy)
def academy_media_cleanup(sender, instance, **kwargs):
    delete_old_file(instance, 'logo')
    delete_old_file(instance, 'home_kit')
    delete_old_file(instance, 'away_kit')

@receiver(pre_save, sender=CoachProfile)
def coach_photo_cleanup(sender, instance, **kwargs):
    delete_old_file(instance, 'photo')

@receiver(pre_save, sender=PlayerProfile)
def player_photo_cleanup(sender, instance, **kwargs):
    delete_old_file(instance, 'photo')


# --- Smart Notification Logic ---

def create_notification(user, title, message, event_id, event_type):
    """Helper to create a notification if it doesn't already exist for this event."""
    if not user: return
    Notification.objects.get_or_create(
        user=user,
        event_id=str(event_id),
        event_type=event_type,
        defaults={
            'title': title,
            'message': message,
            'is_read': False
        }
    )

@receiver(post_save, sender=TrainingSession)
def notify_training_session_creation(sender, instance, created, **kwargs):
    """
    Coach -> Admin: Notify Admin of new training.
    Coach -> Player: Notify explicitly selected players in exercises.
    """
    if created:
        # 1. Notify Admins in the academy
        admins = CustomUser.objects.filter(academy=instance.academy, role='admin')
        for admin in admins:
            create_notification(
                admin,
                "New Training Created",
                f"Coach {instance.coach.user.get_full_name() if instance.coach else 'System'} created '{instance.title}' for {instance.date}.",
                instance.id,
                'session'
            )
        
        # 2. Notify explicitly selected players (from JSON exercises)
        selected_player_ids = set()
        for ex in (instance.exercises or []):
            assigned = ex.get('assigned_players', [])
            for pid in assigned:
                try:
                    selected_player_ids.add(int(pid))
                except (ValueError, TypeError):
                    pass
        
        if selected_player_ids:
            players = PlayerProfile.objects.filter(id__in=selected_player_ids)
            for player in players:
                create_notification(
                    player.user,
                    "Training Assignment",
                    f"You have been specifically assigned to an exercise in '{instance.title}' on {instance.date}.",
                    instance.id,
                    'session'
                )

def send_event_notifications(event):
    """
    Called after Event M2M fields are saved.
    Enforces strict hierarchy: If a subgroup is selected, we only notify members of the subgroup.
    """
    selected_subgroups = event.subgroups.select_related('group').all()
    selected_subgroups_group_ids = [sg.group.id for sg in selected_subgroups]
    
    # 1. Target Coaches
    for coach in event.target_coaches.all():
        create_notification(coach.user, f"New {event.type} Assigned", f"You have been assigned to '{event.title}'.", event.id, 'event')
        
    # 2. Target Players
    for player in event.target_players.all():
        create_notification(player.user, f"New {event.type} Invitation", f"You have been invited to '{event.title}'.", event.id, 'event')
        
    # 3. Groups (that don't have subgroups selected)
    for g in event.groups.all():
        if g.id in selected_subgroups_group_ids:
            continue
            
        coaches = set(list(g.assigned_coaches.all()) + list(g.full_access_coaches.all()))
        for sg in g.subgroups.all():
            coaches.update(sg.assigned_coaches.all())
            
        for coach in coaches:
            create_notification(coach.user, f"New {event.type} for {g.name}", f"A new event '{event.title}' has been scheduled for {g.name}.", event.id, 'event')
            
        for player in g.players.all():
            create_notification(player.user, f"New {event.type} for {g.name}", f"A new event '{event.title}' has been scheduled for {g.name}.", event.id, 'event')

    # 4. Subgroups
    for sg in selected_subgroups:
        group_name_full = f"{sg.group.name} - {sg.name}"
        coaches = set(list(sg.assigned_coaches.all()) + list(sg.group.full_access_coaches.all()))
        for coach in coaches:
            create_notification(coach.user, f"New {event.type} for {group_name_full}", f"A new event '{event.title}' has been scheduled for {group_name_full}.", event.id, 'event')
            
        for player in sg.players.all():
            create_notification(player.user, f"New {event.type} for {group_name_full}", f"A new event '{event.title}' has been scheduled for {group_name_full}.", event.id, 'event')
