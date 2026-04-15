import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const CoachList = ({
  filteredCoaches, isLoading, searchTerm,
  handleEdit, handleDelete, resetForm, setShowModal, itemVariants
}) => {
  if (isLoading && !filteredCoaches.length) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
      </div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredCoaches.length > 0 ? filteredCoaches.map(coach => (
        <motion.div key={coach.id} variants={itemVariants} whileHover={{ y: -4 }}
          className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all">
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                  <FiUser className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{coach.username}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#902bd1]/20 to-[#4fb0ff]/20 text-purple-300">
                    Coach
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(coach)}
                  className="p-2 rounded-lg bg-[#4fb0ff]/20 text-[#80a8ff] hover:bg-[#4fb0ff]/30">
                  <FiEdit size={18} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(coach.id)}
                  className="p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30">
                  <FiTrash2 size={18} />
                </motion.button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm">
                <span className="font-medium w-16">Email:</span>
                <span className="text-white truncate">{coach.email}</span>
              </div>
              {coach.phone && (
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="font-medium w-16">Phone:</span>
                  <span className="text-white">{coach.phone}</span>
                </div>
              )}
              {coach.club && (
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="font-medium w-16">Club:</span>
                  <span className="text-white">{coach.club}</span>
                </div>
              )}

              {coach.groups?.length > 0 && (
                <div className="pt-2">
                  <span className="text-sm font-medium text-gray-300">Groups:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {coach.groups.map(g => (
                      <span key={g.id} className="px-2 py-1 text-xs rounded-full bg-[#902bd1]/20 text-purple-300 border border-purple-700/30">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700/50">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{coach.groups?.length || 0}</div>
                  <div className="text-xs text-gray-400">Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {coach.coach_profile?.years_of_experience || '—'}
                  </div>
                  <div className="text-xs text-gray-400">Exp (yrs)</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )) : (
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-gray-900/65 rounded-2xl border border-gray-700/50 p-8 text-center">
          <FiUser className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No coaches found</h3>
          <p className="text-gray-400 mb-6">{searchTerm ? 'Try adjusting your search' : 'Start by adding your first coach'}</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl flex items-center gap-2 font-medium mx-auto">
            <FiPlus />Add Coach
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CoachList;
