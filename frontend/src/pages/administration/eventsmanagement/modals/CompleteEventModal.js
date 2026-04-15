import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

const CompleteEventModal = ({ showModal, setShowModal, winner, setWinner, handleComplete }) => {
  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />Complete Event
            </h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
              <FiX size={24} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 font-medium mb-2">
              Winner (Optional)
            </label>
            <input type="text" value={winner} onChange={(e) => setWinner(e.target.value)}
              placeholder="Enter winner name or team"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 font-medium">
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="flex-1 px-4 py-3 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #22c55e, #00d0cb)' }}>
              <FiCheck />Mark as Complete
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompleteEventModal;
