import React from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail,
  FiCalendar, FiActivity, FiUsers, FiGrid, FiTrendingUp, FiHeart
} from 'react-icons/fi';
import { FaFutbol } from 'react-icons/fa';

const PlayerProfileView = ({ player, stats, onBack }) => {
  if (!player) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div
      className="w-full text-white"
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top Actions */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-between items-center mb-8 gap-4">
          {onBack ? (
            <button onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <FiArrowLeft className="text-xl" />
              <span className="font-medium">Go Back</span>
            </button>
          ) : (
            <div></div> /* Empty div to keep flex space-between rendering correctly */
          )}
        </motion.div>

        {/* Hero Section */}
        <motion.div variants={itemVariants} className="relative mb-8 pt-8 md:pt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-[#902bd1]/20 to-[#4fb0ff]/20 rounded-3xl blur-3xl -z-10"></div>
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 md:p-8 relative overflow-hidden">

            {/* Glowing borders top-right and bottom-left for aesthetic */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4fb0ff]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#902bd1]/20 rounded-full blur-3xl"></div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1"
                style={{ background: 'linear-gradient(135deg, #902bd1, #00d0cb, #4fb0ff)' }}
              >
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden border-4 border-[#0a0a0a]">
                  {player.profile_picture ? (
                    <img src={player.profile_picture} alt={player.full_name || player.name} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="text-5xl text-gray-400" />
                  )}
                </div>
                {/* Status Indicator */}
                {(player.status) && (
                  <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-[#0a0a0a] ${player.status === 'Active' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                )}
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left mt-2">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
                  {player.full_name || player.name || 'Unnamed Player'}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="px-4 py-1.5 rounded-full bg-[#4fb0ff]/20 text-[#4fb0ff] border border-[#4fb0ff]/30 font-semibold shadow-[0_0_10px_rgba(79,176,255,0.2)]">
                    {player.position || 'No Position'}
                  </span>
                  {player.status && (
                     <span className={`px-4 py-1.5 rounded-full border font-semibold ${player.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {player.status}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 max-w-2xl leading-relaxed">
                  {player.bio || 'Dedicated academy player striving for excellence both on and off the pitch. Representing the core values of the team.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (Primary Stats - 4 cards) */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
            <motion.div variants={itemVariants} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl hover:border-gray-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#902bd1]/20 to-[#00d0cb]/20 rounded-xl">
                  <FiActivity className="text-2xl text-[#00d0cb]" />
                </div>
                <h3 className="text-gray-400 font-medium whitespace-nowrap">Matches</h3>
              </div>
              <p className="text-3xl md:text-5xl font-bold text-white">{stats?.matches ?? '-'}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl hover:border-gray-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#4fb0ff]/20 to-[#902bd1]/20 rounded-xl">
                  <FaFutbol className="text-2xl text-[#4fb0ff]" />
                </div>
                <h3 className="text-gray-400 font-medium whitespace-nowrap">Goals</h3>
              </div>
              <p className="text-3xl md:text-5xl font-bold text-white">{stats?.goals ?? '-'}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl hover:border-gray-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                  <FiTrendingUp className="text-2xl text-green-400" />
                </div>
                <h3 className="text-gray-400 font-medium whitespace-nowrap">Attendance</h3>
              </div>
              <p className="text-3xl md:text-5xl font-bold text-white">{stats?.attendance ? `${stats.attendance}%` : '-'}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl hover:border-gray-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl">
                  <FiHeart className="text-2xl text-red-400" />
                </div>
                <h3 className="text-gray-400 font-medium whitespace-nowrap">Health</h3>
              </div>
              <p className="text-xl md:text-4xl font-bold text-white">{stats?.health || 'Optimal'}</p>
            </motion.div>

            {/* Team Info Span 2 */}
            <motion.div variants={itemVariants} className="col-span-2 bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-6 md:p-8 rounded-3xl hover:border-[#902bd1]/30 transition-colors">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <FiUsers className="text-[#902bd1]" /> Team Affiliation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a]/50 border border-gray-700 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-[#902bd1]/20 rounded-xl text-[#902bd1]">
                    <FiUsers size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Main Group</p>
                    <p className="text-lg text-white font-medium">
                      {typeof player.group === 'object' ? player.group?.name : player.group || 'Not Assigned'}
                    </p>
                  </div>
                </div>
                <div className="bg-[#0a0a0a]/50 border border-gray-700 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-[#4fb0ff]/20 rounded-xl text-[#4fb0ff]">
                    <FiGrid size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Sub Group</p>
                    <p className="text-lg text-white font-medium">
                      {typeof player.subgroup === 'object' ? player.subgroup?.name : player.subgroup || 'Not Assigned'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column (Personal Details) */}
          <div className="lg:col-span-1">
            <motion.div variants={itemVariants} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-6 md:p-8 rounded-3xl h-full">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <FiUser className="text-[#00d0cb]" /> Identity
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-800 rounded-xl text-gray-400">
                    <FiPhone />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-gray-200">{player.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-800 rounded-xl text-gray-400">
                    <FiMail />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="text-gray-200 break-all">{player.user?.email || player.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-800 rounded-xl text-gray-400">
                    <FiCalendar />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                    <p className="text-gray-200">{player.date_of_birth || 'N/A'}</p>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-700/50 my-4"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0a]/50 border border-gray-700/50 p-4 rounded-2xl text-center">
                    <p className="text-xs text-gray-500 mb-1">Height</p>
                    <p className="text-xl font-semibold text-[#00d0cb]">{player.height ? `${player.height} cm` : '--'}</p>
                  </div>
                  <div className="bg-[#0a0a0a]/50 border border-gray-700/50 p-4 rounded-2xl text-center">
                    <p className="text-xs text-gray-500 mb-1">Weight</p>
                    <p className="text-xl font-semibold text-[#902bd1]">{player.weight ? `${player.weight} kg` : '--'}</p>
                  </div>
                  {player.foot && (
                    <div className="bg-[#0a0a0a]/50 border border-gray-700/50 p-4 rounded-2xl text-center col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Preferred Foot</p>
                      <p className="text-lg font-semibold text-white">{player.foot}</p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default PlayerProfileView;
