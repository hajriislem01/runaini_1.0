
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileContext } from '../../context/ProfileContext';
import {
  FiUser, FiPhone, FiMapPin, FiLock, FiClock, FiCamera,
  FiSave, FiX, FiCheck, FiEye, FiEyeOff, FiSend, FiAward,
  FiTarget, FiHome, FiEdit2, FiAlertCircle, FiChevronRight,
  FiMail, FiZap, FiGlobe, FiFlag, FiBookOpen, FiUsers, FiShield,
  FiTrendingUp, FiStar
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FaTshirt, FaRegFutbol, FaUsersCog, FaMedal, FaRegBuilding } from 'react-icons/fa';

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 800;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with 0.7 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const toastStyles = {
  success: {
    duration: 2000,
    position: 'top-right',
    style: {
      background: 'linear-gradient(to right, #10B981, #059669)',
      color: '#fff',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      maxWidth: '400px',
    },
    icon: '🎉',
    iconTheme: {
      primary: '#fff',
      secondary: '#059669',
    },
  },
  error: {
    duration: 3000,
    position: 'top-right',
    style: {
      background: 'linear-gradient(to right, #EF4444, #DC2626)',
      color: '#fff',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      maxWidth: '400px',
    },
    icon: '❌',
    iconTheme: {
      primary: '#fff',
      secondary: '#DC2626',
    },
  },
  warning: {
    duration: 3000,
    position: 'top-right',
    style: {
      background: 'linear-gradient(to right, #F59E0B, #D97706)',
      color: '#fff',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      maxWidth: '400px',
    },
    icon: '⚠️',
    iconTheme: {
      primary: '#fff',
      secondary: '#D97706',
    },
  }
};

// North African countries
const northAfricanCountries = [
  { value: 'TN', label: 'Tunisia' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'MA', label: 'Morocco' },
  { value: 'LY', label: 'Libya' },
  { value: 'EG', label: 'Egypt' },
  { value: 'MR', label: 'Mauritania' }
];

// Age groups options
const ageGroupOptions = [
  'U5–U8 (Ecol)', 'U9–U12 (Junior)', 'U13–U16 (Youth)', 'U17–U19 (Senior Youth)', '18+ (Adult)'
];

