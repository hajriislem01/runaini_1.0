import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { useAdminData } from '../context/AdminContext';

const Login = () => {
  const navigate    = useNavigate();
  const { refreshAdminData } = useAdminData();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [remember,  setRemember]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  // ── Si déjà connecté → redirect ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) {
      try {
        const u = JSON.parse(user);
        if (u.role === 'admin')  navigate('/administration/Dashboard', { replace:true });
        if (u.role === 'coach')  navigate('/coach/Dashboard',          { replace:true });
        if (u.role === 'player') navigate('/players',                  { replace:true });
      } catch {}
    }
  }, [navigate]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) { setError('Please fill in all fields'); return; }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) { setError('Please enter a valid email address'); return; }

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/login/', { email, password });
      const { token, user: userData } = res.data;

      if (!userData) { setError('Login successful but user data missing'); return; }

      // Sauvegarde
      localStorage.setItem('token',      token);
      localStorage.setItem('user',       JSON.stringify(userData));
      localStorage.setItem('role',       userData.role);
      localStorage.setItem('academy_id', userData.academy_id);

      // Remember me
      if (remember) localStorage.setItem('remember_email', email);
      else          localStorage.removeItem('remember_email');

      setSuccess('Login successful! Redirecting...');
      setEmail('');
      setPassword('');

      setTimeout(async () => {
        if (userData.role === 'admin') {
          await refreshAdminData();
          navigate('/administration/Dashboard', { replace:true });
        } else if (userData.role === 'coach') {
          navigate('/coach/Dashboard', { replace:true });
        } else {
          navigate('/players', { replace:true });
        }
      }, 800);

    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Remember me — pré-remplir email ──────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('remember_email');
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}>

      {/* Decorative bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{ background:'rgba(144,43,209,.08)' }}/>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background:'rgba(0,208,203,.06)' }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background:'radial-gradient(circle,rgba(144,43,209,.04) 0%,transparent 70%)' }}/>
      </div>

      <motion.div className="relative z-10 w-full max-w-md px-4"
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:.6, ease:'easeOut' }}>

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale:.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
            transition={{ delay:.1, duration:.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
            <span className="text-2xl font-black text-white">R</span>
          </motion.div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            RunAiNi
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Football Academy Management</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8"
          style={{ background:'rgba(15,23,42,.8)', borderColor:'rgba(51,65,85,.5)', backdropFilter:'blur(12px)' }}>

          <h2 className="text-xl font-bold text-white mb-6">Welcome back</h2>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="flex items-start gap-3 p-3.5 rounded-xl mb-4 text-sm"
                style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.25)', color:'#fca5a5' }}>
                <FiAlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="flex items-center gap-3 p-3.5 rounded-xl mb-4 text-sm"
                style={{ background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.25)', color:'#86efac' }}>
                <FiCheckCircle size={16} className="flex-shrink-0"/>
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                  style={{ background:'rgba(30,41,59,.6)', border:'1px solid rgba(51,65,85,.5)' }}
                  placeholder="your.email@example.com"
                  autoComplete="email"/>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">Password</label>
                <a href="/forgot-password"
                  className="text-xs text-[#4fb0ff] hover:text-[#00d0cb] transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                  style={{ background:'rgba(30,41,59,.6)', border:'1px solid rgba(51,65,85,.5)' }}
                  placeholder="Enter your password"
                  autoComplete="current-password"/>
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPwd ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-[#902bd1] cursor-pointer"/>
              <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Signing in...
                </>
              ) : 'Sign in'}
            </motion.button>
          </form>

          {/* Role indicators */}
          <div className="mt-6 pt-5 border-t border-gray-800">
            <p className="text-xs text-gray-600 text-center mb-3">Sign in as</p>
            <div className="flex gap-2 justify-center">
              {[
                { label:'Admin',  color:'#902bd1' },
                { label:'Coach',  color:'#4fb0ff' },
                { label:'Player', color:'#00d0cb' },
              ].map(r => (
                <span key={r.label} className="text-xs px-3 py-1 rounded-full"
                  style={{ background:r.color+'15', color:r.color, border:`1px solid ${r.color}25` }}>
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()} RunAiNi · Football Academy Management Platform
        </p>
      </motion.div>
    </div>
  );
};

export default Login;