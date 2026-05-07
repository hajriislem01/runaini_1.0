import React from 'react';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import { FaUsersCog } from 'react-icons/fa';

const FacilitiesSection = ({ academyData, setAcademyData, itemVariants }) => {
  return (
    <motion.div id="facilities" variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]"><FiHome className="text-xl" /></div>
        <div>
          <h2 className="text-2xl font-bold">Staff & Facilities</h2>
          <p className="text-gray-400 text-sm">Manage staff and facility information</p>
        </div>
      </div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FaUsersCog className="text-[#902bd1]" />Staff Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { field: 'technical_director', label: 'Technical Director' },
          { field: 'head_coach_name', label: 'Head Coach' },
          { field: 'fitness_coach', label: 'Fitness Coach' },
          { field: 'medical_staff', label: 'Medical Staff' },
        ].map(item => (
          <div key={item.field}>
            <label className="block text-gray-300 font-medium mb-2">{item.label}</label>
            <input type="text" value={academyData[item.field] || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              autoComplete="off"
              placeholder={`Enter ${item.label.toLowerCase()}`} />
          </div>
        ))}
      </div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FiHome className="text-[#eab308]" />Facilities
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { field: 'stadium_name', label: 'Stadium Name', placeholder: 'Enter stadium name' },
          { field: 'stadium_location', label: 'Stadium Location', placeholder: 'Enter stadium location' },
        ].map(item => (
          <div key={item.field}>
            <label className="block text-gray-300 font-medium mb-2">{item.label}</label>
            <input type="text" value={academyData[item.field] || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, [item.field]: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              autoComplete="off"
              placeholder={item.placeholder} />
          </div>
        ))}
        {['has_gym', 'has_cafeteria', 'has_dormitory'].map(facility => (
          <div key={facility} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <span className="font-medium text-gray-300 capitalize">{facility.replace('has_', '')} Available</span>
            <div className="flex items-center">
              <button type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${academyData[facility] ? 'bg-[#22c55e]' : 'bg-gray-700'}`}
                onClick={() => setAcademyData(p => ({ ...p, [facility]: !p[facility] }))}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${academyData[facility] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="ml-3 text-gray-400">{academyData[facility] ? 'Yes' : 'No'}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FacilitiesSection;
