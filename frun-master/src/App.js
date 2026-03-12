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
import CoachLayout from './layouts/CoachLayout';
import CoachPlayers from './pages/coach/CoachPlayers';
import CoachMatches from './pages/coach/CoachMatches';
import VideoAnalysis from './pages/coach/VideoAnalysis';
import CreateTraining from './pages/coach/CreateTraining';
import CoachAgenda from './pages/coach/CoachAgenda';
import CoachProfile from './pages/coach/CoachProfile';
import CoachSettings from './pages/coach/CoachSettings';
import PlayerLayout from './layouts/PlayerLayout';
import PlayersDashboard from './pages/players/PlayersDashboard';
import Training from './pages/players/Training';
import Performance from './pages/players/Performance';
import Analysis from './pages/players/Analysis';
import Feedback from './pages/players/Feedback';
import PlayerProfile from './pages/players/PlayerProfile';
import PlayerSettings from './pages/players/PlayerSettings';
import CoachDashboard from './pages/coach/CoachDashboard';

function Layout({ children }) {
  const location = useLocation();
  const noLayoutRoutes = ['/signup', '/login', '/forgot-password', '/administration',
    '/administration/player-management', '/administration/coach-management',
    '/administration/agenda-management', '/administration/payment-management',
    '/administration/settings', '/administration/profile', '/administration/Profile', '/administration/contact',
    '/administration/events-management', '/administration/create-event',
    '/coach', '/coach/dashboard', '/coach/players', '/coach/training', '/coach/matches', '/coach/settings',
    '/coach/agenda', '/coach/create-training', '/coach/profile',
    '/coach/CoachMatches', '/players' , '/players/training', '/players/performance',
    '/players/analysis', '/players/feedback', '/players/profile', '/players/settings', '/coach/dashboard',
    '/administration/dashboard',  
    `/coach/video/${window.location.pathname.split('/').pop()}`
  ];

  const isFullScreen = noLayoutRoutes.includes(location.pathname);

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

  // Extract unique groups and subgroups from players with IDs
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

    // Convert Map to array and convert subgroups Map to array
    return Array.from(groupsMap.values()).map(group => ({
      ...group,
      subgroups: Array.from(group.subgroups.values())
    }));
  }, [players]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    // Load events from localStorage
    const storedEvents = JSON.parse(localStorage.getItem('events')) || [];
    setEvents(storedEvents);

    // Load sample data (replace with API calls in real app)
    setPlayers([
      { 
        id: 'p1', 
        name: 'Player 1', 
        groupId: 'group-a', 
        group: 'Group A',
        subgroupId: 'subgroup-1',
        subgroup: 'Subgroup 1',
        email: 'player1@example.com',
        status: 'Active'
      },
      { 
        id: 'p2', 
        name: 'Player 2', 
        groupId: 'group-b', 
        group: 'Group B',
        subgroupId: 'subgroup-2',
        subgroup: 'Subgroup 2',
        email: 'player2@example.com',
        status: 'Active'
      },
      { 
        id: 'p3', 
        name: 'Player 3', 
        groupId: 'group-a', 
        group: 'Group A',
        subgroupId: 'subgroup-1',
        subgroup: 'Subgroup 1',
        email: 'player3@example.com',
        status: 'Active'
      },
      { 
        id: 'p4', 
        name: 'Player 4', 
        groupId: 'group-a', 
        group: 'Group A',
        subgroupId: 'subgroup-2',
        subgroup: 'Subgroup 2',
        email: 'player4@example.com',
        status: 'Active'
      },
    ]);

    // Load sample groups
    const sampleGroups = [
      {
        id: 'group-a',
        name: 'Group A',
        subgroups: [
          { id: 'subgroup-1', name: 'Subgroup 1' },
          { id: 'subgroup-2', name: 'Subgroup 2' }
        ]
      },
      {
        id: 'group-b',
        name: 'Group B',
        subgroups: [
          { id: 'subgroup-2', name: 'Subgroup 2' }
        ]
      }
    ];
    setGroups(sampleGroups);
    localStorage.setItem('playerGroups', JSON.stringify(sampleGroups));

    // Coaches will be fetched from backend when needed. Sample data removed.
  }, []);

  // Listen for localStorage changes to sync events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'events') {
        const newEvents = JSON.parse(e.newValue || '[]');
        setEvents(newEvents);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Also sync events when window regains focus (for same-tab updates)
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
    setUser(null);
  };

  // Notification function
  const sendNotifications = (event) => {
    const newNotifications = [];

    // Notify coach
    const coach = coaches.find(c => c.id === event.coachId);
    if (coach) {
      newNotifications.push({
        id: Date.now().toString(),
        type: 'coach',
        recipientId: coach.id,
        recipientName: coach.name,
        eventId: event.id,
        eventTitle: event.title,
        message: `You have been assigned to ${event.title} on ${new Date(event.date).toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Notify players in the selected group
    if (event.group) {
      const playersInGroup = players.filter(p => p.group === event.group);
      if (event.subgroup) {
        // If subgroup is specified, only notify players in that subgroup
        playersInGroup.filter(p => p.subgroup === event.subgroup).forEach(player => {
          newNotifications.push({
            id: Date.now().toString() + player.id,
            type: 'player',
            recipientId: player.id,
            recipientName: player.name,
            eventId: event.id,
            eventTitle: event.title,
            message: `You have been invited to ${event.title} on ${new Date(event.date).toLocaleDateString()}`,
            timestamp: new Date().toISOString(),
            read: false
          });
        });
      } else {
        // If no subgroup is specified, notify all players in the group
        playersInGroup.forEach(player => {
          newNotifications.push({
            id: Date.now().toString() + player.id,
            type: 'player',
            recipientId: player.id,
            recipientName: player.name,
            eventId: event.id,
            eventTitle: event.title,
            message: `You have been invited to ${event.title} on ${new Date(event.date).toLocaleDateString()}`,
            timestamp: new Date().toISOString(),
            read: false
          });
        });
      }
    }

    setNotifications(prev => [...prev, ...newNotifications]);

    // In a real app, you would send these notifications to your backend
    // which would then send emails/push notifications to the recipients
    console.log('New notifications:', newNotifications);
  };

  // Add event handler with notifications
  const addEvent = (event) => {
    const newEvent = { ...event, id: Date.now().toString() };
    setEvents(prev => {
      const updatedEvents = [...prev, newEvent];
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return updatedEvents;
    });
    sendNotifications(newEvent);
  };

  // Update event handler
  const updateEvent = (updatedEvent) => {
    setEvents(prev => {
      const updatedEvents = prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return updatedEvents;
    });
    sendNotifications(updatedEvent);
  };

  // Delete event handler
  const deleteEvent = (eventId) => {
    setEvents(prev => {
      const updatedEvents = prev.filter(event => event.id !== eventId);
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return updatedEvents;
    });
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  // Get subgroups for a group
  const getSubgroupsForGroup = (groupId) => {
    if (!groupId || !groups) return [];
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.subgroups) return [];
    return group.subgroups.map(subgroup => ({
      id: subgroup.id || subgroup,
      name: subgroup.name || subgroup
    }));
  };

  // Always sync players and groups to localStorage when they change
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
                  <Route 
                    index
                    element={
                      <AdministrationDashboard 
                        players={players}
                        coaches={coaches}
                        events={events}
                      />
                    } 
                  />
                  <Route 
                    path="dashboard" 
                    element={
                      <AdministrationDashboard 
                        players={players}
                        coaches={coaches}
                        events={events}
                      />
                    } 
                  />                  <Route 
                    path="profile" 
                    element={<Profile />} 
                  />
                  <Route 
                    path="player-management" 
                    element={
                      <PlayerManagement 
                        players={players} 
                        setPlayers={setPlayers}
                        groups={groups}
                        setGroups={setGroups}
                      />
                    } 
                  />
                  <Route 
                    path="coach-management" 
                    element={<CoachManagement coaches={coaches} setCoaches={setCoaches} groups={groups} />} 
                  />
                  <Route 
                    path="events-management" 
                    element={
                      <EventsManagement 
                        events={events}
                        addEvent={addEvent}
                        updateEvent={updateEvent}
                        deleteEvent={deleteEvent}
                        groups={groups}
                      />
                    } 
                  />
                  <Route
                    path="create-event"
                    element={
                      <CreateEvent
                        groups={groups}
                        addEvent={addEvent}
                      />
                    }
                  />
                  <Route 
                    path="agenda-management" 
                    element={
                      <AgendaManagement 
                        events={events} 
                        addEvent={addEvent}
                        updateEvent={updateEvent}
                        deleteEvent={deleteEvent}
                        players={players}
                        coaches={coaches}
                      />
                    } 
                  />
                  <Route 
                    path="payment-management" 
                    element={<PaymentManagement players={players} groups={groupsWithSubgroups} />} 
                  />
                  <Route 
                    path="settings" 
                    element={<Settings />} 
                  />
                  <Route 
                    path="contact" 
                    element={<Contact />} 
                  />
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