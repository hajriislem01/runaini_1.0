import { useState } from 'react';
import { FiMenu, FiX, FiArrowUpRight, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const guestLinks = [
  { name: 'Home', path: '/' },
  { name: 'Plans', path: '/pricing' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' }
];

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-md fixed w-full z-50">
            <div className="max-w-8xl mx-auto px-8 sm:px-28 flex items-center h-16">
                {/* Branding */}
                <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
                    <Link to="/" className="text-2xl font-bold flex items-center group">
                        <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent transition-all group-hover:from-blue-700 group-hover:to-blue-600">
                            RUN
                        </span>
                        <span className="text-gray-900 ml-1.5 font-medium">AINI</span>
                    </Link>
                </motion.div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center flex-grow justify-center">
                    <div className="flex space-x-10">
                        {guestLinks.map((link) => (
                            <motion.div key={link.name} className="relative" whileHover="hover" initial="initial">
                                <Link
                                    to={link.path}
                                    className="text-gray-600 hover:text-gray-900 px-2 py-1.5 font-medium transition-colors duration-300"
                                >
                                    {link.name}
                                    <motion.span
                                        className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-500"
                                        variants={{
                                            initial: { scaleX: 0, originX: 0 },
                                            hover: { scaleX: 1 },
                                        }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Auth Section */}
                <div className="hidden md:flex items-center space-x-4 ml-6">
                    <Link to="/login" className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition">
                        <FiUser size={22} />
                    </Link>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Link
                            to="/signup"
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-blue-200/50 flex items-center space-x-2"
                        >
                            Get Started
                        </Link>
                    </motion.div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center ml-auto">
                    <motion.button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        whileTap={{ scale: 0.95 }}
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden fixed top-16 left-0 w-full bg-white/95 backdrop-blur-lg shadow-xl border-t border-gray-100 z-40"
                    >
                        <div className="px-4 py-6 space-y-2">
                            {guestLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="block px-4 py-3 text-gray-600 hover:bg-blue-50 rounded-xl transition-colors hover:text-blue-600 font-medium group flex items-center justify-between"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span>{link.name}</span>
                                    <FiArrowUpRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </Link>
                            ))}

                            {/* Mobile Login Link */}
                            <Link
                                to="/login"
                                className="block px-4 py-3 text-gray-600 hover:bg-blue-50 rounded-xl transition-colors hover:text-blue-600 font-medium group flex items-center justify-between"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span>Login</span>
                                <FiUser className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </Link>

                            {/* Signup Button */}
                            <div className="pt-4 mt-2 border-t border-gray-100">
                                <motion.div whileTap={{ scale: 0.95 }} className="mx-2">
                                    <Link
                                        to="/signup"
                                        className="block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3.5 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all text-center shadow-md hover:shadow-lg font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;