import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { AdminProvider } from './context/AdminContext';
import { PlayerProvider } from './context/PlayerContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// ── Pages publiques ────────────────────────────────────────────────────────────
import Home           from './pages/Home';
import SignupForm     from './pages/SignupForm';
import ForgotPassword from './pages/ForgotPassword';
import LoginForm      from './pages/LoginForm';
import NotFound       from './pages/NotFound';
import PricingPage    from './pages/PricingPage';

// ── Administration ─────────────────────────────────────────────────────────────
import AdministrationLayout    from './layouts/AdministrationLayout';
import AdministrationDashboard from './pages/administration/administrationdashboard/AdministrationDashboard';
import PlayerManagement        from './pages/administration/playermanagement/PlayerManagement';
import PlayerProfileDesktop    from './pages/administration/playermanagement/PlayerProfile';
import CoachManagement         from './pages/administration/coachmanagement/CoachManagement';
import AgendaManagement        from './pages/administration/agendamanagement/AgendaManagement';
import PaymentManagement       from './pages/administration/paymentmanagement/PaymentManagement';
import Settings                from './pages/administration/settings/Settings';
import Profile                 from './pages/administration/academyprofile/Profile';
import Contact                 from './pages/administration/contact/Contact';
import EventsManagement        from './pages/administration/eventsmanagement/EventsManagement';
import CreateEvent             from './pages/administration/eventsmanagement/CreateEvent';
import EventDetail             from './pages/administration/eventsmanagement/EventDetail';

// ── Coach ──────────────────────────────────────────────────────────────────────
import CoachLayout    from './layouts/CoachLayout';
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachPlayers   from './pages/coach/CoachPlayers';
import CoachMatches   from './pages/coach/CoachMatches';
import VideoAnalysis  from './pages/coach/VideoAnalysis';
import CreateTraining from './pages/coach/CreateTraining';
import CoachAgenda    from './pages/coach/CoachAgenda';
import CoachProfile   from './pages/coach/CoachProfile';
import CoachSettings  from './pages/coach/CoachSettings';
import CoachAnalysis  from './pages/coach/CoachAnalysis';

// ── Player ─────────────────────────────────────────────────────────────────────
import PlayerLayout     from './layouts/PlayerLayout';
import PlayersDashboard from './pages/players/PlayersDashboard';
import Training         from './pages/players/Training';
import Performance      from './pages/players/Performance';
import PlayerProfile    from './pages/players/PlayerProfile';
import PlayerSettings   from './pages/players/PlayerSettings';

