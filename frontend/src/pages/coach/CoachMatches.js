
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

const mockVideos = [
  {
    id: '1',
    title: 'Match vs. Lions',
    date: 'Uploaded 2 days ago',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    duration: '90:00',
    players: 22,
    views: 245,
    tags: ['Match', 'Full Game', 'Analysis']
  },
  {
    id: '2',
    title: 'Training Session - Passing Drills',
    date: 'Uploaded 1 week ago',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
    duration: '45:30',
    players: 16,
    views: 189,
    tags: ['Training', 'Passing', 'Technical']
  },
  {
    id: '3',
    title: 'Match vs. Tigers',
    date: 'Uploaded 2 weeks ago',
    thumbnail: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    duration: '92:15',
    players: 24,
    views: 312,
    tags: ['Match', 'Tactical', 'Highlights']
  },
  {
    id: '4',
    title: 'Training Session - Shooting Practice',
    date: 'Uploaded 3 weeks ago',
    thumbnail: 'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=400&q=80',
    duration: '60:45',
    players: 18,
    views: 201,
    tags: ['Training', 'Shooting', 'Finishing']
  },
  {
    id: '5',
    title: 'Match vs. Eagles - Final',
    date: 'Uploaded 1 month ago',
    thumbnail: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=400&q=80',
    duration: '95:30',
    players: 26,
    views: 498,
    tags: ['Match', 'Final', 'Championship']
  },
  {
    id: '6',
    title: 'Tactical Analysis - Defensive Organization',
    date: 'Uploaded 1 month ago',
    thumbnail: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=400&q=80',
    duration: '38:20',
    players: 11,
    views: 156,
    tags: ['Analysis', 'Tactical', 'Defense']
  }
];

const CoachMatches = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredVideos = mockVideos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white p-6 md:p-8 lg:p-10"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Video Library
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            Review match footage and training sessions • {filteredVideos.length} videos available
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search videos by title, tags, or date..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent text-lg"
            />
          </div>
        </motion.div>

        {/* Videos Grid */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
              All Videos
            </h2>
            <div className="text-gray-400">
              Showing {filteredVideos.length} of {mockVideos.length} videos
            </div>
          </div>

          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVideos.map(video => (
                <motion.div
                  key={video.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/coach/video/${video.id}`)}
                  className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden cursor-pointer group hover:border-gray-600 transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Thumbnail */}
                    <div className="relative md:w-2/5">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#4fb0ff] transition-colors">
                          {video.title}
                        </h3>
                        <FiArrowRight className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                      </div>

                      <p className="text-gray-400 text-sm mb-4">{video.date}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="text-lg font-bold text-[#4fb0ff]">{video.players}</div>
                          <div className="text-xs text-gray-400">Players</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="text-lg font-bold text-[#00d0cb]">{video.views}</div>
                          <div className="text-xs text-gray-400">Views</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="text-lg font-bold text-[#902bd1]">{video.tags.length}</div>
                          <div className="text-xs text-gray-400">Tags</div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                              tag === 'Match' || tag === 'Final'
                                ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white'
                                : tag === 'Training'
                                ? 'bg-gradient-to-r from-[#00d0cb] to-[#902bd1] text-white'
                                : 'bg-gray-800 text-gray-300'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 border-2 border-dashed border-gray-700/50 rounded-2xl bg-gray-900/30"
            >
              <div className="text-6xl mb-4 text-gray-600">📹</div>
              <h3 className="text-2xl font-bold text-white mb-2">No videos found</h3>
              <p className="text-gray-400">Try a different search term</p>
            </motion.div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredVideos.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="flex justify-center mt-12"
          >
            <nav className="flex items-center gap-2 bg-gray-900/70 backdrop-blur-sm p-2 rounded-2xl border border-gray-700/50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                disabled
              >
                {'<'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white font-bold"
              >
                1
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                2
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                3
              </motion.button>
              
              <span className="px-2 text-gray-400">...</span>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                10
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {'>'}
              </motion.button>
            </nav>
          </motion.div>
        )}

        {/* Stats Summary */}
        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-2">Total Video Hours</div>
            <div className="text-2xl font-bold text-[#4fb0ff]">6.5 hrs</div>
          </div>
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-2">AI Analysis Available</div>
            <div className="text-2xl font-bold text-[#00d0cb]">4 videos</div>
          </div>
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-2">Most Viewed</div>
            <div className="text-2xl font-bold text-[#902bd1]">Match vs. Eagles</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CoachMatches;