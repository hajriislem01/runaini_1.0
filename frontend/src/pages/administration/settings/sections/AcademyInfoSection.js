import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegBuilding, FaTshirt } from 'react-icons/fa';
import { FiCamera, FiCheck, FiX } from 'react-icons/fi';
import { northAfricanCountries } from '../utils/settingsConstants';

const AcademyInfoSection = ({ 
  academyData, 
  setAcademyData, 
  imageStates,
  handleImageSelect, 
  confirmImageUpload,
  cancelImageSelection,
  itemVariants 
}) => {

  const renderImageSection = (fieldName, label, icon, isCircular = false) => {
    const state = imageStates[fieldName];
    const preview = state?.preview;
    const isUpdating = state?.isUpdating;
    const hasNewFile = state?.file !== null;

    return (
      <div className="flex flex-col items-center">
        {label && <label className="block text-gray-300 font-medium mb-4">{label}</label>}
        <div className="relative group">
          <div className={`${isCircular ? 'w-40 h-40 rounded-full' : 'w-40 h-40 rounded-2xl'} overflow-hidden bg-gray-900/60 backdrop-blur-md border-2 ${hasNewFile ? 'border-[#00d0cb]' : 'border-gray-700/50'} shadow-2xl transition-all duration-300`}>
            {preview ? (
              <img src={preview} alt={label} className="w-full h-full object-contain p-2" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                {icon}
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="text-white text-xs font-bold uppercase tracking-wider">Change {label}</span>
            </div>
          </div>

          <label htmlFor={`${fieldName}-upload`}
            className="absolute -bottom-2 right-2 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white p-2.5 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg z-10">
            <FiCamera className="text-lg" />
          </label>
          <input type="file" id={`${fieldName}-upload`} className="hidden" accept="image/*"
            onChange={(e) => handleImageSelect(e.target.files[0], fieldName)} />
        </div>

        <AnimatePresence>
          {hasNewFile && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex gap-2 w-full max-w-[160px] mt-4"
            >
              <button 
                type="button" 
                onClick={() => confirmImageUpload(fieldName)}
                disabled={isUpdating}
                className="flex-1 flex justify-center items-center gap-2 py-2 rounded-xl text-xs font-bold text-white bg-green-500/80 hover:bg-green-500 backdrop-blur-sm border border-green-400/30 transition-all shadow-lg disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><FiCheck className="text-sm" /> Save</>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => cancelImageSelection(fieldName)}
                disabled={isUpdating}
                className="px-3 py-2 rounded-xl text-xs bg-gray-800/80 text-gray-300 hover:bg-gray-700 backdrop-blur-sm border border-gray-600/30 transition-all"
              >
                <FiX className="text-sm" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div id="academy-info" variants={itemVariants}
      className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]"><FaRegBuilding className="text-xl text-white" /></div>
        <div>
          <h2 className="text-2xl font-bold text-white">Academy Information</h2>
          <p className="text-gray-400 text-sm">Configure your academy details and branding</p>
        </div>
      </div>

      {/* Main Logo Section */}
      <div className="mb-12">
        {renderImageSection('logo', 'Academy Logo', <FaRegBuilding size={40} />, true)}
        <p className="text-center mt-6 text-xs text-gray-500 uppercase tracking-widest font-medium">Click the camera icon to update academy branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 font-medium mb-2 text-sm">Academy Name *</label>
            <input type="text" value={academyData.name || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb]/50 text-white placeholder-gray-600 transition-all"
              autoComplete="off"
              placeholder="Enter academy name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">Founded Year</label>
              <input type="number" value={academyData.founded || ''}
                onChange={(e) => setAcademyData(p => ({ ...p, founded: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb]/50 text-white placeholder-gray-600 transition-all"
                autoComplete="off"
                placeholder="e.g., 2010" />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">Country</label>
              <select value={academyData.country || ''}
                onChange={(e) => setAcademyData(p => ({ ...p, country: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb]/50 text-white appearance-none">
                <option value="" className="bg-gray-900">Select Country</option>
                {northAfricanCountries.map(c => (
                  <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2 text-sm">City</label>
            <input type="text" value={academyData.city || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, city: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb]/50 text-white placeholder-gray-600 transition-all"
              autoComplete="off"
              placeholder="Enter city" />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-3 text-sm">Active Brand Palette</label>
            <div className="flex items-center gap-6 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <div className="flex items-center gap-8">
                {/* Primary Swatch */}
                <div className="flex flex-col items-center gap-2">
                  <motion.div 
                    key={academyData.primary_color}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-14 h-14 rounded-full border-2 border-white/20 shadow-2xl relative"
                    style={{ 
                      backgroundColor: academyData.primary_color || '#902bd1',
                      boxShadow: `0 8px 30px ${(academyData.primary_color || '#902bd1')}50`
                    }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                  </motion.div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Primary</span>
                </div>

                {/* Secondary Swatch */}
                {academyData.secondary_color_active && (
                  <div className="flex flex-col items-center gap-2">
                    <motion.div 
                      key={academyData.secondary_color}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-14 h-14 rounded-full border-2 border-white/20 shadow-2xl relative"
                      style={{ 
                        backgroundColor: academyData.secondary_color || '#4fb0ff',
                        boxShadow: `0 8px 30px ${(academyData.secondary_color || '#4fb0ff')}50`
                      }}
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    </motion.div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Secondary</span>
                  </div>
                )}
              </div>

              {!academyData.secondary_color_active && (
                <div className="flex-1 border-l border-gray-700/50 pl-6">
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight italic">Single color brand profile active. Enable Secondary Color below to create gradients.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 font-medium mb-2 text-sm">Achievements</label>
            <textarea value={academyData.achievements || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, achievements: e.target.value }))}
              rows="4"
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb]/50 text-white placeholder-gray-600 transition-all resize-none"
              placeholder="List your academy's achievements" />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2 text-sm">Philosophy</label>
            <textarea value={academyData.philosophy || ''}
              onChange={(e) => setAcademyData(p => ({ ...p, philosophy: e.target.value }))}
              rows="4"
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb]/50 text-white placeholder-gray-600 transition-all resize-none"
              placeholder="Describe your academy's philosophy" />
          </div>
        </div>
      </div>

      {/* ══ BRANDING ENGINE ══ */}
      {/* ══ BRANDING ENGINE ══ */}
      {localStorage.getItem('role') === 'admin' && (
        <>
          <div className="mt-12 pt-8 border-t border-gray-700/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00d0cb]/20 text-[#00d0cb]"><FaTshirt className="text-xl" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white">Branding Engine</h3>
                  <p className="text-gray-400 text-xs">Configure platform colors, geometry, and readability</p>
                </div>
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Controls */}
          <div className="space-y-8">
            {/* Multi-Color Picker */}
            <div>
              <label className="block text-gray-300 font-medium mb-4 text-sm">Color Slots & Activation</label>
              <div className="space-y-4">
                {/* Primary Color (Always Active) */}
                <div className="flex items-center gap-4 p-3 bg-gray-800/20 rounded-2xl border border-gray-700/30">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-600 shadow-inner"
                       style={{ backgroundColor: academyData.primary_color || '#902bd1' }}>
                    <input type="color" value={academyData.primary_color || '#902bd1'}
                      onChange={(e) => setAcademyData(p => ({ ...p, primary_color: e.target.value }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-white uppercase tracking-wider">Primary Color</span>
                    <span className="block text-[10px] text-gray-500">Core identity color (Always active)</span>
                  </div>
                  <div className="px-3 py-1 bg-[#00d0cb]/10 text-[#00d0cb] text-[10px] font-bold rounded-lg uppercase">Required</div>
                </div>

                {/* Optional Colors */}
                {[
                  { key: 'secondary_color', active: 'secondary_color_active', label: 'Secondary Color', desc: 'Used for two-color gradients' },
                  { key: 'color_3', active: 'color_3_active', label: 'Accent Slot 1', desc: 'Adds depth to the platform gradient' },
                  { key: 'color_4', active: 'color_4_active', label: 'Accent Slot 2', desc: 'Experimental accent color' }
                ].map((slot) => (
                  <div key={slot.key} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 ${
                    academyData[slot.active] ? 'bg-gray-800/20 border-gray-600' : 'bg-gray-900/10 border-gray-800 opacity-60'
                  }`}>
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-600 shadow-inner"
                         style={{ backgroundColor: academyData[slot.key] || '#1a1a1a' }}>
                      <input type="color" value={academyData[slot.key] || '#000000'}
                        disabled={!academyData[slot.active]}
                        onChange={(e) => setAcademyData(p => ({ ...p, [slot.key]: e.target.value }))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-bold text-white uppercase tracking-wider">{slot.label}</span>
                      <span className="block text-[10px] text-gray-500">{slot.desc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAcademyData(p => ({ ...p, [slot.active]: !p[slot.active] }))}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                        academyData[slot.active] ? 'bg-[#00d0cb]' : 'bg-gray-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        academyData[slot.active] ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Readability & Text Contrast */}
            <div className="p-5 bg-gray-800/20 rounded-2xl border border-gray-700/30">
              <div className="flex items-center justify-between mb-6">
                <label className="block text-gray-300 font-medium text-sm">Header Text Color & Contrast</label>
                <button
                  type="button"
                  onClick={() => {
                    const hex = academyData.primary_color || '#902bd1';
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    setAcademyData(p => ({ ...p, header_text_color: luminance > 0.5 ? '#000000' : '#ffffff' }));
                  }}
                  className="text-[10px] font-bold text-[#00d0cb] hover:text-[#4fb0ff] uppercase tracking-tighter transition-colors"
                >
                  Auto-Contrast Suggestion
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-600 shadow-inner"
                     style={{ backgroundColor: academyData.header_text_color || '#ffffff' }}>
                  <input type="color" value={academyData.header_text_color || '#ffffff'}
                    onChange={(e) => setAcademyData(p => ({ ...p, header_text_color: e.target.value }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1">
                  <span className="block text-[10px] text-gray-500 uppercase font-medium">Text Readability</span>
                  <p className="text-[11px] text-gray-400">Ensure your logo and title are visible against the background.</p>
                </div>
              </div>
            </div>

            {/* Rotation & Angle */}
            <div className={`${
              (academyData.secondary_color_active || academyData.color_3_active || academyData.color_4_active) 
              ? 'opacity-100' : 'opacity-30 pointer-events-none'
            } transition-opacity`}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-300 font-medium text-sm">Gradient Angle</label>
                <span className="text-xs font-mono text-[#00d0cb]">{academyData.gradient_angle || 135}°</span>
              </div>
              <input 
                type="range" min="0" max="360" step="1"
                value={academyData.gradient_angle || 135}
                onChange={(e) => setAcademyData(p => ({ ...p, gradient_angle: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00d0cb]"
              />
            </div>


          </div>

          {/* Live Preview */}
          <div className="flex flex-col justify-center">
            <label className="block text-gray-300 font-medium mb-4 text-sm text-center tracking-widest uppercase opacity-50">Live Branding Preview</label>
            <div className="bg-gray-900/60 rounded-[32px] p-8 border border-gray-700/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FaRegBuilding size={120} />
              </div>
              
              {/* Dynamic Header Preview */}
              <div 
                className="h-40 mb-8 relative overflow-hidden shadow-2xl transition-all duration-500" 
                style={{ 
                  borderRadius: '15px',
                  background: (() => {
                    const colors = [academyData.primary_color || '#902bd1'];
                    if (academyData.secondary_color_active) colors.push(academyData.secondary_color || '#4fb0ff');
                    if (academyData.color_3_active) colors.push(academyData.color_3 || '#00d0cb');
                    if (academyData.color_4_active) colors.push(academyData.color_4 || '#180033');
                    return colors.length === 1 ? colors[0] : `linear-gradient(${academyData.gradient_angle || 135}deg, ${colors.join(', ')})`;
                  })()
                }}
              >
                <div className="absolute inset-0 bg-white/5 opacity-10" />
                <div className="flex flex-col justify-center h-full px-8 gap-1">
                  <div className="w-14 h-14 bg-white/20 rounded-xl border border-white/30 backdrop-blur-md mb-2" 
                       style={{ borderRadius: '12px' }}/>
                  <h4 className="text-xl font-black uppercase tracking-tight" style={{ color: academyData.header_text_color || '#ffffff' }}>{academyData.name || 'Academy Name'}</h4>
                  <div className="h-1.5 w-16 bg-white/40 rounded-full" style={{ background: academyData.header_text_color || '#ffffff', opacity: 0.3 }} />
                </div>
              </div>
              
              {/* Standard Component Preview */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold text-center block">Standard Button</span>
                    <button 
                      className="w-full py-3.5 text-xs font-bold text-white shadow-xl pointer-events-none"
                      style={{ 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #902bd1, #4fb0ff)'
                      }}
                    >
                      Global Theme
                    </button>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold text-center block">Status Card</span>
                    <div 
                      className="bg-gray-800 border border-gray-700 flex items-center justify-center p-4 h-[46px]"
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="w-full h-1.5 bg-gray-700 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 w-3/4" style={{ backgroundColor: academyData.primary_color || '#902bd1' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 text-center uppercase tracking-[0.2em] opacity-80 decoration-[#00d0cb] underline-offset-4 underline">Design System Live Feedback</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )}

      {/* Team Kits Section */}
      <div className="mt-12 pt-8 border-t border-gray-700/50">
        <div className="flex items-center gap-2 mb-8">
          <FaTshirt className="text-[#4fb0ff] text-xl" />
          <h3 className="text-xl font-bold text-white">Team Kits</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {renderImageSection('home_kit', 'Home Kit', <FaTshirt size={32} />)}
          {renderImageSection('away_kit', 'Away Kit', <FaTshirt size={32} />)}
        </div>
      </div>
    </motion.div>
  );
};

export default AcademyInfoSection;
