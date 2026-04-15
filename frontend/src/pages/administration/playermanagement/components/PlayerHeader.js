import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus } from 'react-icons/fi';

const PlayerHeader = ({ activeTab, playersCount, groupsCount, resetForm, setShowModal, resetGroupForm, setShowGroupModal, itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Player & Group Management
          </h1>
          <p className="text-gray-300 mt-2 text-base sm:text-lg">
            {activeTab === 'players' 
              ? `${playersCount} player${playersCount !== 1 ? 's' : ''} registered`
              : `${groupsCount} group${groupsCount !== 1 ? 's' : ''} defined`
            }
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gray-900/65 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold">
              <FiUsers className="text-lg" />
            </div>
            <div>
              <p className="font-semibold text-white">Team Manager</p>
              <p className="text-xs text-gray-400">Admin Access</p>
            </div>
          </div>
          
          {activeTab === 'players' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <FiPlus />
              Add Player
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetGroupForm();
                setShowGroupModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <FiPlus />
              Add Group
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerHeader;