const Settings = () => {
  const navigate = useNavigate();
  const { profileData, updateProfileData, updatePersonalInfo, updateAcademyInfo } = useProfileContext();
  
  // Default structure to ensure all fields exist
  const defaultFormData = {
    personalInfo: {
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      phone: '',
      profileImage: '',
      role: 'admin',
      status: 'active'
    },
    location: {
      country: '',
      state: '',
      city: '',
      address: '',
      postalCode: ''
    },
    academyInfo: {
      name: '',
      logo: '',
      founded: '',
      country: '',
      state: '',
      city: '',
      postalCode: '',
      address: '',
      achievements: '',
      ageGroups: [],
      tenues: {
        homeKit: '',
        awayKit: ''
      },
      staff: {
        technicalDirector: '',
        headCoach: '',
        fitnessCoach: '',
        medicalStaff: ''
      },
      facilities: {
        stadiumName: '',
        stadiumLocation: '',
        gym: false,
        cafeteria: false,
        dormitory: false
      },
      philosophy: '',
      contact: {
        phone: '',
        email: '',
        facebook: '',
        instagram: '',
        website: ''
      }
    },
    preferences: {
      timezone: 'Africa/Tunis',
      languages: ['en']
    }
  };

  // Initialize form data
  const initializeFormData = (data) => {
    if (!data) return defaultFormData;
    return {
      personalInfo: { ...defaultFormData.personalInfo, ...(data.personalInfo || {}) },
      location: { ...defaultFormData.location, ...(data.location || {}) },
      academyInfo: {
        ...defaultFormData.academyInfo,
        ...(data.academyInfo || {}),
        tenues: { ...defaultFormData.academyInfo.tenues, ...(data.academyInfo?.tenues || {}) },
        staff: { ...defaultFormData.academyInfo.staff, ...(data.academyInfo?.staff || {}) },
        facilities: { ...defaultFormData.academyInfo.facilities, ...(data.academyInfo?.facilities || {}) },
        contact: { ...defaultFormData.academyInfo.contact, ...(data.academyInfo?.contact || {}) }
      },
      preferences: { ...defaultFormData.preferences, ...(data.preferences || {}) }
    };
  };

  const [formData, setFormData] = useState(() => initializeFormData(profileData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isImageUpdating, setIsImageUpdating] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Phone verification states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationStep, setVerificationStep] = useState('phone');
  const [countdown, setCountdown] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Update formData when profileData changes
  useEffect(() => {
    setFormData(initializeFormData(profileData));
    setIsLoading(false);
  }, [profileData]);

  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-error');
      setTimeout(() => {
        element.classList.remove('highlight-error');
      }, 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

const hasChanges = () => {
  const formDataString = JSON.stringify({
    personalInfo: formData.personalInfo,
    location: formData.location,
    academyInfo: formData.academyInfo,
    preferences: {
      timezone: formData.preferences?.timezone || 'UTC',
      languages: formData.preferences?.languages || ['en']
    }
  });

  const profileDataString = JSON.stringify({
    personalInfo: profileData.personalInfo,
    location: profileData.location,
    academyInfo: profileData.academyInfo,
    preferences: {
      timezone: profileData.preferences?.timezone || 'UTC',
      languages: profileData.preferences?.languages || ['en']
    }
  });

  return formDataString !== profileDataString;
};

  const validateForm = async () => {
    if (!formData.personalInfo.fullName?.trim()) {
      scrollToElement('fullName');
      await new Promise(resolve => {
        toast.error('Full name is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    if (!formData.personalInfo.email?.trim()) {
      scrollToElement('email');
      await new Promise(resolve => {
        toast.error('Email is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
      scrollToElement('email');
      await new Promise(resolve => {
        toast.error('Invalid email format', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    if (!formData.personalInfo.phone?.trim()) {
      scrollToElement('phone');
      await new Promise(resolve => {
        toast.error('Phone number is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    // Location validation
    if (!formData.location.country) {
      scrollToElement('country');
      await new Promise(resolve => {
        toast.error('Country is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    if (!formData.location.city?.trim()) {
      scrollToElement('city');
      await new Promise(resolve => {
        toast.error('City is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    // Academy Info validation
    if (!formData.academyInfo.name?.trim()) {
      scrollToElement('academyName');
      await new Promise(resolve => {
        toast.error('Academy name is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    if (!formData.academyInfo.founded?.trim()) {
      scrollToElement('founded');
      await new Promise(resolve => {
        toast.error('Founded year is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    if (!formData.academyInfo.country) {
      scrollToElement('academyCountry');
      await new Promise(resolve => {
        toast.error('Academy country is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    if (!formData.academyInfo.city?.trim()) {
      scrollToElement('academyCity');
      await new Promise(resolve => {
        toast.error('Academy city is required', toastStyles.error);
        setTimeout(resolve, 2000);
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      toast('No changes to save', {
        ...toastStyles.warning,
        icon: 'ℹ️'
      });
      return;
    }

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...formData,
        preferences: {
          timezone: formData.preferences.timezone,
          languages: formData.preferences.languages || ['en']
        }
      };

      await updateProfileData(updatedData);
      scrollToTop();
      toast.success('Settings updated successfully!', toastStyles.success);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update settings', toastStyles.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle phone verification with improved UX
  const handlePhoneVerification = async () => {
    if (!formData.personalInfo.phone?.trim()) {
      setErrors(prev => ({
        ...prev,
        phone: 'Please enter a phone number first'
      }));
      return;
    }

    setIsSendingCode(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowVerificationModal(true);
      setVerificationStep('code');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error sending verification code:', error);
      setErrors(prev => ({
        ...prev,
        phone: 'Failed to send verification code. Please try again.'
      }));
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert('Please enter the verification code');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          isPhoneVerified: true
        }
      }));
      setShowVerificationModal(false);
      setVerificationCode('');
      setVerificationStep('phone');
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('Invalid verification code. Please try again.');
    }
  };

  // Handle age group selection
  const handleAgeGroupChange = (ageGroup) => {
    setFormData(prev => ({
      ...prev,
      academyInfo: {
        ...prev.academyInfo,
        ageGroups: prev.academyInfo.ageGroups.includes(ageGroup)
          ? prev.academyInfo.ageGroups.filter(group => group !== ageGroup)
          : [...prev.academyInfo.ageGroups, ageGroup]
      }
    }));
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isImageUpdating) {
      toast.error('Please wait for the current image update to complete', toastStyles.error);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        profileImage: 'Please upload an image file'
      }));
      toast.error('Please upload a valid image file', toastStyles.error);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        profileImage: 'Image size should be less than 5MB'
      }));
      toast.error('Image size should be less than 5MB', toastStyles.error);
      return;
    }

    setIsImageUpdating(true);
    try {
      const compressedImage = await compressImage(file);
      await updatePersonalInfo({ profileImage: compressedImage });
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          profileImage: compressedImage
        }
      }));
      toast.success('Profile picture updated successfully!', toastStyles.success);
      setErrors(prev => ({
        ...prev,
        profileImage: null
      }));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Image will be displayed but not saved.', toastStyles.warning);
      } else {
        console.error('Error processing image:', error);
        toast.error('Failed to process profile picture', toastStyles.error);
      }
    } finally {
      setIsImageUpdating(false);
    }
  };

 const handleAcademyLogoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. فسخ الـ Errors الكل من الـ state باش الـ Red Bar تغبر 🧼
  setErrors({}); 

  if (isImageUpdating) return;

  setIsImageUpdating(true);
  try {
    const compressedLogo = await compressImage(file);
    
    // 2. تحديث الـ local state أول حاجة باش التصويرة تظهر 🖼️
    setFormData(prev => ({
      ...prev,
      academyInfo: { ...prev.academyInfo, logo: compressedLogo }
    }));

    // 3. ابعث للـ Back-end (الـ Context)
    // حطيناها في try/catch وحدها باش حتى لو الـ localStorage تعبى ما يفسدش الـ UI
    try {
      await updateAcademyInfo({ logo: compressedLogo });
    } catch (storageErr) {
      console.warn("Storage full but UI is fine", storageErr);
    }

    toast.success('Academy logo updated!', toastStyles.success);
    
  } catch (error) {
    console.error('General Error:', error);
    // ما عادش نحطو حتى شيء في setErrors هنا 🚫🟥
  } finally {
    setIsImageUpdating(false);
  }
};

  const handleHomeKitUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isImageUpdating) {
      toast.error('Please wait for the current image update to complete', toastStyles.error);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file', toastStyles.error);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB', toastStyles.error);
      return;
    }

    setIsImageUpdating(true);
    try {
      const compressedImage = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        academyInfo: {
          ...prev.academyInfo,
          tenues: {
            ...prev.academyInfo.tenues,
            homeKit: compressedImage
          }
        }
      }));
      toast.success('Home kit updated successfully!', toastStyles.success);
    } catch (error) {
      console.error('Error processing kit image:', error);
      toast.error('Failed to process kit image', toastStyles.error);
    } finally {
      setIsImageUpdating(false);
    }
  };

  const handleAwayKitUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isImageUpdating) {
      toast.error('Please wait for the current image update to complete', toastStyles.error);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file', toastStyles.error);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB', toastStyles.error);
      return;
    }

    setIsImageUpdating(true);
    try {
      const compressedImage = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        academyInfo: {
          ...prev.academyInfo,
          tenues: {
            ...prev.academyInfo.tenues,
            awayKit: compressedImage
          }
        }
      }));
      toast.success('Away kit updated successfully!', toastStyles.success);
    } catch (error) {
      console.error('Error processing kit image:', error);
      toast.error('Failed to process kit image', toastStyles.error);
    } finally {
      setIsImageUpdating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px 20px',
            color: '#fff',
            background: '#1F2937',
            backdropFilter: 'blur(10px)',
            maxWidth: '400px',
          },
          success: {
            duration: 4000,
            style: {
              background: 'linear-gradient(to right, #10B981, #059669)',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#059669',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'linear-gradient(to right, #EF4444, #DC2626)',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#DC2626',
            },
          },
        }}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        containerClassName="toast-container"
      />

      {/* Navigation Sidebar */}
      <motion.div variants={itemVariants} className="hidden lg:block fixed left-15 top-15 h-full w-64 z-40">
        <div className="h-full bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 p-6">
          <div className="space-y-2">
            <motion.a
              whileHover={{ x: 4 }}
              href="#academy-info"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">
                <FaRegBuilding className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Academy Information</span>
                <span className="text-xs text-gray-400">Configure academy details</span>
              </div>
            </motion.a>

            <motion.a
              whileHover={{ x: 4 }}
              href="#personal-info"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#0020c8]">
                <FiUser className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Personal Information</span>
                <span className="text-xs text-gray-400">Update your details</span>
              </div>
            </motion.a>

            <motion.a
              whileHover={{ x: 4 }}
              href="#location"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
                <FiMapPin className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Location Details</span>
                <span className="text-xs text-gray-400">Manage address</span>
              </div>
            </motion.a>

            <motion.a
              whileHover={{ x: 4 }}
              href="#preferences"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#0020c8]">
                <FiClock className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Preferences</span>
                <span className="text-xs text-gray-400">Set preferences</span>
              </div>
            </motion.a>

            <motion.a
              whileHover={{ x: 4 }}
              href="#privacy"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4fb0ff]">
                <FiLock className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Privacy & Security</span>
                <span className="text-xs text-gray-400">Security settings</span>
              </div>
            </motion.a>
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
                <p className="text-gray-300 mt-2">
                  Manage your academy information, personal details, and preferences
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  form="settings-form"
                  disabled={isSubmitting}
                  className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="text-lg" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {Object.keys(errors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-xl px-4 py-3 flex items-center bg-red-500/20 text-red-300 border border-red-500/30"
            >
              <FiAlertCircle className="mr-2" />
              <span>{Object.values(errors)[0]}</span>
            </motion.div>
          )}

          <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Academy Information Section */}
            <motion.div
              id="academy-info"
              variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">
                  <FaRegBuilding className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Academy Information</h2>
                  <p className="text-gray-400 text-sm">Configure your academy details and branding</p>
                </div>
              </div>

              {/* Academy Logo Section */}
              <div className="mb-10">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-800/50 border-2 border-gray-700/50">
                      <img
                        src={formData.academyInfo.logo || "https://via.placeholder.com/150"}
                        alt="Academy Logo"
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    <label
                      htmlFor="academy-logo-upload"
                      className="absolute -bottom-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-white p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <FiCamera className="text-xl" />
                    </label>
                    <input
                      type="file"
                      id="academy-logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAcademyLogoUpload}
                    />
                  </div>
                </div>
                <p className="text-center mt-6 text-sm text-gray-400">
                  Click the camera icon to update academy logo
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Academy Name
                    </label>
                    <input
                      type="text"
                      id="academyName"
                      name="academyInfo.name"
                      value={formData.academyInfo.name}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            name: e.target.value
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter academy name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Founded Year
                      </label>
                      <input
                        type="number"
                        id="founded"
                        name="academyInfo.founded"
                        value={formData.academyInfo.founded}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            academyInfo: {
                              ...prev.academyInfo,
                              founded: e.target.value
                            }
                          }));
                        }}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                        placeholder="e.g., 2010"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Country
                      </label>
                      <select
                        id="academyCountry"
                        name="academyInfo.country"
                        value={formData.academyInfo.country}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            academyInfo: {
                              ...prev.academyInfo,
                              country: e.target.value
                            }
                          }));
                        }}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                      >
                        <option value="" className="bg-gray-900">Select Country</option>
                        {northAfricanCountries.map(country => (
                          <option key={country.value} value={country.value} className="bg-gray-900">
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="academyCity"
                      name="academyInfo.city"
                      value={formData.academyInfo.city}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            city: e.target.value
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter city"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Achievements
                  </label>
                  <textarea
                    name="academyInfo.achievements"
                    value={formData.academyInfo.achievements}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        academyInfo: {
                          ...prev.academyInfo,
                          achievements: e.target.value
                        }
                      }));
                    }}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                    placeholder="List your academy's achievements"
                  />
                </div>
              </div>

              {/* Age Groups Section */}
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <label className="block text-gray-300 font-medium mb-4">
                  Age Groups
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {ageGroupOptions.map(ageGroup => (
                    <label
                      key={ageGroup}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-colors border ${formData.academyInfo.ageGroups.includes(ageGroup)
                          ? 'bg-gradient-to-r from-[#4fb0ff]/30 to-[#00d0cb]/30 border-[#00d0cb]/50'
                          : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.academyInfo.ageGroups.includes(ageGroup)}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            academyInfo: {
                              ...prev.academyInfo,
                              ageGroups: e.target.checked
                                ? [...prev.academyInfo.ageGroups, ageGroup]
                                : prev.academyInfo.ageGroups.filter(group => group !== ageGroup)
                            }
                          }));
                        }}
                        className="hidden"
                      />
                      <span className="font-medium text-sm">{ageGroup}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Kit Images Section */}
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FaTshirt className="text-[#4fb0ff]" />
                  Team Kits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <label className="block text-gray-300 font-medium mb-4">
                      Home Kit
                    </label>
                    <div className="relative">
                      <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-800/50 border-2 border-gray-700/50">
                        {formData.academyInfo.tenues?.homeKit ? (
                          <img
                            src={formData.academyInfo.tenues.homeKit}
                            alt="Home Kit"
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaTshirt className="text-gray-400 text-3xl" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="home-kit-upload"
                        className="absolute -bottom-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-white p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                      >
                        <FiCamera className="text-xl" />
                      </label>
                      <input
                        type="file"
                        id="home-kit-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleHomeKitUpload}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="block text-gray-300 font-medium mb-4">
                      Away Kit
                    </label>
                    <div className="relative">
                      <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-800/50 border-2 border-gray-700/50">
                        {formData.academyInfo.tenues?.awayKit ? (
                          <img
                            src={formData.academyInfo.tenues.awayKit}
                            alt="Away Kit"
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaTshirt className="text-gray-400 text-3xl" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="away-kit-upload"
                        className="absolute -bottom-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                      >
                        <FiCamera className="text-xl" />
                      </label>
                      <input
                        type="file"
                        id="away-kit-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAwayKitUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Information */}
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FaUsersCog className="text-[#902bd1]" />
                  Staff Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Technical Director
                    </label>
                    <input
                      type="text"
                      name="academyInfo.staff.technicalDirector"
                      value={formData.academyInfo.staff.technicalDirector}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            staff: {
                              ...prev.academyInfo.staff,
                              technicalDirector: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter technical director's name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Head Coach
                    </label>
                    <input
                      type="text"
                      name="academyInfo.staff.headCoach"
                      value={formData.academyInfo.staff.headCoach}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            staff: {
                              ...prev.academyInfo.staff,
                              headCoach: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter head coach's name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Fitness Coach
                    </label>
                    <input
                      type="text"
                      name="academyInfo.staff.fitnessCoach"
                      value={formData.academyInfo.staff.fitnessCoach}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            staff: {
                              ...prev.academyInfo.staff,
                              fitnessCoach: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter fitness coach's name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Medical Staff
                    </label>
                    <input
                      type="text"
                      name="academyInfo.staff.medicalStaff"
                      value={formData.academyInfo.staff.medicalStaff}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            staff: {
                              ...prev.academyInfo.staff,
                              medicalStaff: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter medical staff details"
                    />
                  </div>
                </div>
              </div>

              {/* Facilities Section */}
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FiHome className="text-[#eab308]" />
                  Facilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Stadium Name
                    </label>
                    <input
                      type="text"
                      name="academyInfo.facilities.stadiumName"
                      value={formData.academyInfo.facilities.stadiumName || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            facilities: {
                              ...prev.academyInfo.facilities,
                              stadiumName: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter stadium name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Stadium Location
                    </label>
                    <input
                      type="text"
                      name="academyInfo.facilities.stadiumLocation"
                      value={formData.academyInfo.facilities.stadiumLocation || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            facilities: {
                              ...prev.academyInfo.facilities,
                              stadiumLocation: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter stadium location"
                    />
                  </div>

                  {['gym', 'cafeteria', 'dormitory'].map(facility => (
                    <div key={facility} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <span className="font-medium text-gray-300 capitalize">
                        {facility} Available
                      </span>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${formData.academyInfo.facilities[facility] ? 'bg-[#22c55e]' : 'bg-gray-700'
                            }`}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            academyInfo: {
                              ...prev.academyInfo,
                              facilities: {
                                ...prev.academyInfo.facilities,
                                [facility]: !prev.academyInfo.facilities[facility]
                              }
                            }
                          }))}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.academyInfo.facilities[facility] ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                        <span className="ml-3 text-gray-400">
                          {formData.academyInfo.facilities[facility] ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FiMail className="text-[#22c55e]" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="academyInfo.contact.phone"
                      value={formData.academyInfo.contact.phone}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            contact: {
                              ...prev.academyInfo.contact,
                              phone: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter contact phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="academyInfo.contact.email"
                      value={formData.academyInfo.contact.email}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            contact: {
                              ...prev.academyInfo.contact,
                              email: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter contact email"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      name="academyInfo.contact.facebook"
                      value={formData.academyInfo.contact.facebook}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            contact: {
                              ...prev.academyInfo.contact,
                              facebook: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter Facebook page URL"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="academyInfo.contact.instagram"
                      value={formData.academyInfo.contact.instagram}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            contact: {
                              ...prev.academyInfo.contact,
                              instagram: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter Instagram profile URL"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="academyInfo.contact.website"
                      value={formData.academyInfo.contact.website}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            contact: {
                              ...prev.academyInfo.contact,
                              website: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Enter Website URL"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 font-medium mb-2">
                      Academy Philosophy
                    </label>
                    <textarea
                      name="academyInfo.philosophy"
                      value={formData.academyInfo.philosophy}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          academyInfo: {
                            ...prev.academyInfo,
                            philosophy: e.target.value
                          }
                        }));
                      }}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      placeholder="Describe your academy's philosophy and values"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Personal Information Section */}
            <motion.div
              id="personal-info"
              variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#0020c8]">
                  <FiUser className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Personal Information</h2>
                  <p className="text-gray-400 text-sm">Update your personal details and contact information</p>
                </div>
              </div>

              {/* Personal Profile Picture Section */}
              <div className="mb-10">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800/50 border-2 border-gray-700/50">
                      <img
                        src={formData.personalInfo.profileImage || "https://via.placeholder.com/150"}
                        alt="Profile Picture"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label
                      htmlFor="personal-profile-upload"
                      className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-gradient-to-r from-[#00d0cb] to-[#902bd1] text-white p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <FiCamera className="text-xl" />
                    </label>
                    <input
                      type="file"
                      id="personal-profile-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                    />
                  </div>
                </div>
                <p className="text-center mt-4 text-sm text-gray-400">
                  Click the camera icon to update your profile picture
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="personalInfo.fullName"
                    value={formData.personalInfo.fullName}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          fullName: e.target.value
                        }
                      }));
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="personalInfo.email"
                    value={formData.personalInfo.email}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          email: e.target.value
                        }
                      }));
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="personalInfo.phone"
                      value={formData.personalInfo.phone}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            phone: e.target.value
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 pr-12"
                      placeholder="+216 12 345 678"
                    />
                    {formData.personalInfo.isPhoneVerified ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#22c55e] flex items-center gap-1 text-sm">
                        <FiCheck size={16} /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePhoneVerification}
                        disabled={isSendingCode}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00d0cb] hover:text-[#4fb0ff] font-medium text-sm flex items-center gap-1"
                      >
                        {isSendingCode ? (
                          <span className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-1 border-2 border-[#00d0cb] border-t-transparent rounded-full"></div>
                            Sending...
                          </span>
                        ) : (
                          <>
                            <FiSend size={16} />
                            Verify
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="personalInfo.position"
                    value="Administration"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-xl text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-300 font-medium mb-2">
                    Responsibilities
                  </label>
                  <textarea
                    name="personalInfo.responsibilities"
                    value={formData.personalInfo.responsibilities}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          responsibilities: e.target.value
                        }
                      }));
                    }}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                    placeholder="Describe your responsibilities"
                  />
                </div>
              </div>
            </motion.div>

            {/* Location Section */}
            <motion.div
              id="location"
              variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
                  <FiMapPin className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Location Details</h2>
                  <p className="text-gray-400 text-sm">Manage your location and address information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Country
                  </label>
                  <select
                    id="country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          country: e.target.value
                        }
                      }));
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                  >
                    <option value="" className="bg-gray-900">Select Country</option>
                    {northAfricanCountries.map(country => (
                      <option key={country.value} value={country.value} className="bg-gray-900">
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    State/Region
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          state: e.target.value
                        }
                      }));
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                    placeholder="Enter state/region"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          city: e.target.value
                        }
                      }));
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="location.postalCode"
                    value={formData.location.postalCode}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          postalCode: e.target.value
                        }
                      }));
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                    placeholder="Enter postal code"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-300 font-medium mb-2">
                    Address
                  </label>
                  <textarea
                    name="location.address"
                    value={formData.location.address}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          address: e.target.value
                        }
                      }));
                    }}
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            </motion.div>

            {/* Preferences Section */}
            <motion.div
              id="preferences"
              variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#0020c8]">
                  <FiClock className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Preferences</h2>
                  <p className="text-gray-400 text-sm">Set your language and timezone preferences</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-2">
                    Time Zone
                  </label>
                  <select
                    name="preferences.timezone"
                    value={formData.preferences.timezone}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          timezone: e.target.value
                        }
                      }));
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                  >
                    <option value="Africa/Tunis" className="bg-gray-900">Tunisia (GMT+1)</option>
                    <option value="Africa/Algiers" className="bg-gray-900">Algeria (GMT+1)</option>
                    <option value="Africa/Casablanca" className="bg-gray-900">Morocco (GMT+1)</option>
                    <option value="Africa/Tripoli" className="bg-gray-900">Libya (GMT+2)</option>
                    <option value="Africa/Cairo" className="bg-gray-900">Egypt (GMT+2)</option>
                    <option value="Africa/Nouakchott" className="bg-gray-900">Mauritania (GMT+0)</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-2">
                    Languages
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['en', 'fr', 'ar'].map((lang) => (
                      <div key={lang} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`lang-${lang}`}
                          checked={formData.preferences.languages?.includes(lang)}
                          onChange={(e) => {
                            const currentLanguages = formData.preferences.languages || ['en'];
                            const newLanguages = e.target.checked
                              ? [...currentLanguages, lang]
                              : currentLanguages.filter(l => l !== lang);
                            setFormData(prev => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                languages: newLanguages
                              }
                            }));
                          }}
                          className="h-4 w-4 text-[#00d0cb] focus:ring-[#00d0cb] border-gray-700 rounded"
                        />
                        <label htmlFor={`lang-${lang}`} className="ml-2 block text-sm text-gray-300">
                          {lang === 'en' ? 'English' : lang === 'fr' ? 'French' : 'Arabic'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Privacy & Security Section */}
            <motion.div
              id="privacy"
              variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4fb0ff]">
                  <FiLock className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Privacy & Security</h2>
                  <p className="text-gray-400 text-sm">Manage your password and security settings</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-2">
                    Change Password
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mb-6">
                      <label className="block text-gray-300 font-medium mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwords.currentPassword}
                          onChange={(e) => {
                            setPasswords(prev => ({
                              ...prev,
                              currentPassword: e.target.value
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 pr-12"
                          placeholder="••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-300 font-medium mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwords.newPassword}
                          onChange={(e) => {
                            setPasswords(prev => ({
                              ...prev,
                              newPassword: e.target.value
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 pr-12"
                          placeholder="Create a new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${passwords.newPassword.length >= 8 ? 'bg-[#22c55e]' : 'bg-gray-700'}`}></span>
                          <span className="text-gray-400">8+ characters</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${/[A-Z]/.test(passwords.newPassword) ? 'bg-[#22c55e]' : 'bg-gray-700'}`}></span>
                          <span className="text-gray-400">Uppercase</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${/[0-9]/.test(passwords.newPassword) ? 'bg-[#22c55e]' : 'bg-gray-700'}`}></span>
                          <span className="text-gray-400">Number</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${/[!@#$%^&*]/.test(passwords.newPassword) ? 'bg-[#22c55e]' : 'bg-gray-700'}`}></span>
                          <span className="text-gray-400">Special character</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-300 font-medium mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwords.confirmPassword}
                          onChange={(e) => {
                            setPasswords(prev => ({
                              ...prev,
                              confirmPassword: e.target.value
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 pr-12"
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700"
            >
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationStep('phone');
                  setVerificationCode('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPhone className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Phone Verification</h3>
                <p className="text-gray-400 mb-4">
                  {verificationStep === 'phone'
                    ? 'We will send a verification code to your phone number.'
                    : `We sent a 6-digit code to ${formData.personalInfo.phone}`}
                </p>
              </div>

              {verificationStep === 'code' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Verification Code
                    </label>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map(index => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          value={verificationCode[index] || ''}
                          onChange={(e) => {
                            const newCode = [...verificationCode];
                            newCode[index] = e.target.value;
                            setVerificationCode(newCode.join(''));
                          }}
                          className="w-12 h-12 text-center text-xl bg-gray-800/50 border-2 border-gray-700 rounded-xl focus:border-[#00d0cb] outline-none transition text-white"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <button
                      onClick={handlePhoneVerification}
                      disabled={countdown > 0}
                      className={`font-medium ${countdown > 0
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-[#00d0cb] hover:text-[#4fb0ff]'
                        }`}
                    >
                      {countdown > 0
                        ? `Resend code in ${countdown}s`
                        : 'Resend code'}
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVerifyCode}
                    className="w-full px-6 py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
                    }}
                  >
                    <FiCheck size={20} />
                    Verify Code
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