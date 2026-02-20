import React, { useState, useEffect } from 'react';
import { FaChartLine, FaHistory, FaMagic } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiFilter } from 'react-icons/fi';

const positionMetrics = {
  Midfielder: [
    { key: 'assists', label: 'Assists' },
    { key: 'successfulPasses', label: 'Successful Passes' },
    { key: 'keyPasses', label: 'Key Passes' },
    { key: 'interceptions', label: 'Interceptions' },
    { key: 'tackles', label: 'Tackles' },
    { key: 'goals', label: 'Goals' },
  ],
  Defender: [
    { key: 'clearances', label: 'Clearances' },
    { key: 'blocks', label: 'Blocks' },
    { key: 'interceptions', label: 'Interceptions' },
    { key: 'duelsWon', label: 'Duels Won' },
    { key: 'marking', label: 'Marking Effectiveness' },
  ],
  Forward: [
    { key: 'goals', label: 'Goals Scored' },
    { key: 'shotsOnTarget', label: 'Shots on Target' },
    { key: 'dribbles', label: 'Dribbles Completed' },
    { key: 'assists', label: 'Assists' },
    { key: 'offTheBall', label: 'Off-the-ball Movements' },
  ],
  Goalkeeper: [
    { key: 'saves', label: 'Saves' },
    { key: 'cleanSheets', label: 'Clean Sheets' },
    { key: 'distribution', label: 'Distribution Accuracy' },
    { key: 'command', label: 'Command of Area' },
  ],
};

