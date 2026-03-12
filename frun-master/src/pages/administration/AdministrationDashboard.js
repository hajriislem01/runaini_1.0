import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileContext } from '../../context/ProfileContext';
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

const AdministrationDashboard = ({ players = [], coaches = [], events = [] }) => {
  const navigate = useNavigate();
  const { profileData } = useProfileContext();
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalCoaches: 0,
    totalEvents: 0,
    activeGroups: 0
  });

  // ✅ Fetch stats depuis l'API réelle
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const [playersRes, coachesRes, groupsRes] = await Promise.all([
          API.get('players/'),
          API.get('coaches/'),
          API.get('groups/')
        ]);
        setStats({
          totalPlayers: playersRes.data.length,
          totalCoaches: coachesRes.data.length,
          totalEvents: events.length,
          activeGroups: groupsRes.data.length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback sur les props si l'API échoue
        setStats({
          totalPlayers: players.length,
          totalCoaches: coaches.length,
          totalEvents: events.length,
          activeGroups: 0
        });
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const organizationName = profileData?.academyInfo?.name || 'Runaini Academy';

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
    {
      title: 'Manage Players',
      description: 'View and manage all players',
      icon: <FiUsers className="text-2xl" />,
      color: 'from-[#902bd1] to-[#4fb0ff]',
      to: '/administration/player-management'
    },
    {
      title: 'Manage Coaches',
      description: 'View and manage coaches',
      icon: <FiUser className="text-2xl" />,
      color: 'from-[#00d0cb] to-[#4fb0ff]',
      to: '/administration/coach-management'
    },
    {
      title: 'Create Event',
      description: 'Schedule a new event',
      icon: <FiTarget className="text-2xl" />,
      color: 'from-[#4fb0ff] to-[#7c3aed]',
      to: '/administration/create-event'
    },
    {
      title: 'View Agenda',
      description: 'Check upcoming events',
      icon: <FiCalendar className="text-2xl" />,
      color: 'from-[#902bd1] to-[#7c3aed]',
      to: '/administration/agenda-management'
    }
  ];

  const recentActivities = [
    { message: 'New player registered', time: '2 hours ago', icon: <FaUsers className="text-[#4fb0ff]" /> },
    { message: 'Training session scheduled', time: '5 hours ago', icon: <FaCalendarCheck className="text-[#00d0cb]" /> },
    { message: 'Coach profile updated', time: '1 day ago', icon: <FaUserTie className="text-[#902bd1]" /> }
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
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Welcome to {organizationName}
          </h1>
          <p className="text-gray-300 mt-2 text-lg">Administration Dashboard</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-700/50 hover:border-gray-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  {/* ✅ Skeleton loader pendant le chargement */}
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
            <FiSettings className="text-[#4fb0ff]" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.to)}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-4 md:p-5 cursor-pointer border border-gray-700/50 hover:border-gray-600 transition-all group"
              >
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

          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
              <FiBell className="text-yellow-400" />
              Recent Activity
            </h2>
            <div className="space-y-3 md:space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all"
                >
                  <div className="p-2 md:p-3 rounded-lg bg-gray-800/50">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.message}</p>
                    <p className="text-gray-400 text-sm mt-1 flex items-center">
                      <FiClock className="mr-1.5" />
                      {activity.time}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* System Overview */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
              <FaChartPie className="text-[#10B981]" />
              System Overview
            </h2>
            <div className="space-y-3 md:space-y-4">
              {overviewItems.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-white">{item.label}</span>
                  </div>
                  <button
                    onClick={() => navigate(item.to)}
                    className="text-gray-400 hover:text-white font-medium text-sm flex items-center"
                  >
                    View
                    <FiArrowRight className="ml-1.5 text-xs" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-6 md:mt-8 bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700/50"
        >
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
