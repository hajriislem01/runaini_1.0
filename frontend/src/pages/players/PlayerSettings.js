import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiLock, FiSave, FiCheck,
  FiEye, FiEyeOff, FiCamera, FiX, FiAlertTriangle,
} from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const PlayerSettings = () => {
  const fileRef = useRef(null);
  const { player, isLoading: playerLoading, refreshPlayer, playerInitial, photoUrl } = usePlayer();

  const [tab, setTab] = useState('profile');

  // Profile form
  const [profileForm,    setProfileForm]    = useState({ full_name:'', phone:'', address:'', notes:'' });
  const [isSavingProfile,setIsSavingProfile]= useState(false);
  const [profileChanged, setProfileChanged] = useState(false);

  // Photo
  const [photoPreview,   setPhotoPreview]   = useState(null);
  const [photoFile,      setPhotoFile]      = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password
  const [pwdForm,    setPwdForm]    = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [showPwd,    setShowPwd]    = useState({ current:false, new:false, confirm:false });
  const [isSavingPwd,setIsSavingPwd]= useState(false);
  const [pwdStrength,setPwdStrength]= useState(0);

  useEffect(() => {
    if (!player) return;
    setProfileForm({
      full_name: player.full_name || '',
      phone:     player.phone    || '',
      address:   player.address  || '',
      notes:     player.notes    || '',
    });
    setPhotoPreview(photoUrl);
  }, [player, photoUrl]);

  useEffect(() => {
    const p = pwdForm.new_password;
    let score = 0;
    if (p.length >= 8)          score++;
    if (/[A-Z]/.test(p))        score++;
    if (/[0-9]/.test(p))        score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setPwdStrength(score);
  }, [pwdForm.new_password]);

  const strengthInfo = [
    { label:'Too short', color:'#f87171' },
    { label:'Weak',      color:'#f87171' },
    { label:'Fair',      color:'#f59e0b' },
    { label:'Good',      color:'#4fb0ff' },
    { label:'Strong',    color:'#4ade80' },
  ][pwdStrength];

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

  // ── Profile save ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profileForm.full_name.trim()) { toast.error('Full name is required'); return; }
    setIsSavingProfile(true);
    try {
      await API.patch('players/me/', {
        full_name: profileForm.full_name,
        phone:     profileForm.phone,
        address:   profileForm.address,
        notes:     profileForm.notes,
      });
      await refreshPlayer();
      setProfileChanged(false);
      toast.success('Profile updated ✅');
    } catch { toast.error('Failed to update profile'); }
    finally  { setIsSavingProfile(false); }
  };

  // ── Password save ─────────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    if (!pwdForm.current_password)          { toast.error('Enter your current password'); return; }
    if (pwdForm.new_password.length < 8)    { toast.error('New password must be at least 8 characters'); return; }
    if (pwdForm.new_password !== pwdForm.confirm_password) { toast.error('Passwords do not match'); return; }
    setIsSavingPwd(true);
    try {
      await API.patch('players/me/', {
        current_password: pwdForm.current_password,
        new_password:     pwdForm.new_password,
      });
      setPwdForm({ current_password:'', new_password:'', confirm_password:'' });
      toast.success('Password changed ✅');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to change password';
      toast.error(msg);
    } finally { setIsSavingPwd(false); }
  };

  const cV = { hidden:{opacity:0}, visible:{opacity:1,transition:{staggerChildren:0.08}} };
  const iV = { hidden:{y:16,opacity:0}, visible:{y:0,opacity:1} };

  if (playerLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(135deg,#000 0%,#0a0f2a 45%,#180033 100%)' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"/>
    </div>
  );

  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right"/>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div variants={iV} className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your account and preferences</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={iV}
          className="flex bg-gray-900/70 border border-gray-700/50 rounded-xl overflow-hidden mb-6">
          {[
            { key:'profile',  icon:<FiUser size={14}/>, label:'Profile'  },
            { key:'security', icon:<FiLock size={14}/>, label:'Security' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all"
              style={tab===t.key
                ? { background:'rgba(79,176,255,.2)', color:'#4fb0ff', borderBottom:'2px solid #4fb0ff' }
                : { color:'#64748b' }}>
              {t.icon}{t.label}
            </button>
          ))}
        </motion.div>

        {/* ══ PROFILE TAB ══ */}
        {tab === 'profile' && (
          <motion.div variants={iV} className="space-y-5">

            {/* Photo */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <FiCamera size={14} className="text-[#4fb0ff]"/>Profile photo
              </h2>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2"
                    style={{ borderColor:'rgba(0,208,203,.4)' }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                        style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                        {playerInitial}
                      </div>
                    )}
                  </div>
                  {!photoFile && (
                    <button onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-white"
                      style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                      <FiCamera size={12}/>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*"
                    className="hidden" onChange={handlePhotoChange}/>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-gray-300 font-medium mb-1">{player?.full_name || 'Player'}</div>
                  <div className="text-xs text-gray-500 mb-3">JPG, PNG — max 5MB</div>
                  {photoFile ? (
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                        onClick={uploadPhoto} disabled={uploadingPhoto}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white"
                        style={{ background:'linear-gradient(135deg,#22c55e,#14b8a6)' }}>
                        {uploadingPhoto
                          ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"/>
                          : <FiCheck size={11}/>}
                        Save photo
                      </motion.button>
                      <button onClick={cancelPhoto}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-gray-800 text-gray-400 border border-gray-700">
                        <FiX size={11}/>Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs border border-gray-700 bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all">
                      Change photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <FiUser size={14} className="text-[#00d0cb]"/>Personal information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Full name <span className="text-red-400">*</span></label>
                  <input type="text" value={profileForm.full_name}
                    onChange={e => { setProfileForm(p=>({...p,full_name:e.target.value})); setProfileChanged(true); }}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                    placeholder="Your full name"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Position</label>
                    <div className="px-4 py-3 bg-gray-800/30 border border-gray-700/30 rounded-xl text-sm text-gray-500 cursor-not-allowed">
                      {player?.position || '—'}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Set by your coach</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Group</label>
                    <div className="px-4 py-3 bg-gray-800/30 border border-gray-700/30 rounded-xl text-sm text-gray-500 cursor-not-allowed">
                      {player?.group?.name || '—'}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Set by admin</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
                  <input type="tel" value={profileForm.phone}
                    onChange={e => { setProfileForm(p=>({...p,phone:e.target.value})); setProfileChanged(true); }}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                    placeholder="+216 XX XXX XXX"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Location</label>
                  <input type="text" value={profileForm.address}
                    onChange={e => { setProfileForm(p=>({...p,address:e.target.value})); setProfileChanged(true); }}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                    placeholder="City, Country"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Bio</label>
                  <textarea rows={3} value={profileForm.notes}
                    onChange={e => { setProfileForm(p=>({...p,notes:e.target.value})); setProfileChanged(true); }}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none"
                    placeholder="Tell something about yourself..."/>
                </div>
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-600">
                  {profileChanged ? 'You have unsaved changes' : 'All changes saved'}
                </p>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || !profileChanged}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  {isSavingProfile
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    : <FiSave size={14}/>}
                  Save changes
                </motion.button>
              </div>
            </div>

            {/* Academy info readonly */}
            <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-[#902bd1]"/>Academy info
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label:'Academy', value:player?.academy?.name || '—' },
                  { label:'Status',  value:player?.status        || '—' },
                  { label:'Height',  value:player?.height ? `${player.height} cm` : '—' },
                  { label:'Weight',  value:player?.weight ? `${player.weight} kg` : '—' },
                ].map((row,i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-gray-800/30 border border-gray-700/30">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="text-gray-300 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                These fields are managed by your coach or academy admin.
              </p>
            </div>
          </motion.div>
        )}

        {/* ══ SECURITY TAB ══ */}
        {tab === 'security' && (
          <motion.div variants={iV} className="space-y-5">

            {/* Change password */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <FiLock size={14} className="text-[#902bd1]"/>Change password
              </h2>
              <div className="space-y-4">

                {/* Current */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Current password</label>
                  <div className="relative">
                    <input type={showPwd.current ? 'text' : 'password'}
                      value={pwdForm.current_password}
                      onChange={e => setPwdForm(p=>({...p,current_password:e.target.value}))}
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] pr-12"
                      placeholder="••••••••"/>
                    <button onClick={() => setShowPwd(p=>({...p,current:!p.current}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPwd.current ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                    </button>
                  </div>
                </div>

                {/* New */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">New password</label>
                  <div className="relative">
                    <input type={showPwd.new ? 'text' : 'password'}
                      value={pwdForm.new_password}
                      onChange={e => setPwdForm(p=>({...p,new_password:e.target.value}))}
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] pr-12"
                      placeholder="••••••••"/>
                    <button onClick={() => setShowPwd(p=>({...p,new:!p.new}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPwd.new ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                    </button>
                  </div>
                  {pwdForm.new_password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all"
                            style={{ background: i <= pwdStrength ? strengthInfo.color : '#1e293b' }}/>
                        ))}
                      </div>
                      <div className="text-xs" style={{ color:strengthInfo.color }}>{strengthInfo.label}</div>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Confirm new password</label>
                  <div className="relative">
                    <input type={showPwd.confirm ? 'text' : 'password'}
                      value={pwdForm.confirm_password}
                      onChange={e => setPwdForm(p=>({...p,confirm_password:e.target.value}))}
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] pr-12"
                      placeholder="••••••••"/>
                    <button onClick={() => setShowPwd(p=>({...p,confirm:!p.confirm}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPwd.confirm ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                    </button>
                  </div>
                  {pwdForm.confirm_password.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs"
                      style={{ color: pwdForm.new_password === pwdForm.confirm_password ? '#4ade80' : '#f87171' }}>
                      {pwdForm.new_password === pwdForm.confirm_password
                        ? <><FiCheck size={11}/>Passwords match</>
                        : <><FiX size={11}/>Passwords do not match</>}
                    </div>
                  )}
                </div>

                {/* Requirements */}
                <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                  <div className="text-xs text-gray-500 mb-2">Password requirements:</div>
                  <div className="space-y-1">
                    {[
                      { label:'At least 8 characters', ok: pwdForm.new_password.length >= 8           },
                      { label:'One uppercase letter',  ok: /[A-Z]/.test(pwdForm.new_password)         },
                      { label:'One number',            ok: /[0-9]/.test(pwdForm.new_password)          },
                      { label:'One special character', ok: /[^A-Za-z0-9]/.test(pwdForm.new_password)  },
                    ].map((req,i) => (
                      <div key={i} className="flex items-center gap-2 text-xs"
                        style={{ color: req.ok ? '#4ade80' : '#475569' }}>
                        <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: req.ok ? 'rgba(74,222,128,.2)' : 'rgba(71,85,105,.2)' }}>
                          {req.ok && <FiCheck size={8}/>}
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-5 pt-4 border-t border-gray-800">
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={handleSavePassword} disabled={isSavingPwd}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  {isSavingPwd
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    : <FiLock size={14}/>}
                  Update password
                </motion.button>
              </div>
            </div>

            {/* Account info */}
            <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-[#4fb0ff]"/>Account info
              </h2>
              <div className="space-y-2 text-xs">
                {[
                  { label:'Username', value: player?.user?.username || '—' },
                  { label:'Email',    value: player?.user?.email    || '—' },
                  { label:'Role',     value: player?.user?.role     || 'player' },
                ].map((row,i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="text-gray-300">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                To change your email or username, contact your academy admin.
              </p>
            </div>

            {/* Danger zone */}
            <div className="bg-gray-900/70 rounded-2xl p-5 border border-red-500/20">
              <h2 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                <FiAlertTriangle size={14}/>Danger zone
              </h2>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                <FiAlertTriangle size={13} className="text-red-400 flex-shrink-0"/>
                <p className="text-xs text-gray-400">
                  Account deletion is not available from this page. Contact your admin.
                </p>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

export default PlayerSettings;