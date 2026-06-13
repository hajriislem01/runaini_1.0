import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiLayers, FiInfo, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const GroupsTab = ({
  groupSearchTerm, setGroupSearchTerm,
  filteredGroups, getPlayersInGroup,
  handleGroupDetail, handleEditGroup, handleGroupDelete,
  resetGroupForm, setShowGroupModal,
  itemVariants
}) => {
  const { t, i18n } = useTranslation('playermanagement');
  const isRtl = i18n.language === 'ar';

  return (
    <>
      {/* Group Search Bar */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="relative max-w-md">
          <FiSearch className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
          <input
            type="text"
            placeholder={t('searchPlaceholderGroups', 'Search groups...')}
            className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-900/65 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
            value={groupSearchTerm}
            onChange={(e) => setGroupSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Groups Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGroups.length > 0 ? filteredGroups.map((group) => {
          const groupPlayers = getPlayersInGroup(group.name);
          return (
            <motion.div
              key={group.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#7c3aed] flex items-center justify-center">
                      <FiLayers className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{group.name}</h3>
                      <p className="text-xs text-gray-400">
                        {groupPlayers.length} {groupPlayers.length === 1 ? t('form.playerSingle', 'player') : t('form.playerPlural', 'players')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleGroupDetail(group)}
                      className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all duration-200"
                      title={t('actions.view', 'View details')}
                    >
                      <FiInfo size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditGroup(group)}
                      className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all duration-200"
                      title={t('actions.edit', 'Edit group')}
                    >
                      <FiEdit size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleGroupDelete(group.id)}
                      className="p-2 rounded-lg bg-gradient-to-r from-red-900/20 to-red-800/20 text-red-400 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-200"
                      title={t('actions.delete', 'Delete group')}
                    >
                      <FiTrash2 size={18} />
                    </motion.button>
                  </div>
                </div>

                {group.subgroups && group.subgroups.filter(Boolean).length > 0 && (
                  <p className="text-sm text-gray-400 mb-4">
                    {t('form.subgroupsLabel', 'Subgroups')}: {group.subgroups
                      .filter(Boolean)
                      .map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg)
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}

                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{t('form.groupLabel', 'Players')}</span>
                    <span className="text-sm font-semibold text-white">{groupPlayers.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-3 bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4fb0ff]/20 to-[#902bd1]/20 flex items-center justify-center mx-auto mb-6">
              <FiLayers className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">{t('messages.noGroupsFound', 'No groups found')}</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {groupSearchTerm ? t('messages.adjustSearchGroups', 'Try adjusting your search terms') : t('messages.addFirstGroup', 'Start by adding your first group')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetGroupForm();
                setShowGroupModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl hover:from-[#4fb0ff]/90 hover:to-[#00d0cb]/90 transition-all duration-300 flex items-center gap-2 font-medium mx-auto"
            >
              <FiPlus />
              {t('actions.addGroup', 'Add Group')}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default GroupsTab;
