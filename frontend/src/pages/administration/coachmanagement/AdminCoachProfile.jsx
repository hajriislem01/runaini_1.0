import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin,
  FiAward, FiBriefcase, FiUsers, FiEdit2,
} from 'react-icons/fi';
import {
  FaBrain, FaChartLine, FaTrophy, FaGraduationCap, FaMedal,
} from 'react-icons/fa';
import API from '../../api';

// ─── Cert colour helper (mirrors CoachProfile.js) ─────────────────────────────
const certColor = (cert) => {
  if (!cert) return '#4fb0ff';
  const c = cert.toLowerCase();
  if (c.includes('pro')) return '#f59e0b';
  if (c.includes(' a'))  return '#4fb0ff';
  if (c.includes(' b'))  return '#22c55e';
  if (c.includes(' c'))  return '#a855f7';
  return '#4fb0ff';
};

// ═══════════════════════════════════════════════════════════════════════════════
const AdminCoachProfile = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [coach,     setCoach]     = useState(null);
  const [parsedNotes, setParsedNotes] = useState({
    philosophy: {}, methodology: [], experiences: [], certifications: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const { data } = await API.get(`coaches/${id}/`);
        setCoach(data);
        // Parse notes JSON stored by CoachSettings
        try {
          if (data.coach_profile?.notes) {
            const parsed = JSON.parse(data.coach_profile.notes);
            setParsedNotes({
              philosophy:     parsed.philosophy     || {},
              methodology:    parsed.methodology    || [],
              experiences:    parsed.experiences    || [],
              certifications: parsed.certifications || [],
            });
          }
        } catch { /* malformed notes – silently ignore */ }
      } catch {
        toast.error('Failed to load coach data');
        navigate('/administration/coach-management');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoach();
  }, [id, navigate]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#000 0%,#0a0f2a 45%,#180033 100%)' }}>
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00d0cb]" />
    </div>
  );

  if (!coach) return null;

  const cp = coach.coach_profile || {};

  // Full name: first+last → username → 'Coach'
  const fullName = [coach.first_name, coach.last_name].filter(Boolean).join(' ')
    || coach.username || 'Coach';

  // Animation variants
  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const iV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  const hasPhilosophy    = Object.values(parsedNotes.philosophy).some(v => v);
  const hasMethodology   = parsedNotes.methodology.filter(Boolean).length > 0;
  const hasExperiences   = parsedNotes.experiences.length > 0;
  const hasCertifications = parsedNotes.certifications.length > 0;

  return (
    <motion.div className="min-h-screen text-white p-4 sm:p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
      {/* ══ HERO BANNER ══ */}
      <div className="shadow-xl p-6 md:p-8 mb-6 md:mb-8 relative overflow-hidden border border-gray-700/50" 
           style={{ background: 'var(--main-gradient)', borderRadius: 'var(--dashboard-radius)' }}>
        {/* Decoration blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: 'rgba(255,255,255,.05)' }} />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full" style={{ background: 'rgba(255,255,255,.03)' }} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full">

            {/* Avatar */}
            <div className="relative flex-shrink-0 w-32 h-32 md:w-40 md:h-40">
              <div className="w-full h-full overflow-hidden border-4 shadow-xl"
                style={{ 
                  borderColor: 'rgba(255,255,255,.2)',
                  borderRadius: 'var(--dashboard-radius)'
                }}>
                {cp.photo ? (
                  <img src={cp.photo} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold uppercase"
                       style={{ background: 'rgba(255,255,255,.1)', color: 'var(--header-text-color)' }}>
                    {fullName.charAt(0)}
                  </div>
                )}
              </div>
              {/* Status dot */}
              {cp.status && (
                <div className={`absolute bottom-0 right-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-[#0a0f2a] ${cp.status === 'Active' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,.7)]' : 'bg-red-500'}`} />
              )}
            </div>

            {/* Name & badges */}
            <div className="flex-1 mt-2 md:mt-0">
              {/* Admin label */}
              <p className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: 'var(--header-text-color)', opacity: 0.7 }}>Coach Profile — Admin View</p>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--header-text-color)' }}>{fullName}</h1>
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold"
                  style={{ background: 'var(--header-text-color)', color: '#000', opacity: 0.9, borderRadius: 'var(--dashboard-radius)' }}>
                  <FaMedal style={{ fontSize: 11 }} />COACH
                </span>
              </div>

              {/* Username sub-label */}
              {coach.username && (coach.first_name || coach.last_name) && (
                <p className="text-sm mb-1" style={{ color: 'var(--header-text-color)', opacity: 0.8 }}>@{coach.username}</p>
              )}

              {/* Spec / cert / exp inline badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {cp.specialization && (
                  <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium border"
                    style={{ borderRadius: 'var(--dashboard-radius)', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--header-text-color)' }}>
                    <FiBriefcase size={12} />{cp.specialization}
                  </span>
                )}
                {cp.years_of_experience > 0 && (
                  <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium border"
                    style={{ borderRadius: 'var(--dashboard-radius)', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--header-text-color)' }}>
                    <FiAward size={12} />{cp.years_of_experience} yrs exp
                  </span>
                )}
                {cp.certification && (
                  <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold border"
                    style={{ borderRadius: 'var(--dashboard-radius)', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--header-text-color)' }}>
                    <FaGraduationCap style={{ fontSize: 11 }} />{cp.certification}
                  </span>
                )}
                {cp.status && (
                  <span className={`px-3 py-1 text-sm font-semibold border ${cp.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`} style={{ borderRadius: 'var(--dashboard-radius)' }}>
                    {cp.status}
                  </span>
                )}
              </div>
            </div>
            
            {/* Back button */}
            <div className="flex gap-2 self-center mt-4 md:mt-0">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white shadow-lg flex-shrink-0 transition-all bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]"
                style={{ borderRadius: 'var(--dashboard-radius)' }}>
                <FiArrowLeft size={15} />Go Back
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ── */}
          <motion.div variants={iV} className="space-y-5">

            {/* Contact Info */}
            {(coach.email || coach.phone || cp.address) && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#902bd1,#4fb0ff)' }} />
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {coach.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiMail className="text-[#4fb0ff] flex-shrink-0" size={15} />
                      <span className="text-sm text-gray-300 truncate">{coach.email}</span>
                    </div>
                  )}
                  {coach.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiPhone className="text-[#00d0cb] flex-shrink-0" size={15} />
                      <span className="text-sm text-gray-300">{coach.phone}</span>
                    </div>
                  )}
                  {cp.address && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiMapPin className="text-[#902bd1] flex-shrink-0" size={15} />
                      <span className="text-sm text-gray-300">{cp.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Professional Info */}
            {(cp.specialization || cp.years_of_experience || cp.certification || coach.club) && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#f59e0b,#ef4444)' }} />
                  Professional Info
                </h2>
                <div className="space-y-2">
                  {cp.specialization && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-xs text-gray-500">Specialization</span>
                      <span className="text-sm text-white font-medium">{cp.specialization}</span>
                    </div>
                  )}
                  {cp.years_of_experience > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-xs text-gray-500">Experience</span>
                      <span className="text-sm text-white font-medium">{cp.years_of_experience} years</span>
                    </div>
                  )}
                  {cp.certification && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-xs text-gray-500">Certification</span>
                      <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                        style={{ background: certColor(cp.certification) + '20', color: certColor(cp.certification) }}>
                        {cp.certification}
                      </span>
                    </div>
                  )}
                  {coach.club && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-500">Club</span>
                      <span className="text-sm text-white font-medium">{coach.club}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assigned Groups (New Permissions View) */}
            {coach.groups?.length > 0 && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-[#00d0cb]" />
                  <div className="p-1.5 bg-[#00d0cb]/10 rounded-lg">
                    <FiUsers size={16} className="text-[#00d0cb]" />
                  </div>
                  Assigned Domains
                </h2>
                <div className="space-y-3">
                  {(coach.groups || []).length > 0 ? (
                    (coach.groups || []).map(group => {
                      const subs = (coach.subgroups || []).filter(s => String(s.group) === String(group.id));
                    return (
                      <div key={group.id} className="p-4 rounded-2xl bg-gray-800/40 border border-gray-700/30 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00d0cb]/50" />
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white uppercase tracking-tight">{group.name}</span>
                            {group.full_access ? (
                              <span className="text-[10px] px-2 py-0.5 bg-green-900/20 text-green-400 border border-green-500/20 rounded-full font-black">FULL ACCESS</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 bg-amber-900/20 text-amber-400 border border-amber-500/20 rounded-full font-black">GRANULAR ({subs.length})</span>
                            )}
                          </div>
                          
                          {!group.full_access && subs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {subs.map(s => (
                                <span key={s.id} className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-gray-900/60 text-gray-400 border border-gray-700/50">
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {group.full_access && (
                            <p className="text-[11px] text-gray-500 italic mt-1">This coach manages every subgroup within this unit.</p>
                          )}
                        </div>
                      </div>
                    );
                    })
                  ) : (
                    <div className="text-center py-8 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700/50">
                      <p className="text-xs text-gray-500 uppercase tracking-widest">No active assignments found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bio */}
            {cp.bio && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#4fb0ff,#00d0cb)' }} />
                  About
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">{cp.bio}</p>
              </motion.div>
            )}

            {/* Philosophy */}
            {hasPhilosophy && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <FaBrain className="text-[#00d0cb]" style={{ fontSize: 16 }} />
                  Coaching Philosophy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'development', title: 'Player Development', color: '#4fb0ff' },
                    { key: 'tactical',    title: 'Tactical Approach',  color: '#f59e0b' },
                    { key: 'mental',      title: 'Mental Conditioning',color: '#902bd1' },
                    { key: 'culture',     title: 'Team Culture',       color: '#22c55e' },
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
            {hasMethodology && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <FaChartLine className="text-[#22c55e]" style={{ fontSize: 16 }} />
                  Training Methodology
                </h2>
                <div className="space-y-3">
                  {parsedNotes.methodology.filter(Boolean).map((method, i) => (
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

            {/* Experience + Certifications side-by-side */}
            {(hasExperiences || hasCertifications) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {hasExperiences && (
                  <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <FaTrophy className="text-[#f59e0b]" style={{ fontSize: 16 }} />Experience
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

                {hasCertifications && (
                  <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <FaGraduationCap className="text-[#902bd1]" style={{ fontSize: 16 }} />Certifications
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
                            <div className="text-sm font-semibold" style={{ color: certColor(cert.name) }}>{cert.name}</div>
                            <div className="text-xs text-gray-500">{cert.year}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Empty-state for right column */}
            {!cp.bio && !hasPhilosophy && !hasMethodology && !hasExperiences && !hasCertifications && (
              <motion.div variants={iV}
                className="bg-gray-900/70 rounded-2xl p-12 border border-dashed border-gray-700/50 text-center">
                <FiEdit2 className="mx-auto text-gray-600 mb-4" size={36} />
                <p className="text-white text-base font-medium mb-1">No detailed profile yet</p>
                <p className="text-gray-500 text-sm">
                  This coach hasn't filled in their bio, philosophy, or certifications through Settings.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default AdminCoachProfile;
