import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiDownload, FiEye, FiXCircle, FiFilter,
  FiPrinter, FiDollarSign, FiCalendar, FiUser, FiUsers,
  FiCreditCard, FiCheckCircle, FiX, FiTrendingUp, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { FaMoneyBillWave, FaRegCalendarCheck } from 'react-icons/fa';
import { format, addMonths, subMonths } from 'date-fns';
import API from './api';
import toast, { Toaster } from 'react-hot-toast';

const PaymentManagement = () => {
  // ✅ State principal
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total_players: 0,
    paid_count: 0,
    unpaid_count: 0,
    total_collected: 0,
    paid_player_ids: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Filtres
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | history | add

  // ✅ Formulaire paiement
  const [form, setForm] = useState({
    player: '',
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    month: format(new Date(), 'yyyy-MM'),
    method: 'cash',
    status: 'Completed',
    notes: '',
    receipt: null
  });
  const [errors, setErrors] = useState({});

  // ✅ Historique filtres
  const [historyFilters, setHistoryFilters] = useState({
    method: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });

  // ✅ Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch data
  useEffect(() => {
    fetchAll();
  }, [currentMonth, selectedGroup]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGroup) params.append('group', selectedGroup);

      const [playersRes, groupsRes, paymentsRes, statsRes] = await Promise.all([
        API.get(`players/?${params}`),
        API.get('groups/'),
        API.get(`payments/?month=${currentMonth}${selectedGroup ? `&group=${selectedGroup}` : ''}`),
        API.get(`payments/stats/?month=${currentMonth}${selectedGroup ? `&group=${selectedGroup}` : ''}`)
      ]);

      setPlayers(playersRes.data);
      setGroups(groupsRes.data);
      setPayments(paymentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  // Subgroups du groupe sélectionné
  const subgroups = useMemo(() => {
    if (!selectedGroup) return [];
    const group = groups.find(g => g.id === parseInt(selectedGroup));
    return group?.subgroups || [];
  }, [selectedGroup, groups]);

  // Joueurs filtrés
  const filteredPlayers = useMemo(() => {
    let result = players;
    if (selectedSubgroup) {
      result = result.filter(p => p.subgroup === parseInt(selectedSubgroup));
    }
    return result;
  }, [players, selectedSubgroup]);

  // Joueurs payés / non payés
  const paidPlayers = filteredPlayers.filter(p => stats.paid_player_ids.includes(p.id));
  const unpaidPlayers = filteredPlayers.filter(p => !stats.paid_player_ids.includes(p.id));

  // Historique filtré
  const filteredPayments = useMemo(() => {
    let result = [...payments];
    if (historyFilters.method !== 'all') result = result.filter(p => p.method === historyFilters.method);
    if (historyFilters.status !== 'all') result = result.filter(p => p.status === historyFilters.status);
    if (historyFilters.startDate) result = result.filter(p => p.payment_date >= historyFilters.startDate);
    if (historyFilters.endDate) result = result.filter(p => p.payment_date <= historyFilters.endDate);
    return result;
  }, [payments, historyFilters]);

  // Navigation mois
  const prevMonth = () => {
    const d = new Date(currentMonth + '-01');
    setCurrentMonth(format(subMonths(d, 1), 'yyyy-MM'));
  };
  const nextMonth = () => {
    const d = new Date(currentMonth + '-01');
    setCurrentMonth(format(addMonths(d, 1), 'yyyy-MM'));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.player) newErrors.player = 'Please select a player';
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!form.payment_date) newErrors.payment_date = 'Please select a payment date';
    if (!form.month) newErrors.month = 'Please select a month';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit paiement
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'receipt' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'receipt') {
            formData.append(key, value);
          }
        }
      });

      const response = await API.post('payments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPayments(prev => [response.data, ...prev]);
      toast.success(`Payment recorded for ${response.data.player_name} ✅`);

      // Reset form
      setForm({
        player: '',
        amount: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        month: currentMonth,
        method: 'cash',
        status: 'Completed',
        notes: '',
        receipt: null
      });
      setErrors({});
      fetchAll(); // Refresh stats
      setActiveTab('overview');
    } catch (error) {
      if (error.response?.data?.non_field_errors) {
        toast.error('This player already has a payment for this month');
      } else {
        toast.error('Failed to record payment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Supprimer paiement
  const handleDelete = async (paymentId) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await API.delete(`payments/${paymentId}/`);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      toast.success('Payment deleted');
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30';
      case 'Pending': return 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30';
      case 'Late': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-800/50 text-gray-300 border-gray-700/50';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'cash': return 'text-[#22c55e] bg-[#22c55e]/10';
      case 'card': return 'text-[#902bd1] bg-[#902bd1]/10';
      case 'bank_transfer': return 'text-[#4fb0ff] bg-[#4fb0ff]/10';
      case 'check': return 'text-[#eab308] bg-[#eab308]/10';
      case 'online': return 'text-[#00d0cb] bg-[#00d0cb]/10';
      default: return 'text-gray-400 bg-gray-800/50';
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Players', value: stats.total_players, color: '#4fb0ff', icon: <FiUsers /> },
              { label: 'Paid', value: stats.paid_count, color: '#22c55e', icon: <FiCheckCircle /> },
              { label: 'Unpaid', value: stats.unpaid_count, color: '#ef4444', icon: <FiXCircle /> },
              { label: 'Collected', value: `$${stats.total_collected?.toFixed(2) || '0'}`, color: '#902bd1', icon: <FaMoneyBillWave /> },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}
                className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
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
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiFilter className="text-[#4fb0ff]" />Filter by Group
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Group</label>
                <select value={selectedGroup}
                  onChange={(e) => { setSelectedGroup(e.target.value); setSelectedSubgroup(''); }}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                  <option value="" className="bg-gray-900">All Groups</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="bg-gray-900">{g.name}</option>
                  ))}
                </select>
              </div>
              {selectedGroup && subgroups.length > 0 && (
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Subgroup</label>
                  <select value={selectedSubgroup} onChange={(e) => setSelectedSubgroup(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                    <option value="" className="bg-gray-900">All Subgroups</option>
                    {subgroups.map(s => (
                      <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex gap-3">
            {[
              { id: 'overview', label: 'Overview', icon: <FiUsers /> },
              { id: 'add', label: 'Add Payment', icon: <FiPlus /> },
              { id: 'history', label: 'History', icon: <FaRegCalendarCheck /> },
            ].map(tab => (
              <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white shadow-lg'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700/50'
                }`}>
                {tab.icon}{tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* ✅ Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Paid Players */}
                <div className="bg-gray-900/40 rounded-2xl border border-gray-700/50 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiCheckCircle className="text-[#22c55e]" />
                    Paid Players ({paidPlayers.length})
                  </h3>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-700/30 rounded-xl animate-pulse" />)}
                    </div>
                  ) : paidPlayers.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {paidPlayers.map(player => {
                        const payment = payments.find(p => p.player === player.id);
                        return (
                          <motion.div key={player.id} whileHover={{ x: 4 }}
                            className="flex items-center justify-between p-3 bg-[#22c55e]/5 rounded-xl border border-[#22c55e]/20">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22c55e] to-[#4fb0ff] flex items-center justify-center text-white text-sm font-bold">
                                {player.full_name?.charAt(0)}
                              </div>
                              <div>
                                <div className="text-white text-sm font-medium">{player.full_name}</div>
                                <div className="text-gray-400 text-xs">{player.position}</div>
                              </div>
                            </div>
                            {payment && (
                              <div className="text-right">
                                <div className="text-[#22c55e] font-bold">${parseFloat(payment.amount).toFixed(2)}</div>
                                <div className="text-gray-400 text-xs">{payment.payment_date}</div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FiCheckCircle className="mx-auto text-3xl mb-2 opacity-30" />
                      <p>No paid players this month</p>
                    </div>
                  )}
                </div>

                {/* Unpaid Players */}
                <div className="bg-gray-900/40 rounded-2xl border border-gray-700/50 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiXCircle className="text-red-400" />
                    Unpaid Players ({unpaidPlayers.length})
                  </h3>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-700/30 rounded-xl animate-pulse" />)}
                    </div>
                  ) : unpaidPlayers.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {unpaidPlayers.map(player => (
                        <motion.div key={player.id} whileHover={{ x: 4 }}
                          className="flex items-center justify-between p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-[#902bd1] flex items-center justify-center text-white text-sm font-bold">
                              {player.full_name?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{player.full_name}</div>
                              <div className="text-gray-400 text-xs">{player.position}</div>
                            </div>
                          </div>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setForm(prev => ({ ...prev, player: player.id, month: currentMonth }));
                              setActiveTab('add');
                            }}
                            className="px-3 py-1 text-xs font-medium rounded-lg text-white"
                            style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                            Pay Now
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FiCheckCircle className="mx-auto text-3xl mb-2 text-[#22c55e] opacity-50" />
                      <p>All players paid this month! 🎉</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ✅ Add Payment Tab */}
          {activeTab === 'add' && (
            <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">
                    <FiPlus />
                  </div>
                  Record New Payment
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Player */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                        <FiUser className="text-[#4fb0ff]" />Select Player *
                      </label>
                      <select value={form.player}
                        onChange={(e) => setForm(p => ({ ...p, player: e.target.value }))}
                        className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.player ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}>
                        <option value="" className="bg-gray-900">Select a player</option>
                        {filteredPlayers.map(p => {
                          const isPaid = stats.paid_player_ids.includes(p.id);
                          return (
                            <option key={p.id} value={p.id} className="bg-gray-900">
                              {p.full_name} {isPaid ? '✅ Paid' : '❌ Unpaid'}
                            </option>
                          );
                        })}
                      </select>
                      {errors.player && <p className="text-red-400 text-sm mt-1">• {errors.player}</p>}
                    </div>

                    {/* Month */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                        <FiCalendar className="text-[#00d0cb]" />Month *
                      </label>
                      <input type="month" value={form.month}
                        onChange={(e) => setForm(p => ({ ...p, month: e.target.value }))}
                        className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.month ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`} />
                      {errors.month && <p className="text-red-400 text-sm mt-1">• {errors.month}</p>}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                        <FiDollarSign className="text-[#22c55e]" />Amount *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">$</span>
                        <input type="number" value={form.amount}
                          onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                          className={`pl-8 w-full px-4 py-3 bg-gray-800/50 border ${errors.amount ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}
                          placeholder="0.00" min="0.01" step="0.01" />
                      </div>
                      {errors.amount && <p className="text-red-400 text-sm mt-1">• {errors.amount}</p>}
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                        <FiCalendar className="text-[#902bd1]" />Payment Date *
                      </label>
                      <input type="date" value={form.payment_date}
                        onChange={(e) => setForm(p => ({ ...p, payment_date: e.target.value }))}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.payment_date ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`} />
                      {errors.payment_date && <p className="text-red-400 text-sm mt-1">• {errors.payment_date}</p>}
                    </div>

                    {/* Method */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                        <FiCreditCard className="text-[#4fb0ff]" />Payment Method
                      </label>
                      <select value={form.method}
                        onChange={(e) => setForm(p => ({ ...p, method: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                        <option value="cash" className="bg-gray-900">Cash</option>
                        <option value="card" className="bg-gray-900">Credit/Debit Card</option>
                        <option value="bank_transfer" className="bg-gray-900">Bank Transfer</option>
                        <option value="check" className="bg-gray-900">Check</option>
                        <option value="online" className="bg-gray-900">Online Payment</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Status</label>
                      <select value={form.status}
                        onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                        <option value="Completed" className="bg-gray-900">Completed</option>
                        <option value="Pending" className="bg-gray-900">Pending</option>
                        <option value="Late" className="bg-gray-900">Late</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Notes (Optional)</label>
                    <textarea value={form.notes}
                      onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Any additional notes..." />
                  </div>

                  {/* Receipt Upload */}
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Receipt (Optional)</label>
                    <label className="cursor-pointer block">
                      <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-700 rounded-xl hover:border-[#00d0cb] transition-colors">
                        {form.receipt ? (
                          <div className="text-center">
                            <div className="font-medium text-white">{form.receipt.name}</div>
                            <div className="text-sm text-gray-400">{Math.round(form.receipt.size / 1024)} KB</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <FiDownload className="mx-auto text-gray-400 text-2xl mb-1" />
                            <p className="text-sm text-gray-300">Click to upload receipt</p>
                          </div>
                        )}
                        <input type="file" onChange={(e) => setForm(p => ({ ...p, receipt: e.target.files[0] }))}
                          className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                      </div>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 justify-end pt-4">
                    <button type="button"
                      onClick={() => setForm({ player: '', amount: '', payment_date: format(new Date(), 'yyyy-MM-dd'), month: currentMonth, method: 'cash', status: 'Completed', notes: '', receipt: null })}
                      className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700">
                      Clear
                    </button>
                    <motion.button type="submit" disabled={isSubmitting}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 text-white font-semibold rounded-xl disabled:opacity-70 flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                      {isSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                      ) : (
                        <><FiPlus />Record Payment</>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ✅ History Tab */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
                      <FiFilter />
                    </div>
                    Payment History
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {['method', 'status'].map(filterKey => (
                      <select key={filterKey}
                        value={historyFilters[filterKey]}
                        onChange={(e) => setHistoryFilters(p => ({ ...p, [filterKey]: e.target.value }))}
                        className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0cb]">
                        <option value="all" className="bg-gray-900">All {filterKey}s</option>
                        {filterKey === 'method' && ['cash', 'card', 'bank_transfer', 'check', 'online'].map(m => (
                          <option key={m} value={m} className="bg-gray-900">{m.replace('_', ' ')}</option>
                        ))}
                        {filterKey === 'status' && ['Completed', 'Pending', 'Late'].map(s => (
                          <option key={s} value={s} className="bg-gray-900">{s}</option>
                        ))}
                      </select>
                    ))}
                    <input type="date" value={historyFilters.startDate}
                      onChange={(e) => setHistoryFilters(p => ({ ...p, startDate: e.target.value }))}
                      className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none" />
                    <input type="date" value={historyFilters.endDate}
                      onChange={(e) => setHistoryFilters(p => ({ ...p, endDate: e.target.value }))}
                      className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none"
                      max={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total', value: filteredPayments.length, color: '#4fb0ff' },
                    { label: 'Completed', value: filteredPayments.filter(p => p.status === 'Completed').length, color: '#22c55e' },
                    { label: 'Pending', value: filteredPayments.filter(p => p.status === 'Pending').length, color: '#eab308' },
                    { label: 'Total Amount', value: `$${filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}`, color: '#902bd1' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                      <p className="text-gray-400 text-sm mb-1">{s.label}</p>
                      <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-700/50">
                  <table className="min-w-full divide-y divide-gray-700/50">
                    <thead className="bg-gray-800/50">
                      <tr>
                        {['Player', 'Month', 'Amount', 'Date', 'Method', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900/30 divide-y divide-gray-700/50">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                            <FaRegCalendarCheck className="mx-auto text-3xl mb-3 opacity-30" />
                            <p>No payment records found</p>
                          </td>
                        </tr>
                      ) : filteredPayments.map(payment => (
                        <tr key={payment.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{payment.player_name}</div>
                            <div className="text-xs text-gray-400">{payment.group_name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{payment.month}</td>
                          <td className="px-6 py-4 text-[#22c55e] font-bold">${parseFloat(payment.amount).toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-300 text-sm">{payment.payment_date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(payment.method)}`}>
                              {payment.method?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
                                className="text-[#00d0cb] hover:text-[#4fb0ff] p-2 rounded-lg hover:bg-[#00d0cb]/10">
                                <FiEye size={18} />
                              </button>
                              <button onClick={() => handleDelete(payment.id)}
                                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10">
                                <FiXCircle size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {showModal && selectedPayment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FiCreditCard className="text-[#00d0cb]" />Payment Receipt
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Transaction ID', value: `PAY-${selectedPayment.id}` },
                  { label: 'Player', value: selectedPayment.player_name },
                  { label: 'Group', value: selectedPayment.group_name },
                  { label: 'Month', value: selectedPayment.month },
                  { label: 'Amount', value: `$${parseFloat(selectedPayment.amount).toFixed(2)}`, color: '#22c55e' },
                  { label: 'Date', value: selectedPayment.payment_date },
                  { label: 'Method', value: selectedPayment.method?.replace('_', ' ') },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="font-medium" style={{ color: item.color || 'white' }}>{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                {selectedPayment.notes && (
                  <div className="p-3 bg-gray-800/30 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Notes</div>
                    <div className="text-white">{selectedPayment.notes}</div>
                  </div>
                )}
                {selectedPayment.receipt_url && (
                  <a href={selectedPayment.receipt_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#00d0cb] hover:text-[#4fb0ff] p-3 bg-gray-800/30 rounded-xl">
                    <FiDownload />View Receipt
                  </a>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 flex items-center gap-2">
                  <FiPrinter size={16} />Print
                </button>
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PaymentManagement;