// ── Layout wrapper ─────────────────────────────────────────────────────────────
function Layout({ children }) {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  const noLayoutPrefixes = [
    '/signup', '/login', '/forgot-password',
    '/administration', '/coach', '/players',
  ];
  const isFullScreen = noLayoutPrefixes.some(p => pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <ScrollToTop />
      {!isFullScreen && <Navbar />}
      <main className={`flex-grow ${(!isFullScreen && pathname !== '/') ? 'mt-16' : ''}`}>
        {children}
      </main>
      {!isFullScreen && <Footer />}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [events,  setEvents]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('events') || '[]'); }
    catch { return []; }
  });

  // Sync events
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'events') {
        try { setEvents(JSON.parse(e.newValue || '[]')); } catch {}
      }
    };
    const handleFocus = () => {
      try { setEvents(JSON.parse(localStorage.getItem('events') || '[]')); } catch {}
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  // Events CRUD
  const addEvent = (event) => {
    const newEvent = { ...event, id: Date.now().toString() };
    setEvents(prev => {
      const updated = [...prev, newEvent];
      localStorage.setItem('events', JSON.stringify(updated));
      return updated;
    });
  };
  const updateEvent = (updatedEvent) => {
    setEvents(prev => {
      const updated = prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
      localStorage.setItem('events', JSON.stringify(updated));
      return updated;
    });
  };
  const deleteEvent = (eventId) => {
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== eventId);
      localStorage.setItem('events', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ProfileProvider>
      <AdminProvider>
        <PlayerProvider>
          <Router>
            <Layout>
              <Routes>

                {/* ── Public ───────────────────────────────────────────── */}
                <Route path="*"                element={<NotFound />} />
                <Route path="/"                element={<Home />} />
                <Route path="/signup"          element={<SignupForm />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/pricing"         element={<PricingPage />} />
                <Route path="/login"           element={<LoginForm />} />
                <Route path="/logout"          element={<LogoutRedirect />} />

                {/* ── Administration (protégé admin) ────────────────────── */}
                <Route path="/administration" element={
                  <ProtectedRoute allowedRoles={['admin']} />
                }>
                  <Route element={<AdministrationLayout />}>
                    <Route index element={
                      <AdministrationDashboard players={players} coaches={coaches} events={events} />
                    }/>
                    <Route path="dashboard" element={
                      <AdministrationDashboard players={players} coaches={coaches} events={events} />
                    }/>
                    <Route path="profile"            element={<Profile />} />
                    <Route path="player-management"  element={
                      <PlayerManagement players={players} setPlayers={setPlayers} />
                    }/>
                    <Route path="player-profile/:id" element={<PlayerProfileDesktop />} />
                    <Route path="coach-management"   element={
                      <CoachManagement coaches={coaches} setCoaches={setCoaches} />
                    }/>
                    <Route path="events-management"  element={<EventsManagement />} />
                    <Route path="create-event"       element={<CreateEvent />} />
                    <Route path="event/:id"          element={<EventDetail />} />
                    <Route path="agenda-management"  element={
                      <AgendaManagement
                        events={events} addEvent={addEvent}
                        updateEvent={updateEvent} deleteEvent={deleteEvent}
                        players={players} coaches={coaches}
                      />
                    }/>
                    <Route path="payment-management" element={
                      <PaymentManagement players={players} />
                    }/>
                    <Route path="settings" element={<Settings />} />
                    <Route path="contact"  element={<Contact />} />
                  </Route>
                </Route>

                {/* ── Coach (protégé coach) ─────────────────────────────── */}
                <Route path="/coach" element={
                  <ProtectedRoute allowedRoles={['coach']} />
                }>
                  <Route element={<CoachLayout />}>
                    <Route index            element={<CoachDashboard />} />
                    <Route path="dashboard" element={<CoachDashboard />} />
                    <Route path="players"   element={<CoachPlayers />} />
                    <Route path="training"  element={<CreateTraining />} />
                    <Route path="agenda"    element={<CoachAgenda />} />
                    <Route path="matches"   element={<CoachMatches />} />
                    <Route path="profile"   element={<CoachProfile />} />
                    <Route path="settings"  element={<CoachSettings />} />
                    <Route path="analysis"  element={<CoachAnalysis />} />
                    <Route path="video/:id" element={<VideoAnalysis />} />
                  </Route>
                </Route>

                {/* ── Players (protégé player) ──────────────────────────── */}
                <Route path="/players" element={
                  <ProtectedRoute allowedRoles={['player']} />
                }>
                  <Route element={<PlayerLayout />}>
                    <Route index              element={<PlayersDashboard />} />
                    <Route path="training"    element={<Training />} />
                    <Route path="performance" element={<Performance />} />
                    <Route path="profile"     element={<PlayerProfile />} />
                    <Route path="settings"    element={<PlayerSettings />} />
                    <Route path="feedback"    element={<Navigate to="/players/performance" replace />} />
                    <Route path="analysis"    element={<Navigate to="/players/performance" replace />} />
                  </Route>
                </Route>

              </Routes>
            </Layout>
          </Router>
        </PlayerProvider>
      </AdminProvider>
    </ProfileProvider>
  );
}

// ── Logout ────────────────────────────────────────────────────────────────────
function LogoutRedirect() {
  useEffect(() => {
    localStorage.clear();
    window.location.replace('/login');
  }, []);
  return null;
}

export default App;