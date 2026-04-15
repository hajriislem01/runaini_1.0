import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

import { usePlayerManagement } from './hooks/usePlayerManagement';
import {
  validatePlayerForm, calculatePasswordStrength, containerVariants, itemVariants
} from './utils/playerHelpers';

import PlayerHeader from './components/PlayerHeader';
import TabNavigation from './components/TabNavigation';
import NotificationToast from './components/NotificationToast';

import PlayersTab from './tabs/PlayersTab';
import GroupsTab from './tabs/GroupsTab';

import PlayerModal from './modals/PlayerModal';
import GroupModal from './modals/GroupModal';
import GroupDetailModal from './modals/GroupDetailModal';

const PlayerManagement = () => {
  const {
    players, setPlayers, groups, setGroups, coaches,
    activeTab, setActiveTab, showModal, setShowModal,
    showGroupDetailModal, setShowGroupDetailModal, viewingGroup, setViewingGroup,
    searchTerm, setSearchTerm, groupSearchTerm, setGroupSearchTerm,
    showPassword, setShowPassword, passwordStrength, setPasswordStrength,
    editPlayerId, setEditPlayerId, errors, setErrors, notifications, addNotification,
    showGroupModal, setShowGroupModal, groupForm, setGroupForm,
    isEditingGroup, setIsEditingGroup, selectedGroup, setSelectedGroup,
    selectedSubgroup, setSelectedSubgroup, loading, formData, setFormData,
    API_URL, authToken, fetchPlayers, fetchGroups
  } = usePlayerManagement();

  // Reset Player Form
  const resetForm = useCallback(() => {
    setFormData({
      username: "", full_name: '', email: '', password: '', phone: '',
      position: '', status: 'Active', group: '', subgroup: '',
      height: '', weight: '', address: '', notes: ''
    });
    setPasswordStrength(0);
    setEditPlayerId(null);
    setShowPassword(false);
    setErrors({});
  }, [setFormData, setPasswordStrength, setEditPlayerId, setShowPassword, setErrors]);

  // Reset Group Form
  const resetGroupForm = useCallback(() => {
    setGroupForm({ id: '', name: '', subgroups: [''], coach: '' });
    setIsEditingGroup(false);
  }, [setGroupForm, setIsEditingGroup]);

  // Handle Input Change for Player Form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleGroupChangeInForm = (e) => {
    setFormData(prev => ({ ...prev, group: e.target.value, subgroup: '' }));
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  // Group helpers for Player form group select logic
  const groupOptionsForPlayer = [...new Set([
    ...groups.map(g => g.name),
    ...players.map(p => {
      const playerGroup = typeof p.group === 'object' && p.group !== null ? p.group.name : p.group;
      return playerGroup;
    }).filter(Boolean)
  ])].filter(Boolean).sort();

  const getSubgroupsForSelectedGroup = () => {
    if (!formData.group) return [];
    const g = groups.find(gr => gr.name === formData.group);
    if (g && g.subgroups && g.subgroups.filter(Boolean).length > 0) {
      return g.subgroups.filter(Boolean).map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg).filter(Boolean);
    }
    return [...new Set(players.filter(p => {
      const playerGroup = typeof p.group === 'object' ? p.group?.name : p.group;
      return playerGroup === formData.group;
    }).map(p => {
      const playerSubgroup = typeof p.subgroup === 'object' ? p.subgroup?.name : p.subgroup;
      return playerSubgroup;
    }).filter(Boolean))];
  };

  const baseSubgroupOptions = getSubgroupsForSelectedGroup();
  const subgroupOptionsForPlayer = formData.subgroup && !baseSubgroupOptions.includes(formData.subgroup)
    ? [...baseSubgroupOptions, formData.subgroup]
    : baseSubgroupOptions;

  // Handle Submit for Player
  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    if (!validatePlayerForm(formData, editPlayerId, setErrors)) return;

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

    let subgroupId = null;
    if (formData.subgroup && groupId) {
      const selectedGroupObj = groups.find(g => g.id === groupId);
      if (selectedGroupObj && selectedGroupObj.subgroups) {
        const subgroupObj = selectedGroupObj.subgroups.find(
          sg => (typeof sg === 'object' && sg !== null ? sg.name : sg) === formData.subgroup
        );
        if (subgroupObj) subgroupId = typeof subgroupObj === 'object' ? subgroupObj.id : subgroupObj;
      }
    }

    const payload = {
      ...formData,
      group: groupId || formData.group || null,
      subgroup: subgroupId || formData.subgroup || null,
      height: formData.height === '' || formData.height == null ? 0 : Number(formData.height),
      weight: formData.weight === '' || formData.weight == null ? 0 : Number(formData.weight)
    };

    try {
      if (editPlayerId) {
        await axios.put(`${API_URL}/players/${editPlayerId}/`, payload, {
          headers: { 'Authorization': `Token ${authToken}` }
        });
        addNotification('Player updated successfully');
      } else {
        await axios.post(`${API_URL}/players/signup/`, payload, {
          headers: { 'Authorization': `Token ${authToken}` }
        });
        addNotification('Player added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchPlayers();
      fetchGroups();
    } catch (error) {
      console.error('Error saving player:', error);
      const data = error.response?.data;
      const errMsg = (data && (data.error || data.detail || (typeof data === 'string' ? data : null))) || error.message || 'Failed to save player';
      addNotification(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg), 'error');
    }
  };

  const handleEditPlayer = (player) => {
    setEditPlayerId(player.id);
    const playerGroup = typeof player.group === 'object' && player.group !== null
      ? player.group.name || player.group.id : player.group || '';
    const playerSubgroup = typeof player.subgroup === 'object' && player.subgroup !== null
      ? player.subgroup.name || player.subgroup.id : player.subgroup || '';

    setFormData({
      username: player.username || player.user?.username || '',
      full_name: player.full_name,
      email: player.user?.email || player.email || '',
      password: '',
      phone: player.phone || '',
      position: player.position || '',
      status: player.status || 'Active',
      group: playerGroup, subgroup: playerSubgroup,
      height: player.height || '', weight: player.weight || '',
      address: player.address || '', notes: player.notes || ''
    });
    setShowModal(true);
  };

  const handleDeletePlayer = async (id) => {
    try {
      const playerName = players.find(p => p.id === id)?.full_name || 'Player';
      if (window.confirm(`Are you sure you want to delete ${playerName}?`)) {
        await axios.delete(`${API_URL}/players/${id}/`, { headers: { 'Authorization': `Token ${authToken}` } });
        setPlayers(players.filter(player => player.id !== id));
        addNotification(`${playerName} deleted successfully`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      addNotification('Failed to delete player', 'error');
    }
  };

  // Group helpers
  const getCoachProfileId = async (coachUserId) => {
    if (!coachUserId) return null;
    try {
      const coach = coaches.find(c => c.id === parseInt(coachUserId));
      if (coach && coach.coach_profile && coach.coach_profile.id) return coach.coach_profile.id;
      const response = await axios.get(`${API_URL}/coaches/${coachUserId}/`, { headers: { 'Authorization': `Token ${authToken}` } });
      if (response.data.coach_profile && response.data.coach_profile.id) return response.data.coach_profile.id;
      return null;
    } catch (err) {
      return null;
    }
  };

  const addSubgroup = () => setGroupForm(p => ({ ...p, subgroups: [...p.subgroups, ''] }));
  const removeSubgroup = (index) => setGroupForm(p => ({ ...p, subgroups: p.subgroups.filter((_, i) => i !== index) }));
  const handleSubgroupChange = (index, value) => setGroupForm(p => ({ ...p, subgroups: p.subgroups.map((sg, i) => i === index ? value : sg) }));

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    const name = groupForm.name.trim();
    const subgroups = groupForm.subgroups.map(s => s.trim()).filter(Boolean);
    const coachId = groupForm.coach || null;
    if (!name) return addNotification('Group name is required', 'error');

    try {
      const coachProfileId = await getCoachProfileId(coachId);
      let groupResponse;
      if (isEditingGroup && groupForm.id && !String(groupForm.id).startsWith('local-')) {
        groupResponse = await axios.put(`${API_URL}/groups/${groupForm.id}/`, { name, coach: coachProfileId }, { headers: { 'Authorization': `Token ${authToken}` } });
        const existingResponse = await axios.get(`${API_URL}/subgroups/`, { headers: { 'Authorization': `Token ${authToken}` }, params: { group: groupForm.id } });
        const existingSubgroups = existingResponse.data || [];
        for (const sg of existingSubgroups) {
          if (!subgroups.includes(sg.name)) {
            await axios.delete(`${API_URL}/subgroups/${sg.id}/`, { headers: { 'Authorization': `Token ${authToken}` } });
          }
        }
        for (const sgName of subgroups) {
          if (!existingSubgroups.find(sg => sg.name === sgName)) {
            await axios.post(`${API_URL}/subgroups/`, { name: sgName, group: groupForm.id }, { headers: { 'Authorization': `Token ${authToken}` } });
          }
        }
      } else {
        groupResponse = await axios.post(`${API_URL}/groups/`, { name, coach: coachProfileId }, { headers: { 'Authorization': `Token ${authToken}` } });
        for (const sgName of subgroups) {
          await axios.post(`${API_URL}/subgroups/`, { name: sgName, group: groupResponse.data.id }, { headers: { 'Authorization': `Token ${authToken}` } });
        }
      }
      fetchGroups();
      addNotification(isEditingGroup ? 'Group updated' : 'Group created');
    } catch (error) {
      console.error('Error saving group:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to save group';
      addNotification(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    }
    setShowGroupModal(false);
    resetGroupForm();
  };

  const handleEditGroup = (group) => {
    const subgroupNames = group.subgroups && Array.isArray(group.subgroups)
      ? group.subgroups.map(sg => typeof sg === 'object' && sg !== null ? sg.name : sg).filter(Boolean) : [];
    let coachId = '';
    if (group.coach) {
      if (typeof group.coach === 'object' && group.coach !== null) {
        const coachUser = coaches.find(c => c.id === group.coach.id);
        coachId = coachUser ? coachUser.id.toString() : (group.coach.id ? group.coach.id.toString() : '');
      } else {
        coachId = group.coach.toString();
      }
    }
    setGroupForm({ id: group.id, name: group.name || '', subgroups: subgroupNames.length > 0 ? subgroupNames : [''], coach: coachId });
    setIsEditingGroup(true);
    setShowGroupModal(true);
  };

  const handleGroupDelete = async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    const groupName = group?.name || 'Group';
    if (window.confirm(`Are you sure you want to delete ${groupName}?`)) {
      try {
        await axios.delete(`${API_URL}/groups/${groupId}/`, { headers: { 'Authorization': `Token ${authToken}` } });
        setGroups(groups.filter(g => g.id !== groupId));
        setPlayers(players.map(p => {
          const pg = typeof p.group === 'object' ? p.group?.name : p.group;
          return pg === groupName ? { ...p, group: null, subgroup: null } : p;
        }));
        addNotification(`${groupName} deleted successfully`);
      } catch (error) {
        console.error('Delete group failed:', error);
        addNotification('Failed to delete group', 'error');
      }
    }
  };

  const handleGroupDetail = (group) => { setViewingGroup(group); setShowGroupDetailModal(true); };

  const getPlayersInGroup = (groupName) => players.filter(p => (typeof p.group === 'object' ? p.group?.name : p.group) === groupName);

  const getAvailablePlayersForGroup = (groupName) => players.filter(p => (typeof p.group === 'object' ? p.group?.name : p.group) !== groupName);

  const viewingGroupPlayers = viewingGroup ? getPlayersInGroup(viewingGroup.name) : [];
  const availablePlayersForViewingGroup = viewingGroup ? getAvailablePlayersForGroup(viewingGroup.name) : [];

  const handleAddPlayerToGroup = async (playerId) => {
    if (!viewingGroup) return;
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      await axios.put(`${API_URL}/players/${playerId}/`, { ...player, group: viewingGroup.id, subgroup: null }, { headers: { 'Authorization': `Token ${authToken}` } });
      fetchPlayers();
      addNotification('Player added to group');
    } catch (error) {
      addNotification('Failed to add player to group', 'error');
    }
  };

  const handleRemovePlayerFromGroup = async (playerId) => {
    if (!viewingGroup) return;
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      await axios.put(`${API_URL}/players/${playerId}/`, { ...player, subgroup: null }, { headers: { 'Authorization': `Token ${authToken}` } });
      fetchPlayers();
      addNotification('Player removed from group');
    } catch (error) {
      addNotification('Failed to remove player from group', 'error');
    }
  };

  // Filter UI
  const filteredPlayers = players.filter(player => {
    const matchesSearch = (
      player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const pg = typeof player.group === 'object' ? player.group?.name : player.group;
    const ps = typeof player.subgroup === 'object' ? player.subgroup?.name : player.subgroup;
    const matchesG = !selectedGroup || pg === selectedGroup;
    const matchesS = !selectedSubgroup || ps === selectedSubgroup;
    return matchesSearch && matchesG && matchesS;
  });

  const filteredGroups = groups.filter(g => g.name?.toLowerCase().includes(groupSearchTerm.toLowerCase()));

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
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <NotificationToast notifications={notifications} />

      <div className="max-w-7xl mx-auto">
        <PlayerHeader
          activeTab={activeTab} playersCount={players.length} groupsCount={groups.length}
          resetForm={resetForm} setShowModal={setShowModal}
          resetGroupForm={resetGroupForm} setShowGroupModal={setShowGroupModal}
          itemVariants={itemVariants}
        />

        <TabNavigation
          activeTab={activeTab} setActiveTab={setActiveTab}
          playersCount={players.length} groupsCount={groups.length}
          itemVariants={itemVariants}
        />

        {activeTab === 'players' && (
          <PlayersTab
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup}
            selectedSubgroup={selectedSubgroup} setSelectedSubgroup={setSelectedSubgroup}
            groupOptionsForPlayer={groupOptionsForPlayer} groups={groups} players={players}
            filteredPlayers={filteredPlayers}
            handleEdit={handleEditPlayer} handleDelete={handleDeletePlayer}
            resetForm={resetForm} setShowModal={setShowModal}
            itemVariants={itemVariants}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsTab
            groupSearchTerm={groupSearchTerm} setGroupSearchTerm={setGroupSearchTerm}
            filteredGroups={filteredGroups} getPlayersInGroup={getPlayersInGroup}
            handleGroupDetail={handleGroupDetail} handleEditGroup={handleEditGroup} handleGroupDelete={handleGroupDelete}
            resetGroupForm={resetGroupForm} setShowGroupModal={setShowGroupModal}
            itemVariants={itemVariants}
          />
        )}
      </div>

      <PlayerModal
        showModal={showModal} setShowModal={setShowModal} editPlayerId={editPlayerId} resetForm={resetForm} handleSubmit={handlePlayerSubmit}
        formData={formData} handleChange={handleChange} handleGroupChangeInForm={handleGroupChangeInForm} handlePasswordChange={handlePasswordChange}
        errors={errors} showPassword={showPassword} setShowPassword={setShowPassword} passwordStrength={passwordStrength}
        groupOptionsForPlayer={groupOptionsForPlayer} subgroupOptionsForPlayer={subgroupOptionsForPlayer}
      />

      <GroupModal
        showGroupModal={showGroupModal} setShowGroupModal={setShowGroupModal} resetGroupForm={resetGroupForm} handleGroupSubmit={handleGroupSubmit}
        isEditingGroup={isEditingGroup} groupForm={groupForm} setGroupForm={setGroupForm} coaches={coaches} addSubgroup={addSubgroup}
        removeSubgroup={removeSubgroup} handleSubgroupChange={handleSubgroupChange}
      />

      <GroupDetailModal
        showGroupDetailModal={showGroupDetailModal} setShowGroupDetailModal={setShowGroupDetailModal} viewingGroup={viewingGroup}
        viewingGroupPlayers={viewingGroupPlayers} availablePlayersForViewingGroup={availablePlayersForViewingGroup}
        handleRemovePlayerFromGroup={handleRemovePlayerFromGroup} handleAddPlayerToGroup={handleAddPlayerToGroup}
      />

    </motion.div>
  );
};

export default PlayerManagement;
