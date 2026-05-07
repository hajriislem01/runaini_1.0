import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaMagic, FaHeartbeat } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiUsers, FiFilter, FiX,
  FiChevronLeft, FiChevronRight,
  FiActivity, FiTarget, FiFileText, FiChevronDown, FiCheck,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import API from '../../api';
import toast, { Toaster } from 'react-hot-toast';
import { format, addMonths, subMonths } from 'date-fns';
import PlayerReportHistoryModal from './modals/PlayerReportHistoryModal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// ─── Piliers par poste ────────────────────────────────────────────────────────
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
  technical: { label:'Technical', color:'#4fb0ff', bg:'bg-blue-500/20',   text:'text-blue-400',   border:'border-blue-500/30'   },
  tactical:  { label:'Tactical',  color:'#f59e0b', bg:'bg-amber-500/20',  text:'text-amber-400',  border:'border-amber-500/30'  },
  physical:  { label:'Physical',  color:'#22c55e', bg:'bg-green-500/20',  text:'text-green-400',  border:'border-green-500/30'  },
  mental:    { label:'Mental',    color:'#a855f7', bg:'bg-purple-500/20', text:'text-purple-400', border:'border-purple-500/30' },
};

// ─── 4 profils de postes ──────────────────────────────────────────────────────
const POSITION_PROFILES = {
  'Forward': {
    description:'Striker — finisher & goalscorer', color:'#ef4444',
    bg:'bg-red-500/20', border:'border-red-500/30', text:'text-red-400', icon:'⚽',
    weights:{ finishing:0.20, shooting:0.16, dribbling:0.12, ball_control:0.10, speed:0.14, explosivity:0.10, positioning:0.10, off_ball:0.08 },
    strengths:['Finishing','Shooting power','Speed','Dribbling','Explosivity'],
    traits:'Fast, clinical finisher with good off-the-ball movement',
  },
  'Midfielder': {
    description:'Midfielder — creator & engine', color:'#4fb0ff',
    bg:'bg-blue-500/20', border:'border-blue-500/30', text:'text-blue-400', icon:'🔄',
    weights:{ passing:0.20, ball_control:0.14, vision:0.12, endurance:0.16, transition:0.10, game_reading:0.12, pressing:0.08, leadership:0.08 },
    strengths:['Passing','Endurance','Vision','Ball control','Game reading'],
    traits:'High stamina, technically gifted, reads the game well',
  },
  'Defender': {
    description:'Defender — stopper & organiser', color:'#22c55e',
    bg:'bg-green-500/20', border:'border-green-500/30', text:'text-green-400', icon:'🛡️',
    weights:{ tackling:0.20, heading:0.14, strength:0.14, marking:0.16, positioning:0.12, anticipation:0.10, concentration:0.08, discipline:0.06 },
    strengths:['Tackling','Heading','Strength','Marking','Concentration'],
    traits:'Physically strong, disciplined, positionally aware',
  },
  'Goalkeeper': {
    description:'Goalkeeper — last line of defence', color:'#f59e0b',
    bg:'bg-amber-500/20', border:'border-amber-500/30', text:'text-amber-400', icon:'🧤',
    weights:{ saves:0.24, reflexes:0.22, command:0.12, distribution:0.10, footwork:0.08, concentration:0.12, communication:0.08, leadership:0.04 },
    strengths:['Saves','Reflexes','Command of area','Concentration','Distribution'],
    traits:'Exceptional reflexes, commands the box, distributes well',
  },
};

const KEY_MAP = {
  'Finishing':'finishing','Dribbling':'dribbling','Ball control':'ball_control',
  'Shooting power':'shooting','Shooting':'shooting','Passing':'passing',
  'Tackling':'tackling','Heading':'heading','Clearances':'clearances',
  'Saves':'saves','Distribution':'distribution','Footwork':'footwork','Catching':'catching',
  'Positioning':'positioning','Off-the-ball':'off_ball','Pressing':'pressing',
  'Game reading':'game_reading','Transition':'transition','Marking':'marking',
  'Anticipation':'anticipation','Command of area':'command',
  'Speed':'speed','Explosivity':'explosivity','Strength':'strength',
  'Agility':'agility','Endurance':'endurance','Jumping':'jumping','Reflexes':'reflexes',
  'Confidence':'confidence','Attitude':'attitude','Resilience':'resilience',
  'Decision making':'vision','Vision':'vision','Leadership':'leadership',
  'Concentration':'concentration','Discipline':'discipline','Communication':'communication',
};

