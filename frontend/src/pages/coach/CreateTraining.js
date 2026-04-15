import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUsers, FiMapPin, FiEdit3,
  FiChevronLeft, FiChevronRight, FiX, FiSearch,
  FiPlus, FiCheck, FiTrash2, FiSave,
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
  const [loadingLib, setLoadingLib] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title:       '',
    description: '',
    date:        '',
    start_time:  '10:00',
    end_time:    '12:00',
    category:    'technical',
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

  // ── Exercise builder ──────────────────────────────────────────────────────
  const [showLibrary,   setShowLibrary]   = useState(false);
  const [showCreateEx,  setShowCreateEx]  = useState(false);
  const [libSearch,     setLibSearch]     = useState('');
  const [libFilter,     setLibFilter]     = useState('all');
  const [newEx, setNewEx] = useState({
    name:'', category:'technical', duration:15, sets:3, reps:10,
    intensity:'medium', instructions:'', assigned_to:'all', player_id:null, player_name:'',
  });

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchInitialData();
    fetchLibrary();
  }, []);

  const fetchInitialData = async () => {
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
    } catch { toast.error('Failed to load data'); }
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
      assigned_to:  'all',
      player_id:    null,
      player_name:  '',
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
        assigned_to:  newEx.assigned_to === 'all' ? 'all' : newEx.player_id,
        player_id:    newEx.player_id,
        player_name:  newEx.player_name,
      };
      setForm(prev => ({ ...prev, exercises: [...prev.exercises, ex] }));
      toast.success(`"${newEx.name}" saved to library and added`);
      setNewEx({ name:'', category:'technical', duration:15, sets:3, reps:10, intensity:'medium', instructions:'', assigned_to:'all', player_id:null, player_name:'' });
      setShowCreateEx(false);
      fetchLibrary(); // refresh library
    } catch { toast.error('Failed to save exercise'); }
  };

  const removeExercise = (id) =>
    setForm(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== id) }));

  const updateExercisePlayer = (exId, playerId, playerName) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(e =>
        e.id === exId
          ? { ...e, assigned_to: playerId || 'all', player_id: playerId || null, player_name: playerName || '' }
          : e
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
          assigned_to:  ex.assigned_to || 'all',
          player_name:  ex.player_name || null,
        })),
        recurrence:      form.recurrence,
        recurrence_days: form.recurrence_days,
        recurrence_end:  form.recurrence_end || null,
      };

      await API.post('trainings/', payload);
      toast.success('Training session created successfully!');
      setTimeout(() => navigate('/coach/agenda'), 1200);
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to create training';
      toast.error(msg);
    } finally { setIsSubmitting(false); }
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
      <div className="max-w-4xl mx-auto">

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
              <div className="space-y-5">
                <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <FiEdit3 className="text-[#4fb0ff]"/>Training Details
                  </h2>

                  {/* Title */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Training name <span className="text-red-400 text-xs">*required</span>
                    </label>
                    <input type="text" value={form.title} onChange={e => setF('title', e.target.value)}
                      placeholder="e.g. Finishing & Positioning Session"
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                      required/>
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <FiCalendar className="text-[#4fb0ff]" size={13}/>Date <span className="text-red-400 text-xs">*</span>
                      </label>
                      <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                        onChange={e => setF('date', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                        required/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <FiClock className="text-[#00d0cb]" size={13}/>Start <span className="text-red-400 text-xs">*</span>
                      </label>
                      <input type="time" value={form.start_time}
                        onChange={e => setF('start_time', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                        required/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <FiClock className="text-gray-400" size={13}/>End <span className="text-red-400 text-xs">*</span>
                        {duration && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{duration}</span>}
                      </label>
                      <input type="time" value={form.end_time}
                        onChange={e => setF('end_time', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                        required/>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {CATEGORIES.map(cat => (
                        <button key={cat.key} type="button"
                          onClick={() => setF('category', cat.key)}
                          className="py-2.5 rounded-xl text-xs font-medium border transition-all"
                          style={form.category === cat.key
                            ? { background:cat.bg, borderColor:cat.color, color:cat.color }
                            : { background:'rgba(30,41,59,0.5)', borderColor:'rgba(51,65,85,0.5)', color:'#64748b' }}>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level + Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                      <select value={form.level} onChange={e => setF('level', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]">
                        <option value="A">A — Beginner</option>
                        <option value="B">B — Intermediate</option>
                        <option value="C">C — Advanced</option>
                        <option value="D">D — Elite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <FiMapPin className="text-[#902bd1]" size={13}/>Location
                      </label>
                      <input type="text" value={form.location} onChange={e => setF('location', e.target.value)}
                        placeholder="Main Field, Gym..."
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Objectives</label>
                    <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                      rows={3} placeholder="Training goals, focus areas, special instructions..."
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none"/>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {groups.map(g => (
                        <button key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                          style={form.groups.includes(g.id)
                            ? { background:'rgba(144,43,209,.15)', borderColor:'#902bd1', color:'#c084fc' }
                            : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                          <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                            style={form.groups.includes(g.id)
                              ? { background:'#902bd1', borderColor:'#902bd1' }
                              : { borderColor:'#475569' }}>
                            {form.groups.includes(g.id) && <FiCheck size={10} className="text-white"/>}
                          </div>
                          <span className="text-sm font-medium">{g.name}</span>
                        </button>
                      ))}
                    </div>
                    {form.groups.length === 0 && (
                      <p className="text-xs text-amber-400 mt-2">Select at least one group to continue</p>
                    )}
                  </div>

                  {/* Subgroups */}
                  {availableSubgroups.length > 0 && (
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Subgroups <span className="text-gray-500 text-xs">(optional — leave empty for all)</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {availableSubgroups.map(s => (
                          <button key={s.id} type="button" onClick={() => toggleSubgroup(s.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all"
                            style={form.subgroups.includes(s.id)
                              ? { background:'rgba(79,176,255,.12)', borderColor:'#4fb0ff', color:'#4fb0ff' }
                              : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                            <div className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                              style={form.subgroups.includes(s.id)
                                ? { background:'#4fb0ff', borderColor:'#4fb0ff' }
                                : { borderColor:'#475569' }}>
                              {form.subgroups.includes(s.id) && <FiCheck size={8} className="text-white"/>}
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

                {/* Current exercises in session */}
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
                        const isIndividual = ex.assigned_to && ex.assigned_to !== 'all';
                        return (
                          <div key={ex.id} className="rounded-xl p-4 border"
                            style={isIndividual
                              ? { background:'rgba(144,43,209,.06)', borderColor:'rgba(144,43,209,.3)' }
                              : { background:'rgba(30,41,59,.6)', borderColor:'rgba(51,65,85,.5)' }}>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                                style={{ background:cat.bg, color:cat.color }}>{idx+1}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-sm font-medium text-white">{ex.name}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background:cat.bg, color:cat.color }}>{cat.label}</span>
                                  {isIndividual && (
                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                      style={{ background:'rgba(144,43,209,.2)', color:'#c084fc', border:'1px solid rgba(144,43,209,.3)' }}>
                                      Individual
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                  <span>{ex.duration} min</span>
                                  {ex.sets > 0 && <span>{ex.sets} sets × {ex.reps} reps</span>}
                                  <span style={{ color: INTENSITIES.find(i=>i.key===ex.intensity)?.color || '#94a3b8' }}>
                                    {ex.intensity}
                                  </span>
                                </div>
                                {ex.instructions && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">{ex.instructions}</div>
                                )}

                                {/* Assign to player */}
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Assigned to:</span>
                                  <select
                                    value={ex.player_id || ''}
                                    onChange={e => {
                                      const pid = e.target.value ? parseInt(e.target.value) : null;
                                      const pname = pid ? filteredPlayers.find(p=>p.id===pid)?.full_name||'' : '';
                                      updateExercisePlayer(ex.id, pid, pname);
                                    }}
                                    className="text-xs px-2 py-1 rounded-lg border"
                                    style={{ background:'rgba(15,23,42,.8)', borderColor:'rgba(51,65,85,.5)', color:'#e2e8f0' }}>
                                    <option value="">All players</option>
                                    {filteredPlayers.map(p => (
                                      <option key={p.id} value={p.id}>{p.full_name}</option>
                                    ))}
                                  </select>
                                  {isIndividual && (
                                    <span className="text-xs text-purple-400">{ex.player_name}</span>
                                  )}
                                </div>
                              </div>
                              <button onClick={() => removeExercise(ex.id)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 flex-shrink-0">
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
                    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, y:-10 }}
                      className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          Exercise Library
                          <span className="text-xs text-gray-500 font-normal">click to add</span>
                        </h3>
                        <button onClick={() => setShowLibrary(false)} className="text-gray-500 hover:text-white">
                          <FiX size={16}/>
                        </button>
                      </div>

                      {/* Search + filter */}
                      <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14}/>
                          <input type="text" placeholder="Search exercises..."
                            value={libSearch} onChange={e => setLibSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"/>
                        </div>
                      </div>

                      {/* Category filter tabs */}
                      <div className="flex gap-2 flex-wrap mb-4">
                        <button onClick={() => setLibFilter('all')}
                          className="text-xs px-3 py-1.5 rounded-full border transition-all"
                          style={libFilter==='all'
                            ? { background:'rgba(79,176,255,.15)', borderColor:'#4fb0ff', color:'#4fb0ff' }
                            : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                          All ({Object.values(library).flat().length})
                        </button>
                        {CATEGORIES.map(cat => {
                          const count = (library[cat.key]||[]).length;
                          if (count === 0) return null;
                          return (
                            <button key={cat.key} onClick={() => setLibFilter(cat.key)}
                              className="text-xs px-3 py-1.5 rounded-full border transition-all"
                              style={libFilter===cat.key
                                ? { background:cat.bg, borderColor:cat.color, color:cat.color }
                                : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                              {cat.label} ({count})
                            </button>
                          );
                        })}
                      </div>

                      {/* Exercises grid */}
                      {loadingLib ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4fb0ff]"/>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                          {libraryFiltered.map((ex, i) => {
                            const cat = getCatConfig(ex.category);
                            const alreadyAdded = form.exercises.some(e => e.name === ex.name);
                            return (
                              <button key={i} type="button"
                                onClick={() => !alreadyAdded && addFromLibrary(ex)}
                                disabled={alreadyAdded}
                                className="text-left rounded-xl p-3 border transition-all"
                                style={alreadyAdded
                                  ? { background:'rgba(34,197,94,.06)', borderColor:'rgba(34,197,94,.2)', opacity:.7 }
                                  : { background:'rgba(15,23,42,.8)', borderColor:'rgba(30,41,59,1)' }}
                                onMouseEnter={e => !alreadyAdded && (e.currentTarget.style.borderColor=cat.color)}
                                onMouseLeave={e => !alreadyAdded && (e.currentTarget.style.borderColor='rgba(30,41,59,1)')}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-white mb-1">{ex.name}</div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs px-1.5 py-0.5 rounded"
                                        style={{ background:cat.bg, color:cat.color }}>{cat.label}</span>
                                      <span className="text-xs text-gray-500">{ex.duration} min</span>
                                      {ex.sets > 0 && <span className="text-xs text-gray-500">{ex.sets}×{ex.reps}</span>}
                                      <span className="text-xs" style={{ color:INTENSITIES.find(i=>i.key===ex.intensity)?.color }}>
                                        {ex.intensity}
                                      </span>
                                    </div>
                                    {ex.is_default === false && (
                                      <span className="text-xs text-purple-400">My exercise</span>
                                    )}
                                  </div>
                                  {alreadyAdded
                                    ? <FiCheck size={14} className="text-green-400 flex-shrink-0 mt-0.5"/>
                                    : <FiPlus size={14} className="text-gray-500 flex-shrink-0 mt-0.5"/>}
                                </div>
                              </button>
                            );
                          })}
                          {libraryFiltered.length === 0 && (
                            <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                              No exercises found
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Create New Exercise */}
                <AnimatePresence>
                  {showCreateEx && (
                    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, y:-10 }}
                      className="bg-gray-900/70 rounded-2xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <FiPlus className="text-[#902bd1]"/>Create new exercise
                          <span className="text-xs text-gray-500 font-normal">saved to your library</span>
                        </h3>
                        <button onClick={() => setShowCreateEx(false)} className="text-gray-500 hover:text-white">
                          <FiX size={16}/>
                        </button>
                      </div>

                      {/* Name */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                          Exercise name <span className="text-red-400">*</span>
                        </label>
                        <input type="text" value={newEx.name}
                          onChange={e => setNewEx(p=>({...p, name:e.target.value}))}
                          placeholder="e.g. 1v1 Finishing drill"
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#902bd1]"/>
                      </div>

                      {/* Category */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          {CATEGORIES.map(cat => (
                            <button key={cat.key} type="button"
                              onClick={() => setNewEx(p=>({...p, category:cat.key}))}
                              className="py-2 rounded-lg text-xs font-medium border transition-all"
                              style={newEx.category===cat.key
                                ? { background:cat.bg, borderColor:cat.color, color:cat.color }
                                : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duration + Sets + Reps */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label:'Duration (min)', key:'duration', placeholder:'15' },
                          { label:'Sets',           key:'sets',     placeholder:'3'  },
                          { label:'Reps / set',     key:'reps',     placeholder:'10' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{f.label}</label>
                            <input type="number" min="0" value={newEx[f.key]}
                              onChange={e => setNewEx(p=>({...p, [f.key]:e.target.value}))}
                              placeholder={f.placeholder}
                              className="w-full px-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#902bd1]"/>
                          </div>
                        ))}
                      </div>

                      {/* Intensity */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Intensity</label>
                        <div className="flex gap-3">
                          {INTENSITIES.map(int => (
                            <button key={int.key} type="button"
                              onClick={() => setNewEx(p=>({...p, intensity:int.key}))}
                              className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                              style={newEx.intensity===int.key
                                ? { background:int.color+'25', borderColor:int.color, color:int.color }
                                : { background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.5)', color:'#64748b' }}>
                              {int.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Assign to player */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                          Assign to
                        </label>
                        <select value={newEx.player_id || ''}
                          onChange={e => {
                            const pid = e.target.value ? parseInt(e.target.value) : null;
                            const pname = pid ? filteredPlayers.find(p=>p.id===pid)?.full_name || '' : '';
                            setNewEx(p=>({ ...p, player_id:pid, player_name:pname, assigned_to: pid || 'all' }));
                          }}
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#902bd1]">
                          <option value="">All players in session</option>
                          {filteredPlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.full_name}</option>
                          ))}
                        </select>
                        {newEx.player_id && (
                          <p className="text-xs text-purple-400 mt-1">
                            This exercise will be assigned individually to {newEx.player_name}
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

                <div className="space-y-3">
                  {[
                    { label:'Training name', value:form.title },
                    { label:'Date',          value:form.date  },
                    { label:'Time',          value:`${form.start_time} → ${form.end_time}${duration ? ` (${duration})` : ''}` },
                    { label:'Category',      value:`${getCatConfig(form.category).label} · Level ${form.level}` },
                    { label:'Location',      value:form.location || 'Main Field' },
                    { label:'Groups',        value:groups.filter(g=>form.groups.includes(g.id)).map(g=>g.name).join(', ') || '—' },
                    { label:'Players',       value:`${filteredPlayers.length} players` },
                    { label:'Exercises',     value:`${form.exercises.length} exercises · ${totalExDuration} min` },
                    { label:'Recurrence',    value: form.recurrence === 'none' ? 'One time only' : `${RECURRENCES.find(r=>r.key===form.recurrence)?.label} — until ${form.recurrence_end || '?'} (${estimatedSessions} sessions)` },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-none">
                      <span className="text-sm text-gray-500">{row.label}</span>
                      <span className="text-sm font-medium text-white text-right max-w-xs">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Individual exercises summary */}
                {form.exercises.some(e => e.assigned_to !== 'all') && (
                  <div className="mt-4 p-4 rounded-xl border"
                    style={{ background:'rgba(144,43,209,.06)', borderColor:'rgba(144,43,209,.2)' }}>
                    <div className="text-sm font-medium text-purple-400 mb-2">Individual exercises</div>
                    {form.exercises.filter(e => e.assigned_to !== 'all').map(ex => (
                      <div key={ex.id} className="text-xs text-gray-400 mb-1">
                        • {ex.name} → <span className="text-purple-300">{ex.player_name}</span>
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