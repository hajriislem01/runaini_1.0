import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiZap, FiClock } from 'react-icons/fi';
import { format, isToday, addMonths } from 'date-fns';

const CalendarGrid = ({
  currentDate, setCurrentDate,
  calendarDays, handleDayClick,
  itemVariants
}) => {
  return (
    <>
      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(addMonths(currentDate, -1))}
              className="p-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50">
              <FiChevronLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-white">{format(currentDate, 'MMMM yyyy')}</h2>
              <button onClick={() => setCurrentDate(new Date())}
                className="text-sm text-[#00d0cb] hover:text-[#4fb0ff] mt-1 flex items-center gap-1">
                <FiZap className="text-xs" />Today
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50">
              <FiChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-300 py-3 text-sm">{day}</div>
          ))}
          {calendarDays.map((day, index) => (
            <motion.div key={index} whileHover={{ scale: 1.02 }}
              className={`min-h-[112px] p-2 rounded-xl cursor-pointer transition-all border ${
                day.isCurrentMonth ? 'bg-gray-900/30 border-gray-700/50' : 'bg-gray-900/10 border-gray-700/30 text-gray-500'
              } ${isToday(day.date) ? 'border-[#00d0cb] ring-2 ring-[#00d0cb]/20' : ''}`}
              onClick={() => handleDayClick(day.date)}>
              <div className={`text-right text-sm font-medium p-1 ${isToday(day.date) ? 'text-[#00d0cb] font-bold' : 'text-gray-300'}`}>
                {format(day.date, 'd')}
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {day.events.slice(0, 4).map(event => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-2 rounded-lg truncate border ${
                      event.type === 'Tournament'
                        ? 'bg-gradient-to-r from-[#902bd1]/20 to-[#00d0cb]/20 border-[#902bd1]/30'
                        : 'bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 border-[#00d0cb]/30'
                    }`}>
                    <div className="font-medium text-xs truncate text-white">{event.title}</div>
                    <div className="text-[0.65rem] text-gray-400 mt-1 flex items-center">
                      <FiClock className="mr-1" size={10} />
                      {format(new Date(event.date), 'HH:mm')}
                    </div>
                  </motion.div>
                ))}
                {day.events.length > 4 && (
                  <div className="text-xs text-gray-500 pl-1 italic">+{day.events.length - 4} more</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default CalendarGrid;
