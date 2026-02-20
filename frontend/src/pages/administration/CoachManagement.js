import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEye, FiEyeOff, FiX, FiEdit, FiTrash2, FiUser, FiClipboard } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import API from './api';

const CoachManagement = ({ coaches, setCoaches, groups: groupsProp = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [editCoachId, setEditCoachId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Same data source as Player Management (groups from App)
  const groups = groupsProp || [];

  // Form state matches your CustomUser model (same shape as Player Management for group/subgroup)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    club: '',
    role: 'coach',
    group: '',
    subgroup: ''
  });

  // Fetch coaches
  useEffect(() => {
    const fetchCoaches = async () => {
      setIsLoading(true);
      try {
        const response = await API.get('coaches/');
        setCoaches(response.data);
      } catch (error) {
        setError('Failed to fetch coaches');
        console.error('Error:', error.response?.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoaches();
  }, [setCoaches]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Same as Player Management: when group changes, clear subgroup (subgroups are group-specific)
  const handleGroupChangeInForm = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, group: value, subgroup: '' }));
  };

  // Same data source and logic as Player Management: groups + existing entities for options
  const groupOptionsForCoach = [...new Set([
    ...groups.map(g => g.name),
    ...(coaches || []).map(c => c.group).filter(Boolean)
  ])].filter(Boolean).sort();

  const getSubgroupsForSelectedGroup = () => {
    if (!formData.group) return [];
    const g = groups.find(gr => gr.name === formData.group);
    if (g && g.subgroups && g.subgroups.filter(Boolean).length > 0) {
      return g.subgroups.map(s => (typeof s === 'object' && s && s.name != null ? s.name : (s != null ? String(s) : ''))).filter(Boolean);
    }
    return [...new Set((coaches || []).filter(c => c.group === formData.group).map(c => c.subgroup).filter(Boolean))];
  };
  const baseSubgroupOptions = getSubgroupsForSelectedGroup();
  const subgroupOptionsForCoach = formData.subgroup && !baseSubgroupOptions.includes(formData.subgroup)
    ? [...baseSubgroupOptions, formData.subgroup]
    : baseSubgroupOptions;

  // API functions
  const addCoachAPI = async (coachData) => {
    try {
      const response = await API.post('coaches/', coachData);
      return response.data;
    } catch (error) {
      console.error('Error:', error.response?.data);
      throw error;
    }
  };

  const updateCoachAPI = async (id, coachData) => {
    try {
      const payload = { ...coachData };
      // Don't send password if it's empty (not being changed)
      if (!payload.password) delete payload.password;
      
      const response = await API.put(`coaches/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error('Error:', error.response?.data);
      throw error;
    }
  };

  const deleteCoachAPI = async (id) => {
    try {
      await API.delete(`coaches/${id}/`);
    } catch (error) {
      console.error('Error:', error.response?.data);
      throw error;
    }
  };

  // Form handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!editCoachId && passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.');
      setIsLoading(false);
      return;
    }

    try {
      if (editCoachId) {
        const updatedCoach = await updateCoachAPI(editCoachId, formData);
        setCoaches(coaches.map(c => (c.id === editCoachId ? updatedCoach : c)));
      } else {
        const newCoach = await addCoachAPI(formData);
        setCoaches(prev => [...prev, newCoach]);
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(
        err.response?.data?.username?.[0] ||
        err.response?.data?.error ||
        'Failed to save coach'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (coach) => {
    setFormData({
      username: coach.username,
      email: coach.email,
      password: '',
      phone: coach.phone || '',
      club: coach.club || '',
      role: coach.role || 'coach',
      group: coach.group || '',
      subgroup: coach.subgroup || ''
    });
    setEditCoachId(coach.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coach?')) return;
    setIsLoading(true);
    try {
      await deleteCoachAPI(id);
      setCoaches(coaches.filter(coach => coach.id !== id));
    } catch (err) {
      setError('Failed to delete coach');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      phone: '',
      club: '',
      role: 'coach',
      group: '',
      subgroup: ''
    });
    setPasswordStrength(0);
    setEditCoachId(null);
    setShowPassword(false);
    setError(null);
  };

  // UI helpers
  const filteredCoaches = coaches.filter(coach => {
    const username = coach.username ? coach.username.toLowerCase() : '';
    const email = coach.email ? coach.email.toLowerCase() : '';
    const club = coach.club ? coach.club.toLowerCase() : '';
    const searchTermLower = searchTerm.toLowerCase();

    return (
      username.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      club.includes(searchTermLower)
    );
  });

  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-400',
    'bg-green-600'
  ];

  const roleColors = {
    head_coach: 'from-[#902bd1] to-[#4fb0ff]',
    coach: 'from-[#902bd1] to-[#7c3aed]',
    assistant_coach: 'from-[#4fb0ff] to-[#059669]'
  };

  const roleLabels = {
    head_coach: 'Head Coach',
    coach: 'Coach',
    assistant_coach: 'Assistant Coach'
  };

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

  return (
    <motion.div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-xs p-4 rounded-xl shadow-lg backdrop-blur-sm border bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700/50 text-red-100">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Coach Management
              </h1>
              <p className="text-gray-300 mt-2 text-base sm:text-lg">
                {isLoading ? 'Loading...' : `${coaches.length} coach${coaches.length !== 1 ? 'es' : ''} registered`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-900/65 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#7c3aed] flex items-center justify-center text-white font-bold">
                  <FiClipboard className="text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-white">Admin Access</p>
                  <p className="text-xs text-gray-400">Full Permissions</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                disabled={isLoading}
              >
                <FiPlus />
                Add Coach
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or club..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900/65 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Coaches Grid */}
        {isLoading && !coaches.length ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
          </div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCoaches.length > 0 ? filteredCoaches.map((coach) => (
              <motion.div
                key={coach.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${roleColors[coach.role] || roleColors.coach} flex items-center justify-center`}>
                        <FiUser className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{coach.username}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${roleColors[coach.role] || roleColors.coach} text-white`}>
                          {roleLabels[coach.role] || coach.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(coach)}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all duration-200"
                        title="Edit coach"
                      >
                        <FiEdit size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(coach.id)}
                        className="p-2 rounded-lg bg-gradient-to-r from-red-900/20 to-red-800/20 text-red-400 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-200"
                        title="Delete coach"
                      >
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="ml-2 text-white">{coach.email}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="text-sm font-medium">Club:</span>
                      <span className="ml-2 text-white">{coach.club || 'No club'}</span>
                    </div>
                    {coach.phone && (
                      <div className="flex items-center text-gray-300">
                        <span className="text-sm font-medium">Phone:</span>
                        <span className="ml-2 text-white">{coach.phone}</span>
                      </div>
                    )}
                    {(coach.group || coach.subgroup) && (
                      <div className="flex flex-col text-gray-300">
                        <span className="text-sm font-medium mb-1">Group / Sub-group:</span>
                        <div className="flex flex-wrap gap-1">
                          {coach.group && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#902bd1]/20 to-[#7c3aed]/20 text-purple-300 border border-purple-700/30">
                              {coach.group}
                            </span>
                          )}
                          {coach.subgroup && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] border border-[#4fb0ff]/30">
                              {coach.subgroup}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700/50">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{coach.teams ?? 0}</div>
                        <div className="text-xs text-gray-400">Teams</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{coach.rating ?? '–'}</div>
                        <div className="text-xs text-gray-400">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <motion.div
                variants={itemVariants}
                className="lg:col-span-3 bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4fb0ff]/20 to-[#902bd1]/20 flex items-center justify-center mx-auto mb-6">
                  <FiUser className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No coaches found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first coach'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl hover:from-[#4fb0ff]/90 hover:to-[#00d0cb]/90 transition-all duration-300 flex items-center gap-2 font-medium mx-auto"
                >
                  <FiPlus />
                  Add Coach
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-5 md:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                      {editCoachId ? 'Edit Coach' : 'Add New Coach'}
                    </h2>
                    <motion.button
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <FiX size={20} />
                    </motion.button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                          required
                          disabled={!!editCoachId}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                          required
                          disabled={!!editCoachId}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Password {!editCoachId && '*'}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                            required={!editCoachId}
                            placeholder={editCoachId ? 'Leave blank to keep current' : ''}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                          </button>
                        </div>
                        {!editCoachId && formData.password && (
                          <div className="mt-2">
                            <div className="flex gap-1 h-1.5 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 rounded-full ${i < passwordStrength ? strengthColors[i] : 'bg-gray-700'}`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-400">
                              {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter password'}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Club</label>
                        <input
                          type="text"
                          name="club"
                          value={formData.club}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                        >
                          <option value="coach" className="bg-gray-800">Coach</option>
                          <option value="head_coach" className="bg-gray-800">Head Coach</option>
                          <option value="assistant_coach" className="bg-gray-800">Assistant Coach</option>
                        </select>
                      </div>
                    </div>

                    {/* Group & Sub-group: same UI flow as Player Management */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Group</label>
                        <select
                          name="group"
                          value={formData.group}
                          onChange={handleGroupChangeInForm}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                        >
                          <option value="" className="bg-gray-800">Select group</option>
                          {groupOptionsForCoach.map((name) => (
                            <option key={name} value={name} className="bg-gray-800">{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {formData.group && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Sub-group</label>
                          <select
                            name="subgroup"
                            value={formData.subgroup}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                          >
                            <option value="" className="bg-gray-800">{subgroupOptionsForCoach.length > 0 ? 'Select sub-group' : 'No sub-groups'}</option>
                            {subgroupOptionsForCoach.map((name) => (
                              <option key={name} value={name} className="bg-gray-800">{name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowModal(false)}
                        className="px-5 py-2.5 bg-gray-800/50 text-gray-300 rounded-xl font-medium hover:bg-gray-700/50 transition-all border border-gray-700/50"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2 min-w-32 justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiClipboard />
                            {editCoachId ? 'Save Changes' : 'Add Coach'}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CoachManagement;