import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiPhone, FiArrowLeft, FiArrowRight,
  FiCheck, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff,
  FiHome, FiShield,
} from 'react-icons/fi';
import { API_NO_AUTH } from './api';

/* ── Brand ─────────────────────────────────────────── */
const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const G = '#00f5ff'; // Cyber Cyan

/* ── Pitch SVG backdrop ─────────────────────────────── */
const PitchLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04]"
    viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
    <rect x="80" y="60" width="1040" height="680" fill="none" stroke="white" strokeWidth="2"/>
    <line x1="600" y1="60" x2="600" y2="740" stroke="white" strokeWidth="1.5"/>
    <circle cx="600" cy="400" r="110" fill="none" stroke="white" strokeWidth="1.5"/>
    <circle cx="600" cy="400" r="5" fill="white"/>
    <rect x="80" y="270" width="170" height="260" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="950" y="270" width="170" height="260" fill="none" stroke="white" strokeWidth="1.5"/>
  </svg>
);

/* ── Gold floating-label input ─────────────────────── */
const GoldInput = ({ label, icon: Icon, rightEl, inputRef, ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = String(props.value || '').length > 0;
  return (
    <div className="relative">
      <label
        className="absolute left-11 transition-all duration-200 pointer-events-none z-10 font-medium"
        style={{
          top: focused || hasValue ? '-9px' : '50%',
          transform: focused || hasValue ? 'translateY(0) scale(0.78)' : 'translateY(-50%)',
          transformOrigin: 'left',
          color: focused ? G : '#6b7280',
          fontSize: focused || hasValue ? '11px' : '14px',
          background: focused || hasValue ? 'rgba(10,15,42,1)' : 'transparent',
          padding: focused || hasValue ? '0 4px' : '0',
        }}>
        {label} <span style={{ color: '#f87171' }}>*</span>
      </label>

      {/* Leading icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
        style={{ color: focused ? G : '#4b5563' }}>
        <Icon size={15} />
      </div>

      <input
        ref={inputRef}
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className="w-full px-4 py-4 pl-11 bg-transparent rounded-xl text-white text-sm outline-none transition-all duration-300"
        style={{
          border: `1px solid ${focused ? G + 'aa' : 'rgba(255,255,255,0.08)'}`,
          background: 'rgba(255,255,255,0.03)',
          boxShadow: focused ? `0 0 0 3px ${G}18, 0 0 20px ${G}08` : 'none',
        }}
      />

      {rightEl && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>
      )}
    </div>
  );
};

/* ── Phone input with +216 prefix ──────────────────── */
const PhoneInput = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = String(value || '').length > 0;
  return (
    <div className="relative">
      {/* Floating label */}
      <label
        className="absolute transition-all duration-200 pointer-events-none z-10 font-medium"
        style={{
          left: focused || hasValue ? '12px' : '100px',
          top: focused || hasValue ? '-9px' : '50%',
          transform: focused || hasValue ? 'translateY(0) scale(0.78)' : 'translateY(-50%)',
          transformOrigin: 'left',
          color: focused ? G : '#6b7280',
          fontSize: focused || hasValue ? '11px' : '14px',
          background: focused || hasValue ? 'rgba(10,15,42,1)' : 'transparent',
          padding: focused || hasValue ? '0 4px' : '0',
        }}>
        Phone <span style={{ color: '#f87171' }}>*</span>
      </label>

      {/* +216 prefix block */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-3.5 pr-3 border-r"
        style={{ borderColor: focused ? G + '60' : 'rgba(255,255,255,0.08)' }}>
        <FiPhone size={14} style={{ color: focused ? G : '#4b5563', marginRight: 6 }} />
        <span className="text-xs font-bold text-gray-500">+216</span>
      </div>

      <input
        type="tel"
        value={value}
        onChange={onChange}
        pattern="\d{8}"
        maxLength={8}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full py-4 bg-transparent rounded-xl text-white text-sm outline-none transition-all duration-300"
        style={{
          paddingLeft: '88px',
          paddingRight: '16px',
          border: `1px solid ${focused ? G + 'aa' : 'rgba(255,255,255,0.08)'}`,
          background: 'rgba(255,255,255,0.03)',
          boxShadow: focused ? `0 0 0 3px ${G}18, 0 0 20px ${G}08` : 'none',
        }}
        required
      />
    </div>
  );
};

/* ── Step indicator ─────────────────────────────────── */
const StepDot = ({ step, current, label }) => {
  const done   = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-400"
        style={{
          background: done ? T : active ? `linear-gradient(135deg,${P},${B})` : 'rgba(255,255,255,0.06)',
          border: `1px solid ${done ? T : active ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
          color: done || active ? 'white' : '#6b7280',
          boxShadow: active ? `0 0 18px ${P}55` : 'none',
        }}>
        {done ? <FiCheck size={13} /> : step}
      </div>
      <span className="text-[10px] font-semibold hidden sm:block"
        style={{ color: active ? G : done ? T : '#6b7280' }}>
        {label}
      </span>
    </div>
  );
};

const StepLine = ({ done }) => (
  <div className="flex-1 h-px mx-2 mt-[-14px] transition-all duration-500"
    style={{ background: done ? `linear-gradient(90deg,${T},${B})` : 'rgba(255,255,255,0.07)' }} />
);

/* ════════════════════════════════════════════════════ */
const SignupForm = () => {
  const navigate = useNavigate();

  const [step, setStep]           = useState(1);
  const [showPwd, setShowPwd]     = useState(false);
  const [showPwd2, setShowPwd2]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
    club: '', phone: '', academy_name: '',
  });

  const set = field => e => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  /* ── Per-step validation ────────────────────────── */
  const validate = () => {
    if (step === 1) {
      if (!formData.firstName.trim()) { setError('First name is required.'); return false; }
      if (!formData.lastName.trim())  { setError('Last name is required.');  return false; }
    }
    if (step === 2) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address.'); return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters.'); return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.'); return false;
      }
    }
    if (step === 3) {
      if (!formData.academy_name.trim()) { setError('Academy name is required.'); return false; }
      if (!/^\d{8}$/.test(formData.phone)) {
        setError('Phone must be exactly 8 digits (no spaces).'); return false;
      }
    }
    return true;
  };

  const nextStep = () => { if (validate()) { setError(''); setStep(s => s + 1); } };
  const prevStep = () => { setError(''); setStep(s => s - 1); };

  /* ── Submit ─────────────────────────────────────── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await API_NO_AUTH.post('/signup/', {
        username:      formData.email,
        email:         formData.email,
        password:      formData.password,
        first_name:    formData.firstName,
        last_name:     formData.lastName,
        role:          'admin',
        club:          formData.club,
        phone:         formData.phone,
        academy_name:  formData.academy_name,
      });
      setSuccess('Academy created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'string' ? data :
        data?.detail || JSON.stringify(data) || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step definitions ───────────────────────────── */
  const STEPS = [
    {
      key: 'identity', label: 'Identity', icon: FiUser,
      fields: (
        <div className="space-y-4">
          <p className="text-xs text-gray-600 mb-2">Who will be the primary admin?</p>
          <div className="grid grid-cols-2 gap-3">
            <GoldInput label="First Name" icon={FiUser} type="text"
              value={formData.firstName} onChange={set('firstName')}
              autoComplete="given-name" required />
            <GoldInput label="Last Name" icon={FiUser} type="text"
              value={formData.lastName} onChange={set('lastName')}
              autoComplete="family-name" required />
          </div>
        </div>
      ),
    },
    {
      key: 'credentials', label: 'Credentials', icon: FiLock,
      fields: (
        <div className="space-y-4">
          <p className="text-xs text-gray-600 mb-2">Your secure login details</p>
          <GoldInput label="Email" icon={FiMail} type="email"
            value={formData.email} onChange={set('email')}
            autoComplete="email" required />
          <GoldInput label="Password (min. 8 chars)" icon={FiLock}
            type={showPwd ? 'text' : 'password'}
            value={formData.password} onChange={set('password')}
            autoComplete="new-password" required
            rightEl={
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="text-gray-500 hover:text-white transition-colors p-1">
                {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            } />
          <GoldInput label="Confirm Password" icon={FiLock}
            type={showPwd2 ? 'text' : 'password'}
            value={formData.confirmPassword} onChange={set('confirmPassword')}
            autoComplete="new-password" required
            rightEl={
              <button type="button" onClick={() => setShowPwd2(v => !v)}
                className="text-gray-500 hover:text-white transition-colors p-1">
                {showPwd2 ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            } />
        </div>
      ),
    },
    {
      key: 'academy', label: 'Academy', icon: FiShield,
      fields: (
        <div className="space-y-4">
          <p className="text-xs text-gray-600 mb-2">Your organization details</p>
          <GoldInput label="Academy Name" icon={FiShield} type="text"
            value={formData.academy_name} onChange={set('academy_name')} required />
          <GoldInput label="Club / Company (optional)" icon={FiHome} type="text"
            value={formData.club} onChange={set('club')} />
          <PhoneInput value={formData.phone}
            onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); setError(''); }} />
        </div>
      ),
    },
  ];

  const isLast = step === STEPS.length;
  const curStep = STEPS[step - 1];

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-12"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 50%,#180033 100%)' }}>

      <PitchLines />

      {/* Gold grid */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.6) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(201,168,76,0.6) 1px,transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

      {/* Back link */}
      <Link to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-sm text-gray-600 hover:text-white transition-colors group">
        <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4">

        {/* ── Glass card ──────────────────────────────── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(10,15,42,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${G}28`,
            boxShadow: `0 0 60px ${P}12, 0 0 120px ${B}06`,
          }}>

          {/* Top accent */}
          <div className="h-px w-full"
            style={{ background: `linear-gradient(90deg,transparent,${G},${T},transparent)` }} />

          <div className="px-8 py-9">

            {/* Logo */}
            <div className="text-center mb-7">
              <Link to="/" className="inline-flex items-center gap-0.5 text-3xl font-extrabold mb-2">
                <span style={{ background: `linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RUN</span>
                <span className="text-white">AI</span>
                <span style={{ color: T }}>NI</span>
              </Link>
              <p className="text-xs text-gray-600 mt-1">Launch your elite academy workspace</p>
            </div>

            {/* Step tracker */}
            <div className="flex items-center mb-8">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.key}>
                  <StepDot step={i + 1} current={step} label={s.label} />
                  {i < STEPS.length - 1 && <StepLine done={step > i + 1} />}
                </React.Fragment>
              ))}
            </div>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="err"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <FiAlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div key="ok"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background: `rgba(0,208,203,0.1)`, border: `1px solid ${T}40`, color: T }}>
                  <FiCheckCircle size={15} className="flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form with slide-across transition */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}>

                  {/* Step header */}
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${G}20`, border: `1px solid ${G}40` }}>
                      <curStep.icon size={13} style={{ color: G }} />
                    </div>
                    <h2 className="font-extrabold text-white text-sm tracking-wide">
                      {curStep.label}
                    </h2>
                    <span className="ml-auto text-xs text-gray-600">{step} / {STEPS.length}</span>
                  </div>

                  {curStep.fields}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-3 mt-7">
                {step > 1 && (
                  <motion.button type="button" onClick={prevStep}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-gray-400 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                    <FiArrowLeft className="inline mr-1" size={13} /> Back
                  </motion.button>
                )}

                {!isLast ? (
                  <motion.button type="button" onClick={nextStep}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg,${P},${B})`,
                      boxShadow: `0 0 24px ${P}35`,
                    }}>
                    Continue <FiArrowRight className="inline ml-1" size={13} />
                  </motion.button>
                ) : (
                  <motion.button type="submit" disabled={isLoading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{
                      background: `linear-gradient(135deg,${P},${T})`,
                      boxShadow: `0 0 28px ${P}35`,
                    }}>
                    {isLoading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
                      : <>Launch Academy <FiArrowRight size={14} /></>
                    }
                  </motion.button>
                )}
              </div>
            </form>

            {/* Footer links */}
            <p className="text-center text-xs text-gray-600 mt-6">
              Already have an academy?{' '}
              <Link to="/login" className="font-semibold" style={{ color: G }}>
                Sign in →
              </Link>
            </p>
            <p className="text-center text-[10px] text-gray-700 mt-3">
              By continuing you agree to our{' '}
              <a href="#" className="underline">Terms</a> &amp;{' '}
              <a href="#" className="underline">Privacy Policy</a>
            </p>
          </div>

          {/* Bottom accent */}
          <div className="h-px w-full"
            style={{ background: `linear-gradient(90deg,transparent,${P},${T},transparent)` }} />
        </div>

        <p className="text-center text-xs text-gray-700 mt-6 uppercase tracking-widest">
          © {new Date().getFullYear()} RunAiNi · Elite Football Management
        </p>
      </motion.div>
    </div>
  );
};

export default SignupForm;
