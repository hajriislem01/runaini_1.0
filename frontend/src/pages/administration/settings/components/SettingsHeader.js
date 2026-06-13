import React from 'react';
import { motion } from 'framer-motion';
import { FiSave } from 'react-icons/fi';

const SettingsHeader = ({ t, isRtl, isSubmitting, itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            {t('sidebar.title')}
          </h1>
          <p className="text-gray-300 mt-2">{t('sidebar.mainTitle')}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          form="settings-form"
          disabled={isSubmitting}
          className={`px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}
          style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('actions.save')}
            </>
          ) : (
            <>
              <FiSave className="text-lg" />
              {t('actions.save')}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SettingsHeader;
