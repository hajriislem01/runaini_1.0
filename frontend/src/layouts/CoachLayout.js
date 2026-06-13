import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FiX, FiMenu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CoachSessionProvider, useCoachSession } from '../context/CoachSessionContext';
import NotificationBell from '../components/NotificationBell';
import EventDetailDrawer from '../components/common/EventDetailDrawer';
import CoachSidebar from '../components/CoachSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import API from '../pages/api';

const CoachLayoutInner = () => {
  const { coachName } = useCoachSession();
  const { t, i18n } = useTranslation('coachsidebar');
  const isRtl = i18n.language === 'ar';

  // Desktop collapsed state
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Responsive state for tablet collapse
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize();

    // Set initial collapse state based on window size
    if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      setIsDesktopCollapsed(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Desktop handlers
  const toggleDesktop = () => setIsDesktopCollapsed(!isDesktopCollapsed);

  const handleHamburgerClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      toggleDesktop();
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex min-h-screen bg-gradient-to-r from-black via-[#902bd1] to-[#00d0cb]"
    >
      <CoachSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
      />

      {/* Main Content */}
      <main className="flex-grow flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 py-3 border-b border-gray-700/50 bg-black/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold hidden sm:block">
              {t('sidebar.coachSpace')}
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <div className="w-px h-6 bg-gray-700/50 hidden sm:block" />
            <NotificationBell onNotificationClick={handleNotificationClick} />
            <div className="w-px h-6 bg-gray-700/50 hidden sm:block" />
            <div className="items-center gap-3 hidden sm:flex">
              <div className="text-right">
                <p className="text-xs font-bold text-white leading-none">{coachName}</p>
                <p className="text-[10px] text-[#00d0cb]">
                  {t('sidebar.verifiedCoach')}
                </p>
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

        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <Outlet />
        </div>
      </main>

      {/* Global Detail Drawer for Notifications */}
      <EventDetailDrawer
        detailSession={detailSession}
        setDetailSession={setDetailSession}
        isDetailLoading={isDetailLoading}
        userType="coach"
      />
    </div>
  );
};

const CoachLayout = () => (
  <CoachSessionProvider>
    <CoachLayoutInner />
  </CoachSessionProvider>
);

export default CoachLayout;