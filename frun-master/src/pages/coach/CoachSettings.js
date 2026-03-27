import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope, FaPhone, FaUserTie, FaTrophy,
  FaPlus, FaTrash
} from 'react-icons/fa';
import { FiSave, FiUpload, FiUsers, FiCalendar, FiAward, FiTarget, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const CoachSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Données du coach depuis l'API
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    years_of_experience: '',
    certification: '',
    address: '',
    notes: '',
    // Philosophie et méthodologie — stockées dans notes (JSON)
    philosophy: {
      development: '',
      tactical: '',
      mental: '',
      culture: ''
    },
    methodology: ['', '', '']
  });

  // Password
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Experiences & Certifications (locales — pas dans l'API pour l'instant)
  const [experiences, setExperiences] = useState([]);
  const [newExperience, setNewExperience] = useState({ role: '', club: '', period: '', description: '' });
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState({ name: '', year: '' });

  // ✅ Fetch coach profile depuis l'API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('coachprofile/');
        const data = response.data;

        // Parse notes si JSON
        let philosophy = { development: '', tactical: '', mental: '', culture: '' };
        let methodology = ['', '', ''];
        let experiences = [];
        let certifications = [];

        try {
          if (data.notes) {
            const parsed = JSON.parse(data.notes);
            philosophy = parsed.philosophy || philosophy;
            methodology = parsed.methodology || methodology;
            experiences = parsed.experiences || [];
            certifications = parsed.certifications || [];
          }
        } catch (e) {}

        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
          years_of_experience: data.years_of_experience || '',
          certification: data.certification || '',
          address: data.address || '',
          notes: data.notes || '',
          philosophy,
          methodology
        });

        setExperiences(experiences);
        setCertifications(certifications);

      } catch (error) {
        toast.error('Failed to load coach profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhilosophyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, philosophy: { ...prev.philosophy, [name]: value } }));
  };

  const handleMethodologyChange = (index, value) => {
    setFormData(prev => {
      const updated = [...prev.methodology];
      updated[index] = value;
      return { ...prev, methodology: updated };
    });
  };

  const addExperience = () => {
    if (newExperience.role && newExperience.club && newExperience.period) {
      setExperiences(prev => [...prev, newExperience]);
      setNewExperience({ role: '', club: '', period: '', description: '' });
    }
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.year) {
      setCertifications(prev => [...prev, newCertification]);
      setNewCertification({ name: '', year: '' });
    }
  };

  // ✅ Submit → PUT /api/coach/profile/
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new_password && passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ Stocke philosophy, methodology, experiences, certifications dans notes (JSON)
      const notesData = JSON.stringify({
        philosophy: formData.philosophy,
        methodology: formData.methodology,
        experiences,
        certifications
      });

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        years_of_experience: formData.years_of_experience,
        certification: formData.certification,
        address: formData.address,
        notes: notesData,
        ...(passwords.new_password && {
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        })
      };

      await API.put('coachprofile/', payload);
      toast.success('Profile updated successfully! ✅');

      // Reset password fields
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });

    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen text-white p-4 sm:p-6 md:p-8 lg:p-10"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Coach Settings
          </h1>
          <p className="text-lg text-gray-300 mt-3">Manage your professional profile</p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">

              {/* Personal Info */}
              <motion.div whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
                <h2 className="text-xl font-bold mb-5 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FaEnvelope className="text-[#4fb0ff]" />Personal Information
                </h2>
                <div className="space-y-4">
                  {[
                    { name: 'first_name', label: 'First Name', placeholder: 'John', type: 'text' },
                    { name: 'last_name', label: 'Last Name', placeholder: 'Doe', type: 'text' },
                    { name: 'email', label: 'Email', placeholder: 'coach@example.com', type: 'email' },
                    { name: 'phone', label: 'Phone', placeholder: '+216 12 345 678', type: 'tel' },
                    { name: 'address', label: 'Address', placeholder: 'City, Country', type: 'text' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                      <input type={field.type} name={field.name} value={formData[field.name]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                        placeholder={field.placeholder} />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Professional Info */}
              <motion.div whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
                <h2 className="text-xl font-bold mb-5 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FaUserTie className="text-[#00d0cb]" />Professional Info
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                    <input type="text" name="specialization" value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                      placeholder="e.g., Youth Development" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience</label>
                    <input type="number" name="years_of_experience" value={formData.years_of_experience}
                      onChange={handleInputChange} min="0"
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                      placeholder="5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Main Certification</label>
                    <input type="text" name="certification" value={formData.certification}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                      placeholder="UEFA Pro License" />
                  </div>
                </div>
              </motion.div>

              {/* Password */}
              <motion.div whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
                <h2 className="text-xl font-bold mb-5 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FiLock className="text-[#902bd1]" />Change Password
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'current_password', label: 'Current Password', placeholder: '••••••' },
                    { key: 'new_password', label: 'New Password', placeholder: 'New password' },
                    { key: 'confirm_password', label: 'Confirm Password', placeholder: 'Confirm password' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'}
                          value={passwords[field.key]}
                          onChange={(e) => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] pr-12"
                          placeholder={field.placeholder} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Coaching Philosophy */}
              <motion.div whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
                <h2 className="text-xl font-bold mb-5 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FiTarget className="text-yellow-400" />Coaching Philosophy
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'development', label: 'Player Development', color: '#4fb0ff' },
                    { name: 'tactical', label: 'Tactical Approach', color: '#00d0cb' },
                    { name: 'mental', label: 'Mental Conditioning', color: '#902bd1' },
                    { name: 'culture', label: 'Team Culture', color: '#10B981' },
                  ].map(item => (
                    <div key={item.name} className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                      <label className="block text-sm font-medium mb-2" style={{ color: item.color }}>
                        {item.label}
                      </label>
                      <textarea name={item.name} value={formData.philosophy[item.name]}
                        onChange={handlePhilosophyChange} rows={3}
                        className="w-full text-sm p-3 bg-gray-800/65 rounded-xl border border-gray-700/30 text-white focus:outline-none focus:ring-1 focus:ring-[#00d0cb]"
                        placeholder={`Describe your ${item.label.toLowerCase()}...`} />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Training Methodology */}
              <motion.div whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
                <h2 className="text-xl font-bold mb-5 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FiCalendar className="text-[#4fb0ff]" />Training Methodology
                </h2>
                <div className="space-y-4">
                  {formData.methodology.map((method, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white mt-2 text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <textarea value={method}
                          onChange={(e) => handleMethodologyChange(index, e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-sm"
                          placeholder={`Training method ${index + 1}...`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Experiences */}
              <motion.div whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
                <h2 className="text-xl font-bold mb-5 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FiCalendar className="text-[#4fb0ff]" />Professional Experience
                </h2>

                <div className="space-y-4 mb-6">
                  {experiences.map((exp, index) => (
                    <motion.div key={index} whileHover={{ x: 4 }}
                      className="flex gap-4 pb-4 border-b border-gray-700/50 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center flex-shrink-0">
                        <FiUsers size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white">{exp.role}</h4>
                            <div className="text-[#00d0cb] text-sm">{exp.club}</div>
                            <div className="text-gray-400 text-xs mt-1">{exp.period}</div>
                            {exp.description && <p className="text-gray-300 text-xs mt-1">{exp.description}</p>}
                          </div>
                          <button type="button" onClick={() => setExperiences(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-400 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/30 rounded-lg">
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-gray-700/50 pt-5">
                  <h3 className="text-lg font-semibold mb-4">Add Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: 'role', placeholder: 'Head Coach' },
                      { name: 'club', placeholder: 'FC Barcelona' },
                      { name: 'period', placeholder: '2018-2021' },
                      { name: 'description', placeholder: 'Key achievements' },
                    ].map(field => (
                      <div key={field.name}>
                        <input type="text" name={field.name} value={newExperience[field.name]}
                          onChange={(e) => setNewExperience(p => ({ ...p, [field.name]: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                          placeholder={field.placeholder} />
                      </div>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button" onClick={addExperience}
                    className="mt-4 flex items-center gap-2 text-white bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] px-5 py-3 rounded-xl font-medium text-sm">
                    <FaPlus />Add Experience
                  </motion.button>
                </div>
              </motion.div>

              {/* Certifications */}
              <motion.div whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
                <h2 className="text-xl font-bold mb-5 pb-4 border-b border-gray-700/50 flex items-center gap-3">
                  <FiAward className="text-yellow-400" />Certifications
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {certifications.map((cert, index) => (
                    <motion.div key={index} whileHover={{ y: -4 }}
                      className="flex gap-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 group relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#00d0cb] flex items-center justify-center flex-shrink-0">
                        <FaTrophy size={14} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{cert.name}</h4>
                        <div className="text-gray-400 text-xs">Year: {cert.year}</div>
                      </div>
                      <button type="button" onClick={() => setCertifications(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded-lg">
                        <FaTrash size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-gray-700/50 pt-5">
                  <h3 className="text-lg font-semibold mb-4">Add Certification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" value={newCertification.name}
                      onChange={(e) => setNewCertification(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                      placeholder="UEFA Pro License" />
                    <input type="text" value={newCertification.year}
                      onChange={(e) => setNewCertification(p => ({ ...p, year: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                      placeholder="2018" />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button" onClick={addCertification}
                    className="mt-4 flex items-center gap-2 text-white bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] px-5 py-3 rounded-xl font-medium text-sm">
                    <FaPlus />Add Certification
                  </motion.button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div whileHover={{ y: -4 }}
                className="bg-gray-900/65 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">* All changes will be saved to your profile</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg disabled:opacity-70">
                    {isSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                    ) : (
                      <><FiSave className="text-xl" />Save All Changes</>
                    )}
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

export default CoachSettings;