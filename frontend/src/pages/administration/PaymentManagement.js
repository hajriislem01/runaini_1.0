import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiPlus, FiDownload, FiEye, FiXCircle, FiFilter, 
  FiPrinter, FiDollarSign, FiCalendar, FiUser, FiUsers, 
  FiCreditCard, FiCheckCircle, FiX, FiTrendingUp, FiZap, FiFileText 
} from 'react-icons/fi';
import { FaMoneyBillWave, FaRegCalendarCheck } from 'react-icons/fa';
import { format, parseISO, isBefore, isAfter } from 'date-fns';

const PaymentManagement = ({ players = [], groups = [] }) => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [showPaidPlayers, setShowPaidPlayers] = useState(false);
  const [showUnpaidPlayers, setShowUnpaidPlayers] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState(() => {
    const saved = localStorage.getItem('paymentHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPlayerListModal, setShowPlayerListModal] = useState(false);
  const [playerListType, setPlayerListType] = useState('all');
  const [errors, setErrors] = useState({});
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receipt, setReceipt] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [viewReceipt, setViewReceipt] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState({ title: '', players: [] });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filteredPaymentHistory, setFilteredPaymentHistory] = useState([]);
  const [filters, setFilters] = useState({
    method: 'all',
    startDate: '',
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [paymentSummary, setPaymentSummary] = useState({
    totalPayments: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0
  });
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalPlayers, setModalPlayers] = useState([]);

  // Save to localStorage whenever paymentHistory changes
  useEffect(() => {
    localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  // Get subgroups for a group
  const getSubgroupsForGroup = (groupId) => {
    if (!groupId || !groups) return [];
    const group = groups.find(g => g.id === groupId);
    return group ? group.subgroups : [];
  };

  // Get paid player IDs from payment history
  const paidPlayerIds = (paymentHistory || []).map(payment => payment?.playerId);

  // Safely get players in selected group and subgroup with payment status filter
  const groupPlayers = selectedGroup
    ? (players || []).filter(player => {
      const matchesGroup = player?.groupId === selectedGroup;
      const matchesSubgroup = !selectedSubgroup || player?.subgroupId === selectedSubgroup;
      const matchesPaymentStatus =
        (showPaidPlayers && paidPlayerIds.includes(player?.id)) ||
        (showUnpaidPlayers && !paidPlayerIds.includes(player?.id)) ||
        (!showPaidPlayers && !showUnpaidPlayers);

      return matchesGroup && matchesSubgroup && matchesPaymentStatus;
    })
    : (players || []).filter(player => {
      const matchesPaymentStatus =
        (showPaidPlayers && paidPlayerIds.includes(player?.id)) ||
        (showUnpaidPlayers && !paidPlayerIds.includes(player?.id)) ||
        (!showPaidPlayers && !showUnpaidPlayers);

      return matchesPaymentStatus;
    });

  // Filter players based on payment status
  const paidPlayers = groupPlayers.filter(player =>
    paidPlayerIds.includes(player?.id)
  );

  const unpaidPlayers = groupPlayers.filter(player =>
    !paidPlayerIds.includes(player?.id)
  );

  // Handle showing players based on status
  const handleShowPlayers = (type) => {
    let title = '';
    let players = [];

    switch (type) {
      case 'all':
        title = 'All Players';
        players = groupPlayers;
        break;
      case 'paid':
        title = 'Paid Players';
        players = paidPlayers;
        break;
      case 'unpaid':
        title = 'Unpaid Players';
        players = unpaidPlayers;
        break;
      default:
        return;
    }

    setModalTitle(title);
    setModalPlayers(players);
    setShowPlayersModal(true);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!selectedPlayer) {
      newErrors.selectedPlayer = 'Please select a player';
    }

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      newErrors.amountPaid = 'Please enter a valid amount';
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Please select a payment date';
    } else if (isAfter(new Date(paymentDate), new Date())) {
      newErrors.paymentDate = 'Payment date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle payment submission
  const handleAddPayment = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const player = (players || []).find(p => p?.id === selectedPlayer);
    const newPayment = {
      id: `PAY-${Date.now()}`,
      playerId: selectedPlayer,
      playerName: player?.name,
      playerEmail: player?.email,
      groupId: player?.groupId,
      groupName: player?.group,
      subgroupId: player?.subgroupId,
      subgroupName: player?.subgroup,
      amount: parseFloat(amountPaid),
      date: paymentDate,
      method: paymentMethod,
      receipt: receipt,
      status: 'Completed',
      timestamp: new Date().toISOString()
    };

    setPaymentHistory(prev => [newPayment, ...(prev || [])]);
    setNotification({
      message: `Payment of $${newPayment.amount.toFixed(2)} recorded for ${newPayment.playerName}`,
      type: 'success'
    });

    // Reset form
    setSelectedPlayer('');
    setAmountPaid('');
    setPaymentMethod('cash');
    setReceipt(null);
  };

  // Handle payment deletion
  const handleDeletePayment = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      setPaymentHistory(prev => (prev || []).filter(payment => payment?.id !== paymentId));
      setNotification({
        message: 'Payment record deleted',
        type: 'info'
      });
    }
  };

  const handleRequestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30';
      case 'Pending': return 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30';
      case 'Failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  // Update the filtering useEffect
  useEffect(() => {
    let filtered = [...paymentHistory];

    // First apply group and subgroup filters
    if (selectedGroup) {
      filtered = filtered.filter(payment => payment.groupId === selectedGroup);
    }
    if (selectedSubgroup) {
      filtered = filtered.filter(payment => payment.subgroupId === selectedSubgroup);
    }

    // Then apply payment status filters
    if (!showPaidPlayers && !showUnpaidPlayers && (selectedGroup || selectedSubgroup)) {
      filtered = filtered.filter(payment => payment.status === 'Completed');
    } else {
      if (showPaidPlayers) {
        filtered = filtered.filter(payment => payment.status === 'Completed');
      }
      if (showUnpaidPlayers) {
        filtered = filtered.filter(payment => payment.status !== 'Completed');
      }
    }

    // Apply method and date filters
    if (filters.method !== 'all') {
      filtered = filtered.filter(payment => payment.method === filters.method);
    }
    if (filters.startDate) {
      filtered = filtered.filter(payment => new Date(payment.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(payment => new Date(payment.date) <= new Date(filters.endDate));
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sortConfig.key === 'playerName') {
          return sortConfig.direction === 'asc'
            ? a.playerName.localeCompare(b.playerName)
            : b.playerName.localeCompare(a.playerName);
        }
        return 0;
      });
    }

    setFilteredPaymentHistory(filtered);
  }, [paymentHistory, selectedGroup, selectedSubgroup, showPaidPlayers, showUnpaidPlayers, sortConfig, filters]);

  // Add this useEffect to calculate payment summary
  useEffect(() => {
    const summary = filteredPaymentHistory.reduce((acc, payment) => {
      acc.totalPayments++;
      acc.totalAmount += payment.amount || 0;
      if (payment.status === 'Completed') {
        acc.completedAmount += payment.amount || 0;
      } else {
        acc.pendingAmount += payment.amount || 0;
      }
      return acc;
    }, {
      totalPayments: 0,
      totalAmount: 0,
      completedAmount: 0,
      pendingAmount: 0
    });

    setPaymentSummary(summary);
  }, [filteredPaymentHistory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Update the Payment History section title to show current filters
  const getPaymentHistoryTitle = () => {
    let title = 'Payment History';
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      title += ` - ${group?.name || ''}`;
      if (selectedSubgroup) {
        const subgroup = group?.subgroups?.find(sg => sg.id === selectedSubgroup);
        title += ` > ${subgroup?.name || ''}`;
      }
    }
    return title;
  };

  // Update the group selection handler
  const handleGroupChange = (e) => {
    const newGroupId = e.target.value;
    setSelectedGroup(newGroupId);
    setSelectedSubgroup('');
    setSelectedPlayer('');
  };

  // Update the subgroup selection handler
  const handleSubgroupChange = (e) => {
    const newSubgroupId = e.target.value;
    setSelectedSubgroup(newSubgroupId);
    setSelectedPlayer('');
  };

  // Update the payment status toggle buttons
  const handlePaymentStatusToggle = (type) => {
    if (type === 'all') {
      setShowPaidPlayers(false);
      setShowUnpaidPlayers(false);
    } else if (type === 'paid') {
      setShowPaidPlayers(true);
      setShowUnpaidPlayers(false);
    } else if (type === 'unpaid') {
      setShowPaidPlayers(false);
      setShowUnpaidPlayers(true);
    }
  };

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Payment Management
              </h1>
              <p className="text-gray-300 mt-2">
                Manage player payments, track payment history, and generate receipts
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-[#4fb0ff]/80 to-[#00d0cb]/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-[#4fb0ff]/40"
            >
              <p className="text-white font-medium flex items-center gap-3">
                <FiDollarSign className="text-xl" />
                Total Collected: ${paymentSummary.totalAmount.toFixed(2)}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Group Selection */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiUsers className="text-[#4fb0ff]" />
              Filter by Group
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Select Group
                </label>
                <select
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                >
                  <option value="" className="bg-gray-900">All Groups</option>
                  {(groups || []).map(group => (
                    <option key={group?.id} value={group?.id} className="bg-gray-900">
                      {group?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subgroup Selection */}
              {selectedGroup && (
                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Select Subgroup
                  </label>
                  <select
                    value={selectedSubgroup}
                    onChange={handleSubgroupChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                  >
                    <option value="" className="bg-gray-900">All Subgroups</option>
                    {getSubgroupsForGroup(selectedGroup).map(subgroup => (
                      <option key={subgroup.id} value={subgroup.id} className="bg-gray-900">
                        {subgroup.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Payment Status Toggles */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePaymentStatusToggle('all')}
            className={`py-4 rounded-xl border transition-all duration-300 ${
              !showPaidPlayers && !showUnpaidPlayers
                ? 'border-[#00d0cb] bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20'
                : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <FiUsers className="text-xl" />
              <span className="font-medium">All Players</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePaymentStatusToggle('paid')}
            className={`py-4 rounded-xl border transition-all duration-300 ${
              showPaidPlayers
                ? 'border-[#22c55e] bg-gradient-to-br from-[#22c55e]/20 to-[#4fb0ff]/20'
                : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <FiCheckCircle className="text-xl" />
              <span className="font-medium">Paid Players</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePaymentStatusToggle('unpaid')}
            className={`py-4 rounded-xl border transition-all duration-300 ${
              showUnpaidPlayers
                ? 'border-red-500 bg-gradient-to-br from-red-500/20 to-[#902bd1]/20'
                : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <FiXCircle className="text-xl" />
              <span className="font-medium">Unpaid Players</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Summary Stats */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-400" />
              Payment Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm p-4 rounded-xl border border-[#4fb0ff]/30">
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">{groupPlayers.length}</p>
                <p className="text-gray-400 text-sm">Total Players</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShowPlayers('all')}
                  className="mt-3 w-full py-2 px-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FiEye />
                  Show All
                </motion.button>
              </div>

              <div className="bg-gradient-to-br from-[#22c55e]/20 to-[#4fb0ff]/20 backdrop-blur-sm p-4 rounded-xl border border-[#22c55e]/30">
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">{paidPlayers.length}</p>
                <p className="text-gray-400 text-sm">Paid Players</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShowPlayers('paid')}
                  className="mt-3 w-full py-2 px-3 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg text-[#22c55e] hover:text-white hover:border-[#22c55e] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FiCheckCircle />
                  Show Paid
                </motion.button>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-[#902bd1]/20 backdrop-blur-sm p-4 rounded-xl border border-red-500/30">
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">{unpaidPlayers.length}</p>
                <p className="text-gray-400 text-sm">Unpaid Players</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShowPlayers('unpaid')}
                  className="mt-3 w-full py-2 px-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:text-white hover:border-red-500 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FiXCircle />
                  Show Unpaid
                </motion.button>
              </div>

              <div className="bg-gradient-to-br from-[#902bd1]/20 to-[#00d0cb]/20 backdrop-blur-sm p-4 rounded-xl border border-[#902bd1]/30">
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">
                  ${paymentSummary.totalAmount.toFixed(2)}
                </p>
                <p className="text-gray-400 text-sm">Total Collected</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.print()}
                  className="mt-3 w-full py-2 px-3 bg-[#902bd1]/10 border border-[#902bd1]/30 rounded-lg text-[#902bd1] hover:text-white hover:border-[#902bd1] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FiPrinter />
                  Print Report
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Form */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">
                  <FiPlus className="text-lg" />
                </div>
                Record New Payment
              </h2>
              {selectedGroup && (
                <div className="text-sm text-gray-400">
                  {groups.find(g => g.id === selectedGroup)?.name || ''}
                  {showPaidPlayers && ' • Paid Only'}
                  {showUnpaidPlayers && ' • Unpaid Only'}
                </div>
              )}
            </div>

            <form onSubmit={handleAddPayment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player Selection */}
                {selectedGroup && (
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                      <FiUser className="text-[#4fb0ff]" />
                      Select Player
                    </label>
                    <select
                      value={selectedPlayer}
                      onChange={(e) => {
                        setSelectedPlayer(e.target.value);
                        if (errors.selectedPlayer) {
                          setErrors(prev => ({ ...prev, selectedPlayer: '' }));
                        }
                      }}
                      className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.selectedPlayer ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}
                    >
                      <option value="" className="bg-gray-900">Select a player</option>
                      {groupPlayers.map((player) => {
                        const isPaid = paidPlayerIds.includes(player?.id);
                        return (
                          <option key={player?.id} value={player?.id} className="bg-gray-900">
                            {player?.name}
                            {isPaid ? ' • Paid' : ' • Unpaid'}
                          </option>
                        );
                      })}
                    </select>
                    {errors.selectedPlayer && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <FiXCircle /> {errors.selectedPlayer}
                      </p>
                    )}
                  </div>
                )}

                {/* Amount Paid */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiDollarSign className="text-[#22c55e]" />
                    Amount Paid
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <FiDollarSign />
                    </span>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => {
                        setAmountPaid(e.target.value);
                        if (errors.amountPaid) {
                          setErrors(prev => ({ ...prev, amountPaid: '' }));
                        }
                      }}
                      className={`pl-12 w-full px-4 py-3 bg-gray-800/50 border ${errors.amountPaid ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  {errors.amountPaid && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <FiXCircle /> {errors.amountPaid}
                    </p>
                  )}
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiCalendar className="text-[#00d0cb]" />
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => {
                      setPaymentDate(e.target.value);
                      if (errors.paymentDate) {
                        setErrors(prev => ({ ...prev, paymentDate: '' }));
                      }
                    }}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.paymentDate ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}
                  />
                  {errors.paymentDate && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <FiXCircle /> {errors.paymentDate}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiCreditCard className="text-[#902bd1]" />
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                  >
                    <option value="cash" className="bg-gray-900">Cash</option>
                    <option value="card" className="bg-gray-900">Credit/Debit Card</option>
                    <option value="bank_transfer" className="bg-gray-900">Bank Transfer</option>
                    <option value="check" className="bg-gray-900">Check</option>
                    <option value="online" className="bg-gray-900">Online Payment</option>
                  </select>
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Receipt (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-2xl hover:border-[#00d0cb] transition-colors">
                      {receipt ? (
                        <div className="text-center p-3">
                          <div className="font-medium text-white">{receipt.name}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {Math.round(receipt.size / 1024)} KB
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <FiDownload className="mx-auto text-gray-400 text-2xl mb-2" />
                          <p className="text-sm text-gray-300">Click to upload receipt</p>
                          <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG, PDF (Max 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        onChange={(e) => setReceipt(e.target.files[0])}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  </label>
                  {receipt && (
                    <button
                      type="button"
                      onClick={() => setReceipt(null)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                    >
                      <FiXCircle size={24} />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedPlayer('');
                    setAmountPaid('');
                    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
                    setPaymentMethod('cash');
                    setReceipt(null);
                    setErrors({});
                  }}
                  className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiXCircle /> Clear Form
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
                  }}
                >
                  <FiPlus /> Record Payment
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Filters and Payment History */}
        <motion.div variants={itemVariants}>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
                  <FiFilter className="text-lg" />
                </div>
                {getPaymentHistoryTitle()}
              </h2>

              <div className="flex flex-wrap gap-3">
                <div className="bg-gray-800/50 p-2 rounded-xl border border-gray-700">
                  <select
                    value={filters.method}
                    onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                    className="p-2 bg-transparent border-none text-white focus:outline-none"
                  >
                    <option value="all" className="bg-gray-900">All Methods</option>
                    <option value="cash" className="bg-gray-900">Cash</option>
                    <option value="card" className="bg-gray-900">Card</option>
                    <option value="bank_transfer" className="bg-gray-900">Bank Transfer</option>
                    <option value="check" className="bg-gray-900">Check</option>
                    <option value="online" className="bg-gray-900">Online</option>
                  </select>
                </div>

                <div className="bg-gray-800/50 p-2 rounded-xl border border-gray-700">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="p-2 bg-transparent border-none text-white focus:outline-none"
                  />
                </div>

                <div className="bg-gray-800/50 p-2 rounded-xl border border-gray-700">
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="p-2 bg-transparent border-none text-white focus:outline-none"
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
              <div className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm p-5 rounded-xl border border-[#4fb0ff]/30">
                <p className="text-gray-400 text-sm mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-white">{paymentSummary.totalPayments}</p>
              </div>
              <div className="bg-gradient-to-br from-[#22c55e]/20 to-[#4fb0ff]/20 backdrop-blur-sm p-5 rounded-xl border border-[#22c55e]/30">
                <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-white">${paymentSummary.totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#eab308]/20 to-[#4fb0ff]/20 backdrop-blur-sm p-5 rounded-xl border border-[#eab308]/30">
                <p className="text-gray-400 text-sm mb-1">Completed</p>
                <p className="text-2xl font-bold text-white">${paymentSummary.completedAmount.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-[#902bd1]/20 backdrop-blur-sm p-5 rounded-xl border border-red-500/30">
                <p className="text-gray-400 text-sm mb-1">Pending</p>
                <p className="text-2xl font-bold text-white">${paymentSummary.pendingAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-700/50">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleRequestSort('playerName')}
                    >
                      <div className="flex items-center gap-1">
                        Player
                        {sortConfig.key === 'playerName' && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleRequestSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortConfig.key === 'date' && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/30 divide-y divide-gray-700/50">
                  {filteredPaymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center py-8">
                          <FiFilter className="text-gray-400 text-3xl mb-3" />
                          <p className="text-lg">No payment records found</p>
                          <p className="text-gray-400 mt-1">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPaymentHistory.map((payment) => (
                      <tr key={payment?.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">
                              {payment?.playerName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {payment?.playerEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-[#22c55e]">
                            ${payment?.amount?.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-300">
                            {format(new Date(payment?.date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(payment?.timestamp), 'hh:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex text-sm font-medium rounded-full ${getMethodColor(payment?.method)}`}>
                            {payment?.method?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex text-sm font-medium rounded-full border ${getStatusColor(payment?.status)}`}>
                            {payment?.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setViewReceipt(payment)}
                              className="text-[#00d0cb] hover:text-[#4fb0ff] p-2 rounded-full hover:bg-[#00d0cb]/10 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={20} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeletePayment(payment?.id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                              title="Delete Payment"
                            >
                              <FiXCircle size={20} />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Player List Modal */}
      <AnimatePresence>
        {showPlayersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-700"
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiUsers className="text-[#4fb0ff]" />
                    {modalTitle}
                  </h2>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <FiPrinter size={16} />
                      Print List
                    </motion.button>
                    <button
                      onClick={() => setShowPlayersModal(false)}
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
                {modalPlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <FiUsers className="mx-auto text-gray-400 text-4xl mb-3" />
                    <p className="text-gray-400">No players found</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {modalPlayers.map((player, index) => {
                      const group = (groups || []).find(g => g?.id === player?.groupId);
                      const isPaid = paidPlayerIds.includes(player?.id);
                      return (
                        <motion.div
                          key={player?.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400">{index + 1}.</span>
                            <div>
                              <h3 className="font-medium text-white">{player?.name}</h3>
                              <p className="text-sm text-gray-400">{player?.email}</p>
                              {group && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-[#4fb0ff]/30 text-[#4fb0ff] rounded-full">
                                  {group.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${isPaid
                              ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Receipt Modal */}
      <AnimatePresence>
        {viewReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto border border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FiCreditCard className="text-[#00d0cb]" />
                    Payment Receipt
                  </h2>
                  <button
                    onClick={() => setViewReceipt(null)}
                    className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="py-4 my-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400">Transaction ID</p>
                      <p className="font-medium text-white">{viewReceipt?.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="font-medium text-white">
                        {format(parseISO(viewReceipt?.timestamp), 'MMM dd, yyyy hh:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Player</p>
                      <p className="font-medium text-white">{viewReceipt?.playerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="font-medium text-[#22c55e]">${viewReceipt?.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Payment Method</p>
                      <p className="font-medium text-white capitalize">
                        {viewReceipt?.method?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Status</p>
                      <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full border ${getStatusColor(viewReceipt?.status)}`}>
                        {viewReceipt?.status}
                      </span>
                    </div>
                  </div>
                </div>

                {viewReceipt?.receipt ? (
                  <div>
                    <h3 className="font-medium mb-2 text-white">Receipt Image</h3>
                    <img
                      src={URL.createObjectURL(viewReceipt.receipt)}
                      alt="Payment receipt"
                      className="max-w-full h-auto border border-gray-700 rounded-lg"
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No receipt attached</p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl border border-gray-700 hover:border-gray-600 flex items-center gap-2"
                  >
                    <FiPrinter size={16} /> Print
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg backdrop-blur-sm border ${notification.type === 'success' ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30' : 'bg-[#00d0cb]/20 text-[#00d0cb] border-[#00d0cb]/30'
              }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PaymentManagement;
