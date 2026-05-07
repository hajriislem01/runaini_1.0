import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../../api';

export const useCreateEvent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matchFriendly');
  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    eventName: '', group: '', subgroup: '', date: '', time: '',
    location: '', numParticipants: '', targetAcademy: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        const response = await API.get('groups/');
        setGroups(response.data);
      } catch (error) {
        toast.error('Failed to load groups');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchSubgroups = async () => {
      if (!formData.group) {
        setSubgroups([]);
        return;
      }
      try {
        const response = await API.get(`subgroups/?group=${formData.group}`);
        setSubgroups(response.data);
      } catch (error) {
        setSubgroups([]);
      }
    };
    fetchSubgroups();
    setFormData(prev => ({ ...prev, subgroup: '' }));
  }, [formData.group]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventName.trim()) newErrors.eventName = 'Event Name is required';
    if (!formData.group) newErrors.group = 'Group is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (activeTab === 'tournament' && (!formData.numParticipants || formData.numParticipants < 2)) {
      newErrors.numParticipants = 'Number of participants must be at least 2';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.eventName,
        type: activeTab === 'matchFriendly' ? 'Match Friendly' : 'Tournament',
        groups: formData.group ? [formData.group] : [],
        subgroups: formData.subgroup ? [formData.subgroup] : [],
        date: `${formData.date}T${formData.time}:00Z`,
        location: formData.location,
        target_academy: formData.targetAcademy || null,
        description: '',
        status: 'open'
      };

      await API.post('events/', payload);
      toast.success('Event created successfully!');
      setTimeout(() => navigate('/administration/events-management'), 1000);
    } catch (error) {
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    navigate, activeTab, setActiveTab, groups, subgroups, isLoading, isSubmitting,
    formData, errors, handleChange, handleSubmit
  };
};
