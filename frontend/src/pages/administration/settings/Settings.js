import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { useSettingsData } from './hooks/useSettingsData';
import { containerVariants, itemVariants } from './utils/settingsConstants';

import SettingsSidebar from './components/SettingsSidebar';
import SettingsHeader from './components/SettingsHeader';
import AcademyInfoSection from './sections/AcademyInfoSection';
import ContactInfoSection from './sections/ContactInfoSection';
import FacilitiesSection from './sections/FacilitiesSection';
import PreferencesSection from './sections/PreferencesSection';
import PrivacySecuritySection from './sections/PrivacySecuritySection';
import PhoneVerificationModal from './modals/PhoneVerificationModal';

const Settings = () => {
  const {
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
  } = useSettingsData();

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
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />

      <SettingsSidebar itemVariants={itemVariants} />

      <div className="lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <SettingsHeader isSubmitting={isSubmitting} itemVariants={itemVariants} />

          <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
            <AcademyInfoSection 
              academyData={academyData} setAcademyData={setAcademyData}
              handleImageUpload={handleImageUpload} isImageUpdating={isImageUpdating}
              itemVariants={itemVariants}
            />
            
            <ContactInfoSection 
              academyData={academyData} setAcademyData={setAcademyData}
              itemVariants={itemVariants}
            />
            
            <FacilitiesSection 
              academyData={academyData} setAcademyData={setAcademyData}
              itemVariants={itemVariants}
            />
            
            <PreferencesSection 
              preferences={preferences} setPreferences={setPreferences}
              itemVariants={itemVariants}
            />
            
            <PrivacySecuritySection 
              passwords={passwords} setPasswords={setPasswords}
              showPassword={showPassword} setShowPassword={setShowPassword}
              itemVariants={itemVariants}
            />
          </form>
        </div>
      </div>

      <PhoneVerificationModal 
        showVerificationModal={showVerificationModal} setShowVerificationModal={setShowVerificationModal}
        verificationStep={verificationStep} setVerificationStep={setVerificationStep}
        verificationCode={verificationCode} setVerificationCode={setVerificationCode}
        countdown={countdown} handleVerifyCode={handleVerifyCode} handlePhoneVerification={handlePhoneVerification}
        academyData={academyData}
      />
    </motion.div>
  );
};

export default Settings;
