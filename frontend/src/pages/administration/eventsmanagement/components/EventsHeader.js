import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { FaTrophy, FaRegCalendarCheck } from 'react-icons/fa';

const EventsHeader = ({ stats, isLoading, navigate, itemVariants }) => (
  <motion.div variants={itemVariants} className="mb-8">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
          Events Management
        </h1>
        <p className="text-gray-300 mt-2">Organize and manage all team events and tournaments</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/administration/create-event')}
        className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}
      >
        <FiPlus className="text-lg" />Create Event
      </motion.button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'Total Events', value: stats.total, color: '#4fb0ff', icon: <FaRegCalendarCheck /> },
        { label: 'Upcoming', value: stats.upcoming, color: '#00d0cb', icon: <FiCalendar /> },
        { label: 'Tournaments', value: stats.tournaments, color: '#902bd1', icon: <FaTrophy /> },
        { label: 'Completed', value: stats.completed, color: '#22c55e', icon: <FiTrendingUp /> }
      ].map((stat, idx) => (
        <motion.div key={idx} variants={itemVariants}
          className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              {isLoading ? (
                <div className="h-8 w-12 bg-gray-700/50 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              )}
            </div>
            <div className="p-2 rounded-lg bg-gray-800/50" style={{ color: stat.color }}>{stat.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default EventsHeader;
