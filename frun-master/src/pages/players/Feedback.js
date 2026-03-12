import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaChartLine, 
  FaCheckCircle,
  FaThumbsUp,
  FaChevronRight,
  FaClipboardList,
  FaCalendarAlt,
  FaBullseye,
  FaHeart,
  FaFire,
  FaTarget
} from 'react-icons/fa';
import { 
  FiTrendingUp, 
  FiActivity, 
  FiTarget,
  FiAward,
  FiUsers,
  FiClock,
  FiPlus,
  FiMessageSquare,
  FiDownload,
  FiThumbsUp
} from 'react-icons/fi';

const coachFeedback = {
  name: 'Coach Sarah Thompson',
  title: 'Head Coach',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  date: '2024-07-12',
  rating: 4.8,
  feedback: 'Excellent performance in the last match, Alex. Your agility drills are showing great results. Focus on improving your passing accuracy in tight spaces during the next training session.',
  areas: [
    { name: 'Technical Skills', rating: 4.5, trend: 'up', color: 'from-[#902bd1] to-[#4fb0ff]' },
    { name: 'Tactical Awareness', rating: 4.7, trend: 'up', color: 'from-[#00d0cb] to-[#4fb0ff]' },
    { name: 'Physical Conditioning', rating: 4.9, trend: 'steady', color: 'from-[#10B981] to-[#059669]' },
    { name: 'Mental Toughness', rating: 4.3, trend: 'up', color: 'from-[#902bd1] to-[#7c3aed]' }
  ],
  nextSteps: [
    'Increase long-range passing practice',
    'Focus on quick decision-making under pressure',
    'Improve weak foot accuracy'
  ]
};

const peerFeedback = [
  { 
    name: 'Jordan Miller', 
    position: 'Midfielder',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: '2024-07-14',
    comment: 'Your vision and passing were exceptional in the last game. That through ball in the 75th minute was perfect!',
    rating: 5.0,
    color: 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]'
  },
  { 
    name: 'Sam Rodriguez', 
    position: 'Defender',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    date: '2024-07-13',
    comment: 'Your defensive support was crucial. Loved how you tracked back to cover my position when I pushed forward.',
    rating: 4.5,
    color: 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]'
  },
  { 
    name: 'Chris Evans', 
    position: 'Forward',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    date: '2024-07-11',
    comment: 'Your energy in training sessions is contagious. The way you lead the pressing sets the tone for all of us.',
    rating: 4.7,
    color: 'bg-gradient-to-r from-[#902bd1] to-[#7c3aed]'
  }
];

const feedbackSummary = {
  avgRating: 4.7,
  total: 18,
  distribution: [
    { rating: 5, count: 10, percentage: 56, color: 'from-yellow-400 to-[#D97706]' },
    { rating: 4, count: 6, percentage: 33, color: 'from-[#10B981] to-[#059669]' },
    { rating: 3, count: 2, percentage: 11, color: 'from-[#00d0cb] to-[#4fb0ff]' },
    { rating: 2, count: 0, percentage: 0, color: 'from-[#902bd1] to-[#7c3aed]' },
    { rating: 1, count: 0, percentage: 0, color: 'from-[#6B7280] to-[#9CA3AF]' }
  ],
  trends: [
    { month: 'Apr', rating: 4.2 },
    { month: 'May', rating: 4.4 },
    { month: 'Jun', rating: 4.6 },
    { month: 'Jul', rating: 4.7 }
  ]
};

