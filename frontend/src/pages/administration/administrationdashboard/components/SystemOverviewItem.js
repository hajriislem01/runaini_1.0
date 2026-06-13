import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const SystemOverviewItem = ({ item, navigate, t }) => {
  const isRtl = document.documentElement.dir === 'rtl';
  return (
    <motion.div whileHover={{ x: isRtl ? -4 : 4 }}
      className="flex items-center justify-between p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        {item.icon}
        <span className="text-white break-words">{item.label}</span>
      </div>
      <button onClick={() => navigate(item.to)}
        className="text-gray-400 hover:text-white font-medium text-sm flex items-center">
        {t('view')}<FiArrowRight className="ml-1.5 rtl:ml-0 rtl:mr-1.5 text-xs rtl:rotate-180" />
      </button>
    </motion.div>
  );
};

export default SystemOverviewItem;
