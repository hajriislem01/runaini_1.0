import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { CoachProvider } from './context/CoachContext';
import { PlayerProvider } from './context/PlayerContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignupForm from './pages/SignupForm';
import ForgotPassword from './pages/ForgotPassword';
import LoginForm from './pages/LoginForm';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';
import PricingPage from './pages/PricingPage';

import AdministrationLayout from './layouts/AdministrationLayout';
import AdministrationDashboard from './pages/administration/AdministrationDashboard';
import PlayerManagement from './pages/administration/PlayerManagement';
import CoachManagement from './pages/administration/CoachManagement';
import AgendaManagement from './pages/administration/AgendaManagement';
import PaymentManagement from './pages/administration/PaymentManagement';
import Settings from './pages/administration/Settings';
import Profile from './pages/administration/Profile';
import Contact from './pages/administration/Contact';
import EventsManagement from './pages/administration/EventsManagement';
import CreateEvent from './pages/administration/CreateEvent';
import EventDetail from './pages/administration/EventDetail'; // ✅ nouveau

import CoachLayout from './layouts/CoachLayout';
import CoachPlayers from './pages/coach/CoachPlayers';
import CoachMatches from './pages/coach/CoachMatches';
import VideoAnalysis from './pages/coach/VideoAnalysis';
import CreateTraining from './pages/coach/CreateTraining';
import CoachAgenda from './pages/coach/CoachAgenda';
import CoachProfile from './pages/coach/CoachProfile';
import CoachSettings from './pages/coach/CoachSettings';
import CoachDashboard from './pages/coach/CoachDashboard';

import PlayerLayout from './layouts/PlayerLayout';
import PlayersDashboard from './pages/players/PlayersDashboard';
import Training from './pages/players/Training';
import Performance from './pages/players/Performance';
import Analysis from './pages/players/Analysis';
import Feedback from './pages/players/Feedback';
import PlayerProfile from './pages/players/PlayerProfile';
import PlayerSettings from './pages/players/PlayerSettings';

