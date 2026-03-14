import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiPhone, FiMapPin, FiLock, FiClock, FiCamera,
  FiSave, FiX, FiCheck, FiEye, FiEyeOff, FiSend,
  FiHome, FiAlertCircle,
  FiMail, FiGlobe
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FaTshirt, FaUsersCog, FaRegBuilding } from 'react-icons/fa';
import API from './api';

const toastStyles = {
  success: { duration: 2000, style: { background: 'linear-gradient(to right, #10B981, #059669)', color: '#fff', padding: '16px 20px', borderRadius: '12px' }, icon: '🎉' },
  error: { duration: 3000, style: { background: 'linear-gradient(to right, #EF4444, #DC2626)', color: '#fff', padding: '16px 20px', borderRadius: '12px' }, icon: '❌' },
  warning: { duration: 3000, style: { background: 'linear-gradient(to right, #F59E0B, #D97706)', color: '#fff', padding: '16px 20px', borderRadius: '12px' }, icon: '⚠️' }
};

const northAfricanCountries = [
  { value: 'TN', label: 'Tunisia' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'MA', label: 'Morocco' },
  { value: 'LY', label: 'Libya' },
  { value: 'EG', label: 'Egypt' },
  { value: 'MR', label: 'Mauritania' }
];

const Settings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUpdating, setIsImageUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationStep, setVerificationStep] = useState('phone');
  const [countdown, setCountdown] = useState(0);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [academyData, setAcademyData] = useState({
    name: '',
    founded: '',
    country: '',
    city: '',
    colors: '',
    philosophy: '',
    achievements: '',
    // ✅ URLs pour affichage
    logo_url: null,
    home_kit_url: null,
    away_kit_url: null,
    email: '',
    phone: '',
    website: '',
    facebook: '',
    instagram: '',
    technical_director: '',
    head_coach_name: '',
    fitness_coach: '',
    medical_staff: '',
    stadium_name: '',
    stadium_location: '',
    has_gym: false,
    has_cafeteria: false,
    has_dormitory: false,
  });

  const [preferences, setPreferences] = useState({
    timezone: 'Africa/Tunis',
    languages: ['en']
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // ✅ Fetch academy
  useEffect(() => {
    const fetchAcademy = async () => {
      try {
        const response = await API.get('academy/');
        setAcademyData(response.data);
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error('Failed to load academy data', toastStyles.error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAcademy();
  }, []);

  // ✅ Submit — ne pas envoyer les champs URL (logo_url, home_kit_url, away_kit_url)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!academyData.name?.trim()) {
      toast.error('Academy name is required', toastStyles.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const skipFields = ['logo', 'home_kit', 'away_kit', 'logo_url', 'home_kit_url', 'away_kit_url', 'id', 'created_at', 'updated_at'];

      Object.entries(academyData).forEach(([key, value]) => {
        if (skipFields.includes(key)) return;
        if (value === null || value === undefined) return;
        formData.append(key, value);
      });

      const response = await API.put('academy/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAcademyData(response.data); // ✅ Met à jour avec la réponse complète
      toast.success('Settings updated successfully!', toastStyles.success);
    } catch (error) {
      console.error('Error updating academy:', error.response?.data);
      toast.error('Failed to update settings', toastStyles.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Upload image — utilise logo_url/home_kit_url/away_kit_url pour l'affichage
  const handleImageUpload = async (file, fieldName) => {
    if (!file || isImageUpdating) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file', toastStyles.error);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB', toastStyles.error);
      return;
    }

    setIsImageUpdating(true);

    // ✅ Preview immédiat avant l'upload
    const previewUrl = URL.createObjectURL(file);
    const urlField = `${fieldName}_url`; // logo → logo_url, home_kit → home_kit_url
    setAcademyData(prev => ({ ...prev, [urlField]: previewUrl }));

    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await API.put('academy/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // ✅ Remplace le preview par l'URL réelle du serveur
      setAcademyData(prev => ({
        ...prev,
        [urlField]: response.data[urlField] || previewUrl
      }));

      toast.success('Image updated successfully!', toastStyles.success);
    } catch (error) {
      // ✅ Annule le preview si erreur
      setAcademyData(prev => ({ ...prev, [urlField]: null }));
      toast.error('Failed to upload image', toastStyles.error);
    } finally {
      setIsImageUpdating(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!academyData.phone?.trim()) return;
    setIsSendingCode(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowVerificationModal(true);
      setVerificationStep('code');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowVerificationModal(false);
    setVerificationCode('');
    setVerificationStep('phone');
    toast.success('Phone verified!', toastStyles.success);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster position="top-right" />

      {/* Sidebar */}
      <motion.div variants={itemVariants} className="hidden lg:block fixed left-15 top-15 h-full w-64 z-40">
        <div className="h-full bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 p-6">
          <div className="space-y-2">
            {[
              { href: '#academy-info', icon: <FaRegBuilding />, label: 'Academy Information', sub: 'Configure academy details' },
              { href: '#contact-info', icon: <FiMail />, label: 'Contact & Social', sub: 'Manage contact info' },
              { href: '#facilities', icon: <FiHome />, label: 'Facilities & Staff', sub: 'Manage facilities' },
              { href: '#preferences', icon: <FiClock />, label: 'Preferences', sub: 'Set preferences' },
              { href: '#privacy', icon: <FiLock />, label: 'Privacy & Security', sub: 'Security settings' },
            ].map(item => (
              <motion.a key={item.href} whileHover={{ x: 4 }} href={item.href}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">{item.icon}</div>
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.sub}</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="lg:ml-64">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                  Academy Settings
                </h1>
                <p className="text-gray-300 mt-2">Manage your academy information and preferences</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                type="submit" form="settings-form" disabled={isSubmitting}
                className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}
              >
                {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                ) : (
                  <><FiSave className="text-lg" />Save Changes</>
                )}
              </motion.button>
            </div>
          </motion.div>

          <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">

            {/* Academy Information */}
            <motion.div id="academy-info" variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]"><FaRegBuilding className="text-xl" /></div>
                <div>
                  <h2 className="text-2xl font-bold">Academy Information</h2>
                  <p className="text-gray-400 text-sm">Configure your academy details and branding</p>
                </div>
              </div>

              {/* ✅ Logo — utilise logo_url pour afficher */}
              <div className="mb-10 flex flex-col items-center">
                <div className="relative">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-800/50 border-2 border-gray-700/50">
                    {isImageUpdating && !academyData.logo_url ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00d0cb]"></div>
                      </div>
                    ) : academyData.logo_url ? (
                      <img src={academyData.logo_url} alt="Academy Logo"
                        className="w-full h-full object-contain p-4" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <FaRegBuilding className="text-4xl" />
                      </div>
                    )}
                  </div>
                  <label htmlFor="logo-upload"
                    className="absolute -bottom-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-white p-2 rounded-full cursor-pointer hover:opacity-90 shadow-lg">
                    <FiCamera className="text-xl" />
                  </label>
                  <input type="file" id="logo-upload" className="hidden" accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'logo')} />
                </div>
                <p className="text-center mt-6 text-sm text-gray-400">Click the camera icon to update academy logo</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Academy Name *</label>
                    <input type="text" value={academyData.name || ''}
                      onChange={(e) => setAcademyData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter academy name" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Founded Year</label>
                      <input type="number" value={academyData.founded || ''}
                        onChange={(e) => setAcademyData(p => ({ ...p, founded: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                        placeholder="e.g., 2010" />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Country</label>
                      <select value={academyData.country || ''}
                        onChange={(e) => setAcademyData(p => ({ ...p, country: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                        <option value="" className="bg-gray-900">Select Country</option>
                        {northAfricanCountries.map(c => (
                          <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">City</label>
                    <input type="text" value={academyData.city || ''}
                      onChange={(e) => setAcademyData(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter city" />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Colors</label>
                    <input type="text" value={academyData.colors || ''}
                      onChange={(e) => setAcademyData(p => ({ ...p, colors: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="e.g., Red & White" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Achievements</label>
                    <textarea value={academyData.achievements || ''}
                      onChange={(e) => setAcademyData(p => ({ ...p, achievements: e.target.value }))}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="List your academy's achievements" />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Philosophy</label>
                    <textarea value={academyData.philosophy || ''}
                      onChange={(e) => setAcademyData(p => ({ ...p, philosophy: e.target.value }))}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Describe your academy's philosophy" />
                  </div>
                </div>
              </div>

              {/* ✅ Team Kits — utilise home_kit_url / away_kit_url pour afficher */}
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FaTshirt className="text-[#4fb0ff]" />Team Kits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { field: 'home_kit', urlField: 'home_kit_url', label: 'Home Kit', id: 'home-kit-upload', color: 'from-[#00d0cb] to-[#4fb0ff]' },
                    { field: 'away_kit', urlField: 'away_kit_url', label: 'Away Kit', id: 'away-kit-upload', color: 'from-[#902bd1] to-[#00d0cb]' }
                  ].map(kit => (
                    <div key={kit.field} className="flex flex-col items-center">
                      <label className="block text-gray-300 font-medium mb-4">{kit.label}</label>
                      <div className="relative">
                        <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-800/50 border-2 border-gray-700/50">
                          {academyData[kit.urlField] ? (
                            <img src={academyData[kit.urlField]} alt={kit.label}
                              className="w-full h-full object-contain p-4" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaTshirt className="text-gray-400 text-3xl" />
                            </div>
                          )}
                        </div>
                        <label htmlFor={kit.id}
                          className={`absolute -bottom-3 right-1/2 translate-x-1/2 bg-gradient-to-r ${kit.color} text-white p-2 rounded-full cursor-pointer hover:opacity-90 shadow-lg`}>
                          <FiCamera className="text-xl" />
                        </label>
                        <input type="file" id={kit.id} className="hidden" accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], kit.field)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact & Social */}
            <motion.div id="contact-info" variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4fb0ff]"><FiMail className="text-xl" /></div>
                <div>
                  <h2 className="text-2xl font-bold">Contact & Social Media</h2>
                  <p className="text-gray-400 text-sm">Manage your contact information and social links</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { field: 'email', label: 'Email', type: 'email', placeholder: 'academy@example.com' },
                  { field: 'phone', label: 'Phone', type: 'tel', placeholder: '+216 12 345 678' },
                  { field: 'website', label: 'Website', type: 'url', placeholder: 'https://yourwebsite.com' },
                  { field: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...' },
                  { field: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...' },
                ].map(item => (
                  <div key={item.field}>
                    <label className="block text-gray-300 font-medium mb-2">{item.label}</label>
                    <input type={item.type} value={academyData[item.field] || ''}
                      onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder={item.placeholder} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Staff & Facilities */}
            <motion.div id="facilities" variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]"><FiHome className="text-xl" /></div>
                <div>
                  <h2 className="text-2xl font-bold">Staff & Facilities</h2>
                  <p className="text-gray-400 text-sm">Manage staff and facility information</p>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaUsersCog className="text-[#902bd1]" />Staff Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  { field: 'technical_director', label: 'Technical Director' },
                  { field: 'head_coach_name', label: 'Head Coach' },
                  { field: 'fitness_coach', label: 'Fitness Coach' },
                  { field: 'medical_staff', label: 'Medical Staff' },
                ].map(item => (
                  <div key={item.field}>
                    <label className="block text-gray-300 font-medium mb-2">{item.label}</label>
                    <input type="text" value={academyData[item.field] || ''}
                      onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder={`Enter ${item.label.toLowerCase()}`} />
                  </div>
                ))}
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiHome className="text-[#eab308]" />Facilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { field: 'stadium_name', label: 'Stadium Name', placeholder: 'Enter stadium name' },
                  { field: 'stadium_location', label: 'Stadium Location', placeholder: 'Enter stadium location' },
                ].map(item => (
                  <div key={item.field}>
                    <label className="block text-gray-300 font-medium mb-2">{item.label}</label>
                    <input type="text" value={academyData[item.field] || ''}
                      onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder={item.placeholder} />
                  </div>
                ))}
                {['has_gym', 'has_cafeteria', 'has_dormitory'].map(facility => (
                  <div key={facility} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <span className="font-medium text-gray-300 capitalize">{facility.replace('has_', '')} Available</span>
                    <div className="flex items-center">
                      <button type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${academyData[facility] ? 'bg-[#22c55e]' : 'bg-gray-700'}`}
                        onClick={() => setAcademyData(p => ({ ...p, [facility]: !p[facility] }))}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${academyData[facility] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="ml-3 text-gray-400">{academyData[facility] ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div id="preferences" variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#0020c8]"><FiClock className="text-xl" /></div>
                <div>
                  <h2 className="text-2xl font-bold">Preferences</h2>
                  <p className="text-gray-400 text-sm">Set your language and timezone preferences</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Time Zone</label>
                  <select value={preferences.timezone}
                    onChange={(e) => setPreferences(p => ({ ...p, timezone: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                    <option value="Africa/Tunis" className="bg-gray-900">Tunisia (GMT+1)</option>
                    <option value="Africa/Algiers" className="bg-gray-900">Algeria (GMT+1)</option>
                    <option value="Africa/Casablanca" className="bg-gray-900">Morocco (GMT+1)</option>
                    <option value="Africa/Tripoli" className="bg-gray-900">Libya (GMT+2)</option>
                    <option value="Africa/Cairo" className="bg-gray-900">Egypt (GMT+2)</option>
                    <option value="Africa/Nouakchott" className="bg-gray-900">Mauritania (GMT+0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Languages</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['en', 'fr', 'ar'].map(lang => (
                      <div key={lang} className="flex items-center">
                        <input type="checkbox" id={`lang-${lang}`}
                          checked={preferences.languages.includes(lang)}
                          onChange={(e) => {
                            const langs = e.target.checked
                              ? [...preferences.languages, lang]
                              : preferences.languages.filter(l => l !== lang);
                            setPreferences(p => ({ ...p, languages: langs }));
                          }}
                          className="h-4 w-4 text-[#00d0cb] border-gray-700 rounded" />
                        <label htmlFor={`lang-${lang}`} className="ml-2 text-sm text-gray-300">
                          {lang === 'en' ? 'English' : lang === 'fr' ? 'French' : 'Arabic'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Privacy & Security */}
            <motion.div id="privacy" variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4fb0ff]"><FiLock className="text-xl" /></div>
                <div>
                  <h2 className="text-2xl font-bold">Privacy & Security</h2>
                  <p className="text-gray-400 text-sm">Manage your password and security settings</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'currentPassword', label: 'Current Password', placeholder: '••••••' },
                  { key: 'newPassword', label: 'New Password', placeholder: 'Create a new password' },
                  { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm your new password' }
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-gray-300 font-medium mb-2">{item.label}</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'}
                        value={passwords[item.key]}
                        onChange={(e) => setPasswords(p => ({ ...p, [item.key]: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 pr-12"
                        placeholder={item.placeholder} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </form>
        </div>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700 relative">
              <button onClick={() => { setShowVerificationModal(false); setVerificationStep('phone'); setVerificationCode(''); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPhone className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Phone Verification</h3>
                <p className="text-gray-400">We sent a 6-digit code to {academyData.phone}</p>
              </div>
              {verificationStep === 'code' && (
                <div className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map(index => (
                      <input key={index} type="text" maxLength="1"
                        value={verificationCode[index] || ''}
                        onChange={(e) => {
                          const newCode = verificationCode.split('');
                          newCode[index] = e.target.value;
                          setVerificationCode(newCode.join(''));
                        }}
                        className="w-12 h-12 text-center text-xl bg-gray-800/50 border-2 border-gray-700 rounded-xl focus:border-[#00d0cb] outline-none text-white" />
                    ))}
                  </div>
                  <button onClick={handlePhoneVerification} disabled={countdown > 0}
                    className={`text-sm font-medium ${countdown > 0 ? 'text-gray-500' : 'text-[#00d0cb] hover:text-[#4fb0ff]'}`}>
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                  </button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleVerifyCode}
                    className="w-full px-6 py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                    <FiCheck size={20} />Verify Code
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;