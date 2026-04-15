import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';

const PaymentHeader = ({ stats, currentMonth, prevMonth, nextMonth, itemVariants }) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Payment Management
          </h1>
          <p className="text-gray-300 mt-2">Track monthly subscriptions and payment history</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-[#4fb0ff]/80 to-[#00d0cb]/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-[#4fb0ff]/40">
          <p className="text-white font-medium flex items-center gap-3">
            <FiDollarSign className="text-xl" />
            Total Collected: ${stats.total_collected?.toFixed(2) || '0.00'}
          </p>
        </motion.div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
          className="p-2 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white">
          <FiChevronLeft size={20} />
        </motion.button>
        <div className="text-2xl font-bold text-white px-6 py-3 bg-gray-900/50 rounded-xl border border-gray-700">
          {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          className="p-2 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white">
          <FiChevronRight size={20} />
        </motion.button>
      </div>
    </>
  );
};

export default PaymentHeader;
