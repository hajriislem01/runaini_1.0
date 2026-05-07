import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiLock, FiSave, FiCheck, FiEye, FiEyeOff, FiX, FiUpload } from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const PlayerSettings = () => {
  const { player, isLoading: playerLoading, updatePlayer, photoUrl } = usePlayer();
  const fileRef = useRef(null);

  // Core State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    notes: '',
    height: '',
    weight: ''
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

  // Initialization & Sync
  useEffect(() => {
    // Strict block: Do NOT reset UI data while a save is in progress or user has unsaved edits
    if (!player || isSaving || isPhotoSaving || hasChanges) return;

    setFormData({
      full_name: player.full_name || '',
      phone: player.phone || '',
      address: player.address || '',
      notes: player.notes || '',
      height: player.height || '',
      weight: player.weight || ''
    });

    if (!photoFile) {
      setPreviewURL(photoUrl || null);
    }
  }, [player, isSaving, isPhotoSaving, hasChanges, photoFile, photoUrl]);

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true); // Flag prevents API sync from overwriting local typing
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }

    if (previewURL && previewURL.startsWith('blob:')) {
      URL.revokeObjectURL(previewURL);
    }

    setPhotoFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleCancelPhoto = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (previewURL && previewURL.startsWith('blob:')) {
      URL.revokeObjectURL(previewURL);
    }
    setPhotoFile(null);
    setPreviewURL(photoUrl || null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePhotoUpload = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!photoFile) return;

    setIsPhotoSaving(true);
    
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);

      const res = await API.patch('players/me/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updatePlayer(res.data);
      toast.success('Profile photo updated successfully');
      setPhotoFile(null);
    } catch (err) {
      toast.error('Failed to update photo');
    } finally {
      setIsPhotoSaving(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      const res = await API.patch('players/me/', payload);
      
      updatePlayer(res.data);
      setHasChanges(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Current and new password are required');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      await API.patch('players/me/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  // Render Loader
  if (playerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 md:p-8 lg:p-10 bg-gradient-to-br from-[#050510] via-[#0a0f2a] to-[#180033]">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] to-[#00d0cb] bg-clip-text text-transparent pb-1">
            Settings
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Manage your account profile and security preferences.</p>
        </div>

        {/* Top Section: Photo & Name */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 border border-gray-800 shadow-xl flex flex-col md:flex-row items-center gap-8">
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 transition-colors focus-within:border-[#00d0cb] relative shadow-lg bg-gray-900 flex items-center justify-center">
              {previewURL ? (
                <img src={previewURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl font-bold text-gray-500">
                  {player?.user?.username?.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">{player?.full_name || 'Player Name'}</h2>
            <p className="text-sm text-gray-400 mb-5">@{player?.user?.username}</p>
            
            <input 
              type="file" 
              ref={fileRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handlePhotoSelect} 
            />
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              {!photoFile ? (
                <button 
                  type="button" 
                  onClick={() => fileRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-semibold text-white border border-gray-700 transition-all flex items-center gap-2"
                >
                  <FiUpload size={16} /> Choose new photo
                </button>
              ) : (
                <>
                  <button 
                    type="button" 
                    onClick={handlePhotoUpload}
                    disabled={isPhotoSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#14b8a6] hover:brightness-110 text-sm font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPhotoSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCheck size={16} />
                    )}
                    {isPhotoSaving ? 'Saving...' : 'Confirm Photo'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancelPhoto}
                    disabled={isPhotoSaving}
                    className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiX size={16} /> Cancel
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">JPG or PNG. Max size 5MB.</p>
          </div>
        </div>

        {/* Middle Section: Account Details */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 border border-gray-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-2">
            <FiUser className="text-[#00d0cb]" size={20} />
            <h2 className="text-lg font-bold text-white">Profile Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00d0cb] focus:ring-1 focus:ring-[#00d0cb] transition-all"
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00d0cb] focus:ring-1 focus:ring-[#00d0cb] transition-all"
                placeholder="+216 55 123 456" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</label>
              <input 
                type="text" 
                name="address"
                value={formData.address} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00d0cb] focus:ring-1 focus:ring-[#00d0cb] transition-all"
                placeholder="City, Country" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System Info</label>
              <div className="text-sm text-gray-500 bg-gray-800/30 px-4 py-3 rounded-xl border border-gray-800">
                <span className="text-gray-400">Position:</span> {player?.position || '—'} <span className="mx-2">•</span> <span className="text-gray-400">Group:</span> {player?.group?.name || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Height (cm)</label>
              <input 
                type="number" 
                name="height"
                value={formData.height} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00d0cb] focus:ring-1 focus:ring-[#00d0cb] transition-all"
                placeholder="180" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Weight (kg)</label>
              <input 
                type="number" 
                name="weight"
                value={formData.weight} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00d0cb] focus:ring-1 focus:ring-[#00d0cb] transition-all"
                placeholder="75" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bio / Notes</label>
              <textarea 
                rows={3} 
                name="notes"
                value={formData.notes} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00d0cb] focus:ring-1 focus:ring-[#00d0cb] transition-all resize-none"
                placeholder="Tell us about yourself..." 
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-800 flex justify-end">
            <button 
              type="button" 
              onClick={handleSaveProfile}
              disabled={isSaving || !hasChanges}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:brightness-110 text-sm font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSave size={16} />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Bottom Section: Security */}
        <form 
          onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 border border-gray-800 shadow-xl space-y-6"
        >
          {/* Accessibility hidden username field for password managers to prevent Chrome DOM warnings */}
          <input type="text" name="username" autoComplete="username" value={player?.user?.email || player?.user?.username || ''} readOnly style={{ display: 'none' }} />

          <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-2">
            <FiLock className="text-[#902bd1]" size={20} />
            <h2 className="text-lg font-bold text-white">Security & Password</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
              <div className="relative">
                <input 
                  type={showPwd.current ? "text" : "password"} 
                  name="current_password"
                  autoComplete="current-password"
                  value={passwordData.current_password} 
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 pr-12 focus:outline-none focus:border-[#902bd1] focus:ring-1 focus:ring-[#902bd1] transition-all"
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPwd.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <input 
                  type={showPwd.new ? "text" : "password"} 
                  name="new_password"
                  autoComplete="new-password"
                  value={passwordData.new_password} 
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 pr-12 focus:outline-none focus:border-[#902bd1] focus:ring-1 focus:ring-[#902bd1] transition-all"
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPwd.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showPwd.confirm ? "text" : "password"} 
                  name="confirm_password"
                  autoComplete="new-password"
                  value={passwordData.confirm_password} 
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 pr-12 focus:outline-none focus:border-[#902bd1] focus:ring-1 focus:ring-[#902bd1] transition-all"
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPwd.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">Min 8 characters required.</p>
            <button 
              type="button" 
              onClick={handleSavePassword}
              disabled={isSaving || !passwordData.current_password}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-gray-700"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiLock size={16} />
              )}
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PlayerSettings;