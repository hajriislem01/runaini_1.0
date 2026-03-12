import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiCalendar, FiMapPin, FiUsers, FiFilter, FiX, FiTarget, FiZap, FiTrendingUp } from 'react-icons/fi';
import { FaFutbol, FaTrophy, FaRegCalendarCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const EventsManagement = ({ events, addEvent, updateEvent, deleteEvent, groups }) => {
  const navigate = useNavigate();
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    group: '',
    date: '',
    searchTerm: '',
    type: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = [...events];
    
    if (filters.searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.group) {
      filtered = filtered.filter(event => 
        event.group === filters.group
      );
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }
    
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredEvents(filtered);
  }, [events, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      group: '',
      date: '',
      searchTerm: '',
      type: ''
    });
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getEventStatus = (event) => {
    if (event.status === 'completed') return 'Completed';
    if (event.winner) return 'Winner Selected';
    if (event.participants?.every(p => p.status === 'accepted')) return 'All Accepted';
    if (event.participants?.some(p => p.status === 'pending')) return 'Pending Approvals';
    return 'Open';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30';
      case 'Winner Selected':
        return 'bg-[#902bd1]/20 text-[#902bd1] border-[#902bd1]/30';
      case 'All Accepted':
        return 'bg-[#00d0cb]/20 text-[#00d0cb] border-[#00d0cb]/30';
      case 'Pending Approvals':
        return 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30';
      default:
        return 'bg-gray-800/50 text-gray-300 border-gray-700/50';
    }
  };

  const getEventTypeColor = (type) => {
    return type === 'Tournament' 
      ? 'from-[#902bd1] to-[#00d0cb]'
      : 'from-[#902bd1] to-[#4fb0ff]';
  };

  const getEventIcon = (type) => {
    return type === 'Tournament' ? <FaTrophy /> : <FaFutbol />;
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

  const stats = {
    total: filteredEvents.length,
    upcoming: filteredEvents.filter(e => new Date(e.date) > new Date()).length,
    completed: filteredEvents.filter(e => e.status === 'completed').length,
    tournaments: filteredEvents.filter(e => e.type === 'Tournament').length
  };

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
                Events Management
              </h1>
              <p className="text-gray-300 mt-2">
                Organize and manage all team events and tournaments
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/administration/create-event')}
              className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3 transition-all"
              style={{
                background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
              }}
            >
              <FiPlus className="text-lg" />
              Create Event
            </motion.button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Events', value: stats.total, color: '#4fb0ff', icon: <FaRegCalendarCheck /> },
              { label: 'Upcoming', value: stats.upcoming, color: '#00d0cb', icon: <FiCalendar /> },
              { label: 'Tournaments', value: stats.tournaments, color: '#902bd1', icon: <FaTrophy /> },
              { label: 'Completed', value: stats.completed, color: '#22c55e', icon: <FiTrendingUp /> }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-800/50" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search events by name or description..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-900/50 text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <FiFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </motion.button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#4fb0ff]/30">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiZap className="text-[#eab308]" />
                        Event Type
                      </label>
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                      >
                        <option value="" className="bg-gray-900">All Types</option>
                        <option value="Match Friendly" className="bg-gray-900">Match Friendly</option>
                        <option value="Tournament" className="bg-gray-900">Tournament</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiMapPin className="text-[#4fb0ff]" />
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        placeholder="Filter by location"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiUsers className="text-[#902bd1]" />
                        Group
                      </label>
                      <select
                        name="group"
                        value={filters.group}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                      >
                        <option value="" className="bg-gray-900">All Groups</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.name} className="bg-gray-900">
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiCalendar className="text-[#00d0cb]" />
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700/50">
                    <div className="text-gray-400 text-sm">
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                    </div>
                    <button
                      onClick={clearFilters}
                      className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <FiX size={18} />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Events List */}
        <motion.div variants={itemVariants}>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all group"
                >
                  <div 
                    className="h-2 w-full"
                    style={{
                      background: `linear-gradient(to right, ${event.type === 'Tournament' ? '#902bd1' : '#4fb0ff'}, ${event.type === 'Tournament' ? '#00d0cb' : '#00d0cb'})`
                    }}
                  />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getEventTypeColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(getEventStatus(event))}`}>
                            {getEventStatus(event)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-4">
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiCalendar className="text-[#00d0cb] flex-shrink-0" />
                        <span className="text-sm">{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiMapPin className="text-[#4fb0ff] flex-shrink-0" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiUsers className="text-[#902bd1] flex-shrink-0" />
                        <span className="text-sm">
                          {event.group}
                          {event.subgroup && (
                            <span className="text-gray-400"> • {event.subgroup}</span>
                          )}
                        </span>
                      </div>

                      {event.targetAcademy && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <FiTarget className="text-[#22c55e] flex-shrink-0" />
                          <span className="text-sm">vs {event.targetAcademy}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <FiUsers className="text-xs" />
                          <span>{event.participants?.length || 0}</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/administration/event/${event.id}`)}
                        className="px-4 py-2 text-sm font-medium rounded-xl transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${event.type === 'Tournament' ? '#902bd1' : '#4fb0ff'}, ${event.type === 'Tournament' ? '#00d0cb' : '#00d0cb'})`
                        }}
                      >
                        Manage Event
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-2xl border border-[#4fb0ff]/30 p-12 text-center"
            >
              <div className="text-5xl mb-4 text-gray-400">
                <FaRegCalendarCheck />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No events found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {filters.searchTerm || filters.group || filters.location || filters.date || filters.type
                  ? 'Try adjusting your filters to find more events'
                  : 'Create your first event to get started'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/administration/create-event')}
                className="px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
                }}
              >
                <FiPlus />
                Create First Event
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats Footer */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#4fb0ff] mb-1">
                  {filteredEvents.filter(e => e.type === 'Match Friendly').length}
                </div>
                <div className="text-gray-400 text-sm">Friendly Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#902bd1] mb-1">
                  {filteredEvents.filter(e => e.type === 'Tournament').length}
                </div>
                <div className="text-gray-400 text-sm">Tournaments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#eab308] mb-1">
                  {filteredEvents.filter(e => getEventStatus(e) === 'Pending Approvals').length}
                </div>
                <div className="text-gray-400 text-sm">Pending Approval</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#22c55e] mb-1">
                  {filteredEvents.filter(e => getEventStatus(e) === 'Completed').length}
                </div>
                <div className="text-gray-400 text-sm">Completed</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventsManagement;