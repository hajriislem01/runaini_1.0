import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, FiEye, FiXCircle, FiChevronDown, FiCheck, 
  FiCreditCard, FiActivity, FiDollarSign,
  FiClipboard, FiClock, FiX, FiCalendar
} from 'react-icons/fi';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { getMethodColor, getStatusColor } from '../utils/paymentHelpers';
import CustomDatePicker from '../components/CustomDatePicker';

const HistoryTab = ({
  filteredPayments, historyFilters, setHistoryFilters,
  setSelectedPayment, setShowModal, handleDelete
}) => {
  const { t, i18n } = useTranslation('paymentmanagement');
  const isRtl = i18n.language === 'ar';

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
  const FiCheckCircle = (props) => <FiCheck {...props} />;

  const methods = [
    { id: 'all', name: t('allMethods', 'All Methods'), icon: <FiFilter className="text-gray-400" /> },
    { id: 'cash', name: t('method.cash', 'Cash'), icon: <FiDollarSign className="text-green-400" /> },
    { id: 'card', name: t('method.card', 'Credit/Debit Card'), icon: <FiCreditCard className="text-blue-400" /> },
    { id: 'bank_transfer', name: t('method.bankTransfer', 'Bank Transfer'), icon: <FiClipboard className="text-[#902bd1]" /> },
    { id: 'check', name: t('method.cheque', 'Check'), icon: <FiClipboard className="text-[#00d0cb]" /> },
    { id: 'online', name: t('method.online', 'Online Payment'), icon: <FiActivity className="text-orange-400" /> },
  ];

  const statuses = [
    { id: 'all', name: t('allStatuses', 'All Status'), icon: <FiFilter className="text-gray-400" /> },
    { id: 'Completed', name: t('form.completed', 'Completed'), icon: <FiCheckCircle className="text-green-400" /> },
    { id: 'Pending', name: t('status.pending', 'Pending'), icon: <FiClock className="text-orange-400" /> },
    { id: 'Late', name: t('status.overdue', 'Late'), icon: <FiX className="text-red-400" /> },
  ];

  const getMethodName = (methodId) => {
    switch(methodId) {
      case 'cash': return t('method.cash', 'Cash');
      case 'card': return t('method.card', 'Credit/Debit Card');
      case 'bank_transfer': return t('method.bankTransfer', 'Bank Transfer');
      case 'check': return t('method.cheque', 'Check');
      case 'online': return t('method.online', 'Online Payment');
      default: return methodId;
    }
  };

  const getStatusName = (statusId) => {
    switch(statusId) {
      case 'Completed': return t('form.completed', 'Completed');
      case 'Pending': return t('status.pending', 'Pending');
      case 'Late': return t('status.overdue', 'Late');
      default: return statusId;
    }
  };

  const handleFilterSelect = (key, value, closeFn) => {
    setHistoryFilters(p => ({ ...p, [key]: value }));
    closeFn(false);
  };

  const headers = [
    { id: 'player', name: t('table.player', 'Player') },
    { id: 'month', name: t('table.month', 'Month') },
    { id: 'amount', name: t('table.amount', 'Amount') },
    { id: 'date', name: t('table.paymentDate', 'Date') },
    { id: 'method', name: t('table.paymentMethod', 'Method') },
    { id: 'status', name: t('table.status', 'Status') },
    { id: 'actions', name: t('table.actions', 'Actions') }
  ];

  const summaryCards = [
    { label: t('form.total', 'Total'), value: filteredPayments.length, color: '#4fb0ff', icon: <FiFilter size={14}/> },
    { label: t('form.completed', 'Completed'), value: filteredPayments.filter(p => p.status === 'Completed').length, color: '#22c55e', icon: <FiCheckCircle size={14}/> },
    { label: t('status.pending', 'Pending'), value: filteredPayments.filter(p => p.status === 'Pending').length, color: '#eab308', icon: <FiClock size={14}/> },
    { 
      label: t('stats.totalRevenue', 'Total Amount'), 
      value: `${filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)} ${t('currency.symbol', 'DT')}`, 
      color: '#902bd1', 
      icon: <FiDollarSign size={14}/> 
    },
  ];

  return (
    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-30">
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className={`flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 ${isRtl ? 'xl:flex-row-reverse' : ''}`}>
          <h2 className={`text-xl font-bold flex items-center gap-3 text-white ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
              <FiFilter />
            </div>
            <span>{t('form.paymentHistory', 'Payment History')}</span>
          </h2>
          
          <div className={`flex flex-wrap items-start gap-3 w-full xl:w-auto relative z-50 ${isRtl ? 'flex-row-reverse justify-start' : ''}`}>
            {/* Method Filter */}
            <div className="relative min-w-[160px]" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => { setShowMethodFilter(!showMethodFilter); setShowStatusFilter(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 hover:border-[#4fb0ff]/40 rounded-xl text-white text-sm outline-none transition-all ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {methods.find(m => m.id === historyFilters.method)?.icon}
                  <span className="font-medium">{methods.find(m => m.id === historyFilters.method)?.name}</span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${showMethodFilter ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showMethodFilter && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className={`absolute top-full mt-2 w-full min-w-[200px] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1 ${isRtl ? 'right-0' : 'left-0'}`}
                  >
                    {methods.map(m => (
                      <div key={m.id} onClick={() => handleFilterSelect('method', m.id, setShowMethodFilter)}
                        className={`px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
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
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white text-sm outline-none transition-all ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {statuses.find(s => s.id === historyFilters.status)?.icon}
                  <span className="font-medium">{statuses.find(s => s.id === historyFilters.status)?.name}</span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${showStatusFilter ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showStatusFilter && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className={`absolute top-full mt-2 w-full min-w-[180px] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1 ${isRtl ? 'right-0' : 'left-0'}`}
                  >
                    {statuses.map(s => (
                      <div key={s.id} onClick={() => handleFilterSelect('status', s.id, setShowStatusFilter)}
                        className={`px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
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

            {/* Date Filters — custom dark-theme calendar pickers */}
            <div className={`flex flex-col sm:flex-row gap-2 w-full sm:w-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
              {/* Start Date */}
              <div className="w-full sm:w-[160px]">
                <CustomDatePicker
                  id="history-start-date"
                  value={historyFilters.startDate}
                  onChange={(iso) => setHistoryFilters(p => ({ ...p, startDate: iso }))}
                  placeholder={t('form.startDatePlaceholder', 'Start date')}
                  maxDate={historyFilters.endDate || undefined}
                  accentColor="#4fb0ff"
                />
              </div>

              {/* Separator */}
              <div className="hidden sm:flex items-center text-gray-600 text-xs flex-shrink-0 self-center px-1">
                {isRtl ? '←' : '→'}
              </div>
              <div className={`flex sm:hidden items-center gap-2 self-start pl-1 ${isRtl ? 'flex-row-reverse pr-1' : ''}`}>
                <div className="h-px w-4 bg-gray-700" />
                <span className="text-gray-600 text-xs">{t('form.to', 'to')}</span>
                <div className="h-px w-4 bg-gray-700" />
              </div>

              {/* End Date */}
              <div className="w-full sm:w-[160px]">
                <CustomDatePicker
                  id="history-end-date"
                  value={historyFilters.endDate}
                  onChange={(iso) => setHistoryFilters(p => ({ ...p, endDate: iso }))}
                  placeholder={t('form.endDatePlaceholder', 'End date')}
                  minDate={historyFilters.startDate || undefined}
                  maxDate={new Date().toISOString().slice(0, 10)}
                  accentColor="#00d0cb"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((s, i) => (
            <div key={i} className={`bg-gray-800/20 rounded-2xl p-4 border border-gray-700/50 flex flex-col gap-1 hover:border-white/10 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
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
                {headers.map(h => (
                  <th key={h.id} className={`px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-900/60 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {h.name}
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
                      <p className="text-base font-medium">{t('table.noPaymentsFound', 'No payment records found matching your filters')}</p>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-white/5 transition-all group">
                  <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="font-semibold text-white group-hover:text-[#4fb0ff] transition-colors">{payment.player_name}</div>
                    <div className="text-xs text-gray-500 font-medium">{payment.group_name}</div>
                  </td>
                  <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className="text-sm text-gray-300 font-medium">{payment.month}</span>
                  </td>
                  <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="text-[#22c55e] font-black text-lg">{parseFloat(payment.amount).toFixed(2)} {t('currency.symbol', 'DT')}</div>
                  </td>
                  <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-2 text-gray-400 text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <FiCalendar size={12} className="text-gray-500" />
                      <span>{payment.payment_date}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight border border-current bg-opacity-10 ${getMethodColor(payment.method)}`}>
                      {getMethodName(payment.method)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight border border-current ${getStatusColor(payment.status)} shadow-lg shadow-current/5`}>
                      {getStatusName(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse justify-start' : ''}`}>
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
