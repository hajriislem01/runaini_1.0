# Generated manually for academy leads, billing_plan, superadmin role

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    atomic = False

    dependencies = [
        ('accounts', '0033_remove_academy_colors'),
    ]

    operations = [
        migrations.AddField(
            model_name='academy',
            name='billing_plan',
            field=models.CharField(
                choices=[
                    ('trial', 'Trial'),
                    ('starter', 'Starter'),
                    ('pro', 'Pro'),
                    ('enterprise', 'Enterprise'),
                ],
                default='trial',
                help_text='Commercial plan assigned at onboarding.',
                max_length=20,
            ),
        ),
        migrations.CreateModel(
            name='AcademyLeadRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contact_name', models.CharField(max_length=200)),
                ('academy_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(max_length=40)),
                (
                    'status',
                    models.CharField(
                        choices=[
                            ('pending', 'Pending'),
                            ('approved', 'Approved'),
                            ('rejected', 'Rejected'),
                        ],
                        default='pending',
                        max_length=20,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                (
                    'created_academy',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='source_lead',
                        to='accounts.academy',
                    ),
                ),
                (
                    'processed_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='processed_academy_leads',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                choices=[
                    ('superadmin', 'Super Admin'),
                    ('admin', 'Admin'),
                    ('coach', 'Coach'),
                    ('player', 'Player'),
                ],
                default='admin',
                max_length=20,
            ),
        ),
    ]
