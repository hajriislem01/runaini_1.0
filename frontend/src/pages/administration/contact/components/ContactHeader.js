import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiGlobe, FiMail } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ContactHeader = ({ stats, itemVariants }) => {
  const { t, i18n } = useTranslation('contactmanagement');
  const isRtl = i18n.language === 'ar';

  return (
    <motion.div variants={itemVariants} className="mb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-gray-300 mt-2">{t('subtitle')}</p>
        </div>
        <div className="bg-gradient-to-r from-[#4fb0ff]/80 to-[#00d0cb]/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-[#4fb0ff]/40">
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <FiUsers className="text-xl" />
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <div className="text-xs text-gray-300">{t('stats.total')}</div>
              <div className="text-lg font-bold">{stats.total}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: t('stats.total'), value: stats.total, color: '#4fb0ff', icon: <FiUsers /> },
          { label: t('stats.countries'), value: stats.countries, color: '#00d0cb', icon: <FiGlobe /> },
          { label: t('stats.withContact'), value: stats.withContact, color: '#22c55e', icon: <FiMail /> },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}
            className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-800/50" style={{ color: stat.color }}>{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ContactHeader;
