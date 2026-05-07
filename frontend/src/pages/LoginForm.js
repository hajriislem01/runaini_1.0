import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye, FiEyeOff, FiMail, FiLock, FiArrowLeft,
  FiAlertCircle, FiCheckCircle, FiArrowRight,
} from 'react-icons/fi';
import axios from 'axios';
import { useAdminData } from '../context/AdminContext';

/* ── Brand tokens ──────────────────────────────────── */
const P = '#902bd1';   // purple
const B = '#4fb0ff';   // blue
const T = '#00d0cb';   // teal
const G = '#00f5ff';   // Cyber Cyan

/* ── Animated pitch SVG ────────────────────────────── */
const PitchLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
    <rect x="80" y="60" width="1040" height="680" fill="none" stroke="white" strokeWidth="2"/>
    <line x1="600" y1="60" x2="600" y2="740" stroke="white" strokeWidth="1.5"/>
    <circle cx="600" cy="400" r="110" fill="none" stroke="white" strokeWidth="1.5"/>
    <circle cx="600" cy="400" r="5" fill="white"/>
    <rect x="80" y="270" width="170" height="260" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="950" y="270" width="170" height="260" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="80" y="330" width="70" height="140" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="1050" y="330" width="70" height="140" fill="none" stroke="white" strokeWidth="1.5"/>
  </svg>
);


/* ── Gold-glow input ────────────────────────────────── */
const GoldInput = ({ label, icon: Icon, error, rightEl, ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = String(props.value || '').length > 0;
  return (
    <div className="relative">
      {/* Floating label */}
      <label className="absolute left-11 transition-all duration-200 pointer-events-none z-10 font-medium"
        style={{
          top: focused || hasValue ? '-9px' : '50%',
          transform: focused || hasValue ? 'translateY(0) scale(0.78)' : 'translateY(-50%)',
          transformOrigin: 'left',
          color: focused ? G : error ? '#f87171' : '#6b7280',
          fontSize: focused || hasValue ? '11px' : '14px',
          background: focused || hasValue ? 'rgba(10,15,42,1)' : 'transparent',
          padding: focused || hasValue ? '0 4px' : '0',
        }}>
        {label} <span style={{ color: '#f87171' }}>*</span>
      </label>
      {/* Icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
        style={{ color: focused ? G : error ? '#f87171' : '#4b5563' }}>
        <Icon size={16} />
      </div>
      <input {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className="w-full px-4 py-4 pl-11 bg-transparent rounded-xl text-white text-sm outline-none transition-all duration-300"
        style={{
          border: `1px solid ${focused ? G + 'aa' : error ? '#ef444455' : 'rgba(255,255,255,0.1)'}`,
          background: 'rgba(255,255,255,0.03)',
          boxShadow: focused ? `0 0 0 3px ${G}18, 0 0 20px ${G}10` : 'none',
        }}
      />
      {rightEl && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════ */
const Login = () => {
  const navigate = useNavigate();
  const { refreshAdminData } = useAdminData();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  /* ── Already logged in ──────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) {
      try {
        const u = JSON.parse(user);
        if (u.role === 'admin')  navigate('/administration/Dashboard', { replace: true });
        if (u.role === 'coach')  navigate('/coach/Dashboard',          { replace: true });
        if (u.role === 'player') navigate('/players',                  { replace: true });
      } catch {}
    }
  }, [navigate]);

  /* ── Remember me ────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem('remember_email');
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  /* ── Submit ─────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/login/', { email, password });
      const { token, user: userData } = res.data;
      if (!userData) { setError('Login successful but user data is missing.'); return; }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', userData.role);
      localStorage.setItem('academy_id', userData.academy_id);
      if (remember) localStorage.setItem('remember_email', email);
      else          localStorage.removeItem('remember_email');

      setSuccess('Access granted. Entering your workspace…');
      setEmail(''); setPassword('');

      setTimeout(async () => {
        if (userData.role === 'admin') {
          await refreshAdminData();
          navigate('/administration/Dashboard', { replace: true });
        } else if (userData.role === 'coach') {
          navigate('/coach/Dashboard', { replace: true });
        } else {
          navigate('/players', { replace: true });
        }
      }, 900);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 50%,#180033 100%)' }}>

      <PitchLines />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: `linear-gradient(rgba(201,168,76,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.6) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* Back link */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors group">
        <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4">

        {/* ── Card ────────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(10,15,42,0.7)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${G}30`,
            boxShadow: `0 0 60px ${P}15, 0 0 120px ${B}08`,
          }}>

          {/* Top accent bar */}
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${G},${T},transparent)` }} />

          <div className="px-8 py-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1 text-3xl font-extrabold mb-3">
                <span style={{ background:`linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>RUN</span>
                <span className="text-white">AI</span>
                <span style={{ color: T }}>NI</span>
              </div>
              <p className="text-sm text-gray-500">Elite Football Management Platform</p>
            </div>

            {/* Section title */}
            <div className="mb-6">
              <h1 className="text-xl font-extrabold text-white">Welcome back</h1>
              <p className="text-sm text-gray-500 mt-1">
                No account?{' '}
                <Link to="/signup" className="font-semibold transition-colors" style={{ color: G }}>
                  Create one free →
                </Link>
              </p>
            </div>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="err" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5' }}>
                  <FiAlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
                </motion.div>
              )}
              {success && (
                <motion.div key="ok" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background:`rgba(0,208,203,0.1)`, border:`1px solid ${T}40`, color: T }}>
                  <FiCheckCircle size={16} className="flex-shrink-0" />{success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <GoldInput
                label="Email address" icon={FiMail} type="email"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email" required
              />
              <GoldInput
                label="Password" icon={FiLock} type={showPwd ? 'text' : 'password'}
                value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password" required
                rightEl={
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="text-gray-500 hover:text-white transition-colors p-1">
                    {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div onClick={() => setRemember(!remember)}
                    className="w-4 h-4 rounded flex items-center justify-center transition-all"
                    style={{ background: remember ? G : 'rgba(255,255,255,0.06)', border: `1px solid ${remember ? G : 'rgba(255,255,255,0.15)'}` }}>
                    {remember && <FiCheckCircle size={10} className="text-black" />}
                  </div>
                  <span className="text-xs text-gray-500">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs transition-colors" style={{ color: G }}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={isLoading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-60"
                style={{ background: `linear-gradient(135deg,${P},${B})`, color: 'white',
                  boxShadow: isLoading ? 'none' : `0 0 30px ${P}40` }}>
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                ) : (
                  <> Enter Your Space <FiArrowRight size={15} /></>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />
              <span className="text-xs text-gray-600">OR CONTINUE WITH</span>
              <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Social (UI only) */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Google', icon: (
                  <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                )},
                { label: 'Apple', icon: (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                )},
              ].map(s => (
                <motion.button key={s.label} type="button" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-300 transition-all"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  {s.icon} {s.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="h-px w-full" style={{ background:`linear-gradient(90deg,transparent,${P},${T},transparent)` }} />
        </div>

        <p className="text-center text-xs text-gray-700 mt-6 uppercase tracking-widest">
          © {new Date().getFullYear()} RunAiNi · Elite Football Management
        </p>
      </motion.div>
    </div>
  );
};

export default Login;