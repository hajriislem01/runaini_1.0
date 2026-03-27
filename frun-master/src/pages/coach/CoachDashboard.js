import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiVideo, FiEdit3,
  FiArrowRight, FiMapPin, FiClock
} from 'react-icons/fi';
import { FaFutbol, FaTrophy } from 'react-icons/fa';
import API from '../api';

const CoachDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalGroups: 0,
    upcomingEvents: 0,
    completedEvents: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [coachName, setCoachName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // ✅ Nom du coach depuis coachprofile
        try {
          const profileRes = await API.get('coachprofile/');
          const p = profileRes.data;
          const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.username;
          setCoachName(name);
        } catch {
          const user = JSON.parse(localStorage.getItem('user'));
          setCoachName(user?.username || 'Coach');
        }

        const [playersRes, groupsRes, eventsRes] = await Promise.all([
          API.get('players/'),
          API.get('groups/'),
          API.get('events/')
        ]);

        const players = playersRes.data;
        const groups = groupsRes.data;
        const events = eventsRes.data;

        const now = new Date();

        // ✅ Filtre upcoming correctement
        const upcoming = events
          .filter(e => new Date(e.date) > now && e.status !== 'completed')
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        const completed = events.filter(e => e.status === 'completed');

        setStats({
          totalPlayers: players.length,
          totalGroups: groups.length,
          upcomingEvents: upcoming.length,
          completedEvents: completed.length,
        });

        setUpcomingEvents(upcoming.slice(0, 3));
        setRecentPlayers(players.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch coach dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { title: 'AI Training', desc: 'Create smart session', icon: <FiEdit3 className="text-3xl" />, gradient: 'from-[#902bd1] to-[#4fb0ff]', path: '/coach/training' },
    { title: 'Video Analysis', desc: 'AI-powered breakdown', icon: <FiVideo className="text-3xl" />, gradient: 'from-[#00d0cb] to-[#902bd1]', path: '/coach/matches' },
    { title: 'My Players', desc: 'Manage & track squad', icon: <FiUsers className="text-3xl" />, gradient: 'from-[#902bd1] to-[#4fb0ff]', path: '/coach/players' },
    { title: 'Agenda', desc: 'Schedule & overview', icon: <FiCalendar className="text-3xl" />, gradient: 'from-[#902bd1] to-[#4fb0ff]', path: '/coach/agenda' }
  ];

  // ✅ formatDate corrigé
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = d - now;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const timeStr = d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

    if (diffHours < 24 && diffHours >= 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Tomorrow, ${timeStr}`;
    if (diffDays < 7) return d.toLocaleDateString('en', { weekday: 'long' }) + `, ${timeStr}`;
    return d.toLocaleDateString('en', { day: 'numeric', month: 'short' }) + `, ${timeStr}`;
  };

  // ✅ participants count corrigé
  const getParticipantsCount = (event) => {
    if (event.participants?.length !== undefined) return event.participants.length;
    if (event.participants_count !== undefined) return event.participants_count;
    return 0;
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.div
      className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Coach Hub
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            Welcome back, <span className="text-[#00d0cb] font-semibold">{coachName}</span> • {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
          {[
            { label: 'My Players', value: stats.totalPlayers, color: '#4fb0ff' },
            { label: 'My Groups', value: stats.totalGroups, color: '#00d0cb' },
            { label: 'Upcoming', value: stats.upcomingEvents, color: '#a855f7' },
            { label: 'Completed', value: stats.completedEvents, color: '#22c55e' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 text-center hover:border-gray-500 transition-colors">
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse mx-auto mt-1" />
              ) : (
                <p className="text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] bg-clip-text text-transparent inline-block">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-7 cursor-pointer border border-transparent hover:border-gray-600 transition-all group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{action.desc}</p>
                <div className="flex items-center text-sm font-medium text-gray-300 group-hover:text-white">
                  Open <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ✅ Upcoming Events */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <FiCalendar className="text-[#00d0cb]" />Next Events
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-900/50 rounded-xl animate-pulse" />)}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <motion.div key={event.id || i} whileHover={{ x: 6 }}
                    // ✅ Navigate vers /coach/agenda au lieu de /administration
                    onClick={() => navigate('/coach/agenda')}
                    className="bg-gray-900/70 p-5 rounded-xl border border-gray-700/60 flex justify-between items-center hover:border-[#00d0cb]/60 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${event.type === 'Tournament' ? 'bg-gradient-to-br from-[#902bd1] to-[#00d0cb]' : 'bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff]'}`}>
                        {event.type === 'Tournament' ? <FaTrophy /> : <FaFutbol />}
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${event.type === 'Tournament' ? 'bg-[#902bd1]/30 text-[#d9b8ff]' : 'bg-[#00d0cb]/30 text-[#80a8ff]'}`}>
                          {event.type?.toUpperCase()}
                        </span>
                        <h4 className="font-semibold text-base mt-1">{event.title}</h4>
                        <div className="flex items-center gap-3 text-gray-400 text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <FiClock size={12} />{formatDate(event.date)}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <FiMapPin size={12} />{event.location}
                            </span>
                          )}
                          {/* ✅ participants count corrigé */}
                          <span className="flex items-center gap-1">
                            <FiUsers size={12} />{getParticipantsCount(event)} players
                          </span>
                        </div>
                      </div>
                    </div>
                    <FiArrowRight className="text-gray-400 flex-shrink-0" />
                  </motion.div>
                ))}
                <button onClick={() => navigate('/coach/agenda')}
                  className="w-full text-center text-[#00d0cb] hover:text-[#4fb0ff] text-sm font-medium py-2">
                  View full agenda →
                </button>
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-xl p-8 text-center text-gray-400 border border-gray-700/50">
                <FiCalendar className="mx-auto text-3xl mb-3 opacity-30" />
                <p>No upcoming events</p>
              </div>
            )}
          </motion.section>

          {/* ✅ My Players */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <FiUsers className="text-[#4fb0ff]" />My Players
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-900/50 rounded-xl animate-pulse" />)}
              </div>
            ) : recentPlayers.length > 0 ? (
              <div className="bg-gray-900/70 rounded-xl border border-gray-700/60 overflow-hidden">
                <div className="p-4 bg-gray-800/70 text-sm font-medium grid grid-cols-4 text-gray-300">
                  <div>Name</div>
                  <div>Position</div>
                  <div>Group</div>
                  <div>Status</div>
                </div>
                {recentPlayers.map((player, i) => (
                  <div key={player.id || i}
                    className="p-4 grid grid-cols-4 border-t border-gray-800 text-sm hover:bg-gray-800/40 transition-colors">
                    <div className="font-medium text-white truncate">{player.full_name}</div>
                    <div className="text-gray-400">{player.position || '—'}</div>
                    <div className="text-gray-400 truncate">
                      {/* ✅ group_name depuis le serializer */}
                      {player.group?.name || '—'}
                    </div>
                    <div className={
                      player.status === 'Active' ? 'text-green-400' :
                      player.status === 'Injured' ? 'text-red-400' :
                      'text-yellow-400'
                    }>
                      {player.status || '—'}
                    </div>
                  </div>
                ))}
                <div className="p-3 border-t border-gray-800 text-center">
                  <button onClick={() => navigate('/coach/players')}
                    className="text-[#00d0cb] hover:text-[#4fb0ff] text-sm font-medium flex items-center gap-1 mx-auto">
                    View all {stats.totalPlayers} players <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-xl p-8 text-center text-gray-400 border border-gray-700/50">
                <FiUsers className="mx-auto text-3xl mb-3 opacity-30" />
                <p>No players assigned yet</p>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachDashboard;