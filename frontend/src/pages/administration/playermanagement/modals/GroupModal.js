import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const GroupModal = ({
  showGroupModal, setShowGroupModal, resetGroupForm, handleGroupSubmit,
  isEditingGroup, groupForm, setGroupForm, coaches, addSubgroup, 
  removeSubgroup, handleSubgroupChange, apiError
}) => {
  const { t } = useTranslation('playermanagement');

  if (!showGroupModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-5 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                {isEditingGroup ? t('form.editGroupTitle', 'Edit Group') : t('form.createGroupTitle', 'Create Group')}
              </h2>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <FiX size={20} />
              </motion.button>
            </div>

            <form onSubmit={handleGroupSubmit} className="space-y-5">
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium"
                >
                  {apiError}
                </motion.div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('form.groupNameLabel', 'Group Name *')}
                </label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                  placeholder="e.g. U15, Team A"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {t('form.subgroupsLabel', 'Subgroups')}
                  </label>
                  <button
                    type="button"
                    onClick={addSubgroup}
                    className="text-sm text-[#80a8ff] hover:text-[#00d0cb] flex items-center gap-1"
                  >
                    <FiPlus size={14} />
                    {t('form.addSubgroup', 'Add sub-group')}
                  </button>
                </div>
                <div className="space-y-2">
                  {groupForm.subgroups.map((sg, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={sg}
                        onChange={(e) => handleSubgroupChange(index, e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                        placeholder={`${t('form.subgroupLabel', 'Sub-group')} ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeSubgroup(index)}
                        disabled={groupForm.subgroups.length <= 1}
                        className="p-2.5 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={t('actions.delete', 'Remove')}
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t('form.subgroupsHelp', 'Add nested sub-groups inside this group.')}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
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
                  {isEditingGroup ? t('actions.save', 'Save Changes') : t('actions.createGroup', 'Create Group')}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GroupModal;
