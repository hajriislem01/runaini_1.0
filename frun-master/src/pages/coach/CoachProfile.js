import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope, FaPhone, FaUserTie, FaMedal, FaChartLine, FaTrophy,
  FaGraduationCap, FaUsers, FaGlobe, FaBrain
} from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const CoachProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [parsedNotes, setParsedNotes] = useState({
    philosophy: {},
    methodology: [],
    experiences: [],
    certifications: []
  });

  // ✅ Fetch depuis l'API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('coachprofile/');
        const data = response.data;
        setProfile(data);

        // Parse notes (JSON)
        try {
          if (data.notes) {
            const parsed = JSON.parse(data.notes);
            setParsedNotes({
              philosophy: parsed.philosophy || {},
              methodology: parsed.methodology || [],
              experiences: parsed.experiences || [],
              certifications: parsed.certifications || []
            });
          }
        } catch (e) {}

      } catch (error) {
        toast.error('Failed to load coach profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00d0cb]"></div>
      </div>
    );
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() || profile.username : 'Coach';

  return (
    <motion.div
      className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Coach Profile
          </h1>
          <p className="text-xl text-gray-300 mt-3">Professional overview & performance metrics</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
              <div className="flex flex-col items-center">

                {/* Avatar */}
                <div className="relative mb-6">
                  <motion.div whileHover={{ scale: 1.05 }}
                    className="w-40 h-40 rounded-full bg-gradient-to-br from-[#4fb0ff] to-[#902bd1] flex items-center justify-center text-6xl text-white font-bold border-4 border-[#00d0cb]/50 shadow-2xl">
                    {fullName?.charAt(0) || 'C'}
                  </motion.div>
                  <span className="absolute -bottom-3 -right-3 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <FaMedal className="text-lg" />COACH
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                  {fullName}
                </h2>
                {profile?.specialization && (
                  <div className="text-[#902bd1] font-medium mb-2 text-lg">{profile.specialization}</div>
                )}
                {profile?.years_of_experience && (
                  <div className="text-gray-400 text-sm mb-6">{profile.years_of_experience} years of experience</div>
                )}

                {/* Contact */}
                <div className="w-full space-y-3 mb-6">
                  {profile?.email && (
                    <div className="flex items-center gap-4 p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#4fb0ff]/60 transition-colors">
                      <FaEnvelope className="text-[#4fb0ff] text-xl flex-shrink-0" />
                      <span className="truncate text-sm">{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-4 p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#00d0cb]/60 transition-colors">
                      <FaPhone className="text-[#00d0cb] text-xl flex-shrink-0" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center gap-4 p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#902bd1]/60 transition-colors">
                      <FaGlobe className="text-[#902bd1] text-xl flex-shrink-0" />
                      <span className="text-sm">{profile.address}</span>
                    </div>
                  )}
                  {profile?.certification && (
                    <div className="flex items-center gap-4 p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-yellow-400/60 transition-colors">
                      <FaTrophy className="text-yellow-400 text-xl flex-shrink-0" />
                      <span className="text-sm">{profile.certification}</span>
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/coach/settings')}
                  className="w-full px-4 py-3 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #902bd1, #4fb0ff)' }}>
                  <FiEdit2 />Edit Profile
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Coaching Philosophy */}
            {Object.values(parsedNotes.philosophy).some(v => v) && (
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
                      { key: 'development', title: 'Player Development', color: '#4fb0ff' },
                      { key: 'tactical', title: 'Tactical Approach', color: '#00d0cb' },
                      { key: 'mental', title: 'Mental Conditioning', color: '#902bd1' },
                      { key: 'culture', title: 'Team Culture', color: '#22c55e' },
                    ].filter(item => parsedNotes.philosophy[item.key]).map((item, i) => (
                      <motion.div key={i} whileHover={{ y: -4 }}
                        className="p-5 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all">
                        <h4 className="font-bold text-lg mb-3" style={{ color: item.color }}>{item.title}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{parsedNotes.philosophy[item.key]}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Training Methodology */}
            {parsedNotes.methodology.filter(m => m).length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                    <FaChartLine className="text-[#10B981]" />
                    <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                      Training Methodology
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {parsedNotes.methodology.filter(m => m).map((method, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-gray-900/65 rounded-xl border border-gray-700/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white flex-shrink-0 text-sm font-bold">
                          {i + 1}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{method}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Experience & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Experience */}
              {parsedNotes.experiences.length > 0 && (
                <motion.section variants={itemVariants}>
                  <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 h-full">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <FaTrophy className="text-[#4fb0ff]" />
                      <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                        Experience
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {parsedNotes.experiences.map((exp, i) => (
                        <motion.div key={i} whileHover={{ x: 4 }}
                          className="p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#00d0cb]/60 transition-colors">
                          <div className="font-semibold text-lg">{exp.role}</div>
                          <div className="text-[#00d0cb] text-sm">{exp.club}</div>
                          <div className="text-sm text-gray-400">{exp.period}</div>
                          {exp.description && <div className="text-gray-300 text-xs mt-1">{exp.description}</div>}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Certifications */}
              {parsedNotes.certifications.length > 0 && (
                <motion.section variants={itemVariants}>
                  <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 h-full">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <FaGraduationCap className="text-[#902bd1]" />
                      <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                        Certifications
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {parsedNotes.certifications.map((cert, i) => (
                        <motion.div key={i} whileHover={{ x: 4 }}
                          className="p-4 bg-gray-900/65 rounded-xl border border-gray-700/50 hover:border-[#902bd1]/60 transition-colors">
                          <div className="font-semibold text-lg">{cert.name}</div>
                          <div className="text-sm text-gray-400">Year: {cert.year}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}
            </div>

            {/* Empty state si aucune donnée */}
            {!Object.values(parsedNotes.philosophy).some(v => v) &&
             parsedNotes.experiences.length === 0 &&
             parsedNotes.certifications.length === 0 && (
              <motion.div variants={itemVariants}
                className="bg-gray-900/70 rounded-2xl p-12 border border-gray-700/50 text-center">
                <FaUserTie className="mx-auto text-5xl text-gray-500 mb-4" />
                <p className="text-gray-300 text-xl mb-2">Your profile is incomplete</p>
                <p className="text-gray-400 mb-6">Add your philosophy, experience and certifications</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/coach/settings')}
                  className="px-6 py-3 text-white font-medium rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #902bd1, #4fb0ff)' }}>
                  Complete Profile
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachProfile;