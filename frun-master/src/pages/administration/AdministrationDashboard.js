import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiUser, FiCalendar, FiCreditCard, FiTarget,
  FiActivity, FiAward, FiArrowRight,
  FiSettings, FiBell, FiClock
} from 'react-icons/fi';
import {
  FaUsers, FaUserTie, FaCalendarCheck, FaChartPie, FaEnvelope
} from 'react-icons/fa';
import API from './api';

// ✅ Convertit une date en "X time ago"
const timeAgo = (dateStr) => {
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

const AdministrationDashboard = ({ players = [], coaches = [], events = [] }) => {
  const navigate = useNavigate();
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [organizationName, setOrganizationName] = useState('Runaini Academy');
  const [recentActivities, setRecentActivities] = useState([]); // ✅ dynamique
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

        // ✅ Génère les activités depuis les données existantes
        const activities = [];

        // Derniers players créés
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

        // Derniers coaches créés
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

        // Derniers groupes créés
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

        // ✅ Trie toutes les activités par date (les plus récentes en premier)
        activities.sort((a, b) => b.date - a.date);

        // ✅ Garde les 5 plus récentes
        setRecentActivities(activities.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalPlayers: players.length,
          totalCoaches: coaches.length,
          totalEvents: events.length,
          activeGroups: 0
        });
        // Fallback activities
        setRecentActivities([
          { message: 'Could not load recent activities', time: 'N/A', icon: <FiBell className="text-gray-400" /> }
        ]);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Players',
      value: stats.totalPlayers,
      icon: <FiUsers className="text-2xl" />,
      color: 'from-[#902bd1] to-[#4fb0ff]',
      trend: 'Active',
      trendColor: 'text-cyan-400'
    },
    {
      label: 'Total Coaches',
      value: stats.totalCoaches,
      icon: <FiUser className="text-2xl" />,
      color: 'from-[#00d0cb] to-[#4fb0ff]',
      trend: 'Active',
      trendColor: 'text-cyan-400'
    },
    {
      label: 'Upcoming Events',
      value: stats.totalEvents,
      icon: <FiCalendar className="text-2xl" />,
      color: 'from-[#4fb0ff] to-[#7c3aed]',
      trend: 'Scheduled',
      trendColor: 'text-blue-400'
    },
    {
      label: 'Active Groups',
      value: stats.activeGroups,
      icon: <FiAward className="text-2xl" />,
      color: 'from-[#902bd1] to-[#7c3aed]',
      trend: 'Groups',
      trendColor: 'text-purple-400'
    }
  ];

  const quickActions = [
    { title: 'Manage Players', description: 'View and manage all players', icon: <FiUsers className="text-2xl" />, color: 'from-[#902bd1] to-[#4fb0ff]', to: '/administration/player-management' },
    { title: 'Manage Coaches', description: 'View and manage coaches', icon: <FiUser className="text-2xl" />, color: 'from-[#00d0cb] to-[#4fb0ff]', to: '/administration/coach-management' },
    { title: 'Create Event', description: 'Schedule a new event', icon: <FiTarget className="text-2xl" />, color: 'from-[#4fb0ff] to-[#7c3aed]', to: '/administration/create-event' },
    { title: 'View Agenda', description: 'Check upcoming events', icon: <FiCalendar className="text-2xl" />, color: 'from-[#902bd1] to-[#7c3aed]', to: '/administration/agenda-management' }
  ];

  const overviewItems = [
    { icon: <FiUsers className="text-[#4fb0ff] text-lg" />, label: 'Players Management', to: '/administration/player-management' },
    { icon: <FaUserTie className="text-[#00d0cb] text-lg" />, label: 'Coaches Management', to: '/administration/coach-management' },
    { icon: <FiCreditCard className="text-[#902bd1] text-lg" />, label: 'Payments & Billing', to: '/administration/payment-management' },
    { icon: <FaEnvelope className="text-yellow-400 text-lg" />, label: 'Contact & Support', to: '/administration/contact' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="min-h-screen text-white p-4 sm:p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 md:mb-10">
          {isLoadingStats ? (
            <div className="h-10 w-80 bg-gray-700/50 rounded animate-pulse mb-2" />
          ) : (
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
              Welcome to {organizationName}
            </h1>
          )}
          <p className="text-gray-300 mt-2 text-lg">Administration Dashboard</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div key={index} variants={itemVariants} whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-700/50 hover:border-gray-600 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  {isLoadingStats ? (
                    <div className="mt-2 h-8 w-12 bg-gray-700/50 rounded animate-pulse" />
                  ) : (
                    <p className="text-2xl md:text-3xl font-bold text-white mt-2">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <FiActivity className={`mr-1.5 ${stat.trendColor}`} />
                <span className={stat.trendColor}>{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
            <FiSettings className="text-[#4fb0ff]" />Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <motion.div key={index} variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.to)}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-4 md:p-5 cursor-pointer border border-gray-700/50 hover:border-gray-600 transition-all group">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3 md:mb-4 group-hover:scale-110 transition-transform w-fit`}>
                  <div className="text-white">{action.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 md:mb-2">{action.title}</h3>
                <p className="text-gray-400 text-sm mb-3 md:mb-4">{action.description}</p>
                <div className="flex items-center text-gray-400 font-medium group-hover:text-white transition-colors">
                  <span className="text-sm">Go to</span>
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ✅ Recent Activity — dynamique */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}
            className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
              <FiBell className="text-yellow-400" />Recent Activity
            </h2>
            <div className="space-y-3 md:space-y-4">
              {isLoadingStats ? (
                // Skeleton loader
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl">
                    <div className="w-10 h-10 bg-gray-700/50 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-700/50 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <motion.div key={index} whileHover={{ x: 4 }}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all">
                    <div className="p-2 md:p-3 rounded-lg bg-gray-800/50">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.message}</p>
                      <p className="text-gray-400 text-sm mt-1 flex items-center">
                        <FiClock className="mr-1.5" />{activity.time}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No recent activity yet
                </div>
              )}
            </div>
          </motion.div>

          {/* System Overview */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}
            className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
              <FaChartPie className="text-[#10B981]" />System Overview
            </h2>
            <div className="space-y-3 md:space-y-4">
              {overviewItems.map((item, index) => (
                <motion.div key={index} whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-white">{item.label}</span>
                  </div>
                  <button onClick={() => navigate(item.to)}
                    className="text-gray-400 hover:text-white font-medium text-sm flex items-center">
                    View<FiArrowRight className="ml-1.5 text-xs" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Footer */}
        <motion.div variants={itemVariants}
          className="mt-6 md:mt-8 bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: '98%', label: 'System Uptime' },
              { value: '24/7', label: 'Support Available' },
              { value: '99.9%', label: 'Data Security' },
              { value: '30+', label: 'Active Sessions' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{item.value}</div>
                <div className="text-gray-400 text-sm mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AdministrationDashboard;