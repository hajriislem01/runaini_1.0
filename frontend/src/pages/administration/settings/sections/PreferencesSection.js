import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiChevronDown, FiCheck } from 'react-icons/fi';

const PreferencesSection = ({ preferences, setPreferences, itemVariants }) => {
  const [showTzDropdown, setShowTzDropdown] = useState(false);

  const timezones = [
    { id: 'Africa/Tunis', name: 'Tunisia (GMT+1)' },
    { id: 'Africa/Algiers', name: 'Algeria (GMT+1)' },
    { id: 'Africa/Casablanca', name: 'Morocco (GMT+1)' },
    { id: 'Africa/Tripoli', name: 'Libya (GMT+2)' },
    { id: 'Africa/Cairo', name: 'Egypt (GMT+2)' },
    { id: 'Africa/Nouakchott', name: 'Mauritania (GMT+0)' },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowTzDropdown(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const getSelectedTzName = () => {
    const tz = timezones.find(t => t.id === preferences.timezone);
    return tz ? tz.name : 'Select Timezone';
  };

  return (
    <motion.div id="preferences" variants={itemVariants}
      className={`bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8 transition-all duration-300 relative ${showTzDropdown ? 'z-20' : 'z-10'}`}>
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#0020c8]">
          <FiClock className="text-xl text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Preferences</h2>
          <p className="text-gray-400 text-sm">Set your language and timezone preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Luxury Timezone Dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <label className="block text-gray-300 font-medium mb-2">Time Zone</label>
          <button 
            type="button"
            onClick={() => setShowTzDropdown(!showTzDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white transition-all group"
          >
            <div className="flex items-center gap-2">
              <FiClock className="text-gray-400 group-hover:text-[#00d0cb] transition-colors" />
              <span className="truncate">{getSelectedTzName()}</span>
            </div>
            <FiChevronDown className={`transition-transform duration-200 ${showTzDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showTzDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
              >
                {timezones.map((tz) => (
                  <div 
                    key={tz.id}
                    onClick={() => { setPreferences(p => ({ ...p, timezone: tz.id })); setShowTzDropdown(false); }}
                    className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <span>{tz.name}</span>
                    {preferences.timezone === tz.id && <FiCheck className="text-[#00d0cb]" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Standard Language Checkboxes (Left untouched as requested) */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">Languages</label>
          <div className="grid grid-cols-2 gap-4">
            {['en', 'fr', 'ar'].map(lang => (
              <div key={lang} className="flex items-center">
                <input type="checkbox" id={`lang-${lang}`}
                  checked={preferences.languages.includes(lang)}
                  onChange={(e) => {
                    const langs = e.target.checked
                      ? [...preferences.languages, lang]
                      : preferences.languages.filter(l => l !== lang);
                    setPreferences(p => ({ ...p, languages: langs }));
                  }}
                  className="h-4 w-4 text-[#00d0cb] border-gray-700 rounded bg-gray-900" />
                <label htmlFor={`lang-${lang}`} className="ml-2 text-sm text-gray-300">
                  {lang === 'en' ? 'English' : lang === 'fr' ? 'French' : 'Arabic'}
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default PreferencesSection;
