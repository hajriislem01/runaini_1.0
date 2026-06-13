import { useState, useEffect } from 'react';
import { FaUsers, FaUserTie, FaCalendarCheck } from 'react-icons/fa';
import { FiBell } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import API from '../../api';

export const timeAgo = (dateStr, t) => {
  if (!dateStr) return t('time.recently');
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return t('time.secondsAgo', { count: diff });
  if (diff < 3600) return t('time.minutesAgo', { count: Math.floor(diff / 60) });
  if (diff < 86400) return t('time.hoursAgo', { count: Math.floor(diff / 3600) });
  if (diff < 604800) return t('time.daysAgo', { count: Math.floor(diff / 86400) });
  return date.toLocaleDateString();
};

export const useDashboardStats = (players = [], coaches = [], events = []) => {
  const { t } = useTranslation('administrationdashboard');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [organizationName, setOrganizationName] = useState('Runaini Academy');
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalCoaches: 0,
    totalEvents: 0,
    activeGroups: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const [playersRes, coachesRes, groupsRes, academyRes, eventsRes] = await Promise.all([
          API.get('players/'),
          API.get('coaches/'),
          API.get('groups/'),
          API.get('academy/'),
          API.get('events/')
        ]);

        const playersData = playersRes.data;
        const coachesData = coachesRes.data;
        const groupsData  = groupsRes.data;
        const eventsData  = eventsRes.data;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingCount = eventsData.filter(e => {
          const d = new Date(e.date);
          return !isNaN(d) && d >= today && e.status !== 'completed' && e.status !== 'cancelled';
        }).length;

        setStats({
          totalPlayers: playersData.length,
          totalCoaches: coachesData.length,
          totalEvents:  upcomingCount,
          activeGroups: groupsData.length
        });

        setOrganizationName(academyRes.data.name || 'Runaini Academy');

        const activities = [];

        [...playersData]
          .sort((a, b) => new Date(b.user?.date_joined || 0) - new Date(a.user?.date_joined || 0))
          .slice(0, 2)
          .forEach(player => {
            activities.push({
              message: t('activity.newPlayer', { name: player.full_name }),
              time: timeAgo(player.user?.date_joined, t),
              icon: <FaUsers className="text-[#4fb0ff]" />,
              date: new Date(player.user?.date_joined || 0)
            });
          });

        [...coachesData]
          .sort((a, b) => new Date(b.date_joined || 0) - new Date(a.date_joined || 0))
          .slice(0, 2)
          .forEach(coach => {
            activities.push({
              message: t('activity.coachAdded', { name: coach.username }),
              time: timeAgo(coach.date_joined, t),
              icon: <FaUserTie className="text-[#902bd1]" />,
              date: new Date(coach.date_joined || 0)
            });
          });

        [...groupsData]
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 2)
          .forEach(group => {
            activities.push({
              message: t('activity.newGroup', { name: group.name }),
              time: timeAgo(group.created_at, t),
              icon: <FaCalendarCheck className="text-[#00d0cb]" />,
              date: new Date(group.created_at || 0)
            });
          });

        activities.sort((a, b) => b.date - a.date);
        setRecentActivities(activities.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalPlayers: players.length,
          totalCoaches: coaches.length,
          totalEvents: events.length,
          activeGroups: 0
        });
        setRecentActivities([
          { message: t('activity.loadError'), time: 'N/A', icon: <FiBell className="text-gray-400" /> }
        ]);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, [coaches.length, events.length, players.length, t]);

  return { stats, recentActivities, isLoadingStats, organizationName };
};
