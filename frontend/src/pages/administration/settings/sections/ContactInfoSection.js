import React from 'react';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';

const ContactInfoSection = ({ academyData, setAcademyData, itemVariants }) => {
  return (
    <motion.div id="contact-info" variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4fb0ff]"><FiMail className="text-xl" /></div>
        <div>
          <h2 className="text-2xl font-bold">Contact & Social Media</h2>
          <p className="text-gray-400 text-sm">Manage your contact information and social links</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { field: 'email', label: 'Email', type: 'email', placeholder: 'academy@example.com' },
          { field: 'phone', label: 'Phone', type: 'tel', placeholder: '+216 12 345 678' },
          { field: 'website', label: 'Website', type: 'url', placeholder: 'https://yourwebsite.com' },
          { field: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...' },
          { field: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...' },
        ].map(item => (
          <div key={item.field}>
            <label className="block text-gray-300 font-medium mb-2">{item.label}</label>
            <input type={item.type} value={academyData[item.field] || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              placeholder={item.placeholder} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ContactInfoSection;
