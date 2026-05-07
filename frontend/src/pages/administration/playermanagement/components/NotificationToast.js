import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const NotificationToast = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2 max-w-xs w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-xl shadow-lg backdrop-blur-sm border ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-[#10B981]/20 to-[#059669]/20 border-green-700/50 text-green-100'
                : 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700/50 text-red-100'
            }`}
          >
            <div className="flex items-start">
              <FiCheck className={`flex-shrink-0 mt-0.5 mr-3 ${
                notification.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`} />
              <div className="text-sm font-medium">{notification.message}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
