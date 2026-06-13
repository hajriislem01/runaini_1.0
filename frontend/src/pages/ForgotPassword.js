import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiArrowRight, FiSend, FiAlertCircle, FiCheckCircle, FiLock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

/* ── Brand tokens ─────────────────────────────────── */
const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const G = '#00f5ff'; // Cyber Cyan

/* ── Backdrop ─────────────────────────────────────── */
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
const GoldInput = ({ label, icon: Icon, isRtl, ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = String(props.value || '').length > 0;
  return (
    <div className="relative">
      <label
        className={`absolute ${isRtl ? 'right-11' : 'left-11'} transition-all duration-200 pointer-events-none z-10 font-medium`}
        style={{
          top: focused || hasValue ? '-9px' : '50%',
          transform: focused || hasValue ? 'translateY(0) scale(0.78)' : 'translateY(-50%)',
          transformOrigin: isRtl ? 'right' : 'left',
          color: focused ? G : '#6b7280',
          fontSize: focused || hasValue ? '11px' : '14px',
          background: focused || hasValue ? 'rgba(10,15,42,1)' : 'transparent',
          padding: focused || hasValue ? '0 4px' : '0',
        }}>
        {label}
      </label>
      <div className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 z-10`}
        style={{ color: focused ? G : '#4b5563' }}>
        <Icon size={15} />
      </div>
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className={`w-full px-4 py-4 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-transparent rounded-xl text-white text-sm outline-none transition-all duration-300`}
        style={{
          border: `1px solid ${focused ? G + 'aa' : 'rgba(255,255,255,0.08)'}`,
          background: 'rgba(255,255,255,0.03)',
          boxShadow: focused ? `0 0 0 3px ${G}18, 0 0 20px ${G}08` : 'none',
          textAlign: isRtl ? 'right' : 'left',
        }}
      />
    </div>
  );
};

/* ════════════════════════════════════════════════════ */
const ForgotPassword = () => {
  const { t, i18n } = useTranslation('auth');
  const isRtl = i18n.dir() === 'rtl';

  const [email,     setEmail]     = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent,      setSent]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('emailInvalid'));
      return;
    }

    setIsLoading(true);
    try {
      // Simulated API call — replace with real endpoint when available
      await new Promise(resolve => setTimeout(resolve, 1800));
      setSuccess(t('resetSentSuccess'));
      setSent(true);
      setEmail('');
    } catch {
      setError(t('resetSentFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
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
      <Link to="/login"
        className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} z-20 flex items-center gap-1.5 text-sm text-gray-600 hover:text-white transition-colors group`}>
        {isRtl ? <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> : <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />}
        {t('backToLogin')}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm mx-4">

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

          <div className="px-8 py-10">

            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-0.5 text-3xl font-extrabold mb-3" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
                <span style={{ background: `linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RUN</span>
                <span className="text-white">AI</span>
                <span style={{ color: T }}>NI</span>
              </Link>

              {/* Lock icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow-pulse"
                style={{
                  background: `linear-gradient(135deg,${G}25,${P}15)`,
                  border: `1px solid ${G}35`,
                }}>
                <FiLock size={22} style={{ color: G }} />
              </div>

              <h1 className="text-xl font-extrabold text-white mb-1">{t('forgotPassword')}</h1>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                {t('forgotPasswordInstructions')}
              </p>
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
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center px-4 py-6 rounded-xl mb-5"
                  style={{ background: `rgba(0,208,203,0.08)`, border: `1px solid ${T}30` }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ background: `${T}20`, border: `1px solid ${T}40` }}>
                    <FiCheckCircle size={22} style={{ color: T }} />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{t('emailSent')}</p>
                  <p className="text-xs text-gray-400">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form — hide after success */}
            {!sent && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <GoldInput
                  label={t('academyEmail')} icon={FiMail} type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  required
                  isRtl={isRtl}
                />

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  style={{
                    background: `linear-gradient(135deg,${P},${B})`,
                    color: 'white',
                    boxShadow: isLoading ? 'none' : `0 0 28px ${P}35`,
                  }}>
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('sending')}</>
                  ) : (
                    <><FiSend size={14} /> {t('sendResetLink')}</>
                  )}
                </motion.button>
              </form>
            )}

            {/* After success — resend option */}
            {sent && (
              <motion.button
                type="button"
                onClick={() => { setSent(false); setSuccess(''); }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-full py-3 rounded-xl text-xs font-medium text-gray-500 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {t('didNotGetEmail')}
              </motion.button>
            )}

            {/* Divider + links */}
            <div className="mt-6 pt-5 border-t text-center space-y-2"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-gray-600">
                {t('rememberPasswordQuestion')}{' '}
                <Link to="/login" className="font-semibold" style={{ color: G }}>
                  {t('signIn')} {isRtl ? '←' : '→'}
                </Link>
              </p>
              <p className="text-xs text-gray-600">
                {t('newHereQuestion')}{' '}
                <Link to="/request-academy" className="font-semibold" style={{ color: B }}>
                  {t('createAcademy')} {isRtl ? '←' : '→'}
                </Link>
              </p>
            </div>
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

export default ForgotPassword;