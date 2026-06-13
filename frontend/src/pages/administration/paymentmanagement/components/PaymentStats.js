import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const PaymentStats = ({ stats, isLoading, itemVariants }) => {
  const { t, i18n } = useTranslation('paymentmanagement');
  const isRtl = i18n.language === 'ar';

  const statItems = [
    { label: t('stats.totalPlayers', 'Total Players'), value: stats.total_players, color: '#4fb0ff', icon: <FiUsers /> },
    { label: t('stats.paidInvoices', 'Paid'), value: stats.paid_count, color: '#22c55e', icon: <FiCheckCircle /> },
    { label: t('stats.unpaid', 'Unpaid'), value: stats.unpaid_count, color: '#ef4444', icon: <FiXCircle /> },
    { 
      label: t('stats.collected', 'Collected'), 
      value: `${stats.total_collected?.toFixed(2) || '0'} ${t('currency.symbol', 'DT')}`, 
      color: '#902bd1', 
      icon: <FaMoneyBillWave /> 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, idx) => (
        <motion.div key={idx} variants={itemVariants}
          className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
          <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              )}
            </div>
            <div className="p-2 rounded-lg bg-gray-800/50" style={{ color: stat.color }}>{stat.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PaymentStats;
