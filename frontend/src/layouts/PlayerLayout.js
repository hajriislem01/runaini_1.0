import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePlayer } from '../context/PlayerContext';
import EventDetailDrawer from '../components/common/EventDetailDrawer';
import PlayerSidebar from '../components/PlayerSidebar';
import PlayerHeader from '../components/PlayerHeader';
import API from '../pages/api';

const PlayerLayout = () => {
  const { player } = usePlayer();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // Desktop collapsed state
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsDesktopCollapsed(true);
      }
    };
    handleResize();

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

  const handleHamburgerClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsDesktopCollapsed(!isDesktopCollapsed);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex min-h-screen bg-gradient-to-r from-black via-[#902bd1] to-[#00d0cb]"
    >
      <PlayerSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
      />

      {/* Main Content */}
      <main className="flex-grow flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <PlayerHeader
          isMobileOpen={isMobileOpen}
          handleHamburgerClick={handleHamburgerClick}
          handleNotificationClick={handleNotificationClick}
        />

        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <Outlet />
        </div>
      </main>

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
