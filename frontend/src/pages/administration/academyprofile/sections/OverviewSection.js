import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiMapPin, FiTarget, FiUsers, FiHome, FiAward,
  FiStar, FiShield, FiCalendar, FiFlag, FiActivity,
  FiMail, FiGlobe, FiPhone, FiUser, FiFacebook, FiInstagram, FiLink
} from 'react-icons/fi';
import { FaTshirt } from 'react-icons/fa';
import { InfoItem, SectionCard } from '../components/ProfileUI';
import { getCountryName } from '../utils/profileHelpers';

const OverviewSection = ({ academy }) => {
  const { t } = useTranslation('administrationprofile');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <SectionCard title={t('sections.academyInfo')} icon={<FiTarget size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InfoItem icon={<FiStar size={20} />} label={t('fields.academyName')} value={academy.name} />
            <InfoItem icon={<FiCalendar size={20} />} label={t('fields.founded')} value={academy.founded || t('misc.na')} />
            <InfoItem icon={<FiFlag size={20} />} label={t('fields.country')} value={getCountryName(academy.country)} />
            <InfoItem icon={<FiMapPin size={20} />} label={t('fields.city')} value={academy.city || t('misc.na')} />
            <InfoItem icon={<FiActivity size={20} />} label={t('fields.brandPalette')}>
              <div className="flex items-center gap-3 mt-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-6 h-6 rounded-full border border-white/20 shadow-lg relative group"
                  style={{
                    backgroundColor: academy.primary_color || '#902bd1',
                    boxShadow: `0 0 12px ${(academy.primary_color || '#902bd1')}50`
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t('colors.primary')}: {academy.primary_color}
                  </div>
                </motion.div>

                {academy.secondary_color_active && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-6 h-6 rounded-full border border-white/20 shadow-lg relative group"
                    style={{
                      backgroundColor: academy.secondary_color || '#4fb0ff',
                      boxShadow: `0 0 12px ${(academy.secondary_color || '#4fb0ff')}50`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {t('colors.secondary')}: {academy.secondary_color}
                    </div>
                  </motion.div>
                )}
              </div>
            </InfoItem>

            {academy.achievements && (
              <div className="md:col-span-2">
                <div className="bg-gray-800/30 rounded-xl p-4 mt-3 border border-gray-700/50">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <FiAward className="text-yellow-400" />
                    <h3 className="font-semibold">{t('fields.achievements')}</h3>
                  </div>
                  <p className="text-gray-300">{academy.achievements}</p>
                </div>
              </div>
            )}

            {academy.philosophy && (
              <div className="md:col-span-2">
                <div className="bg-gray-800/30 rounded-xl p-4 mt-3 border border-gray-700/50">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <FiShield className="text-[#00d0cb]" />
                    <h3 className="font-semibold">{t('fields.philosophy')}</h3>
                  </div>
                  <p className="text-gray-300">{academy.philosophy}</p>
                </div>
              </div>
            )}

            {/* Kits */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaTshirt className="text-[#902bd1]" />{t('kits.title')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {academy.home_kit_url ? (
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium text-gray-300 mb-2">{t('kits.homeKit')}</div>
                    <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden border-4 border-white/20 shadow-xl">
                      <img src={academy.home_kit_url} alt={t('kits.homeKitAlt')} className="w-full h-full object-contain" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 md:h-64 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-600">
                    <FaTshirt className="text-4xl text-gray-500 mb-3" />
                    <p className="text-gray-400 text-sm">{t('kits.noHomeKit')}</p>
                  </div>
                )}
                {academy.away_kit_url ? (
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium text-gray-300 mb-2">{t('kits.awayKit')}</div>
                    <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden border-4 border-white/20 shadow-xl">
                      <img src={academy.away_kit_url} alt={t('kits.awayKitAlt')} className="w-full h-full object-contain" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 md:h-64 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-600">
                    <FaTshirt className="text-4xl text-gray-500 mb-3" />
                    <p className="text-gray-400 text-sm">{t('kits.noAwayKit')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Staff & Facilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title={t('sections.staffInfo')} icon={<FiUsers size={20} />} delay={0.1}>
            <div className="space-y-4">
              <InfoItem icon={<FiUser size={18} />} label={t('fields.technicalDirector')} value={academy.technical_director || t('misc.na')} />
              <InfoItem icon={<FiUser size={18} />} label={t('fields.headCoach')} value={academy.head_coach_name || t('misc.na')} />
              <InfoItem icon={<FiUser size={18} />} label={t('fields.fitnessCoach')} value={academy.fitness_coach || t('misc.na')} />
              <InfoItem icon={<FiUser size={18} />} label={t('fields.medicalStaff')} value={academy.medical_staff || t('misc.na')} />
            </div>
          </SectionCard>

          <SectionCard title={t('sections.facilities')} icon={<FiHome size={20} />} delay={0.2}>
            <div className="space-y-4">
              <InfoItem icon={<FiHome size={18} />} label={t('fields.stadiumName')} value={academy.stadium_name || t('misc.na')} />
              <InfoItem icon={<FiMapPin size={18} />} label={t('fields.stadiumLocation')} value={academy.stadium_location || t('misc.na')} />
              <InfoItem icon={<FiHome size={18} />} label={t('fields.gym')} value={academy.has_gym ? t('availability.available') : t('availability.notAvailable')} />
              <InfoItem icon={<FiHome size={18} />} label={t('fields.cafeteria')} value={academy.has_cafeteria ? t('availability.available') : t('availability.notAvailable')} />
              <InfoItem icon={<FiHome size={18} />} label={t('fields.dormitory')} value={academy.has_dormitory ? t('availability.available') : t('availability.notAvailable')} />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <SectionCard title={t('sections.contact')} icon={<FiMail size={20} />} delay={0.3}>
          <div className="space-y-3">
            <InfoItem icon={<FiMail size={16} />} label={t('fields.email')} value={academy.email} />
            <InfoItem icon={<FiPhone size={16} />} label={t('fields.phone')} value={academy.phone} />
            <InfoItem icon={<FiGlobe size={16} />} label={t('fields.website')} value={academy.website} isLink={true} />
          </div>
        </SectionCard>

        <SectionCard title={t('sections.location')} icon={<FiMapPin size={20} />} delay={0.4}>
          <div className="space-y-3">
            <InfoItem icon={<FiFlag size={16} />} label={t('fields.country')} value={getCountryName(academy.country)} />
            <InfoItem icon={<FiMapPin size={16} />} label={t('fields.city')} value={academy.city || t('misc.na')} />
          </div>
        </SectionCard>

        <SectionCard title={t('sections.socialMedia')} icon={<FiLink size={20} />} delay={0.5}>
          <div className="space-y-3">
            <InfoItem icon={<FiGlobe className="text-[#10B981]" size={16} />} label={t('fields.website')} value={academy.website} isLink={true} />
            <InfoItem icon={<FiFacebook className="text-[#4fb0ff]" size={16} />} label={t('fields.facebook')} value={academy.facebook} isLink={true} />
            <InfoItem icon={<FiInstagram className="text-[#902bd1]" size={16} />} label={t('fields.instagram')} value={academy.instagram} isLink={true} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default OverviewSection;