const Feedback = () => {
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
                Coach & Peer Feedback
              </h1>
              <p className="text-gray-300 mt-2 text-base sm:text-lg">
                See what your coaches and teammates are saying about your performance
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
                className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
              >
                <FiPlus />
                Request Feedback
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Summary */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* Feedback Summary */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <FaChartLine className="text-[#4fb0ff]" />
                  Feedback Summary
                </h2>
                <p className="text-gray-400 text-sm mt-1">Overall performance rating from coaches and peers</p>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="text-4xl md:text-5xl font-bold text-white">{feedbackSummary.avgRating}</div>
                  <div className="flex mt-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar 
                        key={star} 
                        className={`h-5 w-5 md:h-6 md:w-6 ${star <= Math.floor(feedbackSummary.avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-400">Based on {feedbackSummary.total} reviews</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-white">Rating Distribution</h3>
                  {feedbackSummary.distribution.map((dist, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-10 text-sm text-gray-300 flex items-center">
                        {dist.rating}
                        <FaStar className="h-4 w-4 ml-1 text-amber-400" />
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-800/50 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${dist.color}`} 
                            style={{ width: `${dist.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-10 text-right text-sm text-gray-300">{dist.percentage}%</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <h3 className="font-medium text-white mb-3">Rating Trend</h3>
                  <div className="h-40">
                    <svg viewBox="0 0 300 150" className="w-full">
                      <defs>
                        <linearGradient id="trend-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00d0cb" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4fb0ff" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                      <polygon 
                        fill="url(#trend-gradient)" 
                        points={`50,130 ${feedbackSummary.trends.map((t, i) => 
                          `${50 + i * 60},${130 - t.rating * 25}`
                        ).join(' ')} 230,130`}
                      />
                      <polyline 
                        fill="none" 
                        stroke="#00d0cb" 
                        strokeWidth="3" 
                        points={feedbackSummary.trends.map((t, i) => 
                          `${50 + i * 60},${130 - t.rating * 25}`
                        ).join(' ')} 
                      />
                      {feedbackSummary.trends.map((t, i) => (
                        <g key={i}>
                          <circle
                            cx={50 + i * 60}
                            cy={130 - t.rating * 25}
                            r="4"
                            fill="#00d0cb"
                            stroke="#4fb0ff"
                            strokeWidth="2"
                          />
                          <text
                            x={50 + i * 60}
                            y={130 - t.rating * 25 - 10}
                            textAnchor="middle"
                            fill="#D1D5DB"
                            fontSize="12"
                          >
                            {t.rating}
                          </text>
                          <text
                            x={50 + i * 60}
                            y="145"
                            textAnchor="middle"
                            fill="#9CA3AF"
                            fontSize="12"
                          >
                            {t.month}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Feedback Resources */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-800/10 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <FiTarget className="text-yellow-400" />
                  Feedback Resources
                </h2>
                <p className="text-gray-400 text-sm mt-1">Tools to help you improve based on feedback</p>
                
                <div className="mt-6 space-y-4">
                  <motion.a
                    whileHover={{ x: 4 }}
                    href="#"
                    className="flex items-center p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]">
                      <FaClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Personal Development Plan</span>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ x: 4 }}
                    href="#"
                    className="flex items-center p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#10B981] to-[#059669]">
                      <FaCheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Improvement Checklists</span>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ x: 4 }}
                    href="#"
                    className="flex items-center p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-yellow-400 to-[#D97706]">
                      <FaCalendarAlt className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Training Schedules</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Latest Coach Feedback */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <FiMessageSquare className="text-[#00d0cb]" />
                    Latest Coach Feedback
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Detailed assessment from your primary coach</p>
                </div>
                <span className="px-3 py-1 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white text-xs font-medium rounded-full">
                  New
                </span>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row items-start gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white text-xl font-bold">
                    ST
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg md:text-xl">{coachFeedback.name}</h3>
                        <p className="text-gray-400 text-sm">{coachFeedback.title}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <span className="text-amber-400 font-bold text-lg">{coachFeedback.rating}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span>5</span>
                        </div>
                        <span className="text-gray-400 text-sm">{coachFeedback.date}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mb-6">
                      <p className="text-gray-300 italic">"{coachFeedback.feedback}"</p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <FaBullseye className="text-[#10B981]" />
                        Skill Area Ratings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coachFeedback.areas.map((area, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ y: -2 }}
                            className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/50"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-white">{area.name}</span>
                              <div className="flex items-center">
                                <span className="font-bold text-white mr-1">{area.rating}</span>
                                <span className="text-gray-400">/5</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-800/50 rounded-full h-2 mb-1">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${area.color}`} 
                                style={{ width: `${area.rating * 20}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>Needs Work</span>
                              <span className="flex items-center">
                                {area.trend === 'up' ? (
                                  <>
                                    <FiTrendingUp className="h-4 w-4 text-green-400 mr-1" />
                                    Improving
                                  </>
                                ) : area.trend === 'down' ? (
                                  <>
                                    <FiTrendingUp className="h-4 w-4 text-red-400 mr-1 rotate-180" />
                                    Declining
                                  </>
                                ) : (
                                  <>
                                    <FiActivity className="h-4 w-4 text-gray-400 mr-1" />
                                    Steady
                                  </>
                                )}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <FaFire className="text-yellow-400" />
                        Next Steps
                      </h4>
                      <ul className="space-y-3">
                        {coachFeedback.nextSteps.map((step, i) => (
                          <li key={i} className="flex items-start">
                            <FaCheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-300">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700/50 flex flex-col sm:flex-row gap-3 justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-xl font-medium hover:bg-gray-700/50 transition-all border border-gray-700/50"
                      >
                        Ask for Clarification
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                      >
                        <FaCheckCircle />
                        Acknowledge Feedback
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Peer Feedback */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                      <FiUsers className="text-[#902bd1]" />
                      Peer Feedback
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Feedback from your teammates</p>
                  </div>
                  <span className="text-sm text-gray-400">{peerFeedback.length} recent reviews</span>
                </div>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="space-y-4 md:space-y-6">
                  {peerFeedback.map((f, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${f.color}`}>
                        {f.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-bold text-white">{f.name}</h3>
                            <p className="text-gray-400 text-sm">{f.position}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              <span className="font-bold text-white">{f.rating}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span>5</span>
                            </div>
                            <span className="text-gray-400 text-sm">{f.date}</span>
                          </div>
                        </div>
                        <p className="text-gray-300">"{f.comment}"</p>
                        
                        <div className="mt-4 flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center"
                          >
                            <FiThumbsUp className="h-5 w-5 mr-1" />
                            Like
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    View All Peer Feedback
                    <FaChevronRight className="text-sm" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Feedback;