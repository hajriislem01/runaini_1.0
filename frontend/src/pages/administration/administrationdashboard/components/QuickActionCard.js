import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const QuickActionCard = ({ action, navigate, itemVariants }) => (
  <motion.div variants={itemVariants}
    whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
    onClick={() => navigate(action.to)}
    className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-4 md:p-5 cursor-pointer border border-gray-700/50 hover:border-gray-600 transition-all group">
    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3 md:mb-4 group-hover:scale-110 transition-transform w-fit`}>
      <div className="text-white">{action.icon}</div>
    </div>
    <h3 className="text-lg font-semibold text-white mb-1 md:mb-2">{action.title}</h3>
    <p className="text-gray-400 text-sm mb-3 md:mb-4">{action.description}</p>
    <div className="flex items-center text-gray-400 font-medium group-hover:text-white transition-colors">
      <span className="text-sm">Go to</span>
      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.div>
);

export default QuickActionCard;
