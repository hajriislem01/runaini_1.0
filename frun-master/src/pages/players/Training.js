import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaDumbbell, 
  FaRunning, 
  FaCalendarAlt, 
  FaChartLine, 
  FaMedal, 
  FaClock, 
  FaFire, 
  FaHeartbeat, 
  FaArrowUp, 
  FaChevronRight,
  FaPlay,
  FaLocationArrow
} from 'react-icons/fa';
import { 
  FiTarget, 
  FiTrendingUp, 
  FiActivity, 
  FiCheckCircle,
  FiStar,
  FiMapPin,
  FiCalendar,
  FiBarChart2
} from 'react-icons/fi';

const Training = () => {
  const trainingHistory = [
    {
      id: 1,
      date: '2024-07-20',
      type: 'Tactical Drills',
      focus: 'Offensive Strategies',
      duration: '90 minutes',
      intensity: 'High',
      calories: 580,
      coach: 'Coach Thompson',
      rating: 8.7,
      progress: '+12%',
      color: 'from-[#902bd1] to-[#4fb0ff]'
    },
    {
      id: 2,
      date: '2024-07-15',
      type: 'Skill Development',
      focus: 'Dribbling and Passing',
      duration: '60 minutes',
      intensity: 'Medium',
      calories: 420,
      coach: 'Coach Rodriguez',
      rating: 7.9,
      progress: '+8%',
      color: 'from-[#902bd1] to-[#7c3aed]'
    },
    {
      id: 3,
      date: '2024-07-10',
      type: 'Fitness Training',
      focus: 'Endurance and Speed',
      duration: '75 minutes',
      intensity: 'High',
      calories: 650,
      coach: 'Coach Davis',
      rating: 9.2,
      progress: '+15%',
      color: 'from-[#00d0cb] to-[#4fb0ff]'
    },
    {
      id: 4,
      date: '2024-07-05',
      type: 'Strength & Conditioning',
      focus: 'Upper Body Strength',
      duration: '85 minutes',
      intensity: 'High',
      calories: 720,
      coach: 'Coach Wilson',
      rating: 8.4,
      progress: '+9%',
      color: 'from-[#902bd1] to-[#4fb0ff]'
    },
    {
      id: 5,
      date: '2024-07-01',
      type: 'Agility Training',
      focus: 'Footwork and Coordination',
      duration: '55 minutes',
      intensity: 'Medium',
      calories: 380,
      coach: 'Coach Martinez',
      rating: 8.1,
      progress: '+11%',
      color: 'from-[#902bd1] to-[#7c3aed]'
    }
  ];

  const upcomingSessions = [
    {
      date: '2024-07-25',
      time: '10:00 AM',
      type: 'Tactical Analysis',
      focus: 'Defensive Positioning',
      duration: '75 mins',
      location: 'Training Field A',
      color: 'border-l-[#4fb0ff]'
    },
    {
      date: '2024-07-27',
      time: '3:00 PM',
      type: 'Strength Training',
      focus: 'Lower Body Power',
      duration: '90 mins',
      location: 'Gymnasium',
      color: 'border-l-[#00d0cb]'
    },
    {
      date: '2024-07-29',
      time: '9:30 AM',
      type: 'Speed Drills',
      focus: 'Acceleration',
      duration: '60 mins',
      location: 'Track Field',
      color: 'border-l-[#902bd1]'
    }
  ];

  const trainingMetrics = [
    { 
      name: 'Sessions Completed', 
      value: 18, 
      target: 25, 
      icon: <FaDumbbell />,
      color: 'from-[#902bd1] to-[#4fb0ff]'
    },
    { 
      name: 'Avg. Duration', 
      value: '72 mins', 
      icon: <FaClock />,
      color: 'from-[#00d0cb] to-[#4fb0ff]'
    },
    { 
      name: 'Calories Burned', 
      value: '12,450', 
      icon: <FaFire />,
      color: 'from-[#902bd1] to-[#7c3aed]'
    },
    { 
      name: 'Avg. Rating', 
      value: 8.5, 
      target: 9.0, 
      icon: <FaChartLine />,
      color: 'from-[#10B981] to-[#059669]'
    }
  ];

  const trainingProgress = [
    { skill: 'Speed', progress: 85, improvement: '+8%', color: 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]' },
    { skill: 'Agility', progress: 78, improvement: '+12%', color: 'bg-gradient-to-r from-[#902bd1] to-[#7c3aed]' },
    { skill: 'Strength', progress: 82, improvement: '+6%', color: 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]' },
    { skill: 'Endurance', progress: 88, improvement: '+10%', color: 'bg-gradient-to-r from-[#10B981] to-[#059669]' },
    { skill: 'Accuracy', progress: 76, improvement: '+9%', color: 'bg-gradient-to-r from-yellow-400 to-[#D97706]' }
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
                Training Program
              </h1>
              <p className="text-gray-300 mt-2 text-base sm:text-lg">
                Track your training sessions, progress, and upcoming workouts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-900/65 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold">
                  #13
                </div>
                <div>
                  <p className="font-semibold text-white">Alex Morgan</p>
                  <p className="text-xs text-gray-400">Forward • #13</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] border border-gray-700/50 rounded-xl font-medium text-white transition-all shadow-lg flex items-center gap-2"
              >
                <FaCalendarAlt /> View Schedule
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personalized Training */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] rounded-2xl shadow-xl overflow-hidden border border-gray-700/50"
            >
              <div className="p-6 text-white">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">Today's Session</span>
                      <span className="text-blue-200 text-sm">AI Recommended</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Agility and Speed Drills</h2>
                    <p className="text-blue-100 mb-4">
                      Focus on improving your agility and speed with personalized drills designed for forwards.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2 text-white/90">
                        <FaClock className="text-blue-200" />
                        <span>75 minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <FaFire className="text-orange-300" />
                        <span>Estimated 520 calories</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <FaHeartbeat className="text-red-300" />
                        <span>High Intensity</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-3 bg-white text-[#00d0cb] rounded-xl font-bold hover:bg-blue-50 transition flex items-center gap-2 shadow-lg"
                      >
                        <FaPlay /> Start Session
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition flex items-center gap-2"
                      >
                        View Details
                        <FaChevronRight className="text-sm" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-48 h-32 md:w-56 md:h-40 rounded-xl overflow-hidden border-4 border-white/30 shadow-2xl">
                      <div className="w-full h-full bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-white text-2xl font-bold mb-1">FORWARD</div>
                          <div className="text-blue-200">Drill Series</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Training Metrics */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FiBarChart2 className="text-[#00d0cb]" />
                  Training Metrics
                </h2>
                <p className="text-gray-400 text-sm mt-1">Your overall training performance</p>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trainingMetrics.map((metric, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -4 }}
                      className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-400 text-sm">{metric.name}</div>
                          <div className="text-2xl font-bold mt-1 text-white">{metric.value}</div>
                        </div>
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                          <div className="text-white">{metric.icon}</div>
                        </div>
                      </div>
                      {metric.target && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Target: {metric.target}</span>
                            <span className="font-medium text-white">
                              {Math.round((metric.value / metric.target) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]" 
                              style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Training History */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    <FiCalendar className="text-[#902bd1]" />
                    Training History
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Your recent training sessions</p>
                </div>
                <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                  View All History
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-gray-800/30 text-gray-400 text-sm font-medium">
                    <div>Date</div>
                    <div>Type</div>
                    <div>Focus</div>
                    <div>Duration</div>
                    <div>Rating</div>
                    <div>Progress</div>
                  </div>
                  
                  <div className="space-y-3 p-4 md:p-0">
                    {trainingHistory.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ x: 4 }}
                        className="md:grid md:grid-cols-6 gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all"
                      >
                        <div className="mb-3 md:mb-0">
                          <div className="text-sm font-medium text-white">{item.date}</div>
                          <div className="text-xs text-gray-400">{item.coach}</div>
                        </div>
                        <div className="mb-3 md:mb-0">
                          <div className="text-sm text-white">{item.type}</div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <FaFire className={`mr-1 ${item.intensity === 'High' ? 'text-red-400' : 'text-amber-400'}`} />
                            {item.intensity} Intensity
                          </div>
                        </div>
                        <div className="mb-3 md:mb-0">
                          <div className="text-sm text-white">{item.focus}</div>
                        </div>
                        <div className="mb-3 md:mb-0">
                          <div className="text-sm text-white">{item.duration}</div>
                          <div className="text-xs text-gray-400">{item.calories} cal</div>
                        </div>
                        <div className="mb-3 md:mb-0">
                          <div className="flex items-center">
                            <span className="text-sm font-bold text-white">{item.rating}</span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="text-white">10</span>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FiStar 
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(item.rating / 2) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-green-400 font-medium">
                          <FaArrowUp />
                          {item.progress}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Training Progress */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FiTrendingUp className="text-[#10B981]" />
                  Skill Progress
                </h2>
                <p className="text-gray-400 text-sm mt-1">Improvements in key skill areas</p>
              </div>
              
              <div className="p-5 md:p-6 space-y-4 md:space-y-5">
                {trainingProgress.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{skill.progress}%</span>
                        <span className="text-green-400 text-sm font-medium flex items-center">
                          <FaArrowUp className="mr-1" />
                          {skill.improvement}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${skill.color}`} 
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Sessions */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FaCalendarAlt className="text-[#4fb0ff]" />
                  Upcoming Sessions
                </h2>
                <p className="text-gray-400 text-sm mt-1">Your scheduled training sessions</p>
              </div>
              
              <div className="p-5 md:p-6 space-y-4">
                {upcomingSessions.map((session, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className={`border-l-4 ${session.color} bg-gray-800/30 rounded-r-xl p-4 border border-l-0 border-gray-700/50 hover:border-gray-600 transition-all`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white">{session.type}</div>
                        <div className="text-sm text-gray-300">{session.focus}</div>
                      </div>
                      <span className="px-2 py-1 bg-gray-700/50 text-white text-xs font-medium rounded">
                        {session.duration}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-gray-300 text-sm">
                        <FaCalendarAlt className="mr-2" />
                        {session.date} • {session.time}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <FiMapPin className="mr-2" />
                        {session.location}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center">
                        Add to Calendar
                        <FaChevronRight className="ml-1 text-xs" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  View Full Schedule
                  <FaCalendarAlt />
                </motion.button>
              </div>
            </motion.div>

            {/* Training Calendar */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                      <FiCalendar className="text-[#902bd1]" />
                      Training Calendar
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">July 2024</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-white transition-colors">
                      &lt;
                    </button>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors">
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="grid grid-cols-7 gap-1 text-center text-gray-400 mb-3 text-sm">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="font-medium">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty days before July 1st */}
                  <div></div>
                  
                  {/* July days */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const hasTraining = [5, 8, 12, 15, 19, 22, 25, 29].includes(day);
                    const isToday = day === 23;
                    
                    return (
                      <div 
                        key={day} 
                        className={`min-h-12 p-1 rounded ${
                          isToday 
                            ? 'bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff] text-white' 
                            : 'bg-gray-800/30 hover:bg-gray-700/50'
                        } transition-all`}
                      >
                        <div className={`text-right text-sm p-1 ${
                          isToday ? 'font-bold' : 'text-white'
                        }`}>
                          {day}
                        </div>
                        
                        {hasTraining && (
                          <div className="text-xs bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded px-1 py-0.5 mt-1 truncate">
                            Training
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Training Resources */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-800/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50"
            >
              <div className="p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1 flex items-center gap-3">
                  <FiTarget className="text-yellow-400" />
                  Training Resources
                </h2>
                <p className="text-gray-400 text-sm mt-1">Tools to enhance your training</p>
                
                <div className="mt-6 space-y-3">
                  <motion.a
                    whileHover={{ x: 4 }}
                    href="#"
                    className="flex items-center p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]">
                      <FaRunning className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Drill Library</span>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ x: 4 }}
                    href="#"
                    className="flex items-center p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#902bd1] to-[#7c3aed]">
                      <FaChartLine className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Performance Reports</span>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ x: 4 }}
                    href="#"
                    className="flex items-center p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#10B981] to-[#059669]">
                      <FaMedal className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Training Plans</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Training;