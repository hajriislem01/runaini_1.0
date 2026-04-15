import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../../api';
import { calculatePasswordStrength } from '../utils/coachHelpers';

export const useCoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [editCoachId, setEditCoachId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    club: '',
    role: 'coach',
    group: '',
    subgroup: '',
    specialization: '',
    years_of_experience: '',
    certification: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [coachesRes, groupsRes, subgroupsRes] = await Promise.all([
        API.get('coaches/'),
        API.get('groups/'),
        API.get('subgroups/')
      ]);
      setCoaches(coachesRes.data);
      setGroups(groupsRes.data);
      setSubgroups(subgroupsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const filteredSubgroups = subgroups.filter(
    sub => String(sub.group) === String(formData.group)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || (!editCoachId && !formData.password)) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!editCoachId && passwordStrength < 3) {
      toast.error('Password is too weak');
      return;
    }

    setIsLoading(true);
    try {
      if (editCoachId) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const response = await API.put(`coaches/${editCoachId}/`, payload);
        setCoaches(prev => prev.map(c => c.id === editCoachId ? response.data : c));
        toast.success('Coach updated successfully');
      } else {
        const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          club: formData.club,
          specialization: formData.specialization,
          years_of_experience: formData.years_of_experience || 0,
          certification: formData.certification,
        };
        await API.post('signup/coach/', payload);
        toast.success('Coach created successfully');
        await fetchAll();
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data
        ? JSON.stringify(err.response.data)
        : 'Failed to save coach';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (coach) => {
    const firstGroup = coach.groups?.[0] ?? null;
    setFormData({
      username: coach.username || '',
      email: coach.email || '',
      password: '',
      phone: coach.phone || '',
      club: coach.club || '',
      role: 'coach',
      group: firstGroup ? String(firstGroup.id) : '',
      subgroup: '',
      specialization: coach.coach_profile?.specialization || '',
      years_of_experience: coach.coach_profile?.years_of_experience || '',
      certification: coach.coach_profile?.certification || '',
    });
    setEditCoachId(coach.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coach?')) return;
    try {
      await API.delete(`coaches/${id}/`);
      setCoaches(prev => prev.filter(c => c.id !== id));
      toast.success('Coach deleted');
    } catch (err) {
      toast.error('Failed to delete coach');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '', email: '', password: '', phone: '', club: '',
      role: 'coach', group: '', subgroup: '',
      specialization: '', years_of_experience: '', certification: '',
    });
    setPasswordStrength(0);
    setEditCoachId(null);
    setShowPassword(false);
  };

  const filteredCoaches = coaches.filter(coach => {
    const term = searchTerm.toLowerCase();
    return (
      coach.username?.toLowerCase().includes(term) ||
      coach.email?.toLowerCase().includes(term) ||
      coach.club?.toLowerCase().includes(term)
    );
  });

  return {
    coaches, isLoading, showModal, setShowModal, searchTerm, setSearchTerm,
    showPassword, setShowPassword, passwordStrength, editCoachId,
    groups, subgroups, formData, setFormData, filteredSubgroups,
    handleChange, handlePasswordChange, handleSubmit, handleEdit, handleDelete,
    resetForm, filteredCoaches
  };
};
