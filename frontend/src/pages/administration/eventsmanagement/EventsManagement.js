import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { FiPlus, FiX, FiClock, FiMapPin, FiExternalLink } from 'react-icons/fi';

import { containerVariants, itemVariants } from './utils/eventConstants';
import { useEventsList } from './hooks/useEventsList';
import EventsHeader from './components/EventsHeader';
import EventsFilters from './components/EventsFilters';
import EventCard from './components/EventCard';

const EventsManagement = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSectionExpanded, setIsSectionExpanded] = useState(false);
  const [expandedPage, setExpandedPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const itemsPerPage = 5;
  const {
    events, groups, isLoading, filteredEvents, showFilters, setShowFilters,
    filters, handleFilterChange, clearFilters, stats, handleDelete, handleComplete
  } = useEventsList();

  return (
    <motion.div
      layout
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                key="modal-card"
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                className="pointer-events-auto w-full max-w-md relative"
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-gray-900 border border-gray-700/80 text-gray-400 hover:text-white hover:bg-gray-800 transition-all shadow-lg"
                >
                  <FiX size={16} />
                </button>
                {/* The actual EventCard — read-only: pass no-op handlers to suppress actions */}
                <EventCard
                  event={selectedEvent}
                  navigate={navigate}
                  handleComplete={() => {}}
                  handleDelete={() => {}}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer Mode (Mode A) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 md:w-[400px] z-50 bg-[#0c132a]/95 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  All Events
                </h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                {events.map((evt) => (
                  <div key={evt.id} className="bg-gray-900/40 rounded-xl p-4 border border-gray-700/50 hover:border-[#4fb0ff]/30 transition-colors group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4fb0ff]/0 via-[#4fb0ff]/5 to-[#00d0cb]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors pr-2 break-words leading-snug">{evt.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded border whitespace-nowrap shrink-0 font-medium ${
                          evt.type === 'Match Friendly' ? 'bg-[#4fb0ff]/10 border-[#4fb0ff]/30 text-[#4fb0ff]'
                          : evt.type === 'Training' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        }`}>
                          {evt.type === 'Match Friendly' ? 'Match' : evt.type === 'Training' ? 'Training' : (evt.type || 'Event')}
                        </span>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <FiClock className="mr-2 shrink-0" size={13} />
                          <span>{new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{evt.time ? ` · ${evt.time}` : ''}</span>
                        </div>
                        {evt.location && (
                          <div className="flex items-center text-sm text-gray-400">
                            <FiMapPin className="mr-2 shrink-0" size={13} />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setIsDrawerOpen(false); setSelectedEvent(evt); }}
                        className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-300 bg-gray-800/60 rounded-lg hover:bg-[#4fb0ff]/10 hover:text-[#4fb0ff] border border-gray-700/50 hover:border-[#4fb0ff]/30 transition-all"
                      >
                        <FiExternalLink size={13} /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <EventsHeader 
          stats={stats} isLoading={isLoading} navigate={navigate} itemVariants={itemVariants} 
          onTotalEventsClick={() => setIsDrawerOpen(true)}
          onEyeClick={() => setIsSectionExpanded(!isSectionExpanded)}
          isSectionExpanded={isSectionExpanded}
        />

        {/* Expanded Mode (Mode B) */}
        <AnimatePresence>
          {isSectionExpanded && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-[#0c132a]/80 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaRegCalendarCheck className="text-[#4fb0ff]" />
                    Full Events List
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      disabled={expandedPage === 1}
                      onClick={() => setExpandedPage(p => p - 1)}
                      className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors border border-gray-700"
                    >Prev</button>
                    <button 
                      disabled={expandedPage * itemsPerPage >= events.length}
                      onClick={() => setExpandedPage(p => p + 1)}
                      className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors border border-gray-700"
                    >Next</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {events.slice((expandedPage - 1) * itemsPerPage, expandedPage * itemsPerPage).map((evt, i) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-gray-900/30 rounded-xl border border-gray-700/40 hover:border-[#4fb0ff]/20 hover:bg-gray-900/50 transition-all group"
                    >
                      {/* Left: Name + Meta */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors truncate">{evt.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                          <span className="flex items-center text-xs text-gray-500">
                            <FiClock className="mr-1.5" size={12} />
                            {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{evt.time ? ` · ${evt.time}` : ''}
                          </span>
                          {evt.location && (
                            <span className="flex items-center text-xs text-gray-500">
                              <FiMapPin className="mr-1.5" size={12} />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Right: Tag + Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded border font-medium ${
                          evt.type === 'Match Friendly' ? 'bg-[#4fb0ff]/10 border-[#4fb0ff]/30 text-[#4fb0ff]'
                          : evt.type === 'Training' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        }`}>
                          {evt.type === 'Match Friendly' ? 'Match' : evt.type === 'Training' ? 'Training' : (evt.type || 'Event')}
                        </span>
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/70 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-xs font-medium border border-gray-700/50 hover:border-gray-600"
                        >
                          <FiExternalLink size={12} /> View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {events.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No events available.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <EventsFilters 
          showFilters={showFilters} setShowFilters={setShowFilters}
          filters={filters} handleFilterChange={handleFilterChange}
          clearFilters={clearFilters} groups={groups} filteredCount={filteredEvents.length}
          itemVariants={itemVariants} 
        />

        {/* Events List */}
        <motion.div variants={itemVariants} className="relative z-10">
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
