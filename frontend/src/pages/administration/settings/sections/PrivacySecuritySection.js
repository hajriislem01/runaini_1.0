import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEyeOff, FiEye } from 'react-icons/fi';

const PrivacySecuritySection = ({ passwords, setPasswords, showPassword, setShowPassword, itemVariants }) => {
  return (
    <motion.div id="privacy" variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4fb0ff]"><FiLock className="text-xl" /></div>
        <div>
          <h2 className="text-2xl font-bold">Privacy & Security</h2>
          <p className="text-gray-400 text-sm">Manage your password and security settings</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'currentPassword', label: 'Current Password', placeholder: '••••••', autoComplete: 'current-password' },
          { key: 'newPassword', label: 'New Password', placeholder: 'Create a new password', autoComplete: 'new-password' },
          { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm your new password', autoComplete: 'new-password' }
        ].map(item => (
          <div key={item.key}>
            <label className="block text-gray-300 font-medium mb-2">{item.label}</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'}
                value={passwords[item.key]}
                onChange={(e) => setPasswords(p => ({ ...p, [item.key]: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 pr-12"
                autoComplete={item.autoComplete}
                placeholder={item.placeholder} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PrivacySecuritySection;
