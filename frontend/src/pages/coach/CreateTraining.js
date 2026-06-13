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
import { useTranslation } from 'react-i18next';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORY_KEYS = ['technical', 'tactical', 'physical', 'mental', 'match_prep', 'recovery'];
const CATEGORY_STYLES = {
  technical:  { color: '#4fb0ff', bg: 'rgba(79,176,255,0.15)',  border: 'rgba(79,176,255,0.3)'  },
  tactical:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)'  },
  physical:   { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)'   },
  mental:     { color: '#a855f7', bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.3)'  },
  match_prep: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)'   },
  recovery:   { color: '#14b8a6', bg: 'rgba(20,184,166,0.15)',  border: 'rgba(20,184,166,0.3)'  },
};

const INTENSITY_KEYS = ['low', 'medium', 'high'];
const INTENSITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

const RECURRENCE_KEYS = ['none', 'weekly', 'biweekly', 'monthly'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_VALUES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEP_KEYS = ['details', 'participants', 'exercises', 'recurrence', 'review'];

const getCatStyle = (key) => CATEGORY_STYLES[key] || CATEGORY_STYLES.technical;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const calcDuration = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + 'min' : ''}`.trim() : `${m}min`;
};

const estimateSessions = (days, startDate, endDate, recurrence) => {
  if (!startDate || !endDate || recurrence === 'none') return 0;
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (end <= start) return 0;
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const delta = recurrence === 'weekly' ? 7 : recurrence === 'biweekly' ? 14 : 30;
  if (!days || days.length === 0) return Math.floor(totalDays / delta);
  let count = 0;
  let cur = new Date(start);
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    const dayName = cur.toLocaleDateString('en', { weekday: 'short' });
    if (days.includes(dayName)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// ═══════════════════════════════════════════════════════════════════════════════
const CreateTraining = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('coachtraining');
  const isRTL = i18n.language === 'ar';

  const [step, setStep]           = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Data from API ─────────────────────────────────────────────────────────
  const [groups,    setGroups]    = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [players,   setPlayers]   = useState([]);
  const [library,   setLibrary]   = useState({});
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
    groups:    [],
    subgroups: [],
    exercises: [],
    recurrence:       'none',
    recurrence_days:  [],
    recurrence_end:   '',
  });

  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  // ── Exercise builder ──────────────────────────────────────────────────────
  const [showLibrary,   setShowLibrary]   = useState(false);
  const [showCreateEx,  setShowCreateEx]  = useState(false);
  const [libSearch,     setLibSearch]     = useState('');
  const [libFilter,     setLibFilter]     = useState('all');
  const [newEx, setNewEx] = useState({
    name: '', category: 'technical', duration: 15, sets: 3, reps: 10,
    intensity: 'medium', instructions: '', assigned_players: [],
  });
  const [activeExPicker, setActiveExPicker] = useState(null);

  // ── Initial Fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchInitialData();
    fetchLibrary();
  }, []);

  useEffect(() => {
    const closeAll = () => setShowLevelDropdown(false);
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    try {
      const [gRes, pRes] = await Promise.all([
        API.get('groups/'),
        API.get('players/'),
      ]);
      setGroups(gRes.data);
      setPlayers(pRes.data);
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
    } catch { toast.error(t('toast.load_groups_error')); }
    finally { setLoadingInitial(false); }
  };

  const fetchLibrary = async () => {
    setLoadingLib(true);
    try {
      const res = await API.get('exercises/grouped/');
      setLibrary(res.data);
    } catch { toast.error(t('toast.load_library_error')); }
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
    toast.success(`"${ex.name}" ${t('toast.exercise_added')}`);
  };

  const saveNewExercise = async () => {
    if (!newEx.name.trim()) { toast.error(t('toast.exercise_name_required')); return; }
    try {
      await API.post('exercises/', {
        name:         newEx.name,
        category:     newEx.category,
        duration:     newEx.duration,
        sets:         newEx.sets,
        reps:         newEx.reps,
        intensity:    newEx.intensity,
        instructions: newEx.instructions,
      });
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
      toast.success(`"${newEx.name}" ${t('toast.exercise_added')}`);
      setNewEx({ name: '', category: 'technical', duration: 15, sets: 3, reps: 10, intensity: 'medium', instructions: '', assigned_players: [] });
      setShowCreateEx(false);
      fetchLibrary();
    } catch { toast.error(t('toast.exercise_save_error')); }
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
    if (!form.title.trim())    { toast.error(t('toast.training_name_required')); setStep(0); return; }
    if (!form.date)            { toast.error(t('toast.date_required'));           setStep(0); return; }
    if (!form.start_time)      { toast.error(t('toast.start_time_required'));     setStep(0); return; }
    if (!form.end_time)        { toast.error(t('toast.end_time_required'));       setStep(0); return; }
    if (form.groups.length === 0) { toast.error(t('toast.select_group_required')); setStep(1); return; }
    if (form.recurrence !== 'none' && !form.recurrence_end) {
      toast.error(t('toast.recurrence_end_required')); setStep(3); return;
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

      await API.post('trainings/', payload);
      toast.success(t('toast.session_created'));
      setTimeout(() => navigate('/coach/agenda'), 1200);
    } catch (err) {
      const errorData = err.response?.data;
      let msg = t('toast.create_error');
      if (typeof errorData === 'object' && errorData !== null) {
        msg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      } else if (typeof errorData === 'string' && !errorData.includes('<!DOCTYPE')) {
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
      if (step === 0) toast.error(t('toast.fill_required'));
      if (step === 1) toast.error(t('toast.select_group'));
      return;
    }
    setStep(s => Math.min(STEP_KEYS.length - 1, s + 1));
  };

  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const iV = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  const LEVELS = [
    { id: 'A', label: t('details.level_a') },
    { id: 'B', label: t('details.level_b') },
    { id: 'C', label: t('details.level_c') },
    { id: 'D', label: t('details.level_d') },
  ];

  const currentLevelLabel = LEVELS.find(l => l.id === form.level)?.label || t('details.level_b');

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={iV} className="mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] p-3 rounded-2xl">
              <FiEdit3 className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                {t('header.create_training')}
              </h1>
              <p className="text-gray-400 mt-1">{t('header.subtitle')}</p>
            </div>
          </div>
        </motion.div>

        {/* Steps bar */}
        <motion.div variants={iV} className="mb-8">
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap pb-2 w-full border-none md:border md:border-gray-800 md:rounded-xl md:overflow-hidden md:gap-0 md:pb-0 scrollbar-none">
            {STEP_KEYS.map((stepKey, i) => (
              <button key={stepKey} onClick={() => { if (i < step || canProceed(step)) setStep(i); }}
                className="flex-shrink-0 md:flex-1 py-3 px-5 text-xs font-medium text-center transition-all border border-gray-800 rounded-xl md:rounded-none md:border-none md:border-r md:border-gray-800 md:last:border-r-0"
                style={i === step
                  ? { background: 'linear-gradient(135deg,rgba(144,43,209,.3),rgba(79,176,255,.3))', color: '#4fb0ff', borderBottom: '2px solid #4fb0ff' }
                  : i < step
                    ? { background: 'rgba(34,197,94,.06)', color: '#4ade80' }
                    : { background: '#0f172a', color: '#475569' }}>
                {i < step ? '✓ ' : `${i + 1}. `}{t(`steps.${stepKey}`)}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }} transition={{ duration: 0.2 }}>

            {/* ══ STEP 1 — DETAILS ══ */}
            {step === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Basic Info Card */}
                <div className="bg-gray-900/70 rounded-2xl p-8 border border-gray-700/50 h-full">
                  <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#4fb0ff]/10">
                      <FiEdit3 className="text-[#4fb0ff]" />
                    </div>
                    {t('details.core_information')}
                  </h2>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      {t('details.training_name')} <span className="text-red-400 font-black">*</span>
                    </label>
                    <input type="text" value={form.title} onChange={e => setF('title', e.target.value)}
                      placeholder={t('details.training_name_placeholder')}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                      required />
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiCalendar className="text-[#4fb0ff]" size={12} />{t('details.date')}
                      </label>
                      <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                        onChange={e => setF('date', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                        required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiClock className="text-[#00d0cb]" size={12} />{t('details.start_time')}
                      </label>
                      <input type="time" value={form.start_time}
                        onChange={e => setF('start_time', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                        required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiClock className="text-gray-500" size={12} />{t('details.end_time')}
                      </label>
                      <input type="time" value={form.end_time}
                        onChange={e => setF('end_time', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-800/40 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all"
                        required />
                    </div>
                  </div>

                  {/* Level + Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiTrendingUp className="text-[#00d0cb]" size={12} />{t('details.level')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                        className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white flex items-center justify-between hover:border-[#00d0cb]/40 transition-all">
                        <span className="font-medium">{currentLevelLabel}</span>
                        <FiChevronDown className={`transition-transform duration-200 ${showLevelDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showLevelDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1">
                            {LEVELS.map(opt => (
                              <div
                                key={opt.id}
                                onClick={() => { setF('level', opt.id); setShowLevelDropdown(false); }}
                                className={`px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${form.level === opt.id ? 'bg-[#00d0cb]/10 text-[#00d0cb]' : ''}`}>
                                <span className="font-medium">{opt.label}</span>
                                {form.level === opt.id && <FiCheck className="text-[#00d0cb]" />}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiMapPin className="text-[#902bd1]" size={12} />{t('details.location')}
                      </label>
                      <input type="text" value={form.location} onChange={e => setF('location', e.target.value)}
                        placeholder={t('details.location_placeholder')}
                        className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] transition-all" />
                    </div>
                  </div>
                </div>

                {/* Categories & Objectives Column */}
                <div className="space-y-6">
                  {/* Category Card */}
                  <div className="bg-gray-900/70 rounded-2xl p-8 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#00d0cb]/10">
                        <FaDumbbell className="text-[#00d0cb]" size={18} />
                      </div>
                      {t('details.training_category')}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:items-center gap-3">
                      {CATEGORY_KEYS.map(key => {
                        const style = getCatStyle(key);
                        return (
                          <button key={key} type="button"
                            onClick={() => toggleCategory(key)}
                            className="px-4 py-2.5 lg:w-auto rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 flex-shrink-0"
                            style={form.category.includes(key)
                              ? { background: style.bg, borderColor: style.color, color: style.color }
                              : { background: 'rgba(30,41,59,0.3)', borderColor: 'rgba(51,65,85,0.3)', color: '#64748b' }}>
                            <div className="w-3 h-3 rounded border border-current flex items-center justify-center flex-shrink-0">
                              {form.category.includes(key) && <FiCheck size={8} />}
                            </div>
                            {t(`categories.${key}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Objectives Card */}
                  <div className="bg-gray-900/70 rounded-2xl p-8 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#902bd1]/10">
                        <FiEdit2 className="text-[#902bd1]" />
                      </div>
                      {t('details.objectives')}
                    </h2>
                    <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                      rows={5} placeholder={t('details.objectives_placeholder')}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb] resize-none transition-all leading-relaxed" />
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 2 — PARTICIPANTS ══ */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <FiUsers className="text-[#4fb0ff]" />{t('participants.title')}
                  </h2>

                  {/* Groups */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      {t('participants.groups')} <span className="text-red-400 text-xs">*{t('participants.groups_required')}</span>
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
                              ? { background: 'rgba(144,43,209,.15)', borderColor: '#902bd1', color: '#c084fc', boxShadow: '0 0 20px rgba(144,43,209,0.1)' }
                              : { background: 'rgba(30,41,59,.3)', borderColor: 'rgba(51,65,85,.3)', color: '#64748b' }}>
                            <div className="w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0"
                              style={form.groups.includes(g.id)
                                ? { background: '#902bd1', borderColor: '#902bd1' }
                                : { borderColor: '#475569' }}>
                              {form.groups.includes(g.id) && <FiCheck size={12} className="text-white font-bold" />}
                            </div>
                            <span className="text-sm font-bold tracking-wide">{g.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center bg-gray-800/20 rounded-3xl border border-dashed border-gray-700/50">
                          <p className="text-sm text-gray-500 italic">{t('participants.no_groups')}</p>
                        </div>
                      )}
                    </div>
                    {!loadingInitial && groups.length > 0 && form.groups.length === 0 && (
                      <p className="text-[10px] text-amber-400 mt-4 font-bold uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {t('participants.select_group_hint')}
                      </p>
                    )}
                  </div>

                  {/* Subgroups */}
                  {availableSubgroups.length > 0 && (
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                        {t('participants.subgroups')} <span className="text-gray-600">({t('participants.subgroups_optional')})</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {availableSubgroups.map(s => (
                          <button key={s.id} type="button" onClick={() => toggleSubgroup(s.id)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:bg-white/5"
                            style={form.subgroups.includes(s.id)
                              ? { background: 'rgba(79,176,255,.12)', borderColor: '#4fb0ff', color: '#4fb0ff' }
                              : { background: 'rgba(30,41,59,.3)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                            <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                              style={form.subgroups.includes(s.id)
                                ? { background: '#4fb0ff', borderColor: '#4fb0ff' }
                                : { borderColor: '#475569' }}>
                              {form.subgroups.includes(s.id) && <FiCheck size={10} className="text-white" />}
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
                      style={{ background: 'rgba(79,176,255,.06)', borderColor: 'rgba(79,176,255,.15)' }}>
                      <div className="text-sm text-gray-400">
                        <span className="text-[#4fb0ff] font-semibold">{filteredPlayers.length} {t('participants.players_in')}</span>
                        {' '}{groups.filter(g => form.groups.includes(g.id)).map(g => g.name).join(', ')}
                        {form.subgroups.length > 0 && (
                          <span className="text-gray-500"> · {t('participants.filtered_by_subgroup')}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ STEP 3 — EXERCISES ══ */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FaDumbbell className="text-[#4fb0ff]" style={{ fontSize: 16 }} />
                      {t('exercises.title')}
                    </h2>
                    {form.exercises.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                        style={{ background: 'rgba(79,176,255,.12)', color: '#4fb0ff' }}>
                        {form.exercises.length} {t('exercises.exercises_label')} · {totalExDuration} {t('exercises.min_total')}
                      </div>
                    )}
                  </div>

                  {/* Exercise list */}
                  {form.exercises.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-700/50 rounded-xl p-10 text-center">
                      <FaDumbbell className="mx-auto text-gray-600 mb-3" style={{ fontSize: 32 }} />
                      <p className="text-gray-400 text-sm">{t('exercises.no_exercises')}</p>
                      <p className="text-gray-600 text-xs mt-1">{t('exercises.no_exercises_hint')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {form.exercises.map((ex, idx) => {
                        const catStyle = getCatStyle(ex.category);
                        return (
                          <div key={ex.id} className="rounded-xl p-4 border"
                            style={(ex.assigned_players && ex.assigned_players.length > 0)
                              ? { background: 'rgba(144,43,209,.06)', borderColor: 'rgba(144,43,209,.3)' }
                              : { background: 'rgba(30,41,59,.6)', borderColor: 'rgba(51,65,85,.5)' }}>
                            <div className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1"
                                style={{ background: catStyle.bg, color: catStyle.color }}>{idx + 1}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-sm font-medium text-white truncate">{ex.name}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                                    style={{ background: catStyle.bg, color: catStyle.color }}>{t(`categories.${ex.category}`)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                  <span>{ex.duration} {t('exercises.min')}</span>
                                  {ex.sets > 0 && <span>{ex.sets} {t('exercises.sets')} × {ex.reps} {t('exercises.reps')}</span>}
                                  <span style={{ color: INTENSITY_COLORS[ex.intensity] || '#94a3b8' }}>
                                    {t(`intensities.${ex.intensity}`)}
                                  </span>
                                </div>

                                {/* Assignment Control Row */}
                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{t('exercises.assigned_to')}</span>
                                    {(!ex.assigned_players || ex.assigned_players.length === 0) ? (
                                      <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {t('exercises.all_players')}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 rounded-lg bg-[#902bd1]/10 text-[#c084fc] text-[10px] font-bold border border-[#902bd1]/20 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#902bd1]" />
                                        {ex.assigned_players.length} {t('exercises.selected_players')}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setActiveExPicker(activeExPicker === ex.id ? null : ex.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00d0cb]/30 bg-[#00d0cb]/5 text-[#00d0cb] hover:bg-[#00d0cb]/10 hover:border-[#00d0cb]/60 transition-all text-[10px] font-bold uppercase tracking-wide group">
                                      {activeExPicker === ex.id ? (
                                        <FiX size={12} className="group-hover:rotate-90 transition-transform" />
                                      ) : (
                                        <FiEdit2 size={12} className="group-hover:scale-110 transition-transform" />
                                      )}
                                      <span>{activeExPicker === ex.id ? t('exercises.close') : t('exercises.change')}</span>
                                    </button>
                                  </div>

                                  {/* Avatars Stack */}
                                  {ex.assigned_players?.length > 0 && (
                                    <div className="flex -space-x-1.5">
                                      {ex.assigned_players.slice(0, 5).map(pid => {
                                        const p = players.find(pl => pl.id === pid);
                                        if (!p) return null;
                                        return (
                                          <div key={pid} className="w-5 h-5 rounded-full border border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all cursor-help" title={p.full_name}>
                                            {p.profile_picture ? (
                                              <img src={p.profile_picture} className="w-full h-full object-cover" alt={p.full_name} />
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
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 p-3 bg-gray-950/60 rounded-xl border border-gray-800 space-y-2">
                                    <button
                                      type="button"
                                      onClick={() => updateExercisePlayers(ex.id, [])}
                                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left">
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${(!ex.assigned_players || ex.assigned_players.length === 0) ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                                        {(!ex.assigned_players || ex.assigned_players.length === 0) && <FiCheck size={10} className="text-white" />}
                                      </div>
                                      <span className={`text-[11px] font-bold ${(!ex.assigned_players || ex.assigned_players.length === 0) ? 'text-blue-400' : 'text-gray-400'}`}>
                                        {t('exercises.assign_all')}
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
                                            className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}>
                                              {isSelected && <FiCheck size={10} className="text-white" />}
                                            </div>
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                              {p.profile_picture ? <img src={p.profile_picture} className="w-full h-full object-cover" alt={p.full_name} /> : <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-500">{p.full_name.charAt(0)}</div>}
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
                                <FiTrash2 size={14} />
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
                      onClick={() => { setShowLibrary(v => !v); setShowCreateEx(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
                      style={showLibrary
                        ? { background: 'rgba(79,176,255,.15)', borderColor: '#4fb0ff', color: '#4fb0ff' }
                        : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#94a3b8' }}>
                      <FiSearch size={14} />{t('exercises.add_from_library')}
                    </button>
                    <button type="button"
                      onClick={() => { setShowCreateEx(v => !v); setShowLibrary(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
                      style={showCreateEx
                        ? { background: 'rgba(144,43,209,.15)', borderColor: '#902bd1', color: '#c084fc' }
                        : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#94a3b8' }}>
                      <FiPlus size={14} />{t('exercises.create_new')}
                    </button>
                  </div>
                </div>

                {/* Exercise Library */}
                <AnimatePresence>
                  {showLibrary && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          {t('exercises.exercise_library')}
                        </h3>
                        <button onClick={() => setShowLibrary(false)} className="text-gray-500 hover:text-white">
                          <FiX size={16} />
                        </button>
                      </div>

                      <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                          <input type="text" placeholder={t('exercises.search_placeholder')}
                            value={libSearch} onChange={e => setLibSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-4">
                        <button onClick={() => setLibFilter('all')}
                          className="text-xs px-3 py-1.5 rounded-full border transition-all"
                          style={libFilter === 'all'
                            ? { background: 'rgba(79,176,255,.15)', borderColor: '#4fb0ff', color: '#4fb0ff' }
                            : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                          {t('exercises.all')}
                        </button>
                        {CATEGORY_KEYS.map(key => {
                          const style = getCatStyle(key);
                          return (
                            <button key={key} onClick={() => setLibFilter(key)}
                              className="text-xs px-3 py-1.5 rounded-full border transition-all"
                              style={libFilter === key
                                ? { background: style.bg, borderColor: style.color, color: style.color }
                                : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                              {t(`categories.${key}`)}
                            </button>
                          );
                        })}
                      </div>

                      {loadingLib ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4fb0ff]" /></div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                          {libraryFiltered.map((ex, i) => {
                            const catStyle = getCatStyle(ex.category);
                            const alreadyAdded = form.exercises.some(e => e.name === ex.name);
                            return (
                              <button key={i} type="button" onClick={() => !alreadyAdded && addFromLibrary(ex)} disabled={alreadyAdded}
                                className="text-left rounded-xl p-3 border transition-all"
                                style={alreadyAdded
                                  ? { background: 'rgba(34,197,94,.06)', borderColor: 'rgba(34,197,94,.2)', opacity: .7 }
                                  : { background: 'rgba(15,23,42,.8)', borderColor: 'rgba(30,41,59,1)' }}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-white mb-1">{ex.name}</div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: catStyle.bg, color: catStyle.color }}>{t(`categories.${ex.category}`)}</span>
                                      <span className="text-xs text-gray-500">{ex.duration} {t('exercises.min')}</span>
                                    </div>
                                  </div>
                                  {alreadyAdded ? <FiCheck size={14} className="text-green-400" /> : <FiPlus size={14} className="text-gray-500" />}
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
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-gray-900/70 rounded-2xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <FiPlus className="text-[#902bd1]" />{t('exercises.create_new')}
                        </h3>
                        <button onClick={() => setShowCreateEx(false)} className="text-gray-500 hover:text-white">
                          <FiX size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{t('exercises.exercise_name')}</label>
                          <input type="text" value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))}
                            placeholder={t('exercises.exercise_name_placeholder')}
                            className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#902bd1]" />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{t('exercises.category')}</label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {CATEGORY_KEYS.map(key => {
                              const style = getCatStyle(key);
                              return (
                                <button key={key} type="button" onClick={() => setNewEx(p => ({ ...p, category: key }))}
                                  className="py-2 rounded-lg text-xs font-medium border transition-all"
                                  style={newEx.category === key ? { background: style.bg, borderColor: style.color, color: style.color } : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                                  {t(`categories.${key}`)}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: t('exercises.duration'), key: 'duration' },
                            { label: t('exercises.sets'), key: 'sets' },
                            { label: t('exercises.reps'), key: 'reps' },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{f.label}</label>
                              <input type="number" value={newEx[f.key]} onChange={e => setNewEx(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#902bd1]" />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{t('exercises.intensity')}</label>
                          <div className="flex gap-3">
                            {INTENSITY_KEYS.map(key => (
                              <button key={key} type="button" onClick={() => setNewEx(p => ({ ...p, intensity: key }))}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                                style={newEx.intensity === key
                                  ? { background: INTENSITY_COLORS[key] + '25', borderColor: INTENSITY_COLORS[key], color: INTENSITY_COLORS[key] }
                                  : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                                {t(`intensities.${key}`)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{t('exercises.assign_specific')}</label>
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
                                      setNewEx(prev => ({ ...prev, assigned_players: next }));
                                    }}
                                    className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}>
                                      {isSelected && <FiCheck size={10} className="text-white" />}
                                    </div>
                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                      {p.profile_picture ? <img src={p.profile_picture} className="w-full h-full object-cover" alt={p.full_name} /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">{p.full_name.charAt(0)}</div>}
                                    </div>
                                    <span className={`text-[11px] ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>{p.full_name}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-gray-600 italic py-2">{t('exercises.no_players_available')}</p>
                            )}
                          </div>
                          {(newEx.assigned_players?.length > 0) && (
                            <p className="text-[10px] text-purple-400 mt-2 font-medium">
                              {newEx.assigned_players.length} {t('exercises.specific_players_selected')}
                            </p>
                          )}
                        </div>

                        {/* Instructions */}
                        <div className="mb-5">
                          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{t('exercises.instructions')}</label>
                          <textarea value={newEx.instructions}
                            onChange={e => setNewEx(p => ({ ...p, instructions: e.target.value }))}
                            rows={3} placeholder={t('exercises.instructions_placeholder')}
                            className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#902bd1] resize-none" />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setShowCreateEx(false)}
                          className="px-5 py-3 bg-gray-800/50 text-gray-400 rounded-xl border border-gray-700 text-sm hover:bg-gray-700/50">
                          {t('exercises.cancel')}
                        </button>
                        <motion.button type="button" onClick={saveNewExercise}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white"
                          style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                          <FiSave size={14} />{t('exercises.save_to_library')}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ══ STEP 4 — RECURRENCE ══ */}
            {step === 3 && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <FiCalendar className="text-[#00d0cb]" />{t('recurrence.title')}
                </h2>

                {/* Recurrence type */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-3">{t('recurrence.repeat_session')}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {RECURRENCE_KEYS.map(key => (
                      <button key={key} type="button"
                        onClick={() => setF('recurrence', key)}
                        className="py-3 px-3 rounded-xl border text-sm transition-all text-left"
                        style={form.recurrence === key
                          ? { background: 'rgba(0,208,203,.12)', borderColor: '#00d0cb', color: '#00d0cb' }
                          : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                        {t(`recurrences.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days + End date */}
                {form.recurrence !== 'none' && (
                  <>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-3">{t('recurrence.repeat_on_days')}</label>
                      <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5">
                        {DAY_KEYS.map((dayKey, idx) => (
                          <button key={dayKey} type="button" onClick={() => toggleDay(DAY_VALUES[idx])}
                            className="py-2 px-1 sm:px-3 rounded-lg text-xs font-medium border transition-all w-full sm:w-auto"
                            style={form.recurrence_days.includes(DAY_VALUES[idx])
                              ? { background: 'rgba(144,43,209,.25)', borderColor: '#902bd1', color: '#c084fc' }
                              : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                            {t(`days.${dayKey}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('recurrence.start_date')}</label>
                        <input type="date" value={form.date} readOnly
                          className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/30 rounded-xl text-gray-400 cursor-not-allowed" />
                        <p className="text-xs text-gray-600 mt-1">{t('recurrence.same_as_training')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('recurrence.end_date')} <span className="text-red-400 text-xs">*{t('recurrence.end_date_required')}</span>
                        </label>
                        <input type="date" value={form.recurrence_end}
                          min={form.date}
                          onChange={e => setF('recurrence_end', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
                      </div>
                    </div>

                    {estimatedSessions > 0 && (
                      <div className="p-4 rounded-xl border"
                        style={{ background: 'rgba(0,208,203,.06)', borderColor: 'rgba(0,208,203,.2)' }}>
                        <div className="text-sm text-gray-400">
                          {t('recurrence.will_create')}{' '}
                          <span className="text-[#00d0cb] font-semibold text-base">{estimatedSessions} {t('recurrence.sessions')}</span>
                          {' '}{t('recurrence.between')} {form.date} {t('recurrence.and')} {form.recurrence_end}
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
                    {t('recurrence.one_time_notice')} {form.date || t('recurrence.selected_date')}.
                  </div>
                )}
              </div>
            )}

            {/* ══ STEP 5 — REVIEW ══ */}
            {step === 4 && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-lg font-bold text-white mb-5">{t('review.title')}</h2>

                <div className="w-full space-y-2 text-sm md:text-base">
                  {[
                    { label: t('review.training_name'), value: form.title },
                    { label: t('review.date'),          value: form.date  },
                    { label: t('review.time'),          value: `${form.start_time} → ${form.end_time}${duration ? ` (${duration})` : ''}` },
                    { label: t('review.category'),      value: `${form.category.map(c => t(`categories.${c}`)).join(' + ')} · ${t('review.level')} ${form.level}` },
                    { label: t('review.location'),      value: form.location || 'Main Field' },
                    { label: t('review.groups'),        value: groups.filter(g => form.groups.includes(g.id)).map(g => g.name).join(', ') || '—' },
                    { label: t('review.players'),       value: `${filteredPlayers.length} ${t('participants.players_in')}` },
                    { label: t('review.exercises'),     value: `${form.exercises.length} ${t('exercises.exercises_label')} · ${totalExDuration} ${t('exercises.min')}` },
                    { label: t('review.recurrence'),    value: form.recurrence === 'none' ? t('review.one_time_only') : `${t(`recurrences.${form.recurrence}`)} — ${t('review.until')} ${form.recurrence_end || '?'} (${estimatedSessions} ${t('recurrence.sessions')})` },
                  ].map(row => (
                    <div key={row.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-800/50 last:border-none">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 sm:mb-0">{row.label}</span>
                      <span className="font-semibold text-white text-left sm:text-right max-w-full sm:max-w-md">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Individual exercises summary */}
                {form.exercises.some(e => e.assigned_players && e.assigned_players.length > 0) && (
                  <div className="mt-4 p-4 rounded-xl border"
                    style={{ background: 'rgba(144,43,209,.06)', borderColor: 'rgba(144,43,209,.2)' }}>
                    <div className="text-sm font-medium text-purple-400 mb-2">{t('review.custom_assignments')}</div>
                    {form.exercises.filter(e => e.assigned_players && e.assigned_players.length > 0).map(ex => (
                      <div key={ex.id} className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                        <span>• {ex.name}</span>
                        <span className="text-purple-300 font-bold">{ex.assigned_players.length} {t('exercises.selected_players')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <motion.button type="button" onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-4 rounded-xl font-semibold text-white text-base disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  {isSubmitting
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('review.creating')}</>
                    : <><FiCheck size={18} />{t('review.create_session')}</>}
                </motion.button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-3 bg-gray-900/70 text-gray-300 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 text-sm">
            {isRTL ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            {step === 0 ? t('navigation.cancel') : t('navigation.back')}
          </button>

          {step < STEP_KEYS.length - 1 && (
            <motion.button onClick={goNext}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
              {t('navigation.next')} — {t(`steps.${STEP_KEYS[step + 1]}`)}
              {isRTL ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
            </motion.button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default CreateTraining;