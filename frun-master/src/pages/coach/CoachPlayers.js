import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaHistory, FaMagic } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiFilter, FiX, FiChevronLeft, FiChevronRight, FiActivity } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { format, addMonths, subMonths } from 'date-fns';

// ✅ 3 Piliers — Technical/Tactical, Physical/Mental, Health/Academic
const PILLARS = {
  Forward: {
    technical: ['Finishing', 'Dribbling', 'Ball control', 'Shooting power'],
    tactical:  ['Positioning', 'Off-the-ball', 'Pressing', 'Game reading'],
    physical:  ['Speed', 'Explosivity', 'Strength', 'Agility'],
    mental:    ['Confidence', 'Attitude', 'Resilience', 'Decision making'],
  },
  Midfielder: {
    technical: ['Passing', 'Ball control', 'Dribbling', 'Shooting'],
    tactical:  ['Positioning', 'Pressing', 'Transition', 'Game reading'],
    physical:  ['Endurance', 'Speed', 'Strength', 'Agility'],
    mental:    ['Vision', 'Leadership', 'Resilience', 'Concentration'],
  },
  Defender: {
    technical: ['Tackling', 'Heading', 'Passing', 'Clearances'],
    tactical:  ['Marking', 'Positioning', 'Anticipation', 'Game reading'],
    physical:  ['Strength', 'Speed', 'Endurance', 'Jumping'],
    mental:    ['Concentration', 'Leadership', 'Discipline', 'Resilience'],
  },
  Goalkeeper: {
    technical: ['Saves', 'Distribution', 'Footwork', 'Catching'],
    tactical:  ['Positioning', 'Command of area', 'Game reading', 'Decision making'],
    physical:  ['Reflexes', 'Explosivity', 'Strength', 'Agility'],
    mental:    ['Concentration', 'Leadership', 'Communication', 'Resilience'],
  },
};

