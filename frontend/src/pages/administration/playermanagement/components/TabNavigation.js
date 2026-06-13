import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiLayers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const TabNavigation = ({ activeTab, setActiveTab, playersCount, groupsCount, itemVariants }) => {
  const { t } = useTranslation('playermanagement');

  return (
    <motion.div variants={itemVariants} className="mb-6">
      <div className="flex gap-2 border-b border-gray-700/50">
        <button
          onClick={() => setActiveTab('players')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'players'
              ? 'text-[#80a8ff] border-b-2 border-[#00d0cb]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiUsers />
            {t('playersTab', 'Players')} ({playersCount})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'groups'
              ? 'text-[#80a8ff] border-b-2 border-[#00d0cb]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiLayers />
            {t('groupsTab', 'Groups')} ({groupsCount})
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default TabNavigation;
