import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../../api';
import { useAdminData } from '../../../../context/AdminContext';
import { toastStyles } from '../utils/settingsConstants';

export const useSettingsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUpdating, setIsImageUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
    if (adminData) setAcademyData(adminData);
    if (!isGlobalLoading) setIsLoading(false);
  }, [adminData, isGlobalLoading]);

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

      const response = await API.put('academy/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAcademyData(response.data);
      updateAdminData(response.data);
      toast.success('Settings updated successfully!', toastStyles.success);
    } catch (error) {
      toast.error('Failed to update settings', toastStyles.error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    const previewUrl = URL.createObjectURL(file);
    const urlField = `${fieldName}_url`;
    setAcademyData(prev => ({ ...prev, [urlField]: previewUrl }));

    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await API.put('academy/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedData = {
        ...adminData,
        ...response.data,
        [urlField]: response.data[urlField] || previewUrl
      };
      
      setAcademyData(prev => ({
        ...prev,
        [urlField]: response.data[urlField] || previewUrl
      }));
      updateAdminData(updatedData);

      toast.success('Image updated successfully!', toastStyles.success);
    } catch (error) {
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

  return {
    isLoading, isSubmitting, isImageUpdating,
    showPassword, setShowPassword,
    showVerificationModal, setShowVerificationModal,
    verificationCode, setVerificationCode,
    isSendingCode, verificationStep, setVerificationStep, countdown,
    passwords, setPasswords,
    academyData, setAcademyData,
    preferences, setPreferences,
    handleSubmit, handleImageUpload,
    handlePhoneVerification, handleVerifyCode
  };
};
