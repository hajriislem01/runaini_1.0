import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiCalendar } from 'react-icons/fi';
import { FaFutbol, FaTrophy, FaRegCalendarAlt } from 'react-icons/fa';

const AgendaHeader = ({ stats, isLoading, resetForm, setShowEventModal, itemVariants }) => {
  const { t, i18n } = useTranslation('agendamanagement');
  const isRtl = i18n.language === 'ar';

  const statCards = [
    { labelKey: 'stats.totalEvents', value: stats.totalEvents, color: '#4fb0ff', icon: <FaRegCalendarAlt /> },
    { labelKey: 'stats.today',       value: stats.todayEvents,    color: '#00d0cb', icon: <FiCalendar /> },
    { labelKey: 'stats.trainings',   value: stats.trainingEvents, color: '#902bd1', icon: <FaFutbol /> },
    { labelKey: 'stats.matches',     value: stats.matchEvents,    color: '#22c55e', icon: <FaTrophy /> },
  ];

  return (
    <motion.div variants={itemVariants} className="mb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRtl ? 'text-right' : ''}>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-gray-300 mt-2">{t('subtitle')}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowEventModal(true); }}
          className={`px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}
          style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}
        >
          <FiPlus className="text-lg" />
          {t('actions.newEvent')}
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50"
          >
            <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={isRtl ? 'text-right' : ''}>
                <p className="text-gray-400 text-sm mb-1">{t(stat.labelKey)}</p>
                {isLoading ? (
                  <div className="h-8 w-12 bg-gray-700/50 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                )}
              </div>
              <div className="p-2 rounded-lg bg-gray-800/50" style={{ color: stat.color }}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AgendaHeader;
