import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiUser, FiCalendar, FiSettings,
  FiCreditCard, FiMail, FiTarget, FiLogOut, FiX, FiMenu, FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileContext } from '../context/ProfileContext';

const navItems = [
  { to: '/administration/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { to: '/administration/profile', icon: <FiUser />, label: 'Profile' },
  { to: '/administration/player-management', icon: <FiUsers />, label: 'Groups & Players' },
  { to: '/administration/coach-management', icon: <FiUser />, label: 'Coaches' },
  { to: '/administration/events-management', icon: <FiTarget />, label: 'Events' },
  { to: '/administration/payment-management', icon: <FiCreditCard />, label: 'Payments' },
  { to: '/administration/agenda-management', icon: <FiCalendar />, label: 'Agenda' },
  { to: '/administration/contact', icon: <FiMail />, label: 'Contact' },
  { to: '/administration/settings', icon: <FiSettings />, label: 'Settings' },
];

const AdministrationSidebar = () => {
  const navigate = useNavigate();
  const { profileData } = useProfileContext();
  const [organizationName, setOrganizationName] = useState('Organization');

  // Desktop collapsed state
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Mobile drawer + collapsed state inside drawer
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true); // start collapsed on mobile

  useEffect(() => {
    if (profileData?.academyInfo?.name) {
      setOrganizationName(profileData.academyInfo.name);
    } else {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser?.academyInfo?.name) {
        setOrganizationName(storedUser.academyInfo.name);
      }
    }
  }, [profileData]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    setIsMobileOpen(false);
  };

  // Desktop handlers
  const toggleDesktop = () => setIsDesktopCollapsed(!isDesktopCollapsed);
  const expandDesktop = () => setIsDesktopCollapsed(false);

  // Mobile handlers
  const openMobile = () => {
    setIsMobileOpen(true);
    setIsMobileCollapsed(true); // always open in collapsed mode first
  };
  const closeMobile = () => setIsMobileOpen(false);
  const toggleMobileCollapse = () => setIsMobileCollapsed(!isMobileCollapsed);

  const sidebarWidth = (collapsed) => collapsed ? 72 : 260;
  return (
     <>
      {/* MOBILE HAMBURGER BUTTON - Enhanced */}
      <motion.button
        onClick={isMobileOpen ? closeMobile : openMobile}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="md:hidden fixed top-4 right-4 z-50 p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg border border-gray-700/70 text-white hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </motion.button>

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
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={closeMobile}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 180 }}
              className="md:hidden fixed left-0 top-0 h-full z-50 overflow-hidden"
              style={{ width: sidebarWidth(isMobileCollapsed) }}
            >
              <div
                className="h-full flex flex-col overflow-y-auto"
                style={{
                  background: 'linear-gradient(180deg, #000000 0%, #0a0f2a 30%, #0f172a 70%, #000000 100%)'
                  // background: 'linear-gradient(180deg, #902bd1 0%, #6753d8 39%, #0da5a1 55%, #6753d8 71%, #902bd1 100%)'

                  
                }}
              >
                {/* Header */}
                <div className="relative p-5 pb-6 border-b border-gray-800/60">
                  {/* Logo - clickable to expand/collapse */}
                  <motion.div
                    className={`flex items-center ${isMobileCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer`}
                    onClick={toggleMobileCollapse}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`rounded-xl bg-gradient-to-br from-[#00d0cb] to-[#21547C] flex items-center justify-center flex-shrink-0 ${isMobileCollapsed ? 'w-11 h-11' : 'w-10 h-10'}`}>
                      <span className="text-white font-bold text-xl">R</span>
                    </div>

                    {!isMobileCollapsed && (
                      <div className="min-w-0">
                        <h1 className="text-white text-lg font-bold truncate max-w-[140px]">{organizationName}</h1>
                        <p className="text-xs text-gray-300">Administration Panel</p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-2 px-3 mt-4 flex-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.to}
                      whileHover={{ x: 4 }}
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
                            ? 'bg-gradient-to-r from-[#21547C]/30 to-[#00d0cb]/20 text-white border-l-4 border-[#00d0cb] shadow-lg shadow-[#00d0cb]/10'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/40 hover:border-l-2 hover:border-[#902bd1]/50'
                          }`
                        }
                      >
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 text-[#05d4f0]
                           `}
                          >
                            {item.icon}
                          </div>
                          {!isMobileCollapsed && (
                            <span className="text-base font-medium truncate">{item.label}</span>
                          )}
                        </div>
                        
                        {!isMobileCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiChevronRight className="text-gray-500 group-hover:text-[#902bd1] transition-colors" />
                          </motion.div>
                        )}
                      </NavLink>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#00d0cb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
                    </motion.div>
                  ))}
                </div>

                {/* Logout */}
                <div className="mt-auto p-4 border-t border-gray-800/60">
                  <motion.div
                    whileHover={{ x: 4 }}
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
                        {!isMobileCollapsed && <span className="text-base font-medium">Logout</span>}
                      </div>
                      
                      {!isMobileCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiChevronRight className="text-gray-500 group-hover:text-red-400 transition-colors" />
                        </motion.div>
                      )}
                    </button>

                    {/* Hover glow effect for logout */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
                  </motion.div>
                </div>

                {/* Footer/Version for mobile */}
                {!isMobileCollapsed && (
                  <div className="p-4 border-t border-gray-800/40">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-800/60">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-xs text-gray-200 font-medium">System Active</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">Runaini Admin v2.0</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR - Enhanced with new design */}
      <motion.div
        animate={{ width: isDesktopCollapsed ? 72 : 256 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`
          hidden md:flex flex-col h-screen fixed left-0 top-0 z-40
          overflow-hidden
        `}
        style={{
           background: 'linear-gradient(180deg, #000000 0%, #0a0f2a 30%, #0f172a 70%, #000000 100%)'
        }}
      >
        {/* Header - Logo + Close button when expanded */}
        <div className="relative p-4 pb-6 border-b border-gray-800/60">
          {/* Close button - only visible when expanded */}
          {!isDesktopCollapsed && (
            <motion.button
              onClick={toggleDesktop}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-5 right-5 text-gray-400 hover:text-white 
                       p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
              aria-label="Collapse sidebar"
            >
              <FiX size={20} />
            </motion.button>
          )}

          {/* Logo area - clickable to expand when collapsed */}
          <motion.div
            className={`
              flex items-center gap-3 cursor-pointer
              ${isDesktopCollapsed ? 'justify-center' : ''}
            `}
            onClick={isDesktopCollapsed ? expandDesktop : undefined}
            // whileHover={{ scale: isDesktopCollapsed ? 1.05 : 1.02 }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d0cb] to-[#21547C] 
                            flex items-center justify-center flex-shrink-0
                            ${isDesktopCollapsed ? 'w-9 h-9' : 'w-10 h-10'}`}>
              <span className="text-white font-bold text-lg">R</span>
            </div>

            {!isDesktopCollapsed && (
              <div className="min-w-0">
                <h1 className="text-white text-lg font-bold truncate max-w-[140px]">
                  {organizationName}
                </h1>
                <p className="text-xs text-gray-300 font-medium">
                  Administration Panel
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2 px-3 mt-4 flex-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              whileHover={{ x: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl transition-all duration-300
                   ${isDesktopCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-4'}
                   ${isActive
                    ? 'bg-gradient-to-r from-[#21547C]/30 to-[#00d0cb]/20 text-white border-l-4 border-[#00d0cb] shadow-lg shadow-[#00d0cb]/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/40 hover:border-l-2 hover:border-[#902bd1]/50'
                  }`
                }
                title={isDesktopCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 text-[#05d4f0]
                   `}>
                    {item.icon}
                  </div>

                  {!isDesktopCollapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {!isDesktopCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="hidden lg:block"
                  >
                    <FiChevronRight className="text-gray-500 group-hover:text-[#902bd1] transition-colors" />
                  </motion.div>
                )}

                {/* Nice tooltip when collapsed */}
                {isDesktopCollapsed && (
                  <div className="
                    absolute left-full ml-3 px-4 py-2 bg-gray-900/95 text-white text-sm
                    rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    pointer-events-none transition-all duration-200 whitespace-nowrap
                    border border-gray-700/70 shadow-xl z-50
                    translate-x-[-8px] group-hover:translate-x-0
                  ">
                    {item.label}
                  </div>
                )}
              </NavLink>

              {/* Hover glow effect for desktop */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#00d0cb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
            </motion.div>
          ))}
        </div>

        {/* Footer/Version */}
        {!isDesktopCollapsed && (
          <div className="mt-auto py-3 border-t border-gray-800/40">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-800/60">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs text-gray-200 font-medium">System Active</span>
              </div>
              <p className="text-xs text-gray-300 mt-3">Runaini Admin v2.0</p>
            </div>
          </div>
        )}

        {/* Logout at bottom */}
        <div className={`p-4 ${isDesktopCollapsed ? '' : 'border-t border-gray-800/60'}`}>
          <motion.div
            whileHover={{ x: 8 }}
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
              title={isDesktopCollapsed ? "Logout" : undefined}
            >
              <div className="flex items-center gap-4">
                <div className="text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <FiLogOut />
                </div>
                {!isDesktopCollapsed && (
                  <span className="text-sm font-medium">Logout</span>
                )}
              </div>

              {!isDesktopCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="hidden lg:block"
                >
                  <FiChevronRight className="text-gray-500 group-hover:text-red-400 transition-colors" />
                </motion.div>
              )}

              {isDesktopCollapsed && (
                <div className="
                  absolute left-full ml-3 px-4 py-2 bg-gray-900/95 text-white text-sm
                  rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  pointer-events-none transition-all duration-200 whitespace-nowrap
                  border border-gray-700/70 shadow-xl z-50
                  translate-x-[-8px] group-hover:translate-x-0
                ">
                  Logout
                </div>
              )}
            </button>

            {/* Hover glow effect for logout */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
          </motion.div>
        </div>
      </motion.div>

      {/* Content spacer */}
      <div className={`hidden md:block transition-all duration-300 ease-in-out ${isDesktopCollapsed ? 'w-[72px]' : 'w-64'}`} />
    </>
  );
};

export default AdministrationSidebar;


