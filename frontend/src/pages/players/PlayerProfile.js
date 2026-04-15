import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit2, FiCamera, FiSave, FiX, FiCheck,
  FiPhone, FiMapPin, FiActivity, FiCalendar,
  FiUsers, FiChevronRight, FiAward,
} from 'react-icons/fi';
import { FaFutbol, FaHeartbeat, FaGraduationCap } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

const scoreColor = (s) => {
  if (!s && s !== 0) return '#64748b';
  if (s >= 8) return '#4ade80';
  if (s >= 7) return '#4fb0ff';
  if (s >= 6) return '#f59e0b';
  return '#f87171';
};

const STATUS_STYLES = {
  Active:   { bg:'rgba(34,197,94,.15)',   color:'#4ade80', border:'rgba(34,197,94,.25)'   },
  Injured:  { bg:'rgba(239,68,68,.15)',   color:'#f87171', border:'rgba(239,68,68,.25)'   },
  Inactive: { bg:'rgba(100,116,139,.15)', color:'#94a3b8', border:'rgba(100,116,139,.25)' },
};

const POSITION_COLORS = {
  Forward:    '#ef4444',
  Midfielder: '#4fb0ff',
  Defender:   '#22c55e',
  Goalkeeper: '#f59e0b',
};

const PlayerProfile = () => {
  const navigate = useNavigate();
  const fileRef  = useRef(null);
  const { player, isLoading: playerLoading, playerName,
          playerInitial, photoUrl, refreshPlayer } = usePlayer();

  const [report,         setReport]         = useState(null);
  const [loadingExtra,   setLoadingExtra]   = useState(true);
  const [editMode,       setEditMode]       = useState(false);
  const [isSaving,       setIsSaving]       = useState(false);
  const [photoPreview,   setPhotoPreview]   = useState(null);
  const [photoFile,      setPhotoFile]      = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '', address: '', notes: '',
  });

  useEffect(() => {
    if (!player) return;
    setPhotoPreview(photoUrl);
    setEditForm({
      phone:   player.phone   || '',
      address: player.address || '',
      notes:   player.notes   || '',
    });
    const load = async () => {
      setLoadingExtra(true);
      try {
        const month = format(new Date(), 'yyyy-MM');
        const res   = await API.get(`reports/?month=${month}`);
        const mine  = res.data.find(r => r.player === player.id);
        setReport(mine || null);
      } catch {}
      finally { setLoadingExtra(false); }
    };
    load();
  }, [player, photoUrl]);

  // ── Photo ─────────────────────────────────────────────────────────────────
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
      // ✅ Pas de Content-Type manuel — axios gère le boundary automatiquement
      await API.patch('players/me/', fd);
      await refreshPlayer();
      toast.success('Photo updated ✅');
      setPhotoFile(null);
    } catch { toast.error('Failed to upload photo'); }
    finally  { setUploadingPhoto(false); }
  };

  const cancelPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(photoUrl);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await API.patch('players/me/', {
        phone:   editForm.phone,
        address: editForm.address,
        notes:   editForm.notes,
      });
      await refreshPlayer();
      setEditMode(false);
      toast.success('Profile updated ✅');
    } catch { toast.error('Failed to save profile'); }
    finally  { setIsSaving(false); }
  };

  const cV = { hidden:{opacity:0}, visible:{opacity:1,transition:{staggerChildren:0.08}} };
  const iV = { hidden:{y:16,opacity:0}, visible:{y:0,opacity:1} };

  if (playerLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(135deg,#000 0%,#0a0f2a 45%,#180033 100%)' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"/>
    </div>
  );

  if (!player) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background:'linear-gradient(135deg,#000 0%,#0a0f2a 45%,#180033 100%)' }}>
      <FaFutbol className="text-5xl text-gray-600 mb-4"/>
      <h2 className="text-xl text-gray-300 mb-2">No profile found</h2>
      <p className="text-gray-500 text-sm mb-6 text-center">
        Your account is not linked to a player profile yet.
      </p>
      <button onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-xl text-white text-sm font-medium"
        style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
        Refresh
      </button>
    </div>
  );

  const posColor  = POSITION_COLORS[player.position] || '#4fb0ff';
  const statStyle = STATUS_STYLES[player.status] || STATUS_STYLES.Active;

  return (
    <motion.div className="min-h-screen text-white"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right"/>

      {/* ── Hero banner ── */}
      <div className="relative"
        style={{ background:'linear-gradient(135deg,rgba(144,43,209,.2),rgba(79,176,255,.1))' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full"
            style={{ background:'rgba(144,43,209,.07)' }}/>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full"
            style={{ background:'rgba(0,208,203,.05)' }}/>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 md:px-8 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">

            {/* Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2"
                style={{ borderColor:'rgba(0,208,203,.4)' }}>
                {photoPreview ? (
                  <img src={photoPreview} alt={playerName}
                    className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                    style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                    {playerInitial}
                  </div>
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                <FiCamera size={13}/>
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                className="hidden" onChange={handlePhotoChange}/>

              <AnimatePresence>
                {photoFile && (
                  <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0 }}
                    className="absolute -bottom-12 left-0 flex gap-2 whitespace-nowrap z-10">
                    <button onClick={uploadPhoto} disabled={uploadingPhoto}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white"
                      style={{ background:'#22c55e' }}>
                      {uploadingPhoto
                        ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"/>
                        : <FiCheck size={10}/>}
                      Save
                    </button>
                    <button onClick={cancelPhoto}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-gray-700 text-gray-300">
                      <FiX size={10}/>Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Name & info */}
            <div className="flex-1 mt-2">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white">{playerName}</h1>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                  style={{ background:statStyle.bg, color:statStyle.color, border:`1px solid ${statStyle.border}` }}>
                  {player.status}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-sm mb-2">
                {player.position && (
                  <span className="flex items-center gap-1.5 font-semibold" style={{ color:posColor }}>
                    <FaFutbol style={{ fontSize:12 }}/>{player.position}
                  </span>
                )}
                {player.group?.name && (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <FiUsers size={12}/>{player.group.name}
                    {player.subgroup?.name && ` · ${player.subgroup.name}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                {player.height && <span>{player.height} cm</span>}
                {player.weight && <span>{player.weight} kg</span>}
                {player.academy?.name && <span>{player.academy.name}</span>}
              </div>
            </div>

            {/* Edit button */}
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
                    Save
                  </motion.button>
                </>
              ) : (
                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  <FiEdit2 size={14}/>Edit profile
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-8 lg:px-10 py-8">

        {/* Stats */}
        {!loadingExtra && report && (
          <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label:'Monthly score', value:`${parseFloat(report.overall_score).toFixed(1)}/10`, color:scoreColor(report.overall_score), icon:<FiActivity size={16}/> },
              { label:'Attendance',    value: report.attendance_total > 0 ? `${Math.round((report.attendance_present/report.attendance_total)*100)}%` : '—', color:'#00d0cb', icon:<FiCalendar size={16}/> },
              { label:'Health',        value: report.is_injured ? 'Injured' : 'Good', color: report.is_injured ? '#f87171' : '#4ade80', icon:<FaHeartbeat style={{ fontSize:16 }}/> },
              { label:'School grade',  value: report.school_grade_avg ? `${parseFloat(report.school_grade_avg).toFixed(1)}/20` : '—', color:'#a855f7', icon:<FaGraduationCap style={{ fontSize:16 }}/> },
            ].map((s,i) => (
              <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:s.color+'20', color:s.color }}>{s.icon}</div>
                <div>
                  <div className="text-xl font-bold" style={{ color:s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <motion.div variants={iV} className="space-y-5">

            {/* Contact */}
            <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background:'linear-gradient(#902bd1,#4fb0ff)' }}/>
                Contact
              </h2>
              {editMode ? (
                <div className="space-y-3">
                  {[
                    { key:'phone',   label:'Phone',   type:'tel',  placeholder:'+216 XX XXX XXX' },
                    { key:'address', label:'Address', type:'text', placeholder:'City, Country'   },
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
                  {player.user?.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                      <span className="text-[#4fb0ff] text-sm font-bold">@</span>
                      <span className="text-sm text-gray-300 truncate">{player.user.email}</span>
                    </div>
                  )}
                  {player.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                      <FiPhone className="text-[#00d0cb] flex-shrink-0" size={13}/>
                      <span className="text-sm text-gray-300">{player.phone}</span>
                    </div>
                  )}
                  {player.address && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                      <FiMapPin className="text-[#902bd1] flex-shrink-0" size={13}/>
                      <span className="text-sm text-gray-300">{player.address}</span>
                    </div>
                  )}
                  {!player.user?.email && !player.phone && !player.address && (
                    <p className="text-xs text-gray-600">No contact info added</p>
                  )}
                </div>
              )}
            </div>

            {/* Physical */}
            <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-[#22c55e]"/>Physical
              </h2>
              <div className="space-y-2">
                {[
                  { label:'Position', value:player.position,                                  color:posColor    },
                  { label:'Height',   value:player.height ? `${player.height} cm` : '—',     color:'#4fb0ff'   },
                  { label:'Weight',   value:player.weight ? `${player.weight} kg` : '—',     color:'#f59e0b'   },
                  { label:'Group',    value:player.group?.name || '—',                        color:'#902bd1'   },
                  { label:'Subgroup', value:player.subgroup?.name || '—',                     color:'#a855f7'   },
                ].map((row,i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0 text-xs">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-semibold" style={{ color:row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick access */}
            <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-[#00d0cb]"/>Quick access
              </h2>
              <div className="space-y-2">
                {[
                  { label:'My Training', path:'/players/training',    color:'#4fb0ff' },
                  { label:'Performance', path:'/players/performance', color:'#00d0cb' },
                  { label:'Settings',    path:'/players/settings',    color:'#f59e0b' },
                ].map((l,i) => (
                  <button key={i} onClick={() => navigate(l.path)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-700/30 bg-gray-800/30 hover:bg-gray-700/30 transition-all text-sm text-gray-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background:l.color }}/>
                      {l.label}
                    </span>
                    <FiChevronRight size={13} className="text-gray-600"/>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bio */}
            <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background:'linear-gradient(#4fb0ff,#00d0cb)' }}/>
                About
              </h2>
              {editMode ? (
                <textarea value={editForm.notes}
                  onChange={e => setEditForm(p=>({...p,notes:e.target.value}))}
                  rows={4} placeholder="Write something about yourself..."
                  className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none"/>
              ) : player.notes ? (
                <p className="text-gray-300 leading-relaxed text-sm">{player.notes}</p>
              ) : (
                <p className="text-gray-600 text-sm">
                  No bio yet.{' '}
                  <button onClick={() => setEditMode(true)} className="text-[#4fb0ff] underline">
                    Add a short description
                  </button>
                </p>
              )}
            </motion.div>

            {/* Last report */}
            {!loadingExtra && report && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FiAward className="text-[#4fb0ff]" size={14}/>
                    Latest evaluation — {report.month}
                  </h2>
                  <button onClick={() => navigate('/players/performance')}
                    className="text-xs text-[#00d0cb] hover:text-[#4fb0ff] transition-colors">
                    View full report →
                  </button>
                </div>
                <div className="space-y-2.5 mb-4">
                  {[
                    { label:'Technical', value:report.technical_avg, color:'#4fb0ff' },
                    { label:'Tactical',  value:report.tactical_avg,  color:'#f59e0b' },
                    { label:'Physical',  value:report.physical_avg,  color:'#22c55e' },
                    { label:'Mental',    value:report.mental_avg,    color:'#a855f7' },
                  ].map((p,i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-gray-500 w-16 flex-shrink-0">{p.label}</div>
                      <div className="flex-1 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width:`${(parseFloat(p.value||0))*10}%`, background:p.color }}/>
                      </div>
                      <div className="text-xs font-bold w-8 text-right" style={{ color:p.color }}>
                        {parseFloat(p.value||0).toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
                {(report.comment || report.strength || report.to_improve) && (
                  <div className="p-3 rounded-xl border"
                    style={{ background:'rgba(144,43,209,.06)', borderColor:'rgba(144,43,209,.2)' }}>
                    {report.comment && (
                      <p className="text-xs text-gray-400 italic mb-2">"{report.comment}"</p>
                    )}
                    <div className="flex gap-3 flex-wrap text-xs">
                      {report.strength   && <span className="text-green-400">✓ {report.strength}</span>}
                      {report.to_improve && <span className="text-amber-400">→ {report.to_improve}</span>}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Empty state */}
            {!loadingExtra && !report && (
              <motion.div variants={iV}
                className="bg-gray-900/70 rounded-2xl p-10 border border-dashed border-gray-700/50 text-center">
                <FiActivity className="mx-auto text-4xl text-gray-600 mb-3"/>
                <p className="text-gray-400 text-sm">No evaluation this month yet</p>
                <p className="text-gray-600 text-xs mt-1">Your coach will evaluate you soon</p>
              </motion.div>
            )}

            {/* Health status */}
            <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FaHeartbeat style={{ fontSize:14, color:'#ef4444' }}/>Health status
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl flex items-center gap-3"
                  style={player.status === 'Injured'
                    ? { background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)' }
                    : { background:'rgba(34,197,94,.08)',  border:'1px solid rgba(34,197,94,.2)'  }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: player.status === 'Injured' ? '#f87171' : '#4ade80' }}/>
                  <div>
                    <div className="text-xs font-semibold"
                      style={{ color: player.status === 'Injured' ? '#f87171' : '#4ade80' }}>
                      {player.status === 'Injured' ? 'Currently injured' : 'Fit to play'}
                    </div>
                    <div className="text-xs text-gray-500">Player status</div>
                  </div>
                </div>
                {report && (
                  <div className="p-3 rounded-xl flex items-center gap-3"
                    style={report.medical_cert_valid
                      ? { background:'rgba(34,197,94,.08)',  border:'1px solid rgba(34,197,94,.2)'  }
                      : { background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: report.medical_cert_valid ? '#4ade80' : '#f87171' }}/>
                    <div>
                      <div className="text-xs font-semibold"
                        style={{ color: report.medical_cert_valid ? '#4ade80' : '#f87171' }}>
                        {report.medical_cert_valid ? 'Valid' : 'Invalid / Expired'}
                      </div>
                      <div className="text-xs text-gray-500">Medical certificate</div>
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