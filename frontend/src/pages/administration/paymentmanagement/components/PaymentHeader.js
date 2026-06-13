import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const PaymentHeader = ({ stats, currentMonth, prevMonth, nextMonth, itemVariants }) => {
  const { t, i18n } = useTranslation('paymentmanagement');
  const isRtl = i18n.language === 'ar';

  const formatMonthYear = (monthStr) => {
    try {
      const date = new Date(monthStr + '-01');
      return new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(date);
    } catch (e) {
      return monthStr;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            {t('title', 'Payment Management')}
          </h1>
          <p className="text-gray-300 mt-2">
            {t('subtitle', 'Track monthly subscriptions and payment history')}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-[#4fb0ff]/80 to-[#00d0cb]/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-[#4fb0ff]/40">
          <p className={`text-white font-medium flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <FiDollarSign className="text-xl" />
            <span>
              {t('stats.collected', 'Collected')}: {stats.total_collected?.toFixed(2) || '0.00'} {t('currency.symbol', 'DT')}
            </span>
          </p>
        </motion.div>
      </div>

      {/* Month Navigation */}
      <div className={`flex items-center justify-center gap-4 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
          className="p-2 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white">
          {isRtl ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </motion.button>
        <div className="text-2xl font-bold text-white px-6 py-3 bg-gray-900/50 rounded-xl border border-gray-700 min-w-[180px] text-center">
          {formatMonthYear(currentMonth)}
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          className="p-2 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white">
          {isRtl ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </motion.button>
      </div>
    </>
  );
};

export default PaymentHeader;
