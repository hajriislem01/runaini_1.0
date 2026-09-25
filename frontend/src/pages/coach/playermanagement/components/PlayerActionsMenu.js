import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMoreVertical, FiFileText, FiActivity, FiTrash2 } from 'react-icons/fi';
import { FaMagic } from 'react-icons/fa';

// Secondary row actions (History / Analysis / Predictor / Delete report) tucked
// behind a kebab menu, so the Actions column stays a fixed width regardless of
// whether the player has a report for the current month.
const PlayerActionsMenu = ({ isRtl, hasReport, onHistory, onAnalysis, onPredict, onDelete }) => {
  const { t } = useTranslation('coachplayers');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  const item = (icon, label, onClick, danger = false) => (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setOpen(false); onClick(); }}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${
        danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="inline-flex items-center justify-center w-9 h-9 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700 hover:text-white transition-all"
        title={t('moreActions')}>
        <FiMoreVertical size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => e.stopPropagation()}
            className={`absolute z-20 top-full mt-2 w-52 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden py-1.5 ${isRtl ? 'right-0' : 'left-0'}`}
          >
            {item(<FiFileText size={14} className="text-gray-500 shrink-0" />, t('reportHistory'), onHistory)}
            {item(<FiActivity size={14} className="text-[#00d0cb] shrink-0" />, t('deepKpiAnalysis'), onAnalysis)}
            {item(<FaMagic size={13} className="text-[#f59e0b] shrink-0" />, t('positionPredictor'), onPredict)}

            {hasReport && (
              <>
                <div className="my-1.5 border-t border-gray-800" />
                {item(<FiTrash2 size={14} className="shrink-0" />, t('deleteReport'), onDelete, true)}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerActionsMenu;
