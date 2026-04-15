import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';

import { containerVariants, itemVariants } from './utils/eventConstants';
import { useEventsList } from './hooks/useEventsList';
import EventsHeader from './components/EventsHeader';
import EventsFilters from './components/EventsFilters';
import EventCard from './components/EventCard';

const EventsManagement = () => {
  const navigate = useNavigate();
  const {
    events, groups, isLoading, filteredEvents, showFilters, setShowFilters,
    filters, handleFilterChange, clearFilters, stats, handleDelete, handleComplete
  } = useEventsList();

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <EventsHeader stats={stats} isLoading={isLoading} navigate={navigate} itemVariants={itemVariants} />

        <EventsFilters 
          showFilters={showFilters} setShowFilters={setShowFilters}
          filters={filters} handleFilterChange={handleFilterChange}
          clearFilters={clearFilters} groups={groups} filteredCount={filteredEvents.length}
          itemVariants={itemVariants} 
        />

        {/* Events List */}
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-900/40 rounded-2xl border border-gray-700/50 p-6 animate-pulse">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-gray-700/50 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-gray-700/50 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-gray-700/50 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} navigate={navigate} handleComplete={handleComplete} handleDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <motion.div variants={itemVariants}
              className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-2xl border border-[#4fb0ff]/30 p-12 text-center">
              <div className="text-5xl mb-4 text-gray-400 flex justify-center">
                <FaRegCalendarCheck />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No events found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {Object.values(filters).some(f => f)
                  ? 'Try adjusting your filters to find more events'
                  : 'Create your first event to get started'}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/administration/create-event')}
                className="px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 mx-auto"
                style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                <FiPlus />Create First Event
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Footer Stats */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: filteredEvents.filter(e => e.type === 'Match Friendly').length, label: 'Friendly Matches', color: 'text-[#4fb0ff]' },
                { value: filteredEvents.filter(e => e.type === 'Tournament').length, label: 'Tournaments', color: 'text-[#902bd1]' },
                { value: filteredEvents.filter(e => e.status !== 'completed' && e.participants?.some(p => p.status === 'pending')).length, label: 'Pending Approval', color: 'text-[#eab308]' },
                { value: filteredEvents.filter(e => e.status === 'completed').length, label: 'Completed', color: 'text-[#22c55e]' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.value}</div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventsManagement;
