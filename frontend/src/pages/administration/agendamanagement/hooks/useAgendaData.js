import { useState, useEffect, useMemo } from 'react';
import { format, isSameMonth, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';
import API from '../../../api';
import { eventTypes } from '../utils/agendaConstants';

// Pure normalizer — no hook dependencies, safe at module scope
const normalizeTraining = (t) => ({
  id: `training_${t.id}`,
  _id: t.id,
  _isTraining: true,
  title: t.title,
  type: 'Training',
  date: `${t.date}T${t.start_time}`,
  end_time: t.end_time,
  location: t.location || '',
  group: t.groups_detail?.[0]?.id || null,
  group_name: t.groups_detail?.map(g => g.name).join(', ') || '—',
  coach_name: t.coach_name || '',
  category: t.category || 'technical',
  level: t.level || 'B',
  duration_minutes: t.duration_minutes,
  participants_count: t.participants_count,
  exercise_count: t.exercise_count,
  recurrence: t.recurrence,
});

export const useAgendaData = () => {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [players, setPlayers] = useState([]);
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

  // Detail view states
  const [detailSession, setDetailSession] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'meeting',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:00',
    location: '',
    description: '',
    assignedGroups: [],
    assignedSubgroups: [],
    targetCoaches: [],
    targetPlayers: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsRes, groupsRes, coachesRes, playersRes, trainingsRes] = await Promise.all([
          API.get('events/'),
          API.get('groups/'),
          API.get('coaches/'),
          API.get('players/'),
          API.get('trainings/'),
        ]);
        const normalizedTrainings = (trainingsRes.data || []).map(normalizeTraining);
        setEvents([...eventsRes.data, ...normalizedTrainings]);
        setGroups(groupsRes.data);
        setCoaches(coachesRes.data);
        setPlayers(playersRes.data);
      } catch (error) {
        toast.error('Failed to load agenda data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
  };

  const handleGroupToggle = (groupId) => {
    setEventForm(prev => {
      const isSelected = prev.assignedGroups.includes(groupId);
      return {
        ...prev,
        assignedGroups: isSelected
          ? prev.assignedGroups.filter(id => id !== groupId)
          : [...prev.assignedGroups, groupId],
        // Remove subgroups if parent group is deselected
        assignedSubgroups: isSelected
          ? prev.assignedSubgroups.filter(subId => {
            const sub = groupsWithSubgroups.find(g => g.id === groupId)?.subgroups.find(s => s.id === subId);
            return !sub;
          })
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

  const handleCoachToggle = (coachId) => {
    setEventForm(prev => ({
      ...prev,
      targetCoaches: prev.targetCoaches.includes(coachId)
        ? prev.targetCoaches.filter(id => id !== coachId)
        : [...prev.targetCoaches, coachId]
    }));
  };

  const handlePlayerToggle = (playerId) => {
    setEventForm(prev => ({
      ...prev,
      targetPlayers: prev.targetPlayers.includes(playerId)
        ? prev.targetPlayers.filter(id => id !== playerId)
        : [...prev.targetPlayers, playerId]
    }));
  };

  const validateEventForm = () => {
    if (!eventForm.title?.trim()) { toast.error('Please enter an event title'); return false; }
    if (!eventForm.date) { toast.error('Please select a date'); return false; }
    if (!eventForm.startTime) { toast.error('Please select a start time'); return false; }
    if (!eventForm.endTime) { toast.error('Please select an end time'); return false; }

    const audienceSelected =
      eventForm.assignedGroups.length > 0 ||
      eventForm.assignedSubgroups.length > 0 ||
      eventForm.targetCoaches.length > 0 ||
      eventForm.targetPlayers.length > 0;

    if (!audienceSelected) {
      toast.error('Please select at least one target audience (Group, Coach, or Player)');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      type: 'meeting',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '11:00',
      location: '',
      description: '',
      assignedGroups: [],
      assignedSubgroups: [],
      targetCoaches: [],
      targetPlayers: [],
    });
    setSelectedEvent(null);
    setShowEventModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEventForm()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        title: eventForm.title,
        type: eventForm.type === 'match' ? 'Match Friendly' :
          eventForm.type === 'tournament' ? 'Tournament' :
            eventForm.type === 'meeting' ? 'Meeting' : 'Meeting',
        date: `${eventForm.date}T${eventForm.startTime}:00Z`,
        location: eventForm.location || '',
        description: eventForm.description || '',
        groups: (eventForm.assignedGroups || []).filter(id => !!id),
        subgroups: (eventForm.assignedSubgroups || []).filter(id => !!id),
        target_coaches: (eventForm.targetCoaches || []).filter(id => !!id),
        target_players: (eventForm.targetPlayers || []).filter(id => !!id),
        status: 'open'
      };

      let response;
      if (selectedEvent) {
        response = await API.put(`events/${selectedEvent.id}/`, payload);
        setEvents(prev => prev.map(evt => evt.id === selectedEvent.id ? response.data : evt));
        toast.success('Event updated successfully!');
      } else {
        response = await API.post('events/', payload);
        setEvents(prev => [...prev, response.data]);
        toast.success('Event created successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error.response?.data || error);
      if (error.response?.data) {
        const errorDetails = JSON.stringify(error.response.data);
        toast.error(`Failed to save event: ${errorDetails}`);
      } else {
        toast.error('Failed to save event');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event) => {
    const eventDate = new Date(event.date);
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      type: event.type === 'Tournament' ? 'match' : 'meeting', // Simplified
      date: format(eventDate, 'yyyy-MM-dd'),
      startTime: format(eventDate, 'HH:mm'),
      endTime: format(eventDate, 'HH:mm'), // Should be handled by backend if stored
      location: event.location || '',
      description: event.description || '',
      assignedGroups: event.groups || [],
      assignedSubgroups: event.subgroups || [],
      targetCoaches: event.target_coaches || [],
      targetPlayers: event.target_players || [],
    });
    setShowEventModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    // Training sessions are coach-owned and read-only for admin
    if (eventToDelete._isTraining) {
      toast.error('Coach training sessions cannot be deleted from the admin agenda.');
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      return;
    }
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

  const filteredEvents = useMemo(() => {
    if (selectedGroups.length === 0 && selectedSubgroups.length === 0) return events;
    return events.filter(event => {
      const eventGroups = event._isTraining ? (event.group ? [event.group] : []) : (event.groups || []);
      const eventSubgroups = event._isTraining ? (event.subgroup ? [event.subgroup] : []) : (event.subgroups || []);

      const matchGroup = selectedGroups.length === 0 || eventGroups.some(g => selectedGroups.includes(g));
      const matchSubgroup = selectedSubgroups.length === 0 || eventSubgroups.some(s => selectedSubgroups.includes(s));

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

  const handleOpenDetail = async (session) => {
    setDetailSession(session);
    setIsDetailLoading(true);
    try {
      let response;
      if (session._isTraining) {
        const id = String(session.id).startsWith('training_') ? session.id.split('_')[1] : session.id;
        response = await API.get(`trainings/${id}/`);
      } else {
        response = await API.get(`events/${session.id}/`);
      }
      if (response.data) {
        setDetailSession({ ...session, ...response.data });
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Failed to load session details.');
    } finally {
      setIsDetailLoading(false);
    }
  };

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

  return {
    events, setEvents, groupsWithSubgroups, coaches, players, isLoading,
    showEventModal, setShowEventModal, selectedEvent, setSelectedEvent,
    currentDate, setCurrentDate, selectedGroups, setSelectedGroups,
    selectedSubgroups, setSelectedSubgroups, selectedDay, setSelectedDay,
    showDayEventsModal, setShowDayEventsModal, expandedGroup, setExpandedGroup,
    showDeleteConfirm, setShowDeleteConfirm, eventToDelete, setEventToDelete,
    isSubmitting, eventForm, setEventForm,
    handleFormChange, handleGroupToggle, handleSubgroupToggle,
    handleCoachToggle, handlePlayerToggle, resetForm,
    handleSubmit, handleEditEvent, handleConfirmDelete, handleDayClick, createEventForDay,
    filteredEvents, stats, calendarDays,
    // Detail view
    detailSession, setDetailSession, isDetailLoading, handleOpenDetail
  };
};
