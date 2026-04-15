import React from 'react';
import { motion } from 'framer-motion';

export const InfoItem = ({ icon, label, value, verified = false, isLink = false, children }) => {
  if (!value && !children) return null;
  return (
    <div className="flex gap-3 md:gap-4 py-3 border-b border-gray-700/50 last:border-0">
      <div className="text-[#4fb0ff] mt-1">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-400 font-medium">{label}</div>
        {value && (
          <div className="flex items-center gap-2 mt-1">
            {isLink ? (
              <a href={value} target="_blank" rel="noopener noreferrer"
                className="text-[#80a8ff] hover:text-white font-medium truncate transition-colors">
                {value}
              </a>
            ) : (
              <div className="text-white font-medium truncate">{value}</div>
            )}
            {verified && (
              <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full flex-shrink-0">
                Verified
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export const SectionCard = ({ children, title, icon, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4 }}
    className={`bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50 hover:border-gray-600 transition-all ${className}`}
  >
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700/50">
      <div className="p-2 rounded-lg bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white">{icon}</div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    {children}
  </motion.div>
);

export const TabButton = ({ name, icon, isActive, setActiveTab }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setActiveTab(name.toLowerCase())}
    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${isActive
        ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white shadow-lg'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      }`}
  >
    {icon}{name}
  </motion.button>
);
