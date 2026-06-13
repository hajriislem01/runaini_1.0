# Academy subscription_status + lead archived status

from django.db import migrations, models


def sync_subscription_status(apps, schema_editor):
    Academy = apps.get_model('accounts', 'Academy')
    for a in Academy.objects.all():
        if a.billing_plan == 'trial':
            a.subscription_status = 'trial'
        else:
            a.subscription_status = 'active'
        a.save(update_fields=['subscription_status'])


class Migration(migrations.Migration):

    atomic = False

    dependencies = [
        ('accounts', '0034_academy_leads_superadmin'),
    ]

    operations = [
        migrations.AddField(
            model_name='academy',
            name='subscription_status',
            field=models.CharField(
                choices=[
                    ('active', 'Active'),
                    ('trial', 'Trial period'),
                    ('past_due', 'Past due'),
                    ('suspended', 'Suspended'),
                    ('cancelled', 'Cancelled'),
                ],
                default='active',
                help_text='Billing / access state for the academy.',
                max_length=20,
            ),
        ),
        migrations.RunPython(sync_subscription_status, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='academyleadrequest',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('approved', 'Approved'),
                    ('rejected', 'Rejected'),
                    ('archived', 'Archived'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
