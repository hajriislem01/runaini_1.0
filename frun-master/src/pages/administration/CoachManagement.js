import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEye, FiEyeOff, FiX, FiEdit, FiTrash2, FiUser, FiClipboard } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import API from './api';
import toast, { Toaster } from 'react-hot-toast';

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [editCoachId, setEditCoachId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    club: '',
    role: 'coach',
    group: '',
    subgroup: '',
    specialization: '',
    years_of_experience: '',
    certification: '',
  });

  // ✅ Fetch coaches + groups
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [coachesRes, groupsRes, subgroupsRes] = await Promise.all([
        API.get('coaches/'),
        API.get('groups/'),
        API.get('subgroups/')
      ]);
      setCoaches(coachesRes.data);
      setGroups(groupsRes.data);
      setSubgroups(subgroupsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const filteredSubgroups = subgroups.filter(
    sub => String(sub.group) === String(formData.group)
  );

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

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || (!editCoachId && !formData.password)) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!editCoachId && passwordStrength < 3) {
      toast.error('Password is too weak');
      return;
    }

    setIsLoading(true);
    try {
      if (editCoachId) {
        // ✅ PUT pour modifier
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const response = await API.put(`coaches/${editCoachId}/`, payload);
        setCoaches(prev => prev.map(c => c.id === editCoachId ? response.data : c));
        toast.success('Coach updated successfully');
      } else {
        // ✅ POST signup/coach/ pour créer
        const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          club: formData.club,
          specialization: formData.specialization,
          years_of_experience: formData.years_of_experience || 0,
          certification: formData.certification,
        };
        await API.post('signup/coach/', payload);
        toast.success('Coach created successfully');
        await fetchAll(); // ✅ Refresh la liste
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data
        ? JSON.stringify(err.response.data)
        : 'Failed to save coach';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (coach) => {
    const firstGroup = coach.groups?.[0] ?? null;
    setFormData({
      username: coach.username || '',
      email: coach.email || '',
      password: '',
      phone: coach.phone || '',
      club: coach.club || '',
      role: 'coach',
      group: firstGroup ? String(firstGroup.id) : '',
      subgroup: '',
      specialization: coach.coach_profile?.specialization || '',
      years_of_experience: coach.coach_profile?.years_of_experience || '',
      certification: coach.coach_profile?.certification || '',
    });
    setEditCoachId(coach.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coach?')) return;
    try {
      await API.delete(`coaches/${id}/`);
      setCoaches(prev => prev.filter(c => c.id !== id));
      toast.success('Coach deleted');
    } catch (err) {
      toast.error('Failed to delete coach');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '', email: '', password: '', phone: '', club: '',
      role: 'coach', group: '', subgroup: '',
      specialization: '', years_of_experience: '', certification: '',
    });
    setPasswordStrength(0);
    setEditCoachId(null);
    setShowPassword(false);
  };

  const filteredCoaches = coaches.filter(coach => {
    const term = searchTerm.toLowerCase();
    return (
      coach.username?.toLowerCase().includes(term) ||
      coach.email?.toLowerCase().includes(term) ||
      coach.club?.toLowerCase().includes(term)
    );
  });

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Coach Management
              </h1>
              <p className="text-gray-300 mt-2">
                {isLoading ? 'Loading...' : `${coaches.length} coach${coaches.length !== 1 ? 'es' : ''} registered`}
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl font-medium flex items-center gap-2">
              <FiPlus />Add Coach
            </motion.button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, email, or club..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </motion.div>

        {/* Coaches Grid */}
        {isLoading && !coaches.length ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
          </div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCoaches.length > 0 ? filteredCoaches.map(coach => (
              <motion.div key={coach.id} variants={itemVariants} whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                        <FiUser className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{coach.username}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#902bd1]/20 to-[#4fb0ff]/20 text-purple-300">
                          Coach
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(coach)}
                        className="p-2 rounded-lg bg-[#4fb0ff]/20 text-[#80a8ff] hover:bg-[#4fb0ff]/30">
                        <FiEdit size={18} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(coach.id)}
                        className="p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30">
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300 text-sm">
                      <span className="font-medium w-16">Email:</span>
                      <span className="text-white truncate">{coach.email}</span>
                    </div>
                    {coach.phone && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <span className="font-medium w-16">Phone:</span>
                        <span className="text-white">{coach.phone}</span>
                      </div>
                    )}
                    {coach.club && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <span className="font-medium w-16">Club:</span>
                        <span className="text-white">{coach.club}</span>
                      </div>
                    )}

                    {/* ✅ Groups */}
                    {coach.groups?.length > 0 && (
                      <div className="pt-2">
                        <span className="text-sm font-medium text-gray-300">Groups:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {coach.groups.map(g => (
                            <span key={g.id} className="px-2 py-1 text-xs rounded-full bg-[#902bd1]/20 text-purple-300 border border-purple-700/30">
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700/50">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{coach.groups?.length || 0}</div>
                        <div className="text-xs text-gray-400">Groups</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          {coach.coach_profile?.years_of_experience || '—'}
                        </div>
                        <div className="text-xs text-gray-400">Exp (yrs)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <motion.div variants={itemVariants} className="lg:col-span-3 bg-gray-900/65 rounded-2xl border border-gray-700/50 p-8 text-center">
                <FiUser className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No coaches found</h3>
                <p className="text-gray-400 mb-6">{searchTerm ? 'Try adjusting your search' : 'Start by adding your first coach'}</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { resetForm(); setShowModal(true); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl flex items-center gap-2 font-medium mx-auto">
                  <FiPlus />Add Coach
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                      {editCoachId ? 'Edit Coach' : 'Add New Coach'}
                    </h2>
                    <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50">
                      <FiX size={20} />
                    </motion.button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
                          required disabled={!!editCoachId} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
                          required disabled={!!editCoachId} />
                      </div>
                    </div>

                    {/* Password & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Password {!editCoachId && '*'}
                        </label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} name="password"
                            value={formData.password} onChange={handlePasswordChange}
                            className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
                            required={!editCoachId}
                            placeholder={editCoachId ? 'Leave blank to keep current' : ''} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                          </button>
                        </div>
                        {!editCoachId && formData.password && (
                          <div className="mt-2">
                            <div className="flex gap-1 h-1.5 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className={`flex-1 rounded-full ${i < passwordStrength ? strengthColors[i] : 'bg-gray-700'}`} />
                              ))}
                            </div>
                            <p className="text-xs text-gray-400">{passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ''}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none" />
                      </div>
                    </div>

                    {/* Club & Specialization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Club</label>
                        <input type="text" name="club" value={formData.club} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                        <input type="text" name="specialization" value={formData.specialization} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
                          placeholder="e.g., Youth Development" />
                      </div>
                    </div>

                    {/* Years & Certification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience</label>
                        <input type="number" name="years_of_experience" value={formData.years_of_experience}
                          onChange={handleChange} min="0"
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
                          placeholder="5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Certification</label>
                        <input type="text" name="certification" value={formData.certification} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
                          placeholder="UEFA Pro License" />
                      </div>
                    </div>

                    {/* Group & Subgroup */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Group</label>
                        <select name="group" value={formData.group}
                          onChange={(e) => setFormData(p => ({ ...p, group: e.target.value, subgroup: '' }))}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none">
                          <option value="" className="bg-gray-800">Select group (optional)</option>
                          {groups.map(g => (
                            <option key={g.id} value={g.id} className="bg-gray-800">{g.name}</option>
                          ))}
                        </select>
                      </div>
                      {formData.group && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Sub-group</label>
                          <select name="subgroup" value={formData.subgroup} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none">
                            <option value="" className="bg-gray-800">
                              {filteredSubgroups.length > 0 ? 'Select sub-group' : 'No sub-groups'}
                            </option>
                            {filteredSubgroups.map(s => (
                              <option key={s.id} value={s.id} className="bg-gray-800">{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                      <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                        className="px-5 py-2.5 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700/50 hover:bg-gray-700/50">
                        Cancel
                      </button>
                      <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-70">
                        {isLoading ? (
                          <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>Processing...</>
                        ) : (
                          <><FiClipboard />{editCoachId ? 'Save Changes' : 'Add Coach'}</>
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