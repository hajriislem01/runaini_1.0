import React from 'react';
import { motion } from 'framer-motion';
import { FiSave } from 'react-icons/fi';

const SettingsHeader = ({ isSubmitting, itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Academy Settings
          </h1>
          <p className="text-gray-300 mt-2">Manage your academy information and preferences</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          type="submit" form="settings-form" disabled={isSubmitting}
          className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}
        >
          {isSubmitting ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
          ) : (
            <><FiSave className="text-lg" />Save Changes</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SettingsHeader;
