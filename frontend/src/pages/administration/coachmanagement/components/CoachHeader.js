import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

const CoachHeader = ({ coachesCount, isLoading, resetForm, setShowModal, itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Coach Management
          </h1>
          <p className="text-gray-300 mt-2">
            {isLoading ? 'Loading...' : `${coachesCount} coach${coachesCount !== 1 ? 'es' : ''} registered`}
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl font-medium flex items-center gap-2">
          <FiPlus />Add Coach
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CoachHeader;
