import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { motion } from 'framer-motion';
import {
  FaEnvelope, FaPhone, FaUser, FaMedal, FaLinkedin,
  FaFacebook, FaInstagram, FaChartLine, FaTrophy,
  FaGraduationCap, FaCalendarAlt, FaUsers, FaGlobe,
  FaFutbol, FaRunning, FaHeartbeat
} from 'react-icons/fa';
import { 
  FiTarget, 
  FiTrendingUp, 
  FiActivity, 
  FiAward,
  FiMapPin,
  FiUserCheck
} from 'react-icons/fi';

const PlayerProfile = () => {
  const { player } = usePlayer();
  const {
    name, email, phone, location, profilePicture, bio,
    philosophy, methodology, experiences, certifications
  } = player;

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
      className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8 lg:p-10"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 md:mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Player Profile
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] mx-auto mt-3 rounded-full"></div>
          <p className="text-gray-300 text-lg md:text-xl mt-4">
            Professional Football Player • Performance Analytics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 md:p-6 sticky top-6"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-5 md:mb-6">
                  {profilePicture ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={profilePicture}
                      alt="Profile"
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#00d0cb]/60 shadow-xl"
                    />
                  ) : (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#4fb0ff] to-[#902bd1] flex items-center justify-center text-4xl md:text-6xl text-white font-bold border-4 border-[#00d0cb]/50 shadow-xl"
                    >
                      {name ? name[0] : 'P'}
                    </motion.div>
                  )}
                  <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-[#D97706] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center text-xs md:text-sm font-bold shadow-lg">
                    <FaMedal className="mr-1.5 md:mr-2" /> PLAYER
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2 flex items-center gap-2">
                  <FiUserCheck className="text-[#4fb0ff]" /> 
                  {name || 'Not provided'}
                </h2>
                
                <div className="text-[#80a8ff] font-medium mb-4 text-sm md:text-base">
                  Professional Football Player • #13 Forward
                </div>
                
                <div className="flex flex-col gap-3 mb-5 w-full max-w-xs">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all group">
                    <FaEnvelope className="text-[#4fb0ff] flex-shrink-0" />
                    <span className="truncate text-gray-300 group-hover:text-white transition-colors">
                      {email || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all group">
                    <FaPhone className="text-[#00d0cb] flex-shrink-0" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all group">
                    <FiMapPin className="text-[#10B981] flex-shrink-0" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {location || 'Not provided'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3 mb-6">
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white hover:shadow-lg transition-all"
                  >
                    <FaLinkedin size={16} />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] flex items-center justify-center text-white hover:shadow-lg transition-all"
                  >
                    <FaFacebook size={16} />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#00d0cb] flex items-center justify-center text-white hover:shadow-lg transition-all"
                  >
                    <FaInstagram size={16} />
                  </motion.a>
                </div>

                {/* Stats Preview */}
                <div className="w-full mt-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <FiActivity className="text-[#10B981]" /> Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">89%</div>
                      <div className="text-xs text-gray-400">Pass Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">8.7m/s</div>
                      <div className="text-xs text-gray-400">Sprint Speed</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Detailed Sections */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* About Section */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 md:p-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                <FaGlobe className="text-[#10B981]" />
                About & Bio
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Player Bio</label>
                <div className="w-full p-4 border border-gray-700/50 rounded-xl bg-gray-800/30 text-gray-300 leading-relaxed">
                  {bio || 'Professional football player with dedication to excellence and continuous improvement. Focused on technical mastery and tactical awareness.'}
                </div>
              </div>
            </motion.div>

            {/* Playing Philosophy */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 md:p-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                <FiTarget className="text-yellow-400" />
                Playing Philosophy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="bg-gray-800/30 p-4 rounded-xl border border-[#4fb0ff]/30">
                  <label className="block text-sm font-medium text-[#80a8ff] mb-3 flex items-center gap-2">
                    <FaRunning className="text-[#4fb0ff]" /> Personal Development
                  </label>
                  <div className="text-sm p-3 bg-gray-800/50 rounded-lg border border-[#4fb0ff]/20 text-gray-300">
                    {philosophy?.development || 'Focus on continuous improvement through disciplined training, technical refinement, and physical conditioning.'}
                  </div>
                </div>
                
                <div className="bg-gray-800/30 p-4 rounded-xl border border-[#00d0cb]/30">
                  <label className="block text-sm font-medium text-[#80a8ff] mb-3 flex items-center gap-2">
                    <FaFutbol className="text-[#00d0cb]" /> Playing Style
                  </label>
                  <div className="text-sm p-3 bg-gray-800/50 rounded-lg border border-[#00d0cb]/20 text-gray-300">
                    {philosophy?.tactical || 'Dynamic attacking player with strong positional awareness, creative vision, and clinical finishing ability.'}
                  </div>
                </div>
                
                <div className="bg-gray-800/30 p-4 rounded-xl border border-[#902bd1]/30">
                  <label className="block text-sm font-medium text-[#d9b8ff] mb-3 flex items-center gap-2">
                    <FaHeartbeat className="text-[#902bd1]" /> Mental Approach
                  </label>
                  <div className="text-sm p-3 bg-gray-800/50 rounded-lg border border-[#902bd1]/20 text-gray-300">
                    {philosophy?.mental || 'Maintain composure under pressure, stay focused throughout the match, and demonstrate strong leadership on the field.'}
                  </div>
                </div>
                
                <div className="bg-gray-800/30 p-4 rounded-xl border border-[#10B981]/30">
                  <label className="block text-sm font-medium text-[#34D399] mb-3 flex items-center gap-2">
                    <FaUsers className="text-[#10B981]" /> Team Values
                  </label>
                  <div className="text-sm p-3 bg-gray-800/50 rounded-lg border border-[#10B981]/20 text-gray-300">
                    {philosophy?.culture || 'Commitment to team success, strong communication, mutual respect, and collective responsibility on and off the field.'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Experience */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 md:p-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                <FaCalendarAlt className="text-[#4fb0ff]" />
                Playing Experience
              </h2>
              <div className="space-y-4 md:space-y-5">
                {experiences && experiences.length > 0 ? experiences.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    className="flex gap-3 md:gap-4 pb-4 border-b border-gray-700/50 group last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white">
                      <FaUsers size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <h4 className="font-bold text-lg text-white">{exp.role || 'Player'}</h4>
                        <span className="text-sm text-gray-400">{exp.period || 'Present'}</span>
                      </div>
                      <div className="text-[#00d0cb] font-medium text-sm md:text-base">{exp.club || 'Professional Club'}</div>
                      {exp.description && (
                        <p className="text-gray-300 mt-2 text-sm md:text-base">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg">No experience records available</div>
                    <p className="text-gray-500 text-sm mt-2">Playing experience will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Certifications */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 md:p-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                <FiAward className="text-yellow-400" />
                Certifications & Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {certifications && certifications.length > 0 ? certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    className="flex gap-3 p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#00d0cb] flex items-center justify-center text-white">
                      <FaTrophy size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm md:text-base">{cert.name || 'Achievement'}</h4>
                      <div className="text-gray-400 text-xs md:text-sm mt-1">Year: {cert.year || 'Current'}</div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-gray-400 text-lg">No certifications available</div>
                    <p className="text-gray-500 text-sm mt-2">Achievements and certifications will appear here</p>
                  </div>
                )}
                
                {/* Default Achievements */}
                {(!certifications || certifications.length === 0) && (
                  <>
                    <div className="flex gap-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-[#D97706] flex items-center justify-center text-white">
                        <FaMedal size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Player of the Month</h4>
                        <div className="text-gray-400 text-sm mt-1">May 2024</div>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] flex items-center justify-center text-white">
                        <FiTrendingUp size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Top Scorer</h4>
                        <div className="text-gray-400 text-sm mt-1">Season 2023-24</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Training Methodology */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 md:p-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                <FaChartLine className="text-[#10B981]" />
                Training Approach
              </h2>
              <div className="space-y-4 md:space-y-5">
                {methodology && methodology.length > 0 ? methodology.map((method, index) => (
                  <div key={index} className="flex gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white mt-1 text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Training Method {index + 1}
                      </label>
                      <div className="w-full p-3 border border-gray-700/50 rounded-xl bg-gray-800/30 text-gray-300 text-sm md:text-base">
                        {method || 'Advanced training methodology focused on performance optimization.'}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white mt-1">
                        1
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Technical Training
                        </label>
                        <div className="w-full p-3 border border-gray-700/50 rounded-xl bg-gray-800/30 text-gray-300">
                          Position-specific drills focusing on ball control, passing accuracy, and shooting technique under pressure.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] flex items-center justify-center text-white mt-1">
                        2
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tactical Development
                        </label>
                        <div className="w-full p-3 border border-gray-700/50 rounded-xl bg-gray-800/30 text-gray-300">
                          Video analysis and on-field scenarios to develop game intelligence, decision-making, and spatial awareness.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerProfile;