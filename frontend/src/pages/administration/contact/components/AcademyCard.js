import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiMail, FiPhone, FiGlobe, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AcademyCard = ({ academy, setSelectedAcademy }) => {
  const { t, i18n } = useTranslation('contactmanagement');
  const isRtl = i18n.language === 'ar';

  const translatedCountry = academy.country ? t(`countries.${academy.country}`) : '';
  const locationText = [academy.city, translatedCountry].filter(Boolean).join(isRtl ? '، ' : ', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all cursor-pointer group ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={() => setSelectedAcademy(academy)}
    >
      <div className={`flex items-start gap-4 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className="relative">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] border border-gray-700 flex items-center justify-center flex-shrink-0">
            {academy.logo_url ? (
              <img src={academy.logo_url} alt={academy.name} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-white font-bold text-xl">{academy.name?.charAt(0)}</span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className={`flex justify-between items-start gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h3 className="text-lg font-bold text-white group-hover:text-[#00d0cb] transition-colors truncate">
              {academy.name}
            </h3>
            {academy.founded && (
              <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-lg flex-shrink-0">
                {isRtl ? `تأسست ${academy.founded}` : `Est. ${academy.founded}`}
              </span>
            )}
          </div>
          {locationText && (
            <div className={`flex items-center gap-2 text-gray-400 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <FiMapPin className="text-[#4fb0ff] flex-shrink-0" />
              <span className="text-sm truncate">
                {locationText}
              </span>
            </div>
          )}
          {academy.colors && (
            <div className={`mt-2 flex ${isRtl ? 'justify-start' : ''}`}>
              <span className="px-2 py-1 rounded-full text-xs text-[#00d0cb] bg-[#00d0cb]/10 border border-[#00d0cb]/20">
                {academy.colors}
              </span>
            </div>
          )}
        </div>
      </div>

      {academy.philosophy && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{academy.philosophy}</p>
      )}

      <div className={`flex items-center justify-between mt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {academy.email && (
            <div className="flex items-center gap-1 text-gray-400">
              <FiMail className="text-[#4fb0ff]" size={14} />
            </div>
          )}
          {academy.phone && (
            <div className="flex items-center gap-1 text-gray-400">
              <FiPhone className="text-[#00d0cb]" size={14} />
            </div>
          )}
          {academy.website && (
            <div className="flex items-center gap-1 text-gray-400">
              <FiGlobe className="text-[#902bd1]" size={14} />
            </div>
          )}
        </div>
        {isRtl ? (
          <FiChevronLeft className="text-gray-400 group-hover:text-[#00d0cb] transition-colors" />
        ) : (
          <FiChevronRight className="text-gray-400 group-hover:text-[#00d0cb] transition-colors" />
        )}
      </div>
    </motion.div>
  );
};

export default AcademyCard;
