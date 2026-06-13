// src/components/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown } from 'react-icons/fi';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const handleChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    // persistence is handled by i18next-browser-languagedetector (localStorage)
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLang}
        onChange={handleChange}
        className="bg-transparent text-gray-100 border border-gray-600 rounded-md px-2 py-1 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4fb0ff] hover:border-gray-500"
        aria-label="Select language"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code} className="bg-gray-800 text-white">
            {l.label}
          </option>
        ))}
      </select>
      <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
    </div>
  );
};

export default LanguageSwitcher;
