import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiVideo, FiEdit3, FiTrendingUp,
  FiAlertCircle, FiClock, FiActivity, FiArrowRight
} from 'react-icons/fi';
import { FaFutbol, FaTrophy } from 'react-icons/fa';

const CoachDashboard = () => {
  const navigate = useNavigate();

  // Mock data – replace with real API/context later
  const [stats, setStats] = useState({
    squadSize: 26,
    attendanceToday: '94%',
    performanceTrend: '+9%',
    injuryRisk: 'Low',
    unreadFeedback: 5,
    upcomingEvents: 7,
    totalPlayers: 0,
    upcomingTrainings: 0,
    upcomingMatches: 0
  });

  useEffect(() => {
    // In real app → fetch from your backend / context
    // Here we simulate some dynamic feel
    setStats(prev => ({
      ...prev,
      totalPlayers: 26,
      upcomingTrainings: 4,
      upcomingMatches: 3
    }));
  }, []);

  const quickActions = [
    {
      title: 'AI Training',
      desc: 'Create smart session',
      icon: <FiEdit3 className="text-3xl" />,
      color: '#00d0cb',
      gradient: 'from-[#902bd1] to-[#4fb0ff]',
      path: '/coach/training'
    },
    {
      title: 'Video Analysis',
      desc: 'AI-powered breakdown',
      icon: <FiVideo className="text-3xl" />,
      color: '#902bd1',
      gradient: 'from-[#00d0cb] to-[#902bd1]',
      path: '/coach/video' // you may add this route later
    },
    {
      title: 'My Players',
      desc: 'Manage & track squad',
      icon: <FiUsers className="text-3xl" />,
      color: '#4fb0ff',
      gradient: 'from-[#902bd1] to-[#4fb0ff]',
      path: '/coach/players'
    },
    {
      title: 'Agenda',
      desc: 'Schedule & overview',
      icon: <FiCalendar className="text-3xl" />,
      color: '#902bd1',
      gradient: 'from-[#902bd1] to-[#4fb0ff]',
      path: '/coach/agenda'
    }
  ];

  const upcomingEvents = [
    { type: 'training', title: 'AI Tactical + Finishing', date: 'Today, 18:00', ai: true, players: 18 },
    { type: 'match', title: 'vs FC Academy B', date: 'Tomorrow, 19:30', players: 16 },
    { type: 'training', title: 'Set Pieces & Pressing', date: 'Sat, 10:00', ai: true, players: 14 }
  ];

  const quickInsights = [
    'Team expected +14% performance next 4 weeks',
    '3 players showing early fatigue signs',
    'New AI tags available: 21 key moments from last game'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white p-6 md:p-8 lg:p-10"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      // initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Runaini Coach Hub
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            Welcome back • Your team at a glance – {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mb-12"
        >
          {[
            { label: 'Squad', value: stats.squadSize, color: '#4fb0ff' },
            { label: 'Attendance', value: stats.attendanceToday, color: '#22c55e' },
            { label: 'Trend', value: stats.performanceTrend, color: '#3b82f6' },
            { label: 'Injury Risk', value: stats.injuryRisk, color: '#eab308' },
            { label: 'Feedback', value: stats.unreadFeedback, color: '#f97316' },
            { label: 'Upcoming', value: stats.upcomingEvents, color: '#a855f7' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 text-center hover:border-gray-500 transition-colors"
            >
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions – most used features */}
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] bg-clip-text text-transparent inline-block">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-7 cursor-pointer border border-transparent hover:border-gray-600 transition-all group"
                style={{
                  background: `linear-gradient(135deg, rgba(33,84,124,0.15), rgba(0,32,200,0.08))`
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(to bottom right, ${action.gradient})` }}
                >
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
          {/* Upcoming Events */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <FiCalendar className="text-[#00d0cb]" /> Next Events
            </h2>
            <div className="space-y-4">
              {upcomingEvents.map((event, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 6 }}
                  className="bg-gray-900/70 p-6 rounded-xl border border-gray-700/60 flex justify-between items-center hover:border-[#00d0cb]/60 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl ${
                      event.type === 'training'
                        ? 'bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff]'
                        : 'bg-gradient-to-br from-[#902bd1] to-[#00d0cb]'
                    }`}>
                      {event.type === 'training' ? <FaFutbol /> : <FaTrophy />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          event.type === 'training' ? 'bg-[#00d0cb]/30 text-[#80a8ff]' : 'bg-[#902bd1]/30 text-[#d9b8ff]'
                        }`}>
                          {event.type.toUpperCase()}
                        </span>
                        {event.ai && (
                          <span className="text-xs px-3 py-1 rounded-full bg-purple-600/40 text-purple-200">
                            AI
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      <p className="text-gray-400">{event.date} • {event.players} players</p>
                    </div>
                  </div>
                  <FiArrowRight className="text-gray-400" />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* AI Insights + Quick Players Snapshot */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <FiAlertCircle className="text-yellow-400" /> AI Insights
            </h2>
            <div className="space-y-4 mb-8">
              {quickInsights.map((insight, i) => (
                <div key={i} className="bg-gray-900/65 p-5 rounded-xl border border-yellow-900/30">
                  <p className="text-gray-100">{insight}</p>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiUsers className="text-[#4fb0ff]" /> Top Players Form
            </h3>
            <div className="bg-gray-900/70 rounded-xl border border-gray-700/60 overflow-hidden">
              <div className="p-4 bg-gray-800/70 text-sm font-medium grid grid-cols-5">
                <div>Name</div>
                <div>Pos</div>
                <div>Last</div>
                <div>Form</div>
                <div>Note</div>
              </div>
              {[
                { name: 'John D.', pos: 'FW', last: 'Today', form: '↑↑', note: 'Scoring' },
                { name: 'Alex R.', pos: 'CM', last: 'Yest.', form: '→', note: 'Stable' },
                { name: 'Maria S.', pos: 'CB', last: '2d', form: '↓', note: 'Duels' }
              ].map((p, i) => (
                <div key={i} className="p-4 grid grid-cols-5 border-t border-gray-800 text-sm hover:bg-gray-800/40 transition-colors">
                  <div className="font-medium">{p.name}</div>
                  <div>{p.pos}</div>
                  <div className="text-gray-400">{p.last}</div>
                  <div className={p.form.includes('↑') ? 'text-green-400' : p.form.includes('↓') ? 'text-red-400' : 'text-yellow-400'}>
                    {p.form}
                  </div>
                  <div className="text-gray-300">{p.note}</div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachDashboard;
