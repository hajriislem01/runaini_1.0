import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { strengthColors, strengthLabels } from '../utils/playerHelpers';

const PlayerModal = ({
  showModal, setShowModal, editPlayerId, resetForm, handleSubmit,
  formData, handleChange, handleGroupChangeInForm, handlePasswordChange,
  errors, showPassword, setShowPassword, passwordStrength,
  groupOptionsForPlayer, subgroupOptionsForPlayer
}) => {
  if (!showModal) return null;

  return (
    <AnimatePresence>
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
                {editPlayerId ? 'Edit Player' : 'Add New Player'}
              </h2>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
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
                    className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.username ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                    required
                  />
                  {errors.username && <p className="mt-2 text-sm text-red-400">{errors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.full_name ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                    required
                  />
                  {errors.full_name && <p className="mt-2 text-sm text-red-400">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.email ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                    required
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password {!editPlayerId && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.password ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                      required={!editPlayerId}
                      placeholder={editPlayerId ? "Leave blank to keep current" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
                  {!editPlayerId && formData.password && (
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
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                    required
                  >
                    <option value="" className="bg-gray-800">Select position</option>
                    <option value="Midfielder" className="bg-gray-800">Midfielder</option>
                    <option value="Defender" className="bg-gray-800">Defender</option>
                    <option value="Forward" className="bg-gray-800">Forward</option>
                    <option value="Goalkeeper" className="bg-gray-800">Goalkeeper</option>
                    <option value="Indisponible" className="bg-gray-800">Indisponible</option>

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Group</label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleGroupChangeInForm}
                    className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                  >
                    <option value="" className="bg-gray-800">Select group</option>
                    {groupOptionsForPlayer.map((name) => (
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
                      <option value="" className="bg-gray-800">{subgroupOptionsForPlayer.length > 0 ? 'Select sub-group' : 'No sub-groups'}</option>
                      {subgroupOptionsForPlayer.map((name) => (
                        <option key={name} value={name} className="bg-gray-800">{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.height ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                    min="100"
                    max="250"
                    placeholder="160-200"
                  />
                  {errors.height && <p className="mt-2 text-sm text-red-400">{errors.height}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.weight ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                    min="30"
                    max="200"
                    placeholder="50-100"
                  />
                  {errors.weight && <p className="mt-2 text-sm text-red-400">{errors.weight}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                >
                  <option value="Active" className="bg-gray-800">Active</option>
                  <option value="Inactive" className="bg-gray-800">Inactive</option>
                  <option value="Injured" className="bg-gray-800">Injured</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 bg-gray-800/50 text-gray-300 rounded-xl font-medium hover:bg-gray-700/50 transition-all border border-gray-700/50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <FiCheck />
                  {editPlayerId ? 'Save Changes' : 'Add Player'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlayerModal;
