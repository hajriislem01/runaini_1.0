import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiClock, FiCalendar, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../pages/api';

const NotificationBell = ({ onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const isInitialMount = useRef(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      fetchNotifications();
      isInitialMount.current = false;
    }
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    try {
      await API.post(`notifications/${id}/mark-read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.post('notifications/mark-all-read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleItemClick = (n) => {
    markRead(n.id);
    setShowDropdown(false);
    if (onNotificationClick) {
      onNotificationClick(n);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2.5 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 text-gray-300 hover:text-white hover:border-[#00d0cb]/50 hover:shadow-[0_0_15px_rgba(0,208,203,0.3)] transition-all shadow-lg"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-colors ${unreadCount > 0 ? 'text-[#00d0cb]' : ''}`}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-[#0c132a] shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10">
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0c132a] backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,208,203,0.1)] z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <span className="px-2 py-0.5 rounded-md bg-[#00d0cb]/20 text-[#00d0cb] text-[10px] font-bold">{unreadCount} New</span>}
              </h3>
              {notifications.length > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-gray-400 hover:text-[#00d0cb] uppercase tracking-wider transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="flex flex-col gap-1 p-2">
                  {notifications.map((n) => {
                    const isSession = n.event_type === 'session';
                    const catColor = isSession ? '#22c55e' : '#4fb0ff'; // Match event category
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleItemClick(n)}
                        className={`relative p-3 rounded-xl cursor-pointer transition-all hover:bg-white/10 flex gap-4 overflow-hidden ${!n.is_read ? 'bg-white/5 shadow-sm' : 'bg-transparent'}`}
                      >
                        {/* Vertical Colored Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: catColor }} />
                        
                        <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 flex items-center justify-center bg-black/30 border border-white/5`}>
                          {isSession ? <FiCheckCircle size={16} color={catColor} /> : <FiCalendar size={16} color={catColor} />}
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-bold truncate ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <div className="w-2 h-2 rounded-full bg-[#00d0cb] flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(0,208,203,0.8)]" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                              <FiClock size={10} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-[#00d0cb] font-bold uppercase tracking-wider hover:text-white transition-colors">
                              View Details
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                  <div className="text-4xl mb-3">🏆</div>
                  <h4 className="text-white font-extrabold text-base tracking-wide">All caught up!</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">You have no new alerts at the moment.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/10 bg-black/40 text-center">
                <p className="text-[10px] text-gray-500 font-medium">Stay updated with your academy schedule</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
