import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

const P = '#902bd1';
const B = '#4fb0ff';
const T = '#00d0cb';

const cols = [
  { title: 'Platform', links: [{ t:'Home', p:'/' }, { t:'Plans & Pricing', p:'/pricing' }, { t:'Blog', p:'/blog' }, { t:'About', p:'/about' }] },
  { title: 'Product',  links: [{ t:'Admin Dashboard', p:'/login' }, { t:'Coach Suite', p:'/login' }, { t:'Player Portal', p:'/login' }, { t:'Sign Up Free', p:'/signup' }] },
  { title: 'Legal',    links: [{ t:'Privacy Policy', p:'#' }, { t:'Terms of Service', p:'#' }, { t:'Cookie Policy', p:'#' }] },
];

const socials = [
  { icon: FaTwitter,   label: 'Twitter',   href: '#' },
  { icon: FaLinkedin,  label: 'LinkedIn',  href: '#' },
  { icon: FaInstagram, label: 'Instagram', href: '#' },
  { icon: FaGithub,    label: 'GitHub',    href: '#' },
];

const Footer = () => (
  <footer style={{ background:'#000000', borderTop:'1px solid rgba(144,43,209,0.2)' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link to="/" className="text-2xl font-extrabold inline-flex mb-4">
            <span style={{ background:`linear-gradient(90deg,${P},${B})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>RUN</span>
            <span className="text-white">AI</span>
            <span style={{ color: T }}>NI</span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            The complete football management platform — built for admins, coaches, and players who demand more.
          </p>
          {/* Social */}
          <div className="flex gap-2">
            {socials.map(s => (
              <motion.a key={s.label} href={s.href} aria-label={s.label}
                whileHover={{ y:-3, scale:1.1 }} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                style={{ background:'rgba(144,43,209,0.1)', border:'1px solid rgba(144,43,209,0.2)' }}>
                <s.icon size={15} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Columns */}
        {cols.map(col => (
          <div key={col.title}>
            <h5 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{col.title}</h5>
            <ul className="space-y-2.5">
              {col.links.map(l => (
                <motion.li key={l.t} whileHover={{ x:4 }}>
                  <Link to={l.p} className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-1 group">
                    <FiArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: T }} />
                    {l.t}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop:'1px solid rgba(144,43,209,0.1)' }}>
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} RunAiNi. All rights reserved.
        </p>
        <p className="text-gray-700 text-xs flex items-center gap-1">
          Crafted with precision for football's elite ⚽
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;