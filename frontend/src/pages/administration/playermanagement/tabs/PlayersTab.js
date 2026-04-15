import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiGrid, FiPhone, FiEdit, FiTrash2, FiUsers, FiPlus } from 'react-icons/fi';

const PlayersTab = ({
  searchTerm, setSearchTerm,
  selectedGroup, setSelectedGroup,
  selectedSubgroup, setSelectedSubgroup,
  groupOptionsForPlayer, groups, players,
  filteredPlayers,
  handleEdit, handleDelete,
  resetForm, setShowModal,
  itemVariants
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Search Bar */}
      <motion.div variants={itemVariants} className="mb-8 flex flex-wrap gap-4 items-end">
        <div className="relative max-w-md flex-1 min-w-[200px]">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="w-full pl-12 pr-4 py-3 bg-gray-900/65 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedGroup}
            onChange={(e) => { setSelectedGroup(e.target.value); setSelectedSubgroup(''); }}
            className="px-3 py-2.5 bg-gray-900/65 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none text-sm"
          >
            <option value="">All groups</option>
            {groupOptionsForPlayer.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={selectedSubgroup}
            onChange={(e) => setSelectedSubgroup(e.target.value)}
            disabled={!selectedGroup}
            className="px-3 py-2.5 bg-gray-900/65 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All sub-groups</option>
            {selectedGroup && (() => {
              const g = groups.find(gr => gr.name === selectedGroup);
              const subs = g && g.subgroups
                ? g.subgroups
                  .filter(Boolean)
                  .map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg)
                  .filter(Boolean)
                : [];
              const fromPlayers = [...new Set(players
                .filter(p => {
                  const playerGroup = typeof p.group === 'object' ? p.group?.name : p.group;
                  return playerGroup === selectedGroup;
                })
                .map(p => {
                  const playerSubgroup = typeof p.subgroup === 'object' ? p.subgroup?.name : p.subgroup;
                  return playerSubgroup;
                })
                .filter(Boolean))];
              const all = [...new Set([...subs, ...fromPlayers])];
              return all.map((name) => <option key={name} value={name}>{name}</option>);
            })()}
          </select>
        </div>
      </motion.div>

      {/* Players Table */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">Player</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">Groups</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">Position</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">Details</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredPlayers.length > 0 ? filteredPlayers.map((player) => (
                <motion.tr
                  key={`${player.id}-${player.user?.id || 'nouser'}`}
                  className="hover:bg-gray-800/40 transition-colors duration-200"
                  whileHover={{ x: 4 }}
                >
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap group cursor-pointer" onClick={() => navigate(`/administration/player-profile/${player.id}`)}>
                    <div className="flex items-center group-hover:scale-105 transition-transform duration-300">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center mr-3 shadow-lg group-hover:shadow-[#4fb0ff]/50">
                        <FiUser className="text-white text-lg" />
                      </div>
                      <div>
                        <div className="text-sm md:text-base font-medium text-white group-hover:text-[#4fb0ff] transition-colors">{player.full_name}</div>
                        {/* Update: Phone ta7t el esm */}
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <FiPhone size={10} className="text-[#4fb0ff]" />
                          {player.phone || 'No phone'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      {/* Update: Group houni */}
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-[#902bd1]" size={14} />
                        <span className="font-medium">
                          {typeof player.group === 'object' ? player.group?.name : player.group || 'No group'}
                        </span>
                      </div>
                      {/* Update: Subgroup houni */}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FiGrid className="text-[#4fb0ff]" size={14} />
                        <span>
                          {typeof player.subgroup === 'object' ? player.subgroup?.name : player.subgroup || 'No subgroup'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] border border-[#4fb0ff]/30">
                      {player.position || '-'}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden lg:table-cell">
                    {player.height && player.weight ? (
                      <div className="flex items-center gap-2">
                        <span className="text-white">{player.height} cm</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-white">{player.weight} kg</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No details</span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${player.status === 'Active'
                      ? 'bg-gradient-to-r from-[#10B981]/20 to-[#059669]/20 text-green-300 border border-green-700/40'
                      : player.status === 'Inactive'
                        ? 'bg-gradient-to-r from-red-900/40 to-red-800/30 text-red-300 border border-red-700/40'
                        : 'bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 text-yellow-300 border border-yellow-700/40'
                      }`}>
                      {player.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(player)}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all duration-200"
                        title="Edit player"
                      >
                        <FiEdit size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(player.id)}
                        className="p-2 rounded-lg bg-gradient-to-r from-red-900/20 to-red-800/20 text-red-400 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-200"
                        title="Delete player"
                      >
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4fb0ff]/20 to-[#902bd1]/20 flex items-center justify-center mb-4">
                        <FiUsers className="text-3xl text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">No players found</h3>
                      <p className="text-gray-400 mb-6 max-w-md">
                        {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first player'}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          resetForm();
                          setShowModal(true);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl hover:from-[#4fb0ff]/90 hover:to-[#00d0cb]/90 transition-all duration-300 flex items-center gap-2 font-medium"
                      >
                        <FiPlus />
                        Add Player
                      </motion.button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>    </>
  );
};

export default PlayersTab;
