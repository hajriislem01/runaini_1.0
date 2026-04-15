import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const AddParticipantModal = ({ 
  showModal, setShowModal, 
  searchPlayer, setSearchPlayer, 
  filteredPlayers, players,
  handleAddParticipant, isAddingParticipant 
}) => {
  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Add Participant</h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
              <FiX size={24} />
            </button>
          </div>

          <input type="text" value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)}
            placeholder="Search player..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 mb-4" />

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
              <motion.div key={player.id} whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white text-sm font-bold">
                    {player.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{player.full_name}</div>
                    <div className="text-gray-400 text-xs">{player.position}</div>
                  </div>
                </div>
                <button onClick={() => handleAddParticipant(player.id)}
                  disabled={isAddingParticipant}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                  Add
                </button>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                {players.length === 0 ? 'All players in this group are already added' : 'No players found'}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddParticipantModal;
