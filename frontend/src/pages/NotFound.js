import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-br from-blue-50 to-indigo-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div
                className="relative mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 120 }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-red-500 to-pink-600 blur-2xl opacity-30 rounded-full" />
                <div className="relative w-48 h-48 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                    <motion.span
                        className="text-8xl font-bold text-white"
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        !
                    </motion.span>
                </div>
            </motion.div>

            <motion.h1
                className="text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-700 drop-shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                404 - PAGE NOT FOUND
            </motion.h1>

            <motion.p
                className="text-xl mb-8 text-gray-700 max-w-2xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                 The page you are looking for might have been removed
                had its name changed or is temporarily unavailable.
            
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: 'spring' }}
            >
                <Link
                    to="/"
                    className="relative inline-flex items-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl hover:scale-105 hover:shadow-xl shadow-blue-200 hover:shadow-blue-200/50"
                >
                    <motion.span
                        className="mr-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 12l7-7m0 0l7 7m-7-7v18"
                            />
                        </svg>
                    </motion.span>
                    GO TO HOMEPAGE
                    <div className="absolute inset-0 border-2 border-white/30 rounded-xl" />
                </Link>
            </motion.div>

        </motion.div>
    );
};

export default NotFound;