import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FiCalendar, FiPlus, FiX, FiClock, FiMapPin, FiUsers, 
  FiUserCheck, FiUserX, FiEdit, FiTrash2, FiChevronLeft, 
  FiChevronRight, FiFilter, FiCheck, FiArrowRight 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isSameMonth, eachDayOfInterval, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths } from 'date-fns';

const CoachAgenda = () => {
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  
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

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const storedEvents = JSON.parse(localStorage.getItem('events')) || [];
      const storedPlayers = JSON.parse(localStorage.getItem('players')) || [];
      const storedGroups = JSON.parse(localStorage.getItem('playerGroups')) || [];
      
      setEvents(storedEvents);
      setPlayers(storedPlayers);
      setGroups(storedGroups);
    };

    loadData();
    // Listen for storage changes to sync data
    window.addEventListener('storage', loadData);
    window.addEventListener('focus', loadData);
    
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('focus', loadData);
    };
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
            color: '#4fb0ff', // Using theme colors
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
  
  // Event form state (for editing training sessions)
  const [eventForm, setEventForm] = useState({
    date: '',
    startTime: '10:00',
    endTime: '12:00',
    groups: [],
    subgroups: [],
    player: ''
  });
  
  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle group toggle in edit modal
  const handleGroupToggle = (groupId) => {
    setEventForm(prev => {
      const newGroups = prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId];
      
      // Clear subgroups that don't belong to selected groups
      const availableSubgroups = groupsWithSubgroups
        .filter(g => newGroups.includes(g.id))
        .flatMap(g => g.subgroups);
      
      const newSubgroups = prev.subgroups.filter(sub => availableSubgroups.includes(sub));
      
      return {
        ...prev,
        groups: newGroups,
        subgroups: newSubgroups,
        player: '' // Reset player when groups change
      };
    });
  };

  // Handle subgroup toggle in edit modal
  const handleSubgroupToggle = (subgroup) => {
    setEventForm(prev => ({
      ...prev,
      subgroups: prev.subgroups.includes(subgroup)
        ? prev.subgroups.filter(id => id !== subgroup)
        : [...prev.subgroups, subgroup],
      player: '' // Reset player when subgroups change
    }));
  };

  // Get all available subgroups from selected groups
  const availableSubgroups = useMemo(() => {
    return groupsWithSubgroups
      .filter(g => eventForm.groups.includes(g.id))
      .flatMap(g => g.subgroups);
  }, [eventForm.groups, groupsWithSubgroups]);

  // Filter players by selected groups and subgroups
  const filteredPlayers = useMemo(() => {
    return eventForm.groups.length > 0 ? players.filter((p) => {
      const matchesGroup = eventForm.groups.includes(p.group);
      const matchesSubgroup = eventForm.subgroups.length === 0 || (p.subgroup && eventForm.subgroups.includes(p.subgroup));
      return matchesGroup && matchesSubgroup;
    }) : [];
  }, [eventForm.groups, eventForm.subgroups, players]);
  
  // Handle form submit (update training session)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate that at least one group is selected
      if (eventForm.groups.length === 0) {
        addToast('Please select at least one group for the training session.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validate date - prevent past dates
      const selectedDate = new Date(eventForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      
      if (selectedDate < today) {
        addToast('Cannot edit training sessions to past dates. Please select today or a future date.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validate time - if date is today, prevent past times
      if (selectedDate.getTime() === today.getTime()) {
        const currentTime = new Date();
        const selectedStartTime = new Date(`${eventForm.date}T${eventForm.startTime}`);
        
        if (selectedStartTime < currentTime) {
          addToast('Cannot edit training sessions with past times for today. Please select a future time.', 'error');
          setIsSubmitting(false);
          return;
        }
      }

      // Get group and subgroup names for display
      const getGroupName = (groupId) => {
        const group = groupsWithSubgroups.find(g => g.id === groupId);
        return group ? group.name : groupId;
      };

      const getSubgroupName = (subgroupId) => {
        return subgroupId;
      };

      const getPlayerName = (playerId) => {
        const player = players.find(p => p.id === playerId);
        return player ? player.name : playerId;
      };

      const updatedEvent = {
        ...selectedEvent,
        date: eventForm.date,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        assignedGroups: eventForm.groups,
        assignedSubgroups: eventForm.subgroups,
        playerId: eventForm.player,
        groupName: eventForm.groups.map(getGroupName).join(', '),
        subgroupName: eventForm.subgroups.length > 0 ? eventForm.subgroups.map(getSubgroupName).join(', ') : null,
        playerName: eventForm.player ? getPlayerName(eventForm.player) : null
      };

      // Update the event in localStorage
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id ? updatedEvent : event
      );
      
      setEvents(updatedEvents);
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      
      // Trigger storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'events',
        newValue: JSON.stringify(updatedEvents)
      }));
      
      addToast('Training session updated successfully!');
      resetForm();
    } catch (error) {
      addToast('Error updating event: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setEventForm({
      date: '',
      startTime: '10:00',
      endTime: '12:00',
      groups: [],
      subgroups: [],
      player: ''
    });
    setSelectedEvent(null);
    setShowEventModal(false);
  };
  
  // Handle edit event (only for coach-created training sessions)
  const handleEditEvent = (event) => {
    if (event.type !== 'training') {
      addToast('You can only edit training sessions', 'error');
      return;
    }
    
    // Check if the event was created by a coach
    if (event.createdBy !== 'coach') {
      addToast('You can only edit training sessions that you created', 'error');
      return;
    }
    
    // Check if the event date has passed
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      addToast('Cannot edit training sessions that have already passed', 'error');
      return;
    }
    
    setSelectedEvent(event);
    setEventForm({
      date: event.date || '',
      startTime: event.startTime || '10:00',
      endTime: event.endTime || '12:00',
      groups: event.assignedGroups || [],
      subgroups: event.assignedSubgroups || [],
      player: event.playerName || ''
    });
    setShowEventModal(true);
  };
  
  // Handle delete event (only for coach-created training sessions)
  const handleDeleteEvent = (event) => {
    if (event.type !== 'training') {
      addToast('You can only delete training sessions', 'error');
      return;
    }
    
    // Check if the event was created by a coach
    if (event.createdBy !== 'coach') {
      addToast('You can only delete training sessions that you created', 'error');
      return;
    }
    
    // Check if the event date has passed
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      addToast('Cannot delete training sessions that have already passed', 'error');
      return;
    }
    
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };
  
  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      try {
        // Remove the event from localStorage
        const updatedEvents = events.filter(event => event.id !== eventToDelete.id);
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
        
        // Trigger storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'events',
          newValue: JSON.stringify(updatedEvents)
        }));
        
        addToast('Training session deleted successfully!');
      } catch (error) {
        addToast('Error deleting training session: ' + error.message, 'error');
      } finally {
        setShowDeleteConfirm(false);
        setEventToDelete(null);
      }
    }
  };
  
  // Filter events based on selected groups and subgroups
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!event) return false;
      if (selectedGroups.length === 0 && selectedSubgroups.length === 0) return true;
      
      // Check for group matches - try multiple field names for compatibility
      const hasSelectedGroup = selectedGroups.some(selectedGroupId => {
        // Check assignedGroups array
        if (event.assignedGroups?.some(groupId => groupId === selectedGroupId)) {
          return true;
        }
        // Check groupId field (for coach-created events)
        if (event.groupId === selectedGroupId) {
          return true;
        }
        // Check groupName field (for coach-created events)
        const selectedGroup = groupsWithSubgroups.find(g => g.id === selectedGroupId);
        if (selectedGroup && event.groupName === selectedGroup.name) {
          return true;
        }
        return false;
      });
      
      // Check for subgroup matches - try multiple field names for compatibility
      const hasSelectedSubgroup = selectedSubgroups.some(selectedSubgroup => {
        // Check assignedSubgroups array
        if (event.assignedSubgroups?.some(subgroup => subgroup === selectedSubgroup)) {
          return true;
        }
        // Check subgroupId field (for coach-created events)
        if (event.subgroupId === selectedSubgroup) {
          return true;
        }
        // Check subgroupName field (for coach-created events)
        if (event.subgroupName === selectedSubgroup) {
          return true;
        }
        return false;
      });

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
  }, [events, selectedGroups, selectedSubgroups, groupsWithSubgroups]);
  
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
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedGroups([]);
    setSelectedSubgroups([]);
    setExpandedGroup(null);
    addToast('Filters cleared');
  };

  // Render event type badge
  const renderEventTypeBadge = (event) => {
    const typeColors = {
      training: event.createdBy === 'coach' ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]' : 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb]',
      match: 'bg-gradient-to-r from-[#4fb0ff] to-[#902bd1]',
      meeting: 'bg-gradient-to-r from-[#00d0cb] to-[#902bd1]'
    };
    
    return (
      <span className={`px-3 py-1.5 rounded-xl text-xs font-medium text-white ${typeColors[event.type] || 'bg-gray-700'}`}>
        {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
        {event.subType && ` - ${event.subType}`}
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
      className="min-h-screen bg-black text-white p-6 md:p-8 lg:p-10"
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
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Coach Agenda
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            View and manage training sessions and events
          </p>
        </motion.div>
        
        {/* Filter Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FiFilter className="text-[#4fb0ff]" />
              <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                Filter Events
              </span>
            </h2>
            
            {(selectedGroups.length > 0 || selectedSubgroups.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Groups Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-4">Groups</h3>
              <div className="flex flex-wrap gap-3">
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
                    className={`px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all border ${
                      selectedGroups.includes(group.id)
                        ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white border-transparent'
                        : 'bg-gray-800/65 text-gray-300 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
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
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-700/50 pt-6"
              >
                <h3 className="text-lg font-medium text-gray-300 mb-4">Subgroups</h3>
                <div className="flex flex-wrap gap-3">
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          selectedSubgroups.includes(subgroup)
                            ? 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white border-transparent'
                            : 'bg-gray-800/65 text-gray-300 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
                        }`}
                      >
                        {subgroup}
                      </motion.button>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Calendar Navigation */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(addMonths(currentDate, -1))}
              className="p-3 rounded-xl bg-gray-800/65 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors border border-gray-700/50"
            >
              <FiChevronLeft className="w-6 h-6" />
            </motion.button>
            
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentDate(new Date())}
                className="text-sm text-[#4fb0ff] hover:text-[#00d0cb] mt-2 px-4 py-2 bg-gray-800/65 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                Today
              </motion.button>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-3 rounded-xl bg-gray-800/65 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors border border-gray-700/50"
            >
              <FiChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>
        
        {/* Calendar Grid */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day} 
                className="text-center font-bold text-gray-400 py-3 text-sm"
              >
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.02, y: -2 }}
                className={`min-h-32 border border-gray-700/50 p-3 rounded-xl cursor-pointer transition-all ${
                  day.isCurrentMonth ? 'bg-gray-900/65' : 'bg-gray-900/40 text-gray-500'
                } ${
                  isToday(day.date) ? 'ring-2 ring-[#00d0cb] ring-inset bg-gray-800/50' : ''
                }`}
                onClick={() => handleDayClick(day.date)}
              >
                <div className={`text-right text-sm font-bold p-1 ${
                  isToday(day.date) ? 'text-[#00d0cb]' : 'text-white'
                }`}>
                  {format(day.date, 'd')}
                </div>
                
                <div className="space-y-2 mt-2">
                  {day.events.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-2 rounded-lg truncate flex items-center gap-2 ${
                        event.type === 'training' ? 
                          (event.createdBy === 'coach' ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white' : 'bg-gray-800/80 text-gray-300') :
                        event.type === 'match' ? 'bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] text-white' :
                        'bg-gradient-to-r from-[#00d0cb] to-[#902bd1] text-white'
                      }`}
                    >
                      <span className="truncate">{event.title}</span>
                      {event.type === 'training' && event.createdBy !== 'coach' && (
                        <span className="text-xs text-gray-400">(Admin)</span>
                      )}
                    </div>
                  ))}
                  {day.events.length > 2 && (
                    <div className="text-xs text-gray-400 text-center">
                      +{day.events.length - 2} more
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Toast Notifications */}
        <div className="fixed top-6 right-6 z-50 space-y-3">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className={`px-5 py-4 rounded-xl shadow-lg text-white font-medium border ${
                  toast.type === 'error' ? 'bg-red-500/20 border-red-500/50' : 'bg-green-500/20 border-green-500/50'
                } backdrop-blur-sm`}
              >
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Edit Event Modal (Time Only) */}
        <AnimatePresence>
          {showEventModal && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Edit Training Session
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-gray-300">
                      Location: {selectedEvent.location || 'Main Field'}
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={eventForm.date}
                        onChange={handleFormChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent outline-none transition shadow-sm"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Start Time *</label>
                        <input
                          type="time"
                          name="startTime"
                          value={eventForm.startTime}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent outline-none transition shadow-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">End Time *</label>
                        <input
                          type="time"
                          name="endTime"
                          value={eventForm.endTime}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent outline-none transition shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Groups Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Groups *</label>
                      <div className="border border-gray-700/50 rounded-xl p-4 bg-gray-800/40">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {groupsWithSubgroups.map((group) => (
                            <label
                              key={group.id}
                              className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={eventForm.groups.includes(group.id)}
                                onChange={() => handleGroupToggle(group.id)}
                                className="w-4 h-4 text-[#00d0cb] border-gray-600 rounded focus:ring-[#00d0cb] bg-gray-700"
                              />
                              <span className="text-sm font-medium text-white">{group.name}</span>
                            </label>
                          ))}
                        </div>
                        {eventForm.groups.length === 0 && (
                          <p className="text-sm text-gray-400 mt-3">Please select at least one group</p>
                        )}
                      </div>
                    </div>

                    {/* Subgroups Selection */}
                    {eventForm.groups.length > 0 && availableSubgroups.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Subgroups (Optional)</label>
                        <div className="border border-gray-700/50 rounded-xl p-4 bg-gray-800/40">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableSubgroups.map((subgroup) => (
                              <label
                                key={subgroup}
                                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={eventForm.subgroups.includes(subgroup)}
                                  onChange={() => handleSubgroupToggle(subgroup)}
                                  className="w-4 h-4 text-[#902bd1] border-gray-600 rounded focus:ring-[#902bd1] bg-gray-700"
                                />
                                <span className="text-sm font-medium text-white">{subgroup}</span>
                              </label>
                            ))}
                          </div>
                          <p className="text-sm text-gray-400 mt-3">Select specific subgroups or leave empty for all subgroups</p>
                        </div>
                      </div>
                    )}

                    {/* Player Selection */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Player (Optional)</label>
                      <select
                        name="player"
                        value={eventForm.player}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                        disabled={eventForm.groups.length === 0}
                      >
                        <option value="">Select player (optional)</option>
                        {filteredPlayers.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {eventForm.groups.length > 0 && filteredPlayers.length === 0 && (
                        <p className="text-sm text-gray-400 mt-2">No players found for the selected groups and subgroups</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3.5 text-white bg-gray-800/65 hover:bg-gray-800 rounded-xl transition-colors font-medium border border-gray-700/50"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl font-medium ${
                          isSubmitting 
                            ? 'opacity-70 cursor-not-allowed' 
                            : 'hover:from-[#00d0cb] hover:to-[#4fb0ff] transition-all'
                        }`}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Training'}
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDayEventsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] p-3 rounded-xl">
                        <FiCalendar className="text-white text-2xl" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowDayEventsModal(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {calendarDays
                      .find(d => d.date.getTime() === selectedDay.getTime())
                      ?.events?.map(event => (
                        <motion.div 
                          key={event.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-700/50 rounded-2xl overflow-hidden bg-gray-800/40 backdrop-blur-sm hover:border-gray-600 transition-colors"
                        >
                          <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                  <h3 className="text-xl font-bold text-white">
                                    {event.title}
                                  </h3>
                                  {renderEventTypeBadge(event)}
                                </div>
                                
                                <div className="flex flex-wrap gap-6 text-sm text-gray-300 mb-4">
                                  <div className="flex items-center gap-3">
                                    <FiClock className="text-[#4fb0ff] flex-shrink-0" />
                                    <span>{event.startTime} - {event.endTime}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <FiMapPin className="text-[#00d0cb] flex-shrink-0" />
                                    <span>{event.location || 'Main Field'}</span>
                                  </div>
                                  {event.players && (
                                    <div className="flex items-center gap-3">
                                      <FiUsers className="text-[#902bd1] flex-shrink-0" />
                                      <span>{event.players} players</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {event.type === 'training' && event.createdBy === 'coach' && (
                                  <>
                                    {(() => {
                                      const eventDate = new Date(event.date);
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      const isPastEvent = eventDate < today;
                                      
                                      return (
                                        <>
                                          {!isPastEvent && (
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={() => {
                                                handleEditEvent(event);
                                                setShowDayEventsModal(false);
                                              }}
                                              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-700 transition-colors"
                                              title="Edit training time"
                                            >
                                              <FiEdit size={20} />
                                            </motion.button>
                                          )}
                                          {!isPastEvent && (
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={() => {
                                                handleDeleteEvent(event);
                                                setShowDayEventsModal(false);
                                              }}
                                              className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-900/30 transition-colors"
                                              title="Delete training"
                                            >
                                              <FiTrash2 size={20} />
                                            </motion.button>
                                          )}
                                          {isPastEvent && (
                                            <div className="text-xs text-gray-400 bg-gray-800/65 px-3 py-2 rounded-xl border border-gray-700/50">
                                              Completed
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </>
                                )}
                                
                                {event.type === 'training' && event.createdBy !== 'coach' && (
                                  <div className="text-xs text-gray-400 bg-gray-800/65 px-3 py-2 rounded-xl border border-gray-700/50">
                                    Admin Event
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-6 flex flex-wrap gap-3">
                              {/* Display Groups */}
                              {event.assignedGroups?.map(groupId => {
                                const group = groupsWithSubgroups.find(g => g.id === groupId);
                                return group ? (
                                  <span 
                                    key={groupId} 
                                    className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-3 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white"
                                  >
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                    {group.name}
                                  </span>
                                ) : null;
                              })}
                              
                              {/* Display Subgroups */}
                              {event.assignedSubgroups?.map(subgroupId => {
                                const subgroupName = event.subgroupName || subgroupId;
                                return (
                                  <span 
                                    key={subgroupId} 
                                    className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-3 bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white"
                                  >
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                    {subgroupName}
                                  </span>
                                );
                              })}
                              
                              {/* Display Player if specified */}
                              {event.playerName && (
                                <span 
                                  className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-3 bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] text-white"
                                >
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                  {event.playerName}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    }
                    
                    {calendarDays.find(d => d.date.getTime() === selectedDay.getTime())?.events?.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-700/50 rounded-2xl bg-gray-800/20"
                      >
                        <FiCalendar className="mx-auto text-4xl text-gray-600 mb-4" />
                        <p className="text-xl text-white">No events scheduled for this day</p>
                        <p className="text-gray-500 mt-2">Select a day with scheduled events</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && eventToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-md"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-3 rounded-xl">
                      <FiTrash2 className="text-white text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Delete Training Session
                    </h2>
                  </div>
                  
                  <p className="text-gray-300 mb-8">
                    Are you sure you want to delete the training session "<strong className="text-white">{eventToDelete.title}</strong>"?
                    This action cannot be undone.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setEventToDelete(null);
                      }}
                      className="px-6 py-3.5 text-white bg-gray-800/65 hover:bg-gray-800 rounded-xl transition-colors font-medium border border-gray-700/50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmDelete}
                      className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-600 text-white rounded-xl transition-colors font-medium"
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

export default CoachAgenda;