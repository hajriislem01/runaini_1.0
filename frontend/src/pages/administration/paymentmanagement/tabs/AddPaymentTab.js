import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiUser, FiCalendar, FiDollarSign, FiCreditCard, 
  FiDownload, FiSearch, FiChevronDown, FiCheck, FiCheckCircle,
  FiActivity, FiClipboard, FiClock, FiX
} from 'react-icons/fi';
import { format } from 'date-fns';

const AddPaymentTab = ({
  form, setForm, errors, handleSubmit,
  isSubmitting, filteredPlayers, stats, currentMonth
}) => {
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');

  // Close all menus on click outside
  useEffect(() => {
    const closeAll = () => {
      setShowPlayerDropdown(false);
      setShowMethodDropdown(false);
      setShowStatusDropdown(false);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const methods = [
    { id: 'cash', name: 'Cash', icon: <FiDollarSign className="text-green-400" /> },
    { id: 'card', name: 'Credit/Debit Card', icon: <FiCreditCard className="text-blue-400" /> },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: <FiClipboard className="text-[#902bd1]" /> },
    { id: 'check', name: 'Check', icon: <FiClipboard className="text-[#00d0cb]" /> },
    { id: 'online', name: 'Online Payment', icon: <FiActivity className="text-orange-400" /> },
  ];

  const statuses = [
    { id: 'Completed', name: 'Completed', icon: <FiCheckCircle className="text-green-400" /> },
    { id: 'Pending', name: 'Pending', icon: <FiClock className="text-orange-400" /> },
    { id: 'Late', name: 'Late', icon: <FiX className="text-red-400" /> },
  ];

  const handleSelect = (field, value, closeFn) => {
    setForm(p => ({ ...p, [field]: value }));
    if (closeFn) closeFn(false);
  };

  const getSelectedPlayerName = () => {
    const p = filteredPlayers.find(pl => String(pl.id) === String(form.player));
    return p ? p.full_name : 'Select a player';
  };

  const activePlayersList = filteredPlayers.filter(p => 
    p.full_name?.toLowerCase().includes(playerSearch.toLowerCase())
  );

  return (
    <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">
            <FiPlus />
          </div>
          Record New Payment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1. Player Selector (Searchable) */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiUser className="text-[#4fb0ff]" size={12} /> Select Player *
              </label>
              <button 
                type="button"
                onClick={() => {
                  setShowPlayerDropdown(!showPlayerDropdown);
                  setShowMethodDropdown(false);
                  setShowStatusDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 bg-gray-800/30 border ${errors.player ? 'border-red-500/50 shadow-lg shadow-red-500/5' : 'border-gray-700/50 hover:border-[#00d0cb]/40'} rounded-xl text-white outline-none transition-all group`}
              >
                <span className="text-sm font-medium truncate">{getSelectedPlayerName()}</span>
                <FiChevronDown className={`transition-transform duration-200 ${showPlayerDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showPlayerDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2"
                  >
                    <div className="px-2 pb-2 pt-1 border-b border-gray-700/50 mb-1">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text"
                          placeholder="Search player..."
                          value={playerSearch}
                          onChange={(e) => setPlayerSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-[#4fb0ff]/50"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto p-1 space-y-1 custom-scrollbar">
                      {activePlayersList.length > 0 ? (
                        activePlayersList.map(p => {
                          const isPaid = stats.paid_player_ids.includes(p.id);
                          return (
                            <div 
                              key={p.id}
                              onClick={() => {
                                handleSelect('player', p.id, setShowPlayerDropdown);
                                setPlayerSearch('');
                              }}
                              className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full border border-white/10 shadow-md overflow-hidden bg-gray-800 flex items-center justify-center shrink-0 group-hover:border-[#4fb0ff]/30 transition-all">
                                  {p.photo_url ? (
                                    <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <FiUser className="text-gray-500" size={16} />
                                  )}
                                </div>
                                <span className="font-medium">{p.full_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isPaid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                  {isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                                {String(form.player) === String(p.id) && <FiCheck className="text-[#00d0cb]" />}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm italic">No players found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.player && <p className="text-red-400 text-[10px] font-bold uppercase mt-1.5 ml-1 tracking-wider">{errors.player}</p>}
            </div>

            {/* 2. Month Selector (Styled Container) */}
            <div>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiCalendar className="text-[#00d0cb]" size={12} /> Month *
              </label>
              <div className={`flex items-center px-4 py-3 bg-gray-800/30 border ${errors.month ? 'border-red-500/50' : 'border-gray-700/50 hover:border-[#00d0cb]/40'} rounded-xl transition-all`}>
                <input 
                  type="month" 
                  value={form.month}
                  onChange={(e) => setForm(p => ({ ...p, month: e.target.value }))}
                  className="bg-transparent border-none w-full text-white text-sm font-medium outline-none focus:ring-0 appearance-none filter-invert" 
                />
              </div>
              {errors.month && <p className="text-red-400 text-[10px] font-bold uppercase mt-1.5 ml-1 tracking-wider">{errors.month}</p>}
            </div>

            {/* 3. Amount (Styled Container) */}
            <div>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiDollarSign className="text-[#22c55e]" size={12} /> Amount *
              </label>
              <div className={`flex items-center gap-3 px-4 py-3 bg-gray-800/30 border ${errors.amount ? 'border-red-500/50' : 'border-gray-700/50 hover:border-[#22c55e]/40'} rounded-xl transition-all`}>
                <span className="text-gray-500 text-sm font-bold">$</span>
                <input 
                  type="number" 
                  value={form.amount}
                  onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="bg-transparent border-none w-full text-white text-sm font-medium outline-none focus:ring-0 placeholder-gray-600"
                  placeholder="0.00" 
                  min="0.01" 
                  step="0.01" 
                />
              </div>
              {errors.amount && <p className="text-red-400 text-[10px] font-bold uppercase mt-1.5 ml-1 tracking-wider">{errors.amount}</p>}
            </div>

            {/* 4. Payment Date (Styled Container) */}
            <div>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiCalendar className="text-[#902bd1]" size={12} /> Payment Date *
              </label>
              <div className={`flex items-center px-4 py-3 bg-gray-800/30 border ${errors.payment_date ? 'border-red-500/50' : 'border-gray-700/50 hover:border-[#902bd1]/40'} rounded-xl transition-all`}>
                <input 
                  type="date" 
                  value={form.payment_date}
                  onChange={(e) => setForm(p => ({ ...p, payment_date: e.target.value }))}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="bg-transparent border-none w-full text-white text-sm font-medium outline-none focus:ring-0 appearance-none filter-invert" 
                />
              </div>
              {errors.payment_date && <p className="text-red-400 text-[10px] font-bold uppercase mt-1.5 ml-1 tracking-wider">{errors.payment_date}</p>}
            </div>

            {/* 5. Payment Method Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiCreditCard className="text-[#4fb0ff]" size={12} /> Payment Method
              </label>
              <button 
                type="button"
                onClick={() => {
                  setShowMethodDropdown(!showMethodDropdown);
                  setShowPlayerDropdown(false);
                  setShowStatusDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#4fb0ff]/40 rounded-xl text-white outline-none transition-all"
              >
                <div className="flex items-center gap-2">
                  {methods.find(m => m.id === form.method)?.icon || <FiDollarSign className="text-gray-400" />}
                  <span className="text-sm font-medium">
                    {methods.find(m => m.id === form.method)?.name || 'Select Method'}
                  </span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${showMethodDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showMethodDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                  >
                    {methods.map(method => (
                      <div 
                        key={method.id}
                        onClick={() => handleSelect('method', method.id, setShowMethodDropdown)}
                        className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          {method.icon}
                          <span className="font-medium">{method.name}</span>
                        </div>
                        {form.method === method.id && <FiCheck className="text-[#4fb0ff]" />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. Status Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiCheckCircle className="text-green-400" size={12} /> Status
              </label>
              <button 
                type="button"
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowPlayerDropdown(false);
                  setShowMethodDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-green-500/40 rounded-xl text-white outline-none transition-all"
              >
                <div className="flex items-center gap-2">
                  {statuses.find(s => s.id === form.status)?.icon || <FiActivity className="text-gray-400" />}
                  <span className="text-sm font-medium">
                    {statuses.find(s => s.id === form.status)?.name || 'Select Status'}
                  </span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showStatusDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                  >
                    {statuses.map(status => (
                      <div 
                        key={status.id}
                        onClick={() => handleSelect('status', status.id, setShowStatusDropdown)}
                        className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          {status.icon}
                          <span className="font-medium">{status.name}</span>
                        </div>
                        {form.status === status.id && <FiCheck className="text-green-400" />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Notes (Styled Container) */}
          <div>
            <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Notes (Optional)</label>
            <textarea value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              rows="3"
              className="w-full px-4 py-3 bg-gray-800/20 border border-gray-700/50 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-[#00d0cb]/40 transition-all placeholder-gray-600 resize-none"
              placeholder="Any additional notes..." />
          </div>

          {/* Receipt Upload (Enhanced) */}
          <div>
            <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Receipt (Optional)</label>
            <label className="cursor-pointer block group">
              <div className="flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-700/50 rounded-2xl group-hover:border-[#00d0cb]/40 group-hover:bg-white/5 transition-all shadow-inner">
                {form.receipt ? (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-2 border border-gray-700/50">
                      <FiDownload className="text-[#00d0cb]" />
                    </div>
                    <div className="font-bold text-xs text-white truncate max-w-[200px]">{form.receipt.name}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{Math.round(form.receipt.size / 1024)} KB</div>
                  </div>
                ) : (
                  <div className="text-center group-hover:scale-110 transition-transform duration-300">
                    <FiDownload className="mx-auto text-gray-500 text-2xl mb-2 transition-colors group-hover:text-[#00d0cb]" />
                    <p className="text-xs text-gray-400 font-medium">Click or drag to upload receipt</p>
                  </div>
                )}
                <input type="file" onChange={(e) => setForm(p => ({ ...p, receipt: e.target.files[0] }))}
                  className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-700/50">
            <button type="button"
              onClick={() => {
                setForm({ player: '', amount: '', payment_date: format(new Date(), 'yyyy-MM-dd'), month: currentMonth, method: 'cash', status: 'Completed', notes: '', receipt: null });
                setPlayerSearch('');
              }}
              className="px-6 py-3 bg-gray-800/20 text-gray-400 text-xs font-bold uppercase tracking-widest rounded-xl border border-gray-700/50 hover:bg-gray-700/50 hover:text-white transition-all">
              Clear Form
            </button>
            <motion.button type="submit" disabled={isSubmitting}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-8 py-3 text-white text-xs font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-[#00d0cb]/10 border border-white/10"
              style={{ background: 'linear-gradient(135deg, #4fb0ff 0%, #902bd1 100%)' }}>
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing...</>
              ) : (
                <><FiCheck className="text-base" />Record Payment</>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddPaymentTab;
