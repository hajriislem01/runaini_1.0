import { motion } from 'framer-motion';
import { useState } from 'react';
import API from './api' ;

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobRole: '',
    club: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!Object.values(formData).every(field => field.trim()) || !formData.jobRole) {
    setError('Please fill in all required fields');
    return;
  }

  if (!validateEmail(formData.email)) {
    setError('Please enter a valid email address');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (!/^\d{8}$/.test(formData.phone)) {
    setError('Phone number must be 8 numeric digits');
    return;
  }

  setIsLoading(true);

  try {
    const payload = {
  username: formData.email,           // <- requis (souvent = email)
  email: formData.email,
  password: formData.password,
  first_name: formData.firstName,
  last_name: formData.lastName,
  role: formData.jobRole,             // <- doit être "admin"
  club: formData.club,
  phone: formData.phone
};



    console.log("Payload envoyé :", payload);
    const response = await API.post('/signup/', payload);
    setSuccess('Account created successfully');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      jobRole: '',
      club: '',
      phone: ''
    });
  }  catch (err) {
  console.log("Erreur complète:", err.response?.data); // 👈 Très important
  if (err.response && err.response.data) {
    const data = err.response.data;
    setError(
      typeof data === 'string'
        ? data
        : data.detail || JSON.stringify(data) // fallback pour afficher tous les messages
    );
  } else {
    setError('Registration failed. Please try again.');
  }
} finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-900 text-gray-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
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
        {/* Header Section */}
        <div className="text-center space-y-3">
          <br />
          <motion.h1 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent"
          >
            Welcome to RUNAINI
          </motion.h1>
          <p className="text-gray-400 text-lg">
            Already have an account?{' '}
            <a href="./login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Login Now
            </a>
          </p>
        </div>

        {/* Form Container */}
        <div className="space-y-8 bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-gray-800/60 shadow-2xl">
          {/* Error/Success Messages */}
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

          <form onSubmit={handleSubmit}>
            {/* Personal Info Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-blue-200 border-l-4 border-blue-500 pl-3">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-sm font-medium mb-2">
                    First Name<span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter first name"
                    required
                  />
                </motion.div>

                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-sm font-medium mb-2">
                    Last Name<span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter last name"
                    required
                  />
                </motion.div>
              </div>
            </div>

            {/* Account Info Section */}
            <div className="space-y-6 mt-8">
              <h3 className="text-xl font-semibold text-blue-200 border-l-4 border-blue-500 pl-3">
                Account Details
              </h3>
              <div className="space-y-5">
                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-sm font-medium mb-2">
                    Email<span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="your.email@example.com"
                    required
                  />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <motion.div whileHover={{ y: -2 }}>
                    <label className="block text-sm font-medium mb-2">
                      Password<span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Create password"
                      required
                    />
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }}>
                    <label className="block text-sm font-medium mb-2">
                      Repeat Password<span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Confirm password"
                      required
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Professional Info Section */}
            <div className="space-y-6 mt-8">
              <h3 className="text-xl font-semibold text-blue-200 border-l-4 border-blue-500 pl-3">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-sm font-medium mb-2">
                    Job Role<span className="text-red-400">*</span>
                  </label>
                  <select
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="admin">Admin</option>
                    <option value="Coaching">Coaching</option>
                    <option value="Player">Player</option>
                  </select>
                </motion.div>

                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-sm font-medium mb-2">
                    Sport<span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value="Football"
                    disabled
                    className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl cursor-not-allowed"
                  />
                </motion.div>

                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-sm font-medium mb-2">
                    Club/Company<span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="club"
                    value={formData.club}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Organization name"
                    required
                  />
                </motion.div>

                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-sm font-medium mb-2">
                    Phone<span className="text-red-400">*</span>
                  </label>
                  <div className="flex">
                    <span className="px-4 py-3.5 bg-gray-800/40 border border-r-0 border-gray-700/60 rounded-l-xl">+216</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/60 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Phone number"
                      pattern="\d{8}"
                      required
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Action Section */}
            <div className="space-y-6 mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </motion.button>

              <p className="text-sm text-gray-400 text-center px-4">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Terms of Service</a> and{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Privacy Policy</a>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupForm;