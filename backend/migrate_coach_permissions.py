import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import Group, SubGroup, CoachProfile

def migrate():
    print("🚀 Starting Coach Permission Migration...")
    
    # 1. Migrate Group coaches
    groups = Group.objects.all()
    group_count = 0
    for g in groups:
        if g.coach:
            # Add to M2M on CoachProfile side
            g.coach.assigned_groups.add(g)
            g.coach.full_access_groups.add(g)
            group_count += 1
            print(f"  [Group] Migrated {g.name} -> Coach {g.coach.user.username}")

    # 2. Migrate SubGroup coaches
    subgroups = SubGroup.objects.all()
    subgroup_count = 0
    for sg in subgroups:
        if sg.coach:
            # Add to M2M on CoachProfile side
            sg.coach.assigned_subgroups.add(sg)
            # Ensure the parent group is also in assigned_groups
            sg.coach.assigned_groups.add(sg.group)
            subgroup_count += 1
            print(f"  [SubGroup] Migrated {sg.name} -> Coach {sg.coach.user.username}")

    print(f"✅ Migration Complete! Migrated {group_count} Groups and {subgroup_count} SubGroups.")

if __name__ == "__main__":
    migrate()
