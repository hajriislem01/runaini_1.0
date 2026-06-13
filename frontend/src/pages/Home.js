import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiArrowRight, FiUsers, FiClipboard, FiTarget, FiActivity,
  FiZap, FiBell, FiBarChart2, FiShield, FiCheck, FiLayers,
} from 'react-icons/fi';
import { FaTrophy, FaBrain } from 'react-icons/fa';

/* ── Brand tokens ─────────────────────────────────────────── */
const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const G = '#00f5ff'; // Cyber Cyan
const BG = 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)';

/* ── Animated SVG pitch backdrop ────────────────────────── */
const PitchSVG = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice">
    <rect x="50" y="40" width="800" height="520" fill="none" stroke="white" strokeWidth="2" />
    <line x1="450" y1="40" x2="450" y2="560" stroke="white" strokeWidth="1.5" />
    <circle cx="450" cy="300" r="80" fill="none" stroke="white" strokeWidth="1.5" />
    <circle cx="450" cy="300" r="4" fill="white" />
    <rect x="50" y="200" width="130" height="200" fill="none" stroke="white" strokeWidth="1.5" />
    <rect x="720" y="200" width="130" height="200" fill="none" stroke="white" strokeWidth="1.5" />
    <rect x="50" y="250" width="60" height="100" fill="none" stroke="white" strokeWidth="1.5" />
    <rect x="790" y="250" width="60" height="100" fill="none" stroke="white" strokeWidth="1.5" />
    <circle cx="180" cy="300" r="3" fill="white" />
    <circle cx="720" cy="300" r="3" fill="white" />
  </svg>
);

