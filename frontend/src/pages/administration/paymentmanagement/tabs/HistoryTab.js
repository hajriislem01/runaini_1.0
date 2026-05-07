import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, FiEye, FiXCircle, FiChevronDown, FiCheck, 
  FiCreditCard, FiActivity, FiCalendar, FiDollarSign,
  FiClipboard, FiClock, FiX
} from 'react-icons/fi';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { format } from 'date-fns';
import { getMethodColor, getStatusColor } from '../utils/paymentHelpers';

const HistoryTab = ({
  filteredPayments, historyFilters, setHistoryFilters,
  setSelectedPayment, setShowModal, handleDelete
}) => {
  const [showMethodFilter, setShowMethodFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    const closeAll = () => {
      setShowMethodFilter(false);
      setShowStatusFilter(false);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  // Manual check because FiCheckCircle is from Fi but sometimes missing in older versions
  // Actually, I'll use FiCheck for consistency.
  const FiCheckCircle = (props) => <FiCheck {...props} />;

  const methods = [
    { id: 'all', name: 'All Methods', icon: <FiFilter className="text-gray-400" /> },
    { id: 'cash', name: 'Cash', icon: <FiDollarSign className="text-green-400" /> },
    { id: 'card', name: 'Credit/Debit Card', icon: <FiCreditCard className="text-blue-400" /> },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: <FiClipboard className="text-[#902bd1]" /> },
    { id: 'check', name: 'Check', icon: <FiClipboard className="text-[#00d0cb]" /> },
    { id: 'online', name: 'Online Payment', icon: <FiActivity className="text-orange-400" /> },
  ];

  const statuses = [
    { id: 'all', name: 'All Status', icon: <FiFilter className="text-gray-400" /> },
    { id: 'Completed', name: 'Completed', icon: <FiCheckCircle className="text-green-400" /> },
    { id: 'Pending', name: 'Pending', icon: <FiClock className="text-orange-400" /> },
    { id: 'Late', name: 'Late', icon: <FiX className="text-red-400" /> },
  ];

  const handleFilterSelect = (key, value, closeFn) => {
    setHistoryFilters(p => ({ ...p, [key]: value }));
    closeFn(false);
  };

  return (
    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <h2 className="text-xl font-bold flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
              <FiFilter />
            </div>
            Payment History
          </h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto relative z-50">
            {/* Method Filter */}
            <div className="relative min-w-[160px]" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => { setShowMethodFilter(!showMethodFilter); setShowStatusFilter(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 hover:border-[#4fb0ff]/40 rounded-xl text-white text-sm outline-none transition-all"
              >
                <div className="flex items-center gap-2">
                  {methods.find(m => m.id === historyFilters.method)?.icon}
                  <span className="font-medium">{methods.find(m => m.id === historyFilters.method)?.name}</span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${showMethodFilter ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showMethodFilter && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                  >
                    {methods.map(m => (
                      <div key={m.id} onClick={() => handleFilterSelect('method', m.id, setShowMethodFilter)}
                        className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          {m.icon}
                          <span>{m.name}</span>
                        </div>
                        {historyFilters.method === m.id && <FiCheck className="text-[#4fb0ff]" />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[150px]" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => { setShowStatusFilter(!showStatusFilter); setShowMethodFilter(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white text-sm outline-none transition-all"
              >
                <div className="flex items-center gap-2">
                  {statuses.find(s => s.id === historyFilters.status)?.icon}
                  <span className="font-medium">{statuses.find(s => s.id === historyFilters.status)?.name}</span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${showStatusFilter ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showStatusFilter && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 w-full min-w-[180px] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                  >
                    {statuses.map(s => (
                      <div key={s.id} onClick={() => handleFilterSelect('status', s.id, setShowStatusFilter)}
                        className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          {s.icon}
                          <span>{s.name}</span>
                        </div>
                        {historyFilters.status === s.id && <FiCheck className="text-[#00d0cb]" />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date Filters (Styled containers) */}
            <div className="flex items-center gap-2 bg-gray-800/30 border border-gray-700/50 rounded-xl px-3 py-1.5 self-stretch">
              <FiCalendar className="text-gray-400" size={14} />
              <input type="date" value={historyFilters.startDate}
                onChange={(e) => setHistoryFilters(p => ({ ...p, startDate: e.target.value }))}
                className="bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 p-0 w-[120px]" />
              <span className="text-gray-600 px-1">→</span>
              <input type="date" value={historyFilters.endDate}
                onChange={(e) => setHistoryFilters(p => ({ ...p, endDate: e.target.value }))}
                className="bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 p-0 w-[120px]"
                max={format(new Date(), 'yyyy-MM-dd')} />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: filteredPayments.length, color: '#4fb0ff', icon: <FiFilter size={14}/> },
            { label: 'Completed', value: filteredPayments.filter(p => p.status === 'Completed').length, color: '#22c55e', icon: <FiCheckCircle size={14}/> },
            { label: 'Pending', value: filteredPayments.filter(p => p.status === 'Pending').length, color: '#eab308', icon: <FiClock size={14}/> },
            { label: 'Total Amount', value: `$${filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}`, color: '#902bd1', icon: <FiDollarSign size={14}/> },
          ].map((s, i) => (
            <div key={i} className="bg-gray-800/20 rounded-2xl p-4 border border-gray-700/50 flex flex-col gap-1 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2">
                <span style={{ color: s.color }}>{s.icon}</span>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{s.label}</p>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-800/50">
              <tr>
                {['Player', 'Month', 'Amount', 'Date', 'Method', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-900/60">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#0c132a]/40 divide-y divide-gray-700/50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                      <FaRegCalendarCheck className="mx-auto text-4xl mb-4 opacity-20" />
                      <p className="text-base font-medium">No payment records found matching your filters</p>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white group-hover:text-[#4fb0ff] transition-colors">{payment.player_name}</div>
                    <div className="text-xs text-gray-500 font-medium">{payment.group_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300 font-medium">{payment.month}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#22c55e] font-black text-lg">${parseFloat(payment.amount).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <FiCalendar size={12} className="text-gray-500" />
                      {payment.payment_date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight border border-current bg-opacity-10 ${getMethodColor(payment.method)}`}>
                      {payment.method?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight border border-current ${getStatusColor(payment.status)} shadow-lg shadow-current/5`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <motion.button 
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 208, 203, 0.15)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
                        className="text-[#00d0cb] p-2.5 rounded-xl border border-[#00d0cb]/20 transition-all shadow-lg shadow-[#00d0cb]/5"
                      >
                        <FiEye size={18} />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(payment.id)}
                        className="text-red-400 p-2.5 rounded-xl border border-red-500/20 transition-all shadow-lg shadow-red-500/5"
                      >
                        <FiXCircle size={18} />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryTab;
