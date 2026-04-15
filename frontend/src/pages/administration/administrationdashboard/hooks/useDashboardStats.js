import { useState, useEffect } from 'react';
import { FaUsers, FaUserTie, FaCalendarCheck } from 'react-icons/fa';
import { FiBell } from 'react-icons/fi';
import API from '../../api';

export const timeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
};

export const useDashboardStats = (players = [], coaches = [], events = []) => {
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
        const [playersRes, coachesRes, groupsRes, academyRes] = await Promise.all([
          API.get('players/'),
          API.get('coaches/'),
          API.get('groups/'),
          API.get('academy/')
        ]);

        const playersData = playersRes.data;
        const coachesData = coachesRes.data;
        const groupsData = groupsRes.data;

        setStats({
          totalPlayers: playersData.length,
          totalCoaches: coachesData.length,
          totalEvents: events.length,
          activeGroups: groupsData.length
        });

        setOrganizationName(academyRes.data.name || 'Runaini Academy');

        const activities = [];

        [...playersData]
          .sort((a, b) => new Date(b.user?.date_joined || 0) - new Date(a.user?.date_joined || 0))
          .slice(0, 2)
          .forEach(player => {
            activities.push({
              message: `New player registered: ${player.full_name}`,
              time: timeAgo(player.user?.date_joined),
              icon: <FaUsers className="text-[#4fb0ff]" />,
              date: new Date(player.user?.date_joined || 0)
            });
          });

        [...coachesData]
          .sort((a, b) => new Date(b.date_joined || 0) - new Date(a.date_joined || 0))
          .slice(0, 2)
          .forEach(coach => {
            activities.push({
              message: `Coach added: ${coach.username}`,
              time: timeAgo(coach.date_joined),
              icon: <FaUserTie className="text-[#902bd1]" />,
              date: new Date(coach.date_joined || 0)
            });
          });

        [...groupsData]
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 2)
          .forEach(group => {
            activities.push({
              message: `New group created: ${group.name}`,
              time: timeAgo(group.created_at),
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
          { message: 'Could not load recent activities', time: 'N/A', icon: <FiBell className="text-gray-400" /> }
        ]);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, [coaches.length, events.length, players.length]);

  return { stats, recentActivities, isLoadingStats, organizationName };
};
