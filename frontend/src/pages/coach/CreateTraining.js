import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUsers, FiMapPin, FiEdit3, FiEdit2,
  FiChevronLeft, FiChevronRight, FiX, FiSearch,
  FiPlus, FiCheck, FiTrash2, FiSave, FiTrendingUp, FiChevronDown
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key:'technical',  label:'Technical',  color:'#4fb0ff', bg:'rgba(79,176,255,0.15)',  border:'rgba(79,176,255,0.3)'  },
  { key:'tactical',   label:'Tactical',   color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  border:'rgba(245,158,11,0.3)'  },
  { key:'physical',   label:'Physical',   color:'#22c55e', bg:'rgba(34,197,94,0.15)',   border:'rgba(34,197,94,0.3)'   },
  { key:'mental',     label:'Mental',     color:'#a855f7', bg:'rgba(168,85,247,0.15)',  border:'rgba(168,85,247,0.3)'  },
  { key:'match_prep', label:'Match Prep', color:'#ef4444', bg:'rgba(239,68,68,0.15)',   border:'rgba(239,68,68,0.3)'   },
  { key:'recovery',   label:'Recovery',   color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  border:'rgba(20,184,166,0.3)'  },
];

const INTENSITIES = [
  { key:'low',    label:'Low',    color:'#22c55e' },
  { key:'medium', label:'Medium', color:'#f59e0b' },
  { key:'high',   label:'High',   color:'#ef4444' },
];

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const RECURRENCES = [
  { key:'none',     label:'No recurrence — one time only' },
  { key:'weekly',   label:'Weekly' },
  { key:'biweekly', label:'Every 2 weeks' },
  { key:'monthly',  label:'Monthly' },
];

const STEPS = ['Details','Participants','Exercises','Recurrence','Review'];

const getCatConfig = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const calcDuration = (start, end) => {
  if (!start || !end) return null;
  const [sh,sm] = start.split(':').map(Number);
  const [eh,em] = end.split(':').map(Number);
  const mins = (eh*60+em) - (sh*60+sm);
  if (mins <= 0) return null;
  const h = Math.floor(mins/60), m = mins%60;
  return h > 0 ? `${h}h ${m > 0 ? m+'min' : ''}`.trim() : `${m}min`;
};

const estimateSessions = (days, startDate, endDate, recurrence) => {
  if (!startDate || !endDate || recurrence === 'none') return 0;
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (end <= start) return 0;
  const totalDays = Math.ceil((end - start) / (1000*60*60*24));
  const delta = recurrence === 'weekly' ? 7 : recurrence === 'biweekly' ? 14 : 30;
  if (!days || days.length === 0) return Math.floor(totalDays / delta);
  // count occurrences of selected days
  let count = 0;
  let cur = new Date(start);
  cur.setDate(cur.getDate()+1);
  while (cur <= end) {
    const dayName = cur.toLocaleDateString('en',{weekday:'short'});
    if (days.includes(dayName)) count++;
    cur.setDate(cur.getDate()+1);
  }
  return count;
};

