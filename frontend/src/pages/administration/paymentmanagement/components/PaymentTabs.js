import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus } from 'react-icons/fi';
import { FaRegCalendarCheck } from 'react-icons/fa';

const PaymentTabs = ({ activeTab, setActiveTab, itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="mb-6">
      <div className="flex gap-3">
        {[
          { id: 'overview', label: 'Overview', icon: <FiUsers /> },
          { id: 'add', label: 'Add Payment', icon: <FiPlus /> },
          { id: 'history', label: 'History', icon: <FaRegCalendarCheck /> },
        ].map(tab => (
          <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white shadow-lg'
                : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700/50'
              }`}>
            {tab.icon}{tab.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default PaymentTabs;
