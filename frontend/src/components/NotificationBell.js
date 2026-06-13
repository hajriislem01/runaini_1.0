import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiClock, FiCalendar, FiCheckCircle, FiInfo, FiChevronDown, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import API from '../pages/api';

/* ─── Helper: always render a number with Western Arabic (latn) digits ───── */
const latinNum = (value) =>
  String(value).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

const NotificationBell = ({ onNotificationClick }) => {
  const { t, i18n } = useTranslation('notifications');
  const isRtl = i18n.language === 'ar';

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
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

  const clearAll = async () => {
    try {
      await API.post('notifications/clear-all/');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
      // Local state fallback in case of connection issue
      setNotifications([]);
    }
  };

  const handleItemClick = (n) => {
    markRead(n.id);
    setShowDropdown(false);
    if (onNotificationClick) {
      onNotificationClick(n);
    }
  };

  // Filter based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  // Parse player and group names dynamically from English notification payload if missing
  const getDynamicParams = (n) => {
    let player = n.playerName || n.player_name || '';
    let group = n.groupName || n.group_name || '';
    const msg = n.message || '';

    if (!player) {
      // E.g., "New payment recorded for player John Doe" -> "John Doe"
      const playerMatch = msg.match(/player\s+([^.]+)/i) || msg.match(/Coach\s+([^created\s]+)/i);
      if (playerMatch) player = playerMatch[1].trim();
    }
    if (!group) {
      // E.g., "scheduled for Subgroup A" or "assigned to 'Training A'"
      const groupMatch = msg.match(/scheduled\s+for\s+([^.]+)/i) || msg.match(/assigned\s+to\s+'([^']+)'/i);
      if (groupMatch) group = groupMatch[1].trim();
    }
    return { player, group };
  };

  // Map the raw notification types dynamically
  const getNotificationType = (n) => {
    const type = n.type || n.event_type || '';
    const titleLower = (n.title || '').toLowerCase();
    const msgLower = (n.message || '').toLowerCase();

    if (type === 'payment' || titleLower.includes('payment')) return 'payment';
    if (type === 'subscription' || titleLower.includes('subscription')) return 'subscription';
    if (type === 'system' || titleLower.includes('system')) return 'system';
    if (type === 'settings' || titleLower.includes('settings')) return 'settings';
    if (titleLower.includes('assigned') || titleLower.includes('coach')) return 'coach_assigned';
    if (titleLower.includes('training') || msgLower.includes('training')) return 'training';
    if (type === 'session') return 'session';
    return 'event';
  };

  // Get style configs (color + icon)
  const getNotificationStyle = (n) => {
    const nType = getNotificationType(n);
    switch (nType) {
      case 'payment':
        return { color: '#22c55e', icon: <FiCheckCircle size={16} className="text-[#22c55e]" /> };
      case 'subscription':
        return { color: '#00d0cb', icon: <FiInfo size={16} className="text-[#00d0cb]" /> };
      case 'system':
      case 'settings':
        return { color: '#ef4444', icon: <FiInfo size={16} className="text-[#ef4444]" /> };
      case 'coach_assigned':
        return { color: '#eab308', icon: <FiInfo size={16} className="text-[#eab308]" /> };
      case 'training':
      case 'session':
      default:
        return { color: '#902bd1', icon: <FiCalendar size={16} className="text-[#902bd1]" /> };
    }
  };

  // Helper for formatting dynamic relative times
  const formatTimeAgo = (createdAt) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return t('time.justNow');
    }
    if (diffMins < 60) {
      return t('time.minutesAgo', { count: diffMins });
    }
    if (diffHours < 24) {
      return t('time.hoursAgo', { count: diffHours });
    }
    return t('time.daysAgo', { count: diffDays });
  };

  // Helper for standard clock formatting
  const formatClockTime = (dateStr) => {
    const d = new Date(dateStr);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
          <span 
            className={`absolute -top-1 ${isRtl ? '-left-1' : '-right-1'} w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-[#0c132a] shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10`} 
            dir="ltr"
          >
            {latinNum(unreadCount > 9 ? '9+' : unreadCount)}
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
            className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-3 w-80 sm:w-96 bg-[#0c132a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(144,43,209,0.15),0_0_30px_rgba(0,208,203,0.15)] z-[100] overflow-hidden transition-all duration-300 hover:border-[#00d0cb]/30`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className={`p-4 border-b border-white/10 flex items-center justify-between bg-black/20 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h3 className={`text-white font-bold text-sm flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {t('title')}
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-[#00d0cb]/20 text-[#00d0cb] text-[10px] font-bold" dir="ltr">
                    {latinNum(t('newCount', { count: unreadCount }))}
                  </span>
                )}
              </h3>
              {notifications.length > 0 && (
                <div className={`flex items-center gap-3.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#00d0cb] uppercase tracking-wider transition-colors"
                  >
                    {t('actions.markAllRead')}
                  </button>
                  <span className="text-white/20 text-xs">|</span>
                  <button 
                    onClick={clearAll}
                    className="text-[10px] font-bold text-red-400/80 hover:text-red-400 uppercase tracking-wider transition-colors"
                  >
                    {t('actions.clearAll')}
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className={`flex border-b border-white/5 bg-black/10 px-4 py-1.5 gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setActiveTab('all')}
                className={`text-xs font-bold pb-1.5 pt-1 transition-all relative ${
                  activeTab === 'all' ? 'text-[#00d0cb]' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('tabs.all')}
                {activeTab === 'all' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d0cb]"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`text-xs font-bold pb-1.5 pt-1 transition-all relative ${
                  activeTab === 'unread' ? 'text-[#00d0cb]' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('tabs.unread')}
                {activeTab === 'unread' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d0cb]"
                  />
                )}
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredNotifications.length > 0 ? (
                <div className="flex flex-col gap-1.5 p-2">
                  {filteredNotifications.map((n) => {
                    const style = getNotificationStyle(n);
                    const nType = getNotificationType(n);
                    const params = getDynamicParams(n);
                    const catColor = style.color;

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleItemClick(n)}
                        className={`relative p-3.5 rounded-xl cursor-pointer transition-all hover:bg-white/10 flex gap-4 overflow-hidden ${!n.is_read ? 'bg-white/5 shadow-sm' : 'bg-transparent'} ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Vertical Colored Bar */}
                        <div 
                          className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-0 bottom-0 w-1`} 
                          style={{ backgroundColor: catColor }} 
                        />
                        
                        <div className="mt-0.5 p-2 rounded-xl flex-shrink-0 flex items-center justify-center bg-black/30 border border-white/5">
                          {style.icon}
                        </div>
                        
                        <div className={`flex-1 min-w-0 ${isRtl ? 'pl-4 text-right' : 'pr-4 text-left'}`}>
                          <div className={`flex items-start justify-between gap-2 mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <p className={`text-sm font-bold truncate ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>
                              {t('types.' + nType + '_title', { defaultValue: n.title })}
                            </p>
                            {!n.is_read && (
                              <div className="w-2 h-2 rounded-full bg-[#00d0cb] flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(0,208,203,0.8)]" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {t('types.' + nType, { 
                              player: params.player, 
                              group: params.group, 
                              defaultValue: n.message 
                            })}
                          </p>
                          <div className={`flex items-center gap-3 mt-3 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium" dir="ltr">
                              <FiClock size={10} /> {latinNum(formatClockTime(n.created_at))}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {latinNum(formatTimeAgo(n.created_at))}
                            </span>
                            <span className="text-[10px] text-[#00d0cb] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                              {t('types.' + nType + '_title', { defaultValue: n.event_type || 'Alert' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="text-4xl mb-4">🏆</div>
                  <h4 className="text-white font-extrabold text-base tracking-wide">{t('empty')}</h4>
                  <p className="text-xs text-gray-500 mt-1.5 max-w-[240px] leading-relaxed">
                    {t('emptyDescription', 'You have no new alerts at the moment.')}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-white/10 bg-black/40 text-center flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  if (onNotificationClick) {
                    onNotificationClick({ action: 'view_all' });
                  }
                }}
                className="text-xs font-black text-[#00d0cb] hover:text-[#4fb0ff] transition-colors tracking-wide uppercase"
              >
                {t('actions.viewAll')}
              </button>
              <p className="text-[10px] text-gray-500 font-medium">{t('footerSchedule')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
