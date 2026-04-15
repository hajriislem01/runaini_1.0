import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const SystemOverviewItem = ({ item, navigate }) => (
  <motion.div whileHover={{ x: 4 }}
    className="flex items-center justify-between p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all">
    <div className="flex items-center gap-3">
      {item.icon}
      <span className="text-white">{item.label}</span>
    </div>
    <button onClick={() => navigate(item.to)}
      className="text-gray-400 hover:text-white font-medium text-sm flex items-center">
      View<FiArrowRight className="ml-1.5 text-xs" />
    </button>
  </motion.div>
);

export default SystemOverviewItem;
