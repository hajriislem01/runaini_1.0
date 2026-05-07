import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../pages/administration/api';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlayer = useCallback(async (background = false) => {
    const stored = localStorage.getItem('user');
    if (!stored) { setIsLoading(false); return; }

    let userObj;
    try { userObj = JSON.parse(stored); } catch { setIsLoading(false); return; }

    if (userObj?.role !== 'player') { setIsLoading(false); return; }

    try {
      if (!background) setIsLoading(true);
      const res = await API.get('players/me/');
      setPlayer(res.data);
      setError(null);
    } catch (err) {
      console.error('PlayerContext: failed to load player profile', err);
      setError('Failed to load player profile');
      setPlayer(null);
    } finally {
      if (!background) setIsLoading(false);
    }
  }, []);

  // ── Charger au montage + refetch au focus ─────────────────────────────────
  useEffect(() => {
    fetchPlayer();
    const handleFocus = () => fetchPlayer(true); // background refresh
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchPlayer]);

  const refreshPlayer = useCallback(async () => {
    await fetchPlayer();
  }, [fetchPlayer]);

  const updatePlayer = useCallback((newData) => {
    if (newData) setPlayer(newData);
  }, []);

  // ── Computed helpers ──────────────────────────────────────────────────────
  const playerName = player
    ? (
      player.full_name ||
      `${player.user?.first_name || ''} ${player.user?.last_name || ''}`.trim() ||
      player.user?.username ||
      'Player'
    )
    : '';

  const playerInitial = playerName?.charAt(0)?.toUpperCase() || 'P';

  // Standardized photoUrl logic: priority to profile_picture (absolute URL from backend)
  const photoUrl = player?.profile_picture 
    || player?.photo_url
    || (player?.photo
      ? player.photo.startsWith('http')
        ? player.photo
        : `http://127.0.0.1:8000${player.photo}`
      : null);

  return (
    <PlayerContext.Provider value={{
      player,
      isLoading,
      error,
      refreshPlayer,
      updatePlayer, // ✅ Added for immediate sync
      playerName,
      playerInitial,
      photoUrl,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};

export default PlayerContext;