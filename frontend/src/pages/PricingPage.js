import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiZap, FiArrowRight, FiShield, FiStar, FiMinus } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const G = '#00f5ff'; // Cyber Cyan
const BG = 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)';

/* ── Toggle ───────────────────────────────────────────────── */
const Toggle = ({ active, onToggle }) => {
  const { t } = useTranslation('pricing');
  return (
    <div className="flex items-center gap-4 justify-center">
      <span className={`text-sm font-medium transition-colors ${!active ? 'text-white' : 'text-gray-500'}`}>
        {t('toggle.monthly')}
      </span>
      <button onClick={onToggle}
        className="relative w-14 h-7 rounded-full transition-all"
        style={{ background: active ? `linear-gradient(90deg,${P},${B})` : 'rgba(255,255,255,0.1)' }}>
        <span className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow"
          style={{ transform: active ? 'translateX(28px)' : 'translateX(0)' }} />
      </button>
      <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-gray-500'}`}>
        {t('toggle.annual')}{' '}
        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-1"
          style={{ background: `${T}20`, color: T }}>
          {t('toggle.discount')}
        </span>
      </span>
    </div>
  );
};

function FAQItem({ q, a, i }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: i * 0.07 }} className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left gap-4">
        <span className="font-semibold text-white text-sm">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: open ? `${T}30` : 'rgba(255,255,255,0.05)', color: open ? T : '#6b7280' }}>
          <FiArrowRight size={13} />
        </motion.span>
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
        <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
}

