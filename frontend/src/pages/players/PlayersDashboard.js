import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiActivity, FiClock, FiMapPin,
  FiAlertTriangle, FiCheckCircle, FiRepeat,
  FiTrendingUp, FiX, FiAlertCircle,
  FiBarChart2, FiUser, FiSettings,
} from 'react-icons/fi';
import { FaDumbbell, FaStar, FaRegStar, FaBolt, FaHeartbeat } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import {
  format, isToday, parseISO, startOfDay, isBefore,
  differenceInMinutes, startOfWeek, addDays, isSameDay
} from 'date-fns';
import EventDetailDrawer from '../../components/common/EventDetailDrawer';
import DayEventsModal from '../administration/agendamanagement/modals/DayEventsModal';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORIES = {
  technical: { label: 'technical', color: '#4fb0ff' },
  tactical: { label: 'tactical', color: '#f59e0b' },
  physical: { label: 'physical', color: '#22c55e' },
  mental: { label: 'mental', color: '#a855f7' },
  match_prep: { label: 'match_prep', color: '#ef4444' },
  recovery: { label: 'recovery', color: '#14b8a6' },
};
const getCat = (k) => CATEGORIES[k] || { label: k || 'session', color: '#4fb0ff' };

const getCatLabel = (cat, t) => {
  const key = cat.label ? cat.label.toLowerCase() : 'session';
  return t(`categories.${key}`, { defaultValue: cat.label });
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

const scoreColor = (s) => {
  if (!s && s !== 0) return '#64748b';
  if (s >= 8) return '#4ade80';
  if (s >= 7) return '#4fb0ff';
  if (s >= 6) return '#f59e0b';
  return '#f87171';
};

const StarRating = ({ score, max = 10 }) => {
  const stars = Math.round((score / max) * 5);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => i <= stars
        ? <FaStar key={i} style={{ fontSize: 13, color: '#f59e0b' }} />
        : <FaRegStar key={i} style={{ fontSize: 13, color: '#334155' }} />
      )}
    </div>
  );
};

const parseReportMonth = (mStr, lng) => {
  if (!mStr) return '';
  const [y, m] = mStr.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(lng, { month: 'long', year: 'numeric', numberingSystem: 'latn' });
};

// Countdown jusqu'à une session
const useCountdown = (session) => {
  const [label, setLabel] = useState('');
  const { t } = useTranslation('playerdashboard');
  useEffect(() => {
    if (!session) return;
    const compute = () => {
      const now = new Date();
      const sessionDt = parseISO(`${session.date}T${session.start_time || '00:00'}`);
      const diffMin = differenceInMinutes(sessionDt, now);
      if (diffMin <= 0) {
        setLabel(t('session.inProgress'));
      } else if (diffMin < 60) {
        setLabel(t('session.inMinutes', { minutes: diffMin }));
      } else {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        if (m > 0) {
          setLabel(t('session.inHoursMinutes', { hours: h, minutes: m }));
        } else {
          setLabel(t('session.inHoursOnly', { hours: h }));
        }
      }
    };
    compute();
    const timer = setInterval(compute, 30000);
    return () => clearInterval(timer);
  }, [session, t]);
  return label;
};

// Mini sparkline SVG (6 points)
const Sparkline = ({ data = [], color = '#4fb0ff' }) => {
  if (!data.length) return null;
  const vals = data.map(d => d.overall_score || 0);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 10);
  const range = max - min || 1;
  const w = 160, h = 36;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1 || 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {vals.map((v, i) => {
        const x = (i / (vals.length - 1 || 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return i === vals.length - 1
          ? <circle key={i} cx={x} cy={y} r="3" fill={color} />
          : null;
      })}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
const PlayersDashboard = () => {
  const navigate = useNavigate();
  const { player, isLoading: playerLoading, playerName, photoUrl, playerInitial } = usePlayer();
  const { t, i18n } = useTranslation('playerdashboard');

  const [sessions, setSessions] = useState([]);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);   // 6 derniers rapports
  const [groupAvg, setGroupAvg] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [detailSession, setDetailSession] = useState(null); // Coach-identical detail modal
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleOpenDetail = async (s) => {
    setDetailSession(s);
    setIsDetailLoading(true);
    try {
      const endpoint = s._isEvent ? 'events' : 'trainings';
      const res = await API.get(`${endpoint}/${s.id}/`);
      setDetailSession({ ...res.data, _isEvent: s._isEvent });
    } catch (err) {
      console.error("Error fetching dash detail:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ── Fetch data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (playerLoading || !player) return;
    const load = async () => {
      setLoadingData(true);
      try {
        const month = format(new Date(), 'yyyy-MM');
        const [sRes, eRes, rRes, histRes] = await Promise.all([
          API.get('trainings/'),
          API.get('events/'),
          API.get(`reports/?month=${month}`),
          API.get(`reports/?player=${player.id}`).catch(() => ({ data: [] })),
        ]);

        const normalizedEvents = (eRes.data || []).map(evt => ({
          ...evt,
          _isEvent: true,
          category: evt.type === 'Meeting' ? 'mental' : 'match_prep',
          start_time: evt.date.split('T')[1]?.substring(0, 5) || '00:00',
          end_time: evt.date.split('T')[1]?.substring(0, 5) || '00:00',
          date: evt.date.split('T')[0],
        }));

        setSessions([...sRes.data, ...normalizedEvents]);
        const myReport = rRes.data.find(r => r.player === player.id);
        setReport(myReport || null);
        // Historique trié par mois
        const sorted = [...histRes.data].sort((a, b) =>
          a.month > b.month ? 1 : -1
        ).slice(-6);
        setHistory(sorted);
        // Moyenne du groupe ce mois
        if (rRes.data.length > 0) {
          const scores = rRes.data.map(r => parseFloat(r.overall_score || 0)).filter(Boolean);
          setGroupAvg(scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null);
        }
      } catch {
        toast.error(t('common.failedLoad'));
      }
      finally { setLoadingData(false); }
    };
    load();
  }, [playerLoading, player, t]);

  // ── Prochaine session aujourd'hui ─────────────────────────────────────────
  const nextSession = useMemo(() => {
    if (!player?.group?.id) return null;
    const today = startOfDay(new Date());
    return [...sessions]
      .filter(s =>
        !isBefore(parseISO(s.date), today) &&
        s.groups_detail?.some(g => g.id === player.group.id)
      )
      .sort((a, b) => {
        const da = parseISO(`${a.date}T${a.start_time || '00:00'}`);
        const db = parseISO(`${b.date}T${b.start_time || '00:00'}`);
        return da - db;
      })[0] || null;
  }, [sessions, player]);

  const countdown = useCountdown(nextSession);

  // ── Upcoming sessions (3 prochaines) ─────────────────────────────────────
  const upcomingSessions = useMemo(() => {
    if (!player?.group?.id) return [];
    const today = startOfDay(new Date());
    return [...sessions]
      .filter(s =>
        !isBefore(parseISO(s.date), today) &&
        s.groups_detail?.some(g => g.id === player.group.id)
      )
      .sort((a, b) => parseISO(a.date) - parseISO(b.date))
      .slice(0, 3);
  }, [sessions, player]);

  // ── Exercices individuels ─────────────────────────────────────────────────
  const myExercises = useMemo(() => {
    if (!player?.id) return [];
    const result = [];
    sessions.forEach(s => {
      (s.exercises || []).forEach(ex => {
        if (ex.assigned_players && (
          ex.assigned_players.includes(player.id) ||
          ex.assigned_players.includes(String(player.id)) ||
          ex.assigned_players.includes(Number(player.id))
        )) {
          result.push({ ...ex, session: s });
        }
      });
    });
    return result.slice(0, 4);
  }, [sessions, player]);

  // ── Sessions du groupe ────────────────────────────────────────────────────
  const myGroupSessions = useMemo(() => {
    return sessions.filter(s => {
      if (s._isEvent) return true;
      if (!player?.group?.id) return false;
      return s.groups_detail?.some(g => g.id === player.group.id);
    });
  }, [sessions, player]);

  const getSessionsForDay = useCallback((day) =>
    myGroupSessions.filter(s => isSameDay(parseISO(s.date), day))
    , [myGroupSessions]);

  // ── Streak cette semaine ──────────────────────────────────────────────────
  const weekStreak = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      const daySessions = getSessionsForDay(d);
      return {
        date: d,
        label: d.toLocaleDateString(i18n.language, { weekday: 'short' }).charAt(0),
        isToday: isToday(d),
        isPast: isBefore(d, startOfDay(new Date())),
        hasSession: daySessions.length > 0,
        attended: daySessions.some(s => s.attended),
        sessions: daySessions
      };
    });
  }, [getSessionsForDay, i18n.language]);

  const streakCount = weekStreak.filter(d => d.attended).length;

  // ── Alertes ───────────────────────────────────────────────────────────────
  const alerts = useMemo(() => {
    const list = [];
    if (player?.status === 'Injured') {
      list.push({ type: 'danger', msg: t('alerts.injured', { status: t('status.injured') }) });
    }
    if (report) {
      const attPct = report.attendance_total > 0
        ? (report.attendance_present / report.attendance_total) * 100 : 100;
      if (attPct < 75) {
        list.push({ type: 'warning', msg: t('alerts.lowAttendance', { percent: Math.round(attPct) }) });
      }
      if (report.overall_score < 6) {
        list.push({ type: 'warning', msg: t('alerts.lowScore', { score: parseFloat(report.overall_score).toFixed(1) }) });
      }
    }
    return list;
  }, [player, report, t]);

  // ── Motivation message ────────────────────────────────────────────────────
  const motivation = useMemo(() => {
    if (!report) return { msg: t('motivation.ready'), color: '#00d0cb' };
    const score = parseFloat(report.overall_score || 0);
    const goal = parseFloat(report.objective || 8);
    const diff = (goal - score).toFixed(1);
    if (score >= goal) return { msg: t('motivation.reachedGoal', { goal }), color: '#4ade80' };
    if (score >= 7) return { msg: t('motivation.nearGoal', { score, diff, goal }), color: '#4fb0ff' };
    return { msg: t('motivation.farGoal', { score, goal }), color: '#f59e0b' };
  }, [report, t]);

  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const iV = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const isLoading = playerLoading || loadingData;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center text-white p-6 md:p-8 lg:p-10"
        style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
        initial="hidden" animate="visible" variants={cV}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-dashed border-[#00d0cb]"></div>
      </motion.div>
    );
  }

  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div variants={iV} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: 'rgba(0,208,203,.4)' }}>
                {photoUrl
                  ? <img src={photoUrl} alt={playerName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                    {playerInitial}
                  </div>
                }
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                  {t('header.playerDashboard')}
                </h1>
                <p className="text-gray-400 mt-0.5 text-sm break-words">
                  {t('header.welcomeBack', { name: '' })}<span className="text-[#00d0cb] font-semibold truncate">{playerName || '...'}</span>
                  {player?.position && <span className="text-gray-600"> · {player.position}</span>}
                  {player?.group?.name && <span className="text-gray-600"> · {player.group.name}</span>}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {new Date().toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' })}
            </div>
          </div>
        </motion.div>

        {/* ── Alerts ── */}
        {!isLoading && alerts.length > 0 && (
          <motion.div variants={iV} className="mb-5 space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
                style={a.type === 'danger'
                  ? { background: 'rgba(239,68,68,.08)', borderColor: 'rgba(239,68,68,.25)', color: '#fca5a5' }
                  : { background: 'rgba(245,158,11,.08)', borderColor: 'rgba(245,158,11,.25)', color: '#fcd34d' }}>
                <FiAlertTriangle size={14} className="flex-shrink-0" />
                {a.msg}
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Motivation banner ── */}
        <motion.div variants={iV}
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border mb-6"
          style={{ background: 'rgba(15,23,42,.6)', borderColor: 'rgba(51,65,85,.4)' }}>
          <FaBolt style={{ fontSize: 14, color: motivation.color, flexShrink: 0 }} />
          <p className="text-sm" style={{ color: motivation.color }}>{motivation.msg}</p>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: t('stats.monthlyScore'),
              value: report ? `${parseFloat(report.overall_score).toFixed(1)}/10` : '—',
              color: report ? scoreColor(report.overall_score) : '#64748b',
            },
            {
              label: t('stats.attendance'),
              value: report && report.attendance_total > 0
                ? `${Math.round((report.attendance_present / report.attendance_total) * 100)}%`
                : '—',
              color: '#00d0cb',
            },
            { label: t('stats.myGroup'), value: player?.group?.name || '—', color: '#902bd1', sm: true },
            { label: t('stats.position'), value: player?.position || '—', color: '#f59e0b', sm: true },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 text-center">
              {isLoading
                ? <div className="h-8 w-14 bg-gray-700/50 rounded animate-pulse mx-auto mb-2" />
                : <div className={`font-bold ${s.sm ? 'text-sm' : 'text-lg'}`} style={{ color: s.color }}>
                  {s.value}
                </div>
              }
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Next session hero ── */}
        {!isLoading && nextSession && (
          <motion.div variants={iV}
            className="rounded-2xl p-5 border mb-6"
            style={{
              background: 'linear-gradient(135deg,rgba(79,176,255,.08),rgba(0,208,203,.05))',
              borderColor: 'rgba(79,176,255,.25)',
            }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#4fb0ff] uppercase tracking-wider">
                    {isToday(parseISO(nextSession.date)) ? t('session.todaysSession') : t('session.nextSession')}
                  </span>
                  {countdown && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(79,176,255,.15)', color: '#4fb0ff', border: '1px solid rgba(79,176,255,.3)' }}>
                      {countdown}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-white mb-1">{nextSession.title}</div>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <FiClock size={10} />{formatTimeRange(nextSession.start_time, nextSession.end_time)}
                  </span>
                  {nextSession.location && (
                    <span className="flex items-center gap-1">
                      <FiMapPin size={10} />{nextSession.location}
                    </span>
                  )}
                  <span style={{ color: getCat(Array.isArray(nextSession.category) ? nextSession.category[0] : nextSession.category).color }}>
                    {getCatLabel(getCat(Array.isArray(nextSession.category) ? nextSession.category[0] : nextSession.category), t)}
                  </span>
                </div>
                {/* Exercices de la séance pour CE joueur */}
                {(() => {
                  const myExs = (nextSession.exercises || []).filter(ex =>
                    ex.assigned_players && (
                      ex.assigned_players.includes(player?.id) ||
                      ex.assigned_players.includes(String(player?.id)) ||
                      ex.assigned_players.includes(Number(player?.id))
                    )
                  );
                  const grpExs = (nextSession.exercises || []).filter(ex =>
                    !ex.assigned_players || ex.assigned_players.length === 0
                  );
                  return (myExs.length > 0 || grpExs.length > 0) ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {myExs.map((ex, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(192,132,252,.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,.25)' }}>
                          {ex.name} ({t('session.personal')})
                        </span>
                      ))}
                      {grpExs.slice(0, 2).map((ex, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(30,41,59,.6)', color: '#64748b', border: '1px solid #1e293b' }}>
                          {ex.name}
                        </span>
                      ))}
                      {grpExs.length > 2 && (
                        <span className="text-xs text-gray-600">+{grpExs.length - 2} {t('session.more')}</span>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
              <button onClick={() => handleOpenDetail(nextSession)}
                className="text-xs px-4 py-2 rounded-xl font-medium text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#4fb0ff,#00d0cb)' }}>
                {t('session.viewDetails')}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Cert médical ── */}
        {!isLoading && player?.medical_cert_valid !== undefined && (
          <motion.div variants={iV}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border mb-6"
            style={player.medical_cert_valid
              ? { background: 'rgba(34,197,94,.06)', borderColor: 'rgba(34,197,94,.2)' }
              : { background: 'rgba(239,68,68,.06)', borderColor: 'rgba(239,68,68,.2)' }}>
            <FaHeartbeat style={{ fontSize: 13, color: player.medical_cert_valid ? '#4ade80' : '#f87171' }} />
            <span className="text-xs" style={{ color: player.medical_cert_valid ? '#4ade80' : '#f87171' }}>
              {player.medical_cert_valid ? t('medical.valid') : t('medical.expired')}
            </span>
          </motion.div>
        )}

        {/* ── 2 colonnes ── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* ── Rapport mensuel + sparkline ── */}
          <motion.div variants={iV} className="w-full max-w-full overflow-x-hidden p-4">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FiActivity style={{ color: '#4fb0ff' }} size={14} />
              {t('evaluation.monthlyReportTitle', { month: new Date().toLocaleDateString(i18n.language, { month: 'long' }) })}
            </h2>
            {isLoading ? (
              <div className="h-64 bg-gray-900/50 rounded-2xl animate-pulse" />
            ) : report ? (
              <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 space-y-4">
                {/* Overall + stars */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold" style={{ color: scoreColor(report.overall_score) }}>
                      {parseFloat(report.overall_score).toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">/10</span>
                  </div>
                  <StarRating score={report.overall_score} />
                </div>

                {/* Piliers */}
                {[
                  { label: t('categories.technical'), value: report.technical_avg, color: '#4fb0ff' },
                  { label: t('categories.tactical'), value: report.tactical_avg, color: '#f59e0b' },
                  { label: t('categories.physical'), value: report.physical_avg, color: '#22c55e' },
                  { label: t('categories.mental'), value: report.mental_avg, color: '#a855f7' },
                ].map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{p.label}</span>
                      <span style={{ color: p.color }}>{parseFloat(p.value || 0).toFixed(1)}/10</span>
                    </div>
                    <div className="w-full bg-gray-800/60 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${(p.value || 0) * 10}%`, background: p.color }} />
                    </div>
                  </div>
                ))}

                {/* Comparaison groupe */}
                {groupAvg && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                    <span className="text-gray-500">{t('evaluation.vsGroupAverage')}</span>
                    <span style={{
                      color: report.overall_score >= groupAvg ? '#4ade80' : '#f87171'
                    }}>
                      {report.overall_score >= groupAvg ? '+' : ''}
                      {(report.overall_score - groupAvg).toFixed(1)} pts{' '}
                      {report.overall_score >= groupAvg ? t('evaluation.above') : t('evaluation.below')}
                    </span>
                  </div>
                )}

                {/* Sparkline historique */}
                {history.length >= 2 && (
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{t('evaluation.lastMonths', { count: history.length })}</span>
                      {history.length >= 2 && (
                        <span style={{
                          color: history[history.length - 1]?.overall_score >= history[history.length - 2]?.overall_score
                            ? '#4ade80' : '#f87171'
                        }}>
                          {history[history.length - 1]?.overall_score >= history[history.length - 2]?.overall_score ? '↑' : '↓'}{' '}
                          {t('evaluation.trend')}
                        </span>
                      )}
                    </div>
                    <Sparkline data={history} color={scoreColor(report.overall_score)} />
                  </div>
                )}

                {/* Objectif */}
                {report.objective && (
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>{t('evaluation.goalReach', { score: report.objective })}</span>
                      <span style={{ color: '#4fb0ff' }}>
                        {Math.min(100, Math.round((report.overall_score / report.objective) * 100))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800/60 rounded-full h-2">
                      <div className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (report.overall_score / report.objective) * 100)}%`,
                          background: 'linear-gradient(90deg,#902bd1,#4fb0ff)',
                        }} />
                    </div>
                  </div>
                )}

                <button onClick={() => navigate('/players/performance')}
                  className="w-full py-2 rounded-xl text-xs border transition-all"
                  style={{ color: '#00d0cb', borderColor: 'rgba(0,208,203,.2)' }}>
                  {t('evaluation.viewFullReport')}
                </button>
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-2xl p-10 border border-gray-700/50 text-center">
                <FiActivity className="mx-auto text-4xl text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">{t('evaluation.noReportYet')}</p>
                <p className="text-gray-600 text-xs mt-1">{t('evaluation.evaluateSoon')}</p>
              </div>
            )}
          </motion.div>

          {/* ── Streak + upcoming sessions ── */}
          <motion.div variants={iV} className="space-y-5">

            {/* Streak this week */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiTrendingUp style={{ color: '#22c55e' }} size={14} />
                {t('streak.thisWeek')}
              </h2>
              <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                <div className="flex gap-2 mb-3">
                  {weekStreak.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                      onClick={() => {
                        setSelectedDay(d.date);
                        setShowDayEventsModal(true);
                      }}>
                      <div className="text-xs text-gray-600 group-hover:text-gray-400">{d.label}</div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all group-hover:scale-110"
                        style={d.isToday
                          ? { background: 'rgba(0,208,203,.15)', color: '#00d0cb', border: '1px solid rgba(0,208,203,.3)' }
                          : d.attended
                            ? { background: 'rgba(34,197,94,.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,.25)' }
                            : d.isPast && d.hasSession
                              ? { background: 'rgba(239,68,68,.1)', color: '#f87171', border: '1px solid rgba(239,68,68,.2)' }
                              : d.hasSession
                                ? { background: 'rgba(30,41,59,.5)', color: '#64748b', border: '1px solid #1e293b' }
                                : { background: 'transparent', color: '#1e293b', border: '1px solid #1e293b' }
                        }>
                        {d.attended ? '✓' : d.hasSession ? '•' : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs" style={{ color: streakCount >= 3 ? '#4ade80' : '#64748b' }}>
                  {streakCount > 0
                    ? t('streak.attendedCount', { count: streakCount })
                    : t('streak.noAttended')
                  }
                </div>
              </div>
            </div>

            {/* Upcoming sessions */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiCalendar style={{ color: '#00d0cb' }} size={14} />
                {t('session.nextSessions')}
              </h2>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-14 bg-gray-900/50 rounded-xl animate-pulse" />)}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-2">
                  {upcomingSessions.map(s => {
                    const sCats = Array.isArray(s.category) ? s.category : [s.category];
                    const cat = getCat(sCats[0]);
                    const recur = s.recurrence && s.recurrence !== 'none';
                    const todayS = isToday(parseISO(s.date));
                    return (
                      <div key={s.id}
                        className="flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer hover:border-opacity-70"
                        style={{ background: 'rgba(15,23,42,.5)', borderColor: 'rgba(51,65,85,.4)' }}
                        onClick={() => handleOpenDetail(s)}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-medium text-white truncate">{s.title}</span>
                            {recur && <FiRepeat size={9} className="text-purple-400 flex-shrink-0" />}
                            {todayS && (
                              <span className="text-xs px-1 py-0.5 rounded"
                                style={{ background: 'rgba(0,208,203,.15)', color: '#00d0cb', fontSize: 9 }}>{t('session.today')}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 flex gap-2">
                            <span>{todayS ? t('session.today') : new Date(s.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', numberingSystem: 'latn' })}</span>
                            <span>{formatTimeRange(s.start_time, s.end_time)}</span>
                            {s.location && <span>{s.location}</span>}
                          </div>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: cat.color + '15', color: cat.color }}>
                          {getCatLabel(cat, t)}
                        </span>
                      </div>
                    );
                  })}
                  <button onClick={() => navigate('/players/training')}
                    className="w-full text-center text-xs py-1.5 transition-colors"
                    style={{ color: '#00d0cb' }}>
                    {t('activity.viewAll')}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <p className="text-gray-500 text-xs">{t('session.noUpcoming')}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Coach message ── */}
        {!isLoading && report?.comment && (
          <motion.div variants={iV}
            className="rounded-2xl p-5 border mb-6"
            style={{ background: 'rgba(144,43,209,.06)', borderColor: 'rgba(144,43,209,.2)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                {report.coach_name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{report.coach_name || 'Your coach'}</div>
                <div className="text-xs text-gray-500">
                  {parseReportMonth(report.month, i18n.language)} — {t('evaluation.monthlyEvaluation')}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-300 italic leading-relaxed">"{report.comment}"</p>
            {(report.strength || report.to_improve) && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800">
                {report.strength && (
                  <div className="flex-1">
                    <div className="text-xs text-green-400 mb-1 flex items-center gap-1">
                      <FiCheckCircle size={10} />{t('evaluation.strengths')}
                    </div>
                    <p className="text-xs text-gray-400">{report.strength}</p>
                  </div>
                )}
                {report.to_improve && (
                  <div className="flex-1">
                    <div className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                      <FiTrendingUp size={10} />{t('evaluation.toImprove')}
                    </div>
                    <p className="text-xs text-gray-400">{report.to_improve}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Exercices individuels ── */}
        {!isLoading && myExercises.length > 0 && (
          <motion.div variants={iV} className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FaDumbbell style={{ fontSize: 13, color: '#c084fc' }} />
              {t('exercises.personalExercises')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myExercises.map((ex, i) => {
                const sCats = Array.isArray(ex.category) ? ex.category : [ex.category];
                const cat = getCat(sCats[0]);
                return (
                  <div key={i}
                    className="flex items-center gap-3 p-4 rounded-xl border"
                    style={{ background: 'rgba(144,43,209,.06)', borderColor: 'rgba(144,43,209,.2)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: cat.color + '15', color: cat.color }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{ex.name}</div>
                      <div className="text-xs text-gray-500 flex gap-2 mt-0.5 flex-wrap">
                        <span>{ex.duration}min</span>
                        {ex.sets && <span>{ex.sets}×{ex.reps}</span>}
                        <span style={{ color: cat.color }}>{getCatLabel(cat, t)}</span>
                      </div>
                      {ex.session && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {ex.session.title} · {new Date(ex.session.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', numberingSystem: 'latn' })}
                        </div>
                      )}
                    </div>
                    {ex.intensity && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                        style={
                          ex.intensity === 'high' ? { background: 'rgba(239,68,68,.12)', color: '#f87171' } :
                            ex.intensity === 'medium' ? { background: 'rgba(245,158,11,.12)', color: '#fbbf24' } :
                              { background: 'rgba(34,197,94,.12)', color: '#4ade80' }
                        }>
                        {ex.intensity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => navigate('/players/training')}
              className="mt-2 w-full text-center text-xs py-1.5 transition-colors"
              style={{ color: '#c084fc' }}>
              {t('exercises.viewAll')}
            </button>
          </motion.div>
        )}

        <motion.div variants={iV}>
          <h2 className="text-sm font-semibold text-white mb-3">{t('quickAccess.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: t('quickAccess.myTraining'), desc: t('quickAccess.myTrainingDesc'), path: '/players/training', icon: FaDumbbell },
              { label: t('quickAccess.performance'), desc: t('quickAccess.performanceDesc'), path: '/players/performance', icon: FiBarChart2 },
              { label: t('quickAccess.myProfile'), desc: t('quickAccess.myProfileDesc'), path: '/players/profile', icon: FiUser },
              { label: t('quickAccess.settings'), desc: t('quickAccess.settingsDesc'), path: '/players/settings', icon: FiSettings }
            ].map((a, i) => (
              <motion.div key={i} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(a.path)}
                className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 cursor-pointer border border-gray-700/50 hover:border-gray-600 transition-all group">
                <div className="flex flex-col items-center justify-center gap-2">
                  <a.icon size={24} className="text-indigo-400" />
                  <div className="text-sm font-semibold text-white mb-0.5 text-center">{a.label}</div>
                  <div className="text-xs text-gray-500 text-center">{a.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* ═══════════════════════════════════════════════════════
          PLAYER DETAIL MODAL — Coach-identical, read-only
      ═══════════════════════════════════════════════════════ */}
      {/* Universal Summary Modal */}
      <DayEventsModal
        showDayEventsModal={showDayEventsModal}
        setShowDayEventsModal={setShowDayEventsModal}
        selectedDay={selectedDay}
        calendarDays={weekStreak.map(d => ({ date: d.date, events: d.sessions }))}
        handleOpenDetail={handleOpenDetail}
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

export default PlayersDashboard;