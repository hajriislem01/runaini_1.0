import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiClock, FiTag, FiTrendingUp } from 'react-icons/fi';

const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';
const BG = 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)';

/* ── Post card ───────────────────────────────────────────── */
function PostCard({ post, i, featured = false }) {
  const { t } = useTranslation('blog');
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
          <span className="flex items-center gap-1">
            <FiClock size={11} /> {t('readLabel', { time: post.read })}
          </span>
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
          {t('readArticle')} <FiArrowRight size={12} className="ml-1" />
        </div>
      </div>
    </motion.article>
  );
}

/* ══ BLOG PAGE ════════════════════════════════════════════════ */
const BlogPage = () => {
  const { t } = useTranslation('blog');
  const iV = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  /* Category keys mapped to translation + original cat string (used for filtering) */
  const CATS = [
    { key: 'all',          label: t('categories.all'),          value: 'All' },
    { key: 'sportsScience',label: t('categories.sportsScience'),value: 'Sports Science' },
    { key: 'aiTech',       label: t('categories.aiTech'),       value: 'AI & Tech' },
    { key: 'coaching',     label: t('categories.coaching'),     value: 'Coaching' },
    { key: 'management',   label: t('categories.management'),   value: 'Management' },
  ];

  /* Posts — titles, excerpts and tags pulled from translation; cat + read stay as data keys */
  const posts = [
    {
      id: 1, catValue: 'AI & Tech', read: '6 min',
      title:   t('posts.post1.title'),
      excerpt: t('posts.post1.excerpt'),
      gradient: `linear-gradient(135deg,${P}80,${B}50)`,
      tag:  t('posts.post1.tag'),
      date: t('posts.post1.date'),
    },
    {
      id: 2, catValue: 'Sports Science', read: '8 min',
      title:   t('posts.post2.title'),
      excerpt: t('posts.post2.excerpt'),
      gradient: `linear-gradient(135deg,${B}80,${T}50)`,
      tag:  t('posts.post2.tag'),
      date: t('posts.post2.date'),
    },
    {
      id: 3, catValue: 'Coaching', read: '5 min',
      title:   t('posts.post3.title'),
      excerpt: t('posts.post3.excerpt'),
      gradient: `linear-gradient(135deg,${T}80,${P}50)`,
      tag:  t('posts.post3.tag'),
      date: t('posts.post3.date'),
    },
    {
      id: 4, catValue: 'Management', read: '4 min',
      title:   t('posts.post4.title'),
      excerpt: t('posts.post4.excerpt'),
      gradient: `linear-gradient(135deg,${P}60,${T}40)`,
      tag:  t('posts.post4.tag'),
      date: t('posts.post4.date'),
    },
    {
      id: 5, catValue: 'Sports Science', read: '7 min',
      title:   t('posts.post5.title'),
      excerpt: t('posts.post5.excerpt'),
      gradient: `linear-gradient(135deg,${B}60,${P}40)`,
      tag:  t('posts.post5.tag'),
      date: t('posts.post5.date'),
    },
    {
      id: 6, catValue: 'AI & Tech', read: '5 min',
      title:   t('posts.post6.title'),
      excerpt: t('posts.post6.excerpt'),
      gradient: `linear-gradient(135deg,${T}60,${B}40)`,
      tag:  t('posts.post6.tag'),
      date: t('posts.post6.date'),
    },
  ];

  const [activeValue, setActiveValue] = useState('All');
  const filtered = activeValue === 'All' ? posts : posts.filter(p => p.catValue === activeValue);

  /* Displayed category label on each card — look up translated label from catValue */
  const catLabel = (catValue) => {
    const found = CATS.find(c => c.value === catValue);
    return found ? found.label : catValue;
  };

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
            <FiTrendingUp size={12} /> {t('hero.badge')}
          </motion.div>
          <motion.h1 variants={iV} className="text-5xl md:text-6xl font-extrabold mb-4">
            {t('hero.title')}
          </motion.h1>
          <motion.p variants={iV} className="text-gray-400 text-lg max-w-xl mx-auto">
            {t('hero.description')}
          </motion.p>
        </motion.div>
      </section>

      {/* ══ FILTERS ═════════════════════════════════════════ */}
      <section className="pb-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {CATS.map(cat => (
            <motion.button key={cat.key} onClick={() => setActiveValue(cat.value)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={activeValue === cat.value
                ? { background: `linear-gradient(135deg,${P},${B})`, color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>
              <FiTag className="inline mr-1.5" size={11} />{cat.label}
            </motion.button>
          ))}
        </div>
      </section>

      {/* ══ GRID ════════════════════════════════════════════ */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <PostCard
                key={post.id}
                post={{ ...post, cat: catLabel(post.catValue) }}
                i={i}
                featured={i === 0 && activeValue === 'All'}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">{t('noArticles')}</div>
          )}
        </div>
      </section>

      {/* ══ NEWSLETTER ═════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-3xl p-10 animate-border-flow" style={{ border: `1px solid ${P}40` }}>
            <h3 className="text-2xl font-extrabold text-white mb-2">{t('newsletter.title')}</h3>
            <p className="text-gray-400 text-sm mb-6">{t('newsletter.subtitle')}</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder-gray-600 focus:outline-none"
                style={{ borderColor: 'rgba(144,43,209,0.3)' }} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: `linear-gradient(135deg,${P},${B})` }}>
                {t('newsletter.cta')}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default BlogPage;
