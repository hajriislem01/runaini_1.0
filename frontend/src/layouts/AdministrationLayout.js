import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import AdministrationSidebar from '../components/AdministrationSidebar';
import NotificationBell from '../components/NotificationBell';
import LanguageSwitcher from '../components/LanguageSwitcher';
import EventDetailDrawer from '../components/common/EventDetailDrawer';
import API from '../pages/api';

const AdministrationLayout = () => {
  const [detailSession, setDetailSession] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-black via-[#902bd1] to-[#00d0cb]">
      <AdministrationSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 py-3 border-b border-gray-700/50 bg-black/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold hidden sm:block">Administration Panel</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <div className="w-px h-6 bg-gray-700/50 hidden sm:block" />
            <NotificationBell onNotificationClick={handleNotificationClick} />
            <div className="w-px h-6 bg-gray-700/50 hidden sm:block" />
            <div className="items-center gap-3 hidden sm:flex">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">Admin Space</p>
                <p className="text-[10px] text-[#00d0cb]">Academy Management</p>
              </div>
            </div>

            {/* MOBILE & TABLET HAMBURGER BUTTON - In Flex Flow */}
            <motion.button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
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
      </div>

      {/* Global Detail Drawer for Notifications */}
      <EventDetailDrawer
        detailSession={detailSession}
        setDetailSession={setDetailSession}
        isDetailLoading={isDetailLoading}
        userType="admin"
      />
    </div>
  );
};

export default AdministrationLayout;
