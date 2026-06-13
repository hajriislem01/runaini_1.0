import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiArrowLeft, FiSend,
  FiAlertCircle, FiCheckCircle, FiHome,
} from 'react-icons/fi';
import { API_NO_AUTH } from './api';
import { useTranslation } from 'react-i18next';

const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const G = '#00f5ff';

const PitchLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04]"
    viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
    <rect x="80" y="60" width="1040" height="680" fill="none" stroke="white" strokeWidth="2" />
    <line x1="600" y1="60" x2="600" y2="740" stroke="white" strokeWidth="1.5" />
    <circle cx="600" cy="400" r="110" fill="none" stroke="white" strokeWidth="1.5" />
    <circle cx="600" cy="400" r="5" fill="white" />
    <rect x="80" y="270" width="170" height="260" fill="none" stroke="white" strokeWidth="1.5" />
    <rect x="950" y="270" width="170" height="260" fill="none" stroke="white" strokeWidth="1.5" />
  </svg>
);

const GoldInput = ({ label, icon: Icon, rightEl, ...props }) => {
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
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" style={{ color: focused ? G : '#4b5563' }}>
        <Icon size={15} />
      </div>
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className="w-full px-4 py-4 pl-11 bg-transparent rounded-xl text-white text-sm outline-none transition-all duration-300"
        style={{
          border: `1px solid ${focused ? `${G}aa` : 'rgba(255,255,255,0.08)'}`,
          background: 'rgba(255,255,255,0.03)',
          boxShadow: focused ? `0 0 0 3px ${G}18, 0 0 20px ${G}08` : 'none',
        }}
      />
      {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>}
    </div>
  );
};

const PhoneInput = ({ value, onChange }) => {
  const { t } = useTranslation('auth');
  const [focused, setFocused] = useState(false);
  const hasValue = String(value || '').length > 0;
  return (
    <div className="relative">
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
        {t('phone')} <span style={{ color: '#f87171' }}>*</span>
      </label>
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-3.5 pr-3 border-r"
        style={{ borderColor: focused ? `${G}60` : 'rgba(255,255,255,0.08)' }}
      >
        <FiPhone size={14} style={{ color: focused ? G : '#4b5563', marginRight: 6 }} />
        <span className="text-xs font-bold text-gray-500">+216</span>
      </div>
      <input
        type="tel"
        value={value}
        onChange={onChange}
        maxLength={8}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full py-4 bg-transparent rounded-xl text-white text-sm outline-none transition-all duration-300"
        style={{
          paddingLeft: '88px',
          paddingRight: '16px',
          border: `1px solid ${focused ? `${G}aa` : 'rgba(255,255,255,0.08)'}`,
          background: 'rgba(255,255,255,0.03)',
          boxShadow: focused ? `0 0 0 3px ${G}18, 0 0 20px ${G}08` : 'none',
        }}
        required
      />
    </div>
  );
};

const RequestAcademyPage = () => {
  const { t } = useTranslation('auth');
  const [contactName, setContactName] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!contactName.trim()) { setError(t('nameRequired')); return; }
    if (!academyName.trim()) { setError(t('academyNameRequired')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(t('emailInvalid')); return; }
    if (!/^\d{8}$/.test(phone)) { setError(t('phoneInvalid')); return; }

    setIsLoading(true);
    try {
      await API_NO_AUTH.post('/leads/academy-request/', {
        contact_name: contactName.trim(),
        academy_name: academyName.trim(),
        email: email.trim().toLowerCase(),
        phone,
      });
      setSuccess(t('requestSentSuccess'));
      setContactName('');
      setAcademyName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'string' ? data
          : data?.detail || (data && JSON.stringify(data)) || 'Something went wrong. Try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-16 px-4"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 50%,#180033 100%)' }}
    >
      <PitchLines />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.6) 1px,transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors group">
        <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('backToHome')}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg mx-auto"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(10,15,42,0.72)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${G}28`,
            boxShadow: `0 0 60px ${P}18, 0 0 120px ${B}08`,
          }}
        >
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${G},${T},transparent)` }} />
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1 text-2xl font-extrabold mb-2" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
                <span style={{ background: `linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RUN</span>
                <span className="text-white">AI</span>
                <span style={{ color: T }}>NI</span>
              </div>
              <h1 className="text-xl font-extrabold text-white">{t('requestAcademyAccess')}</h1>
              <p className="text-sm text-gray-500 mt-2">
                {t('requestAcademyDescription')}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                >
                  <FiAlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background: `rgba(0,208,203,0.1)`, border: `1px solid ${T}40`, color: T }}
                >
                  <FiCheckCircle size={16} className="flex-shrink-0" />{success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <GoldInput
                label={t('yourName')}
                icon={FiUser}
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                autoComplete="name"
                required
              />
              <GoldInput
                label={t('academyName')}
                icon={FiHome}
                type="text"
                value={academyName}
                onChange={e => setAcademyName(e.target.value)}
                autoComplete="organization"
                required
              />
              <GoldInput
                label={t('workEmail')}
                icon={FiMail}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <PhoneInput value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))} />

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg,${P},${B})`,
                  color: 'white',
                  boxShadow: isLoading ? 'none' : `0 0 30px ${P}40`,
                }}
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('sending')}</>
                ) : (
                  <> {t('submitRequest')} <FiSend size={15} /></>
                )}
              </motion.button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              {t('alreadyOnboarded')}{' '}
              <Link to="/login" className="font-semibold" style={{ color: G }}>{t('signIn')}</Link>
            </p>
          </div>
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${P},${T},transparent)` }} />
        </div>
      </motion.div>
    </div>
  );
};

export default RequestAcademyPage;
