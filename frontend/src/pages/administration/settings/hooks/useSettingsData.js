import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../../api';
import { useAdminData } from '../../../../context/AdminContext';

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
      toast.error('Please upload a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], file, preview: previewUrl }
    }));
  };

  const removeImage = async (fieldName) => {
    setImageStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isUpdating: true }
    }));

    try {
      const formData = new FormData();
      formData.append(`remove_${fieldName}`, 'true');

      const response = await API.put('academy/', formData);

      const urlField = `${fieldName}_url`;
      const updatedData = { ...adminData, ...response.data, [fieldName]: null, [urlField]: null };

      setAcademyData(updatedData);
      setImageStates(prev => ({
        ...prev,
        [fieldName]: { file: null, preview: null, isUpdating: false }
      }));
      updateAdminData(updatedData);

      toast.success('Image removed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove image');
      setImageStates(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], isUpdating: false }
      }));
    }
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

      toast.success('Image updated successfully!');
    } catch (error) {
      console.error(`❌ ${fieldName} Upload Error:`, error.response?.data);
      cancelImageSelection(fieldName);
      const data = error.response?.data;
      const errorData = data?.errors || data;
      if (typeof errorData === 'object' && errorData !== null) {
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMessage = Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : JSON.stringify(errorData);
        toast.error(`${firstErrorKey}: ${errorMessage}`);
      } else {
        toast.error('Failed to upload image');
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
      toast.error('Academy name is required');
      return;
    }

    // Password validation if user is trying to update it via "Save Changes"
    const isUpdatingPassword = passwords.currentPassword || passwords.newPassword;
    if (isUpdatingPassword) {
      if (!passwords.currentPassword || !passwords.newPassword) {
        toast.error('Both current and new password are required');
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (passwords.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const skipFields = ['logo', 'home_kit', 'away_kit', 'logo_url', 'home_kit_url', 'away_kit_url', 'id', 'created_at', 'updated_at'];

      Object.entries(academyData).forEach(([key, value]) => {
        if (skipFields.includes(key) || value === null || value === undefined) return;
        formData.append(key, value);
      });

      if (isUpdatingPassword) {
        formData.append('current_password', passwords.currentPassword);
        formData.append('new_password', passwords.newPassword);
      }

      const method = adminData ? 'put' : 'post';
      const response = await API[method]('academy/', formData);

      const updatedData = response.data;
      setAcademyData(updatedData);
      updateAdminData(updatedData);
      
      if (isUpdatingPassword) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Settings and password updated successfully!');
      } else {
        toast.success(adminData ? 'Settings updated successfully!' : 'Academy created successfully!');
      }
    } catch (error) {
      const data = error.response?.data;
      const errorData = data?.errors || data;
      if (typeof errorData === 'object' && errorData !== null) {
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMessage = Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : JSON.stringify(errorData);
        toast.error(`${firstErrorKey}: ${errorMessage}`);
      } else {
        toast.error(data?.error || 'Failed to update settings');
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
    toast.success('Phone verified!');
  };

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleSavePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Current and new password are required');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const formData = new FormData();
      formData.append('current_password', passwords.currentPassword);
      formData.append('new_password', passwords.newPassword);

      const method = adminData ? 'put' : 'post';
      await API[method]('academy/', formData);

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update password';
      toast.error(errorMsg);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return {
    isLoading, isSubmitting, isSubmittingPassword,
    imageStates,
    showPassword, setShowPassword,
    showVerificationModal, setShowVerificationModal,
    verificationCode, setVerificationCode,
    isSendingCode, verificationStep, setVerificationStep, countdown,
    passwords, setPasswords,
    academyData, setAcademyData,
    preferences, setPreferences,
    handleSubmit, handleSavePassword,
    handleImageSelect, confirmImageUpload, cancelImageSelection, removeImage,
    handlePhoneVerification, handleVerifyCode
  };
};
