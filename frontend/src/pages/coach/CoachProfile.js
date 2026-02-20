import React from 'react';
import { useCoach } from '../../context/CoachContext';
import { motion } from 'framer-motion';
import { 
  FaEnvelope, FaPhone, FaUserTie, FaMedal, FaLinkedin, 
  FaFacebook, FaInstagram, FaChartLine, FaTrophy, 
  FaGraduationCap, FaCalendarAlt, FaUsers, FaGlobe, FaBrain
} from 'react-icons/fa';

const CoachProfile = () => {
  const { coach } = useCoach();

  // Sample data - replace with actual data from your context
  const stats = {
    winRate: 78,
    sessions: 245,
    players: 32
  };

  const experiences = [
    { id: 1, role: "Head Coach", club: "FC Barcelona", period: "2018-2021" },
    { id: 2, role: "Assistant Coach", club: "Real Madrid", period: "2015-2018" },
    { id: 3, role: "Youth Coach", club: "Atletico Madrid", period: "2012-2015" }
  ];

  const certifications = [
    { id: 1, name: "UEFA Pro License", year: "2018" },
    { id: 2, name: "FIFA Technical Director", year: "2016" },
    { id: 3, name: "Sports Science Diploma", year: "2014" }
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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Coach Profile
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            Professional overview & performance metrics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transition-all duration-300 hover:border-gray-600">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {coach.profilePicture ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={coach.profilePicture}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-[#00d0cb]/60 shadow-2xl"
                    />
                  ) : (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-40 h-40 rounded-full bg-gradient-to-br from-[#4fb0ff] to-[#902bd1] flex items-center justify-center text-6xl text-white font-bold border-4 border-[#00d0cb]/50"
                    >
                      {coach.name?.[0] || 'C'}
                    </motion.div>
                  )}
                  <span className="absolute -bottom-3 -right-3 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <FaMedal className="text-lg" /> PRO
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                  {coach.name || 'Coach Name'}
                </h2>

                <div className="text-[#902bd1] font-medium mb-6 text-lg">Senior Football Coach</div>

                <div className="w-full space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#4fb0ff]/60 transition-colors">
                    <FaEnvelope className="text-[#4fb0ff] text-xl" />
                    <span className="truncate">{coach.email || 'coach@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#00d0cb]/60 transition-colors">
                    <FaPhone className="text-[#00d0cb] text-xl" />
                    <span>{coach.phone || '+1234567890'}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#902bd1]/60 transition-colors">
                    <FaGlobe className="text-[#902bd1] text-xl" />
                    <span>Madrid, Spain</span>
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  {[
                    { Icon: FaLinkedin, color: '#4fb0ff' },
                    { Icon: FaFacebook, color: '#00d0cb' },
                    { Icon: FaInstagram, color: '#902bd1' }
                  ].map(({ Icon, color }, i) => (
                    <motion.a
                      key={i}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
                      style={{ background: color }}
                    >
                      <Icon size={20} />
                    </motion.a>
                  ))}
                </div>

                <div className="w-full">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <FaChartLine className="text-[#4fb0ff]" /> Performance Stats
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: `${stats.winRate}%`, label: 'Win Rate', color: '#4fb0ff' },
                      { value: stats.sessions, label: 'Sessions', color: '#00d0cb' },
                      { value: stats.players, label: 'Players', color: '#902bd1' }
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gray-900/65 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/50 transition-all"
                      >
                        <div className="text-2xl font-bold" style={{ color: stat.color }}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Detailed Sections */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section variants={itemVariants}>
              <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FaUserTie className="text-[#4fb0ff]" />
                  <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                    Professional Profile
                  </span>
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  {coach.bio || 
                  "Dedicated football coach with 12+ years of experience in professional football academies. Specialized in youth development and tactical training. UEFA Pro License holder with a proven track record of developing players for professional leagues. Passionate about implementing modern training methodologies and data-driven approaches to maximize player potential."}
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FaBrain className="text-[#00d0cb]" />
                  <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                    Coaching Philosophy
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { title: "Player Development", text: "Focus on individual growth through personalized training programs and continuous feedback.", color: '#4fb0ff' },
                    { title: "Tactical Approach", text: "Implement modern possession-based systems with high pressing and quick transitions.", color: '#00d0cb' },
                    { title: "Mental Conditioning", text: "Build resilience and competitive mindset through psychological training techniques.", color: '#902bd1' },
                    { title: "Team Culture", text: "Foster leadership, accountability and strong team cohesion through group activities.", color: '#4fb0ff' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4 }}
                      className="p-5 bg-gray-900/65 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all"
                    >
                      <h4 className="font-bold text-lg mb-3" style={{ color: item.color }}>
                        {item.title}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Experience Section */}
              <motion.section variants={itemVariants}>
                <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 h-full">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <FaTrophy className="text-[#4fb0ff]" />
                    <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                      Experience
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {experiences.map((exp, i) => (
                      <motion.div
                        key={exp.id}
                        whileHover={{ x: 4 }}
                        className="p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#00d0cb]/60 transition-colors"
                      >
                        <div className="font-semibold text-lg">{exp.role}</div>
                        <div className="text-gray-300">{exp.club}</div>
                        <div className="text-sm text-gray-400">{exp.period}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* Certifications Section */}
              <motion.section variants={itemVariants}>
                <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 h-full">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <FaGraduationCap className="text-[#902bd1]" />
                    <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                      Certifications
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {certifications.map((cert, i) => (
                      <motion.div
                        key={cert.id}
                        whileHover={{ x: 4 }}
                        className="p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#902bd1]/60 transition-colors"
                      >
                        <div className="font-semibold text-lg">{cert.name}</div>
                        <div className="text-sm text-gray-400">Year: {cert.year}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachProfile;