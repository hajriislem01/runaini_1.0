import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiCalendar, FiPlus, FiX, FiClock, FiMapPin, FiUsers,
  FiEdit, FiTrash2, FiChevronLeft, FiChevronRight,
  FiFilter, FiCheck, FiList, FiGrid, FiRepeat, FiActivity,
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, isToday, isSameMonth, eachDayOfInterval,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, addDays, isBefore, parseISO,
  startOfDay, isSameDay,
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import EventDetailDrawer from '../../components/common/EventDetailDrawer';
import { useTranslation } from 'react-i18next';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORIES = {
  technical: { label: 'Technical', color: '#4fb0ff', bg: 'rgba(79,176,255,0.15)', border: 'rgba(79,176,255,0.3)' },
  tactical: { label: 'Tactical', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  physical: { label: 'Physical', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)' },
  mental: { label: 'Mental', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)' },
  match_prep: { label: 'Match Prep', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
  recovery: { label: 'Recovery', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.3)' },
};
const WEEK_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getCat = (k) => CATEGORIES[k] || { label: k || 'Session', color: '#4fb0ff', bg: 'rgba(79,176,255,0.15)', border: 'rgba(79,176,255,0.3)' };

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
};

const formatTimeRange = (start, end) => {
  const t1 = fmtTime(start);
  const t2 = fmtTime(end);
  if (t1 && t2 && t1 !== t2) return `${t1} – ${t2}`;
  return t1 || t2 || '';
};

const calcDur = (s, e) => {
  if (!s || !e) return '';
  const [sh, sm] = s.split(':').map(Number);
  const [eh, em] = e.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ' ' + m + 'min' : ''}` : `${m}min`;
};

const isPast = (dateStr) => {
  if (!dateStr) return false;
  return isBefore(startOfDay(parseISO(dateStr)), startOfDay(new Date()));
};

// ═══════════════════════════════════════════════════════════════════════════════
const CoachAgenda = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('coachagenda');
  const isRTL = i18n.language === 'ar';

  const tMonth = (d) => t(`months.${format(d, 'MMM').toLowerCase()}`);
  const tMonthLong = (d) => t(`months.${format(d, 'MMMM').toLowerCase()}`);
  const tDay = (d) => t(`days.${format(d, 'EEE').toLowerCase()}`);
  const tDayLong = (d) => t(`days.${format(d, 'EEEE').toLowerCase()}`);


  // ── State ─────────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month | week | list
  const [filterGroups, setFilterGroups] = useState([]);
  const [filterCats, setFilterCats] = useState([]);
  const [filterRecur, setFilterRecur] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAll, setDeleteAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '', start_time: '10:00', end_time: '12:00', location: '',
  });
  // Day-detail quick-view modal
  const [viewingDay, setViewingDay] = useState(null);   // Date object
  const [viewingSessions, setViewingSessions] = useState([]);
  const [detailSession, setDetailSession] = useState(null); // Full detail overlay
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleOpenDetail = async (s) => {
    setDetailSession(s); // Show immediate UI
    setIsDetailLoading(true);
    try {
      const endpoint = s._isEvent ? 'events' : 'trainings';
      const res = await API.get(`${endpoint}/${s.id}/`);
      setDetailSession({ ...res.data, _isEvent: s._isEvent });
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [sRes, eRes, gRes, pRes] = await Promise.all([
        API.get('trainings/'),
        API.get('events/'),
        API.get('groups/'),
        API.get('players/'),
      ]);

      // Normalize events to match training session structure for the agenda
      const normalizedEvents = (eRes.data || []).map(evt => ({
        ...evt,
        _isEvent: true,
        category: evt.type === 'Meeting' ? 'mental' : (evt.type === 'Tournament' ? 'match_prep' : 'match_prep'),
        start_time: evt.date.split('T')[1].substring(0, 5),
        end_time: evt.date.split('T')[1].substring(0, 5), // Events might not have end_time, placeholder
        date: evt.date.split('T')[0],
      }));

      setSessions([...sRes.data, ...normalizedEvents]);
      setGroups(gRes.data);
      setPlayers(pRes.data);
    } catch (err) {
      console.error('Error loading agenda:', err);
      toast.error(t('toast.load_error'));
    }
    finally { setIsLoading(false); }
  };

  // ── Filtered sessions ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return sessions.filter(s => {
      // For events, we check if the coach is targeted or group is targeted
      // The backend already filters these, so we just need to respect local filters
      const mgGroup = filterGroups.length === 0 ||
        (s.groups_detail?.some(g => filterGroups.includes(g.id))) ||
        (s.groups?.some(gid => filterGroups.includes(gid))); // for raw event IDs

      const sCats = Array.isArray(s.category) ? s.category : [s.category];
      const mgCat = filterCats.length === 0 || sCats.some(c => filterCats.includes(c));
      const mgRecur = !filterRecur || (s.recurrence && s.recurrence !== 'none');
      return mgGroup && mgCat && mgRecur;
    });
  }, [sessions, filterGroups, filterCats, filterRecur]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return {
      month: sessions.filter(s => {
        const d = parseISO(s.date);
        return d >= monthStart && d <= monthEnd;
      }).length,
      week: sessions.filter(s => {
        const d = parseISO(s.date);
        return d >= weekStart && d <= weekEnd;
      }).length,
      today: sessions.filter(s => isSameDay(parseISO(s.date), today)).length,
      recurring: sessions.filter(s => s.recurrence && s.recurrence !== 'none').length,
    };
  }, [sessions, currentDate]);

  // ── Upcoming 5 sessions ───────────────────────────────────────────────────
  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return [...filtered]
      .filter(s => !isBefore(parseISO(s.date), today))
      .sort((a, b) => {
        const dd = parseISO(a.date) - parseISO(b.date);
        if (dd !== 0) return dd;
        return (a.start_time || '').localeCompare(b.start_time || '');
      })
      .slice(0, 5);
  }, [filtered]);

  // ── Calendar days ─────────────────────────────────────────────────────────
  const calDays = useMemo(() => {
    const mStart = startOfMonth(currentDate);
    const mEnd = endOfMonth(currentDate);
    const start = startOfWeek(mStart);
    const end = endOfWeek(mEnd);
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      sessions: filtered.filter(s => isSameDay(parseISO(s.date), date)),
    }));
  }, [currentDate, filtered]);

  // ── Week days ─────────────────────────────────────────────────────────────
  const weekDays = useMemo(() => {
    const ws = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  }, [currentDate]);

  const getSessionsForSlot = (day, hour) =>
    filtered.filter(s => {
      if (!isSameDay(parseISO(s.date), day)) return false;
      const [sh] = (s.start_time || '00:00').split(':').map(Number);
      return sh === hour;
    });

  // ── List sessions grouped by date ─────────────────────────────────────────
  const listGroups = useMemo(() => {
    const today = startOfDay(new Date());
    const sorted = [...filtered]
      .filter(s => !isBefore(parseISO(s.date), today))
      .sort((a, b) => parseISO(a.date) - parseISO(b.date));
    const groups = {};
    sorted.forEach(s => {
      const key = s.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.entries(groups);
  }, [filtered]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleFilterGroup = (id) =>
    setFilterGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleFilterCat = (key) =>
    setFilterCats(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);

  const openDayModal = (date, daySessions) => {
    setViewingDay(date);
    setViewingSessions(daySessions);
  };

  const openEdit = (s) => {
    setSelectedSession(s);
    setEditForm({
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      location: s.location || '',
    });
    setShowEditModal(true);
  };

  const openDelete = (s, all = false) => {
    setSelectedSession(s);
    setDeleteAll(all);
    setShowDeleteModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.date) { toast.error(t('toast.date_required')); return; }
    setIsSubmitting(true);
    try {
      const res = await API.patch(`trainings/${selectedSession.id}/`, {
        date: editForm.date,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        location: editForm.location,
      });
      setSessions(prev => prev.map(s => s.id === selectedSession.id ? res.data : s));
      toast.success(t('toast.update_success'));
      setShowEditModal(false);
      setSelectedSession(null);
    } catch { toast.error(t('toast.update_error')); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      if (deleteAll && selectedSession.parent_session) {
        // Delete all {t('event.recurring')} siblings
        const parentId = selectedSession.parent_session;
        const toDelete = sessions.filter(s =>
          s.id === parentId ||
          s.parent_session === parentId ||
          s.id === selectedSession.id
        );
        await Promise.all(toDelete.map(s => API.delete(`trainings/${s.id}/`)));
        setSessions(prev => prev.filter(s =>
          s.id !== parentId &&
          s.parent_session !== parentId &&
          s.id !== selectedSession.id
        ));
      } else {
        await API.delete(`trainings/${selectedSession.id}/`);
        setSessions(prev => prev.filter(s => s.id !== selectedSession.id));
      }
      toast.success(t('toast.delete_success'));
      setShowDeleteModal(false);
      setSelectedSession(null);
    } catch { toast.error(t('toast.delete_error')); }
    finally { setIsSubmitting(false); }
  };

  // ── Session card (reusable) ───────────────────────────────────────────────
  const SessionCard = ({ s, compact = false }) => {
    const categories = Array.isArray(s.category) ? s.category : [s.category];
    const past = isPast(s.date);
    const recur = s.recurrence && s.recurrence !== 'none';
    const indivEx = (s.exercises || []).filter(ex => ex.assigned_players?.length > 0);

    const cat = getCat(categories[0]);
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border transition-all"
        style={{
          background: past ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.8)',
          borderColor: past ? '#1e293b' : cat.border,
          borderLeft: s._isEvent
            ? (s.type === 'Meeting' ? '4px solid #4fb0ff' : s.type === 'Match Friendly' ? '4px solid #f59e0b' : '4px solid #a855f7')
            : '4px solid #22c55e',
          opacity: past ? 0.65 : 1,
        }}>
        {/* Header — click opens detail modal */}
        <div className="p-4 cursor-pointer select-none" onClick={() => handleOpenDetail(s)}>
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-white break-words">{s.title}</span>
                {s._isEvent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/20 uppercase font-bold">
                    {s.type}
                  </span>
                )}
                {recur && (
                  <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(144,43,209,.2)', color: '#c084fc' }}>
                    <FiRepeat size={9} />{t('event.recurring')}
                  </span>
                )}
                {past && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500">{t('event.past')}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <FiClock size={11} />{formatTimeRange(s.start_time, s.end_time)}
                  {s.duration_minutes && <span className="text-gray-600">({calcDur(s.start_time, s.end_time)})</span>}
                </span>
                <span className="flex items-center gap-1">
                  <FiMapPin size={11} />{s.location || 'Main Field'}
                </span>
                {s.participants_count > 0 && (
                  <span className="flex items-center gap-1">
                    <FiUsers size={11} />{s.participants_count} {t('event.players')}
                  </span>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5">
              <div className="flex flex-wrap gap-1 sm:justify-end">
                {s._isEvent ? (
                  (() => {
                    let badgeConfig = { color: '#4fb0ff', bg: 'rgba(79,176,255,0.15)', border: 'rgba(79,176,255,0.3)', label: 'Internal Meeting' };
                    if (s.type === 'Meeting') badgeConfig = { color: '#4fb0ff', bg: 'rgba(79,176,255,0.15)', border: 'rgba(79,176,255,0.3)', label: 'Internal Meeting' };
                    else if (s.type === 'Match Friendly') badgeConfig = { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', label: 'Friendly Match' };
                    else if (s.type === 'Tournament') badgeConfig = { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', label: 'Tournament' };

                    return (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ background: badgeConfig.bg, color: badgeConfig.color, border: `1px solid ${badgeConfig.border}` }}>
                        {t(`categories.${s.type === 'Meeting' ? 'meeting' : s.type === 'Match Friendly' ? 'friendly' : 'tournament'}`)}
                      </span>
                    );
                  })()
                ) : (
                  <>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {t('event.team_training')}
                    </span>
                    {categories.map(cKey => {
                      const c = getCat(cKey);
                      return (
                        <span key={cKey} className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                          style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                          {t(`categories.${cKey}`) || c.label}
                        </span>
                      );
                    })}
                  </>
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s._isEvent ? t('event.agenda_item') : `${t('event.level')} ${s.level}`}</span>
            </div>
          </div>

          {/* Groups */}
          {s.groups_detail?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {s.groups_detail.map(g => (
                <span key={g.id} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(144,43,209,.12)', color: '#c084fc', border: '1px solid rgba(144,43,209,.2)' }}>
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Exercises preview */}
          {!compact && (s.exercises || []).length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                <FaDumbbell style={{ fontSize: 10 }} />{(s.exercises || []).length} {t('event.exercises')} · {s.total_exercise_duration || 0} min
              </div>
              <div className="space-y-1">
                {(s.exercises || []).slice(0, 3).map((ex, i) => {
                  const exCat = getCat(ex.category);
                  const isInd = ex.assigned_players?.length > 0;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg"
                      style={isInd
                        ? { background: 'rgba(144,43,209,.06)', border: '1px solid rgba(144,43,209,.15)' }
                        : { background: 'rgba(30,41,59,.5)' }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: exCat.bg, color: exCat.color, fontSize: 9, fontWeight: 700 }}>{i + 1}</div>
                      <span className="text-gray-300 flex-1 truncate">{ex.name}</span>
                      <span className="text-gray-600">{ex.duration}min</span>
                      {isInd && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20 flex-shrink-0">
                          {ex.assigned_players.length} {t('event.players')}
                        </span>
                      )}
                    </div>
                  );
                })}
                {(s.exercises || []).length > 3 && (
                  <div className="text-xs text-gray-600 pl-2">+{(s.exercises || []).length - 3} more {t('event.exercises')}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!past && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 pt-2 border-t border-gray-800">
              <button onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:text-white hover:bg-gray-700/50 transition-all">
                <FiEdit size={11} />Edit
              </button>
              {recur ? (
                <>
                  <button onClick={(e) => { e.stopPropagation(); openDelete(s, false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                    <FiTrash2 size={11} />Delete this
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openDelete(s, true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                    <FiRepeat size={11} />Delete all
                  </button>
                </>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); openDelete(s, false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                  <FiTrash2 size={11} />Delete
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const iV = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div variants={iV} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                {t('header.agenda')}
              </h1>
              <p className="text-gray-400 mt-2">
                {tMonthLong(currentDate)} {format(currentDate, 'yyyy')} · {stats.month} {t('stats.sessions_scheduled')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full lg:w-auto">
              {/* View toggle */}
              <div className="flex w-full sm:w-auto bg-gray-900/80 border border-gray-700/50 rounded-xl overflow-hidden">
                {[
                  { key: 'month', icon: <FiCalendar size={14} />, label: t('controls.month') },
                  { key: 'week', icon: <FiGrid size={14} />, label: t('controls.week') },
                  { key: 'list', icon: <FiList size={14} />, label: t('controls.day') },
                ].map(v => (
                  <button key={v.key} onClick={() => setView(v.key)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm transition-all"
                    style={view === v.key
                      ? { background: 'rgba(79,176,255,.2)', color: '#4fb0ff', borderBottom: '2px solid #4fb0ff' }
                      : { color: '#64748b' }}>
                    {v.icon}{v.label}
                  </button>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/coach/training')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm"
                style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                <FiPlus size={16} />{t('event.add_new')}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-8">
          {[
            { label: t('stats.this_month'), value: stats.month, color: '#4fb0ff' },
            { label: t('stats.this_week'), value: stats.week, color: '#00d0cb' },
            { label: t('stats.today'), value: stats.today, color: '#22c55e' },
            { label: t('stats.recurring'), value: stats.recurring, color: '#902bd1' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 text-center">
              {isLoading
                ? <div className="h-8 w-12 bg-gray-700/50 rounded animate-pulse mx-auto mb-2" />
                : <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>}
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Upcoming sessions ── */}
        {upcoming.length > 0 && (
          <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50 mb-8">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <FiActivity className="text-[#00d0cb]" />{t('header.upcoming_sessions')} ({upcoming.length})
            </h2>
            <div className="space-y-3">
              {upcoming.map(s => {
                const sCats = Array.isArray(s.category) ? s.category : [s.category];
                const mainCat = getCat(sCats[0]);
                const recur = s.recurrence && s.recurrence !== 'none';
                const isT = isSameDay(parseISO(s.date), new Date());
                return (
                  <div key={s.id}
                    onClick={() => handleOpenDetail(s)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 rounded-xl border transition-all cursor-pointer hover:border-[#00d0cb]/40 hover:bg-[#00d0cb]/5 group"
                    style={{ background: 'rgba(15,23,42,.6)', borderColor: 'rgba(51,65,85,.4)' }}>
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: mainCat.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white truncate">{s.title}</span>
                          {recur && <FiRepeat size={11} className="text-purple-400 flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-gray-500 flex gap-3 flex-wrap">
                          <span>{isT ? t('stats.today') : format(parseISO(s.date), 'EEE MMM d')} · {formatTimeRange(s.start_time, s.end_time)}</span>
                          {s.groups_detail?.length > 0 && <span>{s.groups_detail.map(g => g.name).join(', ')}</span>}
                          {s.location && <span>{s.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 flex-shrink-0 sm:justify-end w-full sm:w-auto pl-5 sm:pl-0">
                      {sCats.map(cKey => {
                        const c = getCat(cKey);
                        return (
                          <span key={cKey} className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"
                            style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                            {t(`categories.${cKey}`) || c.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Filters ── */}
        <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-[#4fb0ff]" size={15} />
            <span className="text-sm font-semibold text-white">{t('filters.title')}</span>
            {(filterGroups.length > 0 || filterCats.length > 0 || filterRecur) && (
              <button onClick={() => { setFilterGroups([]); setFilterCats([]); setFilterRecur(false); }}
                className="ml-auto text-xs text-gray-500 hover:text-white px-2 py-1 rounded-lg bg-gray-800/50 border border-gray-700/50">
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Groups */}
            {groups.map(g => (
              <button key={g.id} onClick={() => toggleFilterGroup(g.id)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={filterGroups.includes(g.id)
                  ? { background: 'rgba(144,43,209,.2)', borderColor: '#902bd1', color: '#c084fc' }
                  : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                {g.name}
              </button>
            ))}
            <div className="hidden sm:block w-px h-5 bg-gray-700/50 mx-1 self-center" />
            {/* Categories */}
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button key={key} onClick={() => toggleFilterCat(key)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={filterCats.includes(key)
                  ? { background: cat.bg, borderColor: cat.color, color: cat.color }
                  : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                {t(`categories.${key}`) || cat.label}
              </button>
            ))}
            <div className="hidden sm:block w-px h-5 bg-gray-700/50 mx-1 self-center" />
            {/* Recurring */}
            <button onClick={() => setFilterRecur(v => !v)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all"
              style={filterRecur
                ? { background: 'rgba(144,43,209,.2)', borderColor: '#902bd1', color: '#c084fc' }
                : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
              <FiRepeat size={11} />Recurring only
            </button>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════
            VIEW — MONTH
        ══════════════════════════════════════════════ */}
        {view === 'month' && (
          <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
            {/* Calendar nav */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentDate(addMonths(currentDate, isRTL ? 1 : -1))}
                title={t('controls.previous')}
                className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-all">
                <FiChevronLeft size={20} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{tMonthLong(currentDate)} {format(currentDate, 'yyyy')}</h2>
                <button onClick={() => setCurrentDate(new Date())}
                  className="text-xs px-3 py-1 rounded-full border border-[#00d0cb]/30 text-[#00d0cb] bg-[#00d0cb]/10">
                  {t('controls.today')}
                </button>
              </div>
              <button onClick={() => setCurrentDate(addMonths(currentDate, isRTL ? -1 : 1))}
                title={t('controls.next')}
                className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-all">
                <FiChevronRight size={20} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calDays.map((day, i) => {
                const todayDay = isToday(day.date);
                const hasSessions = day.sessions.length > 0;
                return (
                  <motion.div key={i} whileHover={{ scale: 1.02 }}
                    onClick={() => openDayModal(day.date, day.sessions)}
                    className="aspect-square sm:aspect-auto sm:min-h-24 rounded-xl p-1 sm:p-2 border cursor-pointer transition-all flex flex-col items-center justify-center sm:items-stretch sm:justify-start text-xs sm:text-sm"
                    style={{
                      background: todayDay ? 'rgba(0,208,203,.06)' : 'rgba(15,23,42,.5)',
                      borderColor: todayDay ? '#00d0cb' : hasSessions ? 'rgba(79,176,255,.25)' : 'rgba(30,41,59,.8)',
                      opacity: day.isCurrentMonth ? 1 : 0.4,
                    }}>
                    <div className="text-center sm:text-right text-xs font-semibold sm:mb-1 w-full"
                      style={{ color: todayDay ? '#00d0cb' : '#94a3b8' }}>
                      {format(day.date, 'd')}
                    </div>

                    {/* Mobile Dots Indicator */}
                    <div className="flex gap-0.5 mt-1 sm:hidden">
                      {day.sessions.slice(0, 3).map(s => {
                        const sCats = Array.isArray(s.category) ? s.category : [s.category];
                        const cat = getCat(sCats[0]);
                        return (
                          <div key={s.id} className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                        );
                      })}
                      {day.sessions.length > 3 && (
                        <div className="w-1 h-1 rounded-full bg-gray-500 flex-shrink-0 self-center" />
                      )}
                    </div>

                    {/* Desktop Sessions List */}
                    <div className="hidden sm:block space-y-0.5 w-full">
                      {day.sessions.slice(0, 2).map(s => {
                        const sCats = Array.isArray(s.category) ? s.category : [s.category];
                        const cat = getCat(sCats[0]);
                        return (
                          <div key={s.id}
                            className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 truncate font-bold"
                            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                            <span className="truncate">{s.title}</span>
                          </div>
                        );
                      })}
                      {day.sessions.length > 2 && (
                        <div className="text-[10px] text-gray-500 text-center font-medium mt-1">
                          +{day.sessions.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-800">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <span key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  {t(`categories.${key}`) || cat.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════
            VIEW — WEEK
        ══════════════════════════════════════════════ */}
        {view === 'week' && (
          <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
            {/* Week nav */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setCurrentDate(addDays(currentDate, isRTL ? 7 : -7))}
                title={t('controls.previous')}
                className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white">
                <FiChevronLeft size={20} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">
                  {tMonth(weekDays[0])} {format(weekDays[0], 'd')} – {tMonth(weekDays[6])} {format(weekDays[6], 'd, yyyy')}
                </h2>
                <button onClick={() => setCurrentDate(new Date())}
                  className="text-xs px-3 py-1 rounded-full border border-[#00d0cb]/30 text-[#00d0cb] bg-[#00d0cb]/10">
                  {t('controls.today')}
                </button>
              </div>
              <button onClick={() => setCurrentDate(addDays(currentDate, isRTL ? -7 : 7))}
                title={t('controls.next')}
                className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white">
                <FiChevronRight size={20} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Week header */}
                <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '60px repeat(7,1fr)' }}>
                  <div />
                  {weekDays.map((d, i) => {
                    const todayDay = isToday(d);
                    return (
                      <div key={i} className="text-center py-2 rounded-xl text-xs font-medium"
                        style={todayDay
                          ? { background: 'rgba(0,208,203,.12)', color: '#00d0cb', border: '1px solid rgba(0,208,203,.3)' }
                          : { color: '#64748b' }}>
                        <div>{t(`days.${WEEK_DAYS[i].toLowerCase()}`)}</div>
                        <div className="text-base font-bold mt-0.5" style={{ color: todayDay ? '#00d0cb' : '#94a3b8' }}>
                          {format(d, 'd')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hourly slots */}
                {WEEK_HOURS.map(hour => (
                  <div key={hour} className="grid gap-1 mb-0.5" style={{ gridTemplateColumns: '60px repeat(7,1fr)', minHeight: 44 }}>
                    <div className="text-right pr-3 pt-1 text-xs text-gray-600 flex-shrink-0">
                      {hour}:00
                    </div>
                    {weekDays.map((day, di) => {
                      const slots = getSessionsForSlot(day, hour);
                      return (
                        <div key={di} className="border-t border-gray-800/50 pt-0.5 min-h-11">
                          {slots.map(s => {
                            const sCats = Array.isArray(s.category) ? s.category : [s.category];
                            const cat = getCat(sCats[0]);
                            const daySessions = filtered.filter(x => isSameDay(parseISO(x.date), day));
                            return (
                              <div key={s.id}
                                onClick={() => openDayModal(day, daySessions)}
                                className="text-xs px-1.5 py-1 rounded mb-0.5 cursor-pointer transition-all hover:opacity-80"
                                style={{
                                  background: cat.bg,
                                  color: cat.color,
                                  borderLeft: `2px solid ${cat.color}`,
                                }}>
                                <div className="font-medium truncate">{s.title}</div>
                                <div style={{ color: cat.color, opacity: .75 }}>
                                  {formatTimeRange(s.start_time, s.end_time)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════
            VIEW — LIST
        ══════════════════════════════════════════════ */}
        {view === 'list' && (
          <motion.div variants={iV} className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00d0cb]" />
              </div>
            ) : listGroups.length === 0 ? (
              <div className="bg-gray-900/70 rounded-2xl p-16 border border-gray-700/50 text-center">
                <FiCalendar className="mx-auto text-5xl text-gray-600 mb-4" />
                <p className="text-white text-lg">{t('empty.no_upcoming')}</p>
                <p className="text-gray-500 text-sm mt-2">{t('empty.click_to_add')}</p>
                <button onClick={() => navigate('/coach/training/create')}
                  className="mt-6 px-5 py-2.5 rounded-xl text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  {t('event.create_session')}
                </button>
              </div>
            ) : (
              listGroups.map(([date, daySessions]) => {
                const d = parseISO(date);
                const todayDay = isToday(d);
                return (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-sm font-semibold px-3 py-1 rounded-full"
                        style={todayDay
                          ? { background: 'rgba(0,208,203,.12)', color: '#00d0cb', border: '1px solid rgba(0,208,203,.3)' }
                          : { background: 'rgba(30,41,59,.5)', color: '#94a3b8' }}>
                        {todayDay ? `${t('controls.today')} — ` : ''}{tDayLong(d)}, {tMonthLong(d)} {format(d, 'd, yyyy')}
                      </div>
                      <div className="flex-1 h-px bg-gray-800" />
                      <div className="text-xs text-gray-600">{daySessions.length} {t('stats.session_s')}</div>
                    </div>
                    <div className="space-y-3">
                      {daySessions.map(s => <SessionCard key={s.id} s={s} />)}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

      </div>

      {/* ══════════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEditModal && selectedSession && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900/95 rounded-2xl border border-gray-700 w-full max-w-lg">
              <form onSubmit={handleEdit}>
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div>
                    <div className="text-lg font-bold text-white">{t('event.edit')}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{selectedSession.title}</div>
                  </div>
                  <button type="button" onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800">
                    <FiX size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('event.start_date')} <span className="text-red-400 text-xs">*</span></label>
                    <input type="date" value={editForm.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]"
                      required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('event.start_date')} (Time)</label>
                      <input type="time" value={editForm.start_time}
                        onChange={e => setEditForm(p => ({ ...p, start_time: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('event.end_date')} (Time)</label>
                      <input type="time" value={editForm.end_time}
                        onChange={e => setEditForm(p => ({ ...p, end_time: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('event.location')}</label>
                    <input type="text" value={editForm.location}
                      onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                      placeholder="Main Field..."
                      className="w-full px-4 py-3 bg-gray-800/65 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d0cb]" />
                  </div>
                  {selectedSession.recurrence && selectedSession.recurrence !== 'none' && (
                    <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400">
                      This is a {t('event.recurring')} session. Editing will only update this specific occurrence.
                    </div>
                  )}
                </div>
                <div className="flex gap-3 px-6 pb-6">
                  <button type="button" onClick={() => setShowEditModal(false)}
                    className="px-5 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700/50">
                    {t('event.cancel')}
                  </button>
                  <motion.button type="submit" disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-70 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#4fb0ff,#00d0cb)' }}>
                    {isSubmitting
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                      : <><FiCheck size={16} />{t('event.save')}</>}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          DAY QUICK-VIEW MODAL
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewingDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            style={{ backdropFilter: 'blur(12px)' }}
            onClick={() => setViewingDay(null)}>
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border"
              style={{ background: '#0c132a', borderColor: 'rgba(51,65,85,.6)', boxShadow: '0 32px 80px rgba(0,0,0,.7)' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(51,65,85,.4)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#4fb0ff22,#00d0cb22)', border: '1px solid rgba(0,208,203,.3)' }}>
                    <FiCalendar className="text-[#00d0cb]" size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {isToday(viewingDay) ? `${t('controls.today')} — ` : ''}{tDayLong(viewingDay)}, {tMonthLong(viewingDay)} {format(viewingDay, 'd, yyyy')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {viewingSessions.length} {t('stats.session_s')} {t('stats.sessions_scheduled')}
                    </p>
                  </div>
                </div>
                <button onClick={() => setViewingDay(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all">
                  <FiX size={20} />
                </button>
              </div>

              {/* Session cards */}
              <div className="p-6 space-y-4">
                {viewingSessions.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-xl" style={{ borderColor: 'rgba(51,65,85,.4)' }}>
                    <FiCalendar className="mx-auto text-3xl text-gray-600 mb-3" />
                    <p className="text-gray-500 text-sm">No {t('stats.sessions_scheduled')} for this day</p>
                  </div>
                ) : viewingSessions.map(s => {
                  const cat = getCat(s.category);
                  const past = isPast(s.date);
                  const recur = s.recurrence && s.recurrence !== 'none';
                  const exCount = (s.exercises || []).length;
                  return (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      onClick={() => { setViewingDay(null); handleOpenDetail(s); }}
                      className="rounded-xl border overflow-hidden cursor-pointer hover:border-[#00d0cb]/40 hover:bg-[#00d0cb]/5 transition-all group"
                      style={{ borderColor: cat.border, background: 'rgba(15,23,42,.7)' }}>
                      {/* Category stripe */}
                      <div className="h-0.5 w-full" style={{ background: cat.color }} />
                      <div className="p-5">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-bold text-white">{s.title}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: cat.bg, color: cat.color }}>{t(`categories.${s.category?.[0] || 'technical'}`) || cat.label}</span>
                              {recur && (
                                <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                                  style={{ background: 'rgba(144,43,209,.2)', color: '#c084fc' }}>
                                  <FiRepeat size={9} />{t('event.recurring')}
                                </span>
                              )}
                              {past && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500">{t('event.past')}</span>}
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 flex-shrink-0">Level {s.level}</span>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <FiClock size={13} style={{ color: cat.color }} />
                            <span>{formatTimeRange(s.start_time, s.end_time)}</span>
                            {s.duration_minutes > 0 &&
                              <span className="text-gray-600 text-xs">({calcDur(s.start_time, s.end_time)})</span>}
                          </div>
                          {s.location && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <FiMapPin size={13} style={{ color: cat.color }} />
                              <span className="truncate">{s.location}</span>
                            </div>
                          )}
                          {s.groups_detail?.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <FiUsers size={13} style={{ color: cat.color }} />
                              <span className="truncate">{s.groups_detail.map(g => g.name).join(', ')}</span>
                            </div>
                          )}
                          {s.coach_name && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <FiActivity size={13} style={{ color: cat.color }} />
                              <span className="truncate">{s.coach_name}</span>
                            </div>
                          )}
                        </div>

                        {/* Metric chips */}
                        {(exCount > 0 || s.participants_count > 0) && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {exCount > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded border flex items-center gap-1"
                                style={{ background: 'rgba(30,41,59,.6)', borderColor: 'rgba(51,65,85,.5)', color: '#94a3b8' }}>
                                <FaDumbbell style={{ fontSize: 9 }} /> {exCount} exercise{exCount !== 1 ? 's' : ''}
                              </span>
                            )}
                            {s.participants_count > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded border flex items-center gap-1"
                                style={{ background: 'rgba(30,41,59,.6)', borderColor: 'rgba(51,65,85,.5)', color: '#94a3b8' }}>
                                <FiUsers size={9} /> {s.participants_count} {t('event.players')}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'rgba(51,65,85,.35)' }}>
                          {!past && (
                            <button
                              onClick={() => { setViewingDay(null); openEdit(s); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all"
                              style={{ background: 'rgba(79,176,255,.08)', borderColor: 'rgba(79,176,255,.25)', color: '#4fb0ff' }}>
                              <FiEdit size={11} />Edit
                            </button>
                          )}
                          {!past && recur ? (
                            <>
                              <button
                                onClick={() => { setViewingDay(null); openDelete(s, false); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all"
                                style={{ background: 'rgba(239,68,68,.08)', borderColor: 'rgba(239,68,68,.25)', color: '#f87171' }}>
                                <FiTrash2 size={11} />Delete this
                              </button>
                              <button
                                onClick={() => { setViewingDay(null); openDelete(s, true); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all"
                                style={{ background: 'rgba(239,68,68,.08)', borderColor: 'rgba(239,68,68,.25)', color: '#f87171' }}>
                                <FiRepeat size={11} />Delete all
                              </button>
                            </>
                          ) : !past ? (
                            <button
                              onClick={() => { setViewingDay(null); openDelete(s, false); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all"
                              style={{ background: 'rgba(239,68,68,.08)', borderColor: 'rgba(239,68,68,.25)', color: '#f87171' }}>
                              <FiTrash2 size={11} />Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer — Add session */}
              <div className="px-6 pb-6">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setViewingDay(null); navigate('/coach/training'); }}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  <FiPlus size={15} />{t('empty.add_for_day')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDeleteModal && selectedSession && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900/95 rounded-2xl border border-red-500/30 w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <FiTrash2 className="text-red-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">{t('event.delete')}</div>
                  <div className="text-xs text-gray-400">{selectedSession.title}</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-5">
                {deleteAll
                  ? t('modal.delete_all_warning')
                  : t('modal.delete_single_warning')
                }
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700/50 text-sm">
                  Cancel
                </button>
                <motion.button onClick={handleDelete} disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
                  {isSubmitting
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><FiTrash2 size={14} />{deleteAll ? 'Delete all' : 'Delete'}</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="top-right" />

      {/* Universal Detail Drawer */}
      <EventDetailDrawer
        detailSession={detailSession}
        setDetailSession={setDetailSession}
        isDetailLoading={isDetailLoading}
        handleEditEvent={openEdit}
        setEventToDelete={setSelectedSession}
        setShowDeleteConfirm={setShowDeleteModal}
        userType="coach"
      />
    </motion.div>
  );
};

export default CoachAgenda;