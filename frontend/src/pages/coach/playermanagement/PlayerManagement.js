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
import { useTranslation } from 'react-i18next';
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
const toWestern = (num) =>
  String(num).replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) =>
    String(d.charCodeAt(0) - (d.charCodeAt(0) >= 0x06F0 ? 0x06F0 : 0x0660))
  );

const PlayerManagement = () => {
  const { t, i18n } = useTranslation('coachplayers');
  const isRtl = i18n.language === 'ar';
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
    if (!evalForm.strength.trim())   { toast.error(t('errStrengthReq'));   return; }
    if (!evalForm.to_improve.trim()) { toast.error(t('errImproveReq')); return; }
    if (!evalForm.objective.trim())  { toast.error(t('errObjReq'));  return; }
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
      toast.success(t('evalSaved', { name: evalPlayer.full_name }));
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
    if (filledCount<MIN_CRITERIA) { toast.error(t('errMinCriteria', { min: MIN_CRITERIA })); return; }
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
        toast.success(t('posUpdatedSucc', { pos: newPos }));
      } else { toast.success(t('posKeptSucc', { pos: predictPlayer.position })); }
      setPositionDecision(decision);
    } catch {
      if (decision==='change') {
        setPlayers(prev => prev.map(p => p.id===predictPlayer.id ? {...p,position:newPos} : p));
        toast.success(t('posUpdatedSucc', { pos: newPos }));
      } else { toast.success(t('posKeptSucc', { pos: predictPlayer.position })); }
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
      initial="hidden" animate="visible" variants={cV}
      dir={isRtl ? 'rtl' : 'ltr'}>
      <Toaster position="top-right"/>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={iV} className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                {t('myPlayers')}
              </h1>
              <p className="text-xl text-gray-300 mt-3">
                {isLoading ? t('loading') : t('playersAvailable', { count: toWestern(filteredPlayers.length) })}
              </p>
            </div>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => navigate('/coach/analysis')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white"
              style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
              <FiActivity size={18}/>{t('kpiAnalysis')}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: t('totalPlayers'), value: toWestern(players.length), color:'#4fb0ff' },
            { label: t('totalGroups'),  value: toWestern(groups.length),  color:'#00d0cb' },
            { label: t('filtered'),      value: toWestern(filteredPlayers.length), color:'#902bd1' },
            { label: t('active'),        value: toWestern(players.filter(p=>p.status==='Active').length), color:'#22c55e' },
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
              <span className="bg-gradient-to-r from-[#902bd1] to-[#00d0cb] bg-clip-text text-transparent uppercase tracking-wider">{t('playerFilters')}</span>
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
                      {selectedGroup ? groups.find(g => Number(g.id) === Number(selectedGroup))?.name : t('allGroups')}
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
                           <span className="font-medium">{t('allGroups')}</span>
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
                      {selectedSubgroup ? groups.find(g => Number(g.id) === Number(selectedGroup))?.subgroups?.find(s => Number(s.id) === Number(selectedSubgroup))?.name : t('allSubgroups')}
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
                           <span className="font-medium">{t('allSubgroups')}</span>
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
                      {selectedStatus ? t(selectedStatus.toLowerCase().replace(/\s+/g, '') + 'Status') : t('allStatus')}
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
                        { id: '', name: t('allStatus'), icon: <FiFilter className="text-gray-400" /> },
                        { id: 'Active', name: t('activeStatus'), icon: <FiActivity className="text-green-400" /> },
                        { id: 'Injured', name: t('injuredStatus'), icon: <FiActivity className="text-red-400" /> },
                        { id: 'Inactive', name: t('inactiveStatus'), icon: <FiActivity className="text-gray-400" /> },
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
                <FiSearch className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d0cb] transition-colors`} />
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')}
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  className={`w-full ${isRtl ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-3 bg-[#0c132a]/60 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]/30 transition-all shadow-inner`}
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
                    {[t('player'),t('position'),t('group'),t('subgroup'),t('status'),t('actions')].map((h, i)=>(
                      <th key={i} className={`px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>{h}</th>
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
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{t('viewProfile')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r ${posColor(p.position)} text-white shadow-sm`}>
                          {p.position ? t(p.position.toLowerCase()) || p.position : t('unknown')}
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
                          {p.status ? t(p.status.toLowerCase().replace(/\s+/g, '') + 'Status') : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1.5 flex-wrap">
                          {/* Evaluate */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); openEvalModal(p); }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-[11px] font-bold shadow-md transition-all border-none"
                            style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}
                            title={t('monthlyEvaluation')}>
                            <FaStar size={10} />{t('evaluate')}
                          </motion.button>
                          
                          {/* History */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); setHistoryPlayer(p); setShowHistoryModal(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-800 text-gray-300 rounded-xl text-[11px] font-bold border border-gray-700 hover:text-white hover:bg-gray-700 transition-all"
                            title={t('reportHistory')}>
                            <FiFileText size={12} />{t('history')}
                          </motion.button>
                          
                          {/* Analysis */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); navigate('/coach/analysis'); }}
                            className="inline-flex items-center justify-center w-9 h-9 bg-gray-800 text-[#00d0cb] rounded-xl border border-gray-700 hover:bg-gray-700 transition-all"
                            title={t('deepKpiAnalysis')}>
                            <FiActivity size={16} />
                          </motion.button>

                          {/* Best position */}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); openPredictModal(p); }}
                            className="inline-flex items-center justify-center w-9 h-9 bg-gray-800 text-[#f59e0b] rounded-xl border border-gray-700 hover:bg-gray-700 transition-all"
                            title={t('positionPredictor')}>
                            <FaMagic size={14} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (

                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <FiUsers className="mx-auto text-4xl text-gray-500 mb-4"/>
                        <p className="text-white text-lg font-medium mb-1">{t('noPlayersFound')}</p>
                        <p className="text-gray-400">{t('tryAdjusting')}</p>
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
            dir={isRtl ? 'rtl' : 'ltr'}>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.95, opacity:0 }}
              className="bg-gray-900/95 rounded-2xl border border-gray-700 w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto my-8">
              <form onSubmit={handleSubmitEval}>
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-700 gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold text-lg sm:text-xl relative overflow-hidden flex-shrink-0">
                      {evalPlayer.profile_picture || evalPlayer.photo_url ? (
                        <img src={evalPlayer.profile_picture || evalPlayer.photo_url} alt="" className="absolute inset-0 w-full h-full object-cover z-10"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : null}
                      <span className="relative z-0">{evalPlayer.full_name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-bold text-white">{evalPlayer.full_name}</div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        {evalPlayer.position ? t('pos_' + evalPlayer.position.toLowerCase()) || evalPlayer.position : t('unknown')} · {t('monthlyEvaluation')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700 flex-1 md:flex-none justify-between md:justify-start">
                      <button type="button" onClick={() => setEvalMonth(format(subMonths(new Date(evalMonth+'-01'),1),'yyyy-MM'))}
                        className="text-gray-400 hover:text-white"><FiChevronLeft size={16}/></button>
                      <span className="text-sm text-white font-medium min-w-28 text-center select-none">
                        {format(new Date(evalMonth+'-01'),'MMMM yyyy')}
                      </span>
                      <button type="button" onClick={() => setEvalMonth(format(addMonths(new Date(evalMonth+'-01'),1),'yyyy-MM'))}
                        className="text-gray-400 hover:text-white"><FiChevronRight size={16}/></button>
                    </div>
                    <button type="button" onClick={() => setShowEvalModal(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 flex-shrink-0">
                      <FiX size={20}/>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Pillar averages */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 justify-items-center w-full">
                    <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50 w-full">
                      <div className="text-2xl sm:text-3xl font-bold text-[#4fb0ff]">{toWestern(getOverall())}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400 mt-1">{t('overall10')}</div>
                    </div>
                    {['technical','tactical','physical','mental'].map(pillar => {
                      const c=PILLAR_CONFIG[pillar];
                      return (
                        <div key={pillar} className={`${c.bg} rounded-xl p-3 text-center border ${c.border} w-full`}>
                          <div className={`text-xl sm:text-2xl font-bold ${c.text}`}>{toWestern(getPillarAvg(pillar))}</div>
                          <div className="text-[10px] sm:text-xs text-gray-400 mt-1 capitalize">{t('pillar_' + pillar)}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pillar tabs */}
                  <div className="w-full">
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto whitespace-nowrap mb-4 pb-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                      {TABS.map(tab => {
                        const c = tab==='health'
                          ? { bg:'bg-red-500/20', text:'text-red-400', border:'border-red-500/30' }
                          : PILLAR_CONFIG[tab];
                        const isActive = activePillar===tab;
                        return (
                          <button key={tab} type="button" onClick={() => setActivePillar(tab)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium capitalize transition-all border shrink-0 ${
                              isActive ? `${c.bg} ${c.text} ${c.border}` : 'bg-gray-800/30 text-gray-400 border-gray-700/50 hover:text-white'}`}>
                            {tab==='health' ? t('healthAcademic') : t('pillar_' + tab)}
                          </button>
                        );
                      })}
                    </div>

                    {['technical','tactical','physical','mental'].includes(activePillar) && (
                      <div className="w-full space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(PILLARS[evalPlayer.position]?.[activePillar]||[]).map(criterion => (
                            <div key={criterion} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                              <div className="text-sm text-gray-300 mb-2">{t('crit_' + criterion.toLowerCase().replace(/\s+/g, '_'))}</div>
                              <StarRating
                                value={evalForm[`${activePillar}_scores`][criterion]||0}
                                onChange={(val) => setScore(activePillar,criterion,val)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activePillar==='health' && (
                      <div className="space-y-4">
                        <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                          <div className="text-sm font-medium text-red-400 mb-4">{t('healthStatus')}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id="is_injured" checked={evalForm.is_injured}
                                onChange={e => setEvalForm(p=>({...p,is_injured:e.target.checked}))}
                                className="h-4 w-4 rounded"/>
                              <label htmlFor="is_injured" className="text-sm text-gray-300">{t('currentlyInjured')}</label>
                            </div>
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id="med_cert" checked={evalForm.medical_cert_valid}
                                onChange={e => setEvalForm(p=>({...p,medical_cert_valid:e.target.checked}))}
                                className="h-4 w-4 rounded"/>
                              <label htmlFor="med_cert" className="text-sm text-gray-300">{t('medicalCertValid')}</label>
                            </div>
                            {evalForm.is_injured && (
                              <div className="md:col-span-2">
                                <input type="text" placeholder={t('injuryDetailsPlaceholder')}
                                  value={evalForm.injury_details}
                                  onChange={e => setEvalForm(p=>({...p,injury_details:e.target.value}))}
                                  className={`w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${isRtl ? 'text-right' : ''}`}/>
                              </div>
                            )}
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">{t('fatigueLevel')}</label>
                              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                                {[1,2,3,4,5].map(v=>(
                                  <button key={v} type="button" onClick={()=>setEvalForm(p=>({...p,fatigue_level:v}))}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${evalForm.fatigue_level===v?'bg-red-500 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{toWestern(v)}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">{t('sleepQuality')}</label>
                              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                                {[1,2,3,4,5].map(v=>(
                                  <button key={v} type="button" onClick={()=>setEvalForm(p=>({...p,sleep_quality:v}))}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${evalForm.sleep_quality===v?'bg-blue-500 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{toWestern(v)}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                          <div className="text-sm font-medium text-purple-400 mb-4">{t('academicTracking')}</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">{t('gradeAvg')}</label>
                              <input type="number" min="0" max="20" step="0.1" placeholder={t('ex155')}
                                value={evalForm.school_grade_avg}
                                onChange={e=>setEvalForm(p=>({...p,school_grade_avg:e.target.value}))}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">{t('attendancePercent')}</label>
                              <input type="number" min="0" max="100" placeholder={t('ex95')}
                                value={evalForm.school_attendance}
                                onChange={e=>setEvalForm(p=>({...p,school_attendance:e.target.value}))}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">{t('behaviour10')}</label>
                              <StarRating value={evalForm.school_behaviour}
                                onChange={val=>setEvalForm(p=>({...p,school_behaviour:val}))}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendance */}
                  <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                    <div className="text-sm font-medium text-gray-300 mb-3">{t('trainingAttendance')}</div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs text-gray-400 mb-1">{t('sessionsAttended')}</label>
                        <input type="number" min="0" placeholder={t('ex14')}
                          value={evalForm.attendance_present}
                          onChange={e=>setEvalForm(p=>({...p,attendance_present:e.target.value}))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                      </div>
                      <div className="text-gray-400 text-lg mt-4 shrink-0">/</div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs text-gray-400 mb-1">{t('totalSessions')}</label>
                        <input type="number" min="0" placeholder={t('ex16')}
                          value={evalForm.attendance_total}
                          onChange={e=>setEvalForm(p=>({...p,attendance_total:e.target.value}))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                      </div>
                      {evalForm.attendance_present && evalForm.attendance_total && (
                        <div className="mt-4 text-[#00d0cb] font-bold text-xl min-w-[60px] text-center sm:text-right shrink-0">
                          {toWestern(Math.round((evalForm.attendance_present/evalForm.attendance_total)*100))}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {[
                      { key:'strength',   label: t('strength'),   req:true, placeholder: t('whatDoesPlayerWell') },
                      { key:'to_improve', label: t('toImprove'), req:true, placeholder: t('whatShouldPlayerImprove') },
                    ].map(f=>(
                      <div key={f.key} className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {f.label} {f.req && <span className="text-red-400 text-xs">{t('required')}</span>}
                        </label>
                        <textarea rows="3" placeholder={f.placeholder}
                          value={evalForm[f.key]}
                          onChange={e=>setEvalForm(p=>({...p,[f.key]:e.target.value}))}
                          className={`w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none ${isRtl ? 'text-right' : ''}`}/>
                      </div>
                    ))}
                    <div className="md:col-span-2 w-full">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('objectiveForNextMonth')} <span className="text-red-400 text-xs">{t('required')}</span>
                      </label>
                      <textarea rows="2" placeholder={t('concreteObjectives')}
                        value={evalForm.objective}
                        onChange={e=>setEvalForm(p=>({...p,objective:e.target.value}))}
                        className={`w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none ${isRtl ? 'text-right' : ''}`}/>
                    </div>
                    <div className="md:col-span-2 w-full">
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('coachComment')}</label>
                      <textarea rows="2" placeholder={t('additionalNotes')}
                        value={evalForm.comment}
                        onChange={e=>setEvalForm(p=>({...p,comment:e.target.value}))}
                        className={`w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none ${isRtl ? 'text-right' : ''}`}/>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button type="button" onClick={() => setShowEvalModal(false)}
                      className="w-full sm:w-auto px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700/50 order-2 sm:order-1">
                      {t('cancel')}
                    </button>
                    <motion.button type="submit" disabled={isSubmitting}
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                      className="flex-1 text-white font-semibold py-3 rounded-xl disabled:opacity-70 flex items-center justify-center gap-2 order-1 sm:order-2 text-sm sm:text-base px-4 truncate"
                      style={{ background:'linear-gradient(135deg,#4fb0ff,#00d0cb)' }}>
                      {isSubmitting
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t('saving')}</>
                        : <><FaStar style={{ fontSize:14 }} className="shrink-0" /><span>{t('saveDate', { date: format(new Date(evalMonth+'-01'),'MMMM yyyy') })}</span></>}
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
                    <div className="text-lg font-bold text-white">{t('positionPredictor')}</div>
                    <div className="text-sm text-gray-400">
                      {predictPlayer.full_name}
                      {predictPlayer.position && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
                          {t('current')}: {t(predictPlayer.position.toLowerCase()) || predictPlayer.position}
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
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-300 font-medium">{t('criteriaFilled')}</span>
                    <span className={`${filledCount>=MIN_CRITERIA ? 'text-green-400' : 'text-gray-400'}`}>
                      {filledCount} / {Object.keys(testScores).length} <span className="text-xs opacity-70">{t('min', { min: MIN_CRITERIA })}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
                    <div className={`h-full transition-all duration-500 ${filledCount>=MIN_CRITERIA ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gray-500'}`} style={{width:`${(filledCount/Object.keys(testScores).length)*100}%`}}/>
                  </div>
                  <div className="text-xs text-gray-500 text-center italic">{t('moreCriteria')}</div>
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
                              <span className="text-xs text-gray-300">{t('crit_' + criterion.toLowerCase().replace(/\s+/g, '_'))}</span>
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
                    <h4 className="text-sm font-medium text-gray-300 mb-4">{t('predictionResults')}</h4>
                    {predictions.map((res, i) => {
                      const isMatch = res.position === predictPlayer.position;
                      return (
                        <div key={res.position} className={`relative overflow-hidden rounded-2xl p-4 border mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-gray-800/50 ${i===0 ? 'border-[#f59e0b]/50 bg-[#f59e0b]/5' : 'border-gray-700/30 bg-gray-800/30'}`}>
                          {i===0 && <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b]/10 rounded-full blur-3xl -mr-16 -mt-16"/>}
                          <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-lg font-bold ${i===0 ? 'text-[#f59e0b]' : 'text-gray-300'}`}>
                                {t('pos_' + res.position.toLowerCase()) || res.position}
                              </span>
                              {i===0 && isMatch && <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20">✓</span>}
                            </div>
                            <div className="text-xs text-gray-400">
                              {t('desc_' + res.position.toLowerCase())}
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto relative z-10">
                            <div className="text-2xl font-black bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
                              {Math.round(res.score*10)}%
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t('confidence')}</div>
                          </div>
                        </div>
                      );
                    })}

                    {!positionDecision ? (
                      <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
                        {predictions[0].position !== predictPlayer.position ? (
                          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm">
                            <FiInfo className="shrink-0 mt-0.5" />
                            <div>{t('diffPosition', { current: predictPlayer.position ? t('pos_' + predictPlayer.position.toLowerCase()) : '', new: predictions[0].position ? t('pos_' + predictions[0].position.toLowerCase()) : '' })}</div>
                          </div>
                        ) : (
                          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex gap-3 text-green-400 text-sm">
                            <FiCheck className="shrink-0 mt-0.5" />
                            <div>{t('posConfirmed')}</div>
                          </div>
                        )}
                        <h4 className="text-sm font-medium text-gray-200 mb-4">{t('whatToDo')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button onClick={() => handlePositionDecision('keep')}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm hover:bg-gray-700 transition-colors flex flex-col items-center justify-center gap-1">
                            <span className="text-xs text-gray-500">{t('current')}</span>
                            <span className="font-bold">{t('keepAs', { pos: predictPlayer.position ? t('pos_' + predictPlayer.position.toLowerCase()) : '' })}</span>
                          </button>
                          <button onClick={() => handlePositionDecision('change')}
                            className="px-4 py-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl text-[#f59e0b] text-sm hover:bg-[#f59e0b]/20 transition-colors flex flex-col items-center justify-center gap-1">
                            <span className="text-xs opacity-70">{t('predicted')}</span>
                            <span className="font-bold">{t('changeTo', { pos: predictions[0].position ? t('pos_' + predictions[0].position.toLowerCase()) : '' })}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-green-400 text-xl">
                          <FiCheck />
                        </div>
                        <div className="text-green-400 font-bold mb-1">
                          {positionDecision === 'change'
                            ? t('posUpdatedTo', { pos: predictions[0].position ? t('pos_' + predictions[0].position.toLowerCase()) : predictions[0].position })
                            : t('posKeptAs',   { pos: predictPlayer.position  ? t('pos_' + predictPlayer.position.toLowerCase())  : predictPlayer.position  })}
                        </div>
                        <div className="text-sm text-green-400/70 mb-4">
                          {positionDecision === 'change' ? t('profileUpdated') : t('posConfirmedByCoach')}
                        </div>
                        <button onClick={() => setPositionDecision(null)}
                          className="text-xs text-green-400 hover:text-green-300 underline underline-offset-4">
                          {t('undo')}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setShowPredictModal(false)}
                    className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700/50">
                    {t('cancel')}
                  </button>
                  <motion.button onClick={runPrediction}
                    disabled={isPredicting||filledCount<MIN_CRITERIA}
                    whileHover={{ scale:isPredicting?1:1.02 }} whileTap={{ scale:0.98 }}
                    className="flex-1 text-white font-semibold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                    {isPredicting
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t('analysing')}</>
                      : <><FiTarget size={16}/>{predictions ? t('rePredict') : (filledCount < MIN_CRITERIA ? t('predictBestPositionMin', { filled: filledCount, min: MIN_CRITERIA }) : t('predictBestPosition'))}</>}
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