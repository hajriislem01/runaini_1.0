import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiMapPin, FiFilter,
  FiChevronDown, FiChevronUp, FiRepeat, FiX,
  FiGrid, FiList, FiChevronLeft, FiChevronRight,
  FiUsers, FiActivity, FiAlertCircle,
} from 'react-icons/fi';
import { FaDumbbell, FaBolt } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import API from '../api';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import EventDetailDrawer from '../../components/common/EventDetailDrawer';
import DayEventsModal from '../administration/agendamanagement/modals/DayEventsModal';
import {
  format, parseISO, isToday, isBefore, startOfDay,
  startOfWeek, endOfWeek, addDays, addWeeks, addMonths,
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, differenceInMinutes,
} from 'date-fns';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORIES = {
  technical: { label: 'Technical', color: '#4fb0ff', bg: 'rgba(79,176,255,0.12)' },
  tactical: { label: 'Tactical', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  physical: { label: 'Physical', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  mental: { label: 'Mental', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  match_prep: { label: 'Match Prep', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  recovery: { label: 'Recovery', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
};
const getCat = (k) => {
  if (!k) return { label: 'Session', color: '#4fb0ff', bg: 'rgba(79,176,255,0.12)' };
  const lower = k.toLowerCase().replace(' ', '_');
  return CATEGORIES[lower] || { label: k, color: '#4fb0ff', bg: 'rgba(79,176,255,0.12)' };
};

const getDayLabel = (dateStr) => {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  return format(d, 'EEE'); // 'Sat', 'Mon', etc.
};

const getDateLabel = (dateStr) => {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  return format(d, 'MMM d'); // 'May 30', 'May 22', etc.
};

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
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
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
};

// Load monitoring
const getLoadInfo = (sessions) => {
  const totalMin = sessions.reduce((acc, s) => {
    if (!s.start_time || !s.end_time) return acc;
    const [sh, sm] = s.start_time.split(':').map(Number);
    const [eh, em] = s.end_time.split(':').map(Number);
    return acc + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);
  const target = 300; // 5h par semaine cible pour une académie U15
  const pct = Math.min(100, Math.round((totalMin / target) * 100));
  if (pct < 40) return { label: 'Light week', color: '#22c55e', pct };
  if (pct < 70) return { label: 'Medium week', color: '#f59e0b', pct };
  return { label: 'Heavy week', color: '#ef4444', pct };
};

// Countdown
const useCountdown = (session) => {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!session?.date || !session?.start_time) return;
    const compute = () => {
      const now = new Date();
      const dt = parseISO(`${session.date}T${session.start_time}`);
      const min = differenceInMinutes(dt, now);
      if (min <= 0) setLabel('In progress');
      else if (min < 60) setLabel(`In ${min}min`);
      else {
        const h = Math.floor(min / 60), m = min % 60;
        setLabel(`In ${h}h${m > 0 ? ` ${m}min` : ''}`);
      }
    };
    compute();
    const t = setInterval(compute, 30000);
    return () => clearInterval(t);
  }, [session]);
  return label;
};

// ═══════════════════════════════════════════════════════════════════════════════
const PlayerTraining = () => {
  const navigate = useNavigate();
  const { player, isLoading: playerLoading } = usePlayer();
  const { t, i18n } = useTranslation('playertraining');
  const isRtl = i18n.language === 'ar';

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('list');   // list | week | month
  const [listTab, setListTab] = useState('upcoming'); // upcoming | personal | past
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [detailSession, setDetailSession] = useState(null); // Coach-identical detail modal
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleOpenModal = async (s) => {
    setDetailSession(s); // Show immediate UI with partial data
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

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!player) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [tRes, eRes] = await Promise.all([
          API.get('trainings/'),
          API.get('events/'),
        ]);

        // Normalize events
        const normalizedEvents = (eRes.data || []).map(evt => ({
          ...evt,
          _isEvent: true,
          category: evt.type === 'Meeting' ? 'mental' : (evt.type === 'Tournament' ? 'match_prep' : 'match_prep'),
          start_time: evt.date.split('T')[1]?.substring(0, 5) || '00:00',
          end_time: evt.date.split('T')[1]?.substring(0, 5) || '00:00',
          date: evt.date.split('T')[0],
        }));

        setSessions([...tRes.data, ...normalizedEvents]);
      } catch (err) {
        console.error('Error loading agenda:', err);
        toast.error('Failed to load sessions');
      }
      finally { setIsLoading(false); }
    };
    load();
  }, [player]);

  const today = startOfDay(new Date());

  // ── Sessions du groupe ────────────────────────────────────────────────────
  const myGroupSessions = useMemo(() => {
    return sessions.filter(s => {
      if (s._isEvent) {
        // Backend already filters events by target_players or group/subgroup
        // So we just keep all events returned by the API
        return true;
      }
      if (!player?.group?.id) return false;
      return s.groups_detail?.some(g => g.id === player.group.id);
    });
  }, [sessions, player]);

  // ── Filtre catégorie ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!filterCat) return myGroupSessions;
    return myGroupSessions.filter(s => {
      const sCats = Array.isArray(s.category) ? s.category : (s.category ? [s.category] : []);
      return sCats.some(c => c && c.toLowerCase().replace(' ', '_') === filterCat.toLowerCase().replace(' ', '_'));
    });
  }, [myGroupSessions, filterCat]);

  // ── Exercices individuels ─────────────────────────────────────────────────
  const myExercises = useMemo(() => {
    if (!player?.id) return [];
    const result = [];
    sessions.forEach(s => {
      const exs = (s.exercises || []).filter(ex =>
        ex.assigned_players && (
          ex.assigned_players.includes(player.id) ||
          ex.assigned_players.includes(String(player.id)) ||
          ex.assigned_players.includes(Number(player.id))
        )
      );
      if (exs.length > 0) result.push({ session: s, exercises: exs });
    });
    return result;
  }, [sessions, player]);

  const filteredMyExercises = useMemo(() => {
    if (!filterCat) return myExercises;
    return myExercises.map(({ session, exercises }) => ({
      session,
      exercises: exercises.filter(ex => ex.category && ex.category.toLowerCase().replace(' ', '_') === filterCat.toLowerCase().replace(' ', '_'))
    })).filter(g => g.exercises.length > 0);
  }, [myExercises, filterCat]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const ms = startOfMonth(new Date());
    const me = endOfMonth(new Date());
    const monthSessions = myGroupSessions.filter(s => {
      const d = parseISO(s.date);
      return d >= ms && d <= me;
    });
    const totalMin = monthSessions.reduce((acc, s) => {
      if (!s.start_time || !s.end_time) return acc;
      const [sh, sm] = s.start_time.split(':').map(Number);
      const [eh, em] = s.end_time.split(':').map(Number);
      return acc + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);
    return {
      upcoming: myGroupSessions.filter(s => !isBefore(parseISO(s.date), today)).length,
      past: myGroupSessions.filter(s => isBefore(parseISO(s.date), today)).length,
      personal: myExercises.reduce((a, g) => a + g.exercises.length, 0),
      totalMin,
    };
  }, [myGroupSessions, myExercises, today]);

  const filteredStats = useMemo(() => {
    return {
      upcoming: filtered.filter(s => !isBefore(parseISO(s.date), today)).length,
      past: filtered.filter(s => isBefore(parseISO(s.date), today)).length,
      personal: filteredMyExercises.reduce((a, g) => a + g.exercises.length, 0),
    };
  }, [filtered, filteredMyExercises, today]);

  // ── Week sessions ─────────────────────────────────────────────────────────
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    , [weekStart]);

  const getSessionsForDay = useCallback((day) =>
    filtered.filter(s => isSameDay(parseISO(s.date), day))
    , [filtered]);

  // ── Week load ─────────────────────────────────────────────────────────────
  const weekLoad = useMemo(() => {
    const ws = filtered.filter(s => {
      const d = parseISO(s.date);
      return d >= weekStart && d <= addDays(weekStart, 6);
    });
    return getLoadInfo(ws);
  }, [filtered, weekStart]);

  // ── Month calendar ────────────────────────────────────────────────────────
  const calDays = useMemo(() => {
    const ms = startOfMonth(monthDate);
    const me = endOfMonth(monthDate);
    const start = startOfWeek(ms, { weekStartsOn: 1 });
    const end = endOfWeek(me, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, monthDate),
      events: filtered.filter(s => isSameDay(parseISO(s.date), date)),
    }));
  }, [monthDate, filtered]);

  // ── Prochaine session pour countdown ─────────────────────────────────────
  const nextSession = useMemo(() => {
    return [...myGroupSessions]
      .filter(s => !isBefore(parseISO(s.date), today))
      .sort((a, b) => {
        const da = parseISO(`${a.date}T${a.start_time || '00:00'}`);
        const db = parseISO(`${b.date}T${b.start_time || '00:00'}`);
        return da - db;
      })[0] || null;
  }, [myGroupSessions, today]);

  const countdown = useCountdown(nextSession);

  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const iV = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const loading = isLoading || playerLoading;

  // ─── SessionCard ──────────────────────────────────────────────────────────
  const SessionCard = ({ s, showPastBadge = false }) => {
    const categories = Array.isArray(s.category) ? s.category : (s.category ? [s.category] : []);
    const past = isBefore(parseISO(s.date), today);
    const todayS = isToday(parseISO(s.date));

    // Load dots
    const [sh, sm] = (s.start_time || '00:00').split(':').map(Number);
    const [eh, em] = (s.end_time || '00:00').split(':').map(Number);
    const durMin = (eh * 60 + em) - (sh * 60 + sm);
    const loadLevel = durMin > 90 ? 'high' : durMin > 60 ? 'medium' : 'low';
    const loadColor = loadLevel === 'high' ? '#ef4444' : loadLevel === 'medium' ? '#f59e0b' : '#22c55e';

    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.01, borderColor: past ? 'rgba(30,41,59,.8)' : 'rgba(79,176,255,.4)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(79, 176, 255, 0.1)' }}
        className="w-full rounded-2xl border overflow-hidden transition-all duration-300"
        style={{
          background: past ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: past ? 'rgba(30,41,59,.6)' : 'rgba(51,65,85,.4)',
          borderLeft: s._isEvent
            ? (s.type === 'Meeting' ? '4px solid #4fb0ff' : s.type === 'Match Friendly' ? '4px solid #f59e0b' : '4px solid #a855f7')
            : '4px solid #22c55e',
          opacity: past ? 0.72 : 1,
        }}>
        {/* Card header — click opens detail modal */}
        <div className="p-5 cursor-pointer select-none"
          onClick={() => handleOpenModal(s)}>
          {/* Top Row: Tags & Load */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-1">
              {s._isEvent ? (
                (() => {
                  let badgeConfig = { color: '#4fb0ff', bg: 'rgba(79,176,255,0.12)', label: t('card.meeting') };
                  if (s.type === 'Meeting') badgeConfig = { color: '#4fb0ff', bg: 'rgba(79,176,255,0.12)', label: t('card.meeting') };
                  else if (s.type === 'Match Friendly') badgeConfig = { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: t('card.friendlyMatch') };
                  else if (s.type === 'Tournament') badgeConfig = { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: t('card.tournament') };

                  return (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                      style={{ background: badgeConfig.bg, color: badgeConfig.color, borderColor: `${badgeConfig.color}25` }}>
                      {badgeConfig.label}
                    </span>
                  );
                })()
              ) : (
                <>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-[#22c55e] border border-[#22c55e]/20">
                    {t('card.teamTraining')}
                  </span>
                  {categories.map(cKey => {
                    const c = getCat(cKey);
                    return (
                      <span key={cKey} className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                        style={{ background: c.bg, color: c.color, borderColor: `${c.color}25` }}>
                        {t(`categories.${cKey}`, c.label)}
                      </span>
                    );
                  })}
                </>
              )}
            </div>

            {/* Load dots */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <span key={i} className="text-xs leading-none" style={{ color: i <= (loadLevel === 'high' ? 3 : loadLevel === 'medium' ? 2 : 1) ? loadColor : 'rgba(51, 65, 85, 0.4)' }}>
                    ●
                  </span>
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: loadColor }}>
                {loadLevel === 'high' ? t('load.highLoad') : loadLevel === 'medium' ? t('load.mediumLoad') : t('load.lowLoad')}
              </span>
            </div>
          </div>

          {/* Bottom Section: Stacking info */}
          <div className="flex flex-col space-y-1.5 md:space-y-2">
            {todayS && (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase w-fit"
                style={{ background: 'rgba(0,208,203,.15)', color: '#00d0cb' }}>
                {t('card.today')}
              </span>
            )}

            <div className="text-sm font-semibold text-gray-400">
              {getDayLabel(s.date)}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FiCalendar className="text-gray-500" size={14} />
              <span className="font-medium">{getDateLabel(s.date)}</span>
            </div>

            {s.start_time && s.end_time && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FiClock className="text-gray-500" size={14} />
                <span className="font-medium">{formatTimeRange(s.start_time, s.end_time)}</span>
                <span className="text-gray-500 text-xs">({calcDur(s.start_time, s.end_time)})</span>
              </div>
            )}

            {s.location && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FiMapPin className="text-gray-500" size={14} />
                <span className="font-medium">{s.location}</span>
              </div>
            )}

            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">{t('card.level')}</span>
              <span className="text-xl font-extrabold text-cyan-300">{s.level || 'B'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <motion.div className="min-h-screen text-white px-3 md:px-6 py-4"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right" />
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <motion.div variants={iV} className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                {t('header.myTraining')}
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                {player?.group?.name
                  ? t('header.subtitleGroup', { group: player.group.name })
                  : t('header.subtitle')}
              </p>
            </div>
            {/* Countdown */}
            {!loading && nextSession && countdown && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                style={{ background: 'rgba(79,176,255,.08)', borderColor: 'rgba(79,176,255,.25)' }}>
                <FaBolt style={{ fontSize: 12, color: '#4fb0ff' }} />
                <span className="text-xs text-gray-400">{t('header.nextSession')}</span>
                <span className="text-xs font-bold text-[#4fb0ff]">{countdown}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: t('stats.upcoming'), value: stats.upcoming, color: '#4fb0ff' },
            { label: t('stats.pastSessions'), value: stats.past, color: '#64748b' },
            { label: t('stats.personalExos'), value: stats.personal, color: '#c084fc' },
            { label: t('stats.minThisMonth'), value: stats.totalMin, color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-4 border border-gray-700/50 text-center">
              {loading
                ? <div className="h-7 w-10 bg-gray-700/50 rounded animate-pulse mx-auto mb-1" />
                : <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              }
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Load monitoring ── */}
        {!loading && (
          <motion.div variants={iV}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border mb-5"
            style={{ background: 'rgba(15,23,42,.5)', borderColor: 'rgba(51,65,85,.4)' }}>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: weekLoad.color + '15', color: weekLoad.color, border: `1px solid ${weekLoad.color}30` }}>
              {weekLoad.label}
            </span>
            <span className="text-xs text-gray-500">
              This week: {Math.round(filtered
                .filter(s => {
                  const d = parseISO(s.date);
                  return d >= weekStart && d <= addDays(weekStart, 6);
                })
                .reduce((acc, s) => {
                  const [sh, sm] = (s.start_time || '0:0').split(':').map(Number);
                  const [eh, em] = (s.end_time || '0:0').split(':').map(Number);
                  return acc + (eh * 60 + em) - (sh * 60 + sm);
                }, 0))}min planned
            </span>
            <div className="flex-1 max-w-24 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${weekLoad.pct}%`, background: weekLoad.color }} />
            </div>
            <span className="text-xs" style={{ color: weekLoad.color }}>{weekLoad.pct}%</span>
          </motion.div>
        )}

        {/* ── View toggle + Filters ── */}
        <motion.div variants={iV} className="flex items-center justify-between flex-wrap gap-3 mb-5">
          {/* View toggle */}
          <div className="flex bg-gray-900/70 border border-gray-700/50 rounded-xl overflow-hidden">
            {[
              { key: 'list', icon: <FiList size={13} />, label: t('view.list') },
              { key: 'week', icon: <FiCalendar size={13} />, label: t('view.week') },
              { key: 'month', icon: <FiGrid size={13} />, label: t('view.month') },
            ].map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all"
                style={view === v.key
                  ? { background: 'rgba(79,176,255,.2)', color: '#4fb0ff', borderBottom: '2px solid #4fb0ff' }
                  : { color: '#64748b' }}>
                {v.icon}{v.label}
              </button>
            ))}
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter size={12} className="text-gray-600" />
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button key={key} onClick={() => setFilterCat(filterCat === key ? '' : key)}
                className="text-xs px-2.5 py-1 rounded-full border transition-all"
                style={filterCat === key
                  ? { background: cat.bg, borderColor: cat.color, color: cat.color }
                  : { background: 'rgba(30,41,59,.5)', borderColor: 'rgba(51,65,85,.5)', color: '#64748b' }}>
                {t(`categories.${key}`, cat.label)}
              </button>
            ))}
            {filterCat && (
              <button onClick={() => setFilterCat('')} className="text-gray-500 hover:text-white">
                <FiX size={14} />
              </button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00d0cb]" />
          </div>
        ) : (
          <>
            {/* ══════════════════ WEEK VIEW ══════════════════ */}
            {view === 'week' && (
              <motion.div variants={iV}>
                {/* Week nav */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setWeekStart(addWeeks(weekStart, -1))}
                    className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white">
                    <FiChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">
                      {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                    </span>
                    <button onClick={() => {
                      setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
                      setSelectedDay(startOfDay(new Date()));
                    }}
                      className="text-xs px-2.5 py-1 rounded-full border text-[#00d0cb] border-[#00d0cb]/30">
                      {t('weekView.thisWeek')}
                    </button>
                  </div>
                  <button onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                    className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white">
                    <FiChevronRight size={16} />
                  </button>
                </div>

                {/* Day columns */}
                <div className="flex overflow-x-auto scrollbar-none gap-3 py-2 px-1 md:grid md:grid-cols-7 md:gap-2 mb-6">
                  {weekDays.map((day, i) => {
                    const daySessions = getSessionsForDay(day);
                    const todayDay = isToday(day);
                    const isPastDay = isBefore(day, today);
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    return (
                      <motion.div key={i} whileHover={{ y: -2, scale: 1.02 }}
                        className="flex-shrink-0 min-w-[55px] md:min-w-0 rounded-xl border overflow-hidden cursor-pointer transition-all hover:border-[#4fb0ff]/60 p-2 md:p-3 min-h-[72px] md:min-h-[90px]"
                        onClick={() => setSelectedDay(day)}
                        style={{
                          borderColor: isSelected 
                            ? '#4fb0ff' 
                            : todayDay 
                              ? 'rgba(0,208,203,.4)' 
                              : 'rgba(30,41,59,.8)',
                          background: isSelected 
                            ? 'rgba(79,176,255,.15)' 
                            : todayDay 
                              ? 'rgba(0,208,203,.04)' 
                              : 'rgba(15,23,42,.4)',
                          opacity: isPastDay && !todayDay && !isSelected ? 0.6 : 1,
                          boxShadow: isSelected ? '0 0 15px rgba(79, 176, 255, 0.25)' : 'none',
                        }}>
                        {/* Day header */}
                        <div className="text-center flex flex-col items-center justify-center">
                          <div className="text-[10px] md:text-xs text-gray-500 font-semibold leading-tight mb-1">
                            {t('weekView.days', { returnObjects: true })[i]}
                          </div>
                          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold transition-all"
                            style={{
                              color: isSelected ? '#ffffff' : todayDay ? '#00d0cb' : '#94a3b8',
                              background: isSelected 
                                ? '#4fb0ff' 
                                : todayDay 
                                  ? 'rgba(0,208,203,.12)' 
                                  : 'transparent',
                              boxShadow: isSelected ? '0 0 12px rgba(79,176,255,0.5)' : 'none'
                            }}>
                            {format(day, 'd')}
                          </div>
                        </div>
                        {/* Mobile Sessions indicator dot */}
                        {daySessions.length > 0 && (
                          <div className="flex md:hidden justify-center mt-2">
                            <span className="w-1.5 h-1.5 rounded-full" 
                              style={{ 
                                backgroundColor: getCat(Array.isArray(daySessions[0].category) ? daySessions[0].category[0] : daySessions[0].category).color 
                              }} 
                            />
                          </div>
                        )}
                        {/* Desktop Sessions List */}
                        <div className="hidden md:block space-y-1 mt-1.5">
                          {daySessions.map(s => {
                            const cat = getCat(Array.isArray(s.category) ? s.category[0] : s.category);
                            return (
                              <div key={s.id}
                                className="rounded-md px-1.5 py-1 hover:opacity-80 transition-opacity"
                                style={{ background: cat.bg, borderLeft: `2px solid ${cat.color}` }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDay(day);
                                  handleOpenModal(s);
                                }}>
                                <div className="text-xs font-semibold truncate" style={{ color: cat.color, fontSize: 10 }}>
                                  {s.title}
                                </div>
                                {s.start_time && (
                                  <div className="text-xs text-gray-500" style={{ fontSize: 9 }}>
                                    {fmtTime(s.start_time)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Sessions of the selected day as cards */}
                {selectedDay && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">{t('weekView.thisWeeksSessions')}</h3>
                    {(() => {
                      const daySessions = getSessionsForDay(selectedDay);
                      return daySessions.length > 0 ? (
                        <div className="space-y-3">
                          {daySessions.map(s => (
                            <SessionCard key={s.id} s={s} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-900/40 rounded-2xl border border-gray-700/50">
                          <FiCalendar className="mx-auto text-4xl text-gray-600 mb-3" />
                          <p className="text-gray-400 text-sm">{t('weekView.noSessionsOn')} {format(selectedDay, 'eeee, MMM d')}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════ MONTH VIEW ══════════════════ */}
            {view === 'month' && (
              <motion.div variants={iV}>
                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setMonthDate(addMonths(monthDate, -1))}
                    className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white">
                    <FiChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-white">{format(monthDate, 'MMMM yyyy')}</span>
                    <button onClick={() => {
                      setMonthDate(new Date());
                      setSelectedDay(startOfDay(new Date()));
                    }}
                      className="text-xs px-2.5 py-1 rounded-full border text-[#00d0cb] border-[#00d0cb]/30">
                      {t('monthView.today')}
                    </button>
                  </div>
                  <button onClick={() => setMonthDate(addMonths(monthDate, 1))}
                    className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white">
                    <FiChevronRight size={16} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                  {t('weekView.days', { returnObjects: true }).map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-600 py-1">{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1.5 mb-5">
                  {calDays.map((day, i) => {
                    const todayDay = isToday(day.date);
                    const isSelected = selectedDay && isSameDay(day.date, selectedDay);
                    return (
                      <motion.div key={i} whileHover={{ scale: 1.02 }}
                        className="rounded-xl border p-1.5 cursor-pointer transition-all"
                        style={{
                          minHeight: 64,
                          background: isSelected
                            ? 'rgba(79,176,255,.1)'
                            : todayDay
                              ? 'rgba(0,208,203,.05)'
                              : 'rgba(15,23,42,.5)',
                          borderColor: isSelected
                            ? '#4fb0ff'
                            : todayDay
                              ? 'rgba(0,208,203,.4)'
                              : 'rgba(30,41,59,.8)',
                          opacity: day.isCurrentMonth ? 1 : 0.35,
                        }}
                        onClick={() => {
                          setSelectedDay(day.date);
                        }}>
                        <div className="text-right text-xs font-semibold mb-1"
                          style={{ color: isSelected ? '#4fb0ff' : todayDay ? '#00d0cb' : '#64748b' }}>
                          {format(day.date, 'd')}
                        </div>
                        <div className="space-y-0.5">
                          {(day.events || []).slice(0, 2).map(s => {
                            const cat = getCat(Array.isArray(s.category) ? s.category[0] : s.category);
                            return (
                              <div key={s.id}
                                className="flex items-center gap-0.5 text-xs rounded px-1 py-0.5 hover:opacity-85 transition-opacity"
                                style={{ background: cat.bg }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDay(day.date);
                                  handleOpenModal(s);
                                }}>
                                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                                <span className="truncate" style={{ color: cat.color, fontSize: 9 }}>{s.title}</span>
                              </div>
                            );
                          })}
                          {(day.events || []).length > 2 && (
                            <div className="text-center text-gray-600 font-semibold" style={{ fontSize: 9 }}>
                              +{(day.events || []).length - 2} {t('monthView.more')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800 mb-6">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <span key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                      {t(`categories.${key}`, cat.label)}
                    </span>
                  ))}
                </div>

                {/* Selected Day Sessions */}
                {selectedDay && (
                  <div className="mt-6 border-t border-gray-800/80 pt-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">
                      {t('monthView.sessionsFor')} {format(selectedDay, 'eeee, MMMM d, yyyy')}
                    </h3>
                    {(() => {
                      const daySessions = filtered.filter(s => isSameDay(parseISO(s.date), selectedDay));
                      return daySessions.length > 0 ? (
                        <div className="space-y-3">
                          {daySessions.map(s => (
                            <SessionCard key={s.id} s={s} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-900/40 rounded-2xl border border-gray-700/50">
                          <FiCalendar className="mx-auto text-4xl text-gray-600 mb-3" />
                          <p className="text-gray-400 text-sm">{t('weekView.noSessionsOn')} {format(selectedDay, 'eeee, MMM d')}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════ LIST VIEW ══════════════════ */}
            {view === 'list' && (
              <motion.div variants={iV}>
                {/* List tabs */}
                <div className="flex bg-gray-900/70 border border-gray-700/50 rounded-xl overflow-hidden mb-5">
                  {[
                    { key: 'upcoming', label: `${t('listView.upcoming')} (${filteredStats.upcoming})` },
                    { key: 'personal', label: `${t('listView.personal')} (${filteredStats.personal})` },
                    { key: 'past', label: `${t('listView.past')} (${filteredStats.past})` },
                  ].map(t => (
                    <button key={t.key} onClick={() => setListTab(t.key)}
                      className="flex-1 px-3 py-2.5 text-xs font-semibold transition-all"
                      style={listTab === t.key
                        ? { background: 'rgba(79,176,255,.2)', color: '#4fb0ff', borderBottom: '2px solid #4fb0ff' }
                        : { color: '#64748b' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Upcoming tab */}
                {listTab === 'upcoming' && (() => {
                  const list = [...filtered]
                    .filter(s => !isBefore(parseISO(s.date), today))
                    .sort((a, b) => parseISO(a.date) - parseISO(b.date));
                  return list.length > 0 ? (
                    <div className="space-y-3">
                      {list.map(s => <SessionCard key={s.id} s={s} />)}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-700/50">
                      <FiCalendar className="mx-auto text-4xl text-gray-600 mb-3" />
                      <p className="text-gray-400 text-sm">{t('card.noUpcoming')}</p>
                    </div>
                  );
                })()}

                {/* Personal tab */}
                {listTab === 'personal' && (
                  filteredMyExercises.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500">
                        {filteredStats.personal} {filteredStats.personal > 1 ? t('listView.assignedToYouPlural') : t('listView.assignedToYou')}
                      </p>
                      {filteredMyExercises.map(({ session: s, exercises: exs }, gi) => {
                        const past = isBefore(parseISO(s.date), today);
                        return (
                          <div key={gi} className="rounded-2xl border overflow-hidden"
                            style={{ borderColor: 'rgba(144,43,209,.2)', opacity: past ? 0.7 : 1 }}>
                            {/* Session header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b"
                              style={{ background: 'rgba(144,43,209,.06)', borderColor: 'rgba(144,43,209,.15)' }}>
                              <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                              <span className="text-sm font-bold text-white">{s.title}</span>
                              <span className="text-xs text-gray-500 ml-auto">
                                {isToday(parseISO(s.date)) ? 'Today' : format(parseISO(s.date), 'EEE MMM d')}
                                {s.location && ` · ${s.location}`}
                              </span>
                            </div>
                            {/* Exercises */}
                            <div className="p-4 space-y-3" style={{ background: 'rgba(15,23,42,.6)' }}>
                              {exs.map((ex, i) => {
                                const exCat = getCat(ex.category);
                                return (
                                  <div key={i} className="rounded-xl p-3.5"
                                    style={{ background: 'rgba(15,23,42,.8)', border: '1px solid rgba(51,65,85,.4)' }}>
                                    <div className="flex items-start gap-3 mb-2">
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                                        style={{ background: exCat.bg, color: exCat.color }}>{i + 1}</div>
                                      <div className="flex-1">
                                        <div className="text-sm font-bold text-white">{ex.name}</div>
                                        <div className="flex gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                                          <span>⏱ {ex.duration}min</span>
                                          {ex.sets && <span>🔁 {ex.sets} × {ex.reps}</span>}
                                          <span style={{ color: exCat.color }}>{exCat.label}</span>
                                        </div>
                                      </div>
                                      {ex.intensity && (
                                        <span className="text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                                          style={
                                            ex.intensity === 'high' ? { background: 'rgba(239,68,68,.12)', color: '#f87171' } :
                                              ex.intensity === 'medium' ? { background: 'rgba(245,158,11,.12)', color: '#fbbf24' } :
                                                { background: 'rgba(34,197,94,.12)', color: '#4ade80' }
                                          }>{ex.intensity}</span>
                                      )}
                                    </div>
                                    {ex.instructions && (
                                      <div className="text-xs text-gray-400 italic leading-relaxed pl-11">
                                        {ex.instructions}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-700/50">
                      <FaDumbbell style={{ fontSize: 36, color: '#374151' }} className="mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">{t('card.noPersonal')}</p>
                      <p className="text-gray-600 text-xs mt-1">{t('card.noPersonalDesc')}</p>
                    </div>
                  )
                )}

                {/* Past tab */}
                {listTab === 'past' && (() => {
                  const list = [...filtered]
                    .filter(s => isBefore(parseISO(s.date), today))
                    .sort((a, b) => parseISO(b.date) - parseISO(a.date));
                  return list.length > 0 ? (
                    <div className="space-y-3">
                      {list.map(s => <SessionCard key={s.id} s={s} showPastBadge />)}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-700/50">
                      <p className="text-gray-400 text-sm">{t('card.noPast')}</p>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Universal Summary Modal */}
      <DayEventsModal
        showDayEventsModal={showDayEventsModal}
        setShowDayEventsModal={setShowDayEventsModal}
        selectedDay={selectedDay}
        calendarDays={view === 'week' ? weekDays.map(d => ({ date: d, events: getSessionsForDay(d) })) : calDays}
        handleOpenDetail={handleOpenModal}
        userType="player"
      />

      {/* Universal Detail Drawer */}
      <EventDetailDrawer
        detailSession={detailSession}
        setDetailSession={setDetailSession}
        isDetailLoading={isDetailLoading}
        userType="player"
        playerId={player?.id}
      />
    </motion.div>
  );
};

export default PlayerTraining;