/* ── Typing effect ───────────────────────────────────────── */
function TypedWord() {
  const { t } = useTranslation('home');
  const words = t('hero.typedWords', { returnObjects: true }) || ['Academies Football.', 'Administrations.', 'Coaches & Players.'];
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const target = words[idx] || '';
    const speed = deleting ? 50 : 100;
    const delay = deleting && displayed.length === 0 ? 600 : speed;
    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplayed(target.slice(0, displayed.length + 1));
        if (displayed.length + 1 === target.length) setTimeout(() => setDeleting(true), 1400);
      } else {
        setDisplayed(displayed.slice(0, -1));
        if (displayed.length === 0) {
          setDeleting(false);
          setIdx((idx + 1) % words.length);
        }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [displayed, deleting, idx, words]);

  return (
    <span style={{ background: `linear-gradient(90deg,${P},${B},${T})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {displayed}<span className="cursor-blink" style={{ WebkitTextFillColor: T }}>|</span>
    </span>
  );
}

/* ── Stat counter ────────────────────────────────────────── */
function StatCard({ value, label, color, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }} className="glass-card rounded-2xl p-6 text-center">
      <div className="text-4xl font-extrabold mb-1" style={{ color }}>{value}</div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </motion.div>
  );
}

/* ── 3D tilt card ────────────────────────────────────────── */
function TiltCard({ children, className = '' }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handle = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - r.top) / r.height - 0.5) * 10;
    const y = ((e.clientX - r.left) / r.width - 0.5) * -10;
    setTilt({ x, y });
  };
  return (
    <motion.div className={className} style={{ transformStyle: 'preserve-3d' }}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseMove={handle} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      {children}
    </motion.div>
  );
}

/* ── Feature pill ────────────────────────────────────────── */
const FeaturePill = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
    style={{ background: 'rgba(144,43,209,0.15)', border: '1px solid rgba(144,43,209,0.3)', color: B }}>
    <Icon size={12} />{label}
  </div>
);

/* ── Data Particles ───────────────────────────────────────── */
const DataParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div key={i} className="absolute w-1 h-1 rounded-full"
        style={{ background: G, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.2 }}
        animate={{
          y: [0, -100, 0],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.5, 1]
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          delay: Math.random() * 5
        }}
      />
    ))}
  </div>
);

/* ── Performance Trend Chart ───────────────────────────────── */
const PerformanceTrend = () => (
  <svg viewBox="0 0 200 60" className="w-full h-full">
    <motion.path
      d="M 0,50 L 40,45 L 80,48 L 120,20 L 160,25 L 200,10"
      fill="none"
      stroke={G}
      strokeWidth="2"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      transition={{ duration: 4, ease: "easeInOut" }}
    />
    <motion.path
      d="M 0,50 L 40,45 L 80,48 L 120,20 L 160,25 L 200,10 V 60 H 0 Z"
      fill={`url(#grad-${G})`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.1 }}
      transition={{ delay: 1.5, duration: 1 }}
    />
    <defs>
      <linearGradient id={`grad-${G}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: G, stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: G, stopOpacity: 0 }} />
      </linearGradient>
    </defs>
  </svg>
);

/* ══ HOME ════════════════════════════════════════════════════ */
const Home = () => {
  const { t } = useTranslation('home');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yParallax = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const pillars = [
    {
      key: 'admin',
      icon: FiShield,
      color: P,
      pills: [
        { icon: FiBell, labelKey: 'smartAlerts' },
        { icon: FiUsers, labelKey: 'squadManagement' }
      ],
    },
    {
      key: 'coach',
      icon: FiClipboard,
      color: B,
      pills: [
        { icon: FaBrain, labelKey: 'aiPredictor' },
        { icon: FiBarChart2, labelKey: 'kpiAnalytics' }
      ],
    },
    {
      key: 'player',
      icon: FiTarget,
      color: T,
      pills: [
        { icon: FiActivity, labelKey: 'liveStats' },
        { icon: FaTrophy, labelKey: 'achievements' }
      ],
    },
  ];

  const ecosystemSpaces = [
    { key: 'admin', color: B, icon: FiLayers },
    { key: 'coach', color: P, icon: FiZap },
    { key: 'player', color: T, icon: FiUsers },
  ];

  const deepFeatures = [
    { key: 'notification', icon: FiBell, color: P },
    { key: 'aiPredictor', icon: FaBrain, color: B },
    { key: 'evaluation', icon: FiBarChart2, color: T },
    { key: 'hierarchy', icon: FiZap, color: P },
  ];

  const stats = [
    { value: '6', label: t('stats.evaluationPillars'), color: P, delay: 0 },
    { value: '24+', label: t('stats.kpiCriteria'), color: B, delay: 0.1 },
    { value: '3', label: t('stats.userSpaces'), color: T, delay: 0.2 },
    { value: '100%', label: t('stats.realTime'), color: P, delay: 0.3 },
  ];

  const analyticsStats = [
    { key: 'dataSync', val: t('analytics.stats.dataSync.val'), trend: t('analytics.stats.dataSync.trend') },
    { key: 'evalMetrics', val: t('analytics.stats.evalMetrics.val'), trend: t('analytics.stats.evalMetrics.trend') },
    { key: 'systemUptime', val: t('analytics.stats.systemUptime.val'), trend: t('analytics.stats.systemUptime.trend') },
    { key: 'aiPrediction', val: t('analytics.stats.aiPrediction.val'), trend: t('analytics.stats.aiPrediction.trend') },
  ];

  const radarPoints = [
    { x: 50, y: 15, label: t('analytics.radarLabels.speed') },
    { x: 85, y: 35, label: t('analytics.radarLabels.control') },
    { x: 75, y: 75, label: t('analytics.radarLabels.power') },
    { x: 50, y: 85, label: t('analytics.radarLabels.vision') },
    { x: 25, y: 75, label: t('analytics.radarLabels.health') },
    { x: 15, y: 35, label: t('analytics.radarLabels.tactics') }
  ];

  const iV = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } };

  return (
    <div style={{ background: BG }} className="text-white overflow-hidden relative">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <PitchSVG />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(79,176,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(79,176,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Scanline */}
        <div className="absolute left-0 right-0 h-px opacity-20 animate-scanline"
          style={{ background: `linear-gradient(90deg, transparent, ${T}, transparent)` }} />

        <motion.div style={{ y: yParallax, opacity: opacityHero }}
          className="relative z-10 text-center px-4 max-w-6xl mx-auto pt-32 lg:pt-0">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-sm font-medium mb-6 sm:mb-8 animate-glow-pulse"
            style={{ background: 'rgba(144,43,209,0.2)', border: `1px solid rgba(144,43,209,0.4)`, color: B }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: T }} />
            {t('hero.badge')}
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-8xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            <span className="text-white">{t('hero.title')}</span>
            <br />
            <TypedWord />
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t('hero.description')}
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none">
            <Link to="/request-academy" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-base animate-gradient"
                style={{ background: `linear-gradient(135deg,${P},${B},${T})`, backgroundSize: '200% 200%' }}>
                <FiZap size={18} /> {t('hero.ctaFree')}
              </motion.button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-gray-300 border text-base transition-all hover:text-white"
                style={{ borderColor: 'rgba(144,43,209,0.4)', background: 'rgba(12,19,42,0.6)' }}>
                {t('hero.ctaPlans')} <FiArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Proof pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="flex flex-wrap justify-center gap-3 mt-10">
            {[
              { icon: FiCheck, text: t('hero.proofNoCard') },
              { icon: FiCheck, text: t('hero.proofRoles') },
              { icon: FiCheck, text: t('hero.proofFullAccess') }
            ].map(p => (
              <div key={p.text} className="flex items-center gap-1.5 text-sm text-gray-500">
                <FiCheck size={14} style={{ color: T }} />{p.text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: 'linear-gradient(to top, #000000, transparent)' }} />
      </section>

      {/* ══ STATS ═════════════════════════════════════════════ */}
      <section className="py-16 px-4 relative">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ══ THREE PILLARS ══════════════════════════════════════ */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cV}>
            <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: T }}>
              {t('pillarsHeader.tagline')}
            </motion.p>
            <motion.h2 variants={iV} className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              {t('pillarsHeader.titleStart')}<span style={{ background: `linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('pillarsHeader.titleEnd')}</span>
            </motion.h2>
            <motion.p variants={iV} className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('pillarsHeader.description')}
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const role = t(`pillars.${p.key}.role`);
              const tagline = t(`pillars.${p.key}.tagline`);
              const desc = t(`pillars.${p.key}.desc`);
              const featuresList = t(`pillars.${p.key}.features`, { returnObjects: true }) || [];
              const spaceLabel = t(`pillars.${p.key}.space`);

              return (
                <TiltCard key={p.key} className="glass-card rounded-2xl p-8 flex flex-col h-full">
                  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}>
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 animate-glow-pulse"
                      style={{ background: `linear-gradient(135deg,${p.color}40,${p.color}20)`, border: `1px solid ${p.color}40` }}>
                      <p.icon size={26} style={{ color: p.color }} />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: p.color }}>{spaceLabel}</div>
                    <h3 className="text-2xl font-extrabold text-white mb-3">{tagline}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{desc}</p>
                    {/* Features */}
                    <ul className="space-y-2 mb-6 flex-1">
                      {featuresList.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                          <FiCheck size={13} style={{ color: p.color, flexShrink: 0 }} />{f}
                        </li>
                      ))}
                    </ul>
                    {/* Pills */}
                    <div className="flex gap-2 flex-wrap">
                      {p.pills.map(pl => (
                        <FeaturePill key={pl.labelKey} icon={pl.icon} label={t(`pillars.${p.key}.pills.${pl.labelKey}`)} />
                      ))}
                    </div>
                  </motion.div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ NEW: PRO ECOSYSTEM ═════════════════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden bg-black/40">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              {t('ecosystem.title', { defaultValue: 'Built for the Elite Circuit.' })}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
              {t('ecosystem.subtitle', { defaultValue: 'A unified architecture serving three distinct user worlds in perfect synchronization.' })}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {ecosystemSpaces.map((space, i) => {
              const title = t(`ecosystem.${space.key}.title`);
              const desc = t(`ecosystem.${space.key}.desc`);
              const featuresList = t(`ecosystem.${space.key}.features`, { returnObjects: true }) || [];

              return (
                <motion.div key={space.key} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-[2.5rem] p-10 relative group border border-white/5 hover:border-white/10 transition-all">
                  <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:scale-110">
                    <space.icon size={220} />
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/40" style={{ background: `${space.color}15`, border: `1px solid ${space.color}30` }}>
                    <space.icon size={26} style={{ color: space.color }} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-5">{title}</h3>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed font-medium">{desc}</p>
                  <div className="space-y-4">
                    {featuresList.map(f => (
                      <div key={f} className="flex items-center gap-3 text-xs font-bold text-gray-300 uppercase tracking-tight">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: space.color }} /> {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ SECTION 4: PRECISION ANALYTICS ══════════════════════ */}
      <section className="py-40 px-4 relative overflow-hidden bg-black/40 border-y border-white/5">
        <DataParticles />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: G }} />
              {t('analytics.badge')}
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white mb-10 leading-[0.85] tracking-tighter">
              {t('analytics.title')}
            </h2>
            <p className="text-gray-400 text-xl mb-12 leading-relaxed font-medium max-w-xl">
              {t('analytics.desc')}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 sm:gap-12">
              {analyticsStats.map((stat, i) => (
                <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group cursor-default relative">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-12 transition-all duration-500" style={{ background: G }} />
                  <div className="text-2xl sm:text-4xl font-black text-white group-hover:translate-x-2 transition-transform duration-500 flex items-baseline gap-2">
                    {stat.val}
                    <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">{stat.trend}</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-gray-500 uppercase font-black tracking-widest mt-2">
                    {t(`analytics.stats.${stat.key}.label`)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-8">
            <TiltCard>
              <div className="bg-[#050811]/90 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[2.9rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden border border-white/5">
                <motion.div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12 pointer-events-none"
                  animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />

                <div className="flex justify-between items-center mb-10">
                  <div className="font-black text-white text-base sm:text-xl tracking-tight">{t('analytics.radarTitle')}</div>
                  <FiActivity className="text-cyan-400 animate-pulse" size={24} />
                </div>

                <div className="aspect-square relative flex items-center justify-center scale-90 sm:scale-100">
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.1]">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="absolute border border-white rounded-full" style={{ width: i * 20 + '%', height: i * 20 + '%' }} />
                    ))}
                  </div>
                  <motion.svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 100 100">
                    <motion.polygon initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 4 }}
                      points="50,15 85,35 75,75 50,85 25,75 15,35" fill="rgba(0,245,255,0.08)" stroke={G} strokeWidth="1.2" />
                    {radarPoints.map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="1.5" fill={G} className="animate-pulse" />
                        <text x={pt.x} y={pt.y - 6} textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontWeight="900" className="uppercase tracking-widest">{pt.label}</text>
                      </g>
                    ))}
                  </motion.svg>
                </div>
              </div>
            </TiltCard>

            <div className="grid grid-cols-2 gap-8">
              <TiltCard className="glass-card rounded-[2rem] p-8">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{t('analytics.livePerf')}</div>
                <div className="h-20">
                  <PerformanceTrend />
                </div>
              </TiltCard>
              <TiltCard className="glass-card rounded-[2rem] p-8 flex flex-col justify-center text-center">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{t('analytics.sysUptime')}</div>
                <div className="text-3xl font-black text-white">{t('analytics.stats.systemUptime.val')}</div>
                <div className="text-[10px] text-cyan-400 font-bold mt-1">{t('analytics.operational')}</div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURE DEEP DIVE ══════════════════════════════════ */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(${B} 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cV}>
            <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: B }}>
              {t('featuresDeep.tagline')}
            </motion.p>
            <motion.h2 variants={iV} className="text-4xl md:text-5xl font-extrabold text-white">
              {t('featuresDeep.title')}
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {deepFeatures.map((f, i) => {
              const title = t(`featuresDeep.${f.key}.title`);
              const desc = t(`featuresDeep.${f.key}.desc`);

              return (
                <motion.div key={f.key} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
                  <TiltCard className="glass-card rounded-2xl p-7 h-full">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${f.color}20`, border: `1px solid ${f.color}40` }}>
                        <f.icon size={22} style={{ color: f.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════════════ */}
      <section className="py-12 md:py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-[2rem] p-8 md:p-16 text-center relative overflow-hidden animate-glow-pulse"
            style={{ background: `linear-gradient(135deg,${P}22,${B}15,${T}10)`, border: `1px solid ${P}40` }}>
            <div className="absolute inset-0 opacity-5">
              <PitchSVG />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] md:text-sm font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: T }}>
                {t('ctaBanner.tagline')}
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                {t('ctaBanner.titleStart')}<br />
                <span style={{ background: `linear-gradient(90deg,${P},${T})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {t('ctaBanner.titleEnd')}
                </span>
              </h2>
              <p className="text-gray-400 mb-10 max-w-lg mx-auto text-sm md:text-lg leading-relaxed">
                {t('ctaBanner.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto">
                <Link to="/request-academy" className="w-full sm:w-auto">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="w-full px-8 py-4 rounded-xl font-bold text-white text-sm md:text-base shadow-lg shadow-purple-500/20"
                    style={{ background: `linear-gradient(135deg,${P},${B})` }}>
                    {t('ctaBanner.ctaStartFree')}
                  </motion.button>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="w-full px-8 py-4 rounded-xl font-semibold text-gray-300 border text-sm md:text-base transition-all hover:text-white"
                    style={{ borderColor: `${B}40`, background: 'rgba(12,19,42,0.5)' }}>
                    {t('ctaBanner.ctaPricing')}
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;