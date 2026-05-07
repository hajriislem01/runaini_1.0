import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../pages/api';

const CoachSessionContext = createContext(null);

export const CoachSessionProvider = ({ children }) => {
  const [coachPhoto, setCoachPhoto]   = useState(null);   // absolute URL or null
  const [coachName,  setCoachName]    = useState('Coach');
  const [isReady,    setIsReady]      = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await API.get('coachprofile/');
      // Build full name — fall back to username or 'Coach'
      const full = [data.first_name, data.last_name].filter(Boolean).join(' ');
      setCoachName(full || data.username || 'Coach');
      setCoachPhoto(data.photo || null);   // API already returns absolute URL
    } catch {
      // Not authenticated or other error — silently ignore
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <CoachSessionContext.Provider value={{ coachPhoto, coachName, refresh, isReady }}>
      {children}
    </CoachSessionContext.Provider>
  );
};

export const useCoachSession = () => {
  const ctx = useContext(CoachSessionContext);
  if (!ctx) throw new Error('useCoachSession must be used inside <CoachSessionProvider>');
  return ctx;
};
