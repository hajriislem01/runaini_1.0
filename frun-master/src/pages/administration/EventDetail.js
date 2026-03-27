import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiMapPin, FiUsers, FiTarget, FiArrowLeft,
  FiCheck, FiX, FiClock, FiTrash2, FiEdit2, FiPlus,
  FiAward, FiActivity
} from 'react-icons/fi';
import { FaTrophy, FaFutbol, FaMedal } from 'react-icons/fa';
import API from './api';
import toast, { Toaster } from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [winner, setWinner] = useState('');
  const [searchPlayer, setSearchPlayer] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  // ✅ Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const response = await API.get(`events/${id}/`);
        setEvent(response.data);
      } catch (error) {
        toast.error('Failed to load event');
        navigate('/administration/events-management');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // ✅ Fetch players du même groupe que l'event
  useEffect(() => {
    if (!event) return;
    const fetchPlayers = async () => {
      try {
        const response = await API.get(`players/?group_id=${event.group}`);
        // Filtre les joueurs déjà participants
        const participantIds = event.participants.map(p => p.player);
        const available = response.data.filter(p => !participantIds.includes(p.id));
        setPlayers(available);
        setFilteredPlayers(available);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    };
    fetchPlayers();
  }, [event]);

  // Filtre la recherche de joueurs
  useEffect(() => {
    if (!searchPlayer) {
      setFilteredPlayers(players);
      return;
    }
    setFilteredPlayers(
      players.filter(p =>
        p.full_name.toLowerCase().includes(searchPlayer.toLowerCase())
      )
    );
  }, [searchPlayer, players]);

  // ✅ Ajouter un participant
  const handleAddParticipant = async (playerId) => {
    setIsAddingParticipant(true);
    try {
      const response = await API.post(`events/${id}/add-participant/`, { player_id: playerId });
      setEvent(prev => ({
        ...prev,
        participants: [...prev.participants, response.data],
        participants_count: prev.participants_count + 1
      }));
      // Retire le joueur de la liste disponible
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      toast.success('Participant added successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add participant');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  // ✅ Changer statut participant
  const handleUpdateParticipant = async (participantId, newStatus) => {
    try {
      const response = await API.patch(`events/${id}/participant/${participantId}/`, { status: newStatus });
      setEvent(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.id === participantId ? response.data : p
        )
      }));
      toast.success(`Participant ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update participant');
    }
  };

  // ✅ Supprimer un participant
  const handleRemoveParticipant = async (participantId, playerName) => {
    if (!window.confirm(`Remove ${playerName} from this event?`)) return;
    try {
      await API.delete(`events/${id}/remove-participant/${participantId}/`);
      const removed = event.participants.find(p => p.id === participantId);
      setEvent(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== participantId),
        participants_count: prev.participants_count - 1
      }));
      toast.success('Participant removed');
    } catch (error) {
      toast.error('Failed to remove participant');
    }
  };

  // ✅ Compléter l'event
  const handleComplete = async () => {
    try {
      const response = await API.patch(`events/${id}/complete/`, { winner });
      setEvent(response.data);
      setShowCompleteModal(false);
      toast.success('Event completed!');
    } catch (error) {
      toast.error('Failed to complete event');
    }
  };

  // ✅ Supprimer l'event
  const handleDelete = async () => {
    if (!window.confirm(`Delete this event permanently?`)) return;
    try {
      await API.delete(`events/${id}/`);
      toast.success('Event deleted');
      navigate('/administration/events-management');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00d0cb]"></div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <button onClick={() => navigate('/administration/events-management')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <FiArrowLeft /><span>Back to Events</span>
          </button>

          <div className="bg-gradient-to-r from-[#902bd1]/30 to-[#00d0cb]/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${event.type === 'Tournament' ? 'from-[#902bd1] to-[#00d0cb]' : 'from-[#4fb0ff] to-[#00d0cb]'}`}>
                  {event.type === 'Tournament' ? <FaTrophy className="text-2xl" /> : <FaFutbol className="text-2xl" />}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{event.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${event.type === 'Tournament' ? 'bg-[#902bd1]/20 text-[#902bd1] border-[#902bd1]/30' : 'bg-[#4fb0ff]/20 text-[#4fb0ff] border-[#4fb0ff]/30'}`}>
                      {event.type}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${event.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : event.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gray-800/50 text-gray-300 border-gray-700/50'}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {event.status !== 'completed' && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCompleteModal(true)}
                    className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium hover:bg-green-500/30 flex items-center gap-2">
                    <FiCheck />Complete Event
                  </motion.button>
                )}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium hover:bg-red-500/30 flex items-center gap-2">
                  <FiTrash2 />Delete
                </motion.button>
              </div>
            </div>

            {/* Winner Banner */}
            {event.winner && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
                <FaMedal className="text-yellow-400 text-xl" />
                <span className="text-yellow-400 font-bold">Winner: {event.winner}</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Event Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiActivity className="text-[#00d0cb]" />Event Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-gray-300">
                  <FiCalendar className="text-[#00d0cb] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Date & Time</div>
                    <div className="text-white">{formatDate(event.date)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-gray-300">
                  <FiMapPin className="text-[#4fb0ff] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="text-white">{event.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-gray-300">
                  <FiUsers className="text-[#902bd1] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Group</div>
                    <div className="text-white">
                      {event.group_name}
                      {event.subgroup_name && <span className="text-gray-400"> • {event.subgroup_name}</span>}
                    </div>
                  </div>
                </div>
                {event.target_academy && (
                  <div className="flex items-start gap-3 text-gray-300">
                    <FiTarget className="text-[#22c55e] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Opponent</div>
                      <div className="text-white">{event.target_academy}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 text-gray-300">
                  <FiAward className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Participants</div>
                    <div className="text-white">{event.participants_count} registered</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Participants Stats */}
            <motion.div variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-xl font-bold mb-4">Participation Stats</h2>
              <div className="space-y-3">
                {[
                  { label: 'Accepted', value: event.participants.filter(p => p.status === 'accepted').length, color: 'text-green-400' },
                  { label: 'Pending', value: event.participants.filter(p => p.status === 'pending').length, color: 'text-yellow-400' },
                  { label: 'Rejected', value: event.participants.filter(p => p.status === 'rejected').length, color: 'text-red-400' },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                    <span className="text-gray-300">{stat.label}</span>
                    <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — Participants */}
          <div className="lg:col-span-2">
            <motion.div variants={itemVariants}
              className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FiUsers className="text-[#4fb0ff]" />
                  Participants ({event.participants_count})
                </h2>
                {event.status !== 'completed' && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 text-white text-sm font-medium rounded-xl flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                    <FiPlus />Add Participant
                  </motion.button>
                )}
              </div>

              {event.participants.length > 0 ? (
                <div className="space-y-3">
                  {event.participants.map(participant => (
                    <motion.div key={participant.id} whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold">
                          {participant.player_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{participant.player_name}</div>
                          <div className="text-gray-400 text-sm">{participant.player_position}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(participant.status)}`}>
                          {participant.status}
                        </span>

                        {event.status !== 'completed' && (
                          <div className="flex gap-1">
                            {participant.status !== 'accepted' && (
                              <button onClick={() => handleUpdateParticipant(participant.id, 'accepted')}
                                className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                                <FiCheck size={14} />
                              </button>
                            )}
                            {participant.status !== 'rejected' && (
                              <button onClick={() => handleUpdateParticipant(participant.id, 'rejected')}
                                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                <FiX size={14} />
                              </button>
                            )}
                            <button onClick={() => handleRemoveParticipant(participant.id, participant.player_name)}
                              className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 transition-colors">
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FiUsers className="text-4xl mx-auto mb-3 opacity-50" />
                  <p>No participants yet</p>
                  {event.status !== 'completed' && (
                    <button onClick={() => setShowAddModal(true)}
                      className="mt-4 text-[#00d0cb] hover:text-[#4fb0ff] text-sm font-medium">
                      Add first participant
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ✅ Modal — Ajouter participant */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add Participant</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              <input type="text" value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)}
                placeholder="Search player..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500 mb-4" />

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
                  <motion.div key={player.id} whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white text-sm font-bold">
                        {player.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{player.full_name}</div>
                        <div className="text-gray-400 text-xs">{player.position}</div>
                      </div>
                    </div>
                    <button onClick={() => handleAddParticipant(player.id)}
                      disabled={isAddingParticipant}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                      Add
                    </button>
                  </motion.div>
                )) : (
                  <div className="text-center py-8 text-gray-400">
                    {players.length === 0 ? 'All players in this group are already added' : 'No players found'}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Modal — Compléter event */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" />Complete Event
                </h3>
                <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-2">
                  Winner (Optional)
                </label>
                <input type="text" value={winner} onChange={(e) => setWinner(e.target.value)}
                  placeholder="Enter winner name or team"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 font-medium">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  className="flex-1 px-4 py-3 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #00d0cb)' }}>
                  <FiCheck />Mark as Complete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventDetail;