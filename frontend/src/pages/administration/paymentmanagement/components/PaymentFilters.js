import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiUsers, FiTarget, FiChevronDown, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const PaymentFilters = ({
  groups, subgroups,
  selectedGroup, setSelectedGroup,
  selectedSubgroup, setSelectedSubgroup,
  itemVariants
}) => {
  const { t, i18n } = useTranslation('paymentmanagement');
  const isRtl = i18n.language === 'ar';

  const [showGrpDropdown, setShowGrpDropdown] = useState(false);
  const [showSgDropdown, setShowSgDropdown] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    const closeAll = () => {
      setShowGrpDropdown(false);
      setShowSgDropdown(false);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedSubgroup('');
    setShowGrpDropdown(false);
  };

  const getSelectedGroupName = () => {
    const g = groups.find(group => String(group.id) === String(selectedGroup));
    return g ? g.name : t('allGroups', 'All Groups');
  };

  const getSelectedSubgroupName = () => {
    const s = subgroups.find(sub => String(sub.id) === String(selectedSubgroup));
    return s ? s.name : t('allSubgroups', 'All Subgroups');
  };

  return (
    <motion.div variants={itemVariants} className="mb-6 relative z-[100]">
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 overflow-visible">
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 text-white ${isRtl ? 'flex-row-reverse' : ''}`}>
          <FiFilter className="text-[#4fb0ff]" />
          <span>{t('filterByGroup', 'Filter by Group')}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Group Selector */}
          <div className={`relative ${showGrpDropdown ? 'z-50' : 'z-10'}`} onClick={(e) => e.stopPropagation()}>
            <label className={`text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <FiUsers className="text-[#902bd1]" size={12} />
              <span>{t('form.groupLabel', 'Group')}</span>
            </label>
            <button 
              type="button"
              onClick={() => { setShowGrpDropdown(!showGrpDropdown); setShowSgDropdown(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#902bd1]/40 rounded-xl text-white outline-none transition-all group ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              <span className="text-sm font-medium truncate">{getSelectedGroupName()}</span>
              <FiChevronDown className={`transition-transform duration-200 ${showGrpDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showGrpDropdown && (
                <motion.div 
                   initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className={`absolute top-full mt-2 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto ${isRtl ? 'right-0' : 'left-0'}`}
                >
                  <div className="p-2 space-y-1">
                    <div 
                      onClick={() => handleGroupSelect('')}
                      className={`px-4 py-3 text-sm text-gray-500 italic hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}
                    >
                      <span>{t('allGroups', 'All Groups')}</span>
                      {selectedGroup === '' && <FiCheck className="text-[#902bd1]" />}
                    </div>
                    {groups.map(g => (
                      <div 
                        key={g.id}
                        onClick={() => handleGroupSelect(g.id)}
                        className={`px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <span>{g.name}</span>
                        {String(selectedGroup) === String(g.id) && <FiCheck className="text-[#902bd1]" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subgroup Selector */}
          <div className={`relative ${showSgDropdown ? 'z-50' : 'z-10'}`} onClick={(e) => e.stopPropagation()}>
            <label className={`text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <FiTarget className="text-[#00d0cb]" size={12} />
              <span>{t('subgroupLabel', 'Subgroup')}</span>
            </label>
            <button 
              type="button"
              disabled={!selectedGroup || subgroups.length === 0}
              onClick={() => { setShowSgDropdown(!showSgDropdown); setShowGrpDropdown(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              <span className="text-sm font-medium truncate">
                {!selectedGroup 
                  ? t('selectGroupFirst', 'Select Group First') 
                  : subgroups.length === 0 
                    ? t('noSubgroups', 'No Subgroups') 
                    : getSelectedSubgroupName()
                }
              </span>
              <FiChevronDown className={`transition-transform duration-200 ${showSgDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSgDropdown && (
                <motion.div 
                   initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className={`absolute top-full mt-2 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto ${isRtl ? 'right-0' : 'left-0'}`}
                >
                  <div className="p-2 space-y-1">
                    <div 
                      onClick={() => { setSelectedSubgroup(''); setShowSgDropdown(false); }}
                      className={`px-4 py-3 text-sm text-gray-500 italic hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}
                    >
                      <span>{t('allSubgroups', 'All Subgroups')}</span>
                      {selectedSubgroup === '' && <FiCheck className="text-[#00d0cb]" />}
                    </div>
                    {subgroups.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => { setSelectedSubgroup(s.id); setShowSgDropdown(false); }}
                        className={`px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <span>{s.name}</span>
                        {String(selectedSubgroup) === String(s.id) && <FiCheck className="text-[#00d0cb]" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentFilters;
