import { motion } from 'framer-motion';
import { 
  FaPlay, 
  FaBookmark, 
  FaDownload, 
  FaCalendarAlt,
  FaChartLine,
  FaVideo,
  FaChevronRight,
  FaStar,
  FaCheck,
  FaTimes,
  FaClipboardList,
  FaFutbol
} from 'react-icons/fa';
import { 
  FiTarget, 
  FiTrendingUp, 
  FiActivity, 
  FiMap,
  FiFileText,
  FiCalendar,
  FiPlus,
  FiUsers,
  FiEdit3
} from 'react-icons/fi';

const Analysis = () => {
  const recentAnalyses = [
    { 
      title: 'Match vs Tigers', 
      date: '2024-07-10', 
      type: 'Video', 
      summary: 'Reviewed defensive positioning and transition play', 
      duration: '18:42',
      keyInsights: [
        'Improved defensive shape by 15% compared to previous match',
        'Identified 3 instances of poor transition positioning'
      ],
      coachComments: 'Excellent recovery runs but need quicker defensive transitions',
      rating: 7.8,
      color: 'from-[#902bd1] to-[#4fb0ff]',
      icon: <FaVideo />
    },
    { 
      title: 'Training Session 15', 
      date: '2024-07-08', 
      type: 'Tactical', 
      summary: 'Analyzed pressing strategy and high block', 
      duration: '12:15',
      keyInsights: [
        'Pressing success rate increased to 62%',
        'Identified optimal pressing triggers'
      ],
      coachComments: 'Effective pressing but need better coordination with midfield',
      rating: 8.2,
      color: 'from-[#902bd1] to-[#7c3aed]',
      icon: <FiTarget />
    },
    { 
      title: 'Match vs Eagles', 
      date: '2024-07-03', 
      type: 'Video', 
      summary: 'Focused on attacking patterns and final third entries', 
      duration: '22:05',
      keyInsights: [
        'Created 12 scoring opportunities from wide areas',
        'Final third passing accuracy improved to 78%'
      ],
      coachComments: 'Excellent movement in attacking third but need better finishing',
      rating: 8.5,
      color: 'from-[#00d0cb] to-[#4fb0ff]',
      icon: <FaVideo />
    },
  ];

  const tacticalBoards = [
    {
      title: 'Defensive Shape 4-3-3',
      formation: '4-3-3',
      description: 'Mid-block defensive organization with pressing triggers',
      created: '2024-07-12',
      color: 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]'
    },
    {
      title: 'Attacking Pattern - Right Side',
      formation: '4-2-3-1',
      description: 'Overload right side with overlapping runs',
      created: '2024-07-05',
      color: 'bg-gradient-to-r from-[#902bd1] to-[#7c3aed]'
    },
    {
      title: 'Set Piece - Corner Defense',
      formation: 'Zonal Marking',
      description: 'Zone defense with specific player responsibilities',
      created: '2024-06-28',
      color: 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]'
    }
  ];

  const upcomingAnalyses = [
    {
      match: 'vs Wolves',
      date: '2024-07-18',
      focus: 'Midfield transition and counter-pressing',
      assignedCoach: 'Coach Davis',
      color: 'border-l-[#4fb0ff]'
    },
    {
      match: 'Training Session 18',
      date: '2024-07-15',
      focus: 'Set piece execution and variations',
      assignedCoach: 'Coach Rodriguez',
      color: 'border-l-[#00d0cb]'
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
                Video & Tactical Analysis
              </h1>
              <p className="text-gray-300 mt-2 text-base sm:text-lg">
                Review matches and training sessions for deeper performance insights
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
                  <option className="bg-gray-800">Season 2024</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="space-y-6 md:space-y-8">
            {/* Latest Video Analysis */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    <FaVideo className="text-[#4fb0ff]" />
                    Latest Video Analysis
                  </h2>
                  <span className="px-3 py-1 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white text-xs font-medium rounded-full">
                    New
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Most recent match review with key insights</p>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="relative rounded-xl overflow-hidden mb-4 md:mb-6">
                  <div className="aspect-video bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-4 md:p-5 mb-4"
                    >
                      <FaPlay className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </motion.button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-[#00d0cb] text-white text-xs rounded font-medium">VIDEO</span>
                          <span className="text-white text-sm">Defensive Analysis</span>
                        </div>
                        <div className="text-white text-lg font-bold mt-2">Match vs Tigers</div>
                        <div className="text-blue-200 text-sm">July 10, 2024 • 18:42 duration</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition"
                        >
                          <FaBookmark />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition"
                        >
                          <FaDownload />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FiActivity className="text-[#10B981]" />
                      Key Insights
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaCheck className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">Defensive shape improved by 15% compared to previous match</span>
                      </li>
                      <li className="flex items-start">
                        <FaTimes className="h-5 w-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">Identified 3 critical transition moments needing improvement</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FiUsers className="text-yellow-400" />
                      Coach Feedback
                    </h3>
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                      <p className="text-gray-300 italic">
                        "Excellent recovery runs but need quicker defensive transitions. Focus on communication with midfielders during opponent build-up."
                      </p>
                      <div className="flex items-center mt-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] mr-2 flex items-center justify-center text-xs text-white font-bold">
                          CT
                        </div>
                        <span className="text-sm text-gray-400">Coach Thompson</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-medium">Overall Rating:</span>
                      <div className="flex items-center">
                        <span className="text-amber-400 font-bold text-lg">7.8</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span>10</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                    >
                      View Full Analysis
                      <FaChevronRight className="text-sm" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Analyses */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FiCalendar className="text-[#902bd1]" />
                  Recent Analyses
                </h2>
                <p className="text-gray-400 text-sm mt-1">Your last reviewed sessions and matches</p>
              </div>
              
              <div className="divide-y divide-gray-700/50">
                {recentAnalyses.map((a, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    className="p-5 hover:bg-gray-800/30 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}>
                        <div className="text-white text-xl">
                          {a.icon}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-bold text-white text-lg">{a.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              a.type === 'Video' 
                                ? 'bg-[#00d0cb]/30 text-[#80a8ff]' 
                                : 'bg-[#902bd1]/30 text-[#d9b8ff]'
                            }`}>
                              {a.type}
                            </span>
                            <span className="text-xs text-gray-400">{a.duration}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-gray-400 text-sm flex items-center">
                          <FaCalendarAlt className="h-4 w-4 mr-1" />
                          {a.date}
                        </div>
                        
                        <p className="mt-3 text-gray-300">{a.summary}</p>
                        
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center">
                            <span className="text-gray-400 font-medium mr-2">Rating:</span>
                            <div className="flex items-center">
                              <span className="text-amber-400 font-bold">{a.rating}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span>10</span>
                            </div>
                          </div>
                          <button className="text-[#80a8ff] text-sm font-medium hover:text-white transition-colors flex items-center">
                            View Details
                            <FaChevronRight className="ml-1 text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-5 border-t border-gray-700/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  View All Analyses
                  <FaChevronRight className="text-sm" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8">
            {/* Tactical Board */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    <FiMap className="text-yellow-400" />
                    Tactical Boards
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-[#80a8ff] text-sm font-medium hover:text-white transition-colors flex items-center"
                  >
                    <FiPlus className="mr-1" />
                    Create New
                  </motion.button>
                </div>
                <p className="text-gray-400 text-sm mt-1">Team strategies and formations</p>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="aspect-video bg-gradient-to-br from-[#0a3c2f] to-[#0d4d3d] rounded-xl overflow-hidden relative mb-6 border-4 border-white/20">
                  {/* Soccer Field */}
                  <div className="absolute inset-0 border-4 border-white/30 rounded-lg">
                    {/* Center line and circle */}
                    <div className="absolute top-0 bottom-0 left-1/2 border-l-2 border-white/30 border-dashed"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white/30"></div>
                    
                    {/* Penalty areas */}
                    <div className="absolute top-0 bottom-0 left-0 w-1/4 border-r-2 border-white/30">
                      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-8 h-24 border-2 border-white/30 rounded-l-lg"></div>
                      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-3 h-10 border-2 border-white/30 rounded-l-lg"></div>
                    </div>
                    <div className="absolute top-0 bottom-0 right-0 w-1/4 border-l-2 border-white/30">
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-8 h-24 border-2 border-white/30 rounded-r-lg"></div>
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-3 h-10 border-2 border-white/30 rounded-r-lg"></div>
                    </div>
                    
                    {/* Players */}
                    {['35,25', '35,55', '35,85', '65,40', '65,70', '95,30', '95,70', '120,25', '120,55', '120,85'].map((pos, i) => (
                      <div 
                        key={i} 
                        className={`absolute rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 ${
                          i < 4 ? 'bg-[#4fb0ff] border-[#00d0cb] text-white' : 
                          i < 6 ? 'bg-[#902bd1] border-[#7c3aed] text-white' : 
                          'bg-[#10B981] border-[#059669] text-white'
                        }`}
                        style={{ 
                          left: pos.split(',')[0] + 'px', 
                          top: pos.split(',')[1] + 'px',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {i < 4 ? 'D' : i < 6 ? 'M' : 'F'}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-bold text-white text-lg">Defensive Shape 4-3-3</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Mid-block organization with pressing triggers in central areas
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400 flex items-center">
                      <FaCalendarAlt className="h-4 w-4 mr-1" />
                      Last updated: 2024-07-12
                    </div>
                    <button className="text-[#80a8ff] font-medium hover:text-white transition-colors">
                      Edit Board
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tacticalBoards.map((board, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4 }}
                      className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer"
                    >
                      <div className="font-medium text-white truncate">{board.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{board.formation}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Upcoming Analyses */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FaClipboardList className="text-[#10B981]" />
                  Upcoming Analyses
                </h2>
                <p className="text-gray-400 text-sm mt-1">Scheduled reviews and sessions</p>
              </div>
              
              <div className="p-5 md:p-6">
                <ul className="space-y-4">
                  {upcomingAnalyses.map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4 }}
                      className={`border-l-4 ${item.color} bg-gray-800/30 rounded-r-xl p-4 border border-l-0 border-gray-700/50 hover:border-gray-600 transition-all`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-3">
                          <div className="w-2 h-2 bg-[#4fb0ff] rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{item.match}</div>
                          <div className="text-sm text-gray-400 mt-2 flex items-center">
                            <FaCalendarAlt className="h-4 w-4 mr-1" />
                            {item.date} • {item.assignedCoach}
                          </div>
                          <div className="mt-2 text-sm text-gray-300 flex items-start">
                            <FiTarget className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Focus: {item.focus}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </ul>
                
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <FiPlus />
                    Schedule New Analysis
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Analysis Resources */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-800/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50"
            >
              <div className="p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <FiFileText className="text-yellow-400" />
                  Analysis Resources
                </h2>
                <p className="text-gray-400 text-sm mt-1">Tools and tutorials to improve your analysis skills</p>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <motion.a
                    whileHover={{ y: -2 }}
                    href="#"
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]">
                        <FaVideo className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-white font-medium">Tutorials</span>
                    </div>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ y: -2 }}
                    href="#"
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#902bd1] to-[#7c3aed]">
                        <FiEdit3 className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-white font-medium">Templates</span>
                    </div>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ y: -2 }}
                    href="#"
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff]">
                        <FaCalendarAlt className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-white font-medium">Calendar</span>
                    </div>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ y: -2 }}
                    href="#"
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-700/50 transition-all border border-gray-700/50"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-[#10B981] to-[#059669]">
                        <FaChartLine className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-white font-medium">Reports</span>
                    </div>
                  </motion.a>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-semibold transition-all"
                >
                  Access Premium Resources
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analysis;