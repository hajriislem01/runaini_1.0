import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFire, 
  FaRunning, 
  FaTrophy, 
  FaChartLine, 
  FaMedal,
  FaStar,
  FaFutbol,
  FaCalendarAlt,
  FaChevronRight,
  FaFlag,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { 
  FiTrendingUp, 
  FiActivity, 
  FiTarget,
  FiBarChart2,
  FiAward,
  FiUsers,
  FiClock,
  FiDownload,
  FiMap
} from 'react-icons/fi';

const trainingMetrics = {
  totalSessions: 25,
  completedSessions: 22,
  avgIntensity: 7.5,
  avgDuration: 90,
  intensityChange: '+5%',
  drillPerformance: 85,
  drillChange: '+10%',
  caloriesBurned: 4200,
  mostImprovedDrill: 'Agility Ladder',
  mostImprovedValue: '+15%',
  topDays: [
    { day: 'Mon', count: 5, color: 'from-[#902bd1] to-[#4fb0ff]' },
    { day: 'Wed', count: 7, color: 'from-[#00d0cb] to-[#4fb0ff]' },
    { day: 'Fri', count: 6, color: 'from-[#902bd1] to-[#4fb0ff]' },
    { day: 'Sat', count: 7, color: 'from-[#00d0cb] to-[#4fb0ff]' },
    { day: 'Sun', count: 0, color: 'from-[#6B7280] to-[#9CA3AF]' },
  ],
  personalBests: [
    { drill: 'Sprint 40m', value: '5.2s', improvement: '-0.4s', color: 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]' },
    { drill: 'Vertical Jump', value: '62cm', improvement: '+5cm', color: 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]' },
    { drill: 'Push-ups', value: '55 reps', improvement: '+8 reps', color: 'bg-gradient-to-r from-[#902bd1] to-[#7c3aed]' },
  ],
  intensityTrend: [6.8, 7.2, 7.1, 7.6, 7.8, 7.5, 7.9],
  drillTrend: [72, 78, 75, 82, 80, 85, 88],
};

const matchMetrics = {
  totalMatches: 12,
  wins: 7,
  draws: 2,
  losses: 3,
  avgRating: 8.2,
  avgMinutes: 78,
  ratingChange: '+3%',
  passAccuracy: 88,
  passChange: '+7%',
  goals: 6,
  assists: 4,
  cards: { yellow: 2, red: 0, fouls: 5 },
  highlights: [
    { match: 'vs Tigers', rating: 9.1, mvp: true, date: '2023-06-15', color: 'bg-gradient-to-r from-yellow-400 to-[#D97706]' },
    { match: 'vs Eagles', rating: 8.8, mvp: false, date: '2023-06-22', color: 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]' },
    { match: 'vs Wolves', rating: 8.5, mvp: true, date: '2023-07-01', color: 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]' },
  ],
  positionHeatmap: [
    { x: 65, y: 30, value: 85 },
    { x: 70, y: 40, value: 92 },
    { x: 60, y: 35, value: 78 },
    { x: 75, y: 25, value: 88 },
  ],
};

