import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaFutbol, FaTrophy } from 'react-icons/fa';
import { format } from 'date-fns';

const DayEventsModal = ({
  showDayEventsModal, setShowDayEventsModal,
  selectedDay, calendarDays,
  handleEditEvent, setEventToDelete, setShowDeleteConfirm,
  createEventForDay
}) => {
  if (!showDayEventsModal || !selectedDay) return null;

  const renderEventTypeBadge = (event) => {
    const config = event.type === 'Tournament'
      ? { color: 'from-[#902bd1] to-[#00d0cb]', icon: <FaTrophy /> }
      : { color: 'from-[#00d0cb] to-[#4fb0ff]', icon: <FaFutbol /> };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${config.color}`}>
        {config.icon}{event.type}
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
                <h2 className="text-xl font-bold text-white">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h2>
              </div>
              <button onClick={() => setShowDayEventsModal(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {calendarDays.find(d => d.date.getTime() === selectedDay.getTime())?.events?.map(event => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 p-6 ${
                    event.type === 'Tournament' ? 'border-l-4 border-[#902bd1]' : 'border-l-4 border-[#00d0cb]'
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
                          <FiUsers /><span>{event.group_name || `Group ${event.group}`}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { handleEditEvent(event); setShowDayEventsModal(false); }}
                        className="text-[#00d0cb] hover:text-[#4fb0ff] p-2 rounded-lg hover:bg-[#00d0cb]/10">
                        <FiEdit size={20} />
                      </button>
                      <button onClick={() => { setEventToDelete(event); setShowDeleteConfirm(true); setShowDayEventsModal(false); }}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10">
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!calendarDays.find(d => d.date.getTime() === selectedDay.getTime())?.events || calendarDays.find(d => d.date.getTime() === selectedDay.getTime())?.events?.length === 0) && (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-700 rounded-xl">
                  <FiCalendar className="mx-auto text-3xl mb-3" />
                  <p>No events scheduled for this day</p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => createEventForDay(selectedDay)}
                className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                <FiPlus />Add Event
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DayEventsModal;