function Layout({ children }) {
  const location = useLocation();

  const noLayoutRoutes = [
    '/signup', '/login', '/forgot-password',
    '/administration',
    '/administration/player-management',
    '/administration/coach-management',
    '/administration/agenda-management',
    '/administration/payment-management',
    '/administration/settings',
    '/administration/profile',
    '/administration/Profile',
    '/administration/contact',
    '/administration/events-management',
    '/administration/create-event',
    '/administration/dashboard',
    '/coach', '/coach/dashboard', '/coach/players', '/coach/training',
    '/coach/matches', '/coach/settings', '/coach/agenda',
    '/coach/create-training', '/coach/profile', '/coach/CoachMatches',
    '/players', '/players/training', '/players/performance',
    '/players/analysis', '/players/feedback', '/players/profile', '/players/settings',
  ];

  // ✅ Gère les routes dynamiques
  const isDynamicNoLayout =
    location.pathname.startsWith('/administration/event/') ||
    location.pathname.startsWith('/coach/video/');

  const isFullScreen = noLayoutRoutes.includes(location.pathname) || isDynamicNoLayout;

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isFullScreen && <Navbar />}
      <main className={`flex-grow ${!isFullScreen ? 'mt-16' : ''}`}>
        {children}
      </main>
      {!isFullScreen && <Footer />}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('events');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  const [notifications, setNotifications] = useState([]);
  const [groups, setGroups] = useState(() => {
    const savedGroups = localStorage.getItem('playerGroups');
    return savedGroups ? JSON.parse(savedGroups) : [];
  });

  const groupsWithSubgroups = useMemo(() => {
    const groupsMap = new Map();
    players.forEach(player => {
      if (player?.groupId) {
        if (!groupsMap.has(player.groupId)) {
          groupsMap.set(player.groupId, {
            id: player.groupId,
            name: player.group,
            subgroups: new Map()
          });
        }
        if (player?.subgroupId) {
          const group = groupsMap.get(player.groupId);
          if (!group.subgroups.has(player.subgroupId)) {
            group.subgroups.set(player.subgroupId, {
              id: player.subgroupId,
              name: player.subgroup
            });
          }
        }
      }
    });
    return Array.from(groupsMap.values()).map(group => ({
      ...group,
      subgroups: Array.from(group.subgroups.values())
    }));
  }, [players]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);

    const storedEvents = JSON.parse(localStorage.getItem('events')) || [];
    setEvents(storedEvents);

    const sampleGroups = [
      { id: 'group-a', name: 'Group A', subgroups: [{ id: 'subgroup-1', name: 'Subgroup 1' }, { id: 'subgroup-2', name: 'Subgroup 2' }] },
      { id: 'group-b', name: 'Group B', subgroups: [{ id: 'subgroup-2', name: 'Subgroup 2' }] }
    ];
    setGroups(sampleGroups);
    localStorage.setItem('playerGroups', JSON.stringify(sampleGroups));
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'events') {
        setEvents(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const storedEvents = JSON.parse(localStorage.getItem('events')) || [];
      setEvents(storedEvents);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('academy_id');
    localStorage.removeItem('role');
    setUser(null);
  };

  const addEvent = (event) => {
    const newEvent = { ...event, id: Date.now().toString() };
    setEvents(prev => {
      const updatedEvents = [...prev, newEvent];
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return updatedEvents;
    });
  };

  const updateEvent = (updatedEvent) => {
    setEvents(prev => {
      const updatedEvents = prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return updatedEvents;
    });
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => {
      const updatedEvents = prev.filter(e => e.id !== eventId);
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return updatedEvents;
    });
  };

  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('playerGroups', JSON.stringify(groups));
  }, [groups]);

  return (
    <ProfileProvider>
      <CoachProvider>
        <PlayerProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="*" element={<NotFound />} />
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/logout" element={<LoginForm onLogout={handleLogout} />} />
                <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />

                <Route path="/administration" element={<AdministrationLayout />}>
                  <Route index element={<AdministrationDashboard players={players} coaches={coaches} events={events} />} />
                  <Route path="dashboard" element={<AdministrationDashboard players={players} coaches={coaches} events={events} />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="Profile" element={<Profile />} />
                  <Route path="player-management" element={<PlayerManagement players={players} setPlayers={setPlayers} groups={groups} setGroups={setGroups} />} />
                  <Route path="coach-management" element={<CoachManagement coaches={coaches} setCoaches={setCoaches} groups={groups} />} />
                  <Route path="events-management" element={<EventsManagement />} />
                  <Route path="create-event" element={<CreateEvent />} />
                  <Route path="event/:id" element={<EventDetail />} /> {/* ✅ nouveau */}
                  <Route path="agenda-management" element={<AgendaManagement events={events} addEvent={addEvent} updateEvent={updateEvent} deleteEvent={deleteEvent} players={players} coaches={coaches} />} />
                  <Route path="payment-management" element={<PaymentManagement players={players} groups={groupsWithSubgroups} />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="contact" element={<Contact />} />
                </Route>

                <Route path="/coach" element={<CoachLayout />}>
                  <Route index element={<CoachDashboard />} />
                  <Route path="dashboard" element={<CoachDashboard />} />
                  <Route path="players" element={<CoachPlayers />} />
                  <Route path="training" element={<CreateTraining />} />
                  <Route path="agenda" element={<CoachAgenda />} />
                  <Route path="matches" element={<CoachMatches />} />
                  <Route path="profile" element={<CoachProfile />} />
                  <Route path="settings" element={<CoachSettings />} />
                </Route>
                <Route path="/coach/video/:id" element={<VideoAnalysis />} />

                <Route path="/players" element={<PlayerLayout />}>
                  <Route index element={<PlayersDashboard />} />
                  <Route path="training" element={<Training />} />
                  <Route path="performance" element={<Performance />} />
                  <Route path="analysis" element={<Analysis />} />
                  <Route path="feedback" element={<Feedback />} />
                  <Route path="profile" element={<PlayerProfile />} />
                  <Route path="settings" element={<PlayerSettings />} />
                </Route>
              </Routes>
            </Layout>
          </Router>
        </PlayerProvider>
      </CoachProvider>
    </ProfileProvider>
  );
}

export default App;