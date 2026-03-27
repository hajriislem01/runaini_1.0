import React, { useState, useEffect } from 'react';
import { FaChartLine, FaHistory, FaMagic, FaStar, FaRegStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { format, addMonths, subMonths } from 'date-fns';

// ✅ Critères par pilier et par poste
const PILLARS = {
  Forward: {
    technical: ['Finishing', 'Dribbling', 'Ball control', 'Shooting power'],
    physical: ['Speed', 'Explosivity', 'Strength', 'Agility'],
    mental: ['Confidence', 'Attitude', 'Resilience', 'Decision making'],
    tactical: ['Positioning', 'Off-the-ball', 'Pressing', 'Game reading'],
  },
  Midfielder: {
    technical: ['Passing', 'Ball control', 'Dribbling', 'Shooting'],
    physical: ['Endurance', 'Speed', 'Strength', 'Agility'],
    mental: ['Vision', 'Leadership', 'Resilience', 'Concentration'],
    tactical: ['Positioning', 'Pressing', 'Transition', 'Game reading'],
  },
  Defender: {
    technical: ['Tackling', 'Heading', 'Passing', 'Clearances'],
    physical: ['Strength', 'Speed', 'Endurance', 'Jumping'],
    mental: ['Concentration', 'Leadership', 'Discipline', 'Resilience'],
    tactical: ['Marking', 'Positioning', 'Anticipation', 'Game reading'],
  },
  Goalkeeper: {
    technical: ['Saves', 'Distribution', 'Footwork', 'Catching'],
    physical: ['Reflexes', 'Explosivity', 'Strength', 'Agility'],
    mental: ['Concentration', 'Leadership', 'Communication', 'Resilience'],
    tactical: ['Positioning', 'Command of area', 'Game reading', 'Decision making'],
  },
};

const PILLAR_COLORS = {
  technical: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', bar: '#4fb0ff' },
  physical: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', bar: '#22c55e' },
  mental: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', bar: '#a855f7' },
  tactical: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', bar: '#f59e0b' },
};

// ✅ Star Rating component
const StarRating = ({ value = 0, onChange, max = 10 }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => (
        <button key={i} type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          className="text-xl focus:outline-none transition-transform hover:scale-110">
          {i < display
            ? <FaStar className="text-amber-400" style={{ fontSize: 16 }} />
            : <FaRegStar className="text-gray-600" style={{ fontSize: 16 }} />
          }
        </button>
      ))}
      <span className="ml-2 text-sm font-bold text-white">{value}/10</span>
    </div>
  );
};

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
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [search, setSearch] = useState('');

  // ✅ Evaluation modal
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalPlayer, setEvalPlayer] = useState(null);
  const [evalMonth, setEvalMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [activePillar, setActivePillar] = useState('technical');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [evalForm, setEvalForm] = useState({
    scores: {},
    attendance_present: '',
    attendance_total: '',
    strength: '',
    to_improve: '',
    objective: '',
    comment: '',
  });

  // Old modals
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [perfPlayer, setPerfPlayer] = useState(null);
  const [perfData, setPerfData] = useState({});
  const [showPerfHistory, setShowPerfHistory] = useState(false);
  const [historyPlayer, setHistoryPlayer] = useState(null);
  const [showPredictModal, setShowPredictModal] = useState(false);
  const [predictPlayer, setPredictPlayer] = useState(null);
  const [predictData, setPredictData] = useState({});
  const [predictedPosition, setPredictedPosition] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [playersRes, groupsRes] = await Promise.all([
        API.get('players/'),
        API.get('groups/')
      ]);
      setPlayers(playersRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      toast.error('Failed to load players');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchGroup = !selectedGroup || p.group?.id === parseInt(selectedGroup);
    const matchSearch = !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.position?.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  // ✅ Open evaluation modal
  const openEvalModal = (player) => {
    setEvalPlayer(player);
    setActivePillar('technical');
    const pos = player.position || 'Forward';
    const defaultScores = {};
    if (PILLARS[pos]) {
      Object.entries(PILLARS[pos]).forEach(([pillar, criteria]) => {
        criteria.forEach(c => { defaultScores[`${pillar}_${c}`] = 0; });
      });
    }
    setEvalForm({
      scores: defaultScores,
      attendance_present: '',
      attendance_total: '',
      strength: '',
      to_improve: '',
      objective: '',
      comment: '',
    });
    setShowEvalModal(true);
  };

  // ✅ Compute pillar average
  const getPillarAvg = (pillar) => {
    const pos = evalPlayer?.position || 'Forward';
    const criteria = PILLARS[pos]?.[pillar] || [];
    if (!criteria.length) return 0;
    const sum = criteria.reduce((acc, c) => acc + (evalForm.scores[`${pillar}_${c}`] || 0), 0);
    return (sum / criteria.length).toFixed(1);
  };

  // ✅ Compute overall score
  const getOverallScore = () => {
    const pillars = ['technical', 'physical', 'mental', 'tactical'];
    const avg = pillars.reduce((acc, p) => acc + parseFloat(getPillarAvg(p)), 0) / pillars.length;
    return avg.toFixed(1);
  };

  // ✅ Submit evaluation → POST /api/reports/
  const handleSubmitEval = async (e) => {
    e.preventDefault();
    if (!evalForm.strength.trim()) { toast.error('Strength is required'); return; }
    if (!evalForm.to_improve.trim()) { toast.error('To improve is required'); return; }
    if (!evalForm.objective.trim()) { toast.error('Objective is required'); return; }

    setIsSubmittingEval(true);
    try {
      const payload = {
        player: evalPlayer.id,
        month: evalMonth,
        scores: evalForm.scores,
        technical_score: getPillarAvg('technical'),
        physical_score: getPillarAvg('physical'),
        mental_score: getPillarAvg('mental'),
        tactical_score: getPillarAvg('tactical'),
        overall_score: getOverallScore(),
        attendance_present: parseInt(evalForm.attendance_present) || 0,
        attendance_total: parseInt(evalForm.attendance_total) || 0,
        strength: evalForm.strength,
        to_improve: evalForm.to_improve,
        objective: evalForm.objective,
        comment: evalForm.comment,
      };
      await API.post('reports/', payload);
      toast.success(`Evaluation saved for ${evalPlayer.full_name} ✅`);
      setShowEvalModal(false);
    } catch (error) {
      const msg = error.response?.data?.non_field_errors?.[0] || 'Failed to save evaluation';
      toast.error(msg);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Old modals logic
  const savePerformance = () => {
    const updatedPlayers = players.map(p => {
      if (p.id === perfPlayer.id) {
        const performances = Array.isArray(p.performances) ? p.performances : [];
        return { ...p, performances: [...performances, { date: new Date().toISOString(), ...perfData }] };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    setShowPerfModal(false);
    toast.success('Performance saved!');
  };

  const savePredictedPlayer = () => {
    const metrics = predictData;
    const scores = {
      Midfielder: (parseFloat(metrics.assists||0)*.3)+(parseFloat(metrics.successfulPasses||0)*.2)+(parseFloat(metrics.keyPasses||0)*.2)+(parseFloat(metrics.interceptions||0)*.1)+(parseFloat(metrics.tackles||0)*.1)+(parseFloat(metrics.goals||0)*.1),
      Defender: (parseFloat(metrics.clearances||0)*.4)+(parseFloat(metrics.blocks||0)*.3)+(parseFloat(metrics.interceptions||0)*.1)+(parseFloat(metrics.duelsWon||0)*.1)+(parseFloat(metrics.marking||0)*.1),
      Forward: (parseFloat(metrics.goals||0)*.4)+(parseFloat(metrics.shotsOnTarget||0)*.2)+(parseFloat(metrics.dribbles||0)*.2)+(parseFloat(metrics.assists||0)*.1)+(parseFloat(metrics.offTheBall||0)*.1),
      Goalkeeper: (parseFloat(metrics.saves||0)*.5)+(parseFloat(metrics.cleanSheets||0)*.3)+(parseFloat(metrics.distribution||0)*.1)+(parseFloat(metrics.command||0)*.1),
    };
    const position = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    setPredictedPosition(position);
    toast.success(`Predicted position: ${position} ✅`);
  };

  const positionColor = (pos) => {
    switch (pos) {
      case 'Forward': return 'from-[#902bd1] to-[#00d0cb]';
      case 'Midfielder': return 'from-[#902bd1] to-[#4fb0ff]';
      case 'Defender': return 'from-[#00d0cb] to-[#4fb0ff]';
      default: return 'from-[#4fb0ff] to-[#902bd1]';
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Injured': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.div
      className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            My Players
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            {isLoading ? 'Loading...' : `${filteredPlayers.length} players available`}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Players', value: players.length, color: '#4fb0ff' },
            { label: 'Total Groups', value: groups.length, color: '#00d0cb' },
            { label: 'Filtered', value: filteredPlayers.length, color: '#902bd1' },
            { label: 'Active', value: players.filter(p => p.status === 'Active').length, color: '#22c55e' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 text-center">
              {isLoading ? <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse mx-auto mb-2" /> :
                <div className="text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>}
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <FiFilter className="text-[#4fb0ff]" />
            <span className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] bg-clip-text text-transparent">Filter Players</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Group</label>
              <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]">
                <option value="">All Groups</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Players</label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by name or position..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Players Table */}
        <motion.div variants={itemVariants} className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-800/80 border-b border-gray-700/50">
                    {['Player', 'Position', 'Group', 'Subgroup', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-900/30 divide-y divide-gray-700/50">
                  {filteredPlayers.length > 0 ? filteredPlayers.map((p, i) => (
                    <motion.tr key={p.id || i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center border-2 border-gray-600 flex-shrink-0">
                            <span className="text-white font-semibold text-sm">{p.full_name?.charAt(0)?.toUpperCase() || 'P'}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{p.full_name}</div>
                            <div className="text-xs text-gray-400">{p.phone || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r ${positionColor(p.position)} text-white`}>
                          {p.position || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 text-sm font-medium bg-gray-800 text-gray-300 rounded-xl border border-gray-700/50">
                          {p.group?.name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{p.subgroup?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${statusColor(p.status)}`}>{p.status || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* ✅ Evaluate button — opens monthly evaluation modal */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => openEvalModal(p)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-white rounded-xl text-xs font-medium"
                            style={{ background: 'linear-gradient(135deg, #902bd1, #4fb0ff)' }}>
                            <FaStar style={{ fontSize: 12 }} />Evaluate
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => { setPerfPlayer(p); setPerfData({}); setShowPerfModal(true); }}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-xl text-xs font-medium border border-gray-700/50">
                            <FaHistory style={{ fontSize: 12 }} />History
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => { setPredictPlayer(p); setPredictData({}); setPredictedPosition(null); setShowPredictModal(true); }}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white rounded-xl text-xs font-medium">
                            <FaMagic style={{ fontSize: 12 }} />Predict
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <FiUsers className="mx-auto text-4xl text-gray-500 mb-4" />
                        <p className="text-white text-lg font-medium mb-1">No players found</p>
                        <p className="text-gray-400">Try adjusting your search or filter</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* ✅ EVALUATION MODAL */}
      <AnimatePresence>
        {showEvalModal && evalPlayer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700 w-full max-w-3xl my-8">
              <form onSubmit={handleSubmitEval}>

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold text-lg">
                      {evalPlayer.full_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{evalPlayer.full_name}</div>
                      <div className="text-sm text-gray-400">{evalPlayer.position} · Monthly Evaluation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Month Navigation */}
                    <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700">
                      <button type="button" onClick={() => setEvalMonth(format(subMonths(new Date(evalMonth + '-01'), 1), 'yyyy-MM'))}
                        className="text-gray-400 hover:text-white">
                        <FiChevronLeft size={16} />
                      </button>
                      <span className="text-sm text-white font-medium min-w-24 text-center">
                        {format(new Date(evalMonth + '-01'), 'MMMM yyyy')}
                      </span>
                      <button type="button" onClick={() => setEvalMonth(format(addMonths(new Date(evalMonth + '-01'), 1), 'yyyy-MM'))}
                        className="text-gray-400 hover:text-white">
                        <FiChevronRight size={16} />
                      </button>
                    </div>
                    <button type="button" onClick={() => setShowEvalModal(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800">
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">

                  {/* Overall score preview */}
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-1 bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
                      <div className="text-3xl font-bold text-[#4fb0ff]">{getOverallScore()}</div>
                      <div className="text-xs text-gray-400 mt-1">Overall /10</div>
                    </div>
                    {['technical', 'physical', 'mental', 'tactical'].map(pillar => {
                      const c = PILLAR_COLORS[pillar];
                      return (
                        <div key={pillar} className={`col-span-1 ${c.bg} rounded-xl p-3 text-center border ${c.border}`}>
                          <div className={`text-2xl font-bold ${c.text}`}>{getPillarAvg(pillar)}</div>
                          <div className="text-xs text-gray-400 mt-1 capitalize">{pillar}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pillar Tabs */}
                  <div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {['technical', 'physical', 'mental', 'tactical'].map(pillar => {
                        const c = PILLAR_COLORS[pillar];
                        return (
                          <button key={pillar} type="button"
                            onClick={() => setActivePillar(pillar)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                              activePillar === pillar
                                ? `${c.bg} ${c.text} ${c.border}`
                                : 'bg-gray-800/30 text-gray-400 border-gray-700/50 hover:text-white'
                            }`}>
                            {pillar}
                          </button>
                        );
                      })}
                    </div>

                    {/* Criteria for active pillar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(PILLARS[evalPlayer.position]?.[activePillar] || []).map(criterion => {
                        const key = `${activePillar}_${criterion}`;
                        return (
                          <div key={key} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                            <div className="text-sm text-gray-300 mb-2">{criterion}</div>
                            <StarRating
                              value={evalForm.scores[key] || 0}
                              onChange={(val) => setEvalForm(prev => ({
                                ...prev,
                                scores: { ...prev.scores, [key]: val }
                              }))}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attendance */}
                  <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                    <div className="text-sm font-medium text-gray-300 mb-3">Attendance this month</div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Sessions attended</label>
                        <input type="number" min="0" placeholder="ex: 14"
                          value={evalForm.attendance_present}
                          onChange={e => setEvalForm(p => ({ ...p, attendance_present: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
                      </div>
                      <div className="text-gray-400 text-lg mt-4">/</div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Total sessions</label>
                        <input type="number" min="0" placeholder="ex: 16"
                          value={evalForm.attendance_total}
                          onChange={e => setEvalForm(p => ({ ...p, attendance_total: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
                      </div>
                      {evalForm.attendance_present && evalForm.attendance_total && (
                        <div className="mt-4 text-[#00d0cb] font-bold text-lg">
                          {Math.round((evalForm.attendance_present / evalForm.attendance_total) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Strength <span className="text-red-400 text-xs">*required</span>
                      </label>
                      <textarea rows="3" placeholder="What does this player do well..."
                        value={evalForm.strength}
                        onChange={e => setEvalForm(p => ({ ...p, strength: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        To improve <span className="text-red-400 text-xs">*required</span>
                      </label>
                      <textarea rows="3" placeholder="What should this player improve..."
                        value={evalForm.to_improve}
                        onChange={e => setEvalForm(p => ({ ...p, to_improve: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Objective for next month <span className="text-red-400 text-xs">*required</span>
                      </label>
                      <textarea rows="2" placeholder="1-2 concrete objectives for next month..."
                        value={evalForm.objective}
                        onChange={e => setEvalForm(p => ({ ...p, objective: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Coach comment (optional)</label>
                      <textarea rows="2" placeholder="Additional notes..."
                        value={evalForm.comment}
                        onChange={e => setEvalForm(p => ({ ...p, comment: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none" />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowEvalModal(false)}
                      className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700/50">
                      Cancel
                    </button>
                    <motion.button type="submit" disabled={isSubmittingEval}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 text-white font-semibold py-3 rounded-xl disabled:opacity-70 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                      {isSubmittingEval ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                      ) : (
                        <><FaStar style={{ fontSize: 14 }} />Save Evaluation for {format(new Date(evalMonth + '-01'), 'MMMM yyyy')}</>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showPerfModal && perfPlayer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                      <span className="text-white font-bold">{perfPlayer.full_name?.charAt(0)}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Evaluation History</h2>
                      <p className="text-gray-400 text-sm">{perfPlayer.full_name}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPerfModal(false)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800">
                    <FiX size={20} />
                  </button>
                </div>
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <FaChartLine className="mx-auto text-4xl text-gray-500 mb-4" />
                  <p className="text-white font-medium">No evaluation history yet</p>
                  <p className="text-gray-400 text-sm mt-1">Use the Evaluate button to add monthly evaluations</p>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={() => setShowPerfModal(false)} className="bg-gray-800 text-white px-6 py-3 rounded-xl border border-gray-700/50">Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predict Modal */}
      <AnimatePresence>
        {showPredictModal && predictPlayer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Predict Position</h2>
                  <button onClick={() => setShowPredictModal(false)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800"><FiX size={20} /></button>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center">
                    <span className="text-white font-bold">{predictPlayer.full_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{predictPlayer.full_name}</div>
                    <span className="text-gray-400 text-sm">Current: {predictPlayer.position}</span>
                  </div>
                </div>
                {predictedPosition && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-[#902bd1]/20 to-[#00d0cb]/20 rounded-xl border border-[#00d0cb]/30">
                    <p className="text-gray-300 text-sm mb-1">Predicted Position:</p>
                    <p className="text-2xl font-bold text-[#00d0cb]">{predictedPosition} ✅</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {Object.values(positionMetrics).flat().filter((m, i, arr) => arr.findIndex(x => x.key === m.key) === i).map(metric => (
                    <div key={metric.key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{metric.label}</label>
                      <input type="number" min="0" placeholder={`Enter ${metric.label}`}
                        value={predictData[metric.key] || ''}
                        onChange={e => setPredictData(d => ({ ...d, [metric.key]: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={savePredictedPlayer}
                    className="flex-1 bg-gradient-to-r from-[#902bd1] to-[#00d0cb] text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                    <FaMagic />Predict Position
                  </motion.button>
                  <button onClick={() => setShowPredictModal(false)} className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-xl border border-gray-700/50">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default CoachPlayers;