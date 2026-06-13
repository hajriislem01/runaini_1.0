import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiFilter, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const AgendaFilters = ({
  groupsWithSubgroups,
  selectedGroups, setSelectedGroups,
  selectedSubgroups, setSelectedSubgroups,
  expandedGroup, setExpandedGroup,
  itemVariants
}) => {
  const { t, i18n } = useTranslation('agendamanagement');
  const isRtl = i18n.language === 'ar';

  return (
    <motion.div variants={itemVariants} className="mb-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className={`flex flex-wrap items-center justify-between gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
              <FiFilter className="text-lg" />
            </div>
            {t('filters.title')}
          </h2>
          {(selectedGroups.length > 0 || selectedSubgroups.length > 0) && (
            <button
              onClick={() => { setSelectedGroups([]); setSelectedSubgroups([]); setExpandedGroup(null); }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {t('actions.clearFilters')}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {groupsWithSubgroups.map(group => (
            <motion.button
              key={group.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setExpandedGroup(expandedGroup === group.id ? null : group.id);
                setSelectedGroups(prev =>
                  prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]
                );
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${isRtl ? 'flex-row-reverse' : ''} ${
                selectedGroups.includes(group.id)
                  ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white'
                  : 'bg-gray-800/50 text-gray-300 border border-gray-700/50'
              }`}
            >
              {group.name}
              {group.subgroups?.length > 0 && (
                isRtl
                  ? <FiChevronLeft className={`transition-transform ${expandedGroup === group.id ? '-rotate-90' : ''}`} />
                  : <FiChevronRight className={`transition-transform ${expandedGroup === group.id ? 'rotate-90' : ''}`} />
              )}
            </motion.button>
          ))}
        </div>

        {expandedGroup && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-gray-700/50 pt-4 mt-4"
          >
            <div className="flex flex-wrap gap-2">
              {groupsWithSubgroups.find(g => g.id === expandedGroup)?.subgroups?.map(sub => (
                <motion.button
                  key={sub.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSelectedSubgroups(prev =>
                      prev.includes(sub.id) ? prev.filter(s => s !== sub.id) : [...prev, sub.id]
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    selectedSubgroups.includes(sub.id)
                      ? 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white'
                      : 'bg-gray-800/50 text-gray-300 border border-gray-700/50'
                  }`}
                >
                  {sub.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AgendaFilters;
