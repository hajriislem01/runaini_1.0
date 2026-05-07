import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiCheck, FiMapPin, FiGlobe } from 'react-icons/fi';

const ContactFilters = ({ filters, handleFilterChange, clearFilters, itemVariants }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Countries mapping
  const countries = [
    { code: '', name: 'All Countries', icon: <FiGlobe className="text-gray-400" /> },
    { code: 'TN', name: 'Tunisia', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'DZ', name: 'Algeria', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'MA', name: 'Morocco', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'LY', name: 'Libya', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'EG', name: 'Egypt', icon: <FiMapPin className="text-[#00d0cb]" /> },
    { code: 'MR', name: 'Mauritania', icon: <FiMapPin className="text-[#00d0cb]" /> },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const getSelectedCountryName = () => {
    const country = countries.find(c => c.code === filters.country);
    return country ? country.name : 'All Countries';
  };

  const getSelectedCountryIcon = () => {
    const country = countries.find(c => c.code === filters.country);
    return country ? country.icon : <FiGlobe className="text-gray-400" />;
  };

  const onCountrySelect = (code) => {
    // Create a mock event object to fit handleFilterChange signature
    handleFilterChange({
      target: { name: 'country', value: code }
    });
    setShowDropdown(false);
  };

  return (
    <motion.div variants={itemVariants} className="mb-8 relative z-50">
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb] shadow-lg shadow-[#00d0cb]/10">
              <FiSearch className="text-lg" />
            </div>
            Search & Filter
          </h2>
          {(filters.country || filters.city || filters.searchQuery) && (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={clearFilters} 
              className="text-xs font-bold uppercase tracking-widest text-[#00d0cb] hover:text-[#4fb0ff] transition-colors"
            >
              Clear filters
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Luxury Country Selector */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2.5 flex items-center gap-2 px-1">
              <FiMapPin className="text-[#00d0cb]" size={12} /> Country
            </label>
            <button 
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white outline-none transition-all group"
            >
              <div className="flex items-center gap-3">
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
                  className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                >
                  {countries.map((c) => (
                    <div 
                      key={c.code}
                      onClick={() => onCountrySelect(c.code)}
                      className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 group-hover:text-[#00d0cb] transition-colors">
                          {c.icon}
                        </span>
                        <span className="font-medium">{c.name}</span>
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
            <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2.5 px-1 flex items-center gap-2">
               City
            </label>
            <input 
              type="text" 
              name="city" 
              value={filters.city} 
              onChange={handleFilterChange}
              placeholder="Enter city name..."
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#902bd1]/40 rounded-xl focus:outline-none focus:border-[#902bd1]/60 text-white text-sm font-medium transition-all placeholder-gray-600" 
            />
          </div>

          {/* 3. Styled Search Input */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2.5 px-1">
              Search
            </label>
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d0cb] transition-colors" />
              <input 
                type="text" 
                name="searchQuery" 
                value={filters.searchQuery} 
                onChange={handleFilterChange}
                placeholder="Search by name..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/30 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl focus:outline-none focus:border-[#00d0cb]/60 text-white text-sm font-medium transition-all placeholder-gray-600" 
              />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ContactFilters;
