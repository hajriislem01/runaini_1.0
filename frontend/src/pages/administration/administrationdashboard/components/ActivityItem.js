import React from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';

const ActivityItem = ({ activity }) => {
  const isRtl = document.documentElement.dir === 'rtl';
  return (
    <motion.div whileHover={{ x: isRtl ? -4 : 4 }}
      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all">
      <div className="p-2 md:p-3 rounded-lg bg-gray-800/50">
        {activity.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium break-words">{activity.message}</p>
        <p className="text-gray-400 text-sm mt-1 flex items-center">
          <FiClock className="mr-1.5 rtl:mr-0 rtl:ml-1.5" />{activity.time}
        </p>
      </div>
      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
    </motion.div>
  );
};

export default ActivityItem;
