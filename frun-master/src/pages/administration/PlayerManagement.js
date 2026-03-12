import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEye, FiEyeOff, FiX, FiEdit, FiTrash2, FiUser, FiCheck, FiUsers, FiChevronRight, FiUserPlus, FiMail, FiPhone, FiMapPin, FiCalendar, FiXCircle, FiLayers, FiInfo, FiUserMinus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import API from './api';
import axios from 'axios';

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [activeTab, setActiveTab] = useState('players'); // 'players' or 'groups'
  const [showModal, setShowModal] = useState(false);
  const [showGroupDetailModal, setShowGroupDetailModal] = useState(false);
  const [viewingGroup, setViewingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [editPlayerId, setEditPlayerId] = useState(null);
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupForm, setGroupForm] = useState({
    id: '',
    name: '',
    subgroups: [''],
    coach: ''
  });
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedSubgroup, setExpandedSubgroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');
  const [loading, setLoading] = useState(true);

  // Form state adapted to your backend model
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    status: 'Active',
    group: '',
    subgroup: '',
    height: '',
    weight: '',
    address: '',
    notes: ''
  });

  // API configuration
  // localStorage.setItem('authToken', '3813b5a28edda9181637e2931875742154d4cf8e');
  const API_URL = 'http://localhost:8000/api'; // Change to your Django server URL
  const authToken = localStorage.getItem('token'); // Assuming you use token auth

  // Fetch players from API
  const fetchPlayers = async () => {
    try {
      const response = await axios.get(`${API_URL}/players/`, {
  headers: { 'Authorization': `Token ${authToken}` }
});
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
      addNotification('Failed to fetch players', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups from API (if you have a groups endpoint)
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups/`, {
        headers: {
          'Authorization': `Token ${authToken}`
        }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      addNotification('Failed to fetch groups', 'error');
    }
  };

  // Fetch coaches from API
  const fetchCoaches = async () => {
    try {
      const response = await axios.get(`${API_URL}/coaches/`, {
        headers: {
          'Authorization': `Token ${authToken}`
        }
      });
      setCoaches(response.data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      addNotification('Failed to fetch coaches', 'error');
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchGroups();
    fetchCoaches();
  }, []);

  // Add notification
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!editPlayerId && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (formData.height && (formData.height < 100 || formData.height > 250)) {
      newErrors.height = 'Height must be between 100-250 cm';
    }

    if (formData.weight && (formData.weight < 30 || formData.weight > 200)) {
      newErrors.weight = 'Weight must be between 30-200 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // When group changes, clear subgroup (subgroups are group-specific)
  const handleGroupChangeInForm = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, group: value, subgroup: '' }));
  };

  // Groups + subgroups for player form (from groups state + existing players)
  const groupOptionsForPlayer = [...new Set([
    ...groups.map(g => g.name),
    ...players.map(p => {
      // Extract group name from object or use string directly
      const playerGroup = typeof p.group === 'object' && p.group !== null ? p.group.name : p.group;
      return playerGroup;
    }).filter(Boolean)
  ])].filter(Boolean).sort();

  const getSubgroupsForSelectedGroup = () => {
    if (!formData.group) return [];
    const g = groups.find(gr => gr.name === formData.group);
    if (g && g.subgroups && g.subgroups.filter(Boolean).length > 0) {
      // Extract names from subgroup objects
      return g.subgroups
        .filter(Boolean)
        .map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg)
        .filter(Boolean);
    }
    // Fallback: get from players (handle both string and object formats)
    return [...new Set(players
      .filter(p => {
        const playerGroup = typeof p.group === 'object' ? p.group?.name : p.group;
        return playerGroup === formData.group;
      })
      .map(p => {
        const playerSubgroup = typeof p.subgroup === 'object' ? p.subgroup?.name : p.subgroup;
        return playerSubgroup;
      })
      .filter(Boolean))];
  };
  const baseSubgroupOptions = getSubgroupsForSelectedGroup();
  const subgroupOptionsForPlayer = formData.subgroup && !baseSubgroupOptions.includes(formData.subgroup)
    ? [...baseSubgroupOptions, formData.subgroup]
    : baseSubgroupOptions;

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert group name to ID if provided
    let groupId = null;
    if (formData.group) {
      const selectedGroupObj = groups.find(g => g.name === formData.group);
      if (selectedGroupObj) {
        groupId = selectedGroupObj.id;
      } else {
        addNotification('Selected group not found', 'error');
        return;
      }
    }

    // Convert subgroup name to ID if provided
    let subgroupId = null;
    if (formData.subgroup && groupId) {
      const selectedGroupObj = groups.find(g => g.id === groupId);
      if (selectedGroupObj && selectedGroupObj.subgroups) {
        const subgroupObj = selectedGroupObj.subgroups.find(
          sg => (typeof sg === 'object' && sg !== null ? sg.name : sg) === formData.subgroup
        );
        if (subgroupObj) {
          subgroupId = typeof subgroupObj === 'object' ? subgroupObj.id : subgroupObj;
        }
      }
    }

    // Backend expects numeric height/weight (FloatField); send 0 when empty
    const payload = {
      ...formData,
      group: groupId || formData.group || null,
      subgroup: subgroupId || formData.subgroup || null,
      height: formData.height === '' || formData.height == null ? 0 : Number(formData.height),
      weight: formData.weight === '' || formData.weight == null ? 0 : Number(formData.weight)
    };

    try {
      let response;
      if (editPlayerId) {
        response = await API.put(`players/${editPlayerId}/`, payload);
        setPlayers(players.map(p => p.id === editPlayerId ? response.data : p));
        addNotification('Player updated successfully');
      } else {
        console.log('Sending to:', 'players/signup/');
        console.log('Payload:', payload);

        response = await API.post('players/signup/', payload);
        console.log('Signup response:', response.data);

        setPlayers([...players, response.data]);
        addNotification('Player added successfully');
      }

      setShowModal(false);
      resetForm();
      // Reload players and groups to get updated data
      await fetchPlayers();
      await fetchGroups();
    } catch (error) {
      console.error('Error saving player:', error);
      const data = error.response?.data;
      const errMsg = (data && (data.error || data.detail || (typeof data === 'string' ? data : null))) || error.message || 'Failed to save player';
      addNotification(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg), 'error');
    }
  };

  // Handle player edit
  const handleEdit = (player) => {
    setEditPlayerId(player.id);
    
    // Extract group and subgroup names (handle both object and string formats)
    const playerGroup = typeof player.group === 'object' && player.group !== null 
      ? player.group.name || player.group.id 
      : player.group || '';
    const playerSubgroup = typeof player.subgroup === 'object' && player.subgroup !== null 
      ? player.subgroup.name || player.subgroup.id 
      : player.subgroup || '';
    
    setFormData({
      username : player.username || player.user?.username || '', 
      full_name: player.full_name,
      email: player.user?.email || player.email || '', // Assuming your API returns user data nested
      password: '', // Don't populate password
      phone: player.phone || '',
      position: player.position || '',
      status: player.status || 'Active',
      group: playerGroup,
      subgroup: playerSubgroup,
      height: player.height || '',
      weight: player.weight || '',
      address: player.address || '',
      notes: player.notes || ''
    });
    setShowModal(true);
  };

  // Handle player deletion
  const handleDelete = async (id) => {
    try {
      const playerName = players.find(p => p.id === id)?.full_name || 'Player';

      if (window.confirm(`Are you sure you want to delete ${playerName}?`)) {
        await axios.delete(`${API_URL}/players/${id}/`, {
          headers: {
            'Authorization': `Token ${authToken}`
          }
        });
        setPlayers(players.filter(player => player.id !== id));
        addNotification(`${playerName} deleted successfully`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      addNotification('Failed to delete player', 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username : "" ,
      full_name: '',
      email: '',
      password: '',
      phone: '',
      position: '',
      status: 'Active',
      group: '',
      subgroup: '',
      height: '',
      weight: '',
      address: '',
      notes: ''
    });
    setPasswordStrength(0);
    setEditPlayerId(null);
    setShowPassword(false);
    setErrors({});
  };

  // Group form helpers
  // Reset le formulaire de groupe
const resetGroupForm = () => {
  setGroupForm({ id: '', name: '', subgroups: [''], coach: '' });
  setIsEditingGroup(false);
};

  // Add subgroup field
  const addSubgroup = () => {
    setGroupForm(prev => ({
      ...prev,
      subgroups: [...prev.subgroups, '']
    }));
  };

  // Remove subgroup field
  const removeSubgroup = (index) => {
    setGroupForm(prev => ({
      ...prev,
      subgroups: prev.subgroups.filter((_, i) => i !== index)
    }));
  };

  // Handle subgroup input change
  const handleSubgroupChange = (index, value) => {
    setGroupForm(prev => ({
      ...prev,
      subgroups: prev.subgroups.map((sg, i) => i === index ? value : sg)
    }));
  };

  // Helper function to get coach profile ID from coach user ID
  const getCoachProfileId = async (coachUserId) => {
    if (!coachUserId) return null;
    
    try {
      // First try to get from coaches list if available
      const coach = coaches.find(c => c.id === parseInt(coachUserId));
      if (coach && coach.coach_profile && coach.coach_profile.id) {
        return coach.coach_profile.id;
      }
      
      // If not in list, fetch from API (now includes coach_profile in response)
      const coachResponse = await axios.get(`${API_URL}/coaches/${coachUserId}/`, {
        headers: { 'Authorization': `Token ${authToken}` }
      });
      
      // The coach_profile is now included in the response
      if (coachResponse.data.coach_profile && coachResponse.data.coach_profile.id) {
        return coachResponse.data.coach_profile.id;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching coach profile:', err);
      return null;
    }
  };

  const handleGroupSubmit = async (e) => {
  e.preventDefault();
  const name = groupForm.name.trim();
  const subgroups = groupForm.subgroups.map(s => s.trim()).filter(Boolean);
  const coachId = groupForm.coach || null;

  if (!name) {
    addNotification('Group name is required', 'error');
    return;
  }

  try {
    // Get coach profile ID from coach user ID
    const coachProfileId = await getCoachProfileId(coachId);

    let groupResponse;
    if (isEditingGroup && groupForm.id && !String(groupForm.id).startsWith('local-')) {
      // Update group
      groupResponse = await axios.put(`${API_URL}/groups/${groupForm.id}/`, { 
        name,
        coach: coachProfileId 
      }, { headers: { 'Authorization': `Token ${authToken}` } });
      
      // Get existing subgroups for this group
      const existingSubgroupsResponse = await axios.get(`${API_URL}/subgroups/`, {
        headers: { 'Authorization': `Token ${authToken}` },
        params: { group: groupForm.id }
      });
      const existingSubgroups = existingSubgroupsResponse.data || [];
      
      // Delete subgroups that are no longer in the form
      for (const existingSubgroup of existingSubgroups) {
        if (!subgroups.includes(existingSubgroup.name)) {
          await axios.delete(`${API_URL}/subgroups/${existingSubgroup.id}/`, {
            headers: { 'Authorization': `Token ${authToken}` }
          });
        }
      }
      
      // Create or update subgroups
      for (const subgroupName of subgroups) {
        const existingSubgroup = existingSubgroups.find(sg => sg.name === subgroupName);
        if (!existingSubgroup) {
          // Create new subgroup
          await axios.post(`${API_URL}/subgroups/`, {
            name: subgroupName,
            group: groupForm.id
          }, {
            headers: { 'Authorization': `Token ${authToken}` }
          });
        }
      }
    } else {
      // Create new group
      groupResponse = await axios.post(`${API_URL}/groups/`, { 
        name,
        coach: coachProfileId 
      }, { headers: { 'Authorization': `Token ${authToken}` } });
      
      // Create subgroups for the new group
      for (const subgroupName of subgroups) {
        await axios.post(`${API_URL}/subgroups/`, {
          name: subgroupName,
          group: groupResponse.data.id
        }, {
          headers: { 'Authorization': `Token ${authToken}` }
        });
      }
    }
    
    // Reload groups to get updated data with subgroups
    await fetchGroups();
    
    addNotification(isEditingGroup ? 'Group updated' : 'Group created');
  } catch (error) {
    console.error('Error saving group:', error);
    const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to save group';
    addNotification(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
  }

  setShowGroupModal(false);
  resetGroupForm();
};


  const handleEditGroup = (group) => {
    // Extract subgroup names from the group object
    const subgroupNames = group.subgroups && Array.isArray(group.subgroups) 
      ? group.subgroups.map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg).filter(Boolean)
      : [];
    
    // Extract coach ID - coach can be an object (CustomUser) or ID
    let coachId = '';
    if (group.coach) {
      if (typeof group.coach === 'object' && group.coach !== null) {
        // The coach object from GroupSerializer is a CustomUser object
        // We need to find the coach in our coaches list by matching the ID
        const coachUser = coaches.find(c => c.id === group.coach.id);
        if (coachUser) {
          coachId = coachUser.id.toString();
        } else {
          // If not found in list, use the ID directly from the object
          coachId = group.coach.id ? group.coach.id.toString() : '';
        }
      } else {
        coachId = group.coach.toString();
      }
    }
    
    setGroupForm({
      id: group.id,
      name: group.name || '',
      subgroups: subgroupNames.length > 0 ? subgroupNames : [''],
      coach: coachId
    });
    setIsEditingGroup(true);
    setShowGroupModal(true);
  };

  // Filter players
  const filteredPlayers = players.filter(player => {
    const matchesSearch = (
      player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle both object and string formats for group/subgroup
    const playerGroup = typeof player.group === 'object' ? player.group?.name : player.group;
    const playerSubgroup = typeof player.subgroup === 'object' ? player.subgroup?.name : player.subgroup;
    
    const matchesGroup = !selectedGroup || playerGroup === selectedGroup;
    const matchesSubgroup = !selectedSubgroup || playerSubgroup === selectedSubgroup;

    return matchesSearch && matchesGroup && matchesSubgroup;
  });

  // Filter groups for Groups tab
  const filteredGroups = groups.filter(group => {
    return group.name?.toLowerCase().includes(groupSearchTerm.toLowerCase());
  });

  // Get players in a specific group (by group name)
  const getPlayersInGroup = (groupName) => {
    return players.filter(player => {
      const playerGroup = typeof player.group === 'object' ? player.group?.name : player.group;
      return playerGroup === groupName;
    });
  };

  // Get available players for a group (not in this group)
  const getAvailablePlayersForGroup = (groupName) => {
    return players.filter(player => {
      const playerGroup = typeof player.group === 'object' ? player.group?.name : player.group;
      return playerGroup !== groupName;
    });
  };

  // Handle group detail view
  const handleGroupDetail = (group) => {
    setViewingGroup(group);
    setShowGroupDetailModal(true);
  };

  // Handle group deletion
  const handleGroupDelete = async (groupId) => {
  const group = groups.find(g => g.id === groupId);
  const groupName = group?.name || 'Group';

  if (window.confirm(`Are you sure you want to delete ${groupName}?`)) {
    try {
      // ✅ Appel API pour supprimer en base de données
      await axios.delete(`${API_URL}/groups/${groupId}/`, {
        headers: { 'Authorization': `Token ${authToken}` }
      });

      // ✅ Mise à jour du state local après suppression réussie
      setGroups(groups.filter(g => g.id !== groupId));
      
      // ✅ Mettre à jour les joueurs qui appartenaient à ce groupe
      setPlayers(players.map(player => {
        const playerGroup = typeof player.group === 'object' ? player.group?.name : player.group;
        const isInGroup = playerGroup === groupName;
        return {
          ...player,
          group: isInGroup ? null : player.group,
          subgroup: isInGroup ? null : player.subgroup
        };
      }));

      addNotification(`${groupName} deleted successfully`);
    } catch (error) {
      console.error('Delete group failed:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to delete group';
      addNotification(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    }
  }
};

  // Add player to viewing group
  const handleAddPlayerToGroup = async (playerId) => {
    if (!viewingGroup) return;
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      
      // Update player via API
      const payload = {
        ...player,
        group: viewingGroup.id,
        subgroup: null // Clear subgroup when changing group
      };
      
      await axios.put(`${API_URL}/players/${playerId}/`, payload, {
        headers: { 'Authorization': `Token ${authToken}` }
      });
      
      // Reload players to get updated data
      await fetchPlayers();
      addNotification('Player added to group');
    } catch (error) {
      console.error('Error adding player to group:', error);
      addNotification('Failed to add player to group', 'error');
    }
  };

  // Remove player from viewing group
  const handleRemovePlayerFromGroup = async (playerId) => {
    if (!viewingGroup) return;
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      
      // Update player via API - need to set group to a default or handle null
      // Since group is required, we might need to handle this differently
      // For now, we'll just clear the subgroup
      const payload = {
        ...player,
        subgroup: null
      };
      
      await axios.put(`${API_URL}/players/${playerId}/`, payload, {
        headers: { 'Authorization': `Token ${authToken}` }
      });
      
      // Reload players to get updated data
      await fetchPlayers();
      addNotification('Player removed from group');
    } catch (error) {
      console.error('Error removing player from group:', error);
      addNotification('Failed to remove player from group', 'error');
    }
  };

  // Players in viewing group
  const viewingGroupPlayers = viewingGroup ? getPlayersInGroup(viewingGroup.name) : [];
  const availablePlayersForViewingGroup = viewingGroup ? getAvailablePlayersForGroup(viewingGroup.name) : [];

  // Password strength indicators
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-400',
    'bg-green-600'
  ];

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs w-full">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-xl shadow-lg backdrop-blur-sm border ${
                notification.type === 'success'
                  ? 'bg-gradient-to-r from-[#10B981]/20 to-[#059669]/20 border-green-700/50 text-green-100'
                  : 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700/50 text-red-100'
              }`}
            >
              <div className="flex items-start">
                <FiCheck className={`flex-shrink-0 mt-0.5 mr-3 ${
                  notification.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`} />
                <div className="text-sm font-medium">{notification.message}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Player & Group Management
              </h1>
              <p className="text-gray-300 mt-2 text-base sm:text-lg">
                {activeTab === 'players' 
                  ? `${players.length} player${players.length !== 1 ? 's' : ''} registered`
                  : `${groups.length} group${groups.length !== 1 ? 's' : ''} defined`
                }
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-900/65 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold">
                  <FiUsers className="text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-white">Team Manager</p>
                  <p className="text-xs text-gray-400">Admin Access</p>
                </div>
              </div>
              
              {activeTab === 'players' ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <FiPlus />
                  Add Player
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    resetGroupForm();
                    setShowGroupModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <FiPlus />
                  Add Group
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex gap-2 border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'players'
                  ? 'text-[#80a8ff] border-b-2 border-[#00d0cb]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiUsers />
                Players ({players.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'groups'
                  ? 'text-[#80a8ff] border-b-2 border-[#00d0cb]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiLayers />
                Groups ({groups.length})
              </div>
            </button>
          </div>
        </motion.div>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <>
            {/* Search Bar */}
            <motion.div variants={itemVariants} className="mb-8 flex flex-wrap gap-4 items-end">
              <div className="relative max-w-md flex-1 min-w-[200px]">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/65 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedGroup}
                  onChange={(e) => { setSelectedGroup(e.target.value); setSelectedSubgroup(''); }}
                  className="px-3 py-2.5 bg-gray-900/65 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none text-sm"
                >
                  <option value="">All groups</option>
                  {groupOptionsForPlayer.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <select
                  value={selectedSubgroup}
                  onChange={(e) => setSelectedSubgroup(e.target.value)}
                  disabled={!selectedGroup}
                  className="px-3 py-2.5 bg-gray-900/65 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#00d0cb]/50 outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All sub-groups</option>
                  {selectedGroup && (() => {
                    const g = groups.find(gr => gr.name === selectedGroup);
                    const subs = g && g.subgroups 
                      ? g.subgroups
                          .filter(Boolean)
                          .map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg)
                          .filter(Boolean)
                      : [];
                    const fromPlayers = [...new Set(players
                      .filter(p => {
                        const playerGroup = typeof p.group === 'object' ? p.group?.name : p.group;
                        return playerGroup === selectedGroup;
                      })
                      .map(p => {
                        const playerSubgroup = typeof p.subgroup === 'object' ? p.subgroup?.name : p.subgroup;
                        return playerSubgroup;
                      })
                      .filter(Boolean))];
                    const all = [...new Set([...subs, ...fromPlayers])];
                    return all.map((name) => <option key={name} value={name}>{name}</option>);
                  })()}
                </select>
              </div>
            </motion.div>

            {/* Players Table */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
        >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-900/80">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">Player</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">Details</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredPlayers.length > 0 ? filteredPlayers.map((player) => (
                  <motion.tr
                    key={`${player.id}-${player.user?.id || 'nouser'}`}
                    className="hover:bg-gray-800/40 transition-colors duration-200"
                    whileHover={{ x: 4 }}
                  >
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center mr-3">
                          <FiUser className="text-white text-lg" />
                        </div>
                        <div>
                          <div className="text-sm md:text-base font-medium text-white">{player.full_name}</div>
                          <div className="text-xs text-gray-400">
                            {typeof player.group === 'object' ? player.group?.name : player.group || 'No group'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-[#902bd1]" size={14} />
                          <span>{player.user?.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-[#4fb0ff]" size={14} />
                          <span>{player.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] border border-[#4fb0ff]/30">
                        {player.position || '-'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden lg:table-cell">
                      {player.height && player.weight ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white">{player.height} cm</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-white">{player.weight} kg</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">No details</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        player.status === 'Active'
                          ? 'bg-gradient-to-r from-[#10B981]/20 to-[#059669]/20 text-green-300 border border-green-700/40'
                          : player.status === 'Inactive'
                          ? 'bg-gradient-to-r from-red-900/40 to-red-800/30 text-red-300 border border-red-700/40'
                          : 'bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 text-yellow-300 border border-yellow-700/40'
                      }`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(player)}
                          className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all duration-200"
                          title="Edit player"
                        >
                          <FiEdit size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(player.id)}
                          className="p-2 rounded-lg bg-gradient-to-r from-red-900/20 to-red-800/20 text-red-400 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-200"
                          title="Delete player"
                        >
                          <FiTrash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4fb0ff]/20 to-[#902bd1]/20 flex items-center justify-center mb-4">
                          <FiUsers className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No players found</h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                          {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first player'}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            resetForm();
                            setShowModal(true);
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl hover:from-[#4fb0ff]/90 hover:to-[#00d0cb]/90 transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                          <FiPlus />
                          Add Player
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
          </>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <>
            {/* Group Search Bar */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="relative max-w-md">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/65 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>

            {/* Groups Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGroups.length > 0 ? filteredGroups.map((group) => {
                const groupPlayers = getPlayersInGroup(group.name);
                return (
                  <motion.div
                    key={group.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#7c3aed] flex items-center justify-center">
                            <FiLayers className="text-white text-xl" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{group.name}</h3>
                            <p className="text-xs text-gray-400">{groupPlayers.length} player{groupPlayers.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleGroupDetail(group)}
                            className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all duration-200"
                            title="View details"
                          >
                            <FiInfo size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditGroup(group)}
                            className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all duration-200"
                            title="Edit group"
                          >
                            <FiEdit size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleGroupDelete(group.id)}
                            className="p-2 rounded-lg bg-gradient-to-r from-red-900/20 to-red-800/20 text-red-400 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-200"
                            title="Delete group"
                          >
                            <FiTrash2 size={18} />
                          </motion.button>
                        </div>
                      </div>

                      {group.subgroups && group.subgroups.filter(Boolean).length > 0 && (
                        <p className="text-sm text-gray-400 mb-4">
                          Subgroups: {group.subgroups
                            .filter(Boolean)
                            .map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg)
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}

                      <div className="pt-4 border-t border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Players</span>
                          <span className="text-sm font-semibold text-white">{groupPlayers.length}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <motion.div 
                  variants={itemVariants}
                  className="lg:col-span-3 bg-gray-900/65 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4fb0ff]/20 to-[#902bd1]/20 flex items-center justify-center mx-auto mb-6">
                    <FiLayers className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No groups found</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    {groupSearchTerm ? 'Try adjusting your search terms' : 'Start by adding your first group'}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      resetGroupForm();
                      setShowGroupModal(true);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-xl hover:from-[#4fb0ff]/90 hover:to-[#00d0cb]/90 transition-all duration-300 flex items-center gap-2 font-medium mx-auto"
                  >
                    <FiPlus />
                    Add Group
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}

      {/* Player Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                    {editPlayerId ? 'Edit Player' : 'Add New Player'}
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <FiX size={20} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.username ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                        required
                      />
                      {errors.username && <p className="mt-2 text-sm text-red-400">{errors.username}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.full_name ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                        required
                      />
                      {errors.full_name && <p className="mt-2 text-sm text-red-400">{errors.full_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.email ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                        required
                      />
                      {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password {!editPlayerId && '*'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.password ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                          required={!editPlayerId}
                          placeholder={editPlayerId ? "Leave blank to keep current" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
                      {!editPlayerId && formData.password && (
                        <div className="mt-2">
                          <div className="flex gap-1 h-1.5 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full ${i < passwordStrength ? strengthColors[i] : 'bg-gray-700'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">
                            {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter password'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Position *</label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                        required
                      >
                        <option value="" className="bg-gray-800">Select position</option>
                        <option value="Midfielder" className="bg-gray-800">Midfielder</option>
                        <option value="Defender" className="bg-gray-800">Defender</option>
                        <option value="Forward" className="bg-gray-800">Forward</option>
                        <option value="Goalkeeper" className="bg-gray-800">Goalkeeper</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Group</label>
                      <select
                        name="group"
                        value={formData.group}
                        onChange={handleGroupChangeInForm}
                        className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                      >
                        <option value="" className="bg-gray-800">Select group</option>
                        {groupOptionsForPlayer.map((name) => (
                          <option key={name} value={name} className="bg-gray-800">{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.group && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sub-group</label>
                        <select
                          name="subgroup"
                          value={formData.subgroup}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                        >
                          <option value="" className="bg-gray-800">{subgroupOptionsForPlayer.length > 0 ? 'Select sub-group' : 'No sub-groups'}</option>
                          {subgroupOptionsForPlayer.map((name) => (
                            <option key={name} value={name} className="bg-gray-800">{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.height ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                        min="100"
                        max="250"
                        placeholder="160-200"
                      />
                      {errors.height && <p className="mt-2 text-sm text-red-400">{errors.height}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-800/70 border ${errors.weight ? 'border-red-500/50' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300`}
                        min="30"
                        max="200"
                        placeholder="50-100"
                      />
                      {errors.weight && <p className="mt-2 text-sm text-red-400">{errors.weight}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                    >
                      <option value="Active" className="bg-gray-800">Active</option>
                      <option value="Inactive" className="bg-gray-800">Inactive</option>
                      <option value="Injured" className="bg-gray-800">Injured</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-5 py-2.5 bg-gray-800/50 text-gray-300 rounded-xl font-medium hover:bg-gray-700/50 transition-all border border-gray-700/50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                    >
                      <FiCheck />
                      {editPlayerId ? 'Save Changes' : 'Add Player'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                    {isEditingGroup ? 'Edit Group' : 'Create Group'}
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <FiX size={20} />
                  </motion.button>
                </div>

                <form onSubmit={handleGroupSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Group Name *</label>
                    <input
                      type="text"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                      placeholder="e.g. U15, Team A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Coach</label>
                    <select
                      value={groupForm.coach}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, coach: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                    >
                      <option value="" className="bg-gray-800">Select coach (optional)</option>
                      {coaches.map((coach) => (
                        <option key={coach.id} value={coach.id} className="bg-gray-800">
                          {coach.username || coach.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">Sub-groups</label>
                      <button
                        type="button"
                        onClick={addSubgroup}
                        className="text-sm text-[#80a8ff] hover:text-[#00d0cb] flex items-center gap-1"
                      >
                        <FiPlus size={14} />
                        Add sub-group
                      </button>
                    </div>
                    <div className="space-y-2">
                      {groupForm.subgroups.map((sg, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={sg}
                            onChange={(e) => handleSubgroupChange(index, e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00d0cb]/50 focus:border-[#00d0cb]/50 outline-none transition-all duration-300"
                            placeholder={`Sub-group ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeSubgroup(index)}
                            disabled={groupForm.subgroups.length <= 1}
                            className="p-2.5 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Remove sub-group"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Add nested sub-groups inside this group.</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
                      className="px-5 py-2.5 bg-gray-800/50 text-gray-300 rounded-xl font-medium hover:bg-gray-700/50 transition-all border border-gray-700/50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium transition-all flex items-center gap-2"
                    >
                      <FiCheck />
                      {isEditingGroup ? 'Save Changes' : 'Create Group'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Group Detail Modal */}
        <AnimatePresence>
          {showGroupDetailModal && viewingGroup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
              onClick={() => setShowGroupDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 md:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
                        {viewingGroup.name}
                      </h2>
                      {viewingGroup.subgroups && viewingGroup.subgroups.filter(Boolean).length > 0 && (
                        <p className="text-gray-400 mt-1">
                          Subgroups: {viewingGroup.subgroups
                            .filter(Boolean)
                            .map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg)
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowGroupDetailModal(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <FiX size={20} />
                    </motion.button>
                  </div>

                  <div className="space-y-6">
                    {/* Assigned Players */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Assigned Players ({viewingGroupPlayers.length})</h3>
                      </div>
                      <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                        {viewingGroupPlayers.length > 0 ? (
                          <div className="space-y-2">
                            {viewingGroupPlayers.map((player) => (
                              <div
                                key={player.id}
                                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                                    <FiUser className="text-white" />
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">{player.full_name}</div>
                                    <div className="text-xs text-gray-400">{player.user?.email || 'No email'}</div>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleRemovePlayerFromGroup(player.id)}
                                  className="p-2 rounded-lg bg-gradient-to-r from-red-900/20 to-red-800/20 text-red-400 hover:from-red-900/30 hover:to-red-800/30 transition-all"
                                  title="Remove from group"
                                >
                                  <FiUserMinus size={18} />
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-4">No players assigned to this group</p>
                        )}
                      </div>
                    </div>

                    {/* Available Players */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Available Players ({availablePlayersForViewingGroup.length})</h3>
                      </div>
                      <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                        {availablePlayersForViewingGroup.length > 0 ? (
                          <div className="space-y-2">
                            {availablePlayersForViewingGroup.map((player) => (
                              <div
                                key={player.id}
                                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                                    <FiUser className="text-white" />
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">{player.full_name}</div>
                                    <div className="text-xs text-gray-400">{player.user?.email || 'No email'}</div>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleAddPlayerToGroup(player.id)}
                                  className="p-2 rounded-lg bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 text-[#80a8ff] hover:from-[#4fb0ff]/30 hover:to-[#00d0cb]/30 transition-all"
                                  title="Add to group"
                                >
                                  <FiUserPlus size={18} />
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-4">All players are assigned to this group</p>
                        )}
                      </div>
                    </div>
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

export default PlayerManagement;