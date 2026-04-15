import React from 'react';
import { motion } from 'framer-motion';
import { FaRegBuilding } from 'react-icons/fa';
import { FiMail, FiHome, FiClock, FiLock } from 'react-icons/fi';

const SettingsSidebar = ({ itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="hidden lg:block fixed left-15 top-15 h-full w-64 z-40">
      <div className="h-full bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 p-6">
        <div className="space-y-2">
          {[
            { href: '#academy-info', icon: <FaRegBuilding />, label: 'Academy Information', sub: 'Configure academy details' },
            { href: '#contact-info', icon: <FiMail />, label: 'Contact & Social', sub: 'Manage contact info' },
            { href: '#facilities', icon: <FiHome />, label: 'Facilities & Staff', sub: 'Manage facilities' },
            { href: '#preferences', icon: <FiClock />, label: 'Preferences', sub: 'Set preferences' },
            { href: '#privacy', icon: <FiLock />, label: 'Privacy & Security', sub: 'Security settings' },
          ].map(item => (
            <motion.a key={item.href} whileHover={{ x: 4 }} href={item.href}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">{item.icon}</div>
              <div className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-gray-400">{item.sub}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsSidebar;
