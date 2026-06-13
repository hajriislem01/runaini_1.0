import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiMenu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

const PlayerHeader = ({
  isMobileOpen,
  handleHamburgerClick,
  handleNotificationClick
}) => {
  const { playerName } = usePlayer();
  const { t } = useTranslation('playersidebar');

  return (
    <header className="h-16 flex items-center justify-between px-6 py-3 border-b border-gray-700/50 bg-black/20 backdrop-blur-md z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-white font-bold hidden sm:block">
          {t('sidebar.playerSpace')}
        </h2>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <LanguageSwitcher />
        <div className="w-px h-6 bg-gray-700/50 hidden sm:block" />
        <NotificationBell onNotificationClick={handleNotificationClick} />
        <div className="w-px h-6 bg-gray-700/50 hidden sm:block" />
        <div className="items-center gap-3 hidden sm:flex">
          <div className="text-right">
            <p className="text-xs font-bold text-white leading-none">{playerName}</p>
            <p className="text-[10px] text-[#00d0cb]">{t('sidebar.verifiedPlayer')}</p>
          </div>
        </div>

        {/* MOBILE & TABLET HAMBURGER BUTTON - In Flex Flow */}
        <motion.button
          onClick={handleHamburgerClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden z-[9999] w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg border border-gray-700/70 text-white hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center flex-shrink-0"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </motion.button>
      </div>
    </header>
  );
};

export default PlayerHeader;
