import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import { 
  FaEnvelope, 
  FaPhone, 
  FaUser, 
  FaMedal, 
  FaLinkedin, 
  FaFacebook, 
  FaInstagram, 
  FaChartLine, 
  FaTrophy, 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaUsers, 
  FaGlobe,
  FaSave, 
  FaPlus, 
  FaTrash, 
  FaUpload,
  FaFutbol,
  FaHeartbeat,
  FaRunning
} from 'react-icons/fa';
import { 
  FiSave, 
  FiUpload, 
  FiTarget, 
  FiTrendingUp, 
  FiActivity,
  FiMapPin,
  FiUserCheck,
  FiAward,
  FiEdit3
} from 'react-icons/fi';

const PlayerSettings = () => {
  const { player, updatePlayer } = usePlayer();
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    philosophy: {
      development: '',
      tactical: '',
      mental: '',
      culture: ''
    },
    methodology: ['', '', '']
  });
  
  // State for experiences
  const [experiences, setExperiences] = useState([]);
  const [newExperience, setNewExperience] = useState({
    role: '',
    club: '',
    period: '',
    description: ''
  });
  
  // State for certifications
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState({
    name: '',
    year: ''
  });
  
  // State for profile picture
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  
  // Initialize form with player data
  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        email: player.email || '',
        phone: player.phone || '',
        location: player.location || 'Barcelona, Spain',
        bio: player.bio || '',
        philosophy: player.philosophy || {
          development: 'Always strive to improve and learn from every session.',
          tactical: 'Play smart, keep possession, and exploit spaces.',
          mental: 'Stay positive and resilient, even under pressure.',
          culture: 'Support teammates and build a winning spirit.'
        },
        methodology: player.methodology || [
          'Daily technical drills and ball mastery.',
          'Tactical video analysis and match review.',
          'Strength and conditioning routines.'
        ]
      });
      
      setExperiences(player.experiences || []);
      setCertifications(player.certifications || []);
      setProfilePreview(player.profilePicture || '');
    }
  }, [player]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle philosophy input changes
  const handlePhilosophyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      philosophy: {
        ...prev.philosophy,
        [name]: value
      }
    }));
  };
  
  // Handle methodology input changes
  const handleMethodologyChange = (index, value) => {
    setFormData(prev => {
      const updatedMethodology = [...prev.methodology];
      updatedMethodology[index] = value;
      return { ...prev, methodology: updatedMethodology };
    });
  };
  
  // Handle experience input changes
  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setNewExperience(prev => ({ ...prev, [name]: value }));
  };
  
  // Add new experience
  const addExperience = () => {
    if (newExperience.role && newExperience.club && newExperience.period) {
      setExperiences(prev => [...prev, newExperience]);
      setNewExperience({
        role: '',
        club: '',
        period: '',
        description: ''
      });
    }
  };
  
  // Remove experience
  const removeExperience = (index) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle certification input changes
  const handleCertificationChange = (e) => {
    const { name, value } = e.target;
    setNewCertification(prev => ({ ...prev, [name]: value }));
  };
  
  // Add new certification
  const addCertification = () => {
    if (newCertification.name && newCertification.year) {
      setCertifications(prev => [...prev, newCertification]);
      setNewCertification({ name: '', year: '' });
    }
  };
  
  // Remove certification
  const removeCertification = (index) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle profile picture upload
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare updated player data
    const updatedPlayer = {
      ...player,
      ...formData,
      experiences,
      certifications,
      profilePicture: profilePreview
    };
    
    // Update player in context and localStorage
    updatePlayer(updatedPlayer);
    
    // Show success message
    alert('Profile updated successfully!');
  };

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
            Player Settings
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mt-3">Manage your player profile information</p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] mx-auto mt-4 rounded-full"></div>
        </motion.div>
        
        <motion.form 
          variants={itemVariants}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8">
              {/* Profile Picture Card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-5 md:mb-6 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                  <FaUser className="text-[#4fb0ff]" />
                  Profile Information
                </h2>
                
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-5 md:mb-6">
                  <div className="relative mb-4 md:mb-5">
                    {profilePreview ? (
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={profilePreview}
                        alt="Profile"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#00d0cb]/60 shadow-xl"
                      />
                    ) : (
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#4fb0ff] to-[#902bd1] flex items-center justify-center text-4xl md:text-6xl text-white font-bold border-4 border-[#00d0cb]/50 shadow-xl"
                      >
                        {formData.name[0] || 'P'}
                      </motion.div>
                    )}
                    <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center text-xs md:text-sm font-bold shadow-lg cursor-pointer">
                      <FiUpload className="mr-1.5 md:mr-2" />
                      Change
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleProfileUpload}
                      />
                    </label>
                  </div>
                  
                  <div className="text-center text-xs md:text-sm text-gray-400 mb-4">
                    JPG, PNG or GIF (Max 5MB)
                  </div>
                </div>
                
                {/* Personal Info Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Social Links</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <FaLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4fb0ff]" />
                        <input
                          type="url"
                          placeholder="LinkedIn URL"
                          className="w-full pl-10 pr-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 text-sm"
                        />
                      </div>
                      <div className="relative flex-1">
                        <FaInstagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#902bd1]" />
                        <input
                          type="url"
                          placeholder="Instagram URL"
                          className="w-full pl-10 pr-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 text-sm"
                        />
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
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                  <FiEdit3 className="text-[#10B981]" />
                  About & Bio
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Player Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                    placeholder="Describe your playing background, skills, and achievements..."
                  ></textarea>
                </div>
              </motion.div>
              
              {/* Playing Philosophy */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
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
                    <textarea
                      name="development"
                      value={formData.philosophy.development}
                      onChange={handlePhilosophyChange}
                      rows={3}
                      className="w-full text-sm p-3 bg-gray-800/65 rounded-xl border border-[#4fb0ff]/20 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#4fb0ff]"
                    ></textarea>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-xl border border-[#00d0cb]/30">
                    <label className="block text-sm font-medium text-[#80a8ff] mb-3 flex items-center gap-2">
                      <FaFutbol className="text-[#00d0cb]" /> Playing Style
                    </label>
                    <textarea
                      name="tactical"
                      value={formData.philosophy.tactical}
                      onChange={handlePhilosophyChange}
                      rows={3}
                      className="w-full text-sm p-3 bg-gray-800/65 rounded-xl border border-[#00d0cb]/20 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00d0cb]"
                    ></textarea>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-xl border border-[#902bd1]/30">
                    <label className="block text-sm font-medium text-[#d9b8ff] mb-3 flex items-center gap-2">
                      <FaHeartbeat className="text-[#902bd1]" /> Mental Approach
                    </label>
                    <textarea
                      name="mental"
                      value={formData.philosophy.mental}
                      onChange={handlePhilosophyChange}
                      rows={3}
                      className="w-full text-sm p-3 bg-gray-800/65 rounded-xl border border-[#902bd1]/20 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#902bd1]"
                    ></textarea>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-xl border border-[#10B981]/30">
                    <label className="block text-sm font-medium text-[#34D399] mb-3 flex items-center gap-2">
                      <FaUsers className="text-[#10B981]" /> Team Values
                    </label>
                    <textarea
                      name="culture"
                      value={formData.philosophy.culture}
                      onChange={handlePhilosophyChange}
                      rows={3}
                      className="w-full text-sm p-3 bg-gray-800/65 rounded-xl border border-[#10B981]/20 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                    ></textarea>
                  </div>
                </div>
              </motion.div>
              
              {/* Experience */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                  <FaCalendarAlt className="text-[#4fb0ff]" />
                  Playing Experience
                </h2>
                
                {/* Experience List */}
                <div className="space-y-4 md:space-y-5 mb-5 md:mb-6">
                  {experiences.map((exp, index) => (
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
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-lg">{exp.role}</h4>
                            <div className="text-[#00d0cb] font-medium text-sm md:text-base">{exp.club}</div>
                            <div className="text-gray-400 text-sm mt-1">{exp.period}</div>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-red-400 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-900/30 rounded-lg"
                          >
                            <FaTrash size={14} />
                          </motion.button>
                        </div>
                        {exp.description && (
                          <p className="text-gray-300 mt-2 text-sm md:text-base">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Add Experience Form */}
                <div className="border-t border-gray-700/50 pt-5 md:pt-6">
                  <h3 className="text-lg font-semibold text-white mb-3 md:mb-4">Add New Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Position/Role</label>
                      <input
                        type="text"
                        name="role"
                        value={newExperience.role}
                        onChange={handleExperienceChange}
                        className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400"
                        placeholder="Midfielder"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Club/Team</label>
                      <input
                        type="text"
                        name="club"
                        value={newExperience.club}
                        onChange={handleExperienceChange}
                        className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400"
                        placeholder="Barcelona Youth"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
                      <input
                        type="text"
                        name="period"
                        value={newExperience.period}
                        onChange={handleExperienceChange}
                        className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400"
                        placeholder="2022-2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <input
                        type="text"
                        name="description"
                        value={newExperience.description}
                        onChange={handleExperienceChange}
                        className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400"
                        placeholder="Key achievements"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={addExperience}
                    className="mt-4 md:mt-5 flex items-center gap-2 text-white bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base"
                  >
                    <FaPlus /> Add Experience
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Certifications */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                  <FiAward className="text-yellow-400" />
                  Certifications & Achievements
                </h2>
                
                {/* Certifications List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-5 md:mb-6">
                  {certifications.map((cert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="flex gap-3 p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 group relative"
                    >
                      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#00d0cb] flex items-center justify-center text-white">
                        <FaTrophy size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm md:text-base">{cert.name}</h4>
                            <div className="text-gray-400 text-xs md:text-sm mt-1">Year: {cert.year}</div>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="text-red-400 opacity-0 group-hover:opacity-100 transition absolute top-2 right-2 p-2 hover:bg-red-900/30 rounded-lg"
                          >
                            <FaTrash size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Add Certification Form */}
                <div className="border-t border-gray-700/50 pt-5 md:pt-6">
                  <h3 className="text-lg font-semibold text-white mb-3 md:mb-4">Add New Certification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Certification Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newCertification.name}
                        onChange={handleCertificationChange}
                        className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400"
                        placeholder="UEFA Youth Training"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Year Obtained</label>
                      <input
                        type="text"
                        name="year"
                        value={newCertification.year}
                        onChange={handleCertificationChange}
                        className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400"
                        placeholder="2023"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={addCertification}
                    className="mt-4 md:mt-5 flex items-center gap-2 text-white bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base"
                  >
                    <FaPlus /> Add Certification
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Training Methodology */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pb-3 border-b border-gray-700/50 flex items-center gap-3">
                  <FaChartLine className="text-[#10B981]" />
                  Training Approach
                </h2>
                <div className="space-y-4 md:space-y-5">
                  {formData.methodology.map((method, index) => (
                    <div key={index} className="flex gap-3 md:gap-4">
                      <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white mt-1 text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Training Method {index + 1}
                        </label>
                        <textarea
                          value={method}
                          onChange={(e) => handleMethodologyChange(index, e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent text-sm md:text-base"
                          placeholder="Describe your training approach..."
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {/* Submit Button */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
              >
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6">
                  <div className="text-gray-400 text-xs md:text-sm text-center sm:text-left">
                    * All changes are automatically saved to your profile
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold flex items-center gap-2 md:gap-3 text-base md:text-lg transition-all shadow-lg"
                  >
                    <FiSave className="text-lg md:text-xl" /> Save All Changes
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default PlayerSettings;