from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import PlayerProfile, PlayerAttendance, Group, SubGroup, Notification
from .serializers import PlayerAttendanceSerializer
from .permissions import IsCoach, IsAdmin, IsPlayer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsCoach])
def get_coach_attendance_players(request):
    """
    Returns existing attendance records for a given date and group,
    so the frontend can pre-populate the status toggles.
    The player list itself is fetched client-side via the same players/ and groups/
    endpoints used by PlayerManagement — no duplication needed here.
    """
    group_id    = request.query_params.get('group_id')
    subgroup_id = request.query_params.get('subgroup_id')
    date_str    = request.query_params.get('date')

    if not group_id or not date_str:
        return Response({'error': 'group_id and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

    academy = request.user.academy

    # Only look up records that belong to this academy and group
    records = PlayerAttendance.objects.filter(
        academy=academy,
        group_id=group_id,
        date=date_str,
    )
    if subgroup_id:
        records = records.filter(subgroup_id=subgroup_id)

    # Return a simple map: player_id → {status, notes}
    # The frontend already has the full player list from players/
    results = [
        {
            'player_id': rec.player_id,
            'status':    rec.status,
            'notes':     rec.notes or '',
        }
        for rec in records
    ]
    return Response(results)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsCoach])
def mark_attendance(request):
    """
    Submit attendance for a group of players.
    Body:
    {
        "group_id": 1,
        "subgroup_id": null,
        "date": "2026-07-09",
        "attendances": [
            {"player_id": 1, "status": "Present", "notes": ""},
            {"player_id": 2, "status": "Absent", "notes": "Sick"}
        ]
    }
    """
    academy = request.user.academy
    coach_profile = getattr(request.user, 'coach_profile', None)
    
    data = request.data
    group_id = data.get('group_id')
    subgroup_id = data.get('subgroup_id')
    date_str = data.get('date')
    attendances_data = data.get('attendances', [])

    if not group_id or not date_str or not coach_profile:
        return Response({'error': 'Missing required fields or not a coach.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        group = Group.objects.get(id=group_id, academy=academy)
        subgroup = SubGroup.objects.get(id=subgroup_id, group=group) if subgroup_id else None
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)
    except SubGroup.DoesNotExist:
        return Response({'error': 'Subgroup not found.'}, status=status.HTTP_404_NOT_FOUND)

    for item in attendances_data:
        player_id = item.get('player_id')
        player_status = item.get('status')
        notes = item.get('notes', '')

        try:
            player = PlayerProfile.objects.get(id=player_id, academy=academy)
        except PlayerProfile.DoesNotExist:
            continue

        att, created = PlayerAttendance.objects.update_or_create(
            player=player,
            date=date_str,
            defaults={
                'coach': coach_profile,
                'group': group,
                'subgroup': subgroup,
                'academy': academy,
                'status': player_status,
                'notes': notes,
            }
        )
        
        # Optionally create notification for the player
        if created or att.status != player_status:
            Notification.objects.create(
                user=player.user,
                title="Attendance Marked",
                message=f"Your attendance for {date_str} has been marked as {player_status}.",
                event_type="session"
            )

    return Response({'message': 'Attendance saved successfully.'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdmin])
def get_admin_attendance_report(request):
    """
    Admin report for attendance.
    Supports filtering by date, group_id, subgroup_id.
    """
    academy = request.user.academy
    date_str = request.query_params.get('date')
    group_id = request.query_params.get('group_id')
    subgroup_id = request.query_params.get('subgroup_id')

    queryset = PlayerAttendance.objects.filter(academy=academy).select_related(
        'player', 'coach__user', 'group', 'subgroup'
    )

    if date_str:
        queryset = queryset.filter(date=date_str)
    if group_id:
        queryset = queryset.filter(group_id=group_id)
    if subgroup_id:
        queryset = queryset.filter(subgroup_id=subgroup_id)

    serializer = PlayerAttendanceSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPlayer])
def get_player_my_attendance(request):
    """
    Player viewing their own attendance.
    """
    player = getattr(request.user, 'player_profile', None)
    if not player:
        return Response({'error': 'Player profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    attendances = PlayerAttendance.objects.filter(player=player).select_related(
        'player', 'coach__user', 'group', 'subgroup'
    ).order_by('-date')
    serializer = PlayerAttendanceSerializer(attendances, many=True)
    
    # Calculate stats
    total = attendances.count()
    present_count = attendances.filter(status='Present').count()
    absent_count = attendances.filter(status='Absent').count()
    excused_count = attendances.filter(status='Excused').count()
    late_count = attendances.filter(status='Late').count()
    
    stats = {
        'total': total,
        'present': present_count,
        'absent': absent_count,
        'excused': excused_count,
        'late': late_count,
        'attendance_percentage': round((present_count / total * 100), 2) if total > 0 else 0
    }
    
    return Response({
        'stats': stats,
        'history': serializer.data
    })
