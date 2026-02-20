import React, { createContext, useContext, useState } from 'react';

const CoachContext = createContext();

export const CoachProvider = ({ children }) => {
  const [coach, setCoach] = useState({
    name: 'John Doe',
    email: 'coach@example.com',
    phone: '123-456-7890',
    location: 'Madrid, Spain',
    profilePicture: '',
    bio: 'Experienced coach passionate about player development.',
    philosophy: {
      development: 'Focus on individual growth through personalized training programs and continuous feedback.',
      tactical: 'Implement modern possession-based systems with high pressing and quick transitions.',
      mental: 'Build resilience and competitive mindset through psychological training techniques.',
      culture: 'Foster leadership, accountability and strong team cohesion through group activities.'
    },
    methodology: [
      'Technical drills: Position-specific exercises focusing on ball control, passing accuracy, and shooting technique.',
      'Tactical sessions: Video analysis and on-field scenarios to develop game intelligence and decision-making.',
      'Physical conditioning: Customized fitness programs targeting endurance, strength, and injury prevention.'
    ],
    experiences: [],
    certifications: []
  });

  const updateCoach = (updates) => {
    setCoach((prev) => ({ ...prev, ...updates }));
  };

  const changePassword = (newPassword) => {
    // Simulate password change
    return Promise.resolve('Password changed');
  };

  const setCoachData = (coachObj) => {
    setCoach(() => ({ ...coachObj }));
  };

  return (
    <CoachContext.Provider value={{ coach, updateCoach, changePassword, setCoach: setCoachData }}>
      {children}
    </CoachContext.Provider>
  );
};

export const useCoach = () => useContext(CoachContext); 