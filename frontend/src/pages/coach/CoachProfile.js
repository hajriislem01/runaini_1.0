import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  if (c.includes('pro'))  return '#f59e0b';
  if (c.includes(' a'))   return '#4fb0ff';
  if (c.includes(' b'))   return '#22c55e';
  if (c.includes(' c'))   return '#a855f7';
  return '#4fb0ff';
};

// ═══════════════════════════════════════════════════════════════════════════════
const CoachProfile = () => {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [isLoading,  setIsLoading]  = useState(true);
  const [profile,    setProfile]    = useState(null);
  const [parsedNotes, setParsedNotes] = useState({
    philosophy:{}, methodology:[], experiences:[], certifications:[],
  });

  // ── Stats from API ────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    players:0, groups:0, sessions:0, reports:0,
  });

  // ── Photo ─────────────────────────────────────────────────────────────────
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Edit mode ─────────────────────────────────────────────────────────────
  const [editMode,   setEditMode]   = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);
  const [editForm,   setEditForm]   = useState({
    first_name:'', last_name:'', phone:'', address:'',
    specialization:'', years_of_experience:'', certification:'', bio:'',
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
        API.get('trainings/').catch(()=>({ data:[] })),
        API.get(`reports/?month=${format(new Date(),'yyyy-MM')}`).catch(()=>({ data:[] })),
      ]);

      const data = profileRes.data;
      setProfile(data);
      setPhotoPreview(data.photo || null);
      setEditForm({
        first_name:          data.first_name          || '',
        last_name:           data.last_name           || '',
        phone:               data.phone               || '',
        address:             data.address             || '',
        specialization:      data.specialization      || '',
        years_of_experience: data.years_of_experience || '',
        certification:       data.certification       || '',
        bio:                 data.bio                 || '',
      });

      // Parse notes JSON
      try {
        if (data.notes) {
          const parsed = JSON.parse(data.notes);
          setParsedNotes({
            philosophy:     parsed.philosophy     || {},
            methodology:    parsed.methodology    || [],
            experiences:    parsed.experiences    || [],
            certifications: parsed.certifications || [],
          });
        }
      } catch {}

      setStats({
        players:  playersRes.data.length,
        groups:   groupsRes.data.length,
        sessions: sessionsRes.data.length,
        reports:  reportsRes.data.length,
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Photo handlers ────────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      await API.patch('coachprofile/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo updated ✅');
      setPhotoFile(null);
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await API.patch('coachprofile/', {
        first_name:          editForm.first_name,
        last_name:           editForm.last_name,
        phone:               editForm.phone,
        address:             editForm.address,
        specialization:      editForm.specialization,
        years_of_experience: editForm.years_of_experience || null,
        certification:       editForm.certification,
        bio:                 editForm.bio,
      });
      setProfile(res.data);
      setEditMode(false);
      toast.success('Profile updated ✅');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const fullName = profile
    ? `${profile.first_name||''} ${profile.last_name||''}`.trim() || profile.username || 'Coach'
    : '...';

  const cV = { hidden:{ opacity:0 }, visible:{ opacity:1, transition:{ staggerChildren:0.08 } } };
  const iV = { hidden:{ y:16, opacity:0 }, visible:{ y:0, opacity:1 } };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(135deg,#000 0%,#0a0f2a 45%,#180033 100%)' }}>
      <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#00d0cb]"/>
    </div>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <motion.div className="min-h-screen text-white"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right"/>

      {/* ══════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════ */}
      <div className="relative" style={{ background:'linear-gradient(135deg,rgba(144,43,209,.25),rgba(79,176,255,.15))' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
            style={{ background:'rgba(144,43,209,.08)' }}/>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full"
            style={{ background:'rgba(0,208,203,.06)' }}/>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">

            {/* ── Photo ── */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4"
                style={{ borderColor:'rgba(0,208,203,.4)' }}>
                {photoPreview ? (
                  <img src={photoPreview} alt={fullName}
                    className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-5xl font-bold text-white">
                    {fullName?.charAt(0)?.toUpperCase()||'C'}
                  </div>
                )}
              </div>

              {/* Camera button */}
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all"
                style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                <FiCamera size={15}/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={handlePhotoChange}/>

              {/* Upload confirm */}
              <AnimatePresence>
                {photoFile && (
                  <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0 }}
                    className="absolute -bottom-12 left-0 flex gap-2 whitespace-nowrap">
                    <button onClick={uploadPhoto} disabled={uploadingPhoto}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white"
                      style={{ background:'#22c55e' }}>
                      {uploadingPhoto
                        ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"/>
                        : <FiCheck size={11}/>}
                      Save
                    </button>
                    <button onClick={() => { setPhotoFile(null); setPhotoPreview(profile?.photo||null); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-700 text-gray-300">
                      <FiX size={11}/>Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Name & info ── */}
            <div className="flex-1 mt-2">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white">{fullName}</h1>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)', color:'#fff' }}>
                  <FaMedal style={{ fontSize:11 }}/>COACH
                </span>
              </div>
              {profile?.specialization && (
                <div className="text-[#00d0cb] font-medium text-lg mb-1">{profile.specialization}</div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                {profile?.years_of_experience && (
                  <span className="flex items-center gap-1">
                    <FiAward size={13}/>{profile.years_of_experience} years experience
                  </span>
                )}
                {profile?.certification && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    style={{ background:certColor(profile.certification)+'20', color:certColor(profile.certification) }}>
                    <FaGraduationCap style={{ fontSize:11 }}/>{profile.certification}
                  </span>
                )}
              </div>
            </div>

            {/* ── Edit button ── */}
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <button onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-xl text-sm bg-gray-800 text-gray-300 border border-gray-700">
                    Cancel
                  </button>
                  <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background:'linear-gradient(135deg,#22c55e,#14b8a6)' }}>
                    {isSaving
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      : <FiSave size={14}/>}
                    Save changes
                  </motion.button>
                </>
              ) : (
                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  <FiEdit2 size={14}/>Edit Profile
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 py-8">

        {/* ── Stats ── */}
        <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Players managed',   value:stats.players,  color:'#4fb0ff', icon:<FiUsers size={18}/> },
            { label:'Groups',            value:stats.groups,   color:'#00d0cb', icon:<FiUsers size={18}/> },
            { label:'Sessions created',  value:stats.sessions, color:'#902bd1', icon:<FiCalendar size={18}/> },
            { label:'Reports this month',value:stats.reports,  color:'#22c55e', icon:<FiActivity size={18}/> },
          ].map((s,i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:s.color+'20', color:s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color:s.color }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══ LEFT COLUMN ══ */}
          <motion.div variants={iV} className="space-y-5">

            {/* Contact info */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ background:'linear-gradient(#902bd1,#4fb0ff)' }}/>
                Contact information
              </h2>

              {editMode ? (
                <div className="space-y-3">
                  {[
                    { key:'first_name', label:'First name', type:'text', placeholder:'First name' },
                    { key:'last_name',  label:'Last name',  type:'text', placeholder:'Last name'  },
                    { key:'phone',      label:'Phone',      type:'tel',  placeholder:'+216 XX XXX XXX' },
                    { key:'address',    label:'Location',   type:'text', placeholder:'City, Country' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                      <input type={f.type} value={editForm[f.key]}
                        onChange={e => setEditForm(p=>({...p,[f.key]:e.target.value}))}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {profile?.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiMail className="text-[#4fb0ff] flex-shrink-0" size={15}/>
                      <span className="text-sm text-gray-300 truncate">{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiPhone className="text-[#00d0cb] flex-shrink-0" size={15}/>
                      <span className="text-sm text-gray-300">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30">
                      <FiMapPin className="text-[#902bd1] flex-shrink-0" size={15}/>
                      <span className="text-sm text-gray-300">{profile.address}</span>
                    </div>
                  )}
                  {!profile?.email && !profile?.phone && !profile?.address && (
                    <p className="text-sm text-gray-600">No contact info added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Professional info */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ background:'linear-gradient(#f59e0b,#ef4444)' }}/>
                Professional info
              </h2>

              {editMode ? (
                <div className="space-y-3">
                  {[
                    { key:'specialization',      label:'Specialization', placeholder:'e.g. Attacking football' },
                    { key:'years_of_experience', label:'Years of experience', placeholder:'e.g. 8' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                      <input type="text" value={editForm[f.key]}
                        onChange={e => setEditForm(p=>({...p,[f.key]:e.target.value}))}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Certification level</label>
                    <select value={editForm.certification}
                      onChange={e => setEditForm(p=>({...p,certification:e.target.value}))}
                      className="w-full px-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]">
                      <option value="">Select certification</option>
                      {CERT_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
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
                        style={{ background:certColor(profile.certification)+'20', color:certColor(profile.certification) }}>
                        {profile.certification}
                      </span>
                    </div>
                  )}
                  {!profile?.specialization && !profile?.certification && (
                    <p className="text-sm text-gray-600">No professional info added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-[#00d0cb]"/>
                Quick access
              </h2>
              <div className="space-y-2">
                {[
                  { label:'My Players',   path:'/coach/players',  color:'#4fb0ff' },
                  { label:'Agenda',       path:'/coach/agenda',   color:'#00d0cb' },
                  { label:'KPI Analysis', path:'/coach/analysis', color:'#902bd1' },
                  { label:'Settings',     path:'/coach/settings', color:'#f59e0b' },
                ].map((l,i) => (
                  <button key={i} onClick={() => navigate(l.path)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-700/30 bg-gray-800/30 hover:bg-gray-700/30 transition-all text-sm text-gray-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background:l.color }}/>
                      {l.label}
                    </span>
                    <FiChevronRight size={14} className="text-gray-600"/>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bio */}
            <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ background:'linear-gradient(#4fb0ff,#00d0cb)' }}/>
                About
              </h2>
              {editMode ? (
                <textarea value={editForm.bio}
                  onChange={e => setEditForm(p=>({...p,bio:e.target.value}))}
                  rows={4} placeholder="Write a short bio — your coaching philosophy in a few sentences..."
                  className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none"/>
              ) : profile?.bio ? (
                <p className="text-gray-300 leading-relaxed text-sm">{profile.bio}</p>
              ) : (
                <p className="text-gray-600 text-sm">
                  No bio added yet.{' '}
                  <button onClick={() => setEditMode(true)} className="text-[#4fb0ff] underline">
                    Add a short description
                  </button>
                </p>
              )}
            </motion.div>

            {/* Philosophy */}
            {Object.values(parsedNotes.philosophy).some(v=>v) && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <FaBrain className="text-[#00d0cb]" style={{ fontSize:16 }}/>
                  Coaching philosophy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key:'development', title:'Player Development', color:'#4fb0ff' },
                    { key:'tactical',    title:'Tactical Approach',  color:'#f59e0b' },
                    { key:'mental',      title:'Mental Conditioning',color:'#902bd1' },
                    { key:'culture',     title:'Team Culture',       color:'#22c55e' },
                  ].filter(item => parsedNotes.philosophy[item.key]).map((item,i) => (
                    <div key={i} className="p-4 rounded-xl border"
                      style={{ background:item.color+'08', borderColor:item.color+'30' }}>
                      <div className="text-xs font-semibold mb-2 uppercase tracking-wider"
                        style={{ color:item.color }}>{item.title}</div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {parsedNotes.philosophy[item.key]}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Methodology */}
            {parsedNotes.methodology.filter(m=>m).length > 0 && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <FaChartLine className="text-[#22c55e]" style={{ fontSize:16 }}/>
                  Training methodology
                </h2>
                <div className="space-y-3">
                  {parsedNotes.methodology.filter(m=>m).map((method,i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {i+1}
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
                      <FaTrophy className="text-[#f59e0b]" style={{ fontSize:16 }}/>
                      Experience
                    </h2>
                    <div className="space-y-3">
                      {parsedNotes.experiences.map((exp,i) => (
                        <div key={i} className="relative pl-4 pb-4 last:pb-0">
                          <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#00d0cb]"/>
                          {i < parsedNotes.experiences.length - 1 && (
                            <div className="absolute left-0.5 top-3 w-px h-full bg-gray-700/50" style={{ transform:'translateX(-50%)' }}/>
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
                      <FaGraduationCap className="text-[#902bd1]" style={{ fontSize:16 }}/>
                      Certifications
                    </h2>
                    <div className="space-y-3">
                      {parsedNotes.certifications.map((cert,i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
                          style={{ background:certColor(cert.name)+'08', borderColor:certColor(cert.name)+'25' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background:certColor(cert.name)+'20' }}>
                            <FaMedal style={{ fontSize:14, color:certColor(cert.name) }}/>
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color:certColor(cert.name) }}>
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

            {/* Empty state */}
            {!profile?.bio &&
             !Object.values(parsedNotes.philosophy).some(v=>v) &&
             parsedNotes.experiences.length === 0 &&
             parsedNotes.certifications.length === 0 && (
              <motion.div variants={iV}
                className="bg-gray-900/70 rounded-2xl p-12 border border-dashed border-gray-700/50 text-center">
                <FiEdit2 className="mx-auto text-4xl text-gray-600 mb-4"/>
                <p className="text-white text-base font-medium mb-2">Your profile is empty</p>
                <p className="text-gray-500 text-sm mb-6">
                  Add a bio, your philosophy, experience and certifications to complete your profile
                </p>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 text-white font-medium rounded-xl text-sm"
                  style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  Complete your profile
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