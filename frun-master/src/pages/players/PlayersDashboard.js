import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaDumbbell, 
  FaRunning, 
  FaChevronRight, 
  FaChartLine, 
  FaMedal, 
  FaCalendarAlt,
  FaVideo,
  FaComments,
  FaHeartbeat,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaUserTie,
  FaStar
} from 'react-icons/fa';
import { 
  FiTarget, 
  FiTrendingUp, 
  FiActivity, 
  FiCheckCircle,
  FiPlay,
  FiMessageSquare,
  FiClock,
  FiMapPin
} from 'react-icons/fi';

const PlayersDashboard = () => {
  // Performance data
  const performanceData = [
    { 
      metric: 'Sprint Speed', 
      value: '8.7 m/s', 
      change: '+2.3%', 
      icon: <FaRunning />,
      color: 'from-[#902bd1] to-[#4fb0ff]',
      bgColor: '#4fb0ff'
    },
    { 
      metric: 'Vertical Jump', 
      value: '68cm', 
      change: '+5cm', 
      icon: <FaArrowUp />,
      color: 'from-[#10B981] to-[#059669]',
      bgColor: '#10B981'
    },
    { 
      metric: 'Pass Accuracy', 
      value: '89%', 
      change: '+4%', 
      icon: <FaChartLine />,
      color: 'from-[#902bd1] to-[#7c3aed]',
      bgColor: '#902bd1'
    },
    { 
      metric: 'Recovery Rate', 
      value: '92%', 
      change: '+8%', 
      icon: <FaHeartbeat />,
      color: 'from-[#00d0cb] to-[#4fb0ff]',
      bgColor: '#00d0cb'
    }
  ];
  
  // Training sessions
  const trainingSessions = [
    { 
      id: 1, 
      title: 'Strength & Conditioning', 
      type: 'Strength Training', 
      duration: '75 mins', 
      status: 'completed',
      progress: 100,
      icon: <FaDumbbell />,
      color: 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]',
      statusColor: 'text-green-400'
    },
    { 
      id: 2, 
      title: 'Agility & Footwork', 
      type: 'Agility Drills', 
      duration: '60 mins', 
      status: 'scheduled',
      progress: 0,
      icon: <FaRunning />,
      color: 'bg-gradient-to-r from-[#00d0cb] to-[#902bd1]',
      statusColor: 'text-blue-400'
    },
    { 
      id: 3, 
      title: 'Tactical Session', 
      type: 'Team Strategy', 
      duration: '90 mins', 
      status: 'in-progress',
      progress: 45,
      icon: <FiTarget />,
      color: 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]',
      statusColor: 'text-amber-400'
    }
  ];
  
  // Upcoming events
  const upcomingEvents = [
    { 
      title: 'Team Practice', 
      date: 'Tomorrow, 10:00 AM', 
      location: 'Main Field',
      icon: <FaRunning />,
      color: 'border-l-[#4fb0ff]'
    },
    { 
      title: 'Physio Appointment', 
      date: 'Jul 18, 2:30 PM', 
      location: 'Medical Center',
      icon: <FaHeartbeat />,
      color: 'border-l-[#10B981]'
    },
    { 
      title: 'Video Analysis Session', 
      date: 'Jul 19, 4:00 PM', 
      location: 'Meeting Room B',
      icon: <FaVideo />,
      color: 'border-l-[#902bd1]'
    }
  ];
  
  // Latest achievements
  const achievements = [
    { 
      title: 'Player of the Match', 
      date: 'Jul 10, 2024', 
      description: 'Vs Tigers',
      icon: <FaMedal />,
      color: 'bg-gradient-to-r from-yellow-400 to-[#D97706]'
    },
    { 
      title: 'Fitness Milestone', 
      date: 'Jul 8, 2024', 
      description: 'Improved VO2 max by 12%',
      icon: <FiTrendingUp />,
      color: 'bg-gradient-to-r from-[#10B981] to-[#059669]'
    },
    { 
      title: 'Skill Mastery', 
      date: 'Jul 5, 2024', 
      description: '90% passing accuracy',
      icon: <FiTarget />,
      color: 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]'
    }
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
      className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Player Dashboard
              </h1>
              <p className="text-gray-300 mt-2 text-base sm:text-lg">
                Welcome back, Alex Morgan! Here's your performance overview and training plan.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-900/65 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold">
                  #13
                </div>
                <div>
                  <p className="font-semibold text-white">Forward</p>
                  <p className="text-xs text-gray-400">Last login: Today, 09:42 AM</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] border border-gray-700/50 rounded-xl font-medium text-white transition-all shadow-lg"
              >
                View Calendar
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <motion.div 
              variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    <FiActivity className="text-[#4fb0ff]" />
                    Performance Metrics
                  </h2>
                  <span className="px-3 py-1 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white text-xs font-medium rounded-full">
                    Updated today
                  </span>
                </div>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {performanceData.map((metric, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -4 }}
                      variants={itemVariants}
                      className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-gray-400 text-sm">{metric.metric}</div>
                          <div className="text-2xl font-bold mt-1 text-white">{metric.value}</div>
                        </div>
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                          <div className="text-white">{metric.icon}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-400 text-sm font-medium">{metric.change}</span>
                        <span className="text-gray-400 text-sm ml-2">from last week</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Assigned Training */}
            <motion.div 
              variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                      <FiTarget className="text-[#902bd1]" />
                      Training Program
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Your personalized training plan for this week
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                    View All Sessions
                  </button>
                </div>
              </div>
              
              <div className="p-5 md:p-6 space-y-4">
                {trainingSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    whileHover={{ x: 4 }}
                    className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${session.color} text-white`}>
                        {session.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <h3 className="font-bold text-white text-lg">{session.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{session.type}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm flex items-center">
                              <FiClock className="mr-1" /> {session.duration}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${session.statusColor} bg-opacity-20`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="font-medium text-white">{session.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full ${
                                session.progress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                                session.progress > 50 ? 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]' : 
                                'bg-gradient-to-r from-yellow-400 to-[#D97706]'
                              }`} 
                              style={{ width: `${session.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      {session.status === 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
                        >
                          <FiCheckCircle />
                          Completed
                        </motion.button>
                      )}
                      {session.status === 'scheduled' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all"
                        >
                          <FaCalendarAlt />
                          Schedule
                        </motion.button>
                      )}
                      {session.status === 'in-progress' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] hover:from-[#4fb0ff] hover:to-[#00d0cb] text-white rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all"
                        >
                          <FiPlay />
                          Continue
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Performance Trends */}
            <motion.div 
              variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FiTrendingUp className="text-[#10B981]" />
                  Performance Trends
                </h2>
                <p className="text-gray-400 text-sm mt-1">Your progress over the last 30 days</p>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="relative h-64">
                  {/* Custom SVG Chart */}
                  <svg viewBox="0 0 500 250" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="40" y1="50" x2="460" y2="50" stroke="#1F2937" strokeWidth="1" />
                    <line x1="40" y1="100" x2="460" y2="100" stroke="#1F2937" strokeWidth="1" />
                    <line x1="40" y1="150" x2="460" y2="150" stroke="#1F2937" strokeWidth="1" />
                    <line x1="40" y1="200" x2="460" y2="200" stroke="#1F2937" strokeWidth="1" />
                    
                    {/* Performance line with gradient fill */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00d0cb" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#4fb0ff" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <polygon 
                      fill="url(#gradient)" 
                      points="40,200 100,150 160,180 220,120 280,170 340,140 400,190 460,160 460,250 40,250"
                    />
                    <polyline 
                      fill="none" 
                      stroke="#00d0cb" 
                      strokeWidth="3" 
                      points="40,200 100,150 160,180 220,120 280,170 340,140 400,190 460,160"
                    />
                    
                    {/* Data points */}
                    {[
                      {x: 40, y: 200},
                      {x: 100, y: 150},
                      {x: 160, y: 180},
                      {x: 220, y: 120},
                      {x: 280, y: 170},
                      {x: 340, y: 140},
                      {x: 400, y: 190},
                      {x: 460, y: 160}
                    ].map((point, i) => (
                      <circle 
                        key={i}
                        cx={point.x} 
                        cy={point.y} 
                        r="5" 
                        fill="#00d0cb"
                        stroke="#4fb0ff"
                        strokeWidth="2"
                      />
                    ))}
                    
                    {/* X-axis labels */}
                    <text x="40" y="240" textAnchor="middle" fill="#6B7280" fontSize="12">1</text>
                    <text x="100" y="240" textAnchor="middle" fill="#6B7280" fontSize="12">5</text>
                    <text x="160" y="240" textAnchor="middle" fill="#6B7280" fontSize="12">10</text>
                    <text x="220" y="240" textAnchor="middle" fill="#6B7280" fontSize="12">15</text>
                    <text x="280" y="240" textAnchor="middle" fill="#6B7280" fontSize="12">20</text>
                    <text x="340" y="240" textAnchor="middle" fill="#6B7280" fontSize="12">25</text>
                    <text x="400" y="240" textAnchor="middle" fill="#6B7280" fontSize="12">30</text>
                    <text x="460" y="240" textAnchor="middle" fill="#6B7280" fontSize="12">Today</text>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <motion.div 
              variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    <FaCalendarAlt className="text-[#902bd1]" />
                    Upcoming Events
                  </h2>
                  <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                    View Calendar
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-1">Your schedule for the next 7 days</p>
              </div>
              
              <div className="p-5 md:p-6 space-y-4">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className={`border-l-4 ${event.color} bg-gray-800/30 rounded-r-xl p-4 border border-l-0 border-gray-700/50 hover:border-gray-600 transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-white p-2 rounded-lg bg-gray-700/50">
                        {event.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{event.title}</div>
                        <div className="text-gray-400 text-sm mt-2 flex items-center">
                          <FiClock className="mr-2" />
                          {event.date}
                        </div>
                        <div className="text-gray-400 text-sm mt-1 flex items-center">
                          <FiMapPin className="mr-2" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all mt-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Event
                </motion.button>
              </div>
            </motion.div>

            {/* Video Analysis */}
            <motion.div 
              variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    <FaVideo className="text-[#00d0cb]" />
                    Video Analysis
                  </h2>
                  <span className="px-3 py-1 bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white text-xs font-medium rounded-full">
                    New
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Review your performance from the last game</p>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <div className="aspect-video bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-4xl font-bold mb-2">VS Tigers</div>
                      <div className="text-gray-300">Match Analysis • Jul 10, 2024</div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40"
                  >
                    <div className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] rounded-full p-4 shadow-2xl">
                      <FiPlay className="text-2xl text-white" />
                    </div>
                  </motion.button>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-bold text-white text-lg">Match vs Tigers - Jul 10, 2024</h3>
                  <p className="text-gray-400 mt-2">Defensive positioning and transition analysis with AI insights</p>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <FaVideo /> Watch Analysis
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2.5 px-4 bg-gray-800/65 border border-gray-700/50 rounded-xl font-medium text-white hover:bg-gray-700/50 transition-colors"
                  >
                    <FaComments />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Latest Achievements */}
            <motion.div 
              variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FaTrophy className="text-yellow-400" />
                  Recent Achievements
                </h2>
                <p className="text-gray-400 text-sm mt-1">Your accomplishments and milestones</p>
              </div>
              
              <div className="p-5 md:p-6 space-y-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${achievement.color} text-white`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{achievement.title}</div>
                        <div className="text-gray-400 text-sm mt-1">{achievement.date}</div>
                        <p className="text-gray-300 text-sm mt-2">{achievement.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all mt-2"
                >
                  View All Achievements
                  <FaChevronRight className="text-sm" />
                </motion.button>
              </div>
            </motion.div>

            {/* Coach Feedback */}
            <motion.div 
              variants={itemVariants}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FiMessageSquare className="text-[#10B981]" />
                  Coach Feedback
                </h2>
                <p className="text-gray-400 text-sm mt-1">Latest comments from your coach</p>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold">
                      ST
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-white">Coach Sarah Thompson</div>
                        <span className="text-gray-400 text-xs">2 days ago</span>
                      </div>
                      <div className="text-gray-300 mt-3 leading-relaxed">
                        "Great effort in the last match, Alex. Your agility drills are showing excellent results. Focus on improving your passing accuracy in tight spaces during the next training session."
                      </div>
                      
                      <div className="mt-4 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                          Reply
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                          View Full Feedback
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayersDashboard;