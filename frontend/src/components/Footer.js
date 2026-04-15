import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-8 lg:gap-12"
        >
          {/* Brand Column */}
          <div className="space-y-5">
            <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
              <Link to="/" className="text-2xl font-bold flex items-center">
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  RUN
                </span>
                <span className="text-white ml-1">AINI</span>
              </Link>
            </motion.div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Transform your team's performance with AI-driven insights and advanced analytics
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h5 className="text-white font-semibold mb-5 text-lg">Platform</h5>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Security'].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="group flex items-center text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h5 className="text-white font-semibold mb-5 text-lg">Legal</h5>
            <ul className="space-y-3">
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="group flex items-center text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item} Policy
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h5 className="text-white font-semibold mb-5 text-lg">Connect</h5>
            <div className="flex space-x-3">
              {[
                { icon: <FaFacebook />, label: 'Facebook' },
                { icon: <FaTwitter />, label: 'Twitter' },
                { icon: <FaInstagram />, label: 'Instagram' },
                { icon: <FaLinkedin />, label: 'LinkedIn' },
                { icon: <FaYoutube />, label: 'YouTube' },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  whileHover={{ y: -3 }}
                  className="text-gray-400 hover:text-white p-2.5 rounded-full bg-gray-900 hover:bg-gradient-to-br from-blue-600 to-blue-400 transition-all shadow-sm hover:shadow-blue-500/20"
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="border-t border-gray-800 mt-8 pt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} RUNAINI. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;