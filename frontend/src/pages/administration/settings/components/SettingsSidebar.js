import React from 'react';
import { motion } from 'framer-motion';
import { FaRegBuilding } from 'react-icons/fa';
import { FiMail, FiHome, FiClock, FiLock } from 'react-icons/fi';

const SettingsSidebar = ({ t, isRtl, itemVariants }) => {
  const navItems = [
    { href: '#academy-info', icon: <FaRegBuilding />, label: t('sidebar.academyInfo'), sub: t('sidebar.academyInfoSub') },
    { href: '#contact-info', icon: <FiMail />,        label: t('sidebar.contactSocial'), sub: t('sidebar.contactSocialSub') },
    { href: '#facilities',   icon: <FiHome />,        label: t('sidebar.facilitiesStaff'), sub: t('sidebar.facilitiesStaffSub') },
    { href: '#preferences',  icon: <FiClock />,       label: t('sidebar.preferences'), sub: t('sidebar.preferencesSub') },
    { href: '#privacy',      icon: <FiLock />,        label: t('sidebar.privacySecurity'), sub: t('sidebar.privacySecuritySub') },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className={`hidden lg:block fixed ${isRtl ? 'right-15' : 'left-15'} top-15 h-full w-64 z-40`}
    >
      <div className="h-full bg-gray-900/50 backdrop-blur-sm border-gray-700/50 p-6"
           style={{ borderRight: isRtl ? 'none' : '1px solid rgba(107,114,128,0.5)', borderLeft: isRtl ? '1px solid rgba(107,114,128,0.5)' : 'none' }}>
        <div className="space-y-2">
          {navItems.map(item => (
            <motion.a
              key={item.href}
              whileHover={{ x: isRtl ? -4 : 4 }}
              href={item.href}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] shrink-0">
                {item.icon}
              </div>
              <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
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
