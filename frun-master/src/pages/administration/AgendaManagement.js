import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiCalendar, FiPlus, FiX, FiClock, FiMapPin, FiUsers,
  FiEdit, FiTrash2, FiChevronLeft,
  FiChevronRight, FiFilter, FiCheck, FiZap
} from 'react-icons/fi';
import { FaFutbol, FaTrophy, FaUsers, FaRegCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, isToday, isSameMonth, eachDayOfInterval,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths
} from 'date-fns';
import API from './api';
import toast, { Toaster } from 'react-hot-toast';

const AgendaManagement = () => {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = {
    training: { physique: ['A', 'B', 'C', 'D'], tactique: ['A', 'B', 'C', 'D'] },
    match: ['Friendly', 'League', 'Tournament'],
    meeting: ['General', 'Staff', 'Players']
  };

  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'training',
    subType: 'physique-A',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '12:00',
    location: '',
    description: '',
    assignedGroups: [],
    assignedSubgroups: [],
    coachId: '',
  });

  // ✅ Fetch events, groups, coaches depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsRes, groupsRes, coachesRes] = await Promise.all([
          API.get('events/'),
          API.get('groups/'),
          API.get('coaches/')
        ]);
        setEvents(eventsRes.data);
        setGroups(groupsRes.data);
        setCoaches(coachesRes.data);
      } catch (error) {
        toast.error('Failed to load agenda data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Groupes avec subgroups depuis l'API
  const groupsWithSubgroups = useMemo(() => {
    return groups.map(group => ({
      id: group.id,
      name: group.name,
      subgroups: group.subgroups || []
    }));
  }, [groups]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
    if (name === 'type') {
      setEventForm(prev => ({
        ...prev,
        subType: value === 'training' ? 'physique-A' :
          value === 'match' ? eventTypes.match[0] : eventTypes.meeting[0]
      }));
    }
  };

  const handleGroupToggle = (groupId) => {
    setEventForm(prev => {
      const isSelected = prev.assignedGroups.includes(groupId);
      const group = groupsWithSubgroups.find(g => g.id === groupId);
      return {
        ...prev,
        assignedGroups: isSelected
          ? prev.assignedGroups.filter(id => id !== groupId)
          : [...prev.assignedGroups, groupId],
        assignedSubgroups: isSelected
          ? prev.assignedSubgroups.filter(sub => !group?.subgroups?.some(s => s.id === sub))
          : prev.assignedSubgroups
      };
    });
  };

  const handleSubgroupToggle = (subgroupId) => {
    setEventForm(prev => ({
      ...prev,
      assignedSubgroups: prev.assignedSubgroups.includes(subgroupId)
        ? prev.assignedSubgroups.filter(s => s !== subgroupId)
        : [...prev.assignedSubgroups, subgroupId]
    }));
  };

  const validateEventForm = () => {
    if (!eventForm.title?.trim()) { toast.error('Please enter an event title'); return false; }
    if (!eventForm.date) { toast.error('Please select a date'); return false; }
    if (!eventForm.startTime) { toast.error('Please select a start time'); return false; }
    if (!eventForm.endTime) { toast.error('Please select an end time'); return false; }
    if (eventForm.assignedGroups.length === 0) { toast.error('Please select at least one group'); return false; }
    return true;
  };

  // ✅ Submit — POST ou PUT /api/events/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEventForm()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        title: eventForm.title,
        type: eventForm.type === 'match' ? 'Match Friendly' : 'Tournament',
        date: `${eventForm.date}T${eventForm.startTime}:00Z`,
        location: eventForm.location || '',
        description: eventForm.description || '',
        group: eventForm.assignedGroups[0], // ✅ premier groupe sélectionné
        subgroup: eventForm.assignedSubgroups[0] || null,
        status: 'open'
      };

      let response;
      if (selectedEvent) {
        response = await API.put(`events/${selectedEvent.id}/`, payload);
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? response.data : e));
        toast.success('Event updated successfully!');
      } else {
        response = await API.post('events/', payload);
        setEvents(prev => [...prev, response.data]);
        toast.success('Event created successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error.response?.data);
      toast.error('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      type: 'training',
      subType: 'physique-A',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '12:00',
      location: '',
      description: '',
      assignedGroups: [],
      assignedSubgroups: [],
      coachId: '',
    });
    setSelectedEvent(null);
    setShowEventModal(false);
  };

  const handleEditEvent = (event) => {
    const eventDate = new Date(event.date);
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      type: event.type === 'Tournament' ? 'match' : 'training',
      subType: 'physique-A',
      date: format(eventDate, 'yyyy-MM-dd'),
      startTime: format(eventDate, 'HH:mm'),
      endTime: format(eventDate, 'HH:mm'),
      location: event.location || '',
      description: event.description || '',
      assignedGroups: [event.group],
      assignedSubgroups: event.subgroup ? [event.subgroup] : [],
      coachId: '',
    });
    setShowEventModal(true);
  };

  // ✅ Delete event via API
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await API.delete(`events/${eventToDelete.id}/`);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  };

  // ✅ Filtre events selon groupes sélectionnés
  const filteredEvents = useMemo(() => {
    if (selectedGroups.length === 0 && selectedSubgroups.length === 0) return events;
    return events.filter(event => {
      const matchGroup = selectedGroups.length === 0 || selectedGroups.includes(event.group);
      const matchSubgroup = selectedSubgroups.length === 0 || selectedSubgroups.includes(event.subgroup);
      return matchGroup && matchSubgroup;
    });
  }, [events, selectedGroups, selectedSubgroups]);

  const stats = useMemo(() => ({
    totalEvents: filteredEvents.length,
    todayEvents: filteredEvents.filter(e => {
      const d = new Date(e.date);
      return format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    }).length,
    trainingEvents: filteredEvents.filter(e => e.type !== 'Tournament').length,
    matchEvents: filteredEvents.filter(e => e.type === 'Tournament').length
  }), [filteredEvents]);

  // ✅ Calendar — utilise event.date (format ISO)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const dayEvents = filteredEvents.filter(event => {
        const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
        return eventDate === dateString;
      });
      return { date, isCurrentMonth: isSameMonth(date, currentDate), events: dayEvents };
    });
  }, [currentDate, filteredEvents]);

  const handleDayClick = (date) => {
    setSelectedDay(date);
    setShowDayEventsModal(true);
  };

  const createEventForDay = (date) => {
    setEventForm(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
    setSelectedEvent(null);
    setShowEventModal(true);
    setShowDayEventsModal(false);
  };

  const renderEventTypeBadge = (event) => {
    const config = event.type === 'Tournament'
      ? { color: 'from-[#902bd1] to-[#00d0cb]', icon: <FaTrophy /> }
      : { color: 'from-[#00d0cb] to-[#4fb0ff]', icon: <FaFutbol /> };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${config.color}`}>
        {config.icon}{event.type}
      </span>
    );
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

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
                Agenda Management
              </h1>
              <p className="text-gray-300 mt-2">Schedule and manage training sessions, matches, and meetings</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { resetForm(); setShowEventModal(true); }}
              className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
              <FiPlus className="text-lg" />New Event
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Events', value: stats.totalEvents, color: '#4fb0ff', icon: <FaRegCalendarAlt /> },
              { label: 'Today', value: stats.todayEvents, color: '#00d0cb', icon: <FiCalendar /> },
              { label: 'Trainings', value: stats.trainingEvents, color: '#902bd1', icon: <FaFutbol /> },
              { label: 'Matches', value: stats.matchEvents, color: '#22c55e', icon: <FaTrophy /> }
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

        {/* Filter */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
                  <FiFilter className="text-lg" />
                </div>
                Filter Events
              </h2>
              {(selectedGroups.length > 0 || selectedSubgroups.length > 0) && (
                <button onClick={() => { setSelectedGroups([]); setSelectedSubgroups([]); setExpandedGroup(null); }}
                  className="text-sm text-gray-400 hover:text-white">Clear filters</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {groupsWithSubgroups.map(group => (
                <motion.button key={group.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setExpandedGroup(expandedGroup === group.id ? null : group.id);
                    setSelectedGroups(prev => prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                    selectedGroups.includes(group.id)
                      ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white'
                      : 'bg-gray-800/50 text-gray-300 border border-gray-700/50'
                  }`}>
                  {group.name}
                  {group.subgroups?.length > 0 && (
                    <FiChevronRight className={`transition-transform ${expandedGroup === group.id ? 'rotate-90' : ''}`} />
                  )}
                </motion.button>
              ))}
            </div>

            {expandedGroup && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-gray-700/50 pt-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  {groupsWithSubgroups.find(g => g.id === expandedGroup)?.subgroups?.map(sub => (
                    <motion.button key={sub.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSubgroups(prev => prev.includes(sub.id) ? prev.filter(s => s !== sub.id) : [...prev, sub.id])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        selectedSubgroups.includes(sub.id)
                          ? 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white'
                          : 'bg-gray-800/50 text-gray-300 border border-gray-700/50'
                      }`}>
                      {sub.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Calendar Nav */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentDate(addMonths(currentDate, -1))}
                className="p-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50">
                <FiChevronLeft className="w-5 h-5" />
              </motion.button>
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-white">{format(currentDate, 'MMMM yyyy')}</h2>
                <button onClick={() => setCurrentDate(new Date())}
                  className="text-sm text-[#00d0cb] hover:text-[#4fb0ff] mt-1 flex items-center gap-1">
                  <FiZap className="text-xs" />Today
                </button>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50">
                <FiChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-gray-300 py-3 text-sm">{day}</div>
            ))}
            {calendarDays.map((day, index) => (
              <motion.div key={index} whileHover={{ scale: 1.02 }}
                className={`min-h-28 p-2 rounded-xl cursor-pointer transition-all border ${
                  day.isCurrentMonth ? 'bg-gray-900/30 border-gray-700/50' : 'bg-gray-900/10 border-gray-700/30 text-gray-500'
                } ${isToday(day.date) ? 'border-[#00d0cb] ring-2 ring-[#00d0cb]/20' : ''}`}
                onClick={() => handleDayClick(day.date)}>
                <div className={`text-right text-sm font-medium p-1 ${isToday(day.date) ? 'text-[#00d0cb] font-bold' : 'text-gray-300'}`}>
                  {format(day.date, 'd')}
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {day.events.slice(0, 4).map(event => (
                    <motion.div key={event.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded-lg truncate border ${
                        event.type === 'Tournament'
                          ? 'bg-gradient-to-r from-[#902bd1]/20 to-[#00d0cb]/20 border-[#902bd1]/30'
                          : 'bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 border-[#00d0cb]/30'
                      }`}>
                      <div className="font-medium text-xs truncate text-white">{event.title}</div>
                      <div className="text-[0.65rem] text-gray-400 mt-1 flex items-center">
                        <FiClock className="mr-1" size={10} />
                        {format(new Date(event.date), 'HH:mm')}
                      </div>
                    </motion.div>
                  ))}
                  {day.events.length > 4 && (
                    <div className="text-xs text-gray-500 pl-1 italic">+{day.events.length - 4} more</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Event Modal */}
        <AnimatePresence>
          {showEventModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedEvent ? 'Edit Event' : 'Create Event'}</h2>
                    <button onClick={resetForm} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800">
                      <FiX size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Event Title</label>
                      <input type="text" name="title" value={eventForm.title} onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                        placeholder="Event name" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Date</label>
                        <input type="date" name="date" value={eventForm.date} onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Type</label>
                        <select name="type" value={eventForm.type} onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                          <option value="training" className="bg-gray-900">Training</option>
                          <option value="match" className="bg-gray-900">Match</option>
                          <option value="meeting" className="bg-gray-900">Meeting</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Start Time</label>
                        <input type="time" name="startTime" value={eventForm.startTime} onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">End Time</label>
                        <input type="time" name="endTime" value={eventForm.endTime} onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Location</label>
                      <input type="text" name="location" value={eventForm.location} onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                        placeholder="Training field, stadium, etc." />
                    </div>

                    {/* ✅ Groups depuis l'API */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Assigned Groups</label>
                      <div className="space-y-3">
                        {groupsWithSubgroups.map(group => (
                          <div key={group.id}>
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id={`group-${group.id}`}
                                checked={eventForm.assignedGroups.includes(group.id)}
                                onChange={() => handleGroupToggle(group.id)}
                                className="h-4 w-4 text-[#00d0cb] rounded" />
                              <label htmlFor={`group-${group.id}`} className="font-medium text-gray-300">{group.name}</label>
                              {group.subgroups?.length > 0 && (
                                <button type="button"
                                  onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                                  className="ml-auto text-gray-400 hover:text-white">
                                  <FiChevronRight className={`transition-transform ${expandedGroup === group.id ? 'rotate-90' : ''}`} />
                                </button>
                              )}
                            </div>
                            {expandedGroup === group.id && group.subgroups?.length > 0 && (
                              <div className="ml-7 mt-2 space-y-2">
                                {group.subgroups.map(sub => (
                                  <div key={sub.id} className="flex items-center gap-3">
                                    <input type="checkbox" id={`sub-${sub.id}`}
                                      checked={eventForm.assignedSubgroups.includes(sub.id)}
                                      onChange={() => handleSubgroupToggle(sub.id)}
                                      className="h-4 w-4 text-[#902bd1] rounded" />
                                    <label htmlFor={`sub-${sub.id}`} className="text-sm text-gray-400">{sub.name}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Description</label>
                      <textarea name="description" value={eventForm.description} onChange={handleFormChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                        placeholder="Event details, objectives..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={resetForm}
                        className="px-6 py-3 text-gray-300 bg-gray-800/50 rounded-xl border border-gray-700 font-medium">
                        Cancel
                      </button>
                      <motion.button type="submit" disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 text-white font-semibold rounded-xl disabled:opacity-70 flex items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                        {isSubmitting ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                        ) : (
                          selectedEvent ? 'Update Event' : 'Create Event'
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day Events Modal */}
        <AnimatePresence>
          {showDayEventsModal && selectedDay && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDayEventsModal(false)}>
              <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff]">
                        <FiCalendar className="text-white text-xl" />
                      </div>
                      <h2 className="text-xl font-bold text-white">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h2>
                    </div>
                    <button onClick={() => setShowDayEventsModal(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800">
                      <FiX size={24} />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {calendarDays.find(d => d.date.getTime() === selectedDay.getTime())?.events?.map(event => (
                      <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 p-6 ${
                          event.type === 'Tournament' ? 'border-l-4 border-[#902bd1]' : 'border-l-4 border-[#00d0cb]'
                        }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="text-lg font-bold text-white">{event.title}</h3>
                              {renderEventTypeBadge(event)}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                              <div className="flex items-center gap-2">
                                <FiClock /><span>{format(new Date(event.date), 'HH:mm')}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <FiMapPin /><span>{event.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <FiUsers /><span>{event.group_name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { handleEditEvent(event); setShowDayEventsModal(false); }}
                              className="text-[#00d0cb] hover:text-[#4fb0ff] p-2 rounded-lg hover:bg-[#00d0cb]/10">
                              <FiEdit size={20} />
                            </button>
                            <button onClick={() => { setEventToDelete(event); setShowDeleteConfirm(true); setShowDayEventsModal(false); }}
                              className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10">
                              <FiTrash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {calendarDays.find(d => d.date.getTime() === selectedDay.getTime())?.events?.length === 0 && (
                      <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-700 rounded-xl">
                        <FiCalendar className="mx-auto text-3xl mb-3" />
                        <p>No events scheduled for this day</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => createEventForDay(selectedDay)}
                      className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
                      style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                      <FiPlus />Add Event
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-700">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                    <FiTrash2 className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Delete Event</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Are you sure you want to delete "{eventToDelete?.title}"?
                  </p>
                  <div className="flex justify-center gap-3">
                    <button onClick={() => { setShowDeleteConfirm(false); setEventToDelete(null); }}
                      className="px-4 py-2 text-gray-300 bg-gray-800/50 rounded-xl border border-gray-700">
                      Cancel
                    </button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl">
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};

export default AgendaManagement;