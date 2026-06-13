import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation('settings');
  const isRtl = i18n.language === 'ar';

  const {
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
    handleImageSelect, confirmImageUpload, cancelImageSelection,
    handlePhoneVerification, handleVerifyCode
  } = useSettingsData();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
      </div>
    );
  }

  return (
    <motion.div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster position={isRtl ? 'top-left' : 'top-right'} />

      <SettingsSidebar t={t} isRtl={isRtl} itemVariants={itemVariants} />

      <div className={isRtl ? 'lg:mr-64' : 'lg:ml-64'}>
        <div className="max-w-7xl mx-auto">
          <SettingsHeader t={t} isRtl={isRtl} isSubmitting={isSubmitting} itemVariants={itemVariants} />

          <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
            <AcademyInfoSection
              t={t}
              isRtl={isRtl}
              academyData={academyData}
              setAcademyData={setAcademyData}
              imageStates={imageStates}
              handleImageSelect={handleImageSelect}
              confirmImageUpload={confirmImageUpload}
              cancelImageSelection={cancelImageSelection}
              itemVariants={itemVariants}
            />

            <ContactInfoSection
              t={t}
              isRtl={isRtl}
              academyData={academyData}
              setAcademyData={setAcademyData}
              itemVariants={itemVariants}
            />

            <FacilitiesSection
              t={t}
              isRtl={isRtl}
              academyData={academyData}
              setAcademyData={setAcademyData}
              itemVariants={itemVariants}
            />

            <PreferencesSection
              t={t}
              isRtl={isRtl}
              preferences={preferences}
              setPreferences={setPreferences}
              itemVariants={itemVariants}
            />

            <PrivacySecuritySection
              t={t}
              isRtl={isRtl}
              passwords={passwords}
              setPasswords={setPasswords}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSavePassword={handleSavePassword}
              isSubmittingPassword={isSubmittingPassword}
              itemVariants={itemVariants}
            />
          </form>
        </div>
      </div>

      <PhoneVerificationModal
        showVerificationModal={showVerificationModal}
        setShowVerificationModal={setShowVerificationModal}
        verificationStep={verificationStep}
        setVerificationStep={setVerificationStep}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        countdown={countdown}
        handleVerifyCode={handleVerifyCode}
        handlePhoneVerification={handlePhoneVerification}
        academyData={academyData}
      />
    </motion.div>
  );
};

export default Settings;
