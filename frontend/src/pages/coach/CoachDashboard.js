import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiEdit3, FiArrowRight,
  FiMapPin, FiClock, FiAlertTriangle,
  FiActivity, FiTrendingDown, FiRepeat,
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';
import API from '../api';
import { format, isToday, parseISO, startOfDay, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';
import EventDetailDrawer from '../../components/common/EventDetailDrawer';
import { useTranslation } from 'react-i18next';

const dateLocales = { en: enUS, fr, ar };

// ─── Category color map (keys only — labels come from i18n) ──────────────────
const CAT_COLORS = {
  technical: '#4fb0ff',
  tactical: '#f59e0b',
  physical: '#22c55e',
  mental: '#a855f7',
  match_prep: '#ef4444',
  recovery: '#14b8a6',
};

// catLabel is called inside the component where `t` is available
const catColor = (k) => CAT_COLORS[k] || '#4fb0ff';

const fmtTime = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const formatTimeRange = (start, end) => {
  const t1 = fmtTime(start);
  const t2 = fmtTime(end);
  if (t1 && t2 && t1 !== t2) return `${t1} – ${t2}`;
  return t1 || t2 || '';
};

const fmtDate = (dateStr, todayLabel) => {
  if (!dateStr) return '';
  const d = parseISO(dateStr);
  if (isToday(d)) return todayLabel;
  return format(d, 'EEE MMM d');
};

const scoreColor = (score) => {
  if (score >= 8) return '#4ade80';
  if (score >= 7) return '#4fb0ff';
  if (score >= 6) return '#f59e0b';
  return '#f87171';
};

// Force Western Arabic numerals regardless of locale
const toWestern = (num) =>
  String(num).replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) =>
    String(d.charCodeAt(0) - (d.charCodeAt(0) >= 0x06F0 ? 0x06F0 : 0x0660))
  );

