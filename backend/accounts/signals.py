from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, CoachProfile, PlayerProfile


@receiver(post_save, sender=CustomUser)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'coach' and not hasattr(instance, 'coach_profile'):
            CoachProfile.objects.create(user=instance)
        elif instance.role == 'player' and not hasattr(instance, 'player_profile'):
            PlayerProfile.objects.create(user=instance, full_name=instance.get_full_name())
    else:
        # Si rôle a changé, tu peux envisager de supprimer le profil de l'ancien rôle,
        # mais fais attention à ne pas supprimer si pas voulu.
        if instance.role == 'coach':
            if not hasattr(instance, 'coach_profile'):
                CoachProfile.objects.create(user=instance)
            # Optionnel: supprimer player_profile si existe
            if hasattr(instance, 'player_profile'):
                instance.player_profile.delete()
        elif instance.role == 'player':
            if not hasattr(instance, 'player_profile'):
                PlayerProfile.objects.create(user=instance, full_name=instance.get_full_name())
            # Optionnel: supprimer coach_profile si existe
            if hasattr(instance, 'coach_profile'):
                instance.coach_profile.delete()
