import React from 'react';
import { motion } from 'framer-motion';
import { FaRegBuilding, FaTshirt } from 'react-icons/fa';
import { FiCamera } from 'react-icons/fi';
import { northAfricanCountries } from '../utils/settingsConstants';

const AcademyInfoSection = ({ academyData, setAcademyData, handleImageUpload, isImageUpdating, itemVariants }) => {
  return (
    <motion.div id="academy-info" variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]"><FaRegBuilding className="text-xl" /></div>
        <div>
          <h2 className="text-2xl font-bold">Academy Information</h2>
          <p className="text-gray-400 text-sm">Configure your academy details and branding</p>
        </div>
      </div>

      {/* Logo */}
      <div className="mb-10 flex flex-col items-center">
        <div className="relative">
          <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-800/50 border-2 border-gray-700/50">
            {isImageUpdating && !academyData.logo_url ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00d0cb]"></div>
              </div>
            ) : academyData.logo_url ? (
              <img src={academyData.logo_url} alt="Academy Logo"
                className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <FaRegBuilding className="text-4xl" />
              </div>
            )}
          </div>
          <label htmlFor="logo-upload"
            className="absolute -bottom-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-white p-2 rounded-full cursor-pointer hover:opacity-90 shadow-lg">
            <FiCamera className="text-xl" />
          </label>
          <input type="file" id="logo-upload" className="hidden" accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0], 'logo')} />
        </div>
        <p className="text-center mt-6 text-sm text-gray-400">Click the camera icon to update academy logo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Academy Name *</label>
            <input type="text" value={academyData.name || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              placeholder="Enter academy name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Founded Year</label>
              <input type="number" value={academyData.founded || ''}
                onChange={(e) => setAcademyData(p => ({ ...p, founded: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                placeholder="e.g., 2010" />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Country</label>
              <select value={academyData.country || ''}
                onChange={(e) => setAcademyData(p => ({ ...p, country: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                <option value="" className="bg-gray-900">Select Country</option>
                {northAfricanCountries.map(c => (
                  <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">City</label>
            <input type="text" value={academyData.city || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, city: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              placeholder="Enter city" />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">Colors</label>
            <input type="text" value={academyData.colors || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, colors: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              placeholder="e.g., Red & White" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Achievements</label>
            <textarea value={academyData.achievements || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, achievements: e.target.value }))}
              rows="4"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              placeholder="List your academy's achievements" />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">Philosophy</label>
            <textarea value={academyData.philosophy || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, philosophy: e.target.value }))}
              rows="4"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              placeholder="Describe your academy's philosophy" />
          </div>
        </div>
      </div>

      {/* Team Kits */}
      <div className="mt-8 pt-8 border-t border-gray-700/50">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <FaTshirt className="text-[#4fb0ff]" />Team Kits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { field: 'home_kit', urlField: 'home_kit_url', label: 'Home Kit', id: 'home-kit-upload', color: 'from-[#00d0cb] to-[#4fb0ff]' },
            { field: 'away_kit', urlField: 'away_kit_url', label: 'Away Kit', id: 'away-kit-upload', color: 'from-[#902bd1] to-[#00d0cb]' }
          ].map(kit => (
            <div key={kit.field} className="flex flex-col items-center">
              <label className="block text-gray-300 font-medium mb-4">{kit.label}</label>
              <div className="relative">
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-800/50 border-2 border-gray-700/50">
                  {academyData[kit.urlField] ? (
                    <img src={academyData[kit.urlField]} alt={kit.label}
                      className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaTshirt className="text-gray-400 text-3xl" />
                    </div>
                  )}
                </div>
                <label htmlFor={kit.id}
                  className={`absolute -bottom-3 right-1/2 translate-x-1/2 bg-gradient-to-r ${kit.color} text-white p-2 rounded-full cursor-pointer hover:opacity-90 shadow-lg`}>
                  <FiCamera className="text-xl" />
                </label>
                <input type="file" id={kit.id} className="hidden" accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], kit.field)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AcademyInfoSection;
