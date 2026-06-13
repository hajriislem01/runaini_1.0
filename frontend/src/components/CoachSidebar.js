import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiHome, FiUsers, FiSettings, FiCalendar, FiUser, FiLogOut,
  FiX, FiMenu, FiChevronRight
} from 'react-icons/fi';
import { FaFutbol } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoachSession } from '../context/CoachSessionContext';

const navItems = [
  { to: '/coach/dashboard', icon: <FiHome />, key: 'dashboard' },
  { to: '/coach/profile', icon: <FiUser />, key: 'profile' },
  { to: '/coach/players', icon: <FiUsers />, key: 'players' },
  { to: '/coach/training', icon: <FaFutbol />, key: 'training' },
  { to: '/coach/agenda', icon: <FiCalendar />, key: 'agenda' },
  { to: '/coach/settings', icon: <FiSettings />, key: 'settings' },
];

const CoachSidebar = ({
  isMobileOpen,
  setIsMobileOpen,
  isDesktopCollapsed,
  setIsDesktopCollapsed
}) => {
  const navigate = useNavigate();
  const { coachPhoto, coachName } = useCoachSession();
  const { t, i18n } = useTranslation('coachsidebar');
  const isRtl = i18n.language === 'ar';

  // Desktop handlers
  const toggleDesktop = () => setIsDesktopCollapsed(!isDesktopCollapsed);

  // Mobile collapsed state inside drawer
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true);

  // Sync isMobileCollapsed when drawer opens
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileCollapsed(false);
    }
  }, [isMobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    setIsMobileOpen(false);
  };

  const closeMobile = () => setIsMobileOpen(false);
  const toggleMobileCollapse = () => setIsMobileCollapsed(!isMobileCollapsed);

  return (
    <>
      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={closeMobile}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 180 }}
              className={`lg:hidden fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-[9999] w-[260px] shadow-xl overflow-hidden`}
            >
              <div
                className="h-full flex flex-col overflow-y-auto"
                style={{
                  background: 'linear-gradient(180deg, #000000 0%, #0a0f2a 30%, #0f172a 70%, #000000 100%)'
                }}
              >
                {/* Header */}
                <div className="relative p-5 pb-6 border-b border-gray-800/60">
                  <motion.div
                    className={`flex items-center ${isMobileCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer`}
                    onClick={toggleMobileCollapse}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`rounded-full flex-shrink-0 overflow-hidden border-2 border-[#00d0cb]/40 shadow-md shadow-[#00d0cb]/20 ${isMobileCollapsed ? 'w-11 h-11' : 'w-10 h-10'}`}>
                      {coachPhoto ? (
                        <img src={coachPhoto} alt={coachName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#902bd1] to-[#c135ff] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{coachName?.charAt(0)?.toUpperCase() || 'C'}</span>
                        </div>
                      )}
                    </div>

                    {!isMobileCollapsed && (
                      <div className="min-w-0">
                        <h1 className="text-white text-lg font-bold truncate max-w-[140px]">{coachName}</h1>
                        <p className="text-xs text-gray-300">{t('sidebar.coachPanel')}</p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-2 px-3 mt-4 flex-1">
                  {navItems.map((item) => (
                    <motion.div
                      key={item.to}
                      whileHover={{ x: isRtl ? -4 : 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative"
                    >
                      <NavLink
                        to={item.to}
                        onClick={closeMobile}
                        className={({ isActive }) =>
                          `group flex items-center justify-between rounded-xl transition-all duration-300
                          ${isMobileCollapsed ? 'justify-center p-3.5' : 'px-4 py-3.5 gap-4'}
                          ${isActive
                            ? 'bg-gradient-to-r from-[#902bd1]/30 to-[#c135ff]/20 text-white border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#00d0cb] shadow-lg shadow-[#902bd1]/10'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/40 hover:border-l-2 rtl:hover:border-l-0 rtl:hover:border-r-2 hover:border-[#ff6b35]/50'
                          }`
                        }
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 text-[#05d4f0]">
                            {item.icon}
                          </div>
                          {!isMobileCollapsed && (
                            <span className="text-base font-medium truncate">{t(`sidebar.${item.key}`)}</span>
                          )}
                        </div>

                        {!isMobileCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: isRtl ? 5 : -5 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiChevronRight className="text-gray-500 group-hover:text-[#ff6b35] transition-colors rtl:rotate-180" />
                          </motion.div>
                        )}
                      </NavLink>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#902bd1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
                    </motion.div>
                  ))}
                </div>

                {/* Logout at bottom */}
                <div className="mt-auto p-4 border-t border-gray-800/60">
                  <motion.div
                    whileHover={{ x: isRtl ? -4 : 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <button
                      onClick={handleLogout}
                      className={`group flex items-center justify-between w-full rounded-xl transition-all duration-300
                        ${isMobileCollapsed ? 'justify-center p-3.5' : 'px-4 py-3.5 gap-4'}
                        text-red-400 hover:text-red-300 hover:bg-gray-800/40`}
                    >
                      <div className="flex items-center gap-4">
                        <FiLogOut className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                        {!isMobileCollapsed && <span className="text-base font-medium">{t('sidebar.logout')}</span>}
                      </div>

                      {!isMobileCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: isRtl ? 5 : -5 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiChevronRight className="text-gray-500 group-hover:text-red-400 transition-colors rtl:rotate-180" />
                        </motion.div>
                      )}
                    </button>

                    {/* Hover glow effect for logout */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR - Enhanced with Notch integration - Direct inline flex child */}
      <motion.div
        animate={{ width: isDesktopCollapsed ? 80 : 260 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen flex-shrink-0 border-r rtl:border-r-0 rtl:border-l border-gray-700/50 relative z-[999]"
      >
        <div
          className="flex flex-col flex-1 w-full overflow-hidden relative z-10"
          style={{
            background: 'linear-gradient(180deg, #000000 0%, #0a0f2a 30%, #0f172a 70%, #000000 100%)'
          }}
        >
          {/* Header - Logo area */}
          <div className="relative p-4 pb-6 border-b border-gray-800/60">
            <div className={`flex items-center gap-3 ${isDesktopCollapsed ? 'justify-center' : ''}`}>
              <div className={`rounded-full flex-shrink-0 overflow-hidden border-2 border-[#00d0cb]/40 shadow-lg shadow-[#00d0cb]/20 transition-all duration-300 ${isDesktopCollapsed ? 'w-9 h-9' : 'w-11 h-11'}`}>
                {coachPhoto ? (
                  <img src={coachPhoto} alt={coachName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#902bd1] to-[#c135ff] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{coachName?.charAt(0)?.toUpperCase() || 'C'}</span>
                  </div>
                )}
              </div>

              {!isDesktopCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-white text-base font-bold truncate max-w-[140px]">{coachName}</h1>
                  <p className="text-xs text-gray-400 font-medium">{t('sidebar.coachPanel')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2 px-3 mt-4 flex-1">
            {navItems.map((item) => (
              <motion.div
                key={item.to}
                whileHover={{ x: isRtl ? -8 : 8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl transition-all duration-300
                    ${isDesktopCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-4'}
                    ${isActive
                      ? 'bg-gradient-to-r from-[#c135ff]/30 to-[#902bd1]/20 text-white border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#00d0cb] shadow-lg shadow-[#902bd1]/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/40 hover:border-l-2 rtl:hover:border-l-0 rtl:hover:border-r-2 hover:border-[#ff6b35]/50'
                    }`
                  }
                  title={isDesktopCollapsed ? t(`sidebar.${item.key}`) : undefined}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 text-[#05d4f0]">
                      {item.icon}
                    </div>

                    {!isDesktopCollapsed && (
                      <span className="text-sm font-medium truncate">{t(`sidebar.${item.key}`)}</span>
                    )}
                  </div>

                  {!isDesktopCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      <FiChevronRight className="text-gray-500 group-hover:text-[#ff6b35] transition-colors rtl:rotate-180" />
                    </motion.div>
                  )}

                  {/* Nice tooltip when collapsed */}
                  {isDesktopCollapsed && (
                    <div className={`
                      absolute ${isRtl ? 'right-full mr-3' : 'left-full ml-3'} px-4 py-2 bg-gray-900/95 text-white text-sm
                      rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      pointer-events-none transition-all duration-200 whitespace-nowrap
                      border border-gray-700/70 shadow-xl z-50
                      translate-x-[-8px] rtl:translate-x-[8px] group-hover:translate-x-0
                    `}>
                      {t(`sidebar.${item.key}`)}
                    </div>
                  )}
                </NavLink>

                {/* Hover glow effect for desktop */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#902bd1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
              </motion.div>
            ))}
          </div>

          {/* Logout at bottom */}
          <div className={`p-4 ${isDesktopCollapsed ? '' : 'border-t border-gray-800/60'}`}>
            <motion.div
              whileHover={{ x: isRtl ? -8 : 8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <button
                onClick={handleLogout}
                className={`
                  group flex items-center justify-between w-full rounded-xl transition-all duration-300
                  ${isDesktopCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-4'}
                  text-red-400 hover:text-red-300 hover:bg-gray-800/40
                `}
                title={isDesktopCollapsed ? t('sidebar.logout') : undefined}
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <FiLogOut />
                  </div>
                  {!isDesktopCollapsed && (
                    <span className="text-sm font-medium">{t('sidebar.logout')}</span>
                  )}
                </div>

                {!isDesktopCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                  >
                    <FiChevronRight className="text-gray-500 group-hover:text-red-400 transition-colors rtl:rotate-180" />
                  </motion.div>
                )}

                {isDesktopCollapsed && (
                  <div className={`
                    absolute ${isRtl ? 'right-full mr-3' : 'left-full ml-3'} px-4 py-2 bg-gray-900/95 text-white text-sm
                    rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    pointer-events-none transition-all duration-200 whitespace-nowrap
                    border border-gray-700/70 shadow-xl z-50
                    translate-x-[-8px] rtl:translate-x-[8px] group-hover:translate-x-0
                  `}>
                    {t('sidebar.logout')}
                  </div>
                )}
              </button>

              {/* Hover glow effect for logout */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
            </motion.div>
          </div>
        </div>

        {/* The Inline Notch */}
        <div
          className="absolute top-1/2 right-0 translate-x-[14px] rtl:right-auto rtl:left-0 rtl:-translate-x-[14px] -translate-y-1/2 z-20 flex items-center justify-center cursor-pointer pointer-events-auto"
          onClick={toggleDesktop}
        >
          <motion.svg
            width="15"
            height="96"
            viewBox="0 0 15 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="backdrop-blur-[12px] rtl:rotate-180"
          >
            <path
              d="M 1 0 C 1 24, 15 24, 15 48 C 15 72, 1 72, 1 96 Z"
              className="fill-[#0c132a] stroke-gray-700/50"
              strokeWidth="1"
            />
          </motion.svg>
          <motion.div
            animate={{ rotate: isDesktopCollapsed ? (isRtl ? 180 : 0) : (isRtl ? 0 : 180) }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute text-gray-400"
          >
            <FiChevronRight size={14} />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default CoachSidebar;
