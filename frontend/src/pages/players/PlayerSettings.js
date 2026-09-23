import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiLock, FiSave, FiCheck, FiEye, FiEyeOff, FiX, FiUpload, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext';
import { useTranslation } from 'react-i18next';
import API from '../api';
import toast from 'react-hot-toast';
import AdminToaster from '../administration/shared/AdminToaster';

const PlayerSettings = () => {
  const { player, isLoading: playerLoading, updatePlayer, photoUrl } = usePlayer();
  const { t, i18n } = useTranslation('playersettings');
  const isRtl = i18n.language === 'ar';
  const fileRef = useRef(null);

  // Core State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    phones: [{ number: '', label: 'Personal' }],
    address: '',
    notes: '',
    height: '',
    weight: '',
    date_of_birth: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [previewURL, setPreviewURL] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // Control State
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Inline API error states
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [photoError, setPhotoError] = useState(null);

  // Initialization & Sync
  useEffect(() => {
    if (!player || isSaving || isPhotoSaving || hasChanges) return;

    setFormData({
      full_name: player.full_name || '',
      phone: player.phone || '',
      phones: (player.phones && Array.isArray(player.phones) && player.phones.length > 0)
        ? player.phones
        : (player.phone ? [{ number: player.phone, label: 'Personal' }] : [{ number: '', label: 'Personal' }]),
      address: player.address || '',
      notes: player.notes || '',
      height: player.height || '',
      weight: player.weight || '',
      date_of_birth: player.date_of_birth || ''
    });

    if (!photoFile) {
      setPreviewURL(photoUrl || null);
    }
  }, [player, isSaving, isPhotoSaving, hasChanges, photoFile, photoUrl]);

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.photoMaxSize'));
      return;
    }

    if (previewURL && previewURL.startsWith('blob:')) {
      URL.revokeObjectURL(previewURL);
    }

    setPhotoFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleCancelPhoto = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (previewURL && previewURL.startsWith('blob:')) {
      URL.revokeObjectURL(previewURL);
    }
    setPhotoFile(null);
    setPreviewURL(photoUrl || null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePhotoUpload = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!photoFile) return;

    setIsPhotoSaving(true);
    setPhotoError(null);

    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      const res = await API.patch('players/me/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updatePlayer(res.data);
      toast.success(t('messages.photoUpdated'));
      setPhotoFile(null);
      setPhotoError(null);
    } catch (err) {
      const msg = err.response?.data?.photo?.[0] || t('messages.photoFailed');
      setPhotoError(msg);
      toast.error(msg);
    } finally {
      setIsPhotoSaving(false);
    }
  };

  const handleRemovePhoto = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setIsPhotoSaving(true);
    setPhotoError(null);
    try {
      const fd = new FormData();
      fd.append('remove_photo', 'true');
      const res = await API.patch('players/me/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updatePlayer(res.data);
      setPhotoFile(null);
      setPreviewURL(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.success(t('messages.photoRemoved', 'Photo removed'));
    } catch {
      toast.error(t('messages.photoFailed'));
    } finally {
      setIsPhotoSaving(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!formData.full_name.trim()) {
      const msg = t('messages.nameRequired');
      setProfileError(msg);
      toast.error(msg);
      return;
    }

    setIsSaving(true);
    setProfileError(null);

    try {
      const validPhones = (formData.phones || []).filter(p => p.number && p.number.trim());
      const payload = {
        full_name: formData.full_name,
        phone: validPhones.length > 0 ? validPhones[0].number : formData.phone,
        phones: validPhones,
        address: formData.address,
        notes: formData.notes,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        date_of_birth: formData.date_of_birth || null,
      };

      const res = await API.patch('players/me/', payload);
      updatePlayer(res.data);
      setHasChanges(false);
      setProfileError(null);
      toast.success(t('messages.profileUpdated'));
    } catch (err) {
      const data = err.response?.data;
      const msg = data
        ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' | ')
        : t('messages.profileFailed');
      setProfileError(msg);
      toast.error(t('messages.profileFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!passwordData.current_password || !passwordData.new_password) {
      const msg = t('messages.pwdRequired');
      setPasswordError(msg);
      toast.error(msg);
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      const msg = t('messages.pwdMismatch');
      setPasswordError(msg);
      toast.error(msg);
      return;
    }
    if (passwordData.new_password.length < 8) {
      const msg = t('messages.pwdTooShort');
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    setIsSaving(true);
    setPasswordError(null);
    try {
      await API.patch('players/me/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordError(null);
      toast.success(t('messages.pwdChanged'));
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.current_password?.[0] || t('messages.pwdFailed');
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Shared input class
  const inputCls = `w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white
    placeholder-gray-600 focus:outline-none focus:border-[#00d0cb] focus:ring-1 focus:ring-[#00d0cb] transition-all`;
  const pwdInputCls = `w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white
    placeholder-gray-600 focus:outline-none focus:border-[#902bd1] focus:ring-1 focus:ring-[#902bd1] transition-all
    ${isRtl ? 'pl-12 pr-4' : 'pr-12'}`;
  const labelCls = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2';

  // Render Loader
  if (playerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
    >
      <AdminToaster position={isRtl ? 'top-left' : 'top-right'} />
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] to-[#00d0cb] bg-clip-text text-transparent pb-1">
            {t('header.title')}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">{t('header.subtitle')}</p>
        </div>

        {/* ── Photo & Name Card ── */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 border border-gray-800 shadow-xl flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 relative shadow-lg bg-gray-900 flex items-center justify-center"
              style={{ boxShadow: '0 0 24px rgba(0,208,203,0.15)' }}
            >
              {previewURL ? (
                <img src={previewURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="text-4xl font-bold"
                  style={{ background: 'linear-gradient(135deg,#902bd1,#00d0cb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {player?.user?.username?.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
            </div>
          </div>

          <div className={`flex-1 text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
            <h2 className="text-2xl font-bold text-white mb-1">{player?.full_name || 'Player'}</h2>
            <p className="text-sm text-gray-400 mb-5">@{player?.user?.username}</p>

            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <div className={`flex flex-col sm:flex-row items-center ${isRtl ? 'justify-center md:justify-end' : 'justify-center md:justify-start'} gap-3`}>
              {!photoFile ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-semibold text-white border border-gray-700 transition-all flex items-center gap-2"
                  >
                    <FiUpload size={16} />
                    {t('profile.choosePhoto')}
                  </button>
                  {previewURL && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isPhotoSaving}
                      className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiTrash2 size={16} />
                      {t('profile.removePhoto', 'Remove photo')}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    disabled={isPhotoSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#14b8a6] hover:brightness-110 text-sm font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPhotoSaving
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <FiCheck size={16} />
                    }
                    {isPhotoSaving ? t('profile.saving') : t('profile.confirmPhoto')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPhoto}
                    disabled={isPhotoSaving}
                    className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiX size={16} />
                    {t('profile.cancel')}
                  </button>
                </>
              )}
            {photoError && (
              <div className="w-full mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#fca5a5' }}>
                <FiAlertCircle size={14} className="flex-shrink-0" />
                {photoError}
              </div>
            )}
            </div>
            <p className="text-xs text-gray-500 mt-4">{t('profile.photoSizeWarning')}</p>
          </div>
        </div>

        {/* ── Profile Details Card ── */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 border border-gray-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-2">
            <FiUser className="text-[#00d0cb]" size={20} />
            <h2 className="text-lg font-bold text-white">{t('profile.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className={labelCls}>{t('profile.fullName')}</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={inputCls}
                placeholder="John Doe"
              />
            </div>

            {/* Phones */}
            <div className="col-span-full">
              <label className={labelCls}>📱 {t('profile.phone', 'Phone Numbers')}</label>
              <div className="space-y-2">
                {(formData.phones || [{ number: '', label: 'Personal' }]).map((phone, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="tel"
                      value={phone.number}
                      onChange={e => {
                        const updated = [...formData.phones];
                        updated[idx] = { ...updated[idx], number: e.target.value };
                        setFormData(prev => ({ ...prev, phones: updated }));
                        setHasChanges(true);
                      }}
                      className={`flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00d0cb] focus:ring-1 focus:ring-[#00d0cb] transition-all`}
                      placeholder="+216 55 123 456"
                      dir="ltr"
                    />
                    <select
                      value={phone.label}
                      onChange={e => {
                        const updated = [...formData.phones];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setFormData(prev => ({ ...prev, phones: updated }));
                        setHasChanges(true);
                      }}
                      className="px-3 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-[#00d0cb] transition-all"
                    >
                      <option value="Personal">{t('profile.phoneLabels.personal', 'Personal')}</option>
                      <option value="Mother">{t('profile.phoneLabels.mother', 'Mother')}</option>
                      <option value="Father">{t('profile.phoneLabels.father', 'Father')}</option>
                      <option value="Other">{t('profile.phoneLabels.other', 'Other')}</option>
                    </select>
                    {formData.phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== idx) }));
                          setHasChanges(true);
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, phones: [...(prev.phones || []), { number: '', label: 'Personal' }] }));
                  setHasChanges(true);
                }}
                className="mt-2 flex items-center gap-1.5 text-[#00d0cb] hover:text-[#00d0cb]/80 text-sm font-medium transition-all"
              >
                <FiPlus size={14} /> {t('profile.addPhone', 'Add Phone')}
              </button>
            </div>

            {/* Location */}
            <div>
              <label className={labelCls}>{t('profile.location')}</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={inputCls}
                placeholder="City, Country"
              />
            </div>

            {/* System Info */}
            <div>
              <label className={labelCls}>{t('profile.systemInfo')}</label>
              <div className="text-sm text-gray-500 bg-gray-800/30 px-4 py-3 rounded-xl border border-gray-800">
                <span className="text-gray-400">{t('profile.position')}:</span>{' '}
                {player?.position || '—'}
                <span className="mx-2">•</span>
                <span className="text-gray-400">{t('profile.group')}:</span>{' '}
                {player?.group?.name || '—'}
              </div>
            </div>

            {/* Height */}
            <div>
              <label className={labelCls}>{t('profile.height')}</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={inputCls}
                placeholder="180"
                inputMode="numeric"
              />
            </div>

            {/* Weight */}
            <div>
              <label className={labelCls}>{t('profile.weight')}</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={inputCls}
                placeholder="75"
                inputMode="numeric"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className={labelCls}>{t('profile.dateOfBirth', 'Date of Birth')}</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className={labelCls}>{t('profile.bio')}</label>
              <textarea
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={`${inputCls} resize-none`}
                placeholder={t('profile.bioPlaceholder')}
              />
            </div>
          </div>

          {/* Save Profile Button */}
          <div className={`pt-6 border-t border-gray-800 flex flex-col gap-3`}>
            {profileError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#fca5a5' }}>
                <FiAlertCircle size={14} className="flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}
            <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving || !hasChanges}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:brightness-110 text-sm font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                style={{ boxShadow: '0 0 20px rgba(144,43,209,0.3)' }}
              >
                {isSaving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <FiSave size={16} />
                }
                {isSaving ? t('profile.saving') : t('profile.saveChanges')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Security Card ── */}
        <form
          onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 border border-gray-800 shadow-xl space-y-6"
        >
          {/* Hidden username for password managers */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={player?.user?.email || player?.user?.username || ''}
            readOnly
            style={{ display: 'none' }}
          />

          <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-2">
            <FiLock className="text-[#902bd1]" size={20} />
            <h2 className="text-lg font-bold text-white">{t('security.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Password */}
            <div>
              <label className={labelCls}>{t('security.currentPassword')}</label>
              <div className="relative">
                <input
                  type={showPwd.current ? 'text' : 'password'}
                  name="current_password"
                  autoComplete="current-password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className={pwdInputCls}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-white ${isRtl ? 'left-4' : 'right-4'}`}
                >
                  {showPwd.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className={labelCls}>{t('security.newPassword')}</label>
              <div className="relative">
                <input
                  type={showPwd.new ? 'text' : 'password'}
                  name="new_password"
                  autoComplete="new-password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className={pwdInputCls}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-white ${isRtl ? 'left-4' : 'right-4'}`}
                >
                  {showPwd.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelCls}>{t('security.confirmPassword')}</label>
              <div className="relative">
                <input
                  type={showPwd.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  autoComplete="new-password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className={pwdInputCls}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-white ${isRtl ? 'left-4' : 'right-4'}`}
                >
                  {showPwd.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Update Password Footer */}
          <div className={`pt-6 flex flex-col gap-3 border-t border-gray-800`}>
            {passwordError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#fca5a5' }}>
                <FiAlertCircle size={14} className="flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            <div className={`flex flex-col md:flex-row ${isRtl ? 'md:flex-row-reverse' : ''} justify-between items-center gap-4`}>
              <p className="text-xs text-gray-500">{t('security.minChars')}</p>
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={isSaving || !passwordData.current_password}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-gray-700 hover:border-[#902bd1]"
              >
                {isSaving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <FiLock size={16} />
                }
                {isSaving ? t('security.updating') : t('security.updatePassword')}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PlayerSettings;