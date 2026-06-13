import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { FiCode, FiZap, FiUsers, FiLayers, FiArrowRight, FiGlobe } from 'react-icons/fi';
import { FaBrain, FaTrophy, FaServer } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const G = '#00f5ff'; // Cyber Cyan
const BG = 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)';

/* ── Animated counter ────────────────────────────────────── */
function Metric({ value, label, color, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay }} className="text-center">
      <div className="text-5xl font-extrabold mb-1" style={{ color }}>{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </motion.div>
  );
}

/* ── Tech stack pill ──────────────────────────────────────── */
const Tech = ({ name, color }) => (
  <div className="px-3 py-1.5 rounded-full text-xs font-bold"
    style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>{name}</div>
);

/* ── Timeline item ───────────────────────────────────────── */
function TimelineItem({ year, event, desc, color, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      className="flex gap-6 items-start">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}50`, color }}>{year}</div>
        {i < 3 && <div className="w-px h-16 mt-2" style={{ background: `linear-gradient(${color},transparent)` }} />}
      </div>
      <div className="pb-10">
        <div className="font-bold text-white mb-1">{event}</div>
        <div className="text-sm text-gray-400 leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  );
}

const iV = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

/* ══ ABOUT PAGE ══════════════════════════════════════════════ */
const AboutPage = () => {
  const { t } = useTranslation('about');
  return (
    <div style={{ background: BG }} className="text-white overflow-hidden">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(79,176,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(79,176,255,.5) 1px,transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={cV}>
            <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-4 text-center" style={{ color: T }}>
              {t('hero.badge')}
            </motion.p>
            <motion.h1 variants={iV} className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-center leading-tight mb-6">
              {t('hero.titleLine1')}<br />
              <span style={{ background: `linear-gradient(90deg,${P},${B},${T})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t('hero.titleLine2')}
              </span>
            </motion.h1>
            <motion.p variants={iV} className="text-gray-400 text-xl text-center max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══ METRICS ════════════════════════════════════════= */}
      <section className="py-16 px-4 border-y" style={{ borderColor: 'rgba(144,43,209,0.15)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <Metric value="3"   label={t('metrics.userSpaces')} color={P} delay={0} />
          <Metric value="24+" label={t('metrics.kpiCriteria')} color={B} delay={0.1} />
          <Metric value="6"   label={t('metrics.evalPillars')} color={T} delay={0.2} />
          <Metric value="∞"   label={t('metrics.ambition')}   color={P} delay={0.3} />
        </div>
      </section>

      {/* ══ MISSION ════════════════════════════════════════= */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cV}>
            <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: B }}>
              {t('mission.badge')}
            </motion.p>
            <motion.h2 variants={iV} className="text-4xl font-extrabold text-white mb-5">
              {t('mission.title')}
            </motion.h2>
            <motion.p variants={iV} className="text-gray-400 leading-relaxed mb-4">
              {t('mission.paragraph1')}
            </motion.p>
            <motion.p variants={iV} className="text-gray-400 leading-relaxed mb-6">
              {t('mission.paragraph2')}
            </motion.p>
            <motion.div variants={iV} className="flex flex-wrap gap-2">
              {[
                { icon: FiCode,  label: t('mission.bullets.builtInPublic') },
                { icon: FiZap,   label: t('mission.bullets.weeklyReleases') },
                { icon: FiUsers, label: t('mission.bullets.coachDriven') },
                { icon: FiGlobe, label: t('mission.bullets.openArchitecture') },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: `${T}15`, border: `1px solid ${T}30`, color: T }}>
                  <p.icon size={11} />{p.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual card stack */}
          <div className="relative h-80 flex items-center justify-center">
            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-64 h-40 rounded-2xl p-5"
              style={{ background: `linear-gradient(135deg,${P}40,${B}20)`, border: `1px solid ${B}30`, top: '10%', left: '5%', backdropFilter: 'blur(20px)' }}>
              <div className="text-xs text-gray-400 mb-2">{t('mission.visual.dashboard')}</div>
              <div className="text-2xl font-extrabold text-white">{t('mission.visual.kpiRadar')}</div>
              <div className="text-xs mt-1" style={{ color: T }}>{t('mission.visual.pillars')}</div>
            </motion.div>
            <motion.div animate={{ y: [8, -8, 8] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-60 h-36 rounded-2xl p-5"
              style={{ background: `linear-gradient(135deg,${T}30,${P}20)`, border: `1px solid ${P}30`, bottom: '10%', right: '5%', backdropFilter: 'blur(20px)' }}>
              <div className="text-xs text-gray-400 mb-2">{t('mission.visual.notificationEngine')}</div>
              <div className="text-white font-bold text-sm">{t('mission.visual.newMatch')}</div>
              <div className="text-xs mt-1 text-gray-400">{t('mission.visual.matchDetails')}</div>
            </motion.div>
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-48 h-32 rounded-2xl p-4 relative z-10"
              style={{ background: `linear-gradient(135deg,${B}40,${T}20)`, border: `1px solid ${T}40`, backdropFilter: 'blur(20px)' }}>
              <div className="text-xs text-gray-400 mb-2">{t('mission.visual.aiPredictor')}</div>
              <div className="text-white font-extrabold">{t('mission.visual.forward')}</div>
              <div className="text-xs mt-1" style={{ color: B }}>{t('mission.visual.position')}</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ TECH STACK ══════════════════════════════════════ */}
      <section className="py-20 px-4" style={{ background: 'rgba(12,19,42,0.4)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cV}>
            <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: P }}>
              {t('techStack.badge')}
            </motion.p>
            <motion.h2 variants={iV} className="text-3xl font-extrabold text-white">
              {t('techStack.title')}
            </motion.h2>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FiLayers, label: t('techStack.categories.frontend'),     color: B, items: t('techStack.items.frontend',     { returnObjects: true }) },
              { icon: FaServer, label: t('techStack.categories.backend'),      color: P, items: t('techStack.items.backend',      { returnObjects: true }) },
              { icon: FaBrain,  label: t('techStack.categories.intelligence'), color: T, items: t('techStack.items.intelligence', { returnObjects: true }) },
            ].map((stack, i) => (
              <motion.div key={stack.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${stack.color}20`, border: `1px solid ${stack.color}40` }}>
                    <stack.icon size={18} style={{ color: stack.color }} />
                  </div>
                  <span className="font-bold text-white">{stack.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stack.items.map(item => <Tech key={item} name={item} color={stack.color} />)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ TIMELINE ════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cV}>
            <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: T }}>
              {t('timeline.badge')}
            </motion.p>
            <motion.h2 variants={iV} className="text-3xl font-extrabold text-white">
              {t('timeline.title')}
            </motion.h2>
          </motion.div>
          {t('timeline.items', { returnObjects: true }).map((item, i) => (
            <TimelineItem key={item.year} year={item.year} event={item.event} desc={item.desc} color={item.color} i={i} />
          ))}
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 animate-glow-pulse"
            style={{ border: `1px solid ${P}30` }}>
            <FaTrophy className="mx-auto mb-4" size={36} style={{ color: T }} />
            <h2 className="text-3xl font-extrabold text-white mb-3">{t('cta.title')}</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">{t('cta.description')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-academy">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-xl font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${P},${B})` }}>
                  {t('cta.startButton')}
                </motion.button>
              </Link>
              <Link to="/blog">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold border text-gray-300"
                  style={{ borderColor: `${B}30`, background: 'rgba(12,19,42,0.5)' }}>
                  {t('cta.blogButton')} <FiArrowRight size={14} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ BUILD IN PUBLIC JOURNEY ══════════════════════════ */}
      <section className="py-32 px-4 relative overflow-hidden bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="relative glass-card rounded-[3rem] p-12 overflow-hidden border border-white/5 bg-[#050811]/60">
                <div className="absolute top-0 right-0 p-8 text-white/5 rotate-12">
                  <FiCode size={200} />
                </div>
                <h3 className="text-3xl font-black text-white mb-8 leading-tight">
                  {t('build.title')}<br />
                  <span style={{ color: G }}>{t('build.publicManifest')}</span>
                </h3>
                <div className="space-y-8">
                  {t('build.phases', { returnObjects: true }).map((step, i) => (
                    <div key={i} className="relative pl-8 border-l border-white/10">
                      <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full"
                        style={{ background: i === 2 ? G : 'white' }} />
                      <div className="text-white font-bold mb-1">{step.t}</div>
                      <div className="text-gray-400 text-sm leading-relaxed">{step.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-sm font-black uppercase tracking-[0.3em] mb-6" style={{ color: G }}>
                {t('techEvolution.badge')}
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                {t('techEvolution.title')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {t('techEvolution.subtitle')}
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                {t('techEvolution.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                {t('techEvolution.stack', { returnObjects: true }).map(tech => (
                  <div key={tech}
                    className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-white font-bold text-sm tracking-tight hover:border-cyan-500/50 transition-colors cursor-default">
                    {tech}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
