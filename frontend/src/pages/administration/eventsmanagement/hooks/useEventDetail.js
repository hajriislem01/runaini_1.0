import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../../api';

export const useEventDetail = (id) => {
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
    if (id) fetchEvent();
  }, [id, navigate]);

  useEffect(() => {
    if (!event) return;
    const fetchPlayers = async () => {
      try {
        const response = await API.get(`players/?group_id=${event.group}`);
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

  useEffect(() => {
    if (!searchPlayer) {
      setFilteredPlayers(players);
      return;
    }
    setFilteredPlayers(
      players.filter(p => p.full_name.toLowerCase().includes(searchPlayer.toLowerCase()))
    );
  }, [searchPlayer, players]);

  const handleAddParticipant = async (playerId) => {
    setIsAddingParticipant(true);
    try {
      const response = await API.post(`events/${id}/add-participant/`, { player_id: playerId });
      setEvent(prev => ({
        ...prev,
        participants: [...prev.participants, response.data],
        participants_count: prev.participants_count + 1
      }));
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      toast.success('Participant added successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add participant');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleUpdateParticipant = async (participantId, newStatus) => {
    try {
      const response = await API.patch(`events/${id}/participant/${participantId}/`, { status: newStatus });
      setEvent(prev => ({
        ...prev,
        participants: prev.participants.map(p => p.id === participantId ? response.data : p)
      }));
      toast.success(`Participant ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update participant');
    }
  };

  const handleRemoveParticipant = async (participantId, playerName) => {
    if (!window.confirm(`Remove ${playerName} from this event?`)) return;
    try {
      await API.delete(`events/${id}/remove-participant/${participantId}/`);
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

  return {
    event, isLoading, isAddingParticipant,
    showAddModal, setShowAddModal,
    showCompleteModal, setShowCompleteModal,
    winner, setWinner, navigate,
    players, filteredPlayers, searchPlayer, setSearchPlayer,
    handleAddParticipant, handleUpdateParticipant, handleRemoveParticipant,
    handleComplete, handleDelete
  };
};
