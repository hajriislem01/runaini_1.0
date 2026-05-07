import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../../api';
import { useAdminData } from '../../../../context/AdminContext';
import { toastStyles } from '../utils/settingsConstants';

export const useSettingsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Independent image states for Select -> Preview -> Confirm flow
  const [imageStates, setImageStates] = useState({
    logo: { file: null, preview: null, isUpdating: false },
    home_kit: { file: null, preview: null, isUpdating: false },
    away_kit: { file: null, preview: null, isUpdating: false },
  });

  // Verification Modal State
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
    name: '', founded: '', country: '', city: '',
    colors: '', philosophy: '', achievements: '',
    logo_url: null, home_kit_url: null, away_kit_url: null,
    email: '', phone: '', website: '', facebook: '', instagram: '',
    technical_director: '', head_coach_name: '', fitness_coach: '', medical_staff: '',
    stadium_name: '', stadium_location: '',
    has_gym: false, has_cafeteria: false, has_dormitory: false,
  });

  const [preferences, setPreferences] = useState({
    timezone: 'Africa/Tunis',
    languages: ['en']
  });

  const { adminData, isLoading: isGlobalLoading, updateAdminData } = useAdminData();

  useEffect(() => {
    if (adminData) {
      setAcademyData(adminData);
      // Synchronize image states with database content initially
      setImageStates(prev => ({
        logo: { ...prev.logo, preview: adminData.logo_url || null },
        home_kit: { ...prev.home_kit, preview: adminData.home_kit_url || null },
        away_kit: { ...prev.away_kit, preview: adminData.away_kit_url || null },
      }));
    }
    if (!isGlobalLoading) setIsLoading(false);
  }, [adminData, isGlobalLoading]);

  const handleImageSelect = (file, fieldName) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file', toastStyles.error);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB', toastStyles.error);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], file, preview: previewUrl }
    }));
  };

  const cancelImageSelection = (fieldName) => {
    const originalUrlField = `${fieldName}_url`;
    setImageStates(prev => ({
      ...prev,
      [fieldName]: { 
        file: null, 
        preview: adminData?.[originalUrlField] || null, 
        isUpdating: false 
      }
    }));
  };

  const confirmImageUpload = async (fieldName) => {
    const state = imageStates[fieldName];
    if (!state.file) return;

    setImageStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isUpdating: true }
    }));

    try {
      const formData = new FormData();
      const skipFields = ['logo', 'home_kit', 'away_kit', 'logo_url', 'home_kit_url', 'away_kit_url', 'id', 'created_at', 'updated_at'];
      
      Object.entries(academyData).forEach(([key, value]) => {
        if (skipFields.includes(key) || value === null || value === undefined) return;
        formData.append(key, value);
      });

      formData.append(fieldName, state.file);

      const method = adminData ? 'put' : 'post';
      const response = await API[method]('academy/', formData);

      const urlField = `${fieldName}_url`;
      const updatedData = { ...adminData, ...response.data };
      
      setAcademyData(updatedData);
      setImageStates(prev => ({
        ...prev,
        [fieldName]: { file: null, preview: response.data[urlField], isUpdating: false }
      }));
      updateAdminData(updatedData);

      toast.success('Image updated successfully!', toastStyles.success);
    } catch (error) {
      console.error(`❌ ${fieldName} Upload Error:`, error.response?.data);
      cancelImageSelection(fieldName);
      const data = error.response?.data;
      const errorData = data?.errors || data;
      if (typeof errorData === 'object' && errorData !== null) {
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMessage = Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : JSON.stringify(errorData);
        toast.error(`${firstErrorKey}: ${errorMessage}`, toastStyles.error);
      } else {
        toast.error('Failed to upload image', toastStyles.error);
      }
    } finally {
      setImageStates(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], isUpdating: false }
      }));
    }
  };

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
        if (skipFields.includes(key) || value === null || value === undefined) return;
        formData.append(key, value);
      });

      const method = adminData ? 'put' : 'post';
      const response = await API[method]('academy/', formData);

      const updatedData = response.data;
      setAcademyData(updatedData);
      updateAdminData(updatedData);
      toast.success(adminData ? 'Settings updated successfully!' : 'Academy created successfully!', toastStyles.success);
    } catch (error) {
      const data = error.response?.data;
      const errorData = data?.errors || data;
      if (typeof errorData === 'object' && errorData !== null) {
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMessage = Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : JSON.stringify(errorData);
        toast.error(`${firstErrorKey}: ${errorMessage}`, toastStyles.error);
      } else {
        toast.error('Failed to update settings', toastStyles.error);
      }
    } finally {
      setIsSubmitting(false);
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

  return {
    isLoading, isSubmitting,
    imageStates,
    showPassword, setShowPassword,
    showVerificationModal, setShowVerificationModal,
    verificationCode, setVerificationCode,
    isSendingCode, verificationStep, setVerificationStep, countdown,
    passwords, setPasswords,
    academyData, setAcademyData,
    preferences, setPreferences,
    handleSubmit,
    handleImageSelect, confirmImageUpload, cancelImageSelection,
    handlePhoneVerification, handleVerifyCode
  };
};
