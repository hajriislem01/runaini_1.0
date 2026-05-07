import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEyeOff, FiEye, FiClipboard, FiPlus, FiTrash2, FiShield, FiCheckSquare, FiSquare, FiUsers, FiTarget } from 'react-icons/fi';
import { strengthColors, strengthLabels } from '../utils/coachHelpers';

const CoachFormModal = ({
  showModal, setShowModal, editCoachId, isLoading,
  formData, setFormData, handleChange, handlePasswordChange, handleSubmit,
  showPassword, setShowPassword, passwordStrength, resetForm,
  groups, subgroups, apiError
}) => {
  const [selGrp, setSelGrp]   = React.useState('');
  const [showGrpDropdown, setShowGrpDropdown] = React.useState(false);
  const [showSgDropdown, setShowSgDropdown] = React.useState(false);
  
  // Custom sync logic for auto-activation
  const handleGroupActivation = (groupId) => {
    if (!groupId) {
      setSelGrp('');
      return;
    }
    const gId = parseInt(groupId);
    setSelGrp(String(gId));
    
    // Auto-add to assignments if not present
    if (!(formData.assignments || []).some(a => parseInt(a.group_id) === gId)) {
      setFormData(prev => ({
        ...prev,
        assignments: [...(prev.assignments || []), { group_id: gId, full_access: false, subgroups: [] }]
      }));
    }
  };

  const toggleGroupSelection = (groupId) => {
    const gId = parseInt(groupId);
    const isAssigned = (formData.assignments || []).some(a => parseInt(a.group_id) === gId);
    
    if (isAssigned) {
      // Remove assignment
      setFormData(prev => ({
        ...prev,
        assignments: (prev.assignments || []).filter(a => parseInt(a.group_id) !== gId)
      }));
      if (String(selGrp) === String(gId)) setSelGrp('');
    } else {
      // Add assignment and focus
      handleGroupActivation(gId);
    }
  };

  // Close dropdowns on click outside
  React.useEffect(() => {
    const close = () => {
      setShowSgDropdown(false);
      setShowGrpDropdown(false);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Real-time synchronization & Debugging
  const displaySubgroups = React.useMemo(() => {
    if (!selGrp) return [];
    const filtered = (subgroups || []).filter(s => Number(s.group) === Number(selGrp));
    console.log(`🔍 [CoachAssignment] Group: ${selGrp} | Units Found: ${filtered.length}`);
    return filtered;
  }, [selGrp, subgroups]);

  if (!showModal) return null;

  const currentAss = selGrp ? (formData.assignments || []).find(a => Number(a.group_id) === Number(selGrp)) : null;

  const toggleSg = (sgId) => {
    if (!selGrp) return;
    const gId = parseInt(selGrp);

    setFormData(prev => {
      const assignments = [...(prev.assignments || [])];
      const index = assignments.findIndex(a => parseInt(a.group_id) === gId);
      if (index === -1) return prev;

      const ass = { ...assignments[index] };
      const sgs = [...(ass.subgroups || [])];
      
      const idx = sgs.indexOf(sgId);
      if (idx > -1) {
        sgs.splice(idx, 1);
      } else {
        sgs.push(sgId);
      }
      
      ass.subgroups = sgs;

      // Smart Full Access Logic: Auto-flag if all subgroups checked
      const available = (subgroups || []).filter(s => parseInt(s.group) === gId);
      ass.full_access = available.length > 0 && sgs.length === available.length;
      
      assignments[index] = ass;
      return { ...prev, assignments };
    });
  };

  const removeAssignment = (groupId) => {
    setFormData(prev => ({
      ...prev,
      assignments: (prev.assignments || []).filter(a => String(a.group_id) !== String(groupId))
    }));
    if (String(selGrp) === String(groupId)) {
      setSelGrp('');
    }
  };

  return (
    <AnimatePresence>
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
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium"
                >
                  {apiError}
                </motion.div>
              )}
              {/* Accessibility hidden username field for password managers */}
              <input type="text" name="username_hidden" autoComplete="username" value={formData.username || formData.email || ''} readOnly style={{ display: 'none' }} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
                    required disabled={!!editCoachId} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="username"
                    className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none"
                    required disabled={!!editCoachId} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password {!editCoachId && '*'}
                  </label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password"
                      value={formData.password} onChange={handlePasswordChange}
                      autoComplete="new-password"
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

              {/* 🔐 Assignments Section */}
              <div className="p-5 bg-gray-800/40 rounded-2xl border border-gray-700/30 space-y-4">
                {/* TWIN CUSTOM SELECTORS - MIRROR EFFECT */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 p-1">
                  
                  {/* 1. Group Multi-Select */}
                  <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
                      <FiUsers size={10} className="text-[#902bd1]" /> Select Groups
                    </label>
                    <button 
                      type="button"
                      onClick={() => { setShowGrpDropdown(!showGrpDropdown); setShowSgDropdown(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 border border-gray-700/50 hover:border-[#902bd1]/40 rounded-xl text-xs transition-all"
                    >
                      <span className="text-gray-300 truncate font-medium">
                        {(formData.assignments || []).length > 0 
                          ? `${formData.assignments.length} Groups Assigned` 
                          : 'Choose domains...'}
                      </span>
                      <div className={`transition-transform duration-200 ${showGrpDropdown ? 'rotate-180' : ''}`}>
                        <FiUsers className={(formData.assignments || []).length > 0 ? 'text-[#902bd1]' : 'text-gray-600'} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {showGrpDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 w-full z-[160] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto"
                        >
                          <div className="p-2 space-y-1">
                            {(groups || []).map(g => {
                              const isSel = (formData.assignments || []).some(a => parseInt(a.group_id) === g.id);
                              return (
                                <label key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-all">
                                  <div 
                                    onClick={() => toggleGroupSelection(g.id)}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSel ? 'bg-[#902bd1] border-[#902bd1]' : 'border-gray-600 group-hover:border-gray-500'}`}
                                  >
                                    {isSel && <FiCheckSquare className="text-white" size={14} />}
                                  </div>
                                  <span className={`text-[13px] font-medium transition-colors ${isSel ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{g.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 2. Subgroup Multi-Select (Contextual Mirror) */}
                  <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
                      <FiTarget size={10} className="text-[#00d0cb]" /> Units Access
                    </label>
                    <button 
                      type="button"
                      disabled={!selGrp}
                      onClick={() => { setShowSgDropdown(!showSgDropdown); setShowGrpDropdown(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 border rounded-xl text-xs transition-all ${!selGrp ? 'opacity-20 border-gray-800' : 'border-gray-700/50 hover:border-[#00d0cb]/40'}`}
                    >
                      <span className="text-gray-300 truncate font-medium">
                        {currentAss?.full_access 
                          ? 'All Subgroups (Full)' 
                          : (currentAss?.subgroups || []).length > 0 
                            ? `${currentAss.subgroups.length} Selected` 
                            : selGrp ? 'Open unit selector...' : 'Pick a Group first'}
                      </span>
                      <div className={`transition-transform duration-200 ${showSgDropdown ? 'rotate-180' : ''}`}>
                        <FiTarget className={selGrp ? 'text-[#00d0cb]' : 'text-gray-700'} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {showSgDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 w-full z-[150] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto"
                        >
                          <div className="p-2 space-y-1">
                            {displaySubgroups.map(sg => {
                              const isSel = (currentAss?.subgroups || []).includes(sg.id);
                              return (
                                <label key={sg.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-all">
                                  <div 
                                    onClick={() => toggleSg(sg.id)}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSel ? 'bg-[#00d0cb] border-[#00d0cb]' : 'border-gray-600 group-hover:border-gray-500'}`}
                                  >
                                    {isSel && <FiCheckSquare className="text-white" size={14} />}
                                  </div>
                                  <span className={`text-[13px] font-medium transition-colors ${isSel ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{sg.name}</span>
                                </label>
                              );
                            })}
                            
                            {/* DYNAMIC FEEDBACK MESSAGES */}
                            {!selGrp && <div className="p-4 text-center text-xs text-gray-500 italic">Activate a group first.</div>}
                            {selGrp && isLoading && displaySubgroups.length === 0 && <div className="p-4 text-center text-xs text-[#00d0cb] animate-pulse">Syncing units...</div>}
                            {selGrp && !isLoading && displaySubgroups.length === 0 && <div className="p-4 text-center text-xs text-red-400 italic">No units for this group.</div>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Active Coach Domains List */}
                <div className="pt-4 space-y-2 border-t border-gray-700/20">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest opacity-60">Active Coach Domains</p>
                    {selGrp && (
                      <span className="text-[9px] text-[#00d0cb] font-bold animate-pulse flex items-center gap-1">
                        <FiTarget size={10} /> Currently Focused
                      </span>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {(formData.assignments || []).map(ass => {
                      const gName = (groups || []).find(g => String(g.id) === String(ass.group_id))?.name || 'Loading...';
                      const isFocused = String(selGrp) === String(ass.group_id);
                      return (
                        <motion.div 
                          layout
                          initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                          key={ass.group_id}
                          onClick={() => handleGroupActivation(ass.group_id)}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group/row ${isFocused ? 'bg-[#00d0cb]/10 border-[#00d0cb]/40 shadow-[0_0_20px_rgba(0,208,203,0.1)]' : 'bg-gray-900/40 border-gray-700/30 hover:border-gray-500'}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                            <span className={`text-xs font-black uppercase tracking-tight transition-colors ${isFocused ? 'text-[#00d0cb]' : 'text-gray-300'}`}>{gName}</span>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {ass.full_access ? (
                                <span className="px-2 py-0.5 bg-[#902bd1]/20 text-[#d48cff] border border-[#902bd1]/30 rounded-lg text-[9px] font-black tracking-widest uppercase">Full Access</span>
                              ) : (
                                (ass.subgroups || []).map(sid => {
                                  const s = subgroups?.find(x => x.id === sid);
                                  return (
                                    <span key={sid} className="px-2 py-0.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg text-[9px] font-medium">
                                      {s?.name}
                                    </span>
                                  );
                                })
                              )}
                              {!ass.full_access && (ass.subgroups || []).length === 0 && <span className="text-[9px] text-gray-600 italic">No units selected</span>}
                            </div>
                          </div>
                          <button type="button" 
                            onClick={(e) => { e.stopPropagation(); removeAssignment(ass.group_id); }}
                            className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover/row:opacity-100">
                            <FiTrash2 size={14} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {(formData.assignments || []).length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-800/50 rounded-2xl bg-gray-900/20">
                      <p className="text-xs text-gray-600 italic">No domains assigned. Use the selectors above to start.</p>
                    </div>
                  )}
                </div>
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
    </AnimatePresence>
  );
};

export default CoachFormModal;
