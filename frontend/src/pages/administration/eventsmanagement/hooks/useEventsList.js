import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../../api';

export const useEventsList = () => {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '', type: '', location: '', group: '', date: '', status: ''
  });

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
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...events];
    if (filters.searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    if (filters.type) filtered = filtered.filter(event => event.type === filters.type);
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.group) filtered = filtered.filter(event => String(event.group) === String(filters.group));
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }
    if (filters.status) filtered = filtered.filter(event => event.status === filters.status);

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredEvents(filtered);
  }, [events, filters]);

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

  const stats = {
    total: filteredEvents.length,
    upcoming: filteredEvents.filter(e => new Date(e.date) > new Date() && e.status !== 'completed').length,
    completed: filteredEvents.filter(e => e.status === 'completed').length,
    tournaments: filteredEvents.filter(e => e.type === 'Tournament').length
  };

  return {
    events, groups, isLoading, filteredEvents, showFilters, setShowFilters,
    filters, handleFilterChange, clearFilters, stats, handleDelete, handleComplete
  };
};
