import { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../api';

export const usePlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [activeTab, setActiveTab] = useState('players');
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

  const API_URL = 'http://localhost:8000/api';
  const authToken = localStorage.getItem('token');

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

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

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups/`, {
        headers: { 'Authorization': `Token ${authToken}` }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      addNotification('Failed to fetch groups', 'error');
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await axios.get(`${API_URL}/coaches/`, {
        headers: { 'Authorization': `Token ${authToken}` }
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

  return {
    players, setPlayers, groups, setGroups, coaches, setCoaches,
    activeTab, setActiveTab, showModal, setShowModal,
    showGroupDetailModal, setShowGroupDetailModal, viewingGroup, setViewingGroup,
    searchTerm, setSearchTerm, groupSearchTerm, setGroupSearchTerm,
    showPassword, setShowPassword, passwordStrength, setPasswordStrength,
    editPlayerId, setEditPlayerId, errors, setErrors, notifications, addNotification,
    showGroupModal, setShowGroupModal, groupForm, setGroupForm,
    isEditingGroup, setIsEditingGroup, expandedGroup, setExpandedGroup,
    expandedSubgroup, setExpandedSubgroup, selectedGroup, setSelectedGroup,
    selectedSubgroup, setSelectedSubgroup, loading, setLoading, formData, setFormData,
    API_URL, authToken, fetchPlayers, fetchGroups, fetchCoaches
  };
};
