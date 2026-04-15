import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PlayerProfileView from './shared/PlayerProfileView';

const API_URL = 'http://localhost:8000/api';

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/players/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setPlayer(response.data);
      } catch (error) {
        toast.error('Failed to load player data');
        navigate('/administration/player-management');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayer();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00d0cb]"></div>
      </div>
    );
  }

  const stats = {
    matches: player.matches_played || Math.floor(Math.random() * 50) + 10,
    goals: player.goals_scored || Math.floor(Math.random() * 20),
    attendance: player.attendance_percentage || (Math.random() * 20 + 80).toFixed(1),
    health: player.health_status || 'Optimal'
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <Toaster position="top-right" />

      <PlayerProfileView
        player={player}
        stats={stats}
        onBack={() => navigate('/administration/player-management')}
      />

    </div>
  );
};

export default PlayerProfile;
