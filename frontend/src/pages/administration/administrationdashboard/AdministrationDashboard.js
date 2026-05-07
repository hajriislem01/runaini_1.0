import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSettings, FiBell } from 'react-icons/fi';
import { FaChartPie } from 'react-icons/fa';

import { useDashboardStats } from './hooks/useDashboardStats';
import { getStatCards, getQuickActions, getOverviewItems, containerVariants, itemVariants } from './utils/dashboardConstants';

import StatCard from './components/StatCard';
import QuickActionCard from './components/QuickActionCard';
import ActivityItem from './components/ActivityItem';
import SystemOverviewItem from './components/SystemOverviewItem';

const AdministrationDashboard = ({ players = [], coaches = [], events = [] }) => {
  const navigate = useNavigate();
  const { stats, recentActivities, isLoadingStats, organizationName } = useDashboardStats(players, coaches, events);

  const statCards = getStatCards(stats);
  const quickActions = getQuickActions();
  const overviewItems = getOverviewItems();

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
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard key={index} stat={stat} isLoadingStats={isLoadingStats} itemVariants={itemVariants} />
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
            <FiSettings className="text-[#4fb0ff]" />Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} action={action} navigate={navigate} itemVariants={itemVariants} />
            ))}
          </div>
        </motion.div>

        {/* Recent Activity & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity */}
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
                  <ActivityItem key={index} activity={activity} />
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
                <SystemOverviewItem key={index} item={item} navigate={navigate} />
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
