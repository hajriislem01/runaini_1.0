import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

const samplePlayer = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1234567890',
  location: 'Barcelona, Spain',
  profilePicture: '',
  bio: 'Aspiring midfielder with a passion for teamwork and tactical play.',
  philosophy: {
    development: 'Always strive to improve and learn from every session.',
    tactical: 'Play smart, keep possession, and exploit spaces.',
    mental: 'Stay positive and resilient, even under pressure.',
    culture: 'Support teammates and build a winning spirit.'
  },
  methodology: [
    'Daily technical drills and ball mastery.',
    'Tactical video analysis and match review.',
    'Strength and conditioning routines.'
  ],
  experiences: [
    {
      role: 'Midfielder',
      club: 'Barcelona Youth',
      period: '2022-2024',
      description: 'Key playmaker and team captain.'
    }
  ],
  certifications: [
    { name: 'UEFA Youth Training', year: '2023' }
  ]
};

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(samplePlayer);

  const updatePlayer = (updated) => {
    setPlayer(updated);
    localStorage.setItem('player', JSON.stringify(updated));
  };

  return (
    <PlayerContext.Provider value={{ player, updatePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext); 