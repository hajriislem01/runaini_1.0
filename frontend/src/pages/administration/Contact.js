import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiMapPin, FiUsers, FiMail, FiPhone, FiGlobe, 
  FiTarget, FiTrendingUp, FiAward, FiStar, FiZap, FiChevronRight 
} from 'react-icons/fi';
import { FaWhatsapp, FaRegFutbol, FaTrophy, FaUsersCog } from 'react-icons/fa';
import { useProfileContext } from '../../context/ProfileContext';

const Contact = () => {
  const { getStatesForCountry } = useProfileContext();
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    city: '',
    searchQuery: ''
  });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    byCountry: {},
    averagePlayers: 0
  });

  // Sample data - Replace with API call in production
  useEffect(() => {
    const sampleTeams = [
      {
        id: 1,
        name: 'Academy United FC',
        country: 'TN',
        countryName: 'Tunisia',
        state: 'Tunis',
        city: 'Tunis',
        status: 'Professional Academy',
        avatar: 'https://via.placeholder.com/150',
        contact: {
          email: 'contact@academyunited.com',
          phone: '+216 00 000 000',
          whatsapp: '+216 00 000 000',
          website: 'www.academyunited.com'
        },
        achievements: ['National Champions 2023', 'Regional Cup Winners 2022', 'Youth Development Award 2021'],
        players: 45,
        coaches: 5,
        facilities: 'State-of-art training complex',
        level: 'Elite',
        category: 'Professional',
        specializations: ['Youth Development', 'Tactical Training', 'Sports Science'],
        rating: 4.8
      },
      {
        id: 2,
        name: 'Future Stars Academy',
        country: 'TN',
        countryName: 'Tunisia',
        state: 'Sousse',
        city: 'Sousse',
        status: 'Development Academy',
        avatar: 'https://via.placeholder.com/150',
        contact: {
          email: 'info@futurestars.com',
          phone: '+216 00 111 111',
          whatsapp: '+216 00 111 111',
          website: 'www.futurestars.com'
        },
        achievements: ['Regional League Winners 2023', 'Best Youth Program'],
        players: 32,
        coaches: 4,
        facilities: 'Modern training facility',
        level: 'Advanced',
        category: 'Semi-Professional',
        specializations: ['Technical Skills', 'Match Analysis'],
        rating: 4.5
      },
      {
        id: 3,
        name: 'Elite Performance Center',
        country: 'DZ',
        countryName: 'Algeria',
        state: 'Algiers',
        city: 'Algiers',
        status: 'High Performance Center',
        avatar: 'https://via.placeholder.com/150',
        contact: {
          email: 'contact@elitepc.com',
          phone: '+213 00 222 222',
          whatsapp: '+213 00 222 222',
          website: 'www.elitepc.com'
        },
        achievements: ['National Cup 2022', 'International Tournament Winners'],
        players: 38,
        coaches: 6,
        facilities: 'International standard complex',
        level: 'Professional',
        category: 'Professional',
        specializations: ['High Performance', 'Sports Psychology', 'Nutrition'],
        rating: 4.9
      },
      {
        id: 4,
        name: 'Moroccan Football Academy',
        country: 'MA',
        countryName: 'Morocco',
        state: 'Casablanca',
        city: 'Casablanca',
        status: 'National Academy',
        avatar: 'https://via.placeholder.com/150',
        contact: {
          email: 'info@mafootball.com',
          phone: '+212 00 333 333',
          whatsapp: '+212 00 333 333',
          website: 'www.mafootball.com'
        },
        achievements: ['National Champions 2021-2023', 'International Success'],
        players: 50,
        coaches: 8,
        facilities: 'National training center',
        level: 'World Class',
        category: 'Professional',
        specializations: ['Talent Identification', 'International Scouting'],
        rating: 4.7
      }
    ];

    setTeams(sampleTeams);
    setFilteredTeams(sampleTeams);
    
    // Calculate stats
    const totalTeams = sampleTeams.length;
    const byCountry = {};
    let totalPlayers = 0;
    
    sampleTeams.forEach(team => {
      byCountry[team.countryName] = (byCountry[team.countryName] || 0) + 1;
      totalPlayers += team.players;
    });
    
    setStats({
      totalTeams,
      byCountry,
      averagePlayers: Math.round(totalPlayers / totalTeams)
    });
    
    setIsLoading(false);
  }, []);

  // Filter teams based on selected criteria
  useEffect(() => {
    let filtered = [...teams];

    if (filters.country) {
      filtered = filtered.filter(team => team.country === filters.country);
    }
    if (filters.state) {
      filtered = filtered.filter(team => team.state === filters.state);
    }
    if (filters.city) {
      filtered = filtered.filter(team => team.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(query) ||
        team.status.toLowerCase().includes(query) ||
        team.specializations?.some(s => s.toLowerCase().includes(query))
      );
    }

    setFilteredTeams(filtered);
  }, [filters, teams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      state: '',
      city: '',
      searchQuery: ''
    });
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Professional': return 'from-[#902bd1] to-[#00d0cb]';
      case 'Semi-Professional': return 'from-[#00d0cb] to-[#4fb0ff]';
      case 'Amateur': return 'from-[#902bd1] to-[#4fb0ff]';
      default: return 'from-[#902bd1] to-[#4fb0ff]';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'World Class': return 'text-[#902bd1]';
      case 'Professional': return 'text-[#00d0cb]';
      case 'Elite': return 'text-[#4fb0ff]';
      case 'Advanced': return 'text-[#22c55e]';
      case 'Intermediate': return 'text-[#eab308]';
      default: return 'text-gray-400';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const TeamCard = ({ team }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all cursor-pointer group"
      onClick={() => setSelectedTeam(team)}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
            <img
              src={team.avatar}
              alt={team.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getCategoryColor(team.category)}`}>
            {team.category.charAt(0)}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-white group-hover:text-[#00d0cb] transition-colors">
              {team.name}
            </h3>
            <div className="flex items-center gap-1">
              <FiStar className="text-[#eab308]" />
              <span className="text-sm font-medium">{team.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 mt-1">
            <FiMapPin className="text-[#4fb0ff] flex-shrink-0" />
            <span className="text-sm">{`${team.city}, ${team.state}`}</span>
          </div>
          <div className="mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(team.level)} bg-opacity-20`}>
              {team.level}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-400">
            <FiUsers className="text-[#00d0cb]" />
            <span className="text-sm">{team.players}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <FaUsersCog className="text-[#902bd1]" />
            <span className="text-sm">{team.coaches}</span>
          </div>
        </div>
        <FiChevronRight className="text-gray-400 group-hover:text-[#00d0cb] transition-colors" />
      </div>
    </motion.div>
  );

  const TeamModal = ({ team, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-800 border border-gray-700">
                  <img
                    src={team.avatar}
                    alt={team.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute -bottom-2 -right-2 px-3 py-2 rounded-lg font-bold text-white bg-gradient-to-r ${getCategoryColor(team.category)}`}>
                  {team.category}
                </div>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{team.name}</h2>
                <div className="flex items-center gap-2 text-gray-300">
                  <FiMapPin className="text-[#4fb0ff] flex-shrink-0" />
                  <span>{`${team.city}, ${team.state}, ${team.countryName}`}</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getLevelColor(team.level)} bg-opacity-20 border border-opacity-30`}>
                    {team.level} Level
                  </span>
                  <div className="flex items-center gap-1">
                    <FiStar className="text-[#eab308]" />
                    <span className="font-medium">{team.rating}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              {/* <FiX size={24} /> */}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiTarget className="text-[#00d0cb]" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <FiMail className="text-[#4fb0ff] flex-shrink-0" />
                  <a href={`mailto:${team.contact.email}`} className="hover:text-[#00d0cb] transition-colors">
                    {team.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FiPhone className="text-[#4fb0ff] flex-shrink-0" />
                  <a href={`tel:${team.contact.phone}`} className="hover:text-[#00d0cb] transition-colors">
                    {team.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaWhatsapp className="text-[#22c55e] flex-shrink-0" />
                  <a href={`https://wa.me/${team.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#22c55e] transition-colors">
                    WhatsApp: {team.contact.whatsapp}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FiGlobe className="text-[#902bd1] flex-shrink-0" />
                  <a href={`https://${team.contact.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#902bd1] transition-colors">
                    {team.contact.website}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-[#902bd1]" />
                Team Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUsers className="text-[#00d0cb]" />
                    <span className="text-gray-300">Players</span>
                  </div>
                  <span className="text-xl font-bold text-white">{team.players}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaUsersCog className="text-[#902bd1]" />
                    <span className="text-gray-300">Coaches</span>
                  </div>
                  <span className="text-xl font-bold text-white">{team.coaches}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaRegFutbol className="text-[#22c55e]" />
                    <span className="text-gray-300">Facilities</span>
                  </div>
                  <span className="text-sm text-gray-300 text-right">{team.facilities}</span>
                </div>
              </div>
            </div>
          </div>

          {team.specializations && team.specializations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiZap className="text-[#eab308]" />
                Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {team.specializations.map((spec, index) => (
                  <span key={index} className="px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#00d0cb] border border-[#00d0cb]/30">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {team.achievements && team.achievements.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaTrophy className="text-[#eab308]" />
                Achievements
              </h3>
              <div className="space-y-3">
                {team.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#4fb0ff]/10 to-transparent rounded-xl border border-gray-700/50">
                    <div className="p-1 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">
                      <FiAward className="text-white" />
                    </div>
                    <span className="text-gray-300">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Team Directory
              </h1>
              <p className="text-gray-300 mt-2">
                Find and connect with top football academies and teams
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#4fb0ff]/80 to-[#00d0cb]/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-[#4fb0ff]/40">
                <div className="flex items-center gap-3">
                  <FiUsers className="text-xl" />
                  <div>
                    <div className="text-xs text-gray-300">Total Teams</div>
                    <div className="text-lg font-bold">{stats.totalTeams}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div variants={itemVariants} className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Average Players</p>
                  <p className="text-2xl font-bold text-[#00d0cb]">{stats.averagePlayers}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-800/50">
                  <FiUsers className="text-[#00d0cb] text-xl" />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Professional Academies</p>
                  <p className="text-2xl font-bold text-[#902bd1]">
                    {teams.filter(t => t.category === 'Professional').length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-800/50">
                  <FaTrophy className="text-[#902bd1] text-xl" />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Countries</p>
                  <p className="text-2xl font-bold text-[#22c55e]">{Object.keys(stats.byCountry).length}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-800/50">
                  <FiGlobe className="text-[#22c55e] text-xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
                  <FiSearch className="text-lg" />
                </div>
                Search & Filter
              </h2>
              
              {(filters.country || filters.state || filters.city || filters.searchQuery) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                >
                  Clear filters
                </motion.button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Country</label>
                <select
                  name="country"
                  value={filters.country}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                >
                  <option value="" className="bg-gray-900">All Countries</option>
                  <option value="TN" className="bg-gray-900">Tunisia</option>
                  <option value="DZ" className="bg-gray-900">Algeria</option>
                  <option value="MA" className="bg-gray-900">Morocco</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">State/Province</label>
                <select
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                  disabled={!filters.country}
                >
                  <option value="" className="bg-gray-900">All States</option>
                  {filters.country && getStatesForCountry(filters.country).map(state => (
                    <option key={state} value={state} className="bg-gray-900">{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter city name"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Search Academy</label>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="searchQuery"
                    value={filters.searchQuery}
                    onChange={handleFilterChange}
                    placeholder="Search by name or specialization..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-xl border border-[#4fb0ff]/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-gray-300">
                Showing <span className="font-bold text-white">{filteredTeams.length}</span> of{' '}
                <span className="font-bold text-white">{teams.length}</span> academies
              </div>
              {filteredTeams.length === 0 && (
                <div className="text-gray-400">
                  No teams match your criteria. Try adjusting your filters.
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Teams Grid */}
        <motion.div variants={itemVariants}>
          {filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-2xl border border-[#4fb0ff]/30 p-12 text-center"
            >
              <div className="text-5xl mb-4 text-gray-400">
                <FiUsers />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No academies found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-6 py-3 text-white font-medium rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
                }}
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Team Modal */}
        <AnimatePresence>
          {selectedTeam && (
            <TeamModal
              team={selectedTeam}
              onClose={() => setSelectedTeam(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Contact;