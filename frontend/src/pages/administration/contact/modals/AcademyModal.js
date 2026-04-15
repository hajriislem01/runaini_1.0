import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiTarget, FiMail, FiPhone, FiGlobe, FiTrendingUp, FiZap } from 'react-icons/fi';
import { FaRegFutbol, FaUsersCog, FaTrophy } from 'react-icons/fa';
import { countryNames } from '../utils/contactConstants';

const AcademyModal = ({ academy, onClose }) => {
  if (!academy) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] border border-gray-700 flex items-center justify-center flex-shrink-0">
                  {academy.logo_url ? (
                    <img src={academy.logo_url} alt={academy.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-white font-bold text-3xl">{academy.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{academy.name}</h2>
                  {(academy.city || academy.country) && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <FiMapPin className="text-[#4fb0ff]" />
                      <span>{[academy.city, countryNames[academy.country]].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {academy.founded && (
                      <span className="px-3 py-1 rounded-full text-sm text-gray-300 bg-gray-800/50 border border-gray-700">
                        Est. {academy.founded}
                      </span>
                    )}
                    {academy.colors && (
                      <span className="px-3 py-1 rounded-full text-sm text-[#00d0cb] bg-[#00d0cb]/10 border border-[#00d0cb]/20">
                        {academy.colors}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800">
                <FiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Contact */}
              {(academy.email || academy.phone || academy.website || academy.facebook || academy.instagram) && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiTarget className="text-[#00d0cb]" />Contact Information
                  </h3>
                  <div className="space-y-3">
                    {academy.email && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiMail className="text-[#4fb0ff] flex-shrink-0" />
                        <a href={`mailto:${academy.email}`} className="hover:text-[#00d0cb] transition-colors text-sm">
                          {academy.email}
                        </a>
                      </div>
                    )}
                    {academy.phone && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiPhone className="text-[#4fb0ff] flex-shrink-0" />
                        <a href={`tel:${academy.phone}`} className="hover:text-[#00d0cb] transition-colors text-sm">
                          {academy.phone}
                        </a>
                      </div>
                    )}
                    {academy.website && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiGlobe className="text-[#902bd1] flex-shrink-0" />
                        <a href={academy.website} target="_blank" rel="noopener noreferrer"
                          className="hover:text-[#902bd1] transition-colors text-sm truncate">
                          {academy.website}
                        </a>
                      </div>
                    )}
                    {academy.facebook && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiGlobe className="text-[#4fb0ff] flex-shrink-0" />
                        <a href={academy.facebook} target="_blank" rel="noopener noreferrer"
                          className="hover:text-[#4fb0ff] transition-colors text-sm truncate">
                          Facebook
                        </a>
                      </div>
                    )}
                    {academy.instagram && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiGlobe className="text-[#902bd1] flex-shrink-0" />
                        <a href={academy.instagram} target="_blank" rel="noopener noreferrer"
                          className="hover:text-[#902bd1] transition-colors text-sm truncate">
                          Instagram
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {(academy.stadium_name || academy.has_gym || academy.has_cafeteria || academy.has_dormitory) && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-[#902bd1]" />Facilities
                  </h3>
                  <div className="space-y-3">
                    {academy.stadium_name && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaRegFutbol className="text-[#22c55e]" />
                        <span className="text-sm">{academy.stadium_name}</span>
                      </div>
                    )}
                    {academy.has_gym && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-green-400 text-sm">✓</span><span className="text-sm">Gym</span>
                      </div>
                    )}
                    {academy.has_cafeteria && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-green-400 text-sm">✓</span><span className="text-sm">Cafeteria</span>
                      </div>
                    )}
                    {academy.has_dormitory && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-green-400 text-sm">✓</span><span className="text-sm">Dormitory</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Staff */}
            {(academy.technical_director || academy.head_coach_name || academy.fitness_coach) && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaUsersCog className="text-[#4fb0ff]" />Staff
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {academy.technical_director && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Technical Director</div>
                      <div className="text-white text-sm">{academy.technical_director}</div>
                    </div>
                  )}
                  {academy.head_coach_name && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Head Coach</div>
                      <div className="text-white text-sm">{academy.head_coach_name}</div>
                    </div>
                  )}
                  {academy.fitness_coach && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Fitness Coach</div>
                      <div className="text-white text-sm">{academy.fitness_coach}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Philosophy */}
            {academy.philosophy && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <FiZap className="text-[#eab308]" />Philosophy
                </h3>
                <p className="text-gray-300 text-sm">{academy.philosophy}</p>
              </div>
            )}

            {/* Achievements */}
            {academy.achievements && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaTrophy className="text-[#eab308]" />Achievements
                </h3>
                <p className="text-gray-300 text-sm">{academy.achievements}</p>
              </div>
            )}

            {/* Kits */}
            {(academy.home_kit_url || academy.away_kit_url) && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {academy.home_kit_url && (
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Home Kit</div>
                    <img src={academy.home_kit_url} alt="Home Kit"
                      className="w-full h-32 object-contain rounded-xl border border-gray-700/50 bg-gray-800/30" />
                  </div>
                )}
                {academy.away_kit_url && (
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Away Kit</div>
                    <img src={academy.away_kit_url} alt="Away Kit"
                      className="w-full h-32 object-contain rounded-xl border border-gray-700/50 bg-gray-800/30" />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AcademyModal;
