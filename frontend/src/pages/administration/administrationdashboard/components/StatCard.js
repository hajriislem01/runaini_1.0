import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity } from 'react-icons/fi';

const StatCard = ({ stat, isLoadingStats, itemVariants }) => (
  <motion.div variants={itemVariants} whileHover={{ y: -4 }}
    className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-700/50 hover:border-gray-600 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium break-words">{stat.label}</p>
        {isLoadingStats ? (
          <div className="mt-2 h-8 w-12 bg-gray-700/50 rounded animate-pulse" />
        ) : (
          <p className="text-2xl md:text-3xl font-bold text-white mt-2 break-all">{stat.value}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
        <div className="text-white">{stat.icon}</div>
      </div>
    </div>
    <div className="mt-3 flex items-center text-sm">
      <FiActivity className={`mr-1.5 ${stat.trendColor}`} />
      <span className={stat.trendColor}>{stat.trend}</span>
    </div>
  </motion.div>
);

export default StatCard;
