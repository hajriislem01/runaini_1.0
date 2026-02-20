import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FiCalendar, FiPlus, FiX, FiClock, FiMapPin, FiUsers, 
  FiUserCheck, FiUserX, FiEdit, FiTrash2, FiChevronLeft, 
  FiChevronRight, FiFilter, FiCheck, FiZap, FiTarget, FiTrendingUp 
} from 'react-icons/fi';
import { FaFutbol, FaTrophy, FaUsers, FaRegCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isSameMonth, eachDayOfInterval, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths } from 'date-fns';

const AgendaManagement = ({ events, addEvent, updateEvent, deleteEvent, players, coaches }) => {
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState([]);
  const [playerAbsences, setPlayerAbsences] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Event types structure
  const eventTypes = {
    training: {
      physique: ['A', 'B', 'C', 'D'],
      tactique: ['A', 'B', 'C', 'D']
    },
    match: ['Friendly', 'League', 'Tournament'],
    meeting: ['General', 'Staff', 'Players']
  };
  
  // Add toast notification
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(toasts => [...toasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(toasts => toasts.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  // Derive groups and subgroups from players
  const groupsWithSubgroups = useMemo(() => {
    const groupsMap = new Map();
    
    players.forEach(player => {
      if (player.group) {
        if (!groupsMap.has(player.group)) {
          groupsMap.set(player.group, {
            id: player.group,
            name: player.group,
            color: `bg-${['blue','green','purple','red','yellow'][groupsMap.size % 5]}-500`,
            subgroups: new Set()
          });
        }
        
        if (player.subgroup) {
          const group = groupsMap.get(player.group);
          group.subgroups.add(player.subgroup);
        }
      }
    });

    return Array.from(groupsMap.values()).map(group => ({
      ...group,
      subgroups: Array.from(group.subgroups)
    }));
  }, [players]);
  
  // Event form state
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
  
  // Initialize absences
  useEffect(() => {
    const absences = {};
    events.forEach(event => {
      absences[event.id] = event.absences || [];
    });
    setPlayerAbsences(absences);
  }, [events]);
  
  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'type') {
      setEventForm(prev => {
        let newSubType = '';
        if (value === 'training') {
          newSubType = 'physique-A';
        } else if (value === 'match') {
          newSubType = eventTypes.match[0];
        } else {
          newSubType = eventTypes.meeting[0];
        }
        return { ...prev, subType: newSubType };
      });
    }
  };

  // Handle subtype change
  const handleSubTypeChange = (e) => {
    setEventForm(prev => ({ ...prev, subType: e.target.value }));
  };
  
  // Handle group toggle with subgroups
  const handleGroupToggle = (groupId) => {
    setEventForm(prev => {
      const newAssignedGroups = prev.assignedGroups.includes(groupId)
        ? prev.assignedGroups.filter(id => id !== groupId)
        : [...prev.assignedGroups, groupId];

      const group = groupsWithSubgroups.find(g => g.id === groupId);
      const newAssignedSubgroups = prev.assignedGroups.includes(groupId)
        ? prev.assignedSubgroups.filter(sub => !group.subgroups.includes(sub))
        : prev.assignedSubgroups;

      return {
        ...prev,
        assignedGroups: newAssignedGroups,
        assignedSubgroups: newAssignedSubgroups
      };
    });
  };
  
  // Handle subgroup toggle
  const handleSubgroupToggle = (subgroup) => {
    setEventForm(prev => ({
      ...prev,
      assignedSubgroups: prev.assignedSubgroups.includes(subgroup)
        ? prev.assignedSubgroups.filter(sub => sub !== subgroup)
        : [...prev.assignedSubgroups, subgroup]
    }));
  };
  
  // Handle absence toggle
  const handleAbsenceToggle = (eventId, playerId) => {
    setPlayerAbsences(prev => {
      const eventAbsences = prev[eventId] || [];
      const newAbsences = eventAbsences.includes(playerId)
        ? eventAbsences.filter(id => id !== playerId)
        : [...eventAbsences, playerId];
      
      return { ...prev, [eventId]: newAbsences };
    });
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateEventForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const newEvent = {
        ...eventForm,
        id: selectedEvent ? selectedEvent.id : Date.now().toString(),
        absences: playerAbsences[selectedEvent?.id] || []
      };

      if (selectedEvent) {
        await updateEvent(newEvent);
        addToast('Event updated successfully!');
      } else {
        await addEvent(newEvent);
        addToast('Event created successfully!');
      }

      resetForm();
    } catch (error) {
      addToast('Error saving event: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form
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
  
  // Handle edit event
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setEventForm({
      ...event,
      assignedGroups: event.assignedGroups || [],
      assignedSubgroups: event.assignedSubgroups || []
    });
    setShowEventModal(true);
  };
  
  // Filter events based on selected groups and subgroups
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!event) return false;
      if (selectedGroups.length === 0 && selectedSubgroups.length === 0) return true;
      
      const hasSelectedGroup = event.assignedGroups?.some(groupId => 
        selectedGroups.includes(groupId)
      );
      
      const hasSelectedSubgroup = event.assignedSubgroups?.some(subgroup => 
        selectedSubgroups.includes(subgroup)
      );

      // New logic: If both groups and subgroups are selected, event must match BOTH
      // If only groups are selected, event must match group
      // If only subgroups are selected, event must match subgroup
      if (selectedGroups.length > 0 && selectedSubgroups.length > 0) {
        // Both group and subgroup selected - must match BOTH
        return hasSelectedGroup && hasSelectedSubgroup;
      } else if (selectedGroups.length > 0) {
        // Only group selected - must match group
        return hasSelectedGroup;
      } else if (selectedSubgroups.length > 0) {
        // Only subgroup selected - must match subgroup
        return hasSelectedSubgroup;
      } else {
        return true;
      }
    });
  }, [events, selectedGroups, selectedSubgroups]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const todayEvents = filteredEvents.filter(event => 
      format(new Date(event.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length;
    const trainingEvents = filteredEvents.filter(event => event.type === 'training').length;
    const matchEvents = filteredEvents.filter(event => event.type === 'match').length;

    return {
      totalEvents,
      todayEvents,
      trainingEvents,
      matchEvents
    };
  }, [filteredEvents]);
  
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const dayEvents = filteredEvents.filter(event => event.date === dateString);
      
      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        events: dayEvents
      };
    });
  }, [currentDate, filteredEvents]);
  
  // Handle day click
  const handleDayClick = (date) => {
    setSelectedDay(date);
    setShowDayEventsModal(true);
  };
  
  // Create new event for selected day
  const createEventForDay = (date) => {
    setEventForm(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
    setSelectedEvent(null);
    setShowEventModal(true);
    setShowDayEventsModal(false);
  };

  // Handle delete confirmation
  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id);
        addToast('Event deleted successfully!');
      } catch (error) {
        addToast('Error deleting event: ' + error.message, 'error');
      } finally {
        setShowDeleteConfirm(false);
        setEventToDelete(null);
      }
    }
  };

  // Validate event form
  const validateEventForm = () => {
    if (!eventForm.title?.trim()) {
      addToast('Please enter an event title', 'error');
      return false;
    }
    if (!eventForm.date) {
      addToast('Please select a date', 'error');
      return false;
    }
    if (!eventForm.startTime) {
      addToast('Please select a start time', 'error');
      return false;
    }
    if (!eventForm.endTime) {
      addToast('Please select an end time', 'error');
      return false;
    }
    if (!eventForm.coachId) {
      addToast('Please select a coach', 'error');
      return false;
    }
    if (eventForm.assignedGroups.length === 0 && eventForm.assignedSubgroups.length === 0) {
      addToast('Please select at least one group or subgroup', 'error');
      return false;
    }
    return true;
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedGroups([]);
    setSelectedSubgroups([]);
    setExpandedGroup(null);
    addToast('Filters cleared');
  };

  // Render event type badge
  const renderEventTypeBadge = (event) => {
    const typeConfig = {
      training: { color: 'from-[#00d0cb] to-[#4fb0ff]', icon: <FaFutbol /> },
      match: { color: 'from-[#902bd1] to-[#00d0cb]', icon: <FaTrophy /> },
      meeting: { color: 'from-[#902bd1] to-[#4fb0ff]', icon: <FaUsers /> }
    };
    
    const config = typeConfig[event.type] || typeConfig.training;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${config.color}`}>
        {config.icon}
        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
      </span>
    );
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
                Agenda Management
              </h1>
              <p className="text-gray-300 mt-2">
                Schedule and manage training sessions, matches, and meetings
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setShowEventModal(true);
              }}
              className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
              }}
            >
              <FiPlus className="text-lg" />
              New Event
            </motion.button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { 
                label: 'Total Events', 
                value: stats.totalEvents, 
                color: '#4fb0ff', 
                icon: <FaRegCalendarAlt /> 
              },
              { 
                label: 'Today', 
                value: stats.todayEvents, 
                color: '#00d0cb', 
                icon: <FiCalendar /> 
              },
              { 
                label: 'Trainings', 
                value: stats.trainingEvents, 
                color: '#902bd1', 
                icon: <FaFutbol /> 
              },
              { 
                label: 'Matches', 
                value: stats.matchEvents, 
                color: '#22c55e', 
                icon: <FaTrophy /> 
              }
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
        
        {/* Filter Section */}
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
            
            <div className="space-y-4">
              {/* Groups Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Groups</h3>
                <div className="flex flex-wrap gap-2">
                  {groupsWithSubgroups.map(group => (
                    <motion.button
                      key={group.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setExpandedGroup(expandedGroup === group.id ? null : group.id);
                        setSelectedGroups(prev => 
                          prev.includes(group.id) 
                            ? prev.filter(id => id !== group.id) 
                            : [...prev, group.id]
                        );
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                        selectedGroups.includes(group.id)
                          ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white border-transparent'
                          : 'bg-gray-800/50 text-gray-300 hover:text-white hover:border-gray-600 border border-gray-700/50'
                      }`}
                    >
                      {group.name}
                      {group.subgroups.length > 0 && (
                        <FiChevronRight 
                          className={`transition-transform ${expandedGroup === group.id ? 'rotate-90' : ''}`}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Subgroups Section */}
              {expandedGroup && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-gray-700/50 pt-4"
                >
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Subgroups</h3>
                  <div className="flex flex-wrap gap-2">
                    {groupsWithSubgroups
                      .find(g => g.id === expandedGroup)
                      ?.subgroups.map(subgroup => (
                        <motion.button
                          key={subgroup}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSubgroups(prev => 
                            prev.includes(subgroup) 
                              ? prev.filter(s => s !== subgroup) 
                              : [...prev, subgroup]
                          )}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                            selectedSubgroups.includes(subgroup)
                              ? 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white border-transparent'
                              : 'bg-gray-800/50 text-gray-300 hover:text-white hover:border-gray-600 border border-gray-700/50'
                          }`}
                        >
                          {subgroup}
                        </motion.button>
                      ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Calendar Navigation */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentDate(addMonths(currentDate, -1))}
                className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors border border-gray-700/50"
              >
                <FiChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-white">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentDate(new Date())}
                  className="text-sm text-[#00d0cb] hover:text-[#4fb0ff] mt-1 flex items-center gap-1"
                >
                  <FiZap className="text-xs" />
                  Today
                </motion.button>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors border border-gray-700/50"
              >
                <FiChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* Calendar Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day} 
                className="text-center font-medium text-gray-300 py-3 text-sm"
              >
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.02 }}
                className={`min-h-28 p-2 rounded-xl cursor-pointer transition-all border ${
                  day.isCurrentMonth 
                    ? 'bg-gray-900/30 border-gray-700/50' 
                    : 'bg-gray-900/10 border-gray-700/30 text-gray-500'
                } ${
                  isToday(day.date) 
                    ? 'border-[#00d0cb] ring-2 ring-[#00d0cb]/20' 
                    : ''
                }`}
                onClick={() => handleDayClick(day.date)}
              >
                <div className={`text-right text-sm font-medium p-1 ${
                  isToday(day.date) ? 'text-[#00d0cb] font-bold' : 'text-gray-300'
                }`}>
                  {format(day.date, 'd')}
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1">
                  {day.events.slice(0, 4).map(event => (
                    <motion.div 
                      key={event.id} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded-lg truncate border ${
                        event.type === 'training' 
                          ? 'bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 border-[#00d0cb]/30' : 
                        event.type === 'match' 
                          ? 'bg-gradient-to-r from-[#902bd1]/20 to-[#00d0cb]/20 border-[#902bd1]/30' : 
                          'bg-gradient-to-r from-[#4fb0ff]/20 to-[#902bd1]/20 border-[#4fb0ff]/30'
                      }`}
                    >
                      <div className="font-medium text-xs truncate text-white">{event.title}</div>
                      <div className="text-[0.65rem] text-gray-400 mt-1 flex items-center">
                        <FiClock className="mr-1" size={10} />
                        {event.startTime}
                      </div>
                    </motion.div>
                  ))}
                  {day.events.length > 4 && (
                    <div className="text-xs text-gray-500 pl-1 italic">
                      +{day.events.length - 4} more
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border ${
                  toast.type === 'error' 
                    ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                    : 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiCheck className="flex-shrink-0" />
                  <span>{toast.message}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Event Modal */}
        <AnimatePresence>
          {showEventModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedEvent ? 'Edit Event' : 'Create Event'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Event Title</label>
                      <input
                        type="text"
                        name="title"
                        value={eventForm.title}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                        placeholder="Event name"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Date</label>
                        <input
                          type="date"
                          name="date"
                          value={eventForm.date}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Type</label>
                        <select
                          name="type"
                          value={eventForm.type}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                          required
                        >
                          <option value="training" className="bg-gray-900">Training</option>
                          <option value="match" className="bg-gray-900">Match</option>
                          <option value="meeting" className="bg-gray-900">Meeting</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Subtype selector */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        {eventForm.type === 'training' ? 'Training Type' : 
                         eventForm.type === 'match' ? 'Match Type' : 
                         'Meeting Type'}
                      </label>
                      
                      {eventForm.type === 'training' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Category</label>
                            <select
                              value={eventForm.subType.split('-')[0]}
                              onChange={(e) => {
                                const newCategory = e.target.value;
                                const currentLevel = eventForm.subType.split('-')[1] || 'A';
                                setEventForm(prev => ({
                                  ...prev, 
                                  subType: `${newCategory}-${currentLevel}`
                                }));
                              }}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                            >
                              <option value="physique" className="bg-gray-900">Physique</option>
                              <option value="tactique" className="bg-gray-900">Tactique</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Level</label>
                            <select
                              value={eventForm.subType.split('-')[1]}
                              onChange={(e) => {
                                const currentCategory = eventForm.subType.split('-')[0] || 'physique';
                                const newLevel = e.target.value;
                                setEventForm(prev => ({
                                  ...prev, 
                                  subType: `${currentCategory}-${newLevel}`
                                }));
                              }}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                            >
                              <option value="A" className="bg-gray-900">A (Beginner)</option>
                              <option value="B" className="bg-gray-900">B (Intermediate)</option>
                              <option value="C" className="bg-gray-900">C (Advanced)</option>
                              <option value="D" className="bg-gray-900">D (Elite)</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <select
                          value={eventForm.subType}
                          onChange={handleSubTypeChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                        >
                          {eventTypes[eventForm.type].map(option => (
                            <option key={option} value={option} className="bg-gray-900">
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Start Time</label>
                        <input
                          type="time"
                          name="startTime"
                          value={eventForm.startTime}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">End Time</label>
                        <input
                          type="time"
                          name="endTime"
                          value={eventForm.endTime}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={eventForm.location}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                        placeholder="Training field, stadium, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Assigned Coach</label>
                      <select
                        name="coachId"
                        value={eventForm.coachId}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                        required
                      >
                        <option value="" className="bg-gray-900">Select coach</option>
                        {coaches.map(coach => (
                          <option key={coach.id} value={coach.id} className="bg-gray-900">
                            {coach.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Assigned Groups</label>
                      <div className="space-y-3">
                        {groupsWithSubgroups.map(group => (
                          <div key={group.id} className="space-y-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`group-${group.id}`}
                                checked={eventForm.assignedGroups.includes(group.id)}
                                onChange={() => handleGroupToggle(group.id)}
                                className="h-4 w-4 text-[#00d0cb] rounded focus:ring-[#00d0cb] bg-gray-800 border-gray-700"
                              />
                              <label 
                                htmlFor={`group-${group.id}`}
                                className="font-medium text-gray-300"
                              >
                                {group.name}
                              </label>
                              {group.subgroups.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                                  className="ml-auto text-gray-400 hover:text-white"
                                >
                                  <FiChevronRight 
                                    className={`transition-transform ${expandedGroup === group.id ? 'rotate-90' : ''}`}
                                  />
                                </button>
                              )}
                            </div>

                            {expandedGroup === group.id && group.subgroups.length > 0 && (
                              <div className="ml-7 space-y-2">
                                {group.subgroups.map(subgroup => (
                                  <div key={subgroup} className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      id={`subgroup-${subgroup}`}
                                      checked={eventForm.assignedSubgroups.includes(subgroup)}
                                      onChange={() => handleSubgroupToggle(subgroup)}
                                      className="h-4 w-4 text-[#902bd1] rounded focus:ring-[#902bd1] bg-gray-800 border-gray-700"
                                    />
                                    <label 
                                      htmlFor={`subgroup-${subgroup}`}
                                      className="text-sm text-gray-400"
                                    >
                                      {subgroup}
                                    </label>
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
                      <textarea
                        name="description"
                        value={eventForm.description}
                        onChange={handleFormChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                        placeholder="Event details, objectives, special instructions..."
                      ></textarea>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetForm}
                        className="px-6 py-3 text-gray-300 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 hover:text-white transition-colors font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 text-white font-semibold rounded-xl ${
                          isSubmitting 
                            ? 'opacity-70 cursor-not-allowed' 
                            : ''
                        }`}
                        style={{
                          background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
                        }}
                      >
                        {isSubmitting ? 'Saving...' : (selectedEvent ? 'Update Event' : 'Create Event')}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDayEventsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff]">
                        <FiCalendar className="text-white text-xl" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowDayEventsModal(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {calendarDays
                      .find(d => d.date.getTime() === selectedDay.getTime())
                      ?.events?.map(event => (
                        <motion.div 
                          key={event.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-colors"
                        >
                          <div className={`p-6 ${
                            event.type === 'training' 
                              ? 'border-l-4 border-[#00d0cb]' : 
                            event.type === 'match' 
                              ? 'border-l-4 border-[#902bd1]' : 
                              'border-l-4 border-[#4fb0ff]'
                          }`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <h3 className="text-lg font-bold text-white">
                                    {event.title}
                                  </h3>
                                  {renderEventTypeBadge(event)}
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                                  <div className="flex items-center gap-2">
                                    <FiClock className="flex-shrink-0" />
                                    <span>{event.startTime} - {event.endTime}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FiMapPin className="flex-shrink-0" />
                                    <span>{event.location || 'Main Field'}</span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {/* Display Groups */}
                                  {event.assignedGroups?.map(groupId => {
                                    const group = groupsWithSubgroups.find(g => g.id === groupId);
                                    return group ? (
                                      <span 
                                        key={groupId} 
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[#4fb0ff]/30 to-[#00d0cb]/30 text-white border border-[#4fb0ff]/50"
                                      >
                                        {group.name}
                                      </span>
                                    ) : null;
                                  })}
                                  
                                  {/* Display Subgroups */}
                                  {event.assignedSubgroups?.map(subgroup => {
                                    const subgroupName = event.subgroupName || subgroup;
                                    return (
                                      <span 
                                        key={subgroup} 
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[#902bd1]/30 to-[#00d0cb]/30 text-white border border-[#902bd1]/50"
                                      >
                                        {subgroupName}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    handleEditEvent(event);
                                    setShowDayEventsModal(false);
                                  }}
                                  className="text-[#00d0cb] hover:text-[#4fb0ff] p-2 rounded-lg hover:bg-[#00d0cb]/10 transition-colors"
                                  title="Edit event"
                                >
                                  <FiEdit size={20} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteClick(event)}
                                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                  title="Delete event"
                                >
                                  <FiTrash2 size={20} />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    }
                    
                    {calendarDays.find(d => d.date.getTime() === selectedDay.getTime())?.events?.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-700 rounded-xl"
                      >
                        <FiCalendar className="mx-auto text-3xl mb-3" />
                        <p className="text-lg">No events scheduled for this day</p>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => createEventForDay(selectedDay)}
                      className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-3"
                      style={{
                        background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)'
                      }}
                    >
                      <FiPlus className="text-lg" />
                      Add Event
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-700"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                    <FiTrash2 className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Delete Event</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
                  </p>
                  <div className="flex justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setEventToDelete(null);
                      }}
                      className="px-4 py-2 text-gray-300 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 hover:text-white transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-colors"
                    >
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