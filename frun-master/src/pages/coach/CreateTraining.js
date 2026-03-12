import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiEdit3 } from 'react-icons/fi';

const CreateTraining = () => {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    groups: [],
    subgroups: [],
    player: '',
    description: '',
    date: '',
    startTime: '10:00',
    endTime: '12:00',
    category: 'physique',
    level: 'A',
    location: ''
  });

  useEffect(() => {
    const storedPlayers = JSON.parse(localStorage.getItem('players')) || [];
    setPlayers(storedPlayers);
  }, []);

  // Derive groups and subgroups from players data (same logic as Coach Agenda)
  const groupsWithSubgroups = useMemo(() => {
    const groupsMap = new Map();
    
    players.forEach(player => {
      if (player.group) {
        if (!groupsMap.has(player.group)) {
          groupsMap.set(player.group, {
            id: player.group,
            name: player.group,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle group toggle
  const handleGroupToggle = (groupId) => {
    setForm(prev => {
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

  // Handle subgroup toggle
  const handleSubgroupToggle = (subgroupId) => {
    setForm(prev => ({
      ...prev,
      subgroups: prev.subgroups.includes(subgroupId)
        ? prev.subgroups.filter(id => id !== subgroupId)
        : [...prev.subgroups, subgroupId],
      player: '' // Reset player when subgroups change
    }));
  };

  // Get all available subgroups from selected groups
  const availableSubgroups = useMemo(() => {
    return groupsWithSubgroups
      .filter(g => form.groups.includes(g.id))
      .flatMap(g => g.subgroups);
  }, [form.groups, groupsWithSubgroups]);

  // Filter players by selected groups and subgroups
  const filteredPlayers = form.groups.length > 0 ? players.filter((p) => {
    const matchesGroup = form.groups.includes(p.group);
    const matchesSubgroup = form.subgroups.length === 0 || (p.subgroup && form.subgroups.includes(p.subgroup));
    return matchesGroup && matchesSubgroup;
  }) : [];

  // Get group name for display
  const getGroupName = (groupId) => {
    const group = groupsWithSubgroups.find(g => g.id === groupId);
    return group ? group.name : groupId;
  };

  // Get subgroup name for display
  const getSubgroupName = (subgroupId) => {
    return subgroupId; // Subgroups are already strings from the Set
  };

  // Get player name for display
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : playerId;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that at least one group is selected
    if (form.groups.length === 0) {
      alert('Please select at least one group for the training session.');
      return;
    }
    
    // Validate date - prevent past dates
    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (selectedDate < today) {
      alert('Cannot create training sessions for past dates. Please select today or a future date.');
      return;
    }
    
    // Validate time - if date is today, prevent past times
    if (selectedDate.getTime() === today.getTime()) {
      const currentTime = new Date();
      const selectedStartTime = new Date(`${form.date}T${form.startTime}`);
      
      if (selectedStartTime < currentTime) {
        alert('Cannot create training sessions with past times for today. Please select a future time.');
        return;
      }
    }
    
    // Create a new training event
    const newTrainingEvent = {
      id: Date.now().toString(),
      title: form.name,
      type: 'training',
      subType: `${form.category}-${form.level}`,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location || 'Main Field',
      description: form.description,
      assignedGroups: form.groups,
      assignedSubgroups: form.subgroups,
      coachId: 'coach-1', // Default coach ID
      createdBy: 'coach', // Mark as created by coach
      playerId: form.player,
      groupName: form.groups.map(getGroupName).join(', '),
      subgroupName: form.subgroups.map(getSubgroupName).join(', '),
      playerName: form.player ? getPlayerName(form.player) : null
    };

    // Get existing events from localStorage
    const existingEvents = JSON.parse(localStorage.getItem('events')) || [];
    
    // Add the new training event
    const updatedEvents = [...existingEvents, newTrainingEvent];
    
    // Save to localStorage
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    
    // Trigger storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'events',
      newValue: JSON.stringify(updatedEvents)
    }));
    
    // Reset form
    setForm({
      name: '',
      groups: [],
      subgroups: [],
      player: '',
      description: '',
      date: '',
      startTime: '10:00',
      endTime: '12:00',
      category: 'physique',
      level: 'A',
      location: ''
    });
    
    alert(`Training created and added to agenda!\nName: ${form.name}\nDate: ${form.date}\nTime: ${form.startTime} - ${form.endTime}`);
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
      // initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] p-3 rounded-2xl">
              <FiEdit3 className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Create Training
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Design and schedule new training sessions for your players
              </p>
            </div>
          </div>
        </motion.div>

        <motion.form 
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Training Details Card */}
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-700/50 text-white">
              Training Details
            </h2>
            
            <div className="space-y-6">
              {/* Training Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Training Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter training name (e.g., 'Passing & Shooting Drills')"
                  className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <FiCalendar className="text-[#4fb0ff]" /> Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <FiClock className="text-[#00d0cb]" /> Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Category and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                    required
                  >
                    <option value="physique">Physique</option>
                    <option value="tactique">Tactique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Level</label>
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                    required
                  >
                    <option value="A">A (Beginner)</option>
                    <option value="B">B (Intermediate)</option>
                    <option value="C">C (Advanced)</option>
                    <option value="D">D (Elite)</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <FiMapPin className="text-[#902bd1]" /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Training field, stadium, etc."
                  className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter training objectives, focus areas, and any special instructions..."
                  className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent min-h-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Participants Card */}
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-700/50 text-white flex items-center gap-3">
              <FiUsers className="text-[#4fb0ff]" /> Participants
            </h2>
            
            <div className="space-y-6">
              {/* Groups Selection */}
              <div>
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
                          checked={form.groups.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="w-4 h-4 text-[#00d0cb] border-gray-600 rounded focus:ring-[#00d0cb] bg-gray-700"
                        />
                        <span className="text-sm font-medium text-white">{group.name}</span>
                      </label>
                    ))}
                  </div>
                  {form.groups.length === 0 && (
                    <p className="text-sm text-gray-400 mt-3">Please select at least one group</p>
                  )}
                  {form.groups.length > 0 && (
                    <p className="text-sm text-gray-300 mt-3">
                      Selected: {form.groups.length} group{form.groups.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Subgroups Selection */}
              {form.groups.length > 0 && availableSubgroups.length > 0 && (
                <div>
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
                            checked={form.subgroups.includes(subgroup)}
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Specific Player (Optional)</label>
                <select
                  name="player"
                  value={form.player}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                  disabled={form.groups.length === 0}
                >
                  <option value="">Select player (optional)</option>
                  {filteredPlayers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {form.groups.length > 0 && filteredPlayers.length === 0 && (
                  <p className="text-sm text-gray-400 mt-2">No players found for the selected groups and subgroups</p>
                )}
              </div>

              {/* Participants Summary */}
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <h3 className="font-medium text-gray-300 mb-2">Participants Summary</h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-400">
                    • Groups: {form.groups.length > 0 ? form.groups.map(getGroupName).join(', ') : 'None selected'}
                  </li>
                  {form.subgroups.length > 0 && (
                    <li className="text-sm text-gray-400">
                      • Subgroups: {form.subgroups.map(getSubgroupName).join(', ')}
                    </li>
                  )}
                  {form.player && (
                    <li className="text-sm text-gray-400">
                      • Specific Player: {getPlayerName(form.player)}
                    </li>
                  )}
                  <li className="text-sm text-[#4fb0ff] mt-3">
                    • Estimated participants: {form.player ? 1 : filteredPlayers.length} player{form.player || filteredPlayers.length !== 1 ? 's' : ''}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Exercises Card (Placeholder) */}
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-700/50 text-white">
              Exercises
            </h2>
            <div className="border-2 border-dashed border-gray-700/50 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-800/20">
              <div className="text-4xl mb-4 text-gray-600">🏋️</div>
              <p className="text-gray-300 font-medium mb-2">No exercises added yet</p>
              <p className="text-gray-400 mb-6">Add exercises to this training session</p>
              <button
                type="button"
                className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-all border border-gray-700/50 cursor-not-allowed"
                disabled
              >
                Add Exercise
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6">
            <div className="text-sm text-gray-400">
              * Required fields must be completed
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg"
            >
              Create Training Session
            </motion.button>
          </div>
        </motion.form>

        {/* Quick Stats */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-2">Total Players Available</div>
            <div className="text-2xl font-bold text-[#4fb0ff]">{players.length}</div>
          </div>
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-2">Total Groups</div>
            <div className="text-2xl font-bold text-[#00d0cb]">{groupsWithSubgroups.length}</div>
          </div>
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-2">Training Type</div>
            <div className="text-2xl font-bold text-[#902bd1]">
              {form.category === 'physique' ? 'Physique' : 'Tactique'} - Level {form.level}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateTraining;