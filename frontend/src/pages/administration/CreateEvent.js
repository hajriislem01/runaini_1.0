import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiTarget, FiChevronRight, FiZap } from 'react-icons/fi';
import { FaTrophy, FaFutbol } from 'react-icons/fa';

const CreateEvent = ({ groups, addEvent }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matchFriendly');
  const [formData, setFormData] = useState({
    eventName: '',
    group: '',
    subgroup: '',
    date: '',
    time: '',
    location: '',
    numParticipants: '',
    targetAcademy: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
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
      newErrors.numParticipants = 'Number of participants must be at least 2 for a tournament';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const newEvent = {
      id: Date.now().toString(),
      title: formData.eventName,
      type: activeTab === 'matchFriendly' ? 'Match Friendly' : 'Tournament',
      group: formData.group,
      subgroup: formData.subgroup || null,
      date: `${formData.date}T${formData.time}:00`,
      location: formData.location,
      description: '',
      creator: 'Academy A',
      status: 'open',
      participants: [],
      createdAt: new Date().toISOString(),
      ...(activeTab === 'tournament' && { 
        maxParticipants: parseInt(formData.numParticipants, 10),
        tournamentStatus: 'pending'
      }),
      ...(activeTab === 'matchFriendly' && { 
        targetAcademy: formData.targetAcademy || null,
        matchStatus: 'scheduled'
      })
    };
    
    addEvent(newEvent);
    navigate('/administration/events-management');
  };

  const getSubgroupsForGroup = (groupName) => {
    const selectedGroup = groups.find(g => g.name === groupName);
    return selectedGroup ? selectedGroup.subgroups : [];
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
      className="min-h-screen text-white"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-[#4fb0ff]/80 via-[#00d0cb]/80 to-[#902bd1]/80 backdrop-blur-sm border-b border-[#4fb0ff]/40 px-6 py-8 md:px-8 lg:px-10"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-white bg-clip-text text-transparent">
            Create New Event
          </h1>
          <p className="text-gray-300 mt-2">
            Choose the type of event you want to create • All fields are required
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab Selection */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 ${
              activeTab === 'matchFriendly'
                ? 'border-[#00d0cb] bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20'
                : 'border-gray-700/50 bg-gray-900/30 hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('matchFriendly')}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${
                activeTab === 'matchFriendly'
                  ? 'bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff]'
                  : 'bg-gray-800'
              }`}>
                <FaFutbol className="text-2xl" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">Match Friendly</h3>
                <p className="text-gray-400 text-sm">Schedule friendly matches with other academies</p>
              </div>
              {activeTab === 'matchFriendly' && (
                <FiChevronRight className="ml-auto text-[#00d0cb] text-2xl" />
              )}
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 ${
              activeTab === 'tournament'
                ? 'border-[#902bd1] bg-gradient-to-br from-[#902bd1]/20 to-[#4fb0ff]/20'
                : 'border-gray-700/50 bg-gray-900/30 hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('tournament')}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${
                activeTab === 'tournament'
                  ? 'bg-gradient-to-br from-[#902bd1] to-[#00d0cb]'
                  : 'bg-gray-800'
              }`}>
                <FaTrophy className="text-2xl" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">Tournament</h3>
                <p className="text-gray-400 text-sm">Organize competitive tournaments with multiple teams</p>
              </div>
              {activeTab === 'tournament' && (
                <FiChevronRight className="ml-auto text-[#902bd1] text-2xl" />
              )}
            </div>
          </motion.button>
        </motion.div>

        {/* Form Container */}
        <motion.div variants={itemVariants}>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                activeTab === 'matchFriendly'
                  ? 'bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff]'
                  : 'bg-gradient-to-br from-[#902bd1] to-[#00d0cb]'
              }`}>
                {activeTab === 'matchFriendly' ? <FaFutbol /> : <FaTrophy />}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {activeTab === 'matchFriendly' ? 'Match Friendly Details' : 'Tournament Details'}
                </h2>
                <p className="text-gray-400">
                  Fill in all required information below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                  <FiZap className="text-[#eab308]" />
                  {activeTab === 'matchFriendly' ? 'Match Name' : 'Tournament Name'}
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder={`Enter ${activeTab === 'matchFriendly' ? 'match' : 'tournament'} name`}
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.eventName ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 transition-all`}
                />
                {errors.eventName && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.eventName}
                  </p>
                )}
              </div>

              {/* Group and Subgroup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiUsers className="text-[#4fb0ff]" />
                    Group
                  </label>
                  <div className="relative">
                    <select
                      name="group"
                      value={formData.group}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.group ? 'border-red-500' : 'border-gray-700'} rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}
                    >
                      <option value="" className="bg-gray-900">Select group</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.name} className="bg-gray-900">{group.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <FiChevronRight className="h-5 w-5 text-gray-500 rotate-90" />
                    </div>
                  </div>
                  {errors.group && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.group}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiUsers className="text-[#902bd1]" />
                    Subgroup
                  </label>
                  <div className="relative">
                    <select
                      name="subgroup"
                      value={formData.subgroup}
                      onChange={handleChange}
                      disabled={!formData.group}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white disabled:bg-gray-900/30 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-gray-900">Select subgroup</option>
                      {getSubgroupsForGroup(formData.group).map(subgroup => (
                        <option key={subgroup.id} value={subgroup.name} className="bg-gray-900">{subgroup.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <FiChevronRight className="h-5 w-5 text-gray-500 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Fields */}
              {activeTab === 'matchFriendly' ? (
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiTarget className="text-[#22c55e]" />
                    Target Academy (Optional)
                  </label>
                  <input
                    type="text"
                    name="targetAcademy"
                    value={formData.targetAcademy}
                    onChange={handleChange}
                    placeholder="Enter target academy name"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiUsers className="text-[#eab308]" />
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    name="numParticipants"
                    value={formData.numParticipants}
                    onChange={handleChange}
                    min="2"
                    placeholder="Enter number of participants"
                    className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.numParticipants ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500`}
                  />
                  {errors.numParticipants && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.numParticipants}
                    </p>
                  )}
                </div>
              )}

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiCalendar className="text-[#00d0cb]" />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.date ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}
                  />
                  {errors.date && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <FiCalendar className="text-[#902bd1]" />
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.time ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}
                  />
                  {errors.time && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <span className="text-red-500">•</span> {errors.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                  <FiMapPin className="text-[#4fb0ff]" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter event location"
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.location ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500`}
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.location}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl border border-gray-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-8 py-3 text-white font-semibold rounded-xl transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${activeTab === 'matchFriendly' ? '#4fb0ff' : '#902bd1'}, ${activeTab === 'matchFriendly' ? '#00d0cb' : '#4fb0ff'})`
                    }}
                  >
                    {activeTab === 'matchFriendly' ? 'Create Match Friendly' : 'Create Tournament'}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-2xl border border-[#4fb0ff]/30 p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[#4fb0ff]">
              <FiZap /> Quick Tips
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-[#22c55e]">✓</span>
                All events will be automatically added to the team calendar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#22c55e]">✓</span>
                Players will receive notifications 24 hours before the event
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#22c55e]">✓</span>
                {activeTab === 'tournament' 
                  ? 'Tournament brackets will be generated automatically'
                  : 'Match analytics will be available after completion'
                }
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateEvent;