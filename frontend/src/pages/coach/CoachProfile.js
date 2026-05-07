import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAcademyData } from '../../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail, FiPhone, FiMapPin, FiEdit2, FiCamera,
  FiSave, FiX, FiCheck, FiCalendar, FiUsers,
  FiActivity, FiAward, FiChevronRight,
} from 'react-icons/fi';
import {
  FaBrain, FaChartLine, FaTrophy, FaGraduationCap,
  FaMedal, FaStar,
} from 'react-icons/fa';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CERT_LEVELS = ['UEFA Pro', 'UEFA A', 'UEFA B', 'UEFA C', 'CAF A', 'CAF B'];

const certColor = (cert) => {
  if (!cert) return '#4fb0ff';
  const c = cert.toLowerCase();
  if (c.includes('pro')) return '#f59e0b';
  if (c.includes(' a')) return '#4fb0ff';
  if (c.includes(' b')) return '#22c55e';
  if (c.includes(' c')) return '#a855f7';
  return '#4fb0ff';
};

// ═══════════════════════════════════════════════════════════════════════════════
const CoachProfile = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { academyData } = useAcademyData();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [parsedNotes, setParsedNotes] = useState({
    philosophy: {}, methodology: [], experiences: [], certifications: [],
  });

  // ── Stats from API ────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    players: 0, groups: 0, sessions: 0, reports: 0,
  });

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [profileRes, playersRes, groupsRes, sessionsRes, reportsRes] = await Promise.all([
        API.get('coachprofile/'),
        API.get('players/'),
        API.get('groups/'),
        API.get('trainings/').catch(() => ({ data: [] })),
        API.get(`reports/?month=${format(new Date(), 'yyyy-MM')}`).catch(() => ({ data: [] })),
      ]);

      const data = profileRes.data;
      setProfile(data);

      // Parse notes JSON
      try {
        if (data.notes) {
          const parsed = JSON.parse(data.notes);
          setParsedNotes({
            philosophy: parsed.philosophy || {},
            methodology: parsed.methodology || [],
            experiences: parsed.experiences || [],
            certifications: parsed.certifications || [],
          });
        }
      } catch { }

      setStats({
        players: playersRes.data.length,
        groups: groupsRes.data.length,
        sessions: sessionsRes.data.length,
        reports: reportsRes.data.length,
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Coach'
    : '...';

  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const iV = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#000 0%,#0a0f2a 45%,#180033 100%)' }}>
      <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#00d0cb]" />
    </div>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <motion.div className="min-h-screen text-white p-4 sm:p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* ══════════════════════════════════════════════
            HERO BANNER
        ══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shadow-xl p-6 md:p-8 mb-6 md:mb-8 relative overflow-hidden border border-gray-700/50"
          style={{
            background: 'var(--main-gradient)',
            borderRadius: 'var(--dashboard-radius)'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -m-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -m-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 overflow-hidden border-4 border-white/20 shadow-xl flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--dashboard-radius)'
              }}
            >
              {profile?.photo ? (
                <img src={profile.photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg px-4 text-center">
                  {fullName?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--header-text-color)' }}>{fullName}</h1>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'var(--header-text-color)' }}>
                      <FaMedal style={{ fontSize: 11 }} />COACH
                    </span>
                  </div>
                  {profile?.specialization && (
                    <p className="mt-1 md:mt-2" style={{ color: 'var(--header-text-color)', opacity: 0.8 }}>
                      {profile.specialization}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 self-center">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white shadow-lg border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
                    style={{ borderRadius: 'var(--dashboard-radius)' }}>
                    Go Back
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/coach/settings')}
                    className="px-4 py-2.5 text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]"
                    style={{ borderRadius: 'var(--dashboard-radius)' }}>
                    <FiEdit2 />Edit Profile
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                {profile?.years_of_experience && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white border border-white/20">
                    <FiAward /><span className="text-sm">{profile.years_of_experience} years experience</span>
                  </div>
                )}
                {profile?.certification && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white border border-white/20">
                    <FaGraduationCap /><span className="text-sm">{profile.certification}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════
            CONTENT
        ══════════════════════════════════════════════ */}
        <div>

        {/* ── Stats ── */}
        <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Players managed', value: stats.players, color: '#4fb0ff', icon: <FiUsers size={18} /> },
            { label: 'Groups', value: stats.groups, color: '#00d0cb', icon: <FiUsers size={18} /> },
            { label: 'Sessions created', value: stats.sessions, color: '#902bd1', icon: <FiCalendar size={18} /> },
            { label: 'Reports this month', value: stats.reports, color: '#22c55e', icon: <FiActivity size={18} /> },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.color + '20', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══ LEFT COLUMN ══ */}
          <motion.div variants={iV} className="space-y-5">

            {/* Contact info */}
            {(profile?.email || profile?.phone || profile?.address) && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#902bd1,#4fb0ff)' }} />
                  Contact information
                </h2>

                <div className="space-y-3">
                  {profile?.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiMail className="text-[#4fb0ff] flex-shrink-0" size={15} />
                      <span className="text-sm text-gray-300 truncate">{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiPhone className="text-[#00d0cb] flex-shrink-0" size={15} />
                      <span className="text-sm text-gray-300">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiMapPin className="text-[#902bd1] flex-shrink-0" size={15} />
                      <span className="text-sm text-gray-300">{profile.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Professional info */}
            {(profile?.specialization || profile?.years_of_experience || profile?.certification) && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#f59e0b,#ef4444)' }} />
                  Professional info
                </h2>

                <div className="space-y-3">
                  {profile?.specialization && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-xs text-gray-500">Specialization</span>
                      <span className="text-sm text-white font-medium">{profile.specialization}</span>
                    </div>
                  )}
                  {profile?.years_of_experience && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-xs text-gray-500">Experience</span>
                      <span className="text-sm text-white font-medium">{profile.years_of_experience} years</span>
                    </div>
                  )}
                  {profile?.certification && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-500">Certification</span>
                      <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                        style={{ background: certColor(profile.certification) + '20', color: certColor(profile.certification) }}>
                        {profile.certification}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-[#00d0cb]" />
                Quick access
              </h2>
              <div className="space-y-2">
                {[
                  { label: 'My Players', path: '/coach/players', color: '#4fb0ff' },
                  { label: 'Agenda', path: '/coach/agenda', color: '#00d0cb' },
                  { label: 'KPI Analysis', path: '/coach/analysis', color: '#902bd1' },
                  { label: 'Settings', path: '/coach/settings', color: '#f59e0b' },
                ].map((l, i) => (
                  <button key={i} onClick={() => navigate(l.path)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-700/30 bg-gray-800/30 hover:bg-gray-700/30 transition-all text-sm text-gray-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
                      {l.label}
                    </span>
                    <FiChevronRight size={14} className="text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bio */}
            {profile?.bio && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#4fb0ff,#00d0cb)' }} />
                  About
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">{profile.bio}</p>
              </motion.div>
            )}

            {/* Philosophy */}
            {Object.values(parsedNotes.philosophy).some(v => v) && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <FaBrain className="text-[#00d0cb]" style={{ fontSize: 16 }} />
                  Coaching philosophy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'development', title: 'Player Development', color: '#4fb0ff' },
                    { key: 'tactical', title: 'Tactical Approach', color: '#f59e0b' },
                    { key: 'mental', title: 'Mental Conditioning', color: '#902bd1' },
                    { key: 'culture', title: 'Team Culture', color: '#22c55e' },
                  ].filter(item => parsedNotes.philosophy[item.key]).map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border"
                      style={{ background: item.color + '08', borderColor: item.color + '30' }}>
                      <div className="text-xs font-semibold mb-2 uppercase tracking-wider"
                        style={{ color: item.color }}>{item.title}</div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {parsedNotes.philosophy[item.key]}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Methodology */}
            {parsedNotes.methodology.filter(m => m).length > 0 && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <FaChartLine className="text-[#22c55e]" style={{ fontSize: 16 }} />
                  Training methodology
                </h2>
                <div className="space-y-3">
                  {parsedNotes.methodology.filter(m => m).map((method, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{method}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Experience + Certifications */}
            {(parsedNotes.experiences.length > 0 || parsedNotes.certifications.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {parsedNotes.experiences.length > 0 && (
                  <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <FaTrophy className="text-[#f59e0b]" style={{ fontSize: 16 }} />
                      Experience
                    </h2>
                    <div className="space-y-3">
                      {parsedNotes.experiences.map((exp, i) => (
                        <div key={i} className="relative pl-4 pb-4 last:pb-0">
                          <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#00d0cb]" />
                          {i < parsedNotes.experiences.length - 1 && (
                            <div className="absolute left-0.5 top-3 w-px h-full bg-gray-700/50" style={{ transform: 'translateX(-50%)' }} />
                          )}
                          <div className="text-sm font-semibold text-white">{exp.role}</div>
                          <div className="text-xs text-[#00d0cb]">{exp.club}</div>
                          <div className="text-xs text-gray-500">{exp.period}</div>
                          {exp.description && (
                            <div className="text-xs text-gray-400 mt-1">{exp.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {parsedNotes.certifications.length > 0 && (
                  <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <FaGraduationCap className="text-[#902bd1]" style={{ fontSize: 16 }} />
                      Certifications
                    </h2>
                    <div className="space-y-3">
                      {parsedNotes.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
                          style={{ background: certColor(cert.name) + '08', borderColor: certColor(cert.name) + '25' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: certColor(cert.name) + '20' }}>
                            <FaMedal style={{ fontSize: 14, color: certColor(cert.name) }} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: certColor(cert.name) }}>
                              {cert.name}
                            </div>
                            <div className="text-xs text-gray-500">{cert.year}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default CoachProfile;