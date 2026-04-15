import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Replace with actual API call
            setSuccess('Password reset instructions sent to your email');
            setEmail('');
        } catch (err) {
            setError('Failed to send reset instructions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-900 text-gray-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full -top-40 -left-40 animate-pulse"></div>
                <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-blue-800/10 to-purple-800/10 rounded-full -bottom-60 -right-60 rotate-45"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-2xl space-y-8 relative z-10 px-4"
            >
                <div className="text-center space-y-3">
                    <motion.h1
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent"
                    >
                        Reset Your Password
                    </motion.h1>
                    <p className="text-gray-400 text-lg">
                        Remember your password?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Login here
                        </Link>
                    </p>
                </div>

                <div className="space-y-8 bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-gray-800/60 shadow-2xl">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-900/50 border border-red-700/60 rounded-xl text-red-300"
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-green-900/50 border border-green-700/60 rounded-xl text-green-300"
                        >
                            {success}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <motion.div whileHover={{ y: -2 }}>
                                <label className="block text-sm font-medium mb-2">
                                    Email<span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </motion.div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending Instructions...' : 'Reset Password'}
                        </motion.button>

                        <div className="text-center pt-4 border-t border-gray-700/60">
                            <span className="text-gray-400">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                                    Sign up here
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;