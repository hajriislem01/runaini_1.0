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
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    club: '',
    role: 'coach',
    assignments: [], // Array of objects: { group_id, full_access, subgroups: [] }
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
      if (error.response && error.response.status >= 400) {
        toast.error('Failed to fetch platform data');
      }
      console.error("Fetch Error:", error);
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

  const filteredSubgroups = (subgroups || []).filter(
    sub => String(sub.group) === String(formData?.group)
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

    setApiError(null);
    setIsLoading(true);
    try {
      if (editCoachId) {
        const payload = { ...formData };
        if (!payload.password || payload.password.trim() === '') {
          delete payload.password;
        }
        
        console.log("📤 Final Payload sent to PATCH:", payload);
        const response = await API.patch(`coaches/${editCoachId}/`, payload);
        
        if (response.status === 200 || response.status === 204) {
          setCoaches(prev => prev.map(c => c.id === editCoachId ? response.data : c));
          toast.success('Coach updated successfully');
          resetForm();
          setShowModal(false);
        }
      } else {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          club: formData.club,
          specialization: formData.specialization,
          years_of_experience: formData.years_of_experience || 0,
          certification: formData.certification,
          assignments: formData.assignments,
        };
        const response = await API.post('signup/coach/', payload);
        
        if (response.status === 201 || response.status === 200) {
          toast.success('Coach created successfully');
          await fetchAll();
          resetForm();
          setShowModal(false);
        }
      }
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to save coach';
      
      if (data) {
        if (typeof data === 'object') {
          // Flatten multi-field errors for the global form alert
          msg = Object.entries(data)
            .map(([field, errors]) => {
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
              const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
              return `${fieldName}: ${errorText}`;
            })
            .join(' | ');
        } else if (typeof data === 'string') {
          msg = data;
        }
      }
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (coach) => {
    const firstGroup = coach.groups?.[0] ?? null;
    const firstSubgroup = coach.subgroups?.[0] ?? null;
    setFormData({
      first_name: coach.first_name || '',
      last_name: coach.last_name || '',
      username: coach.username || '',
      email: coach.email || '',
      password: '',
      phone: coach.phone || '',
      club: coach.club || '',
      role: 'coach',
      assignments: (coach.groups || []).map(g => ({
        group_id:    g.id,
        full_access: g.full_access || false,
        subgroups:   (coach.subgroups || []).filter(s => s.group === g.id).map(s => s.id)
      })),
      specialization: coach.coach_profile?.specialization || '',
      years_of_experience: coach.coach_profile?.years_of_experience || '',
      certification: coach.coach_profile?.certification || '',
    });
    setApiError(null);
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
      first_name: '', last_name: '', username: '', email: '', password: '', phone: '', club: '',
      role: 'coach', assignments: [],
      specialization: '', years_of_experience: '', certification: '',
    });
    setApiError(null);
    setPasswordStrength(0);
    setEditCoachId(null);
    setShowPassword(false);
  };

  const filteredCoaches = coaches.filter(coach => {
    const term = searchTerm.toLowerCase();
    return (
      coach.username?.toLowerCase().includes(term) ||
      coach.first_name?.toLowerCase().includes(term) ||
      coach.last_name?.toLowerCase().includes(term) ||
      coach.email?.toLowerCase().includes(term) ||
      coach.club?.toLowerCase().includes(term)
    );
  });

  return {
    coaches, isLoading, showModal, setShowModal, searchTerm, setSearchTerm,
    showPassword, setShowPassword, passwordStrength, editCoachId,
    groups, subgroups, formData, setFormData,
    apiError,
    handleChange, handlePasswordChange, handleSubmit, handleEdit, handleDelete,
    resetForm, filteredCoaches
  };
};
