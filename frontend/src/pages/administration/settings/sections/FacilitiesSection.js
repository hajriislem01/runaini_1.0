import React from 'react';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import { FaUsersCog } from 'react-icons/fa';

const FacilitiesSection = ({ t, isRtl, academyData, setAcademyData, itemVariants }) => {
  const staffFields = [
    { field: 'technical_director', label: t('staffFacilities.technicalDirector') },
    { field: 'head_coach_name',    label: t('staffFacilities.headCoach') },
    { field: 'fitness_coach',      label: t('staffFacilities.fitnessCoach') },
    { field: 'medical_staff',      label: t('staffFacilities.medicalStaff') },
  ];

  const stadiumFields = [
    { field: 'stadium_name',     label: t('staffFacilities.stadiumName'),     placeholder: t('staffFacilities.stadiumName') },
    { field: 'stadium_location', label: t('staffFacilities.stadiumLocation'), placeholder: t('staffFacilities.stadiumLocation') },
  ];

  const facilityToggles = [
    { key: 'has_gym',       label: t('staffFacilities.gym') },
    { key: 'has_cafeteria', label: t('staffFacilities.cafeteria') },
    { key: 'has_dormitory', label: t('staffFacilities.dormitory') },
  ];

  return (
    <motion.div
      id="facilities"
      variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
    >
      {/* Section header */}
      <div className={`flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb] shrink-0">
          <FiHome className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t('staffFacilities.title')}</h2>
          <p className="text-gray-400 text-sm">{t('staffFacilities.subtitle')}</p>
        </div>
      </div>

      {/* Staff sub-header */}
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
        <FaUsersCog className="text-[#902bd1]" />
        {t('staffFacilities.staffHeader')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {staffFields.map(item => (
          <div key={item.field}>
            <label className={`block text-gray-300 font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
              {item.label}
            </label>
            <input
              type="text"
              value={academyData[item.field] || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              dir={isRtl ? 'rtl' : 'ltr'}
              autoComplete="off"
              placeholder={item.label}
            />
          </div>
        ))}
      </div>

      {/* Facilities sub-header */}
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
        <FiHome className="text-[#eab308]" />
        {t('staffFacilities.facilitiesHeader')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stadiumFields.map(item => (
          <div key={item.field}>
            <label className={`block text-gray-300 font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
              {item.label}
            </label>
            <input
              type="text"
              value={academyData[item.field] || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              dir={isRtl ? 'rtl' : 'ltr'}
              autoComplete="off"
              placeholder={item.placeholder}
            />
          </div>
        ))}

        {facilityToggles.map(facility => (
          <div
            key={facility.key}
            className={`flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <span className="font-medium text-gray-300">{facility.label}</span>
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${academyData[facility.key] ? 'bg-[#22c55e]' : 'bg-gray-700'}`}
                onClick={() => setAcademyData(p => ({ ...p, [facility.key]: !p[facility.key] }))}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${academyData[facility.key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-gray-400 text-sm">
                {academyData[facility.key] ? t('staffFacilities.yes') : t('staffFacilities.no')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FacilitiesSection;
