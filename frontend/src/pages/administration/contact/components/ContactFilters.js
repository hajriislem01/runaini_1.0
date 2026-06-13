import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiCheck, FiMapPin, FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ContactFilters = ({ filters, handleFilterChange, clearFilters, itemVariants }) => {
  const { t, i18n } = useTranslation('contactmanagement');
  const isRtl = i18n.language === 'ar';
  const [showDropdown, setShowDropdown] = useState(false);

  // Countries mapping
  const countries = [
    { code: '', nameKey: 'filters.allCountries', icon: <FiGlobe className="text-gray-400" /> },
    { code: 'TN', nameKey: 'countries.TN', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'DZ', nameKey: 'countries.DZ', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'MA', nameKey: 'countries.MA', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'LY', nameKey: 'countries.LY', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'EG', nameKey: 'countries.EG', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'MR', nameKey: 'countries.MR', icon: <FiMapPin className="text-[#00d0cb]" /> },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const getSelectedCountryName = () => {
    const country = countries.find(c => c.code === filters.country);
    return country ? t(country.nameKey) : t('filters.allCountries');
  };

  const getSelectedCountryIcon = () => {
    const country = countries.find(c => c.code === filters.country);
    return country ? country.icon : <FiGlobe className="text-gray-400" />;
  };

  const onCountrySelect = (code) => {
    handleFilterChange({
      target: { name: 'country', value: code }
    });
    setShowDropdown(false);
  };

  return (
    <motion.div variants={itemVariants} className="mb-8 relative z-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className={`flex justify-between items-center mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-lg font-bold flex items-center gap-3 text-white ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb] shadow-lg shadow-[#00d0cb]/10">
              <FiSearch className="text-lg" />
            </div>
            {t('filters.title')}
          </h2>
          {(filters.country || filters.city || filters.searchQuery) && (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={clearFilters} 
              className="text-xs font-bold uppercase tracking-widest text-[#00d0cb] hover:text-[#4fb0ff] transition-colors"
            >
              {isRtl ? 'مسح التصفية' : 'Clear filters'}
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Luxury Country Selector */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <label className={`text-gray-400 text-xs font-bold uppercase tracking-widest mb-2.5 flex items-center gap-2 px-1 ${isRtl ? 'justify-start flex-row-reverse' : ''}`}>
              <FiMapPin className="text-[#00d0cb]" size={12} /> {t('filters.country')}
            </label>
            <button 
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className={`w-full flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white outline-none transition-all group ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-400 group-hover:scale-110 transition-transform">
                  {getSelectedCountryIcon()}
                </span>
                <span className="text-sm font-medium truncate">{getSelectedCountryName()}</span>
              </div>
              <FiChevronDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className={`absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  {countries.map((c) => (
                    <div 
                      key={c.code}
                      onClick={() => onCountrySelect(c.code)}
                      className={`px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${isRtl ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="text-gray-500 group-hover:text-[#00d0cb] transition-colors">
                          {c.icon}
                        </span>
                        <span className="font-medium">{t(c.nameKey)}</span>
                      </div>
                      {filters.country === c.code && <FiCheck className="text-[#00d0cb]" />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Styled City Input */}
          <div>
            <label className={`text-gray-400 text-xs font-bold uppercase tracking-widest mb-2.5 px-1 flex items-center gap-2 ${isRtl ? 'justify-start flex-row-reverse' : ''}`}>
               {t('filters.city')}
            </label>
            <input 
              type="text" 
              name="city" 
              value={filters.city} 
              onChange={handleFilterChange}
              placeholder={t('filters.placeholderCity')}
              className={`w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#902bd1]/40 rounded-xl focus:outline-none focus:border-[#902bd1]/60 text-white text-sm font-medium transition-all placeholder-gray-600 ${isRtl ? 'text-right' : 'text-left'}`} 
            />
          </div>

          {/* 3. Styled Search Input */}
          <div>
            <label className={`block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2.5 px-1 ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('filters.search')}
            </label>
            <div className="relative group">
              <FiSearch className={`absolute top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d0cb] transition-colors ${isRtl ? 'right-4' : 'left-4'}`} />
              <input 
                type="text" 
                name="searchQuery" 
                value={filters.searchQuery} 
                onChange={handleFilterChange}
                placeholder={t('filters.placeholderSearch')}
                className={`w-full py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl focus:outline-none focus:border-[#00d0cb]/60 text-white text-sm font-medium transition-all placeholder-gray-600 ${isRtl ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}`} 
              />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ContactFilters;
