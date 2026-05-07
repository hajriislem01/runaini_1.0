import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiTarget, FiTrash2 } from 'react-icons/fi';
import { FaTrophy, FaFutbol } from 'react-icons/fa';
import { formatDate, getEventStatus, getStatusColor, getEventTypeColor } from '../utils/eventConstants';

const EventCard = ({ event, navigate, handleComplete, handleDelete }) => {
  const getEventIcon = (type) => type === 'Tournament' ? <FaTrophy /> : <FaFutbol />;

  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all group">
      <div className="h-2 w-full"
        style={{ background: `linear-gradient(to right, ${event.type === 'Tournament' ? '#902bd1' : '#4fb0ff'}, #00d0cb)` }} />

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getEventTypeColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(getEventStatus(event))}`}>
                {getEventStatus(event)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-gray-300">
            <FiCalendar className="text-[#00d0cb] flex-shrink-0" />
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <FiMapPin className="text-[#4fb0ff] flex-shrink-0" />
            <span className="text-sm">{event.location}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <FiUsers className="text-[#902bd1] flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {(!event.groups_detail?.length && !event.subgroups_detail?.length) ? (
                <span className="text-sm">All Academy</span>
              ) : (
                <>
                  {(event.groups_detail || [])
                    .filter(g => !event.subgroups_detail?.some(s => s.group_name === g.name))
                    .map(g => (
                    <span key={`g-${g.id}`} className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-gradient-to-r from-[#00d0cb]/20 to-[#4fb0ff]/20 text-[#00d0cb] border border-[#00d0cb]/30 uppercase tracking-widest">
                      {g.name}
                    </span>
                  ))}
                  {(event.subgroups_detail || []).map(s => (
                    <span key={`s-${s.id}`} className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-gradient-to-r from-[#902bd1]/20 to-[#4fb0ff]/20 text-[#902bd1] border border-[#902bd1]/30 uppercase tracking-widest">
                      {s.group_name} {'>'} {s.name}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
          {event.target_academy && (
            <div className="flex items-center gap-3 text-gray-300">
              <FiTarget className="text-[#22c55e] flex-shrink-0" />
              <span className="text-sm">vs {event.target_academy}</span>
            </div>
          )}
          {event.winner && (
            <div className="flex items-center gap-3 text-yellow-400">
              <FaTrophy className="flex-shrink-0" />
              <span className="text-sm font-medium">Winner: {event.winner}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FiUsers className="text-xs" />
            <span>{event.participants_count} participants</span>
          </div>
          <div className="flex gap-2">
            {event.status !== 'completed' && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleComplete(event.id)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                Complete
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/administration/event/${event.id}`)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-white"
              style={{ background: `linear-gradient(135deg, ${event.type === 'Tournament' ? '#902bd1' : '#4fb0ff'}, #00d0cb)` }}>
              Manage
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(event.id, event.title)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
              <FiTrash2 />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
