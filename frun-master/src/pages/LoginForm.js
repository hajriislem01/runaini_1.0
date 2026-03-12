import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/login/', {
                 email,
                 password
             });
    //         const response = await axios.post(
    //     `${process.env.REACT_APP_API_URL}/login/`,
    //     { email, password }
    // );


            const { token, user: userData } = response.data; // Destructure with alias
            localStorage.setItem('token', token);
            
            // Make sure user data exists before storing
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
                
                setSuccess('Login successful! Redirecting...');
                setEmail('');
                setPassword('');

                // Redirect based on role
                setTimeout(() => {
                    if (userData.role === 'admin') {
                        navigate('/administration/Profile');
                    } else if (userData.role === 'coach') {
                        navigate('/coach/profile');
                    } else {
                        navigate('/players/profile');
                    }
                }, 1000);
            } else {
                setError('Login successful but user data missing');
            }
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Login failed. Please try again.');
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
                    <br />
                    <motion.h1
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent"
                    >
                        Welcome Back to RUNAINI
                    </motion.h1>
                    <p className="text-gray-400 text-lg">
                        I don’t have an account.{' '}
                        <a href="./signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Create one now
                        </a>
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
                        <h3 className="text-xl font-semibold text-blue-200 border-l-4 border-blue-500 pl-3">
                            Account Login
                        </h3>

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

                            <motion.div whileHover={{ y: -2 }}>
                                <label className="block text-sm font-medium mb-2">
                                    Password<span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Enter your password"
                                    required
                                />
                            </motion.div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        className="rounded bg-gray-800/40 border border-gray-700/60 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-400">Remember me</span>
                                </label>
                                <a href="./forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                                    Forgot Password?
                                </a>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </motion.button>

                            <div className="flex flex-col space-y-4 text-sm">
                                <div className="text-center pt-4 border-t border-gray-700/60">
                                    <span className="text-gray-400">
                                        Return to the homepage.{' '}
                                        <a href="./" className="text-blue-400 hover:text-blue-300 font-medium">
                                            Click Here
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginForm;
