# accounts/migrations/0011_playerprofile_group.py
from django.db import migrations, models
import django.db.models.deletion

def set_default_group(apps, schema_editor):
    PlayerProfile = apps.get_model('accounts', 'PlayerProfile')
    Group = apps.get_model('accounts', 'Group')
    
    # Choisir un groupe existant ou en créer un
    default_group = Group.objects.first()
    if not default_group:
        default_group = Group.objects.create(name='Default Group')
    
    # Assigner ce groupe à tous les joueurs existants
    for player in PlayerProfile.objects.all():
        if player.group is None:
            player.group = default_group
            player.save()

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_remove_group_players_remove_playerprofile_group_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerprofile',
            name='group',
            field=models.ForeignKey(
                to='accounts.Group',
                null=True,  # temporaire pour permettre la migration
                blank=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='players',
            ),
        ),
        migrations.RunPython(set_default_group),
        migrations.AlterField(
            model_name='playerprofile',
            name='group',
            field=models.ForeignKey(
                to='accounts.Group',
                null=False,  # rendre obligatoire après avoir rempli les valeurs
                on_delete=django.db.models.deletion.PROTECT,
                related_name='players',
            ),
        ),
    ]