const PILLAR_CONFIG = {
  technical: { label: 'Technical', color: '#4fb0ff', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  tactical:  { label: 'Tactical',  color: '#f59e0b', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  physical:  { label: 'Physical',  color: '#22c55e', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  mental:    { label: 'Mental',    color: '#a855f7', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
};

const HEALTH_ACADEMIC = {
  health:   ['Injury / pain status', 'Medical cert. valid', 'Fatigue level (1-5)', 'Sleep quality (1-5)'],
  academic: ['School grade avg (/20)', 'School attendance (%)', 'Behaviour in class'],
};

// ✅ Star component 1-10
const StarRating = ({ value = 0, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {[...Array(10)].map((_, i) => (
        <button key={i} type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110">
          {i < display
            ? <FaStar style={{ fontSize: 14, color: '#f59e0b' }} />
            : <FaRegStar style={{ fontSize: 14, color: '#4b5563' }} />}
        </button>
      ))}
      <span className="ml-1 text-xs font-bold text-white">{value}/10</span>
    </div>
  );
};

const CoachPlayers = () => {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [evalForm, setEvalForm] = useState({
    technical_scores: {}, tactical_scores: {},
    physical_scores: {}, mental_scores: {},
    fatigue_level: 0, sleep_quality: 0, pain_location: '',
    is_injured: false, injury_details: '', medical_cert_valid: true,
    school_grade_avg: '', school_attendance: '', school_behaviour: 0,
    strength: '', to_improve: '', objective: '', comment: '',
    attendance_present: '', attendance_total: '',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [playersRes, groupsRes] = await Promise.all([API.get('players/'), API.get('groups/')]);
      setPlayers(playersRes.data);
      setGroups(groupsRes.data);
    } catch { toast.error('Failed to load players'); }
    finally { setIsLoading(false); }
  };

  const filteredPlayers = players.filter(p => {
    const matchGroup = !selectedGroup || p.group?.id === parseInt(selectedGroup);
    const matchSearch = !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.position?.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  const openEvalModal = (player) => {
    setEvalPlayer(player);
    setActivePillar('technical');
    setEvalForm({
      technical_scores: {}, tactical_scores: {},
      physical_scores: {}, mental_scores: {},
      fatigue_level: 0, sleep_quality: 0, pain_location: '',
      is_injured: false, injury_details: '', medical_cert_valid: true,
      school_grade_avg: '', school_attendance: '', school_behaviour: 0,
      strength: '', to_improve: '', objective: '', comment: '',
      attendance_present: '', attendance_total: '',
    });
    setShowEvalModal(true);
  };

  const setScore = (pillar, criterion, val) => {
    const key = `${pillar}_scores`;
    setEvalForm(prev => ({ ...prev, [key]: { ...prev[key], [criterion]: val } }));
  };

  const getPillarAvg = (pillar) => {
    const pos = evalPlayer?.position || 'Forward';
    const criteria = PILLARS[pos]?.[pillar] || [];
    if (!criteria.length) return 0;
    const scores = evalForm[`${pillar}_scores`];
    const sum = criteria.reduce((acc, c) => acc + (scores[c] || 0), 0);
    return (sum / criteria.length).toFixed(1);
  };

  const getOverall = () => {
    const avgs = ['technical', 'tactical', 'physical', 'mental'].map(p => parseFloat(getPillarAvg(p)));
    const valid = avgs.filter(a => a > 0);
    return valid.length ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1) : '0.0';
  };

  const handleSubmitEval = async (e) => {
    e.preventDefault();
    if (!evalForm.strength.trim()) { toast.error('Strength is required'); return; }
    if (!evalForm.to_improve.trim()) { toast.error('To improve is required'); return; }
    if (!evalForm.objective.trim()) { toast.error('Objective is required'); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        player: evalPlayer.id,
        month: evalMonth,
        technical_scores: evalForm.technical_scores,
        tactical_scores: evalForm.tactical_scores,
        physical_scores: evalForm.physical_scores,
        mental_scores: evalForm.mental_scores,
        technical_avg: getPillarAvg('technical'),
        tactical_avg: getPillarAvg('tactical'),
        physical_avg: getPillarAvg('physical'),
        mental_avg: getPillarAvg('mental'),
        fatigue_level: evalForm.fatigue_level || null,
        sleep_quality: evalForm.sleep_quality || null,
        pain_location: evalForm.pain_location,
        is_injured: evalForm.is_injured,
        injury_details: evalForm.injury_details,
        medical_cert_valid: evalForm.medical_cert_valid,
        school_grade_avg: evalForm.school_grade_avg || null,
        school_attendance: evalForm.school_attendance || null,
        school_behaviour: evalForm.school_behaviour || null,
        strength: evalForm.strength,
        to_improve: evalForm.to_improve,
        objective: evalForm.objective,
        comment: evalForm.comment,
        attendance_present: parseInt(evalForm.attendance_present) || 0,
        attendance_total: parseInt(evalForm.attendance_total) || 0,
      };
      await API.post('reports/', payload);
      toast.success(`Evaluation saved for ${evalPlayer.full_name} ✅`);
      setShowEvalModal(false);
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || 'Failed to save evaluation');
    } finally { setIsSubmitting(false); }
  };

  const posColor = (pos) => {
    switch (pos) {
      case 'Forward': return 'from-[#902bd1] to-[#00d0cb]';
      case 'Midfielder': return 'from-[#902bd1] to-[#4fb0ff]';
      case 'Defender': return 'from-[#00d0cb] to-[#4fb0ff]';
      default: return 'from-[#4fb0ff] to-[#902bd1]';
    }
  };

  const statusColor = (s) => s === 'Active' ? 'text-green-400' : s === 'Injured' ? 'text-red-400' : 'text-yellow-400';
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  const PILLARS_TABS = ['technical', 'tactical', 'physical', 'mental', 'health'];

  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                My Players
              </h1>
              <p className="text-xl text-gray-300 mt-3">
                {isLoading ? 'Loading...' : `${filteredPlayers.length} players available`}
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/coach/analysis')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #902bd1, #4fb0ff)' }}>
              <FiActivity size={18} />KPI Analysis
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Players', value: players.length, color: '#4fb0ff' },
            { label: 'Total Groups', value: groups.length, color: '#00d0cb' },
            { label: 'Filtered', value: filteredPlayers.length, color: '#902bd1' },
            { label: 'Active', value: players.filter(p => p.status === 'Active').length, color: '#22c55e' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 text-center">
              {isLoading ? <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse mx-auto mb-2" /> :
                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>}
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50 mb-8">
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
        <motion.div variants={itemVariants} className="bg-gray-900/70 rounded-2xl border border-gray-700/50 overflow-hidden">
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
                    <motion.tr key={p.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }} className="hover:bg-gray-800/50 transition-colors">
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
                        <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r ${posColor(p.position)} text-white`}>
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
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => openEvalModal(p)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-white rounded-xl text-xs font-medium"
                            style={{ background: 'linear-gradient(135deg, #902bd1, #4fb0ff)' }}>
                            <FaStar style={{ fontSize: 11 }} />Evaluate
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/coach/analysis')}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-xl text-xs font-medium border border-gray-700/50">
                            <FiActivity size={12} />Analysis
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

                {/* Header */}
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
                    <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700">
                      <button type="button" onClick={() => setEvalMonth(format(subMonths(new Date(evalMonth + '-01'), 1), 'yyyy-MM'))}
                        className="text-gray-400 hover:text-white"><FiChevronLeft size={16} /></button>
                      <span className="text-sm text-white font-medium min-w-28 text-center">
                        {format(new Date(evalMonth + '-01'), 'MMMM yyyy')}
                      </span>
                      <button type="button" onClick={() => setEvalMonth(format(addMonths(new Date(evalMonth + '-01'), 1), 'yyyy-MM'))}
                        className="text-gray-400 hover:text-white"><FiChevronRight size={16} /></button>
                    </div>
                    <button type="button" onClick={() => setShowEvalModal(false)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800"><FiX size={20} /></button>
                  </div>
                </div>

                <div className="p-6 space-y-6">

                  {/* Overall + Pillars */}
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-1 bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
                      <div className="text-3xl font-bold text-[#4fb0ff]">{getOverall()}</div>
                      <div className="text-xs text-gray-400 mt-1">Overall /10</div>
                    </div>
                    {['technical', 'tactical', 'physical', 'mental'].map(pillar => {
                      const c = PILLAR_CONFIG[pillar];
                      return (
                        <div key={pillar} className={`col-span-1 ${c.bg} rounded-xl p-3 text-center border ${c.border}`}>
                          <div className={`text-2xl font-bold ${c.text}`}>{getPillarAvg(pillar)}</div>
                          <div className="text-xs text-gray-400 mt-1 capitalize">{pillar}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tabs */}
                  <div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {PILLARS_TABS.map(tab => {
                        const c = tab === 'health' ? { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' } : PILLAR_CONFIG[tab];
                        const isActive = activePillar === tab;
                        return (
                          <button key={tab} type="button" onClick={() => setActivePillar(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                              isActive ? `${c.bg} ${c.text} ${c.border}` : 'bg-gray-800/30 text-gray-400 border-gray-700/50 hover:text-white'
                            }`}>
                            {tab === 'health' ? 'Health & Academic' : tab}
                          </button>
                        );
                      })}
                    </div>

                    {/* ✅ Technical / Tactical / Physical / Mental */}
                    {['technical', 'tactical', 'physical', 'mental'].includes(activePillar) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(PILLARS[evalPlayer.position]?.[activePillar] || []).map(criterion => (
                          <div key={criterion} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                            <div className="text-sm text-gray-300 mb-2">{criterion}</div>
                            <StarRating
                              value={evalForm[`${activePillar}_scores`][criterion] || 0}
                              onChange={(val) => setScore(activePillar, criterion, val)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ✅ Health & Academic */}
                    {activePillar === 'health' && (
                      <div className="space-y-4">
                        {/* Health */}
                        <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                          <div className="text-sm font-medium text-red-400 mb-4">Health status</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id="is_injured" checked={evalForm.is_injured}
                                onChange={e => setEvalForm(p => ({ ...p, is_injured: e.target.checked }))}
                                className="h-4 w-4 rounded" />
                              <label htmlFor="is_injured" className="text-sm text-gray-300">Currently injured</label>
                            </div>
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id="med_cert" checked={evalForm.medical_cert_valid}
                                onChange={e => setEvalForm(p => ({ ...p, medical_cert_valid: e.target.checked }))}
                                className="h-4 w-4 rounded" />
                              <label htmlFor="med_cert" className="text-sm text-gray-300">Medical cert. valid</label>
                            </div>
                            {evalForm.is_injured && (
                              <div className="md:col-span-2">
                                <input type="text" placeholder="Injury details..."
                                  value={evalForm.injury_details}
                                  onChange={e => setEvalForm(p => ({ ...p, injury_details: e.target.value }))}
                                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                              </div>
                            )}
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Fatigue level (1-5)</label>
                              <div className="flex gap-2">
                                {[1,2,3,4,5].map(v => (
                                  <button key={v} type="button" onClick={() => setEvalForm(p => ({ ...p, fatigue_level: v }))}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${evalForm.fatigue_level === v ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{v}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Sleep quality (1-5)</label>
                              <div className="flex gap-2">
                                {[1,2,3,4,5].map(v => (
                                  <button key={v} type="button" onClick={() => setEvalForm(p => ({ ...p, sleep_quality: v }))}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${evalForm.sleep_quality === v ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{v}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Academic */}
                        <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                          <div className="text-sm font-medium text-purple-400 mb-4">Academic tracking</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Grade avg (/20)</label>
                              <input type="number" min="0" max="20" step="0.1" placeholder="ex: 15.5"
                                value={evalForm.school_grade_avg}
                                onChange={e => setEvalForm(p => ({ ...p, school_grade_avg: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Attendance (%)</label>
                              <input type="number" min="0" max="100" placeholder="ex: 95"
                                value={evalForm.school_attendance}
                                onChange={e => setEvalForm(p => ({ ...p, school_attendance: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Behaviour (1-10)</label>
                              <StarRating value={evalForm.school_behaviour}
                                onChange={val => setEvalForm(p => ({ ...p, school_behaviour: val }))} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendance */}
                  <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                    <div className="text-sm font-medium text-gray-300 mb-3">Training attendance</div>
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
                        <div className="mt-4 text-[#00d0cb] font-bold text-xl">
                          {Math.round((evalForm.attendance_present / evalForm.attendance_total) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'strength', label: 'Strength', req: true, placeholder: 'What does this player do well...' },
                      { key: 'to_improve', label: 'To improve', req: true, placeholder: 'What should this player improve...' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {field.label} {field.req && <span className="text-red-400 text-xs">*required</span>}
                        </label>
                        <textarea rows="3" placeholder={field.placeholder}
                          value={evalForm[field.key]}
                          onChange={e => setEvalForm(p => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none" />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Objective for next month <span className="text-red-400 text-xs">*required</span>
                      </label>
                      <textarea rows="2" placeholder="1-2 concrete objectives..."
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
                    <motion.button type="submit" disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 text-white font-semibold py-3 rounded-xl disabled:opacity-70 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                      {isSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                      ) : (
                        <><FaStar style={{ fontSize: 14 }} />Save — {format(new Date(evalMonth + '-01'), 'MMMM yyyy')}</>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CoachPlayers;