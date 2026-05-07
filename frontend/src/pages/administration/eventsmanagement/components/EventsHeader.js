import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiCalendar, FiTrendingUp, FiEye } from 'react-icons/fi';
import { FaTrophy, FaRegCalendarCheck } from 'react-icons/fa';

const EventsHeader = ({ stats, isLoading, navigate, itemVariants, onTotalEventsClick, onEyeClick, isSectionExpanded }) => (
  <motion.div variants={itemVariants} className="mb-8">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
          Events Management
        </h1>
        <p className="text-gray-300 mt-2">Organize and manage all team events and tournaments</p>
      </div>
      
      <div className="flex items-stretch gap-3 w-full md:w-auto mt-2 md:mt-0">
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onEyeClick}
          className={`flex items-center justify-center px-4 rounded-xl border transition-all duration-300 shadow-lg ${
            isSectionExpanded 
              ? 'bg-[#4fb0ff]/20 text-[#4fb0ff] border-[#4fb0ff]/50' 
              : 'bg-[#0c132a] text-gray-400 border-gray-700/50 hover:bg-[#111a3a] hover:text-[#4fb0ff] hover:border-[#4fb0ff]/50'
          }`}
          title="Toggle Events Detailed List"
        >
          <FiEye size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/administration/create-event')}
          className="flex-1 md:flex-none px-6 py-3 text-white font-semibold rounded-xl flex justify-center items-center gap-3 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}
        >
          <FiPlus className="text-lg" />Create Event
        </motion.button>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'Total Events', value: stats.total, color: '#4fb0ff', icon: <FaRegCalendarCheck />, isClickable: true },
        { label: 'Upcoming', value: stats.upcoming, color: '#00d0cb', icon: <FiCalendar /> },
        { label: 'Tournaments', value: stats.tournaments, color: '#902bd1', icon: <FaTrophy /> },
        { label: 'Completed', value: stats.completed, color: '#22c55e', icon: <FiTrendingUp /> }
      ].map((stat, idx) => (
        <motion.div 
          key={idx} 
          variants={itemVariants}
          className="relative h-full"
        >
          <div
            onClick={stat.isClickable ? onTotalEventsClick : undefined}
            className={`bg-gray-900/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 flex flex-col justify-between h-full ${stat.isClickable ? 'cursor-pointer hover:bg-gray-800/60 transition-colors duration-300' : ''}`}
            style={{ minHeight: '110px' }}
          >
            <div className="flex justify-between items-start flex-1">
              <div className="flex flex-col justify-between h-full">
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <div className="mt-auto pt-2">
                  {isLoading ? (
                    <div className="h-8 w-12 bg-gray-700/50 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col justify-end h-full">
                <div className={`p-2.5 rounded-lg bg-gray-800/60 mt-auto`} style={{ color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default EventsHeader;
