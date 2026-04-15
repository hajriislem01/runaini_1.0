import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEyeOff, FiEye, FiClipboard } from 'react-icons/fi';
import { strengthColors, strengthLabels } from '../utils/coachHelpers';

const CoachFormModal = ({
  showModal, setShowModal, editCoachId, isLoading,
  formData, setFormData, handleChange, handlePasswordChange, handleSubmit,
  showPassword, setShowPassword, passwordStrength, resetForm,
  groups, filteredSubgroups
}) => {
  if (!showModal) return null;

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
    </AnimatePresence>
  );
};

export default CoachFormModal;
