import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEyeOff, FiEye } from 'react-icons/fi';

const PrivacySecuritySection = ({ t, isRtl, passwords, setPasswords, showPassword, setShowPassword, handleSavePassword, isSubmittingPassword, itemVariants }) => {
  const fields = [
    { key: 'currentPassword', label: t('privacy.currentPassword'), placeholder: '••••••',                              autoComplete: 'current-password' },
    { key: 'newPassword',     label: t('privacy.newPassword'),     placeholder: t('privacy.newPassword'),              autoComplete: 'new-password' },
    { key: 'confirmPassword', label: t('privacy.confirmPassword'), placeholder: t('privacy.confirmPassword'),          autoComplete: 'new-password' },
  ];

  return (
    <motion.div
      id="privacy"
      variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
    >
      {/* Section header */}
      <div className={`flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4fb0ff] shrink-0">
          <FiLock className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t('privacy.title')}</h2>
          <p className="text-gray-400 text-sm">{t('privacy.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(item => (
          <div key={item.key}>
            <label className={`block text-gray-300 font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
              {item.label}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwords[item.key]}
                onChange={(e) => setPasswords(p => ({ ...p, [item.key]: e.target.value }))}
                className={`w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 ${isRtl ? 'pr-4 pl-12' : 'pr-12 pl-4'}`}
                dir="ltr"
                autoComplete={item.autoComplete}
                placeholder={item.placeholder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors`}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Password Button */}
      <div className={`mt-8 pt-6 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
        <p className="text-gray-500 text-xs text-center sm:text-left">
          {t('privacy.minChars', { defaultValue: 'Password must be at least 8 characters long.' })}
        </p>
        <button
          type="button"
          onClick={handleSavePassword}
          disabled={isSubmittingPassword || !passwords.currentPassword || !passwords.newPassword}
          className="w-full sm:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-[#902bd1] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          {isSubmittingPassword ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiLock size={16} />
          )}
          {isSubmittingPassword ? t('privacy.updating', { defaultValue: 'Updating...' }) : t('privacy.updatePassword', { defaultValue: 'Update Password' })}
        </button>
      </div>
    </motion.div>
  );
};

export default PrivacySecuritySection;