// ═══════════════════════════════════════════════════════════════════════════════
const CreateTraining = () => {
  const navigate = useNavigate();
  const [step, setStep]           = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Data from API ─────────────────────────────────────────────────────────
  const [groups,    setGroups]    = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [players,   setPlayers]   = useState([]);
  const [library,   setLibrary]   = useState({});   // grouped by category
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingLib,     setLoadingLib]     = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title:       '',
    description: '',
    date:        '',
    start_time:  '10:00',
    end_time:    '12:00',
    category:    ['technical'],
    level:       'B',
    location:    '',
    // participants
    groups:    [],
    subgroups: [],
    // exercises
    exercises: [],
    // recurrence
    recurrence:       'none',
    recurrence_days:  [],
    recurrence_end:   '',
  });

  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  // ── Initial Fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchInitialData();
    fetchLibrary();
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const closeAll = () => setShowLevelDropdown(false);
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  // ── Exercise builder ──────────────────────────────────────────────────────
  const [showLibrary,   setShowLibrary]   = useState(false);
  const [showCreateEx,  setShowCreateEx]  = useState(false);
  const [libSearch,     setLibSearch]     = useState('');
  const [libFilter,     setLibFilter]     = useState('all');
  const [newEx, setNewEx] = useState({
    name:'', category:'technical', duration:15, sets:3, reps:10,
    intensity:'medium', instructions:'', assigned_players:[],
  });

  const [activeExPicker, setActiveExPicker] = useState(null); // ID of exercise having its picker open

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    try {
      const [gRes, pRes] = await Promise.all([
        API.get('groups/'),
        API.get('players/'),
      ]);
      setGroups(gRes.data);
      setPlayers(pRes.data);
      // Subgroups from player data
      const subs = {};
      pRes.data.forEach(p => {
        if (p.subgroup) {
          if (!subs[p.group?.id]) subs[p.group?.id] = new Set();
          subs[p.group?.id].add(JSON.stringify({ id: p.subgroup.id, name: p.subgroup.name }));
        }
      });
      const subArr = [];
      Object.entries(subs).forEach(([gId, set]) => {
        set.forEach(s => subArr.push({ ...JSON.parse(s), group_id: parseInt(gId) }));
      });
      setSubgroups(subArr);
    } catch { toast.error('Failed to load groups and players'); }
    finally { setLoadingInitial(false); }
  };

  const fetchLibrary = async () => {
    setLoadingLib(true);
    try {
      const res = await API.get('exercises/grouped/');
      setLibrary(res.data);
    } catch { toast.error('Failed to load exercise library'); }
    finally { setLoadingLib(false); }
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const availableSubgroups = useMemo(() =>
    subgroups.filter(s => form.groups.includes(s.group_id)),
    [subgroups, form.groups]
  );

  const filteredPlayers = useMemo(() =>
    players.filter(p =>
      form.groups.includes(p.group?.id) &&
      (form.subgroups.length === 0 || form.subgroups.includes(p.subgroup?.id))
    ),
    [players, form.groups, form.subgroups]
  );

  const duration = calcDuration(form.start_time, form.end_time);

  const totalExDuration = form.exercises.reduce((acc, ex) => acc + (ex.duration || 0), 0);

  const estimatedSessions = estimateSessions(
    form.recurrence_days, form.date, form.recurrence_end, form.recurrence
  );

  const libraryFiltered = useMemo(() => {
    const all = Object.values(library).flat();
    return all.filter(ex => {
      const matchCat = libFilter === 'all' || ex.category === libFilter;
      const matchSearch = !libSearch || ex.name.toLowerCase().includes(libSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [library, libFilter, libSearch]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleCategory = (key) => {
    setForm(prev => {
      const current = Array.isArray(prev.category) ? prev.category : [prev.category];
      const category = current.includes(key)
        ? current.filter(c => c !== key)
        : [...current, key];
      return { ...prev, category: category.length > 0 ? category : ['technical'] };
    });
  };

  const toggleGroup = (id) => {
    setForm(prev => {
      const groups = prev.groups.includes(id)
        ? prev.groups.filter(g => g !== id)
        : [...prev.groups, id];
      return { ...prev, groups, subgroups: [] };
    });
  };

  const toggleSubgroup = (id) => {
    setForm(prev => ({
      ...prev,
      subgroups: prev.subgroups.includes(id)
        ? prev.subgroups.filter(s => s !== id)
        : [...prev.subgroups, id],
    }));
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter(d => d !== day)
        : [...prev.recurrence_days, day],
    }));
  };

  // Add exercise from library
  const addFromLibrary = (ex) => {
    const newExercise = {
      id:           `ex-${Date.now()}-${Math.random()}`,
      name:         ex.name,
      category:     ex.category,
      duration:     ex.duration,
      sets:         ex.sets,
      reps:         ex.reps,
      intensity:    ex.intensity,
      instructions: ex.instructions || '',
      assigned_players: [],
    };
    setForm(prev => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
    toast.success(`"${ex.name}" added`);
  };

  // Save new custom exercise → library + session
  const saveNewExercise = async () => {
    if (!newEx.name.trim()) { toast.error('Exercise name is required'); return; }
    try {
      // Save to library
      await API.post('exercises/', {
        name:         newEx.name,
        category:     newEx.category,
        duration:     newEx.duration,
        sets:         newEx.sets,
        reps:         newEx.reps,
        intensity:    newEx.intensity,
        instructions: newEx.instructions,
      });
      // Add to current session
      const ex = {
        id:           `ex-${Date.now()}`,
        name:         newEx.name,
        category:     newEx.category,
        duration:     parseInt(newEx.duration) || 15,
        sets:         parseInt(newEx.sets)     || 3,
        reps:         parseInt(newEx.reps)     || 10,
        intensity:    newEx.intensity,
        instructions: newEx.instructions,
        assigned_players: newEx.assigned_players || [],
      };
      setForm(prev => ({ ...prev, exercises: [...prev.exercises, ex] }));
      toast.success(`"${newEx.name}" saved to library and added`);
      setNewEx({ name:'', category:'technical', duration:15, sets:3, reps:10, intensity:'medium', instructions:'', assigned_players:[] });
      setShowCreateEx(false);
      fetchLibrary(); // refresh library
    } catch { toast.error('Failed to save exercise'); }
  };

  const removeExercise = (id) =>
    setForm(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== id) }));

  const updateExercisePlayers = (exId, playerIds) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(e =>
        e.id === exId ? { ...e, assigned_players: playerIds } : e
      ),
    }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim())    { toast.error('Training name is required');          setStep(0); return; }
    if (!form.date)            { toast.error('Date is required');                   setStep(0); return; }
    if (!form.start_time)      { toast.error('Start time is required');             setStep(0); return; }
    if (!form.end_time)        { toast.error('End time is required');               setStep(0); return; }
    if (form.groups.length===0){ toast.error('Select at least one group');          setStep(1); return; }
    if (form.recurrence !== 'none' && !form.recurrence_end) {
      toast.error('Recurrence end date is required'); setStep(3); return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title:           form.title,
        description:     form.description,
        date:            form.date,
        start_time:      form.start_time,
        end_time:        form.end_time,
        category:        form.category,
        level:           form.level,
        location:        form.location || 'Main Field',
        groups:          form.groups,
        subgroups:       form.subgroups,
        exercises:       form.exercises.map(ex => ({
          id:           ex.id,
          name:         ex.name,
          category:     ex.category,
          duration:     ex.duration,
          sets:         ex.sets,
          reps:         ex.reps,
          intensity:    ex.intensity,
          instructions: ex.instructions,
          assigned_players: ex.assigned_players || [],
        })),
        recurrence:      form.recurrence,
        recurrence_days: form.recurrence_days,
        recurrence_end:  form.recurrence_end || null,
      };

      console.log('🚀 Final Payload:', payload);
      console.log('🌐 API Endpoint: POST /api/trainings/');

      await API.post('trainings/', payload);
      toast.success('Training session created successfully!');
      setTimeout(() => navigate('/coach/agenda'), 1200);
    } catch (err) {
      console.error('❌ Submission Error:', err.response?.data || err.message);
      const errorData = err.response?.data;
      let msg = 'Failed to create training';
      
      if (typeof errorData === 'object' && errorData !== null) {
        msg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      } else if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE')) {
        msg = 'Server Error (500): The backend failed to process this request. Check console for details.';
      } else if (typeof errorData === 'string') {
        msg = errorData;
      }

      toast.error(msg, { duration: 5000 });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // ── Validation per step ───────────────────────────────────────────────────
  const canProceed = (s) => {
    if (s === 0) return form.title.trim() && form.date && form.start_time && form.end_time;
    if (s === 1) return form.groups.length > 0;
    return true;
  };

  const goNext = () => {
    if (!canProceed(step)) {
      if (step===0) toast.error('Please fill in all required fields');
      if (step===1) toast.error('Please select at least one group');
      return;
    }
    setStep(s => Math.min(STEPS.length-1, s+1));
  };

  const cV = { hidden:{ opacity:0 }, visible:{ opacity:1, transition:{ staggerChildren:0.08 } } };
  const iV = { hidden:{ y:16, opacity:0 }, visible:{ y:0, opacity:1 } };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right"/>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={iV} className="mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] p-3 rounded-2xl">
              <FiEdit3 className="text-white text-2xl"/>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Create Training
              </h1>
              <p className="text-gray-400 mt-1">Design and schedule your training session</p>
            </div>
          </div>
        </motion.div>

        {/* Steps bar */}
        <motion.div variants={iV} className="mb-8">
          <div className="flex rounded-xl overflow-hidden border border-gray-800">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => { if (i < step || canProceed(step)) setStep(i); }}
                className="flex-1 py-3 text-xs font-medium text-center transition-all border-r border-gray-800 last:border-r-0"
                style={i === step
                  ? { background:'linear-gradient(135deg,rgba(144,43,209,.3),rgba(79,176,255,.3))', color:'#4fb0ff', borderBottom:'2px solid #4fb0ff' }
                  : i < step
                    ? { background:'rgba(34,197,94,.06)', color:'#4ade80' }
                    : { background:'#0f172a', color:'#475569' }}>
                {i < step ? '✓ ' : `${i+1}. `}{s}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>

            {/* ══════════════════════════════════════════════
                STEP 1 — DETAILS
            ══════════════════════════════════════════════ */}
            {step === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Basic Info Card */}
                <div className="bg-gray-900/70 rounded-2xl p-8 border border-gray-700/50 h-full">
                  <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#4fb0ff]/10">
                      <FiEdit3 className="text-[#4fb0ff]"/>
                    </div>
                    Core Information
                  </h2>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Training name <span className="text-red-400 font-black">*</span>
                    </label>
                    <input type="text" value={form.title} onChange={e => setF('title', e.target.value)}
                      placeholder="e.g. Finishing & Positioning Session"
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                      required/>
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiCalendar className="text-[#4fb0ff]" size={12}/>Date
                      </label>
                      <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                        onChange={e => setF('date', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                        required/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiClock className="text-[#00d0cb]" size={12}/>Start
                      </label>
                      <input type="time" value={form.start_time}
                        onChange={e => setF('start_time', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                        required/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiClock className="text-gray-500" size={12}/>End
                      </label>
                      <input type="time" value={form.end_time}
                        onChange={e => setF('end_time', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                        required/>
                    </div>
                  </div>

                  {/* Level + Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiTrendingUp className="text-[#00d0cb]" size={12}/>Level
                      </label>
                      <button 
                        type="button"
                        onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                        className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white flex items-center justify-between hover:border-[#00d0cb]/40 transition-all"
                      >
                        <span className="font-medium">
                          {form.level === 'A' ? 'A — Beginner' : 
                           form.level === 'B' ? 'B — Intermediate' : 
                           form.level === 'C' ? 'C — Advanced' : 'D — Elite'}
                        </span>
                        <FiChevronDown className={`transition-transform duration-200 ${showLevelDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showLevelDropdown && (
                          <motion.div 
                            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                            className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                          >
                            {[
                              { id: 'A', name: 'A — Beginner' },
                              { id: 'B', name: 'B — Intermediate' },
                              { id: 'C', name: 'C — Advanced' },
                              { id: 'D', name: 'D — Elite' },
                            ].map(opt => (
                              <div 
                                key={opt.id} 
                                onClick={() => { setF('level', opt.id); setShowLevelDropdown(false); }} 
                                className={`px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${form.level === opt.id ? 'bg-[#00d0cb]/10 text-[#00d0cb]' : ''}`}
                              >
                                <span className="font-medium">{opt.name}</span>
                                {form.level === opt.id && <FiCheck className="text-[#00d0cb]" />}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiMapPin className="text-[#902bd1]" size={12}/>Location
                      </label>
                      <input type="text" value={form.location} onChange={e => setF('location', e.target.value)}
                        placeholder="Main Field, Gym..."
                        className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"/>
                    </div>
                  </div>
                </div>

                {/* Categories & Objectives Column */}
                <div className="space-y-6">
                  {/* Category Card */}
                  <div className="bg-gray-900/70 rounded-2xl p-8 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#00d0cb]/10">
                        <FaDumbbell className="text-[#00d0cb]" size={18}/>
                      </div>
                      Training Category
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CATEGORIES.map(cat => (
                        <button key={cat.key} type="button"
                          onClick={() => toggleCategory(cat.key)}
                          className="py-3 rounded-2xl text-[11px] font-bold border transition-all flex items-center justify-center gap-3"
                          style={form.category.includes(cat.key)
                            ? { background:cat.bg, borderColor:cat.color, color:cat.color }
                            : { background:'rgba(30,41,59,0.3)', borderColor:'rgba(51,65,85,0.3)', color:'#64748b' }}>
                          <div className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center">
                            {form.category.includes(cat.key) && <FiCheck size={10} />}
                          </div>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Objectives Card */}
                  <div className="bg-gray-900/70 rounded-2xl p-8 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#902bd1]/10">
                        <FiEdit2 className="text-[#902bd1]"/>
                      </div>
                      Objectives
                    </h2>
                    <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                      rows={5} placeholder="Training goals, focus areas, special instructions..."
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none transition-all leading-relaxed"/>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                STEP 2 — PARTICIPANTS
            ══════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <FiUsers className="text-[#4fb0ff]"/>Participants
                  </h2>

                  {/* Groups */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Groups <span className="text-red-400 text-xs">*required</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {loadingInitial ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-16 rounded-xl bg-gray-800/40 animate-pulse border border-gray-700/30" />
                        ))
                      ) : groups.length > 0 ? (
                        groups.map(g => (
                          <button key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                            className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:bg-white/5"
                            style={form.groups.includes(g.id)
                              ? { background:'rgba(144,43,209,.15)', borderColor:'#902bd1', color:'#c084fc', boxShadow:'0 0 20px rgba(144,43,209,0.1)' }
                              : { background:'rgba(30,41,59,.3)', borderColor:'rgba(51,65,85,.3)', color:'#64748b' }}>
                            <div className="w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0"
                              style={form.groups.includes(g.id)
                                ? { background:'#902bd1', borderColor:'#902bd1' }
                                : { borderColor:'#475569' }}>
                              {form.groups.includes(g.id) && <FiCheck size={12} className="text-white font-bold"/>}
                            </div>
                            <span className="text-sm font-bold tracking-wide">{g.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center bg-gray-800/20 rounded-3xl border border-dashed border-gray-700/50">
                          <p className="text-sm text-gray-500 italic">No groups found. Please create groups first.</p>
                        </div>
                      )}
                    </div>
                    {!loadingInitial && groups.length > 0 && form.groups.length === 0 && (
                      <p className="text-[10px] text-amber-400 mt-4 font-bold uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Select at least one group to continue
                      </p>
                    )}
                  </div>

                  {/* Subgroups */}
                  {availableSubgroups.length > 0 && (
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Subgroups <span className="text-gray-600">(optional)</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {availableSubgroups.map(s => (
                          <button key={s.id} type="button" onClick={() => toggleSubgroup(s.id)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:bg-white/5"
                            style={form.subgroups.includes(s.id)
                              ? { background:'rgba(79,176,255,.12)', borderColor:'#4fb0ff', color:'#4fb0ff' }
                              : { background:'rgba(30,41,59,.3)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                            <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                              style={form.subgroups.includes(s.id)
                                ? { background:'#4fb0ff', borderColor:'#4fb0ff' }
                                : { borderColor:'#475569' }}>
                              {form.subgroups.includes(s.id) && <FiCheck size={10} className="text-white"/>}
                            </div>
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {form.groups.length > 0 && (
                    <div className="p-4 rounded-xl border"
                      style={{ background:'rgba(79,176,255,.06)', borderColor:'rgba(79,176,255,.15)' }}>
                      <div className="text-sm text-gray-400">
                        <span className="text-[#4fb0ff] font-semibold">{filteredPlayers.length} players</span>
                        {' '}in{' '}
                        {groups.filter(g => form.groups.includes(g.id)).map(g => g.name).join(', ')}
                        {form.subgroups.length > 0 && (
                          <span className="text-gray-500"> · filtered by subgroup</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                STEP 3 — EXERCISES
            ══════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FaDumbbell className="text-[#4fb0ff]" style={{ fontSize:16 }}/>
                      Exercises in this session
                    </h2>
                    {form.exercises.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                        style={{ background:'rgba(79,176,255,.12)', color:'#4fb0ff' }}>
                        {form.exercises.length} exercises · {totalExDuration} min total
                      </div>
                    )}
                  </div>

                  {/* Exercise list */}
                  {form.exercises.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-700/50 rounded-xl p-10 text-center">
                      <FaDumbbell className="mx-auto text-gray-600 mb-3" style={{ fontSize:32 }}/>
                      <p className="text-gray-400 text-sm">No exercises added yet</p>
                      <p className="text-gray-600 text-xs mt-1">Add from the library or create a new one below</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {form.exercises.map((ex, idx) => {
                        const cat = getCatConfig(ex.category);
                        return (
                          <div key={ex.id} className="rounded-xl p-4 border"
                            style={(ex.assigned_players && ex.assigned_players.length > 0)
                              ? { background:'rgba(144,43,209,.06)', borderColor:'rgba(144,43,209,.3)' }
                              : { background:'rgba(30,41,59,.6)', borderColor:'rgba(51,65,85,.5)' }}>
                            <div className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1"
                                style={{ background:cat.bg, color:cat.color }}>{idx+1}</div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-sm font-medium text-white truncate">{ex.name}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                                    style={{ background:cat.bg, color:cat.color }}>{cat.label}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                  <span>{ex.duration} min</span>
                                  {ex.sets > 0 && <span>{ex.sets} sets × {ex.reps} reps</span>}
                                  <span style={{ color: INTENSITIES.find(i=>i.key===ex.intensity)?.color || '#94a3b8' }}>
                                    {ex.intensity}
                                  </span>
                                </div>

                                {/* Assignment Control Row */}
                                <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Assigned to:</span>
                                    
                                    {(!ex.assigned_players || ex.assigned_players.length === 0) ? (
                                      <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        All Players
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 rounded-lg bg-[#902bd1]/10 text-[#c084fc] text-[10px] font-bold border border-[#902bd1]/20 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#902bd1]" />
                                        {ex.assigned_players.length} Selected Players
                                      </span>
                                    )}

                                    <button 
                                      type="button"
                                      onClick={() => setActiveExPicker(activeExPicker === ex.id ? null : ex.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00d0cb]/30 bg-[#00d0cb]/5 text-[#00d0cb] hover:bg-[#00d0cb]/10 hover:border-[#00d0cb]/60 transition-all text-[10px] font-bold uppercase tracking-wide group"
                                    >
                                      {activeExPicker === ex.id ? (
                                        <FiX size={12} className="group-hover:rotate-90 transition-transform" />
                                      ) : (
                                        <FiEdit2 size={12} className="group-hover:scale-110 transition-transform" />
                                      )}
                                      <span>{activeExPicker === ex.id ? 'Close' : 'Change'}</span>
                                    </button>
                                  </div>

                                  {/* Avatars Stack (Right-aligned) */}
                                  {ex.assigned_players?.length > 0 && (
                                    <div className="flex -space-x-1.5">
                                      {ex.assigned_players.slice(0, 5).map(pid => {
                                        const p = players.find(pl => pl.id === pid);
                                        if (!p) return null;
                                        return (
                                          <div key={pid} className="w-5 h-5 rounded-full border border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all cursor-help" title={p.full_name}>
                                            {p.profile_picture ? (
                                              <img src={p.profile_picture} className="w-full h-full object-cover" />
                                            ) : (
                                              <span className="text-[8px] font-bold text-white uppercase">{p.full_name.charAt(0)}</span>
                                            )}
                                          </div>
                                        );
                                      })}
                                      {ex.assigned_players.length > 5 && (
                                        <div className="w-5 h-5 rounded-full border border-gray-900 bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                          +{ex.assigned_players.length - 5}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Selection Dropdown */}
                                {activeExPicker === ex.id && (
                                  <motion.div 
                                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} 
                                    className="mt-4 p-3 bg-gray-950/60 rounded-xl border border-gray-800 space-y-2"
                                  >
                                    <button 
                                      type="button"
                                      onClick={() => updateExercisePlayers(ex.id, [])}
                                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                                    >
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${(!ex.assigned_players || ex.assigned_players.length === 0) ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                                        {(!ex.assigned_players || ex.assigned_players.length === 0) && <FiCheck size={10} className="text-white"/>}
                                      </div>
                                      <span className={`text-[11px] font-bold ${(!ex.assigned_players || ex.assigned_players.length === 0) ? 'text-blue-400' : 'text-gray-400'}`}>
                                        Assign to All Players in this session
                                      </span>
                                    </button>
                                    <div className="h-[1px] bg-gray-800 mx-2" />
                                    <div className="max-h-48 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                                      {filteredPlayers.map(p => {
                                        const isSelected = ex.assigned_players?.includes(p.id);
                                        return (
                                          <button key={p.id} type="button"
                                            onClick={() => {
                                              const current = ex.assigned_players || [];
                                              const next = isSelected 
                                                ? current.filter(id => id !== p.id)
                                                : [...current, p.id];
                                              updateExercisePlayers(ex.id, next);
                                            }}
                                            className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                                          >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}>
                                              {isSelected && <FiCheck size={10} className="text-white"/>}
                                            </div>
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                              {p.profile_picture ? <img src={p.profile_picture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-500">{p.full_name.charAt(0)}</div>}
                                            </div>
                                            <span className={`text-xs ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>{p.full_name}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              <button onClick={() => removeExercise(ex.id)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 flex-shrink-0 mt-1 transition-colors">
                                <FiTrash2 size={14}/>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button type="button"
                      onClick={() => { setShowLibrary(v=>!v); setShowCreateEx(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
                      style={showLibrary
                        ? { background:'rgba(79,176,255,.15)', borderColor:'#4fb0ff', color:'#4fb0ff' }
                        : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#94a3b8' }}>
                      <FiSearch size={14}/>Add from library
                    </button>
                    <button type="button"
                      onClick={() => { setShowCreateEx(v=>!v); setShowLibrary(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
                      style={showCreateEx
                        ? { background:'rgba(144,43,209,.15)', borderColor:'#902bd1', color:'#c084fc' }
                        : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#94a3b8' }}>
                      <FiPlus size={14}/>Create new exercise
                    </button>
                  </div>
                </div>

                {/* Exercise Library */}
                <AnimatePresence>
                  {showLibrary && (
                    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                      className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          Exercise Library
                        </h3>
                        <button onClick={() => setShowLibrary(false)} className="text-gray-500 hover:text-white">
                          <FiX size={16}/>
                        </button>
                      </div>

                      <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14}/>
                          <input type="text" placeholder="Search exercises..."
                            value={libSearch} onChange={e => setLibSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-4">
                        <button onClick={() => setLibFilter('all')}
                          className="text-xs px-3 py-1.5 rounded-full border transition-all"
                          style={libFilter==='all'
                            ? { background:'rgba(79,176,255,.15)', borderColor:'#4fb0ff', color:'#4fb0ff' }
                            : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                          All
                        </button>
                        {CATEGORIES.map(cat => (
                          <button key={cat.key} onClick={() => setLibFilter(cat.key)}
                            className="text-xs px-3 py-1.5 rounded-full border transition-all"
                            style={libFilter===cat.key
                              ? { background:cat.bg, borderColor:cat.color, color:cat.color }
                              : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {loadingLib ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4fb0ff]"/></div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                          {libraryFiltered.map((ex, i) => {
                            const cat = getCatConfig(ex.category);
                            const alreadyAdded = form.exercises.some(e => e.name === ex.name);
                            return (
                              <button key={i} type="button" onClick={() => !alreadyAdded && addFromLibrary(ex)} disabled={alreadyAdded}
                                className="text-left rounded-xl p-3 border transition-all"
                                style={alreadyAdded
                                  ? { background:'rgba(34,197,94,.06)', borderColor:'rgba(34,197,94,.2)', opacity:.7 }
                                  : { background:'rgba(15,23,42,.8)', borderColor:'rgba(30,41,59,1)' }}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-white mb-1">{ex.name}</div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background:cat.bg, color:cat.color }}>{cat.label}</span>
                                      <span className="text-xs text-gray-500">{ex.duration} min</span>
                                    </div>
                                  </div>
                                  {alreadyAdded ? <FiCheck size={14} className="text-green-400"/> : <FiPlus size={14} className="text-gray-500"/>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Create New Exercise */}
                <AnimatePresence>
                  {showCreateEx && (
                    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                      className="bg-gray-900/70 rounded-2xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <FiPlus className="text-[#902bd1]"/>Create new exercise
                        </h3>
                        <button onClick={() => setShowCreateEx(false)} className="text-gray-500 hover:text-white">
                          <FiX size={16}/>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Exercise name</label>
                          <input type="text" value={newEx.name} onChange={e => setNewEx(p=>({...p, name:e.target.value}))}
                            placeholder="e.g. 1v1 Finishing drill"
                            className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#902bd1]"/>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {CATEGORIES.map(cat => (
                              <button key={cat.key} type="button" onClick={() => setNewEx(p=>({...p, category:cat.key}))}
                                className="py-2 rounded-lg text-xs font-medium border transition-all"
                                style={newEx.category===cat.key ? { background:cat.bg, borderColor:cat.color, color:cat.color } : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label:'Duration', key:'duration' },
                            { label:'Sets', key:'sets' },
                            { label:'Reps', key:'reps' },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{f.label}</label>
                              <input type="number" value={newEx[f.key]} onChange={e => setNewEx(p=>({...p, [f.key]:e.target.value}))}
                                className="w-full px-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#902bd1]"/>
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Intensity</label>
                          <div className="flex gap-3">
                            {INTENSITIES.map(int => (
                              <button key={int.key} type="button" onClick={() => setNewEx(p=>({...p, intensity:int.key}))}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                                style={newEx.intensity===int.key ? { background:int.color+'25', borderColor:int.color, color:int.color } : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                                {int.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Assign to specific players (Optional)</label>
                          <div className="bg-gray-800/65 border border-gray-700/50 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                            {filteredPlayers.length > 0 ? (
                              filteredPlayers.map(p => {
                                const isSelected = newEx.assigned_players?.includes(p.id);
                                return (
                                  <button key={p.id} type="button"
                                    onClick={() => {
                                      const current = newEx.assigned_players || [];
                                      const next = isSelected 
                                        ? current.filter(id => id !== p.id)
                                        : [...current, p.id];
                                      setNewEx(p => ({ ...p, assigned_players: next }));
                                    }}
                                    className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                                  >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}>
                                      {isSelected && <FiCheck size={10} className="text-white"/>}
                                    </div>
                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                      {p.profile_picture ? <img src={p.profile_picture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">{p.full_name.charAt(0)}</div>}
                                    </div>
                                    <span className={`text-[11px] ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>{p.full_name}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-gray-600 italic py-2">No players available for selected groups.</p>
                            )}
                          </div>
                        {(newEx.assigned_players?.length > 0) && (
                          <p className="text-[10px] text-purple-400 mt-2 font-medium">
                            {newEx.assigned_players.length} specific players selected.
                          </p>
                        )}
                      </div>

                      {/* Instructions */}
                      <div className="mb-5">
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Instructions</label>
                        <textarea value={newEx.instructions}
                          onChange={e => setNewEx(p=>({...p, instructions:e.target.value}))}
                          rows={3} placeholder="Describe how to execute this exercise..."
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#902bd1] resize-none"/>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setShowCreateEx(false)}
                          className="px-5 py-3 bg-gray-800/50 text-gray-400 rounded-xl border border-gray-700 text-sm hover:bg-gray-700/50">
                          Cancel
                        </button>
                        <motion.button type="button" onClick={saveNewExercise}
                          whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white"
                          style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                          <FiSave size={14}/>Save to library & add to session
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                STEP 4 — RECURRENCE
            ══════════════════════════════════════════════ */}
            {step === 3 && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <FiCalendar className="text-[#00d0cb]"/>Recurrence
                </h2>

                {/* Recurrence type */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Repeat this session</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {RECURRENCES.map(r => (
                      <button key={r.key} type="button"
                        onClick={() => setF('recurrence', r.key)}
                        className="py-3 px-3 rounded-xl border text-sm transition-all text-left"
                        style={form.recurrence===r.key
                          ? { background:'rgba(0,208,203,.12)', borderColor:'#00d0cb', color:'#00d0cb' }
                          : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days + End date */}
                {form.recurrence !== 'none' && (
                  <>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Repeat on days</label>
                      <div className="grid grid-cols-7 gap-2">
                        {DAYS.map(day => (
                          <button key={day} type="button" onClick={() => toggleDay(day)}
                            className="py-2 rounded-lg text-xs font-medium border transition-all"
                            style={form.recurrence_days.includes(day)
                              ? { background:'rgba(144,43,209,.25)', borderColor:'#902bd1', color:'#c084fc' }
                              : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Start date</label>
                        <input type="date" value={form.date} readOnly
                          className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/30 rounded-xl text-gray-400 cursor-not-allowed"/>
                        <p className="text-xs text-gray-600 mt-1">Same as training date</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          End date <span className="text-red-400 text-xs">*required</span>
                        </label>
                        <input type="date" value={form.recurrence_end}
                          min={form.date}
                          onChange={e => setF('recurrence_end', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                      </div>
                    </div>

                    {estimatedSessions > 0 && (
                      <div className="p-4 rounded-xl border"
                        style={{ background:'rgba(0,208,203,.06)', borderColor:'rgba(0,208,203,.2)' }}>
                        <div className="text-sm text-gray-400">
                          This will create{' '}
                          <span className="text-[#00d0cb] font-semibold text-base">{estimatedSessions} sessions</span>
                          {' '}between {form.date} and {form.recurrence_end}
                          {form.recurrence_days.length > 0 && (
                            <span> — {form.recurrence_days.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {form.recurrence === 'none' && (
                  <div className="p-4 rounded-xl border border-gray-700/30 bg-gray-800/30 text-sm text-gray-500">
                    This training session will be created once — on {form.date || 'the selected date'}.
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════
                STEP 5 — REVIEW
            ══════════════════════════════════════════════ */}
            {step === 4 && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-lg font-bold text-white mb-5">Review & Confirm</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1">
                  {[
                    { label:'Training name', value:form.title },
                    { label:'Date',          value:form.date  },
                    { label:'Time',          value:`${form.start_time} → ${form.end_time}${duration ? ` (${duration})` : ''}` },
                    { label:'Category',      value:`${form.category.map(c => getCatConfig(c).label).join(' + ')} · Level ${form.level}` },
                    { label:'Location',      value:form.location || 'Main Field' },
                    { label:'Groups',        value:groups.filter(g=>form.groups.includes(g.id)).map(g=>g.name).join(', ') || '—' },
                    { label:'Players',       value:`${filteredPlayers.length} players` },
                    { label:'Exercises',     value:`${form.exercises.length} exercises · ${totalExDuration} min` },
                    { label:'Recurrence',    value: form.recurrence === 'none' ? 'One time only' : `${RECURRENCES.find(r=>r.key===form.recurrence)?.label} — until ${form.recurrence_end || '?'} (${estimatedSessions} sessions)` },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-800/50 last:border-none lg:last:border-b lg:border-gray-800/50">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{row.label}</span>
                      <span className="text-sm font-semibold text-white text-right max-w-xs">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Individual exercises summary */}
                {form.exercises.some(e => e.assigned_players && e.assigned_players.length > 0) && (
                  <div className="mt-4 p-4 rounded-xl border"
                    style={{ background:'rgba(144,43,209,.06)', borderColor:'rgba(144,43,209,.2)' }}>
                    <div className="text-sm font-medium text-purple-400 mb-2">Custom Player Assignments</div>
                    {form.exercises.filter(e => e.assigned_players && e.assigned_players.length > 0).map(ex => (
                      <div key={ex.id} className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                        <span>• {ex.name}</span>
                        <span className="text-purple-300 font-bold">{ex.assigned_players.length} Players</span>
                      </div>
                    ))}
                  </div>
                )}

                <motion.button type="button" onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  className="w-full mt-6 py-4 rounded-xl font-semibold text-white text-base disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  {isSubmitting
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Creating...</>
                    : <><FiCheck size={18}/>Create Training Session</>}
                </motion.button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s-1)}
            className="flex items-center gap-2 px-5 py-3 bg-gray-900/70 text-gray-300 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 text-sm">
            <FiChevronLeft size={16}/>{step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEPS.length - 1 && (
            <motion.button onClick={goNext}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white text-sm"
              style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
              Next — {STEPS[step+1]}<FiChevronRight size={16}/>
            </motion.button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default CreateTraining;