import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { FiCheck, FiZap, FiArrowRight, FiShield, FiStar, FiMinus } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const G = '#00f5ff'; // Cyber Cyan
const BG = 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)';

/* ── Toggle ───────────────────────────────────────────────── */
const Toggle = ({ active, onToggle }) => (
  <div className="flex items-center gap-4 justify-center">
    <span className={`text-sm font-medium transition-colors ${!active ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
    <button onClick={onToggle}
      className="relative w-14 h-7 rounded-full transition-all"
      style={{ background: active ? `linear-gradient(90deg,${P},${B})` : 'rgba(255,255,255,0.1)' }}>
      <span className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow"
        style={{ transform: active ? 'translateX(28px)' : 'translateX(0)' }} />
    </button>
    <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-gray-500'}`}>
      Annual <span className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-1"
        style={{ background: `${T}20`, color: T }}>−20%</span>
    </span>
  </div>
);

/* ── Plans data ──────────────────────────────────────────── */
const plans = [
  {
    name: 'Starter', icon: FiShield, iconColor: T, popular: false,
    monthly: 49, annual: 39,
    tagline: 'For growing clubs taking their first digital step.',
    features: [
      { label: 'Up to 1 Admin', ok: true },
      { label: 'Up to 2 Coaches', ok: true },
      { label: 'Up to 30 Players', ok: true },
      { label: '2 Groups + Subgroups', ok: true },
      { label: 'Event & Match Scheduling', ok: true },
      { label: 'Basic Notification Engine', ok: true },
      { label: 'Player Profile Management', ok: true },
      { label: '6-Pillar Evaluation System', ok: false },
      { label: 'AI Position Predictor', ok: false },
      { label: 'KPI Radar & Chart Analytics', ok: false },
      { label: 'PDF Report Export', ok: false },
      { label: 'Video Analysis Suite', ok: false },
    ],
    cta: 'Get Started',
    ctaLink: '/signup',
  },
  {
    name: 'Pro', icon: FiZap, iconColor: B, popular: true,
    monthly: 129, annual: 103,
    tagline: 'The complete coaching intelligence stack for serious clubs.',
    features: [
      { label: 'Up to 3 Admins', ok: true },
      { label: 'Up to 10 Coaches', ok: true },
      { label: 'Unlimited Players', ok: true },
      { label: 'Unlimited Groups & Subgroups', ok: true },
      { label: 'Full Event & Match Scheduling', ok: true },
      { label: 'Real-Time Notification Engine', ok: true },
      { label: 'Player Profile Management', ok: true },
      { label: '6-Pillar Evaluation System', ok: true },
      { label: 'AI Position Predictor', ok: true },
      { label: 'KPI Radar & Chart Analytics', ok: true },
      { label: 'PDF Report Export', ok: true },
      { label: 'Video Analysis Suite', ok: false },
    ],
    cta: 'Start Pro Trial',
    ctaLink: '/signup',
  },
  {
    name: 'Elite', icon: FaCrown, iconColor: P, popular: false,
    monthly: null, annual: null,
    tagline: 'White-glove setup for elite academies and federations.',
    features: [
      { label: 'Unlimited Admins', ok: true },
      { label: 'Unlimited Coaches', ok: true },
      { label: 'Unlimited Players', ok: true },
      { label: 'Unlimited Groups & Subgroups', ok: true },
      { label: 'Full Event & Match Scheduling', ok: true },
      { label: 'Real-Time Notification Engine', ok: true },
      { label: 'Player Profile Management', ok: true },
      { label: '6-Pillar Evaluation System', ok: true },
      { label: 'AI Position Predictor', ok: true },
      { label: 'KPI Radar & Chart Analytics', ok: true },
      { label: 'PDF Report Export', ok: true },
      { label: 'Video Analysis Suite', ok: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/about',
  },
];

/* ── FAQ ─────────────────────────────────────────────────── */
const faqs = [
  { q: 'Can I upgrade or downgrade my plan anytime?', a: 'Yes. Plan changes apply immediately with prorated billing. Downgrading at renewal is instant with no lock-in penalties.' },
  { q: 'Is the 6-pillar evaluation system really exclusive to Pro?', a: 'Yes. The Technical, Tactical, Physical, Mental, Health, and Academic scoring engine — including PDF exports — is a Pro and Elite exclusive feature.' },
  { q: 'What does the AI Position Predictor actually do?', a: 'It scores players across 24+ criteria and ranks all 4 positions by fit. Coaches can accept or reject the recommendation, which updates the player\'s profile instantly.' },
  { q: 'How does the notification engine work?', a: 'When an admin creates an event for a Group or Subgroup, the system automatically resolves all linked coaches and players and fires real-time in-app notifications to every member.' },
  { q: 'Is there a free trial?', a: 'Every new academy gets a 14-day full Pro trial — no credit card required. After 14 days, pick the plan that fits your growth stage.' },
  { q: 'Do you offer on-premise deployment for Elite?', a: 'Yes. Elite academies can request a self-hosted deployment with a dedicated DevOps handoff and SLA agreement.' },
];

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
  const [annual, setAnnual] = useState(false);
  const iV = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div style={{ background: BG }} className="text-white overflow-hidden">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(${P} 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />

        <motion.div className="relative z-10 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={cV}>
          <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: T }}>
            Transparent Pricing
          </motion.p>
          <motion.h1 variants={iV} className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
            Invest in Your <span style={{ background: `linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Academy's Edge</span>
          </motion.h1>
          <motion.p variants={iV} className="text-gray-400 text-lg mb-8">
            No hidden fees. No bloated tiers. Every plan is built around real features used by real coaches.
          </motion.p>
          <motion.div variants={iV}>
            <Toggle active={annual} onToggle={() => setAnnual(!annual)} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ CARDS ═══════════════════════════════════════════ */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
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
                  ★ Most Popular
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
                    <div className="font-extrabold text-white text-lg leading-none">{plan.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{plan.tagline}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.monthly ? (
                    <>
                      <span className="text-5xl font-extrabold text-white">
                        €{annual ? plan.annual : plan.monthly}
                      </span>
                      <span className="text-gray-500 ml-1 text-sm">/month</span>
                      {annual && (
                        <div className="text-xs mt-1" style={{ color: T }}>
                          Billed €{plan.annual * 12}/year — save €{(plan.monthly - plan.annual) * 12}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <span className="text-4xl font-extrabold text-white">Custom</span>
                      <div className="text-xs text-gray-500 mt-1">Talk to our team for a tailored quote</div>
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
                    {plan.cta} <FiArrowRight className="inline ml-1" size={13} />
                  </motion.button>
                </Link>

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f.label} className="flex items-center gap-2.5 text-sm">
                      {f.ok
                        ? <FiCheck size={14} style={{ color: T, flexShrink: 0 }} />
                        : <FiMinus size={14} className="text-gray-700 flex-shrink-0" />}
                      <span className={f.ok ? 'text-gray-300' : 'text-gray-600'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ NEW: GRAPHIC COMPARISON ═══════════════════════════ */}
      <section className="py-24 px-4 bg-black/40 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Feature Ecosystem <span style={{ color: G }}>Deep-Scan</span></h2>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2">Comprehensive Workspace Comparison</p>
          </div>
          <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Segment / Capability</th>
                    <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Core</th>
                    <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Pro</th>
                    <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Elite</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { seg: 'Admin Command', features: ['Multi-Group Hierarchies', 'Notification Engine', 'Staff Permissions'] },
                    { seg: 'Coach Intelligence', features: ['6-Pillar Evaluation', 'KPI Radar Analytics', 'Training Creator'] },
                    { seg: 'Player Analytics', features: ['Performance Logs', 'Health History', 'Personal Roadmaps'] },
                    { seg: 'System Core', features: ['Real-time Sync', 'Multi-Language', 'Custom Branding'] }
                  ].map((row, i) => (
                    <tr key={row.seg} className="border-b border-white/[0.03] group hover:bg-white/[0.01] transition-all">
                      <td className="py-10 px-8">
                        <div className="text-white font-black text-lg mb-2">{row.seg}</div>
                        <div className="flex gap-2">
                          {row.features.map(f => <span key={f} className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-gray-500 font-bold uppercase">{f}</span>)}
                        </div>
                      </td>
                      <td className="py-10 px-8 text-gray-400 text-xs font-bold uppercase tracking-widest">Partial</td>
                      <td className="py-10 px-8 text-blue-400 text-xs font-black uppercase tracking-widest">Full Suite</td>
                      <td className="py-10 px-8 text-cyan-400 text-xs font-black uppercase tracking-widest">Customized</td>
                    </tr>
                  ))}
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
            <h3 className="text-2xl font-extrabold text-white mb-3">All plans include a 14-day Pro trial</h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Start with the full power of RunAiNi Pro — free. No credit card. No surprises.
              Experience every feature before you commit to a single euro.
            </p>
            <Link to="/signup">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-bold text-white"
                style={{ background: `linear-gradient(135deg,${P},${T})` }}>
                Claim Your Free Trial
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════= */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cV}>
            <motion.p variants={iV} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: B }}>Got Questions?</motion.p>
            <motion.h2 variants={iV} className="text-3xl md:text-4xl font-extrabold text-white">Everything You Need to Know</motion.h2>
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