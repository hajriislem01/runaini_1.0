import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiMail, FiPhone, FiEye, FiEdit2
} from 'react-icons/fi';

import { useAdminData } from '../../../context/AdminContext';
import { getCountryName } from './utils/profileHelpers';
import OverviewSection from './sections/OverviewSection';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('administrationprofile');
  const { adminData: academy, isLoading } = useAdminData();

  useEffect(() => {
    if (!isLoading && !academy) {
      toast.error(t('header.noAcademyError'));
      navigate('/administration/settings');
    }
  }, [isLoading, academy, navigate, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00d0cb]"></div>
          <p className="mt-4 text-gray-300 font-medium">{t('header.loading')}</p>
        </div>
      </div>
    );
  }

  if (!academy) return null;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shadow-xl p-6 md:p-8 mb-6 md:mb-8 relative overflow-hidden border border-gray-700/50"
          style={{
            background: 'var(--main-gradient)',
            borderRadius: 'var(--dashboard-radius)'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -m-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -m-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div
              className="w-32 h-32 md:w-40 md:h-40 overflow-hidden border-4 border-white/20 shadow-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--dashboard-radius)'
              }}
            >
              {academy.logo_url ? (
                <img src={academy.logo_url} alt={academy.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg px-4 text-center">
                  {academy.name}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left rtl:md:text-right">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--header-text-color)' }}>
                    {academy.name}
                  </h1>
                  <p className="mt-1 md:mt-2" style={{ color: 'var(--header-text-color)', opacity: 0.8 }}>
                    {academy.city || t('misc.na')}, {getCountryName(academy.country)}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/administration/settings')}
                  className="px-4 py-2.5 text-white shadow-lg flex items-center justify-center gap-2 self-center transition-all bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]"
                  style={{ borderRadius: 'var(--dashboard-radius)' }}
                >
                  <FiEdit2 />{t('header.editProfile')}
                </motion.button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start rtl:md:justify-end gap-3 mt-4">
                {academy.email && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white">
                    <FiMail /><span className="text-sm">{academy.email}</span>
                  </div>
                )}
                {academy.phone && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white">
                    <FiPhone /><span className="text-sm">{academy.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <OverviewSection academy={academy} />

        {/* Footer Contact */}
        {(academy.email || academy.phone) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 md:mt-8 bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <FiEye className="text-[#00d0cb]" />{t('header.needHelp')}
              </div>
              <div className="flex gap-3 md:gap-4">
                {academy.email && (
                  <a
                    href={`mailto:${academy.email}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiMail size={18} /><span>{t('header.email')}</span>
                  </a>
                )}
                {academy.phone && (
                  <a
                    href={`tel:${academy.phone}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiPhone size={18} /><span>{t('header.call')}</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