/* ══ PRICING PAGE ═════════════════════════════════════════════ */
const PricingPage = () => {
  const { t } = useTranslation('pricing');
  const [annual, setAnnual] = useState(false);
  const iV = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  /* ── Plans configuration ────────────────────────────────── */
  const plans = [
    {
      key: 'starter',
      icon: FiShield,
      iconColor: T,
      popular: false,
      monthly: 49,
      annual: 39,
      ctaLink: '/request-academy',
      features: [
        { key: 'admins', ok: true },
        { key: 'coaches', ok: true },
        { key: 'players', ok: true },
        { key: 'groups', ok: true },
        { key: 'scheduling', ok: true },
        { key: 'notifications', ok: true },
        { key: 'profileManagement', ok: true },
        { key: 'evaluations', ok: false },
        { key: 'positionPredictor', ok: false },
        { key: 'analytics', ok: false },
        { key: 'pdfExport', ok: false },
        { key: 'videoAnalysis', ok: false },
      ],
    },
    {
      key: 'pro',
      icon: FiZap,
      iconColor: B,
      popular: true,
      monthly: 129,
      annual: 103,
      ctaLink: '/request-academy',
      features: [
        { key: 'admins', ok: true },
        { key: 'coaches', ok: true },
        { key: 'players', ok: true },
        { key: 'groups', ok: true },
        { key: 'scheduling', ok: true },
        { key: 'notifications', ok: true },
        { key: 'profileManagement', ok: true },
        { key: 'evaluations', ok: true },
        { key: 'positionPredictor', ok: true },
        { key: 'analytics', ok: true },
        { key: 'pdfExport', ok: true },
        { key: 'videoAnalysis', ok: false },
      ],
    },
    {
      key: 'elite',
      icon: FaCrown,
      iconColor: P,
      popular: false,
      monthly: null,
      annual: null,
      ctaLink: '/request-academy',
      features: [
        { key: 'admins', ok: true },
        { key: 'coaches', ok: true },
        { key: 'players', ok: true },
        { key: 'groups', ok: true },
        { key: 'scheduling', ok: true },
        { key: 'notifications', ok: true },
        { key: 'profileManagement', ok: true },
        { key: 'evaluations', ok: true },
        { key: 'positionPredictor', ok: true },
        { key: 'analytics', ok: true },
        { key: 'pdfExport', ok: true },
        { key: 'videoAnalysis', ok: true },
      ],
    },
  ];

  const deepScanRows = [
    { key: 'admin' },
    { key: 'coach' },
    { key: 'player' },
    { key: 'system' }
  ];

  const faqs = t('faq.items', { returnObjects: true }) || [];

  return (
    <div style={{ background: BG }} className="text-white overflow-hidden">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(${P} 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />

        <motion.div className="relative z-10 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={cV}>
          <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: T }}>
            {t('hero.tagline')}
          </motion.p>
          <motion.h1 variants={iV} className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
            {t('hero.titleStart')}<span style={{ background: `linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('hero.titleEnd')}</span>
          </motion.h1>
          <motion.p variants={iV} className="text-gray-400 text-lg mb-8">
            {t('hero.description')}
          </motion.p>
          <motion.div variants={iV}>
            <Toggle active={annual} onToggle={() => setAnnual(!annual)} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ CARDS ═══════════════════════════════════════════ */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => {
            const name = t(`plans.${plan.key}.name`);
            const tagline = t(`plans.${plan.key}.tagline`);
            const ctaText = t(`plans.${plan.key}.cta`);
            const activePrice = annual ? plan.annual : plan.monthly;

            return (
              <motion.div key={plan.key} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: plan.popular ? `linear-gradient(135deg,${P}22,${B}15)` : 'rgba(12,19,42,0.7)',
                  border: `1px solid ${plan.popular ? B + '60' : 'rgba(144,43,209,0.15)'}`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: plan.popular ? `0 0 40px ${B}20, 0 0 80px ${P}10` : 'none',
                }}>

                {plan.popular && (
                  <div className="text-center text-xs font-bold py-2 uppercase tracking-widest"
                    style={{ background: `linear-gradient(90deg,${P},${B})`, color: 'white' }}>
                    {t('plans.mostPopular')}
                  </div>
                )}

                <div className="p-7">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${plan.iconColor}20`, border: `1px solid ${plan.iconColor}40` }}>
                      <plan.icon size={20} style={{ color: plan.iconColor }} />
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-lg leading-none">{name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{tagline}</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.monthly ? (
                      <>
                        <span className="text-5xl font-extrabold text-white">
                          €{activePrice}
                        </span>
                        <span className="text-gray-500 ml-1 text-sm">{t('price.monthLabel')}</span>
                        {annual && (
                          <div className="text-xs mt-1" style={{ color: T }}>
                            {t('price.billedSave', {
                              annualPrice: plan.annual * 12,
                              savedAmount: (plan.monthly - plan.annual) * 12
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <span className="text-4xl font-extrabold text-white">{t('price.custom')}</span>
                        <div className="text-xs text-gray-500 mt-1">{t('price.customSub')}</div>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link to={plan.ctaLink}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="w-full py-3 rounded-xl font-bold text-sm mb-6 transition-all"
                      style={plan.popular
                        ? { background: `linear-gradient(135deg,${P},${B})`, color: 'white' }
                        : { background: 'rgba(255,255,255,0.06)', color: 'white', border: `1px solid rgba(255,255,255,0.1)` }}>
                      {ctaText} <FiArrowRight className="inline ml-1" size={13} />
                    </motion.button>
                  </Link>

                  {/* Features */}
                  <ul className="space-y-2.5">
                    {plan.features.map(f => {
                      const featureLabel = t(`plans.${plan.key}.features.${f.key}`);
                      return (
                        <li key={f.key} className="flex items-center gap-2.5 text-sm">
                          {f.ok
                            ? <FiCheck size={14} style={{ color: T, flexShrink: 0 }} />
                            : <FiMinus size={14} className="text-gray-700 flex-shrink-0" />}
                          <span className={f.ok ? 'text-gray-300' : 'text-gray-600'}>{featureLabel}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ NEW: GRAPHIC COMPARISON ═══════════════════════════ */}
      <section className="py-24 px-4 bg-black/40 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              {t('deepScan.title')}
            </h2>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2">
              {t('deepScan.subtitle')}
            </p>
          </div>
          <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      {t('deepScan.headers.segment')}
                    </th>
                    <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      {t('deepScan.headers.core')}
                    </th>
                    <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                      {t('deepScan.headers.pro')}
                    </th>
                    <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                      {t('deepScan.headers.elite')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deepScanRows.map((row) => {
                    const rowTitle = t(`deepScan.rows.${row.key}.title`);
                    const rowFeatures = t(`deepScan.rows.${row.key}.features`, { returnObjects: true }) || [];

                    return (
                      <tr key={row.key} className="border-b border-white/[0.03] group hover:bg-white/[0.01] transition-all">
                        <td className="py-10 px-8">
                          <div className="text-white font-black text-lg mb-2">{rowTitle}</div>
                          <div className="flex flex-wrap gap-2">
                            {rowFeatures.map(f => (
                              <span key={f} className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-gray-500 font-bold uppercase">
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-10 px-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
                          {t('deepScan.partial')}
                        </td>
                        <td className="py-10 px-8 text-blue-400 text-xs font-black uppercase tracking-widest">
                          {t('deepScan.fullSuite')}
                        </td>
                        <td className="py-10 px-8 text-cyan-400 text-xs font-black uppercase tracking-widest">
                          {t('deepScan.customized')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMPARISON CALLOUT ══════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-3xl p-10">
            <FiStar className="mx-auto mb-4" size={32} style={{ color: T }} />
            <h3 className="text-2xl font-extrabold text-white mb-3">
              {t('callout.title')}
            </h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              {t('callout.description')}
            </p>
            <Link to="/request-academy">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-bold text-white"
                style={{ background: `linear-gradient(135deg,${P},${T})` }}>
                {t('callout.cta')}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════= */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cV}>
            <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: B }}>
              {t('faq.tagline')}
            </motion.p>
            <motion.h2 variants={iV} className="text-3xl md:text-4xl font-extrabold text-white">
              {t('faq.title')}
            </motion.h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} i={i} />)}
          </div>
        </div>
      </section>

    </div>
  );
};

export default PricingPage;