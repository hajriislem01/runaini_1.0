import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiUsers, FiMail, FiPhone, FiGlobe,
  FiTarget, FiTrendingUp, FiAward, FiStar, FiZap, FiChevronRight, FiX
} from 'react-icons/fi';
import { FaWhatsapp, FaRegFutbol, FaTrophy, FaUsersCog } from 'react-icons/fa';
import API from './api';
import toast, { Toaster } from 'react-hot-toast';

const countryNames = {
  TN: 'Tunisia', DZ: 'Algeria', MA: 'Morocco',
  LY: 'Libya', EG: 'Egypt', MR: 'Mauritania'
};

const Contact = () => {
  const [academies, setAcademies] = useState([]);
  const [filteredAcademies, setFilteredAcademies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    searchQuery: ''
  });

  // ✅ Fetch toutes les académies depuis l'API
  useEffect(() => {
    const fetchAcademies = async () => {
      setIsLoading(true);
      try {
        const response = await API.get('academies/');
        setAcademies(response.data);
        setFilteredAcademies(response.data);
      } catch (error) {
        toast.error('Failed to load academies');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAcademies();
  }, []);

  // ✅ Filtrage
  useEffect(() => {
    let filtered = [...academies];

    if (filters.country) {
      filtered = filtered.filter(a => a.country === filters.country);
    }
    if (filters.city) {
      filtered = filtered.filter(a =>
        a.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.philosophy?.toLowerCase().includes(q)
      );
    }

    setFilteredAcademies(filtered);
  }, [filters, academies]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ country: '', city: '', searchQuery: '' });
  };

  // Stats
  const stats = {
    total: academies.length,
    countries: [...new Set(academies.map(a => a.country).filter(Boolean))].length,
    withContact: academies.filter(a => a.email || a.phone).length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  const AcademyCard = ({ academy }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all cursor-pointer group"
      onClick={() => setSelectedAcademy(academy)}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] border border-gray-700 flex items-center justify-center">
            {academy.logo_url ? (
              <img src={academy.logo_url} alt={academy.name} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-white font-bold text-xl">{academy.name?.charAt(0)}</span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-white group-hover:text-[#00d0cb] transition-colors">
              {academy.name}
            </h3>
            {academy.founded && (
              <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-lg">
                Est. {academy.founded}
              </span>
            )}
          </div>
          {(academy.city || academy.country) && (
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <FiMapPin className="text-[#4fb0ff] flex-shrink-0" />
              <span className="text-sm">
                {[academy.city, countryNames[academy.country]].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          {academy.colors && (
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs text-[#00d0cb] bg-[#00d0cb]/10 border border-[#00d0cb]/20">
                {academy.colors}
              </span>
            </div>
          )}
        </div>
      </div>

      {academy.philosophy && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{academy.philosophy}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-3">
          {academy.email && (
            <div className="flex items-center gap-1 text-gray-400">
              <FiMail className="text-[#4fb0ff]" size={14} />
            </div>
          )}
          {academy.phone && (
            <div className="flex items-center gap-1 text-gray-400">
              <FiPhone className="text-[#00d0cb]" size={14} />
            </div>
          )}
          {academy.website && (
            <div className="flex items-center gap-1 text-gray-400">
              <FiGlobe className="text-[#902bd1]" size={14} />
            </div>
          )}
        </div>
        <FiChevronRight className="text-gray-400 group-hover:text-[#00d0cb] transition-colors" />
      </div>
    </motion.div>
  );

  const AcademyModal = ({ academy, onClose }) => (
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
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}>
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
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Academy Directory
              </h1>
              <p className="text-gray-300 mt-2">Find and connect with football academies on our platform</p>
            </div>
            <div className="bg-gradient-to-r from-[#4fb0ff]/80 to-[#00d0cb]/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-[#4fb0ff]/40">
              <div className="flex items-center gap-3">
                <FiUsers className="text-xl" />
                <div>
                  <div className="text-xs text-gray-300">Total Academies</div>
                  <div className="text-lg font-bold">{stats.total}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Academies', value: stats.total, color: '#4fb0ff', icon: <FiUsers /> },
              { label: 'Countries', value: stats.countries, color: '#00d0cb', icon: <FiGlobe /> },
              { label: 'With Contact', value: stats.withContact, color: '#22c55e', icon: <FiMail /> },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}
                className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-800/50" style={{ color: stat.color }}>{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
                  <FiSearch className="text-lg" />
                </div>
                Search & Filter
              </h2>
              {(filters.country || filters.city || filters.searchQuery) && (
                <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white">
                  Clear filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Country</label>
                <select name="country" value={filters.country} onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                  <option value="" className="bg-gray-900">All Countries</option>
                  <option value="TN" className="bg-gray-900">Tunisia</option>
                  <option value="DZ" className="bg-gray-900">Algeria</option>
                  <option value="MA" className="bg-gray-900">Morocco</option>
                  <option value="LY" className="bg-gray-900">Libya</option>
                  <option value="EG" className="bg-gray-900">Egypt</option>
                  <option value="MR" className="bg-gray-900">Mauritania</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">City</label>
                <input type="text" name="city" value={filters.city} onChange={handleFilterChange}
                  placeholder="Enter city name"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="searchQuery" value={filters.searchQuery} onChange={handleFilterChange}
                    placeholder="Search by name..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-xl border border-[#4fb0ff]/30 p-4">
            <span className="text-gray-300">
              Showing <span className="font-bold text-white">{filteredAcademies.length}</span> of{' '}
              <span className="font-bold text-white">{academies.length}</span> academies
            </span>
          </div>
        </motion.div>

        {/* Academies Grid */}
        <motion.div variants={itemVariants}>
          {filteredAcademies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAcademies.map(academy => (
                <AcademyCard key={academy.id} academy={academy} />
              ))}
            </div>
          ) : (
            <motion.div variants={itemVariants}
              className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-2xl border border-[#4fb0ff]/30 p-12 text-center">
              <div className="text-5xl mb-4 text-gray-400 flex justify-center"><FiUsers /></div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No academies found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-6 py-3 text-white font-medium rounded-xl"
                style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                Clear Filters
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {selectedAcademy && (
            <AcademyModal academy={selectedAcademy} onClose={() => setSelectedAcademy(null)} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Contact;