const Performance = () => {
  const [tab, setTab] = useState('training');
  const completionRate = Math.round((trainingMetrics.completedSessions / trainingMetrics.totalSessions) * 100);

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
                Performance Analytics
              </h1>
              <p className="text-gray-300 mt-2 text-base sm:text-lg">
                Track and analyze player performance metrics
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
              <div className="bg-gray-900/65 backdrop-blur-sm p-3 rounded-xl border border-gray-700/50">
                <select className="text-sm bg-transparent border-none focus:ring-0 text-white">
                  <option className="bg-gray-800">Last 30 Days</option>
                  <option className="bg-gray-800">Last 90 Days</option>
                  <option className="bg-gray-800">Season 2023</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex border-b border-gray-700/50 mb-8 overflow-x-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-3 font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'training' 
                ? 'border-[#4fb0ff] text-white' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setTab('training')}
          >
            <FaRunning className={tab === 'training' ? 'text-[#4fb0ff]' : 'text-gray-400'} />
            Training Performance
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-3 font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'match' 
                ? 'border-[#00d0cb] text-white' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setTab('match')}
          >
            <FaTrophy className={tab === 'match' ? 'text-[#00d0cb]' : 'text-gray-400'} />
            Match Performance
          </motion.button>
        </motion.div>

        {tab === 'training' ? (
          <motion.div 
            variants={itemVariants}
            className="space-y-6 md:space-y-8"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: 'Completed Sessions',
                  value: `${trainingMetrics.completedSessions}/${trainingMetrics.totalSessions}`,
                  change: `${completionRate}%`,
                  icon: <FiClock />,
                  color: 'from-[#902bd1] to-[#4fb0ff]',
                  progress: completionRate
                },
                {
                  title: 'Avg. Intensity',
                  value: `${trainingMetrics.avgIntensity}/10`,
                  change: trainingMetrics.intensityChange,
                  icon: <FiActivity />,
                  color: 'from-[#00d0cb] to-[#4fb0ff]',
                  trend: trainingMetrics.intensityChange.includes('+')
                },
                {
                  title: 'Drill Performance',
                  value: `${trainingMetrics.drillPerformance}%`,
                  change: trainingMetrics.drillChange,
                  icon: <FiTarget />,
                  color: 'from-[#902bd1] to-[#7c3aed]',
                  trend: trainingMetrics.drillChange.includes('+')
                },
                {
                  title: 'Calories Burned',
                  value: trainingMetrics.caloriesBurned.toLocaleString(),
                  change: `Avg. ${trainingMetrics.avgDuration} mins`,
                  icon: <FaFire />,
                  color: 'from-yellow-400 to-[#D97706]'
                }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  variants={itemVariants}
                  className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-700/50 hover:border-gray-600 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-gray-400 text-sm">{metric.title}</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1 text-white">{metric.value}</p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${metric.color}`}>
                      <div className="text-white text-lg md:text-xl">{metric.icon}</div>
                    </div>
                  </div>
                  
                  {metric.progress !== undefined ? (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Completion Rate</span>
                        <span className="font-medium text-white">{metric.change}</span>
                      </div>
                      <div className="w-full bg-gray-800/50 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`} 
                          style={{ width: `${metric.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center mt-3">
                      <span className={`text-sm font-medium ${metric.trend ? 'text-green-400' : 'text-red-400'}`}>
                        {metric.change}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        {metric.trend ? 'from last month' : ''}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Intensity Chart */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FiTrendingUp className="text-[#4fb0ff]" />
                      Intensity Trend
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Last 7 sessions</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 text-sm font-medium mr-2">{trainingMetrics.intensityChange}</span>
                    <span className="text-gray-400 text-sm">vs prev. period</span>
                  </div>
                </div>
                <div className="h-64">
                  <svg viewBox="0 0 400 240" className="w-full">
                    <defs>
                      <linearGradient id="intensity-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00d0cb" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4fb0ff" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <polygon 
                      fill="url(#intensity-gradient)" 
                      points={`40,220 ${trainingMetrics.intensityTrend.map((val, i) => 
                        `${40 + i * 50},${220 - val * 20}`
                      ).join(' ')} 340,220`}
                    />
                    <polyline
                      fill="none"
                      stroke="#00d0cb"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      points={trainingMetrics.intensityTrend.map((val, i) => 
                        `${40 + i * 50},${220 - val * 20}`
                      ).join(' ')}
                    />
                    {trainingMetrics.intensityTrend.map((val, i) => (
                      <g key={i}>
                        <circle
                          cx={40 + i * 50}
                          cy={220 - val * 20}
                          r="4"
                          fill="#00d0cb"
                          stroke="#4fb0ff"
                          strokeWidth="2"
                        />
                        <text
                          x={40 + i * 50}
                          y={220 - val * 20 - 10}
                          textAnchor="middle"
                          fill="#D1D5DB"
                          fontSize="12"
                        >
                          {val}
                        </text>
                      </g>
                    ))}
                    <g transform="translate(0,220)">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <text
                          key={i}
                          x={40 + i * 50}
                          y="20"
                          textAnchor="middle"
                          fill="#9CA3AF"
                          fontSize="12"
                        >
                          {day}
                        </text>
                      ))}
                    </g>
                  </svg>
                </div>
              </motion.div>

              {/* Drill Performance */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FiBarChart2 className="text-[#10B981]" />
                      Drill Performance
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Last 7 sessions</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 text-sm font-medium mr-2">{trainingMetrics.drillChange}</span>
                    <span className="text-gray-400 text-sm">vs prev. period</span>
                  </div>
                </div>
                <div className="h-64">
                  <svg viewBox="0 0 400 240" className="w-full">
                    {trainingMetrics.drillTrend.map((val, i) => (
                      <g key={i}>
                        <defs>
                          <linearGradient id={`bar-gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                        <rect
                          x={50 + i * 45}
                          y={220 - val * 2}
                          width="30"
                          height={val * 2}
                          rx="4"
                          fill={`url(#bar-gradient-${i})`}
                        />
                        <text
                          x={65 + i * 45}
                          y={220 - val * 2 - 10}
                          textAnchor="middle"
                          fill="#D1D5DB"
                          fontSize="12"
                        >
                          {val}%
                        </text>
                      </g>
                    ))}
                    <g transform="translate(0,220)">
                      {['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].map((drill, i) => (
                        <text
                          key={i}
                          x={65 + i * 45}
                          y="20"
                          textAnchor="middle"
                          fill="#9CA3AF"
                          fontSize="12"
                        >
                          {drill}
                        </text>
                      ))}
                    </g>
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Training Days */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-[#4fb0ff]" />
                  Top Training Days
                </h3>
                <div className="space-y-4">
                  {trainingMetrics.topDays.map((day, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-gray-300 w-12">{day.day}</span>
                      <div className="flex-1 ml-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-800/50 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${day.color}`} 
                              style={{ width: `${(day.count / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-300 ml-2 w-16">{day.count} sessions</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Personal Bests */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaMedal className="text-yellow-400" />
                  Personal Bests
                </h3>
                <div className="space-y-4">
                  {trainingMetrics.personalBests.map((pb, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 4 }}
                      className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
                    >
                      <div>
                        <p className="font-medium text-white">{pb.drill}</p>
                        <p className="text-sm text-gray-400">New record: {pb.value}</p>
                      </div>
                      <span className={`${pb.improvement.includes('+') ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'} text-xs font-medium px-3 py-1 rounded-full`}>
                        {pb.improvement}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Most Improved */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiAward className="text-[#10B981]" />
                    Most Improved Drill
                  </h3>
                  <span className="bg-green-900/30 text-green-400 text-sm font-medium px-3 py-1 rounded-full">
                    {trainingMetrics.mostImprovedValue}
                  </span>
                </div>
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] mb-4">
                    <FaChartLine className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                  <p className="text-xl font-bold text-white">{trainingMetrics.mostImprovedDrill}</p>
                  <p className="text-gray-400 mt-2 text-sm">Significant improvement in speed and accuracy</p>
                </div>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] border border-gray-700/50 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2"
            >
              <FiDownload />
              View Detailed Training Report
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants}
            className="space-y-6 md:space-y-8"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: 'Total Matches',
                  value: matchMetrics.totalMatches,
                  stats: `${matchMetrics.wins}W / ${matchMetrics.draws}D / ${matchMetrics.losses}L`,
                  icon: <FaFutbol />,
                  color: 'from-[#902bd1] to-[#4fb0ff]'
                },
                {
                  title: 'Avg. Rating',
                  value: `${matchMetrics.avgRating}/10`,
                  change: matchMetrics.ratingChange,
                  icon: <FaStar />,
                  color: 'from-[#00d0cb] to-[#4fb0ff]',
                  trend: matchMetrics.ratingChange.includes('+')
                },
                {
                  title: 'Goals & Assists',
                  value: `${matchMetrics.goals}G ${matchMetrics.assists}A`,
                  change: `Avg. ${matchMetrics.avgMinutes} mins`,
                  icon: <FiUsers />,
                  color: 'from-[#902bd1] to-[#7c3aed]'
                },
                {
                  title: 'Pass Accuracy',
                  value: `${matchMetrics.passAccuracy}%`,
                  change: matchMetrics.passChange,
                  icon: <FiTarget />,
                  color: 'from-[#10B981] to-[#059669]',
                  trend: matchMetrics.passChange.includes('+')
                }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  variants={itemVariants}
                  className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-700/50 hover:border-gray-600 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-gray-400 text-sm">{metric.title}</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1 text-white">{metric.value}</p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${metric.color}`}>
                      <div className="text-white text-lg md:text-xl">{metric.icon}</div>
                    </div>
                  </div>
                  
                  {metric.stats ? (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-400">{matchMetrics.wins}W</span>
                        <span className="text-sm font-medium text-yellow-400">{matchMetrics.draws}D</span>
                        <span className="text-sm font-medium text-red-400">{matchMetrics.losses}L</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center mt-3">
                      <span className={`text-sm font-medium ${metric.trend ? 'text-green-400' : 'text-red-400'}`}>
                        {metric.change}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        {metric.trend ? 'from last month' : ''}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Win/Loss Chart */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" />
                  Match Results
                </h3>
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 32 32" className="w-full h-full">
                      <circle r="16" cx="16" cy="16" fill="#374151" />
                      <path 
                        d={`M16 16 L16 0 A16 16 0 ${(matchMetrics.wins / matchMetrics.totalMatches) * 100 > 50 ? 1 : 0} 1 ${16 + 16 * Math.sin((matchMetrics.wins / matchMetrics.totalMatches)*2*Math.PI)} ${16 - 16 * Math.cos((matchMetrics.wins / matchMetrics.totalMatches)*2*Math.PI)} Z`} 
                        fill="#10B981" 
                      />
                      <path 
                        d={`M16 16 L${16 + 16 * Math.sin((matchMetrics.wins / matchMetrics.totalMatches)*2*Math.PI)} ${16 - 16 * Math.cos((matchMetrics.wins / matchMetrics.totalMatches)*2*Math.PI)} A16 16 0 ${(matchMetrics.draws / matchMetrics.totalMatches) * 100 > 50 ? 1 : 0} 1 ${16 + 16 * Math.sin(((matchMetrics.wins + matchMetrics.draws)/matchMetrics.totalMatches)*2*Math.PI)} ${16 - 16 * Math.cos(((matchMetrics.wins + matchMetrics.draws)/matchMetrics.totalMatches)*2*Math.PI)} Z`} 
                        fill="#F59E0B" 
                      />
                      <path 
                        d={`M16 16 L${16 + 16 * Math.sin(((matchMetrics.wins + matchMetrics.draws)/matchMetrics.totalMatches)*2*Math.PI)} ${16 - 16 * Math.cos(((matchMetrics.wins + matchMetrics.draws)/matchMetrics.totalMatches)*2*Math.PI)} A16 16 0 1 1 16 0 Z`} 
                        fill="#EF4444" 
                      />
                      <circle r="8" cx="16" cy="16" fill="#1F2937" />
                      <text x="16" y="16" textAnchor="middle" dy=".3em" fontSize="6" fill="#D1D5DB">
                        {matchMetrics.totalMatches} matches
                      </text>
                    </svg>
                    
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {Math.round((matchMetrics.wins / matchMetrics.totalMatches) * 100)}%
                        </p>
                        <p className="text-xs text-gray-400">Win Rate</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <span className="font-medium text-white">{matchMetrics.wins} Wins</span>
                        <span className="text-gray-400 ml-2">
                          {Math.round((matchMetrics.wins / matchMetrics.totalMatches) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                      <div>
                        <span className="font-medium text-white">{matchMetrics.draws} Draws</span>
                        <span className="text-gray-400 ml-2">
                          {Math.round((matchMetrics.draws / matchMetrics.totalMatches) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <div>
                        <span className="font-medium text-white">{matchMetrics.losses} Losses</span>
                        <span className="text-gray-400 ml-2">
                          {Math.round((matchMetrics.losses / matchMetrics.totalMatches) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Position Heatmap */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FiMap className="text-[#00d0cb]" />
                      Position Heatmap
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Avg. position in last 5 matches</p>
                  </div>
                </div>
                <div className="h-64 relative">
                  <div className="w-full h-full border border-gray-700 rounded-lg bg-gradient-to-br from-[#0a3c2f] to-[#0d4d3d] relative">
                    {/* Soccer field representation */}
                    <div className="absolute inset-0 border-r border-l border-gray-600/50" style={{ left: '25%', right: '25%' }}></div>
                    <div className="absolute inset-0 border-t border-b border-gray-600/50" style={{ top: '25%', bottom: '25%' }}></div>
                    <div className="absolute rounded-full border border-gray-600/50" style={{ top: '25%', left: '25%', right: '25%', bottom: '25%' }}></div>
                    
                    {/* Position markers */}
                    {matchMetrics.positionHeatmap.map((pos, i) => (
                      <div 
                        key={i}
                        className="absolute rounded-full bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] opacity-70"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          width: `${10 + pos.value/5}px`,
                          height: `${10 + pos.value/5}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      ></div>
                    ))}
                    
                    {/* Player marker */}
                    <div className="absolute rounded-full bg-gradient-to-r from-yellow-400 to-[#D97706] border-2 border-white/80 w-6 h-6 flex items-center justify-center"
                      style={{ left: '70%', top: '40%', transform: 'translate(-50%, -50%)' }}>
                      <span className="text-xs text-white font-bold">13</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Disciplinary Record */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaFlag className="text-yellow-400" />
                  Disciplinary Record
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-yellow-900/30 p-4 rounded-xl text-center border border-yellow-800/30">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-[#D97706] rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">{matchMetrics.cards.yellow}</span>
                    </div>
                    <p className="font-medium text-white">Yellow Cards</p>
                  </div>
                  <div className="bg-red-900/30 p-4 rounded-xl text-center border border-red-800/30">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">{matchMetrics.cards.red}</span>
                    </div>
                    <p className="font-medium text-white">Red Cards</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-xl text-center border border-gray-700/50">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">{matchMetrics.cards.fouls}</span>
                    </div>
                    <p className="font-medium text-white">Fouls</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Fair Play Score</span>
                    <span className="font-medium text-white">8.7/10</span>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669]" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </motion.div>

              {/* Match Highlights */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaMedal className="text-[#00d0cb]" />
                  Match Highlights
                </h3>
                <div className="space-y-4">
                  {matchMetrics.highlights.map((match, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 4 }}
                      className={`p-4 rounded-xl border ${match.mvp ? 'border-blue-800/30 bg-blue-900/20' : 'border-gray-700/50'} hover:border-gray-600 transition-all`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-white">{match.match}</p>
                          <p className="text-sm text-gray-400">{match.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${match.rating > 8.5 ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                            {match.rating}/10
                          </span>
                          {match.mvp && (
                            <span className="px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-medium">
                              MVP
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-300">
                        {match.mvp ? 'Outstanding performance with 2 goals' : 'Solid performance with 1 assist'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] border border-gray-700/50 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2"
            >
              <FiDownload />
              View Detailed Match Report
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Performance;