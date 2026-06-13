import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEye, FiEyeOff, FiCheck, FiShield, FiUsers, FiTarget, FiActivity, FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { strengthColors, strengthLabels } from '../utils/playerHelpers';

const PlayerModal = ({
  showModal, setShowModal, editPlayerId, resetForm, handleSubmit,
  formData, handleChange, handleGroupChangeInForm, handlePasswordChange,
  errors, showPassword, setShowPassword, passwordStrength,
  groupOptionsForPlayer, subgroupOptionsForPlayer, apiError
}) => {
  const { t, i18n } = useTranslation('playermanagement');
  const isRtl = i18n.language === 'ar';

  const [showPosDropdown, setShowPosDropdown] = React.useState(false);
  const [showGrpDropdown, setShowGrpDropdown] = React.useState(false);
  const [showSgDropdown, setShowSgDropdown] = React.useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);

  // Close all menus on click outside
  React.useEffect(() => {
    const closeAll = () => {
      setShowPosDropdown(false);
      setShowGrpDropdown(false);
      setShowSgDropdown(false);
      setShowStatusDropdown(false);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  if (!showModal) return null;

  const positions = ['Midfielder', 'Defender', 'Forward', 'Goalkeeper', 'Indisponible'];
  const statuses  = ['Active', 'Inactive', 'Injured'];

  const handleSelect = (name, value, closeFn) => {
    handleChange({ target: { name, value } });
    if (closeFn) closeFn(false);
  };

  const handleGroupSelect = (value) => {
    handleGroupChangeInForm({ target: { name: 'group', value } });
    setShowGrpDropdown(false);
  };

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
                {editPlayerId ? t('form.editTitle', 'Edit Player Details') : t('form.addTitle', 'Add New Player')}
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
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium"
                >
                  {apiError}
                </motion.div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('form.usernameLabel', 'Username *')}
                  </label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('form.nameLabel', 'Full Name *')}
                  </label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('form.emailLabel', 'Email Address *')}
                  </label>
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
                    {t('form.passwordLabel', 'Password')} {!editPlayerId && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.password ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                      required={!editPlayerId}
                      placeholder={editPlayerId ? t('form.passwordPlaceholder', 'Leave blank to keep current') : ""}
                    />
                    <button
                      type="button"
                      onClick={() => { setShowPassword(!showPassword); }}
                      className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white`}
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
                        {passwordStrength > 0 ? t(`strength.${strengthLabels[passwordStrength - 1].toLowerCase()}`, strengthLabels[passwordStrength - 1]) : t('messages.loading', 'Enter password')}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('form.phoneLabel', 'Phone Number')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                    placeholder={t('form.phonePlaceholder', 'Enter phone number')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Position Selector */}
                <div className={`relative ${showPosDropdown ? 'z-50' : 'z-10'}`} onClick={(e) => e.stopPropagation()}>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiShield className="text-[#902bd1]" size={14} /> {t('form.positionLabel', 'Position')} *
                  </label>
                  <button 
                    type="button"
                    onClick={() => { 
                      setShowPosDropdown(!showPosDropdown); 
                      setShowGrpDropdown(false); 
                      setShowSgDropdown(false); 
                      setShowStatusDropdown(false); 
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900/40 border border-gray-700/50 hover:border-[#902bd1]/40 rounded-xl text-white outline-none transition-all"
                  >
                    <span className="text-sm font-medium truncate">
                      {formData.position ? t(`positions.${formData.position.toLowerCase()}`, formData.position) : t('form.positionPlaceholder', 'Select position...')}
                    </span>
                    <FiChevronDown className={`transition-transform duration-200 ${showPosDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showPosDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          {positions.map(pos => (
                            <div key={pos} onClick={() => handleSelect('position', pos, setShowPosDropdown)}
                              className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                              {t(`positions.${pos.toLowerCase()}`, pos)}
                              {formData.position === pos && <FiCheck className="text-[#902bd1]" />}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Group Selector */}
                <div className={`relative ${showGrpDropdown ? 'z-50' : 'z-10'}`} onClick={(e) => e.stopPropagation()}>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiUsers className="text-[#4fb0ff]" size={14} /> {t('table.group', 'Group')}
                  </label>
                  <button 
                    type="button"
                    onClick={() => { 
                      setShowGrpDropdown(!showGrpDropdown); 
                      setShowPosDropdown(false); 
                      setShowSgDropdown(false); 
                      setShowStatusDropdown(false); 
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900/40 border border-gray-700/50 hover:border-[#4fb0ff]/40 rounded-xl text-white outline-none transition-all"
                  >
                    <span className="text-sm font-medium truncate">
                      {formData.group || t('form.groupPlaceholder', 'Choose group...')}
                    </span>
                    <FiChevronDown className={`transition-transform duration-200 ${showGrpDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showGrpDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto"
                      >
                        <div className="p-2 space-y-1">
                          <div onClick={() => handleGroupSelect('')}
                            className="px-4 py-3 text-sm text-gray-500 italic hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all">
                            {t('form.noGroup', 'No group')}
                          </div>
                          {(groupOptionsForPlayer || []).map(name => (
                            <div key={name} onClick={() => handleGroupSelect(name)}
                              className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                              {name}
                              {formData.group === name && <FiCheck className="text-[#4fb0ff]" />}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 3. Sub-group Selector */}
              {formData.group && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`relative ${showSgDropdown ? 'z-50' : 'z-10'}`} onClick={(e) => e.stopPropagation()}>
                    <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiTarget className="text-[#00d0cb]" size={14} /> {t('form.subgroupLabel', 'Sub-group')}
                    </label>
                    <button 
                      type="button"
                      onClick={() => { 
                        setShowSgDropdown(!showSgDropdown); 
                        setShowPosDropdown(false); 
                        setShowGrpDropdown(false); 
                        setShowStatusDropdown(false); 
                    }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900/40 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white outline-none transition-all"
                    >
                      <span className="text-sm font-medium truncate">
                        {formData.subgroup || (subgroupOptionsForPlayer.length > 0 ? t('form.selectSubgroupPlaceholder', 'Select unit...') : t('form.noSubgroupsAvailable', 'No units available'))}
                      </span>
                      <FiChevronDown className={`transition-transform duration-200 ${showSgDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showSgDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto"
                        >
                          <div className="p-2 space-y-1">
                            <div onClick={() => handleSelect('subgroup', '', setShowSgDropdown)}
                              className="px-4 py-3 text-sm text-gray-500 italic hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all">
                              {t('form.none', 'None')}
                            </div>
                            {(subgroupOptionsForPlayer || []).map(name => (
                              <div key={name} onClick={() => handleSelect('subgroup', name, setShowSgDropdown)}
                                className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                                {name}
                                {formData.subgroup === name && <FiCheck className="text-[#00d0cb]" />}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('form.heightLabel', 'Height (cm)')}
                  </label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('form.weightLabel', 'Weight (kg)')}
                  </label>
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
                {/* 4. Status Selector */}
                <div className={`relative ${showStatusDropdown ? 'z-50' : 'z-10'}`} onClick={(e) => e.stopPropagation()}>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiActivity className="text-orange-400" size={14} /> {t('form.statusLabel', 'Status')}
                  </label>
                  <button 
                    type="button"
                    onClick={() => { 
                      setShowStatusDropdown(!showStatusDropdown); 
                      setShowPosDropdown(false); 
                      setShowGrpDropdown(false); 
                      setShowSgDropdown(false); 
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900/40 border border-gray-700/50 hover:border-orange-400/40 rounded-xl text-white outline-none transition-all"
                  >
                    <span className="text-sm font-medium truncate">
                      {formData.status ? t(`status.${formData.status.toLowerCase()}`, formData.status) : t('status.active', 'Active')}
                    </span>
                    <FiChevronDown className={`transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showStatusDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          {statuses.map(stat => (
                            <div key={stat} onClick={() => handleSelect('status', stat, setShowStatusDropdown)}
                              className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                              {t(`status.${stat.toLowerCase()}`, stat)}
                              {formData.status === stat && <FiCheck className="text-orange-400" />}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('form.addressLabel', 'Address')}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('form.notesLabel', 'Notes')}
                </label>
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
                  {t('actions.cancel', 'Cancel')}
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <FiCheck />
                  {editPlayerId ? t('actions.save', 'Save Changes') : t('actions.add', 'Add Player')}
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
