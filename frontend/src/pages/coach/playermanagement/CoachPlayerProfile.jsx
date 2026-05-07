import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import PlayerProfileView from '../../administration/playermanagement/shared/PlayerProfileView';
import API from '../../api';

const CoachPlayerProfile = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [player,    setPlayer]    = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data } = await API.get(`players/${id}/`);
        setPlayer(data);
      } catch {
        toast.error('Failed to load player data');
        navigate('/coach/players');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayer();
  }, [id, navigate]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#000 0%,#0a0f2a 45%,#180033 100%)' }}>
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00d0cb]" />
    </div>
  );

  if (!player) return null;

  return (
    <>
      <Toaster position="top-right" />
      <PlayerProfileView
        player={player}
        onBack={() => navigate('/coach/players')}
      />
    </>
  );
};

export default CoachPlayerProfile;
