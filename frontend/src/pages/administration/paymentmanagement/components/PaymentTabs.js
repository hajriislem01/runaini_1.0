import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus } from 'react-icons/fi';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const PaymentTabs = ({ activeTab, setActiveTab, itemVariants }) => {
  const { t, i18n } = useTranslation('paymentmanagement');
  const isRtl = i18n.language === 'ar';

  const tabItems = [
    { id: 'overview', label: t('overviewTab', 'Overview'), icon: <FiUsers /> },
    { id: 'add', label: t('addPaymentTab', 'Add Payment'), icon: <FiPlus /> },
    { id: 'history', label: t('historyTab', 'History'), icon: <FaRegCalendarCheck /> },
  ];

  return (
    <motion.div variants={itemVariants} className="mb-6">
      <div className={`flex flex-wrap gap-2 md:gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {tabItems.map(tab => (
          <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all flex-1 md:flex-none whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white shadow-lg'
                : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700/50'
              } ${isRtl ? 'flex-row-reverse' : ''}`}>
            {tab.icon}<span>{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default PaymentTabs;
