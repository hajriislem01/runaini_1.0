import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiCalendar, FiMapPin, FiUsers, FiFilter, FiX, FiTarget, FiZap, FiTrendingUp, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { FaFutbol, FaTrophy, FaRegCalendarCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from './api';
import toast, { Toaster } from 'react-hot-toast';

const EventsManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: '',
    location: '',
    group: '',
    date: '',
    status: ''
  });

  // ✅ Fetch events + groups depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsRes, groupsRes] = await Promise.all([
          API.get('events/'),
          API.get('groups/')
        ]);
        setEvents(eventsRes.data);
        setFilteredEvents(eventsRes.data);
        setGroups(groupsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Filtrage
  useEffect(() => {
    let filtered = [...events];

    if (filters.searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.group) {
      filtered = filtered.filter(event => String(event.group) === String(filters.group));
    }
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }
    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredEvents(filtered);
  }, [events, filters]);

  // ✅ Supprimer un event
  const handleDelete = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) return;
    try {
      await API.delete(`events/${eventId}/`);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  // ✅ Marquer comme complété
  const handleComplete = async (eventId, winner = '') => {
    try {
      const response = await API.patch(`events/${eventId}/complete/`, { winner });
      setEvents(prev => prev.map(e => e.id === eventId ? response.data : e));
      toast.success('Event marked as completed');
    } catch (error) {
      toast.error('Failed to complete event');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ searchTerm: '', type: '', location: '', group: '', date: '', status: '' });
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getEventStatus = (event) => {
    if (event.status === 'completed') return 'Completed';
    if (event.status === 'cancelled') return 'Cancelled';
    if (event.winner) return 'Winner Selected';
    if (event.participants?.every(p => p.status === 'accepted')) return 'All Accepted';
    if (event.participants?.some(p => p.status === 'pending')) return 'Pending Approvals';
    return 'Open';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Winner Selected': return 'bg-[#902bd1]/20 text-[#902bd1] border-[#902bd1]/30';
      case 'All Accepted': return 'bg-[#00d0cb]/20 text-[#00d0cb] border-[#00d0cb]/30';
      case 'Pending Approvals': return 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30';
      default: return 'bg-gray-800/50 text-gray-300 border-gray-700/50';
    }
  };

  const getEventTypeColor = (type) => {
    return type === 'Tournament' ? 'from-[#902bd1] to-[#00d0cb]' : 'from-[#902bd1] to-[#4fb0ff]';
  };

  const getEventIcon = (type) => {
    return type === 'Tournament' ? <FaTrophy /> : <FaFutbol />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const stats = {
    total: filteredEvents.length,
    upcoming: filteredEvents.filter(e => new Date(e.date) > new Date() && e.status !== 'completed').length,
    completed: filteredEvents.filter(e => e.status === 'completed').length,
    tournaments: filteredEvents.filter(e => e.type === 'Tournament').length
  };

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Events Management
              </h1>
              <p className="text-gray-300 mt-2">Organize and manage all team events and tournaments</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/administration/create-event')}
              className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}
            >
              <FiPlus className="text-lg" />Create Event
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Events', value: stats.total, color: '#4fb0ff', icon: <FaRegCalendarCheck /> },
              { label: 'Upcoming', value: stats.upcoming, color: '#00d0cb', icon: <FiCalendar /> },
              { label: 'Tournaments', value: stats.tournaments, color: '#902bd1', icon: <FaTrophy /> },
              { label: 'Completed', value: stats.completed, color: '#22c55e', icon: <FiTrendingUp /> }
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}
                className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    {isLoading ? (
                      <div className="h-8 w-12 bg-gray-700/50 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-gray-800/50" style={{ color: stat.color }}>{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" name="searchTerm" value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search events by name or description..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-900/50 text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors flex items-center justify-center gap-2">
              <FiFilter />{showFilters ? 'Hide Filters' : 'Show Filters'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#4fb0ff]/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiZap className="text-[#eab308]" />Event Type
                      </label>
                      <select name="type" value={filters.type} onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                        <option value="" className="bg-gray-900">All Types</option>
                        <option value="Match Friendly" className="bg-gray-900">Match Friendly</option>
                        <option value="Tournament" className="bg-gray-900">Tournament</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiTarget className="text-[#22c55e]" />Status
                      </label>
                      <select name="status" value={filters.status} onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                        <option value="" className="bg-gray-900">All Status</option>
                        <option value="open" className="bg-gray-900">Open</option>
                        <option value="completed" className="bg-gray-900">Completed</option>
                        <option value="cancelled" className="bg-gray-900">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiMapPin className="text-[#4fb0ff]" />Location
                      </label>
                      <input type="text" name="location" value={filters.location}
                        onChange={handleFilterChange} placeholder="Filter by location"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiUsers className="text-[#902bd1]" />Group
                      </label>
                      <select name="group" value={filters.group} onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                        <option value="" className="bg-gray-900">All Groups</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id} className="bg-gray-900">{group.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiCalendar className="text-[#00d0cb]" />Date
                      </label>
                      <input type="date" name="date" value={filters.date}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700/50">
                    <div className="text-gray-400 text-sm">
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                    </div>
                    <button onClick={clearFilters}
                      className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                      <FiX size={18} />Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Events List */}
        <motion.div variants={itemVariants}>
          {isLoading ? (
            // ✅ Skeleton loader
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-900/40 rounded-2xl border border-gray-700/50 p-6 animate-pulse">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-gray-700/50 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-gray-700/50 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-gray-700/50 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <motion.div key={event.id} whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all group">
                  <div className="h-2 w-full"
                    style={{ background: `linear-gradient(to right, ${event.type === 'Tournament' ? '#902bd1' : '#4fb0ff'}, #00d0cb)` }} />

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

                    <div className="space-y-3 mb-4">
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
                          {event.group_name}
                          {event.subgroup_name && <span className="text-gray-400"> • {event.subgroup_name}</span>}
                        </span>
                      </div>
                      {event.target_academy && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <FiTarget className="text-[#22c55e] flex-shrink-0" />
                          <span className="text-sm">vs {event.target_academy}</span>
                        </div>
                      )}
                      {event.winner && (
                        <div className="flex items-center gap-3 text-yellow-400">
                          <FaTrophy className="flex-shrink-0" />
                          <span className="text-sm font-medium">Winner: {event.winner}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiUsers className="text-xs" />
                        <span>{event.participants_count} participants</span>
                      </div>
                      <div className="flex gap-2">
                        {/* ✅ Bouton Complete si pas encore complété */}
                        {event.status !== 'completed' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleComplete(event.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                            Complete
                          </motion.button>
                        )}
                        {/* ✅ Bouton Manage */}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/administration/event/${event.id}`)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg text-white"
                          style={{ background: `linear-gradient(135deg, ${event.type === 'Tournament' ? '#902bd1' : '#4fb0ff'}, #00d0cb)` }}>
                          Manage
                        </motion.button>
                        {/* ✅ Bouton Delete */}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(event.id, event.title)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                          <FiTrash2 />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div variants={itemVariants}
              className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-2xl border border-[#4fb0ff]/30 p-12 text-center">
              <div className="text-5xl mb-4 text-gray-400 flex justify-center">
                <FaRegCalendarCheck />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No events found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {Object.values(filters).some(f => f)
                  ? 'Try adjusting your filters to find more events'
                  : 'Create your first event to get started'}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/administration/create-event')}
                className="px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 mx-auto"
                style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                <FiPlus />Create First Event
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Footer Stats */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: filteredEvents.filter(e => e.type === 'Match Friendly').length, label: 'Friendly Matches', color: 'text-[#4fb0ff]' },
                { value: filteredEvents.filter(e => e.type === 'Tournament').length, label: 'Tournaments', color: 'text-[#902bd1]' },
                { value: filteredEvents.filter(e => getEventStatus(e) === 'Pending Approvals').length, label: 'Pending Approval', color: 'text-[#eab308]' },
                { value: filteredEvents.filter(e => e.status === 'completed').length, label: 'Completed', color: 'text-[#22c55e]' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.value}</div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default EventsManagement;