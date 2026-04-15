import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiCalendar } from 'react-icons/fi';
import { FaFutbol, FaTrophy, FaRegCalendarAlt } from 'react-icons/fa';

const AgendaHeader = ({ stats, isLoading, resetForm, setShowEventModal, itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Agenda Management
          </h1>
          <p className="text-gray-300 mt-2">Schedule and manage training sessions, matches, and meetings</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowEventModal(true); }}
          className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
          <FiPlus className="text-lg" />New Event
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Events', value: stats.totalEvents, color: '#4fb0ff', icon: <FaRegCalendarAlt /> },
          { label: 'Today', value: stats.todayEvents, color: '#00d0cb', icon: <FiCalendar /> },
          { label: 'Trainings', value: stats.trainingEvents, color: '#902bd1', icon: <FaFutbol /> },
          { label: 'Matches', value: stats.matchEvents, color: '#22c55e', icon: <FaTrophy /> }
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
};

export default AgendaHeader;