// ═══════════════════════════════════════════════════════════════════════════════
const CoachDashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('coachdashboard');
  const isRtl = i18n.language === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [coachName, setCoachName] = useState('');
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);

  // Detail Drawer
  const [detailSession, setDetailSession] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleOpenDetail = async (s) => {
    setDetailSession(s);
    setIsDetailLoading(true);
    try {
      const endpoint = s._isEvent ? 'events' : 'trainings';
      const res = await API.get(`${endpoint}/${s.id}/`);
      setDetailSession({ ...res.data, _isEvent: s._isEvent });
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      try {
        const profileRes = await API.get('coachprofile/');
        const p = profileRes.data;
        setCoachName([p.first_name, p.last_name].filter(Boolean).join(' ') || p.username || 'Coach');
      } catch {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setCoachName(user?.username || 'Coach');
      }

      const currentMonth = format(new Date(), 'yyyy-MM');
      const [pRes, gRes, sRes, eRes, rRes, summaryRes] = await Promise.all([
        API.get('players/'),
        API.get('groups/'),
        API.get('trainings/'),
        API.get('events/').catch(() => ({ data: [] })),
        API.get(`reports/?month=${currentMonth}`),
        API.get(`reports/monthly-summary/?month=${currentMonth}`).catch(() => ({ data: null })),
      ]);

      const normalizedEvents = (eRes.data || []).map(evt => ({
        ...evt,
        _isEvent: true,
        category: evt.type === 'Meeting' ? 'mental' : 'match_prep',
        start_time: evt.date.split('T')[1].substring(0, 5),
        end_time: evt.date.split('T')[1].substring(0, 5),
        date: evt.date.split('T')[0],
      }));

      setPlayers(pRes.data);
      setGroups(gRes.data);
      setSessions([...sRes.data, ...normalizedEvents]);
      setReports(rRes.data);
      setMonthlySummary(summaryRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Computed ────────────────────────────────────────────────────────────────
  const today = startOfDay(new Date());

  const upcomingSessions = useMemo(() =>
    [...sessions]
      .filter(s => !isBefore(parseISO(s.date), today))
      .sort((a, b) => {
        const dd = parseISO(a.date) - parseISO(b.date);
        return dd !== 0 ? dd : (a.start_time || '').localeCompare(b.start_time || '');
      })
      .slice(0, 4),
    [sessions]); // eslint-disable-line

  const monthSessions = useMemo(() => {
    const ms = startOfMonth(new Date());
    const me = endOfMonth(new Date());
    return sessions.filter(s => {
      const d = parseISO(s.date);
      return d >= ms && d <= me;
    }).length;
  }, [sessions]);

  // ── Smart Alerts (built with t()) ──────────────────────────────────────────
  const alerts = useMemo(() => {
    const list = [];
    const injured = players.filter(p => p.status === 'Injured');
    if (injured.length > 0) {
      list.push({
        type: 'danger',
        icon: <FiAlertTriangle size={14} />,
        msg: injured.length === 1
          ? t('alertInjuredOne', { name: injured[0].full_name })
          : t('alertInjuredMany', { count: toWestern(injured.length) }),
        action: () => navigate('/coach/players'),
      });
    }
    const lowScore = reports.filter(r => r.overall_score < 6);
    if (lowScore.length > 0) {
      list.push({
        type: 'warning',
        icon: <FiTrendingDown size={14} />,
        msg: lowScore.length === 1
          ? t('alertLowScore', { count: toWestern(1) })
          : t('alertLowScorePlural', { count: toWestern(lowScore.length) }),
        action: () => navigate('/coach/players'),
      });
    }
    const lowAtt = reports.filter(r =>
      r.attendance_total > 0 && (r.attendance_present / r.attendance_total) < 0.8
    );
    if (lowAtt.length > 0) {
      list.push({
        type: 'warning',
        icon: <FiAlertTriangle size={14} />,
        msg: lowAtt.length === 1
          ? t('alertLowAttendance', { count: toWestern(1) })
          : t('alertLowAttendancePlural', { count: toWestern(lowAtt.length) }),
        action: () => navigate('/coach/players'),
      });
    }
    const notEvaluated = players.length - reports.length;
    if (notEvaluated > 0 && players.length > 0) {
      list.push({
        type: 'info',
        icon: <FiEdit3 size={14} />,
        msg: notEvaluated === 1
          ? t('alertNotEvaluated', { count: toWestern(1) })
          : t('alertNotEvaluatedPlural', { count: toWestern(notEvaluated) }),
        action: () => navigate('/coach/players'),
      });
    }
    return list.slice(0, 4);
  }, [players, reports, t]); // eslint-disable-line

  // ── Category label (i18n) ──────────────────────────────────────────────────
  const getCat = (k) => {
    const keyMap = {
      technical: 'catTechnical',
      tactical: 'catTactical',
      physical: 'catPhysical',
      mental: 'catMental',
      match_prep: 'catMatchPrep',
      recovery: 'catRecovery',
    };
    return {
      label: k && keyMap[k] ? t(keyMap[k]) : t('catSession'),
      color: catColor(k),
    };
  };

  // ── Quick actions ──────────────────────────────────────────────────────────
  const quickActions = [
    { titleKey: 'quickAction_myPlayers', descKey: 'quickAction_myPlayers_desc', icon: <FiUsers size={22} />, gradient: 'from-[#902bd1] to-[#4fb0ff]', path: '/coach/players' },
    { titleKey: 'quickAction_createTraining', descKey: 'quickAction_createTraining_desc', icon: <FaDumbbell style={{ fontSize: 22 }} />, gradient: 'from-[#00d0cb] to-[#4fb0ff]', path: '/coach/training' },
    { titleKey: 'quickAction_agenda', descKey: 'quickAction_agenda_desc', icon: <FiCalendar size={22} />, gradient: 'from-[#902bd1] to-[#00d0cb]', path: '/coach/agenda' },
    { titleKey: 'quickAction_kpiAnalysis', descKey: 'quickAction_kpiAnalysis_desc', icon: <FiActivity size={22} />, gradient: 'from-[#4fb0ff] to-[#902bd1]', path: '/coach/analysis' },
  ];

  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const iV = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  const Skeleton = () => <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse mx-auto" />;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      dir={isRtl ? 'rtl' : 'ltr'}
      initial="hidden" animate="visible" variants={cV}>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div variants={iV} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
            {t('dashboardTitle')}
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            {t('welcomeGreeting', {
              name: coachName || '...',
              date: format(new Date(), 'EEEE, MMMM d', { locale: dateLocales[i18n.language] || enUS }),
            })}
          </p>
        </motion.div>

        {/* ── Stats cards ── */}
        <motion.div variants={iV} className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
          {[
            { label: t('myPlayers'), value: players.length, color: '#4fb0ff' },
            { label: t('myGroups'), value: groups.length, color: '#00d0cb' },
            { label: t('sessionsThisMonth'), value: monthSessions, color: '#902bd1' },
            { label: t('reportsThisMonth'), value: reports.length, color: '#22c55e' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 text-center">
              {isLoading ? <Skeleton /> : (
                <div className="text-3xl font-bold" style={{ color: stat.color }}>
                  {toWestern(stat.value)}
                </div>
              )}
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Smart Alerts ── */}
        {!isLoading && alerts.length > 0 && (
          <motion.div variants={iV} className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-amber-400" />
              {t('smartAlerts')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.map((alert, i) => (
                <motion.div key={i} whileHover={{ scale: 1.01 }}
                  onClick={alert.action}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all"
                  style={
                    alert.type === 'danger'
                      ? { background: 'rgba(239,68,68,.08)', borderColor: 'rgba(239,68,68,.25)' }
                      : alert.type === 'warning'
                        ? { background: 'rgba(245,158,11,.08)', borderColor: 'rgba(245,158,11,.25)' }
                        : { background: 'rgba(79,176,255,.08)', borderColor: 'rgba(79,176,255,.25)' }
                  }>
                  <span style={{
                    color: alert.type === 'danger' ? '#f87171' : alert.type === 'warning' ? '#fbbf24' : '#60a5fa'
                  }}>
                    {alert.icon}
                  </span>
                  <span className="text-sm text-gray-300 flex-1">{alert.msg}</span>
                  <FiArrowRight
                    size={14}
                    className="text-gray-500"
                    style={isRtl ? { transform: 'scaleX(-1)' } : {}}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions ── */}
        <motion.div variants={iV} className="mb-10">
          <h2 className="text-2xl font-bold mb-5 bg-gradient-to-r from-[#4fb0ff] to-[#902bd1] bg-clip-text text-transparent inline-block">
            {t('quickActions')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {quickActions.map((action, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(action.path)}
                className="bg-gray-900/70 rounded-2xl p-6 cursor-pointer border border-gray-700/50 hover:border-gray-600 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white`}>
                  {action.icon}
                </div>
                <h3 className="text-base font-semibold mb-1">{t(action.titleKey)}</h3>
                <p className="text-gray-500 text-sm mb-3">{t(action.descKey)}</p>
                <div className="flex items-center text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                  {t('open')}
                  <FiArrowRight
                    className={isRtl ? 'mr-1.5' : 'ml-1.5'}
                    style={isRtl
                      ? { transform: 'scaleX(-1)', transition: 'transform 0.2s' }
                      : { transition: 'transform 0.2s' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Monthly Report Summary ── */}
        {!isLoading && monthlySummary && (
          <motion.div variants={iV} className="mb-10">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              <FiActivity className="text-[#4fb0ff]" />
              {t('monthlySummary', { month: format(new Date(), 'MMMM yyyy') })}
            </h2>
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {[
                  { label: t('playersEvaluated'), value: monthlySummary.evaluated || 0, color: '#4fb0ff', suffix: '' },
                  { label: t('averageScore'), value: monthlySummary.avg_overall || 0, color: scoreColor(monthlySummary.avg_overall || 0), suffix: '/10' },
                  { label: t('avgTechnical'), value: monthlySummary.avg_technical || 0, color: '#4fb0ff', suffix: '/10' },
                  { label: t('avgPhysical'), value: monthlySummary.avg_physical || 0, color: '#22c55e', suffix: '/10' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>
                      {toWestern(parseFloat(s.value).toFixed(1))}{s.suffix}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Alerts from backend summary */}
              {monthlySummary.alerts?.length > 0 && (
                <div className="space-y-2">
                  {monthlySummary.alerts.slice(0, 3).map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                      style={a.type === 'danger'
                        ? { background: 'rgba(239,68,68,.08)', color: '#f87171' }
                        : { background: 'rgba(245,158,11,.08)', color: '#fbbf24' }}>
                      <FiAlertTriangle size={11} />
                      <span className="font-medium">{a.player}</span>
                      <span className="text-gray-500">·</span>
                      <span>{a.msg}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3 flex-wrap">
                <button onClick={() => navigate('/coach/players')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  <FiEdit3 size={14} />{t('evaluatePlayers')}
                </button>
                <button onClick={() => navigate('/coach/analysis')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-300 bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50">
                  <FiActivity size={14} />{t('fullKpiAnalysis')}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Bottom 2 columns ── */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Upcoming sessions */}
          <motion.div variants={iV}>
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              <FiCalendar className="text-[#00d0cb]" />{t('upcomingSessions')}
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-900/50 rounded-xl animate-pulse" />)}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map(s => {
                  const cat = getCat(s.category);
                  const recur = s.recurrence && s.recurrence !== 'none';
                  const indiv = (s.exercises || []).filter(ex => ex.assigned_to && ex.assigned_to !== 'all');
                  return (
                    <motion.div key={s.id} whileHover={{ x: isRtl ? -4 : 4 }}
                      onClick={() => handleOpenDetail(s)}
                      className="bg-gray-900/70 p-4 rounded-xl border cursor-pointer transition-all"
                      style={{ borderColor: 'rgba(51,65,85,.5)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = cat.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(51,65,85,.5)'}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-white">{s.title}</span>
                            {recur && <FiRepeat size={11} className="text-purple-400" />}
                            {isToday(parseISO(s.date)) && (
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(0,208,203,.15)', color: '#00d0cb' }}>
                                {t('today')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <FiCalendar size={10} />{fmtDate(s.date, t('today'))}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock size={10} />{formatTimeRange(s.start_time, s.end_time)}
                            </span>
                            {s.location && (
                              <span className="flex items-center gap-1">
                                <FiMapPin size={10} />{s.location}
                              </span>
                            )}
                          </div>
                          {/* Groups */}
                          {s.groups_detail?.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {s.groups_detail.map(g => (
                                <span key={g.id} className="text-xs px-1.5 py-0.5 rounded"
                                  style={{ background: 'rgba(144,43,209,.15)', color: '#c084fc' }}>
                                  {g.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Exercises */}
                          {(s.exercises || []).length > 0 && (
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600">
                              <FaDumbbell style={{ fontSize: 10 }} />
                              {toWestern((s.exercises || []).length)} {t('exercises')}
                              {indiv.length > 0 && (
                                <span style={{ color: '#c084fc' }}>
                                  · {toWestern(indiv.length)} {t('individual')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: cat.color + '20', color: cat.color }}>
                            {cat.label}
                          </span>
                          <FiArrowRight
                            size={14}
                            className="text-gray-600"
                            style={isRtl ? { transform: 'scaleX(-1)' } : {}}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <button onClick={() => navigate('/coach/agenda')}
                  className="w-full text-center text-[#00d0cb] hover:text-[#4fb0ff] text-sm font-medium py-2 transition-colors">
                  {t('viewFullAgenda')}
                </button>
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-xl p-10 text-center border border-gray-700/50">
                <FiCalendar className="mx-auto text-4xl text-gray-600 mb-3" />
                <p className="text-gray-400">{t('noUpcomingSessions')}</p>
                <button onClick={() => navigate('/coach/training')}
                  className="mt-4 px-4 py-2 rounded-xl text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                  {t('createSession')}
                </button>
              </div>
            )}
          </motion.div>

          {/* My Players */}
          <motion.div variants={iV}>
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              <FiUsers className="text-[#4fb0ff]" />{t('myPlayersSection')}
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-gray-900/50 rounded-xl animate-pulse" />)}
              </div>
            ) : players.length > 0 ? (
              <div className="bg-gray-900/70 rounded-2xl border border-gray-700/50 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_minmax(60px,auto)] gap-2 px-4 py-3 bg-gray-800/70 text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div>{t('colName')}</div>
                  <div className="truncate">{t('colPosition')}</div>
                  <div className="truncate">{t('colGroup')}</div>
                  <div className={isRtl ? 'text-left' : 'text-right md:text-left'}>{t('colStatus')}</div>
                </div>
                {/* Rows */}
                {players.slice(0, 6).map((p, i) => {
                  const rep = reports.find(r => r.player === p.id);
                  return (
                    <div key={p.id || i}
                      className="grid grid-cols-[2fr_1fr_1fr_minmax(60px,auto)] gap-2 px-4 py-3.5 border-t border-gray-800 text-[11px] md:text-sm hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/coach/players')}>
                      {/* Name + avatar */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 relative overflow-hidden border border-gray-700/50">
                          {(p.profile_picture || p.photo_url) ? (
                            <img
                              src={p.profile_picture || p.photo_url}
                              alt={p.full_name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : null}
                          <span className="relative z-0">{p.full_name?.charAt(0)?.toUpperCase() || 'P'}</span>
                        </div>
                        <span className="font-medium text-white truncate">{p.full_name}</span>
                      </div>
                      {/* Position */}
                      <div className="text-gray-400 self-center truncate">{p.position || '—'}</div>
                      {/* Group */}
                      <div className="text-gray-400 self-center truncate">{p.group?.name || '—'}</div>
                      {/* Status / Score */}
                      <div className={`self-center ${isRtl ? 'text-left' : 'text-right md:text-left'}`}>
                        {p.status === 'Injured' ? (
                          <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 whitespace-nowrap">
                            {t('statusInjured')}
                          </span>
                        ) : p.status === 'On Leave' ? (
                          <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 whitespace-nowrap">
                            {t('statusOnLeave')}
                          </span>
                        ) : rep ? (
                          <span className="text-[11px] md:text-xs font-semibold whitespace-nowrap"
                            style={{ color: scoreColor(rep.overall_score) }}>
                            {toWestern(parseFloat(rep.overall_score).toFixed(1))}/10
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-800 text-center">
                  <button onClick={() => navigate('/coach/players')}
                    className="text-[#00d0cb] hover:text-[#4fb0ff] text-sm font-medium flex items-center gap-1 mx-auto transition-colors">
                    {t('viewAllPlayers', { count: toWestern(players.length) })}
                    <FiArrowRight size={14} style={isRtl ? { transform: 'scaleX(-1)' } : {}} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-xl p-10 text-center border border-gray-700/50">
                <FiUsers className="mx-auto text-4xl text-gray-600 mb-3" />
                <p className="text-gray-400">{t('noPlayers')}</p>
              </div>
            )}
          </motion.div>

        </div>
      </div>

      <EventDetailDrawer
        detailSession={detailSession}
        setDetailSession={setDetailSession}
        isDetailLoading={isDetailLoading}
        userType="coach"
        handleEditEvent={() => navigate('/coach/agenda')}
        setEventToDelete={() => navigate('/coach/agenda')}
      />
    </motion.div>
  );
};

export default CoachDashboard;