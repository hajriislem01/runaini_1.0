import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../pages/administration/api';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [player,    setPlayer]    = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  const fetchPlayer = useCallback(async () => {
    const stored = localStorage.getItem('user');
    if (!stored) { setIsLoading(false); return; }

    let userObj;
    try { userObj = JSON.parse(stored); } catch { setIsLoading(false); return; }

    if (userObj?.role !== 'player') { setIsLoading(false); return; }

    try {
      setIsLoading(true);
      const res = await API.get('players/me/');
      setPlayer(res.data);
      setError(null);
    } catch (err) {
      console.error('PlayerContext: failed to load player profile', err);
      setError('Failed to load player profile');
      setPlayer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Charger au montage + refetch au focus ─────────────────────────────────
  useEffect(() => {
    fetchPlayer();
    const handleFocus = () => fetchPlayer();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchPlayer]);

  const refreshPlayer = useCallback(async () => {
    await fetchPlayer();
  }, [fetchPlayer]);

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

  // ✅ Fix photo URL — priorité à photo_url (URL absolue retournée par le backend)
  // photo_url est construit par le serializer avec request.build_absolute_uri
  // photo est juste le chemin relatif (/media/player_photos/...)
  const photoUrl = player?.photo_url
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