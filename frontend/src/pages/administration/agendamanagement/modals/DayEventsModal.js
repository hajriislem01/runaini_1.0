import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers, FiEdit, FiTrash2, FiPlus, FiActivity, FiUser } from 'react-icons/fi';
import { FaFutbol, FaTrophy, FaDumbbell } from 'react-icons/fa';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  technical: { bg: 'rgba(79,176,255,0.15)', border: 'rgba(79,176,255,0.3)', text: '#4fb0ff', label: 'Technical' },
  tactical: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', label: 'Tactical' },
  physical: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#22c55e', label: 'Physical' },
  mental: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', text: '#a855f7', label: 'Mental' },
  match_prep: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', label: 'Match Prep' },
  recovery: { bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.3)', text: '#14b8a6', label: 'Recovery' },
};

const DayEventsModal = ({
  showDayEventsModal, setShowDayEventsModal,
  selectedDay, calendarDays,
  handleEditEvent, setEventToDelete, setShowDeleteConfirm,
  createEventForDay, handleOpenDetail,
  userType = 'admin'
}) => {
  if (!showDayEventsModal || !selectedDay) return null;

  const dayData = calendarDays.find(d => d.date.getTime() === selectedDay.getTime());
  const dayEvents = dayData?.events || [];

  const renderEventTypeBadge = (event) => {
    let config = {
      color: 'from-blue-500 to-blue-600',
      icon: <FiClock />,
      label: 'Internal Meeting'
    };

    if (event.type === 'Meeting') {
      config = { color: 'from-blue-500 to-indigo-600', icon: <FiClock />, label: 'Internal Meeting' };
    } else if (event.type === 'Match Friendly') {
      config = { color: 'from-orange-500 to-red-600', icon: <FaFutbol />, label: 'Friendly Match' };
    } else if (event.type === 'Tournament') {
      config = { color: 'from-purple-500 to-indigo-600', icon: <FaTrophy />, label: 'Tournament' };
    } else if (event._isTraining) {
      config = { color: 'from-emerald-500 to-teal-600', icon: <FaDumbbell />, label: 'Team Training' };
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r shadow-sm ${config.color}`}>
        {config.icon}{config.label}
      </span>
    );
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={() => setShowDayEventsModal(false)}>
        <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff]">
                  <FiCalendar className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled</p>
                </div>
              </div>
              <button onClick={() => setShowDayEventsModal(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {dayEvents.map(event => {
                /* ── Coach Training Session (read-only) ── */
                if (event._isTraining) {
                  const cat = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.technical;
                  return (
                    <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleOpenDetail(event)}
                      className="bg-gray-800/50 rounded-2xl overflow-hidden border border-emerald-500/20 border-l-4 border-l-emerald-500 cursor-pointer hover:bg-gray-800 transition-all">
                      {/* Training header stripe */}
                      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <FaDumbbell className="text-emerald-400 shrink-0" size={14} />
                          <h3 className="text-base font-bold text-white">{event.title}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                            Coach Session
                          </span>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg border"
                          style={{ background: cat.bg, borderColor: cat.border, color: cat.text }}>
                          {cat.label}
                        </span>
                      </div>
                      <div className="px-5 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <FiClock className="text-emerald-400 shrink-0" />
                            <span>{format(new Date(event.date), 'HH:mm')}
                              {event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ''}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <FiMapPin className="text-emerald-400 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-300">
                            <FiUsers className="text-emerald-400 shrink-0" />
                            <span className="truncate">{event.group_name}</span>
                          </div>
                          {event.coach_name && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <FiUser className="text-emerald-400 shrink-0" />
                              <span className="truncate">{event.coach_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                /* ── Regular Admin Event (edit / delete) ── */
                return (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleOpenDetail(event)}
                    className={`bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 p-6 border-l-4 cursor-pointer hover:bg-gray-800 transition-all ${event.type === 'Meeting' ? 'border-l-blue-500' :
                        event.type === 'Match Friendly' ? 'border-l-orange-500' :
                          event.type === 'Tournament' ? 'border-l-[#902bd1]' : 'border-l-[#00d0cb]'
                      }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-bold text-white">{event.title}</h3>
                          {renderEventTypeBadge(event)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <FiClock /><span>{format(new Date(event.date), 'HH:mm')}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <FiMapPin /><span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FiUsers />
                            <span>
                              {event._isTraining
                                ? event.group_name
                                : (event.groups_detail?.length > 0
                                  ? event.groups_detail.map(g => g.name).join(', ')
                                  : (event.target_coaches?.length > 0 || event.target_players?.length > 0 ? 'Specific Targets' : 'All Academy')
                                )
                              }
                            </span>
                          </div>
                        </div>
                        {(!event._isTraining && (event.coaches_detail?.length > 0 || event.players_detail?.length > 0)) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {event.coaches_detail?.map(c => (
                              <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                coach: {c.name}
                              </span>
                            ))}
                            {event.players_detail?.map(p => (
                              <span key={p.id} className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                player: {p.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {userType !== 'player' && (
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEditEvent(event); setShowDayEventsModal(false); }}
                            className="text-[#00d0cb] hover:text-[#4fb0ff] p-2 rounded-lg hover:bg-[#00d0cb]/10">
                            <FiEdit size={20} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEventToDelete(event); setShowDeleteConfirm(true); setShowDayEventsModal(false); }}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10">
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {dayEvents.length === 0 && (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-700 rounded-xl">
                  <FiCalendar className="mx-auto text-3xl mb-3" />
                  <p>No events scheduled for this day</p>
                </div>
              )}
            </div>

            {userType !== 'player' && (
              <div className="flex justify-center">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => createEventForDay(selectedDay)}
                  className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                  <FiPlus />Add Event
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DayEventsModal;