const CoachPlayers = () => {
  // Fetch players and groups from localStorage
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [search, setSearch] = useState('');
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [perfPlayer, setPerfPlayer] = useState(null);
  const [perfData, setPerfData] = useState({});
  const [showPerfHistory, setShowPerfHistory] = useState(false);
  const [historyPlayer, setHistoryPlayer] = useState(null);
  const [showPredictModal, setShowPredictModal] = useState(false);
  const [newPlayerData, setNewPlayerData] = useState({
    selectedGroup: '',
    selectedPlayer: '',
    // Initialize all metrics to empty strings
    ...Object.values(positionMetrics).flat().reduce((acc, metric) => {
      acc[metric.key] = '';
      return acc;
    }, {})
  });

  // Always fetch latest data from localStorage when page is shown or window regains focus
  const fetchData = () => {
    const storedPlayers = JSON.parse(localStorage.getItem('players')) || [];
    const storedGroups = JSON.parse(localStorage.getItem('playerGroups')) || [];
    setPlayers(storedPlayers);
    setGroups(storedGroups);
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, []);

  // Filter players by group and search
  const filteredPlayers = (players || []).filter(p =>
    (!selectedGroup || p.group === selectedGroup) &&
    (p.name?.toLowerCase().includes(search.toLowerCase()) || p.position?.toLowerCase().includes(search.toLowerCase()))
  );

  // Get players for selected group in prediction modal
  const getPlayersForGroup = (groupId) => {
    if (!groupId) return [];
    const group = groups.find(g => g.id === groupId);
    return group ? (players || []).filter(p => p.group === group.name) : [];
  };

  // Add this function to open prediction modal for a specific player
  const openPredictModal = (player) => {
    setNewPlayerData({
      selectedGroup: '',
      selectedPlayer: player.id,
      // Initialize all metrics to empty strings
      ...Object.values(positionMetrics).flat().reduce((acc, metric) => {
        acc[metric.key] = '';
        return acc;
      }, {})
    });
    setShowPredictModal(true);
  };

  // Handle performance modal open
  const openPerfModal = (player) => {
    setPerfPlayer(player);
    setPerfData({});
    setShowPerfModal(true);
  };

  // Handle performance save (for demo, just alert)
  const savePerformance = () => {
    const date = new Date().toISOString();
    const updatedPlayers = players.map(p => {
      if (p.id === perfPlayer.id) {
        const performances = Array.isArray(p.performances) ? p.performances : [];
        return {
          ...p,
          performances: [
            ...performances,
            { date, ...perfData }
          ]
        };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
    setShowPerfModal(false);
  };

  // View performance history
  const openPerfHistory = (player) => {
    // Find the latest player object by id
    const latest = (players || []).find(p => p.id === player.id) || player;
    setHistoryPlayer(latest);
    setShowPerfHistory(true);
  };

  // Add this function to predict position
  const predictPosition = () => {
    // Mock ML prediction - in a real app, you would call your ML model API here
    // This is a simplified example using weighted averages
    const metrics = newPlayerData;
    
    const positionScores = {
      Midfielder: 
        (parseFloat(metrics.assists || 0) * 0.3) +
        (parseFloat(metrics.successfulPasses || 0) * 0.2) +
        (parseFloat(metrics.keyPasses || 0) * 0.2) +
        (parseFloat(metrics.interceptions || 0) * 0.1) +
        (parseFloat(metrics.tackles || 0) * 0.1) +
        (parseFloat(metrics.goals || 0) * 0.1),
      
      Defender: 
        (parseFloat(metrics.clearances || 0) * 0.4) +
        (parseFloat(metrics.blocks || 0) * 0.3) +
        (parseFloat(metrics.interceptions || 0) * 0.1) +
        (parseFloat(metrics.duelsWon || 0) * 0.1) +
        (parseFloat(metrics.marking || 0) * 0.1),
      
      Forward: 
        (parseFloat(metrics.goals || 0) * 0.4) +
        (parseFloat(metrics.shotsOnTarget || 0) * 0.2) +
        (parseFloat(metrics.dribbles || 0) * 0.2) +
        (parseFloat(metrics.assists || 0) * 0.1) +
        (parseFloat(metrics.offTheBall || 0) * 0.1),
      
      Goalkeeper: 
        (parseFloat(metrics.saves || 0) * 0.5) +
        (parseFloat(metrics.cleanSheets || 0) * 0.3) +
        (parseFloat(metrics.distribution || 0) * 0.1) +
        (parseFloat(metrics.command || 0) * 0.1)
    };

    // Get position with highest score
    return Object.entries(positionScores)
      .sort((a, b) => b[1] - a[1])[0][0];
  };

  // Add this function to save the predicted player
  const savePredictedPlayer = () => {
    if (!newPlayerData.selectedPlayer) {
      alert('Please select a player first');
      return;
    }

    const position = predictPosition();
    
    // Find the selected player and update their position
    const updatedPlayers = players.map(p => {
      if (p.id === newPlayerData.selectedPlayer) {
        return {
          ...p,
          position: position,
          // Add the metrics as a new performance record
          performances: [
            ...(p.performances || []),
            {
              date: new Date().toISOString(),
              ...Object.keys(newPlayerData)
                .filter(key => !['selectedGroup', 'selectedPlayer'].includes(key))
                .reduce((acc, key) => {
                  acc[key] = newPlayerData[key];
                  return acc;
                }, {})
            }
          ]
        };
      }
      return p;
    });

    // Update players and localStorage
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
    
    // Close modal and reset form
    setShowPredictModal(false);
    setNewPlayerData({
      selectedGroup: '',
      selectedPlayer: '',
      ...Object.values(positionMetrics).flat().reduce((acc, metric) => {
        acc[metric.key] = '';
        return acc;
      }, {})
    });
  };

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
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            Players Management
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            Manage and track player performance data • {filteredPlayers.length} players available
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8"
        >
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#4fb0ff]">{players.length}</div>
            <div className="text-sm text-gray-400">Total Players</div>
          </div>
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#00d0cb]">{groups.length}</div>
            <div className="text-sm text-gray-400">Total Groups</div>
          </div>
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#902bd1]">{filteredPlayers.length}</div>
            <div className="text-sm text-gray-400">Filtered Players</div>
          </div>
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#4fb0ff]">
              {players.filter(p => p.performances && p.performances.length > 0).length}
            </div>
            <div className="text-sm text-gray-400">With Performance Data</div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FiFilter className="text-[#4fb0ff]" />
            <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">
              Filter Players
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Filter by Group</label>
              <select
                className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent transition-all"
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
              >
                <option value="">All Groups</option>
                {(groups || []).map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Search Players</label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search by name or position..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Players Table */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-800/80 border-b border-gray-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900/30 divide-y divide-gray-700/50">
                {(filteredPlayers || []).map((p, i) => (
                  <motion.tr 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center border-2 border-gray-600">
                            <span className="text-white font-semibold text-sm">
                              {p.name?.charAt(0)?.toUpperCase() || 'P'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{p.name}</div>
                          <div className="text-sm text-gray-400">{p.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-xl ${
                        p.position === 'Forward' ? 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white' :
                        p.position === 'Midfielder' ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white' :
                        p.position === 'Defender' ? 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-white' :
                        'bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] text-white'
                      }`}>
                        {p.position || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {p.age || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1.5 text-sm font-medium bg-gray-800 text-gray-300 rounded-xl border border-gray-700/50">
                        {p.group || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openPerfModal(p)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl text-sm font-medium transition-all duration-200"
                          title={`Add training performance for ${p.name}`}
                        >
                          <FaChartLine className="text-xs" /> Add
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openPerfHistory(p)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-all duration-200 border border-gray-700/50"
                          title={`View performance history for ${p.name}`}
                        >
                          <FaHistory className="text-xs" /> History
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openPredictModal(p)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#902bd1] to-[#00d0cb] hover:from-[#00d0cb] hover:to-[#902bd1] text-white rounded-xl text-sm font-medium transition-all duration-200"
                          title={`Predict position for ${p.name}`}
                        >
                          <FaMagic className="text-xs" /> Predict
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredPlayers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="text-gray-400">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-700/50">
                          <FiUsers className="text-gray-600 text-3xl" />
                        </div>
                        <p className="text-xl font-medium text-white mb-2">No players found</p>
                        <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Performance Modal */}
        <AnimatePresence>
          {showPerfModal && perfPlayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Add Performance Data</h2>
                    <button 
                      onClick={() => setShowPerfModal(false)}
                      className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center border-2 border-gray-600">
                        <span className="text-white font-semibold">
                          {perfPlayer.name?.charAt(0)?.toUpperCase() || 'P'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{perfPlayer.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${
                          perfPlayer.position === 'Forward' ? 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white' :
                          perfPlayer.position === 'Midfielder' ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white' :
                          perfPlayer.position === 'Defender' ? 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-white' :
                          'bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] text-white'
                        }`}>
                          {perfPlayer.position || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <h3 className="font-semibold text-gray-300 mb-3">Position-Specific Metrics:</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      {positionMetrics[perfPlayer.position]?.map(metric => (
                        <li key={metric.key} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#4fb0ff]"></div>
                          {metric.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    {(positionMetrics[perfPlayer.position] || []).map(metric => (
                      <div key={metric.key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{metric.label}</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent transition-all"
                          value={perfData[metric.key] || ''}
                          onChange={e => setPerfData(d => ({ ...d, [metric.key]: e.target.value }))}
                          min="0"
                          placeholder={`Enter ${metric.label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white px-6 py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 transition-all"
                      onClick={savePerformance}
                    >
                      <FaChartLine /> Save Performance
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3.5 rounded-xl font-medium transition-all border border-gray-700/50"
                      onClick={() => setShowPerfModal(false)}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance History Modal */}
        <AnimatePresence>
          {showPerfHistory && historyPlayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center border-2 border-gray-600">
                        <span className="text-white font-semibold text-lg">
                          {historyPlayer.name?.charAt(0)?.toUpperCase() || 'P'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Performance History</h2>
                        <p className="text-gray-300">{historyPlayer.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowPerfHistory(false)}
                      className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-6">
                    <span className="text-sm font-medium text-gray-300">Position: </span>
                    <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-xl ${
                      historyPlayer.position === 'Forward' ? 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white' :
                      historyPlayer.position === 'Midfielder' ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white' :
                      historyPlayer.position === 'Defender' ? 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-white' :
                      'bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] text-white'
                    }`}>
                      {historyPlayer.position || 'Unknown'}
                    </span>
                  </div>
                  
                  {Array.isArray(positionMetrics[historyPlayer.position]) && Array.isArray(historyPlayer?.performances) && historyPlayer.performances.length > 0 ? (
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-xl font-semibold text-white mb-6">Performance Records</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-900/50 rounded-xl border border-gray-700/50">
                          <thead className="bg-gray-800/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                              {positionMetrics[historyPlayer.position].map(metric => (
                                <th key={metric.key} className="px-6 py-4 text-left text-sm font-semibold text-gray-300">{metric.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700/50">
                            {historyPlayer.performances.map((perf, idx) => (
                              <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-white">
                                  {new Date(perf.date).toLocaleDateString()}
                                </td>
                                {positionMetrics[historyPlayer.position].map(metric => (
                                  <td key={metric.key} className="px-6 py-4 text-sm text-gray-300">
                                    {perf[metric.key] || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] rounded-full flex items-center justify-center">
                        <FaChartLine className="text-white text-2xl" />
                      </div>
                      <p className="text-white text-lg font-medium mb-2">No performance data available</p>
                      <p className="text-gray-400">Performance data for {historyPlayer.name} will appear here</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-8">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all border border-gray-700/50"
                      onClick={() => setShowPerfHistory(false)}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prediction Modal */}
        <AnimatePresence>
          {showPredictModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Predict Player Position</h2>
                    <button 
                      onClick={() => setShowPredictModal(false)}
                      className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Information</h3>
                    {(() => {
                      const selectedPlayer = players.find(p => p.id === newPlayerData.selectedPlayer);
                      if (!selectedPlayer) return null;
                      
                      return (
                        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center border-2 border-gray-600">
                            <span className="text-white font-semibold text-lg">
                              {selectedPlayer.name?.charAt(0)?.toUpperCase() || 'P'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{selectedPlayer.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-400">Group: {selectedPlayer.group || 'Unassigned'}</span>
                              <span className="text-gray-600">•</span>
                              <span className="text-sm text-gray-400">Current Position: </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${
                                selectedPlayer.position === 'Forward' ? 'bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white' :
                                selectedPlayer.position === 'Midfielder' ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white' :
                                selectedPlayer.position === 'Defender' ? 'bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-white' :
                                'bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] text-white'
                              }`}>
                                {selectedPlayer.position || 'No position'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Metrics</h3>
                    <p className="text-sm text-gray-400 mb-6">Enter the player's performance metrics to predict their optimal position</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.values(positionMetrics).flat().map(metric => (
                        <div key={metric.key}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{metric.label}</label>
                          <input
                            type="number"
                            placeholder={`Enter ${metric.label}`}
                            value={newPlayerData[metric.key]}
                            onChange={e => setNewPlayerData({...newPlayerData, [metric.key]: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-[#902bd1] to-[#00d0cb] hover:from-[#00d0cb] hover:to-[#902bd1] text-white px-6 py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 transition-all"
                      onClick={savePredictedPlayer}
                    >
                      <FaMagic /> Predict & Update Position
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3.5 rounded-xl font-medium transition-all border border-gray-700/50"
                      onClick={() => setShowPredictModal(false)}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CoachPlayers;