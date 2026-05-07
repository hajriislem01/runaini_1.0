import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUser, FiSettings, FiLogOut, FiX, FiMenu,
  FiTrendingUp, FiActivity, FiChevronRight
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import NotificationBell from '../components/NotificationBell';
import EventDetailDrawer from '../components/common/EventDetailDrawer';
import API from '../pages/api';

const navItems = [
  { to: '/players', icon: <FiHome />, label: 'Home' },
  { to: '/players/profile', icon: <FiUser />, label: 'Profile' },
  { to: '/players/training', icon: <FaDumbbell />, label: 'Training' },
  { to: '/players/performance', icon: <FiTrendingUp />, label: 'Performance' },
  { to: '/players/settings', icon: <FiSettings />, label: 'Settings' },
];

const PlayerLayout = () => {
  const { player, photoUrl, playerInitial } = usePlayer();
  const navigate = useNavigate();

  const playerName = player?.full_name || player?.name || player?.user?.first_name || 'Player';

  // Desktop collapsed state
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Mobile drawer + collapsed state inside drawer
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true);

  // Notification / Detail Drawer State
  const [detailSession, setDetailSession] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleNotificationClick = async (n) => {
    if (!n.event_id) return;
    setIsDetailLoading(true);
    setDetailSession({ id: n.event_id, _isEvent: n.event_type === 'event', _isTraining: n.event_type === 'session' });
    try {
      const endpoint = n.event_type === 'session' ? `trainings/${n.event_id}/` : `events/${n.event_id}/`;
      const res = await API.get(endpoint);
      setDetailSession({ 
        ...res.data, 
        _isEvent: n.event_type === 'event',
        _isTraining: n.event_type === 'session'
      });
    } catch (err) {
      console.error('Failed to load event details:', err);
      setDetailSession(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    setIsMobileOpen(false);
  };

  // Desktop handlers
  const toggleDesktop = () => setIsDesktopCollapsed(prev => !prev);
  const expandDesktop = () => setIsDesktopCollapsed(false);

  // Mobile handlers
  const openMobile = () => {
    setIsMobileOpen(true);
    setIsMobileCollapsed(true);
  };
  const closeMobile = () => setIsMobileOpen(false);
  const toggleMobileCollapse = () => setIsMobileCollapsed(prev => !prev);

  const sidebarWidth = (collapsed) => collapsed ? 72 : 260;

  return (

    <div className="flex min-h-screen bg-gradient-to-r from-black via-[#902bd1] to-[#00d0cb]">
      <div>
        {/* MOBILE HAMBURGER BUTTON - Enhanced */}
        <motion.button
          onClick={isMobileOpen ? closeMobile : openMobile}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden fixed top-4 right-4 z-50 p-1 rounded-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg border border-gray-700/70 hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? (
            <FiX size={24} className="text-white" />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-[#00d0cb] overflow-hidden flex items-center justify-center bg-gray-800 text-gray-400 font-bold text-xs">
              {photoUrl ? (
                <img src={photoUrl} alt="Player" className="w-full h-full object-cover" />
              ) : (
                playerInitial
              )}
            </div>
          )}
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
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={closeMobile}
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 24, stiffness: 180 }}
                className="lg:hidden fixed left-0 top-0 h-full z-50 overflow-hidden"
                style={{ width: sidebarWidth(isMobileCollapsed) }}
              >
                <div
                  className="h-full flex flex-col overflow-y-auto"
                  style={{
                    background: 'linear-gradient(180deg, #000000 0%, #0a0f2a 30%, #0f172a 70%, #000000 100%)'
                  }}
                >
                  {/* Header */}
                  <div className="relative p-5 pb-6 border-b border-gray-800/60">
                    {/* Player Info - clickable to expand/collapse */}
                    <motion.div
                      className={`flex items-center ${isMobileCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer`}
                      onClick={toggleMobileCollapse}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Player Image */}
                      <div className={`flex items-center justify-center flex-shrink-0 overflow-hidden rounded-full border-2 border-[#00d0cb] bg-gray-800 text-gray-400 font-bold ${isMobileCollapsed ? 'w-11 h-11 text-base' : 'w-10 h-10 text-sm'}`}>
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt="Player"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          playerInitial
                        )}
                      </div>

                      {!isMobileCollapsed && (
                        <div className="min-w-0">
                          <h1 className="text-white text-lg font-bold truncate max-w-[140px]">{playerName}</h1>
                          <p className="text-xs text-gray-300">Team Member</p>
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
                          end={item.to === '/players'}
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
                        <p className="text-xs text-gray-300 mt-1">Runaini Coach v2.0</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* DESKTOP SIDEBAR - Enhanced with Notch integration */}
        <motion.div
          animate={{ width: isDesktopCollapsed ? 72 : 256 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`
      hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40
    `}
        >
          <div
            className="flex flex-col flex-1 w-full overflow-hidden border-r border-gray-700/50 relative z-10"
            style={{
              background: 'linear-gradient(180deg, #000000 0%, #0a0f2a 30%, #0f172a 70%, #000000 100%)'
            }}
          >
            {/* Header - Player Info area */}
            <div className="relative  p-4 pb-6 border-b border-gray-800/60">
              <motion.div
                className={`
            flex items-center gap-3
            ${isDesktopCollapsed ? 'justify-center' : ''}
          `}
              >
                {/* Player Image */}
                <div className={`flex items-center justify-center flex-shrink-0 overflow-hidden rounded-full border-2 border-[#00d0cb] bg-gray-800 text-gray-400 font-bold ${isDesktopCollapsed ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'}`}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Player"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    playerInitial
                  )}
                </div>

                {!isDesktopCollapsed && (
                  <div className="min-w-0">
                    <h1 className="text-white text-lg font-bold truncate max-w-[140px]">
                      {playerName}
                    </h1>
                    <p className="text-xs text-gray-300 font-medium">
                      Team Member
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
                    end={item.to === '/players'}
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
          </div>

          {/* The Inline Notch */}
          <div
            className="absolute top-1/2 right-0 translate-x-[14px] -translate-y-1/2 z-20 flex items-center justify-center cursor-pointer pointer-events-auto"
            onClick={toggleDesktop}
          >
            <motion.svg
              width="15"
              height="96"
              viewBox="0 0 15 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="backdrop-blur-[12px]"
            >
              <path
                d="M 1 0 C 1 24, 15 24, 15 48 C 15 72, 1 72, 1 96 Z"
                className="fill-[#0c132a] stroke-gray-700/50"
                strokeWidth="1"
              />
            </motion.svg>
            <motion.div
              animate={{ rotate: isDesktopCollapsed ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute text-gray-400"
            >
              <FiChevronRight size={14} />
            </motion.div>
          </div>
        </motion.div>

        {/* Content spacer */}
        <div className={`hidden lg:block transition-all duration-300 ease-in-out ${isDesktopCollapsed ? 'w-[72px]' : 'w-64'}`} />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-700/50 bg-black/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold hidden sm:block">Player Space</h2>
          </div>
          <div className="flex items-center gap-4 pr-16 md:pr-0">
            <NotificationBell onNotificationClick={handleNotificationClick} />
            <div className="w-px h-6 bg-gray-700/50 mx-1 hidden sm:block" />
            <div className="items-center gap-3 hidden sm:flex">
               <div className="text-right">
                  <p className="text-xs font-bold text-white leading-none">{playerName}</p>
                  <p className="text-[10px] text-[#00d0cb]">Verified Player</p>
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <Outlet />
        </div>
      </div>

      {/* Global Detail Drawer for Notifications */}
      <EventDetailDrawer 
        detailSession={detailSession}
        setDetailSession={setDetailSession}
        isDetailLoading={isDetailLoading}
        userType="player"
        playerId={player?.id}
      />
    </div>

  );
};

export default PlayerLayout;







