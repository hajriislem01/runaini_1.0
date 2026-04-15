import { useState, useEffect, useMemo } from 'react';
import { format, isSameMonth, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';
import API from '../../../api';
import { eventTypes } from '../utils/agendaConstants';

export const useAgendaData = () => {
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
        group: eventForm.assignedGroups[0],
        subgroup: eventForm.assignedSubgroups[0] || null,
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
      console.error('Error saving event:', error.response?.data);
      toast.error('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
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

  return {
    events, setEvents, groupsWithSubgroups, coaches, isLoading,
    showEventModal, setShowEventModal, selectedEvent, setSelectedEvent,
    currentDate, setCurrentDate, selectedGroups, setSelectedGroups,
    selectedSubgroups, setSelectedSubgroups, selectedDay, setSelectedDay,
    showDayEventsModal, setShowDayEventsModal, expandedGroup, setExpandedGroup,
    showDeleteConfirm, setShowDeleteConfirm, eventToDelete, setEventToDelete,
    isSubmitting, eventForm, setEventForm,
    handleFormChange, handleGroupToggle, handleSubgroupToggle, resetForm,
    handleSubmit, handleEditEvent, handleConfirmDelete, handleDayClick, createEventForDay,
    filteredEvents, stats, calendarDays
  };
};
