import React from 'react';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';

const ContactInfoSection = ({ t, isRtl, academyData, setAcademyData, itemVariants }) => {
  const fields = [
    { field: 'email',     label: t('contactSocial.email'),    type: 'email', placeholder: 'academy@example.com',        autoComplete: 'email' },
    { field: 'phone',     label: t('contactSocial.phone'),    type: 'tel',   placeholder: '+216 12 345 678',             autoComplete: 'tel' },
    { field: 'website',   label: t('contactSocial.website'),  type: 'url',   placeholder: 'https://yourwebsite.com',     autoComplete: 'url' },
    { field: 'facebook',  label: t('contactSocial.facebook'), type: 'url',   placeholder: 'https://facebook.com/...',   autoComplete: 'url' },
    { field: 'instagram', label: t('contactSocial.instagram'),type: 'url',   placeholder: 'https://instagram.com/...',  autoComplete: 'url' },
  ];

  return (
    <motion.div
      id="contact-info"
      variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
    >
      <div className={`flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4fb0ff] shrink-0">
          <FiMail className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t('contactSocial.title')}</h2>
          <p className="text-gray-400 text-sm">{t('contactSocial.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(item => (
          <div key={item.field}>
            <label className={`block text-gray-300 font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
              {item.label}
            </label>
            <input
              type={item.type}
              value={academyData[item.field] || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              dir="ltr"
              autoComplete={item.autoComplete}
              placeholder={item.placeholder}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ContactInfoSection;
