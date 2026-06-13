import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiUserMinus, FiUserPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const GroupDetailModal = ({
  showGroupDetailModal, setShowGroupDetailModal, viewingGroup,
  viewingGroupPlayers, availablePlayersForViewingGroup,
  handleRemovePlayerFromGroup, handleAddPlayerToGroup
}) => {
  const { t, i18n } = useTranslation('playermanagement');
  const isRtl = i18n.language === 'ar';

  if (!showGroupDetailModal || !viewingGroup) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
        onClick={() => setShowGroupDetailModal(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                  {viewingGroup.name}
                </h2>
                {viewingGroup.subgroups && viewingGroup.subgroups.filter(Boolean).length > 0 && (
                  <p className="text-gray-400 mt-1">
                    {t('form.subgroupsLabel', 'Subgroups')}: {viewingGroup.subgroups
                      .filter(Boolean)
                      .map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg)
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowGroupDetailModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <FiX size={20} />
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* Assigned Players */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {t('form.assignedPlayers', 'Assigned Players')} ({viewingGroupPlayers.length})
                  </h3>
                </div>
                <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  {viewingGroupPlayers.length > 0 ? (
                    <div className="space-y-2">
                      {viewingGroupPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                              <FiUser className="text-white" />
                            </div>
                            <div>
                              <div className="text-white font-medium">{player.full_name}</div>
                              <div className="text-xs text-gray-400">{player.user?.email || t('messages.noEmail', 'No email')}</div>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemovePlayerFromGroup(player.id)}
                            className="p-2 rounded-lg bg-gradient-to-r from-red-900/20 to-red-800/20 text-red-400 hover:from-red-900/30 hover:to-red-800/30 transition-all"
                            title={t('actions.removeFromGroup', 'Remove from group')}
                          >
                            <FiUserMinus size={18} />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">{t('messages.noPlayersAssigned', 'No players assigned to this group')}</p>
                  )}
                </div>
              </div>

              {/* Available Players */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {t('form.availablePlayers', 'Available Players')} ({availablePlayersForViewingGroup.length})
                  </h3>
                </div>
                <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  {availablePlayersForViewingGroup.length > 0 ? (
                    <div className="space-y-2">
                      {availablePlayersForViewingGroup.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                              <FiUser className="text-white" />
                            </div>
                            <div>
                              <div className="text-white font-medium">{player.full_name}</div>
                              <div className="text-xs text-gray-400">{player.user?.email || t('messages.noEmail', 'No email')}</div>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAddPlayerToGroup(player.id)}
                            className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all"
                            title={t('actions.addToGroup', 'Add to group')}
                          >
                            <FiUserPlus size={18} />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">{t('messages.allPlayersAssigned', 'All players are assigned to this group')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GroupDetailModal;
