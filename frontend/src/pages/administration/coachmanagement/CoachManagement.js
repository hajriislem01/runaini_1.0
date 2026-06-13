import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

import { useCoachManagement } from './hooks/useCoachManagement';
import { containerVariants, itemVariants } from './utils/coachHelpers';

import CoachHeader from './components/CoachHeader';
import CoachList from './components/CoachList';
import CoachFormModal from './modals/CoachFormModal';

const CoachManagement = () => {
  const { t, i18n } = useTranslation('coachmanagement');
  const isRtl = i18n.language === 'ar';

  const {
    coaches, isLoading, showModal, setShowModal, searchTerm, setSearchTerm,
    showPassword, setShowPassword, passwordStrength, editCoachId,
    groups, subgroups, formData, setFormData, apiError,
    handleChange, handlePasswordChange, handleSubmit, handleEdit, handleDelete,
    resetForm, filteredCoaches
  } = useCoachManagement();

  return (
    <motion.div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">

        <CoachHeader
          coachesCount={coaches.length} isLoading={isLoading}
          resetForm={resetForm} setShowModal={setShowModal}
          itemVariants={itemVariants}
        />

        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative max-w-md">
            <FiSearch className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder', 'Search by name, email, or club...')}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-900/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d0cb]/50 outline-none`}
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </motion.div>

        <CoachList
          filteredCoaches={filteredCoaches} isLoading={isLoading} searchTerm={searchTerm}
          handleEdit={handleEdit} handleDelete={handleDelete}
          resetForm={resetForm} setShowModal={setShowModal}
          itemVariants={itemVariants}
        />

        <CoachFormModal
          showModal={showModal} setShowModal={setShowModal} editCoachId={editCoachId}
          isLoading={isLoading} formData={formData} setFormData={setFormData}
          handleChange={handleChange} handlePasswordChange={handlePasswordChange}
          handleSubmit={handleSubmit} showPassword={showPassword} setShowPassword={setShowPassword}
          passwordStrength={passwordStrength} resetForm={resetForm}
          groups={groups} subgroups={subgroups}
          apiError={apiError}
        />

      </div>
      <Toaster position={isRtl ? "top-left" : "top-right"} containerStyle={{ zIndex: 10000 }} />
    </motion.div>
  );
};

export default CoachManagement;
