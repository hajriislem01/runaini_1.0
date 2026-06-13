import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiTrash2 } from 'react-icons/fi';

const DeleteConfirmModal = ({
  showDeleteConfirm, setShowDeleteConfirm,
  eventToDelete, setEventToDelete,
  handleConfirmDelete,
}) => {
  const { t, i18n } = useTranslation('agendamanagement');
  const isRtl = i18n.language === 'ar';

  if (!showDeleteConfirm) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-700"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
              <FiTrash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {t('delete.title')}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {t('delete.confirm', { title: eventToDelete?.title || '' })}
            </p>
            <div className={`flex justify-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setEventToDelete(null); }}
                className="px-4 py-2 text-gray-300 bg-gray-800/50 rounded-xl border border-gray-700 hover:text-white hover:bg-gray-800 transition-all"
              >
                {t('delete.cancel')}
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-500 hover:to-red-600 transition-all"
              >
                {t('delete.delete')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
