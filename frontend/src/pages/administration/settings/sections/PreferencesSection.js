import React from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';

const PreferencesSection = ({ preferences, setPreferences, itemVariants }) => {
  return (
    <motion.div id="preferences" variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#0020c8]"><FiClock className="text-xl" /></div>
        <div>
          <h2 className="text-2xl font-bold">Preferences</h2>
          <p className="text-gray-400 text-sm">Set your language and timezone preferences</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 font-medium mb-2">Time Zone</label>
          <select value={preferences.timezone}
            onChange={(e) => setPreferences(p => ({ ...p, timezone: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
            <option value="Africa/Tunis" className="bg-gray-900">Tunisia (GMT+1)</option>
            <option value="Africa/Algiers" className="bg-gray-900">Algeria (GMT+1)</option>
            <option value="Africa/Casablanca" className="bg-gray-900">Morocco (GMT+1)</option>
            <option value="Africa/Tripoli" className="bg-gray-900">Libya (GMT+2)</option>
            <option value="Africa/Cairo" className="bg-gray-900">Egypt (GMT+2)</option>
            <option value="Africa/Nouakchott" className="bg-gray-900">Mauritania (GMT+0)</option>
          </select>
        </div>
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
                  className="h-4 w-4 text-[#00d0cb] border-gray-700 rounded" />
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