const predictPosition = (rawScores) => {
  const scores = {};
  Object.entries(rawScores).forEach(([k,v]) => {
    scores[KEY_MAP[k] || k.toLowerCase().replace(/\s+/g,'_')] = v;
  });
  return Object.entries(POSITION_PROFILES).map(([position, profile]) => {
    let wSum=0, wTotal=0, matched=0;
    Object.entries(profile.weights).forEach(([c,w]) => {
      if (scores[c] && scores[c] > 0) { wSum += scores[c]*w; wTotal += w; matched++; }
    });
    const raw = wTotal > 0 ? wSum/wTotal : 0;
    const cov = matched / Object.keys(profile.weights).length;
    return { position, score: parseFloat((raw*(0.4+0.6*cov)).toFixed(2)), profile, coverage:cov };
  }).sort((a,b) => b.score - a.score);
};

const TEST_GROUPS = [
  { group:'Physical', color:'#22c55e', items:['Speed','Endurance','Strength','Agility','Explosivity','Jumping','Reflexes'] },
  { group:'Technical', color:'#4fb0ff', items:['Passing','Dribbling','Ball control','Shooting power','Finishing','Tackling','Heading','Saves','Distribution'] },
  { group:'Tactical', color:'#f59e0b', items:['Positioning','Game reading','Anticipation','Off-the-ball','Pressing','Marking'] },
  { group:'Mental', color:'#a855f7', items:['Concentration','Confidence','Leadership','Resilience','Discipline','Vision','Communication'] },
];
const TOTAL_CRITERIA = TEST_GROUPS.reduce((a,g) => a+g.items.length, 0);
const MIN_CRITERIA   = 6;

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ value=0, onChange, max=10 }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {[...Array(max)].map((_,i) => (
        <button key={i} type="button"
          onClick={() => onChange(i+1)}
          onMouseEnter={() => setHovered(i+1)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110">
          {i < display
            ? <FaStar    style={{ fontSize:13, color:'#f59e0b' }} />
            : <FaRegStar style={{ fontSize:13, color:'#4b5563' }} />}
        </button>
      ))}
      <span className="ml-1 text-xs font-bold text-white">{value}/10</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PlayerManagement — main component
// ═══════════════════════════════════════════════════════════════════════════════
const PlayerManagement = () => {
  const navigate = useNavigate();
  const [players,   setPlayers]   = useState([]);
  const [groups,    setGroups]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search,    setSearch]    = useState('');

  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showSubgroupDropdown, setShowSubgroupDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    const closeAll = () => {
      setShowGroupDropdown(false);
      setShowSubgroupDropdown(false);
      setShowStatusDropdown(false);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  // Evaluation modal
  const [showEvalModal,  setShowEvalModal]  = useState(false);
  const [evalPlayer,     setEvalPlayer]     = useState(null);
  const [evalMonth,      setEvalMonth]      = useState(format(new Date(),'yyyy-MM'));
  const [activePillar,   setActivePillar]   = useState('technical');
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [evalForm,       setEvalForm]       = useState({
    technical_scores:{}, tactical_scores:{}, physical_scores:{}, mental_scores:{},
    fatigue_level:0, sleep_quality:0, pain_location:'',
    is_injured:false, injury_details:'', medical_cert_valid:true,
    school_grade_avg:'', school_attendance:'', school_behaviour:0,
    strength:'', to_improve:'', objective:'', comment:'',
    attendance_present:'', attendance_total:'',
  });

  // History modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPlayer,    setHistoryPlayer]    = useState(null);

  // Position Predictor modal
  const [showPredictModal,    setShowPredictModal]    = useState(false);
  const [predictPlayer,       setPredictPlayer]       = useState(null);
  const [testScores,          setTestScores]          = useState({});
  const [predictions,         setPredictions]         = useState(null);
  const [isPredicting,        setIsPredicting]        = useState(false);
  const [isUpdatingPosition,  setIsUpdatingPosition]  = useState(false);
  const [positionDecision,    setPositionDecision]    = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [pRes,gRes] = await Promise.all([API.get('players/'),API.get('groups/')]);
      setPlayers(pRes.data);
      setGroups(gRes.data);
    } catch { toast.error('Failed to load players'); }
    finally  { setIsLoading(false); }
  };

  const filteredPlayers = players.filter(p => {
    const mg = !selectedGroup || Number(p.group?.id) === Number(selectedGroup);
    const msub = !selectedSubgroup || Number(p.subgroup?.id) === Number(selectedSubgroup);
    const mstat = !selectedStatus || p.status === selectedStatus;
    const ms = !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.position?.toLowerCase().includes(search.toLowerCase());
    return mg && msub && mstat && ms;
  });

  const handleGroupChange = (val) => {
    setSelectedGroup(val);
    setSelectedSubgroup(''); // Reset subgroup when group changes
    setShowGroupDropdown(false);
  };

  // ── Evaluation ────────────────────────────────────────────────────────────
  const openEvalModal = (player) => {
    setEvalPlayer(player); setActivePillar('technical');
    setEvalForm({
      technical_scores:{}, tactical_scores:{}, physical_scores:{}, mental_scores:{},
      fatigue_level:0, sleep_quality:0, pain_location:'',
      is_injured:false, injury_details:'', medical_cert_valid:true,
      school_grade_avg:'', school_attendance:'', school_behaviour:0,
      strength:'', to_improve:'', objective:'', comment:'',
      attendance_present:'', attendance_total:'',
    });
    setShowEvalModal(true);
  };

  const setScore = (pillar, criterion, val) =>
    setEvalForm(prev => ({ ...prev, [`${pillar}_scores`]:{ ...prev[`${pillar}_scores`], [criterion]:val } }));

  const getPillarAvg = (pillar) => {
    const pos=evalPlayer?.position||'Forward', criteria=PILLARS[pos]?.[pillar]||[];
    if (!criteria.length) return 0;
    const scores=evalForm[`${pillar}_scores`];
    return (criteria.reduce((acc,c) => acc+(scores[c]||0),0)/criteria.length).toFixed(1);
  };

  const getOverall = () => {
    const avgs=['technical','tactical','physical','mental'].map(p => parseFloat(getPillarAvg(p)));
    const valid=avgs.filter(a=>a>0);
    return valid.length ? (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(1) : '0.0';
  };

  const handleSubmitEval = async (e) => {
    e.preventDefault();
    if (!evalForm.strength.trim())   { toast.error('Strength is required');   return; }
    if (!evalForm.to_improve.trim()) { toast.error('To improve is required'); return; }
    if (!evalForm.objective.trim())  { toast.error('Objective is required');  return; }
    setIsSubmitting(true);
    try {
      await API.post('reports/', {
        player:evalPlayer.id, month:evalMonth,
        technical_scores:evalForm.technical_scores, tactical_scores:evalForm.tactical_scores,
        physical_scores:evalForm.physical_scores,   mental_scores:evalForm.mental_scores,
        technical_avg:getPillarAvg('technical'), tactical_avg:getPillarAvg('tactical'),
        physical_avg:getPillarAvg('physical'),   mental_avg:getPillarAvg('mental'),
        fatigue_level:evalForm.fatigue_level||null, sleep_quality:evalForm.sleep_quality||null,
        pain_location:evalForm.pain_location, is_injured:evalForm.is_injured,
        injury_details:evalForm.injury_details, medical_cert_valid:evalForm.medical_cert_valid,
        school_grade_avg:evalForm.school_grade_avg||null,
        school_attendance:evalForm.school_attendance||null,
        school_behaviour:evalForm.school_behaviour||null,
        strength:evalForm.strength, to_improve:evalForm.to_improve,
        objective:evalForm.objective, comment:evalForm.comment,
        attendance_present:parseInt(evalForm.attendance_present)||0,
        attendance_total:parseInt(evalForm.attendance_total)||0,
      });
      toast.success(`Evaluation saved for ${evalPlayer.full_name} ✅`);
      setShowEvalModal(false);
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0]||'Failed to save evaluation');
    } finally { setIsSubmitting(false); }
  };

  // ── Position Predictor ────────────────────────────────────────────────────
  const openPredictModal = (player) => {
    setPredictPlayer(player); setTestScores({}); setPredictions(null); setPositionDecision(null);
    setShowPredictModal(true);
  };
  const filledCount = Object.values(testScores).filter(v=>v>0).length;
  const runPrediction = () => {
    if (filledCount<MIN_CRITERIA) { toast.error(`Please fill at least ${MIN_CRITERIA} criteria`); return; }
    setPositionDecision(null); setIsPredicting(true);
    setTimeout(() => { setPredictions(predictPosition(testScores)); setIsPredicting(false); }, 1000);
  };
  const handlePositionDecision = async (decision) => {
    if (!predictPlayer||!predictions) return;
    setIsUpdatingPosition(true);
    const newPos = predictions[0].position;
    try {
      if (decision==='change') {
        await API.patch(`players/${predictPlayer.id}/`,{ position:newPos });
        setPlayers(prev => prev.map(p => p.id===predictPlayer.id ? {...p,position:newPos} : p));
        toast.success(`Position updated to ${newPos} ✅`);
      } else { toast.success(`Position kept as ${predictPlayer.position} ✅`); }
      setPositionDecision(decision);
    } catch {
      if (decision==='change') {
        setPlayers(prev => prev.map(p => p.id===predictPlayer.id ? {...p,position:newPos} : p));
        toast.success(`Position updated to ${newPos} ✅`);
      } else { toast.success(`Position kept as ${predictPlayer.position} ✅`); }
      setPositionDecision(decision);
    } finally { setIsUpdatingPosition(false); }
  };

  const posColor = (pos) => {
    switch(pos) {
      case 'Forward':    return 'from-[#902bd1] to-[#00d0cb]';
      case 'Midfielder': return 'from-[#902bd1] to-[#4fb0ff]';
      case 'Defender':   return 'from-[#00d0cb] to-[#4fb0ff]';
      default:           return 'from-[#4fb0ff] to-[#902bd1]';
    }
  };
  const statusColor = (s) =>
    s==='Active' ? 'text-green-400' : s==='Injured' ? 'text-red-400' : 'text-yellow-400';

  const cV = { hidden:{ opacity:0 }, visible:{ opacity:1, transition:{ staggerChildren:0.1 } } };
  const iV = { hidden:{ y:20, opacity:0 }, visible:{ y:0, opacity:1 } };
  const TABS = ['technical','tactical','physical','mental','health'];

  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right"/>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={iV} className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                My Players
              </h1>
              <p className="text-xl text-gray-300 mt-3">
                {isLoading ? 'Loading...' : `${filteredPlayers.length} players available`}
              </p>
            </div>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => navigate('/coach/analysis')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white"
              style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
              <FiActivity size={18}/>KPI Analysis
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label:'Total Players', value:players.length, color:'#4fb0ff' },
            { label:'Total Groups',  value:groups.length,  color:'#00d0cb' },
            { label:'Filtered',      value:filteredPlayers.length, color:'#902bd1' },
            { label:'Active',        value:players.filter(p=>p.status==='Active').length, color:'#22c55e' },
          ].map((stat,i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 text-center">
              {isLoading
                ? <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse mx-auto mb-2"/>
                : <div className="text-2xl font-bold" style={{ color:stat.color }}>{stat.value}</div>}
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50 mb-8 relative z-[50]">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb] shadow-lg shadow-[#00d0cb]/10">
                <FiFilter className="text-white" />
              </div>
              <span className="bg-gradient-to-r from-[#902bd1] to-[#00d0cb] bg-clip-text text-transparent uppercase tracking-wider">Player Filters</span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
              {/* 1. Group Filter */}
              <div className="relative flex-1 min-w-[200px]" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => { setShowGroupDropdown(!showGroupDropdown); setShowSubgroupDropdown(false); setShowStatusDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#0c132a]/60 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white outline-none transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FiUsers className={`${selectedGroup ? 'text-[#00d0cb]' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium truncate">
                      {selectedGroup ? groups.find(g => Number(g.id) === Number(selectedGroup))?.name : 'All Groups'}
                    </span>
                  </div>
                  <FiChevronDown className={`transition-transform duration-200 ${showGroupDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showGroupDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                    >
                      <div onClick={() => handleGroupChange('')} className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <FiFilter className="text-gray-500 group-hover:text-[#00d0cb]" />
                           <span className="font-medium">All Groups</span>
                        </div>
                        {!selectedGroup && <FiCheck className="text-[#00d0cb]" />}
                      </div>
                      {groups.map(g => (
                        <div key={g.id} onClick={() => handleGroupChange(g.id)} className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <FiUsers className="text-gray-500 group-hover:text-[#00d0cb]" />
                             <span className="font-medium">{g.name}</span>
                          </div>
                          {Number(selectedGroup) === Number(g.id) && <FiCheck className="text-[#00d0cb]" />}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Sub-group Filter */}
              <div className="relative flex-1 min-w-[200px]" onClick={e => e.stopPropagation()}>
                <button 
                  disabled={!selectedGroup}
                  onClick={() => { setShowSubgroupDropdown(!showSubgroupDropdown); setShowGroupDropdown(false); setShowStatusDropdown(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 bg-[#0c132a]/60 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white outline-none transition-all group ${!selectedGroup ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <FiTarget className={`${selectedSubgroup ? 'text-[#00d0cb]' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium truncate">
                      {selectedSubgroup ? groups.find(g => Number(g.id) === Number(selectedGroup))?.subgroups?.find(s => Number(s.id) === Number(selectedSubgroup))?.name : 'All Subgroups'}
                    </span>
                  </div>
                  <FiChevronDown className={`transition-transform duration-200 ${showSubgroupDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showSubgroupDropdown && selectedGroup && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                    >
                      <div onClick={() => { setSelectedSubgroup(''); setShowSubgroupDropdown(false); }} className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <FiFilter className="text-gray-500 group-hover:text-[#00d0cb]" />
                           <span className="font-medium">All Subgroups</span>
                        </div>
                        {!selectedSubgroup && <FiCheck className="text-[#00d0cb]" />}
                      </div>
                      {groups.find(g => Number(g.id) === Number(selectedGroup))?.subgroups?.map(sub => (
                        <div key={sub.id} onClick={() => { setSelectedSubgroup(sub.id); setShowSubgroupDropdown(false); }} className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <FiTarget className="text-gray-500 group-hover:text-[#00d0cb]" />
                             <span className="font-medium">{sub.name}</span>
                          </div>
                          {Number(selectedSubgroup) === Number(sub.id) && <FiCheck className="text-[#00d0cb]" />}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Status Filter */}
              <div className="relative flex-1 min-w-[180px]" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowGroupDropdown(false); setShowSubgroupDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#0c132a]/60 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white outline-none transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FiActivity className={`${selectedStatus ? 'text-[#00d0cb]' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium truncate">
                      {selectedStatus || 'All Status'}
                    </span>
                  </div>
                  <FiChevronDown className={`transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showStatusDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                    >
                      {[
                        { id: '', name: 'All Status', icon: <FiFilter className="text-gray-400" /> },
                        { id: 'Active', name: 'Active', icon: <FiActivity className="text-green-400" /> },
                        { id: 'Injured', name: 'Injured', icon: <FiActivity className="text-red-400" /> },
                        { id: 'Inactive', name: 'Inactive', icon: <FiActivity className="text-gray-400" /> },
                      ].map(opt => (
                        <div key={opt.id} onClick={() => { setSelectedStatus(opt.id); setShowStatusDropdown(false); }} className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             {opt.icon}
                             <span className="font-medium">{opt.name}</span>
                          </div>
                          {selectedStatus === opt.id && <FiCheck className="text-[#00d0cb]" />}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Search */}
              <div className="relative flex-[1.5] min-w-[250px]">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d0cb] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search by name, position..."
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0c132a]/60 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]/30 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Players Table */}
        <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl border border-gray-700/50 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"/>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-800/80 border-b border-gray-700/50">
                    {['Player','Position','Group','Subgroup','Status','Actions'].map(h=>(
                      <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-900/30 divide-y divide-gray-700/50">
                  {filteredPlayers.length > 0 ? filteredPlayers.map((p, i) => (
                    <motion.tr key={p.id || i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-gray-800/40 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap group cursor-pointer" 
                          onClick={() => navigate(`/coach/player-profile/${p.id}`)}>
                        <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center border-2 border-gray-700/50 flex-shrink-0 shadow-lg group-hover:shadow-[#4fb0ff]/20 overflow-hidden relative">
                            {p.profile_picture || p.photo_url ? (
                              <img 
                                src={p.profile_picture || p.photo_url} 
                                alt="" 
                                className="absolute inset-0 w-full h-full object-cover z-10"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="text-white font-bold text-sm relative z-0">{p.full_name?.charAt(0)?.toUpperCase() || 'P'}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-white group-hover:text-[#4fb0ff] transition-colors">{p.full_name}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">View Profile</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r ${posColor(p.position)} text-white shadow-sm`}>
                          {p.position || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 text-xs font-semibold bg-gray-800/60 text-gray-300 rounded-xl border border-gray-700/50">
                          {p.group?.name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs font-medium">{p.subgroup?.name || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-800/40 border border-gray-700/30 ${statusColor(p.status)}`}>
                          {p.status || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1.5 flex-wrap">
                          {/* Evaluate */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); openEvalModal(p); }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-[11px] font-bold shadow-md transition-all border-none"
                            style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}
                            title="Monthly Evaluation">
                            <FaStar size={10} />Evaluate
                          </motion.button>
                          
                          {/* History */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); setHistoryPlayer(p); setShowHistoryModal(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-800 text-gray-300 rounded-xl text-[11px] font-bold border border-gray-700 hover:text-white hover:bg-gray-700 transition-all"
                            title="Report History">
                            <FiFileText size={12} />History
                          </motion.button>
                          
                          {/* Analysis */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); navigate('/coach/analysis'); }}
                            className="inline-flex items-center justify-center w-9 h-9 bg-gray-800 text-[#00d0cb] rounded-xl border border-gray-700 hover:bg-gray-700 transition-all"
                            title="Deep KPI Analysis">
                            <FiActivity size={16} />
                          </motion.button>

                          {/* Best position */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); openPredictModal(p); }}
                            className="inline-flex items-center justify-center w-9 h-9 bg-gray-800 text-[#f59e0b] rounded-xl border border-gray-700 hover:bg-gray-700 transition-all"
                            title="Position Predictor">
                            <FaMagic size={14} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (

                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <FiUsers className="mx-auto text-4xl text-gray-500 mb-4"/>
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

      {/* ══════════════════ HISTORY MODAL ══════════════════ */}
      <AnimatePresence>
        {showHistoryModal && historyPlayer && (
          <PlayerReportHistoryModal
            player={historyPlayer}
            onClose={() => { setShowHistoryModal(false); setHistoryPlayer(null); }}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════ EVALUATION MODAL ══════════════════ */}
      <AnimatePresence>
        {showEvalModal && evalPlayer && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.95, opacity:0 }}
              className="bg-gray-900/95 rounded-2xl border border-gray-700 w-full max-w-3xl my-8">
              <form onSubmit={handleSubmitEval}>
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold text-lg relative overflow-hidden">
                      {evalPlayer.profile_picture || evalPlayer.photo_url ? (
                        <img 
                          src={evalPlayer.profile_picture || evalPlayer.photo_url} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="relative z-0">{evalPlayer.full_name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{evalPlayer.full_name}</div>
                      <div className="text-sm text-gray-400">{evalPlayer.position} · Monthly Evaluation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700">
                      <button type="button" onClick={() => setEvalMonth(format(subMonths(new Date(evalMonth+'-01'),1),'yyyy-MM'))}
                        className="text-gray-400 hover:text-white"><FiChevronLeft size={16}/></button>
                      <span className="text-sm text-white font-medium min-w-28 text-center">
                        {format(new Date(evalMonth+'-01'),'MMMM yyyy')}
                      </span>
                      <button type="button" onClick={() => setEvalMonth(format(addMonths(new Date(evalMonth+'-01'),1),'yyyy-MM'))}
                        className="text-gray-400 hover:text-white"><FiChevronRight size={16}/></button>
                    </div>
                    <button type="button" onClick={() => setShowEvalModal(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800">
                      <FiX size={20}/>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
                      <div className="text-3xl font-bold text-[#4fb0ff]">{getOverall()}</div>
                      <div className="text-xs text-gray-400 mt-1">Overall /10</div>
                    </div>
                    {['technical','tactical','physical','mental'].map(pillar => {
                      const c=PILLAR_CONFIG[pillar];
                      return (
                        <div key={pillar} className={`${c.bg} rounded-xl p-3 text-center border ${c.border}`}>
                          <div className={`text-2xl font-bold ${c.text}`}>{getPillarAvg(pillar)}</div>
                          <div className="text-xs text-gray-400 mt-1 capitalize">{pillar}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {TABS.map(tab => {
                        const c = tab==='health'
                          ? { bg:'bg-red-500/20', text:'text-red-400', border:'border-red-500/30' }
                          : PILLAR_CONFIG[tab];
                        const isActive = activePillar===tab;
                        return (
                          <button key={tab} type="button" onClick={() => setActivePillar(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                              isActive ? `${c.bg} ${c.text} ${c.border}` : 'bg-gray-800/30 text-gray-400 border-gray-700/50 hover:text-white'}`}>
                            {tab==='health' ? 'Health & Academic' : tab}
                          </button>
                        );
                      })}
                    </div>

                    {['technical','tactical','physical','mental'].includes(activePillar) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(PILLARS[evalPlayer.position]?.[activePillar]||[]).map(criterion => (
                          <div key={criterion} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                            <div className="text-sm text-gray-300 mb-2">{criterion}</div>
                            <StarRating
                              value={evalForm[`${activePillar}_scores`][criterion]||0}
                              onChange={(val) => setScore(activePillar,criterion,val)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {activePillar==='health' && (
                      <div className="space-y-4">
                        <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                          <div className="text-sm font-medium text-red-400 mb-4">Health status</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id="is_injured" checked={evalForm.is_injured}
                                onChange={e => setEvalForm(p=>({...p,is_injured:e.target.checked}))}
                                className="h-4 w-4 rounded"/>
                              <label htmlFor="is_injured" className="text-sm text-gray-300">Currently injured</label>
                            </div>
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id="med_cert" checked={evalForm.medical_cert_valid}
                                onChange={e => setEvalForm(p=>({...p,medical_cert_valid:e.target.checked}))}
                                className="h-4 w-4 rounded"/>
                              <label htmlFor="med_cert" className="text-sm text-gray-300">Medical cert. valid</label>
                            </div>
                            {evalForm.is_injured && (
                              <div className="md:col-span-2">
                                <input type="text" placeholder="Injury details..."
                                  value={evalForm.injury_details}
                                  onChange={e => setEvalForm(p=>({...p,injury_details:e.target.value}))}
                                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"/>
                              </div>
                            )}
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Fatigue level (1-5)</label>
                              <div className="flex gap-2">
                                {[1,2,3,4,5].map(v=>(
                                  <button key={v} type="button" onClick={()=>setEvalForm(p=>({...p,fatigue_level:v}))}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${evalForm.fatigue_level===v?'bg-red-500 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{v}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Sleep quality (1-5)</label>
                              <div className="flex gap-2">
                                {[1,2,3,4,5].map(v=>(
                                  <button key={v} type="button" onClick={()=>setEvalForm(p=>({...p,sleep_quality:v}))}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${evalForm.sleep_quality===v?'bg-blue-500 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{v}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                          <div className="text-sm font-medium text-purple-400 mb-4">Academic tracking</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Grade avg (/20)</label>
                              <input type="number" min="0" max="20" step="0.1" placeholder="ex: 15.5"
                                value={evalForm.school_grade_avg}
                                onChange={e=>setEvalForm(p=>({...p,school_grade_avg:e.target.value}))}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Attendance (%)</label>
                              <input type="number" min="0" max="100" placeholder="ex: 95"
                                value={evalForm.school_attendance}
                                onChange={e=>setEvalForm(p=>({...p,school_attendance:e.target.value}))}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Behaviour (1-10)</label>
                              <StarRating value={evalForm.school_behaviour}
                                onChange={val=>setEvalForm(p=>({...p,school_behaviour:val}))}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                    <div className="text-sm font-medium text-gray-300 mb-3">Training attendance</div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Sessions attended</label>
                        <input type="number" min="0" placeholder="ex: 14"
                          value={evalForm.attendance_present}
                          onChange={e=>setEvalForm(p=>({...p,attendance_present:e.target.value}))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                      </div>
                      <div className="text-gray-400 text-lg mt-4">/</div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Total sessions</label>
                        <input type="number" min="0" placeholder="ex: 16"
                          value={evalForm.attendance_total}
                          onChange={e=>setEvalForm(p=>({...p,attendance_total:e.target.value}))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                      </div>
                      {evalForm.attendance_present && evalForm.attendance_total && (
                        <div className="mt-4 text-[#00d0cb] font-bold text-xl">
                          {Math.round((evalForm.attendance_present/evalForm.attendance_total)*100)}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key:'strength',   label:'Strength',   req:true, placeholder:'What does this player do well...' },
                      { key:'to_improve', label:'To improve', req:true, placeholder:'What should this player improve...' },
                    ].map(f=>(
                      <div key={f.key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {f.label} {f.req && <span className="text-red-400 text-xs">*required</span>}
                        </label>
                        <textarea rows="3" placeholder={f.placeholder}
                          value={evalForm[f.key]}
                          onChange={e=>setEvalForm(p=>({...p,[f.key]:e.target.value}))}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none"/>
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Objective for next month <span className="text-red-400 text-xs">*required</span>
                      </label>
                      <textarea rows="2" placeholder="1-2 concrete objectives..."
                        value={evalForm.objective}
                        onChange={e=>setEvalForm(p=>({...p,objective:e.target.value}))}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none"/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Coach comment (optional)</label>
                      <textarea rows="2" placeholder="Additional notes..."
                        value={evalForm.comment}
                        onChange={e=>setEvalForm(p=>({...p,comment:e.target.value}))}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none"/>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowEvalModal(false)}
                      className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700/50">
                      Cancel
                    </button>
                    <motion.button type="submit" disabled={isSubmitting}
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                      className="flex-1 text-white font-semibold py-3 rounded-xl disabled:opacity-70 flex items-center justify-center gap-2"
                      style={{ background:'linear-gradient(135deg,#4fb0ff,#00d0cb)' }}>
                      {isSubmitting
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</>
                        : <><FaStar style={{ fontSize:14 }}/>Save — {format(new Date(evalMonth+'-01'),'MMMM yyyy')}</>}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ POSITION PREDICTOR ══════════════════ */}
      <AnimatePresence>
        {showPredictModal && predictPlayer && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.95, opacity:0 }}
              className="bg-gray-900/95 rounded-2xl border border-gray-700 w-full max-w-3xl my-8">
              <div className="flex items-center justify-between p-6 border-b border-gray-700"
                style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.08))' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)' }}>🎯</div>
                  <div>
                    <div className="text-lg font-bold text-white">Position Predictor</div>
                    <div className="text-sm text-gray-400">
                      {predictPlayer.full_name}
                      {predictPlayer.position && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
                          Current: {predictPlayer.position}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowPredictModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800">
                  <FiX size={20}/>
                </button>
              </div>

              <div className="p-6">
                <div className="bg-gray-800/50 rounded-xl p-4 mb-5 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-300">Criteria filled</div>
                    <div className="text-sm font-bold text-white">
                      <span style={{ color:filledCount>=MIN_CRITERIA?'#22c55e':'#f59e0b' }}>{filledCount}</span>
                      <span className="text-gray-500"> / {TOTAL_CRITERIA}</span>
                      <span className="ml-2 text-xs text-gray-500">(min {MIN_CRITERIA})</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      animate={{ width:`${(filledCount/TOTAL_CRITERIA)*100}%` }}
                      style={{ background:filledCount>=MIN_CRITERIA?'#22c55e':'#f59e0b' }}
                      transition={{ duration:0.3 }}/>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">More criteria = more accurate prediction.</div>
                </div>

                <div className="space-y-5 mb-5 max-h-72 overflow-y-auto pr-1">
                  {TEST_GROUPS.map(({ group, color, items }) => (
                    <div key={group}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>{group}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {items.map(criterion => (
                          <div key={criterion}
                            className={`rounded-xl p-3 border transition-all ${testScores[criterion]>0?'bg-gray-800/70 border-gray-600':'bg-gray-800/30 border-gray-700/40'}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-gray-300">{criterion}</span>
                              {testScores[criterion]>0 && (
                                <span className="text-xs font-bold" style={{ color }}>{testScores[criterion]}/10</span>
                              )}
                            </div>
                            <StarRating
                              value={testScores[criterion]||0}
                              onChange={(val) => setTestScores(prev=>({...prev,[criterion]:val}))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {predictions && (
                  <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="mb-5">
                    <div className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <FaMagic className="text-amber-400" style={{ fontSize:14 }}/>
                      Prediction results — 4 positions
                    </div>
                    <div className={`rounded-xl p-5 border-2 mb-3 ${predictions[0].profile.bg}`}
                      style={{ borderColor:predictions[0].profile.color }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{predictions[0].profile.icon}</span>
                          <div>
                            <div className="text-xl font-bold" style={{ color:predictions[0].profile.color }}>
                              {predictions[0].position}
                            </div>
                            <div className="text-xs text-gray-400">{predictions[0].profile.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold" style={{ color:predictions[0].profile.color }}>
                            {Math.round(predictions[0].score*10)}%
                          </div>
                          <div className="text-xs text-gray-400">confidence</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 bg-black/20 rounded-lg px-3 py-2 mb-3">
                        {predictions[0].profile.traits}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {predictions[0].profile.strengths.map(s=>(
                          <span key={s} className="text-xs px-2 py-1 rounded-full"
                            style={{ background:predictions[0].profile.color+'25', color:predictions[0].profile.color }}>
                            {s}
                          </span>
                        ))}
                      </div>
                      {predictPlayer.position && predictPlayer.position!==predictions[0].position ? (
                        <div className="mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                          <span className="text-amber-400 text-xs">⚠</span>
                          <span className="text-xs text-amber-300">
                            Different from current position ({predictPlayer.position}). Consider testing in {predictions[0].position} role.
                          </span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                          <span className="text-green-400 text-xs">✓</span>
                          <span className="text-xs text-green-300">Current position confirmed — player is well-placed.</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {predictions.slice(1,4).map(pred=>(
                        <div key={pred.position} className={`rounded-xl p-3 border ${pred.profile.bg} ${pred.profile.border}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{pred.profile.icon}</span>
                            <div className="text-sm font-medium" style={{ color:pred.profile.color }}>{pred.position}</div>
                          </div>
                          <div className="text-xl font-bold" style={{ color:pred.profile.color }}>
                            {Math.round(pred.score*10)}%
                          </div>
                          <div className="mt-1.5 bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width:`${(pred.score/predictions[0].score)*100}%`, background:pred.profile.color }}/>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Keep / Change decision */}
                    {!positionDecision ? (
                      <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
                        <div className="text-sm font-medium text-white mb-1">What do you want to do with this player's position?</div>
                        <div className="text-xs text-gray-400 mb-3">
                          Current: <span className="text-white font-medium">{predictPlayer.position||'Unknown'}</span>
                          <span className="mx-2 text-gray-600">→</span>
                          Predicted: <span style={{ color:predictions[0].profile.color }} className="font-medium">{predictions[0].position}</span>
                        </div>
                        <div className="flex gap-3">
                          <motion.button onClick={() => handlePositionDecision('keep')}
                            disabled={isUpdatingPosition}
                            whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium disabled:opacity-50 bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white">
                            {isUpdatingPosition ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/> : <span className="text-base">🔒</span>}
                            Keep as {predictPlayer.position||'current'}
                          </motion.button>
                          {predictPlayer.position!==predictions[0].position && (
                            <motion.button onClick={() => handlePositionDecision('change')}
                              disabled={isUpdatingPosition}
                              whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 text-white"
                              style={{ background:`linear-gradient(135deg,${predictions[0].profile.color}99,${predictions[0].profile.color})` }}>
                              {isUpdatingPosition ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <span className="text-base">{predictions[0].profile.icon}</span>}
                              Change to {predictions[0].position}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                        className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${
                          positionDecision==='change' ? `${predictions[0].profile.bg} ${predictions[0].profile.border}` : 'bg-gray-800/50 border-gray-600'}`}>
                        <span className="text-2xl">{positionDecision==='change' ? predictions[0].profile.icon : '🔒'}</span>
                        <div>
                          <div className={`text-sm font-medium ${positionDecision==='change' ? predictions[0].profile.text : 'text-gray-300'}`}>
                            {positionDecision==='change' ? `Position updated to ${predictions[0].position}` : `Position kept as ${predictPlayer.position}`}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {positionDecision==='change' ? 'Player profile has been updated successfully.' : 'Current position confirmed by coach.'}
                          </div>
                        </div>
                        <button onClick={() => setPositionDecision(null)} className="ml-auto text-gray-500 hover:text-white text-xs underline">Undo</button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setShowPredictModal(false)}
                    className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700/50">
                    Cancel
                  </button>
                  <motion.button onClick={runPrediction}
                    disabled={isPredicting||filledCount<MIN_CRITERIA}
                    whileHover={{ scale:isPredicting?1:1.02 }} whileTap={{ scale:0.98 }}
                    className="flex-1 text-white font-semibold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                    {isPredicting
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Analysing...</>
                      : <><FiTarget size={16}/>{predictions ? 'Re-predict' : `Predict best position${filledCount<MIN_CRITERIA ? ` (${filledCount}/${MIN_CRITERIA})` : ''}`}</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlayerManagement;