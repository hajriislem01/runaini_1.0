import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiClock, FiTag, FiTrendingUp } from 'react-icons/fi';

const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const BG = 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)';

const CATS = ['All', 'Sports Science', 'AI & Tech', 'Coaching', 'Management'];

const posts = [
  {
    id: 1, cat: 'AI & Tech', read: '6 min',
    title: 'How AI Position Prediction is Reshaping Youth Football Development',
    excerpt: 'We built a 24-criteria ML model that outperforms traditional coach intuition in 78% of test cases. Here\'s the architecture behind it and why it matters for your academy.',
    gradient: `linear-gradient(135deg,${P}80,${B}50)`,
    tag: 'Featured',
    date: 'Apr 22, 2026',
  },
  {
    id: 2, cat: 'Sports Science', read: '8 min',
    title: 'The 6-Pillar Evaluation Framework: Beyond Goals and Assists',
    excerpt: 'Technical, Tactical, Physical, Mental, Health, Academic. Why we chose these six dimensions and how monthly scoring creates a full picture no scout could miss.',
    gradient: `linear-gradient(135deg,${B}80,${T}50)`,
    tag: 'Deep Dive',
    date: 'Apr 18, 2026',
  },
  {
    id: 3, cat: 'Coaching', read: '5 min',
    title: 'Building a Real-Time Notification System for Multi-Group Academies',
    excerpt: 'When you have 12 groups and 6 subgroups, event distribution is a logistics nightmare. We solved it with a hierarchical resolver that auto-targets the right people every time.',
    gradient: `linear-gradient(135deg,${T}80,${P}50)`,
    tag: 'Engineering',
    date: 'Apr 14, 2026',
  },
  {
    id: 4, cat: 'Management', read: '4 min',
    title: 'Why Your Academy Needs Subgroup Architecture (Not Just Teams)',
    excerpt: 'A "U-16 A" isn\'t a team — it\'s a subgroup. Understanding hierarchical squad management unlocks smarter notifications, targeted coaching, and accurate reporting.',
    gradient: `linear-gradient(135deg,${P}60,${T}40)`,
    tag: 'Strategy',
    date: 'Apr 10, 2026',
  },
  {
    id: 5, cat: 'Sports Science', read: '7 min',
    title: 'Fatigue, Sleep, and School Grades: The Hidden Metrics That Win Matches',
    excerpt: 'Our health and academic tracking pillars reveal that players with consistent sleep quality above 3/5 show 23% fewer technical errors in the following month.',
    gradient: `linear-gradient(135deg,${B}60,${P}40)`,
    tag: 'Research',
    date: 'Apr 6, 2026',
  },
  {
    id: 6, cat: 'AI & Tech', read: '5 min',
    title: 'PDF Report Generation at Scale: How We Export 100+ Player Evaluations',
    excerpt: 'Building a one-click PDF export that includes radar charts, pillar breakdowns, and attendance data — all in a branded document — required rethinking our serializer architecture.',
    gradient: `linear-gradient(135deg,${T}60,${B}40)`,
    tag: 'Engineering',
    date: 'Apr 2, 2026',
  },
];

/* ── Post card ───────────────────────────────────────────── */
function PostCard({ post, i, featured = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`glass-card rounded-2xl overflow-hidden cursor-pointer ${featured ? 'md:col-span-2' : ''}`}>
      {/* Thumb */}
      <div className="relative overflow-hidden" style={{ height: featured ? '280px' : '180px' }}>
        <div className="absolute inset-0 transition-transform duration-700"
          style={{ background: post.gradient, transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(white 1px,transparent 1px)`, backgroundSize: '20px 20px' }} />
        {/* Tag */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: T, border: `1px solid ${T}40` }}>
            {post.tag}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', color: '#fff9' }}>
            {post.cat}
          </span>
        </div>
        {/* Arrow */}
        <motion.div className="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          animate={{ scale: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
          style={{ background: `linear-gradient(135deg,${P},${B})` }}>
          <FiArrowRight size={16} className="text-white" />
        </motion.div>
      </div>
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><FiClock size={11} /> {post.read} read</span>
          <span>·</span>
          <span>{post.date}</span>
        </div>
        <h3 className={`font-extrabold text-white leading-snug mb-2 transition-colors duration-300 ${featured ? 'text-2xl' : 'text-base'}`}
          style={{ color: hovered ? B : 'white' }}>
          {post.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold transition-colors duration-300"
          style={{ color: hovered ? T : B }}>
          Read Article <FiArrowRight size={12} className="ml-1" />
        </div>
      </div>
    </motion.article>
  );
}

/* ══ BLOG PAGE ════════════════════════════════════════════════ */
const BlogPage = () => {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? posts : posts.filter(p => p.cat === active);
  const iV = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div style={{ background: BG }} className="text-white overflow-hidden min-h-screen">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(${B} 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />
        <motion.div className="relative z-10 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={cV}>
          <motion.div variants={iV}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: `${T}15`, border: `1px solid ${T}30`, color: T }}>
            <FiTrendingUp size={12} /> Sports Intelligence Blog
          </motion.div>
          <motion.h1 variants={iV} className="text-5xl md:text-6xl font-extrabold mb-4">
            The Playbook
          </motion.h1>
          <motion.p variants={iV} className="text-gray-400 text-lg max-w-xl mx-auto">
            Sports science, engineering insights, and coaching philosophy — straight from the team building the future of football management.
          </motion.p>
        </motion.div>
      </section>

      {/* ══ FILTERS ═════════════════════════════════════════ */}
      <section className="pb-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {CATS.map(cat => (
            <motion.button key={cat} onClick={() => setActive(cat)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={active === cat
                ? { background: `linear-gradient(135deg,${P},${B})`, color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>
              <FiTag className="inline mr-1.5" size={11} />{cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* ══ GRID ════════════════════════════════════════════ */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <PostCard key={post.id} post={post} i={i} featured={i === 0 && active === 'All'} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">No articles in this category yet — check back soon.</div>
          )}
        </div>
      </section>

      {/* ══ NEWSLETTER ═════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-3xl p-10 animate-border-flow" style={{ border: `1px solid ${P}40` }}>
            <h3 className="text-2xl font-extrabold text-white mb-2">Stay on the Cutting Edge</h3>
            <p className="text-gray-400 text-sm mb-6">New article every week. No spam. Unsubscribe anytime.</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder-gray-600 focus:outline-none"
                style={{ borderColor: 'rgba(144,43,209,0.3)' }} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: `linear-gradient(135deg,${P},${B})` }}>
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default BlogPage;
