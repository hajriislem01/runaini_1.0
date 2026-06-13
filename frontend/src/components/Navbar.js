import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight, FiArrowLeft, FiUser } from 'react-icons/fi';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

// Brand Colors (Synchronized with global CSS)
const P = '#902bd1'; // Primary Purple
const B = '#4fb0ff'; // Secondary Blue
const T = '#00d0cb'; // Cyan/Teal
const G = '#00f5ff'; // Electric Blue

const links = [
  { key: 'home', path: '/' },
  { key: 'plans', path: '/pricing' },
  { key: 'blog', path: '/blog' },
  { key: 'about', path: '/about' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('navbar');
  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isPublic = ['/', '/pricing', '/blog', '/about'].includes(pathname);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 ${scrolled ? 'py-3' : 'py-5'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        background: '#05050a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>

      <div className="max-w-[1400px] mx-auto flex items-center justify-between lg:grid lg:grid-cols-3">

        {/* Left: Logo */}
        <div className={`flex ${isRtl ? 'justify-end lg:justify-start' : 'justify-start'}`}>
          <Link to="/" className="text-2xl font-black flex items-center gap-0.5 tracking-tighter" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
            <span style={{ background: `linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RUNAINI
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex justify-center">
          <div className="flex items-center p-1 bg-white/[0.03] rounded-full border border-white/[0.05] backdrop-blur-md">
            <LayoutGroup id="nav-capsule">
              {links.map(l => {
                const active = pathname === l.path;
                return (
                  <Link key={l.key} to={l.path}
                    className="relative px-5 py-2 text-[13px] font-bold transition-all duration-300 tracking-wide uppercase"
                    style={{ color: active ? 'white' : 'rgba(255,255,255,0.5)' }}>
                    {active && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-full z-0"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 hover:text-white transition-colors">
                      {t(`nav.${l.key}`)}
                    </span>
                  </Link>
                );
              })}
            </LayoutGroup>
          </div>
        </div>

        {/* Right: Action Items */}
        <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} items-center gap-3 lg:gap-4`}>

          <LanguageSwitcher />
          
          <Link to="/login"
            className="hidden lg:flex items-center gap-2 text-[13px] font-bold text-white/50 hover:text-white transition-all tracking-widest uppercase">
            <FiUser size={14} className="text-[#00f5ff]" /> {t('actions.login')}
          </Link>

          {/* Desktop Get Started CTA */}
          <button
            onClick={() => navigate('/request-academy')}
            className="hidden lg:flex px-5 py-2 rounded-full text-[13px] font-bold text-white uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
            style={{ background: `linear-gradient(135deg,${P},${B})` }}>
            {t('navbar.getStarted')}
          </button>

          {/* Mobile Toggle */}
          <button onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-full transition-colors"
            style={{ color: open ? G : 'white', background: 'rgba(255,255,255,0.05)' }}>
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 bg-[#05050a] border-b border-white/5 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-2">
              {links.map((l, i) => (
                <motion.div
                  key={l.key}
                  initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={l.path}
                    className="flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold tracking-widest uppercase transition-all bg-transparent text-gray-100 border border-gray-600 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4fb0ff] hover:border-gray-500"
                    style={{
                      color: pathname === l.path ? G : 'rgba(255,255,255,0.5)',
                      background: pathname === l.path ? 'rgba(255,255,255,0.03)' : 'transparent',
                      border: pathname === l.path ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent'
                    }}>
                    <span>{t(`nav.${l.key}`)}</span>
                    {isRtl ? <FiArrowLeft size={14} className="opacity-30" /> : <FiArrowRight size={14} className="opacity-30" />}
                  </Link>
                </motion.div>
              ))}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                <Link to="/login" className="flex items-center justify-center py-4 rounded-2xl text-sm font-bold text-white/50 uppercase tracking-widest bg-white/[0.03]">
                  {t('actions.login')}
                </Link>
                <Link to="/request-academy" className="flex items-center justify-center py-4 rounded-2xl text-sm font-bold text-white uppercase tracking-widest" style={{ background: `linear-gradient(135deg,${P},${B})` }}>
                  {t('actions.joinNow')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;