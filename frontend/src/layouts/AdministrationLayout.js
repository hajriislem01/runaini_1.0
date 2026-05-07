import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdministrationSidebar from '../components/AdministrationSidebar';
import NotificationBell from '../components/NotificationBell';
import EventDetailDrawer from '../components/common/EventDetailDrawer';
import API from '../pages/api';

const AdministrationLayout = () => {
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

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-black via-[#902bd1] to-[#00d0cb]">
      <AdministrationSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-700/50 bg-black/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold hidden sm:block">Administration Panel</h2>
          </div>
          <div className="flex items-center gap-4 pr-16 md:pr-0">
            <NotificationBell onNotificationClick={handleNotificationClick} />
            <div className="w-px h-6 bg-gray-700/50 mx-1 hidden sm:block" />
            <div className="items-center gap-3 hidden sm:flex">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">Admin Space</p>
                  <p className="text-[10px] text-[#00d0cb]">Academy Management</p>
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
        userType="admin"
      />
    </div>
  );
};

export default AdministrationLayout;
