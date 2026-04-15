import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiActivity, FiClock, FiMapPin,
  FiAlertTriangle, FiCheckCircle, FiRepeat, FiAward,
  FiShield, FiTrendingUp,
} from 'react-icons/fi';
import { FaDumbbell, FaStar, FaRegStar, FaBolt, FaHeartbeat } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import {
  format, isToday, parseISO, startOfDay, isBefore,
  differenceInMinutes, differenceInHours,
} from 'date-fns';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORIES = {
  technical:  { label:'Technical',  color:'#4fb0ff' },
  tactical:   { label:'Tactical',   color:'#f59e0b' },
  physical:   { label:'Physical',   color:'#22c55e' },
  mental:     { label:'Mental',     color:'#a855f7' },
  match_prep: { label:'Match Prep', color:'#ef4444' },
  recovery:   { label:'Recovery',   color:'#14b8a6' },
};
const getCat = (k) => CATEGORIES[k] || { label:k||'Session', color:'#4fb0ff' };

const fmtTime = (t) => {
  if (!t) return '';
  const [h,m] = t.split(':').map(Number);
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
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
      {[1,2,3,4,5].map(i => i <= stars
        ? <FaStar key={i} style={{ fontSize:13, color:'#f59e0b' }}/>
        : <FaRegStar key={i} style={{ fontSize:13, color:'#334155' }}/>
      )}
    </div>
  );
};

// Countdown jusqu'à une session
const useCountdown = (session) => {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!session) return;
    const compute = () => {
      const now = new Date();
      const sessionDt = parseISO(`${session.date}T${session.start_time||'00:00'}`);
      const diffMin = differenceInMinutes(sessionDt, now);
      if (diffMin <= 0)      setLabel('In progress');
      else if (diffMin < 60) setLabel(`In ${diffMin}min`);
      else {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        setLabel(`In ${h}h${m > 0 ? ` ${m}min` : ''}`);
      }
    };
    compute();
    const t = setInterval(compute, 30000);
    return () => clearInterval(t);
  }, [session]);
  return label;
};

// Mini sparkline SVG (6 points)
const Sparkline = ({ data = [], color = '#4fb0ff' }) => {
  if (!data.length) return null;
  const vals = data.map(d => d.overall_score || 0);
  const min  = Math.min(...vals, 0);
  const max  = Math.max(...vals, 10);
  const range = max - min || 1;
  const w = 160, h = 36;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1 || 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow:'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round"/>
      {vals.map((v, i) => {
        const x = (i / (vals.length - 1 || 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return i === vals.length - 1
          ? <circle key={i} cx={x} cy={y} r="3" fill={color}/>
          : null;
      })}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
const PlayersDashboard = () => {
  const navigate = useNavigate();
  const { player, isLoading: playerLoading, playerName, photoUrl, playerInitial } = usePlayer();

  const [sessions,     setSessions]     = useState([]);
  const [report,       setReport]       = useState(null);
  const [history,      setHistory]      = useState([]);   // 6 derniers rapports
  const [groupAvg,     setGroupAvg]     = useState(null); // score moyen du groupe
  const [loadingData,  setLoadingData]  = useState(true);

  // ── Fetch data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!player) return;
    const load = async () => {
      setLoadingData(true);
      try {
        const month = format(new Date(), 'yyyy-MM');
        const [sRes, rRes, histRes] = await Promise.all([
          API.get('trainings/'),
          API.get(`reports/?month=${month}`),
          API.get(`reports/?player=${player.id}`).catch(() => ({ data: [] })),
        ]);
        setSessions(sRes.data);
        const myReport = rRes.data.find(r => r.player === player.id);
        setReport(myReport || null);
        // Historique trié par mois
        const sorted = [...histRes.data].sort((a,b) =>
          a.month > b.month ? 1 : -1
        ).slice(-6);
        setHistory(sorted);
        // Moyenne du groupe ce mois
        if (rRes.data.length > 0) {
          const scores = rRes.data.map(r => parseFloat(r.overall_score||0)).filter(Boolean);
          setGroupAvg(scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : null);
        }
      } catch { toast.error('Failed to load data'); }
      finally  { setLoadingData(false); }
    };
    load();
  }, [player]);

  // ── Prochaine session aujourd'hui ─────────────────────────────────────────
  const nextSession = useMemo(() => {
    if (!player?.group?.id) return null;
    const now   = new Date();
    const today = startOfDay(now);
    return [...sessions]
      .filter(s =>
        !isBefore(parseISO(s.date), today) &&
        s.groups_detail?.some(g => g.id === player.group.id)
      )
      .sort((a,b) => {
        const da = parseISO(`${a.date}T${a.start_time||'00:00'}`);
        const db = parseISO(`${b.date}T${b.start_time||'00:00'}`);
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
      .sort((a,b) => parseISO(a.date) - parseISO(b.date))
      .slice(0, 3);
  }, [sessions, player]);

  // ── Exercices individuels ─────────────────────────────────────────────────
  const myExercises = useMemo(() => {
    if (!player?.id) return [];
    const result = [];
    sessions.forEach(s => {
      (s.exercises || []).forEach(ex => {
        if (ex.assigned_to && String(ex.assigned_to) === String(player.id)) {
          result.push({ ...ex, session: s });
        }
      });
    });
    return result.slice(0, 4);
  }, [sessions, player]);

  // ── Streak cette semaine ──────────────────────────────────────────────────
  const weekStreak = useMemo(() => {
    const today  = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 6 }, (_, i) => {
      const d  = new Date(monday);
      d.setDate(monday.getDate() + i);
      const ds = format(d, 'yyyy-MM-dd');
      const hasSession = sessions.some(s =>
        s.date === ds && s.groups_detail?.some(g => g.id === player?.group?.id)
      );
      return {
        label: ['M','T','W','T','F','S'][i],
        date:  ds,
        isToday:  isToday(d),
        isPast:   isBefore(d, startOfDay(today)),
        hasSession,
        attended: hasSession && isBefore(d, new Date()),
      };
    });
  }, [sessions, player]);

  const streakCount = weekStreak.filter(d => d.attended).length;

  // ── Alertes ───────────────────────────────────────────────────────────────
  const alerts = useMemo(() => {
    const list = [];
    if (player?.status === 'Injured') {
      list.push({ type:'danger', msg:'You are currently marked as injured. Contact your coach.' });
    }
    if (report) {
      const attPct = report.attendance_total > 0
        ? (report.attendance_present / report.attendance_total) * 100 : 100;
      if (attPct < 75) {
        list.push({ type:'warning', msg:`Attendance this month is ${Math.round(attPct)}% — below 75%.` });
      }
      if (report.overall_score < 6) {
        list.push({ type:'warning', msg:`Your score this month is ${parseFloat(report.overall_score).toFixed(1)}/10. Keep pushing!` });
      }
    }
    return list;
  }, [player, report]);

  // ── Motivation message ────────────────────────────────────────────────────
  const motivation = useMemo(() => {
    if (!report) return { msg: 'Ready to train? Give your best today!', color:'#00d0cb' };
    const score = parseFloat(report.overall_score || 0);
    const goal  = parseFloat(report.objective || 8);
    const diff  = (goal - score).toFixed(1);
    if (score >= goal) return { msg: `You reached your goal of ${goal}/10. Outstanding!`, color:'#4ade80' };
    if (score >= 7)    return { msg: `You're at ${score}/10 — just ${diff} pts from your goal of ${goal}. Keep it up!`, color:'#4fb0ff' };
    return { msg: `Score: ${score}/10. Focus on training to reach your ${goal}/10 goal!`, color:'#f59e0b' };
  }, [report]);

  const cV = { hidden:{ opacity:0 }, visible:{ opacity:1, transition:{ staggerChildren:0.07 } } };
  const iV = { hidden:{ y:16, opacity:0 }, visible:{ y:0, opacity:1 } };
  const isLoading = playerLoading || loadingData;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right"/>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div variants={iV} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor:'rgba(0,208,203,.4)' }}>
                {photoUrl
                  ? <img src={photoUrl} alt={playerName} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                      {playerInitial}
                    </div>
                }
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                  Player Hub
                </h1>
                <p className="text-gray-400 mt-0.5 text-sm">
                  Welcome back, <span className="text-[#00d0cb] font-semibold">{playerName||'...'}</span>
                  {player?.position && <span className="text-gray-600"> · {player.position}</span>}
                  {player?.group?.name && <span className="text-gray-600"> · {player.group.name}</span>}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-600">{format(new Date(),'EEEE, MMMM d, yyyy')}</div>
          </div>
        </motion.div>

        {/* ── Alerts ── */}
        {!isLoading && alerts.length > 0 && (
          <motion.div variants={iV} className="mb-5 space-y-2">
            {alerts.map((a,i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
                style={a.type==='danger'
                  ? { background:'rgba(239,68,68,.08)', borderColor:'rgba(239,68,68,.25)', color:'#fca5a5' }
                  : { background:'rgba(245,158,11,.08)', borderColor:'rgba(245,158,11,.25)', color:'#fcd34d' }}>
                <FiAlertTriangle size={14} className="flex-shrink-0"/>
                {a.msg}
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Motivation banner ── */}
        <motion.div variants={iV}
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border mb-6"
          style={{ background:'rgba(15,23,42,.6)', borderColor:'rgba(51,65,85,.4)' }}>
          <FaBolt style={{ fontSize:14, color:motivation.color, flexShrink:0 }}/>
          <p className="text-sm" style={{ color: motivation.color }}>{motivation.msg}</p>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label:'Monthly score',
              value: report ? `${parseFloat(report.overall_score).toFixed(1)}/10` : '—',
              color: report ? scoreColor(report.overall_score) : '#64748b',
            },
            {
              label:'Attendance',
              value: report && report.attendance_total > 0
                ? `${Math.round((report.attendance_present/report.attendance_total)*100)}%`
                : '—',
              color:'#00d0cb',
            },
            { label:'My group',   value: player?.group?.name || '—', color:'#902bd1', sm:true },
            { label:'Position',   value: player?.position    || '—', color:'#f59e0b', sm:true },
          ].map((s,i) => (
            <div key={i} className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 text-center">
              {isLoading
                ? <div className="h-8 w-14 bg-gray-700/50 rounded animate-pulse mx-auto mb-2"/>
                : <div className={`font-bold ${s.sm ? 'text-lg' : 'text-2xl'}`} style={{ color:s.color }}>
                    {s.value}
                  </div>
              }
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Next session hero ── */}
        {!isLoading && nextSession && (
          <motion.div variants={iV}
            className="rounded-2xl p-5 border mb-6"
            style={{
              background:'linear-gradient(135deg,rgba(79,176,255,.08),rgba(0,208,203,.05))',
              borderColor:'rgba(79,176,255,.25)',
            }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#4fb0ff] uppercase tracking-wider">
                    {isToday(parseISO(nextSession.date)) ? 'Today\'s session' : 'Next session'}
                  </span>
                  {countdown && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background:'rgba(79,176,255,.15)', color:'#4fb0ff', border:'1px solid rgba(79,176,255,.3)' }}>
                      {countdown}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-white mb-1">{nextSession.title}</div>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <FiClock size={10}/>{fmtTime(nextSession.start_time)} – {fmtTime(nextSession.end_time)}
                  </span>
                  {nextSession.location && (
                    <span className="flex items-center gap-1">
                      <FiMapPin size={10}/>{nextSession.location}
                    </span>
                  )}
                  <span style={{ color:getCat(nextSession.category).color }}>
                    {getCat(nextSession.category).label}
                  </span>
                </div>
                {/* Exercices de la séance pour CE joueur */}
                {(() => {
                  const myExs = (nextSession.exercises||[]).filter(ex =>
                    ex.assigned_to && String(ex.assigned_to) === String(player?.id)
                  );
                  const grpExs = (nextSession.exercises||[]).filter(ex =>
                    !ex.assigned_to || ex.assigned_to === 'all'
                  );
                  return (myExs.length > 0 || grpExs.length > 0) ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {myExs.map((ex,i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(192,132,252,.15)', color:'#c084fc', border:'1px solid rgba(192,132,252,.25)' }}>
                          {ex.name} (personal)
                        </span>
                      ))}
                      {grpExs.slice(0,2).map((ex,i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(30,41,59,.6)', color:'#64748b', border:'1px solid #1e293b' }}>
                          {ex.name}
                        </span>
                      ))}
                      {grpExs.length > 2 && (
                        <span className="text-xs text-gray-600">+{grpExs.length - 2} more</span>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
              <button onClick={() => navigate('/players/training')}
                className="text-xs px-4 py-2 rounded-xl font-medium text-white flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#4fb0ff,#00d0cb)' }}>
                View details →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Cert médical ── */}
        {!isLoading && player?.medical_cert_valid !== undefined && (
          <motion.div variants={iV}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border mb-6"
            style={player.medical_cert_valid
              ? { background:'rgba(34,197,94,.06)', borderColor:'rgba(34,197,94,.2)' }
              : { background:'rgba(239,68,68,.06)', borderColor:'rgba(239,68,68,.2)' }}>
            <FaHeartbeat style={{ fontSize:13, color: player.medical_cert_valid ? '#4ade80' : '#f87171' }}/>
            <span className="text-xs" style={{ color: player.medical_cert_valid ? '#4ade80' : '#f87171' }}>
              {player.medical_cert_valid ? 'Medical certificate valid' : 'Medical certificate missing or expired'}
            </span>
          </motion.div>
        )}

        {/* ── 2 colonnes ── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* ── Rapport mensuel + sparkline ── */}
          <motion.div variants={iV}>
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FiActivity style={{ color:'#4fb0ff' }} size={14}/>
              {format(new Date(),'MMMM yyyy')} Report
            </h2>
            {isLoading ? (
              <div className="h-64 bg-gray-900/50 rounded-2xl animate-pulse"/>
            ) : report ? (
              <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50 space-y-4">
                {/* Overall + stars */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold" style={{ color:scoreColor(report.overall_score) }}>
                      {parseFloat(report.overall_score).toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">/10</span>
                  </div>
                  <StarRating score={report.overall_score}/>
                </div>

                {/* Piliers */}
                {[
                  { label:'Technical', value:report.technical_avg, color:'#4fb0ff' },
                  { label:'Tactical',  value:report.tactical_avg,  color:'#f59e0b' },
                  { label:'Physical',  value:report.physical_avg,  color:'#22c55e' },
                  { label:'Mental',    value:report.mental_avg,    color:'#a855f7' },
                ].map((p,i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{p.label}</span>
                      <span style={{ color:p.color }}>{parseFloat(p.value||0).toFixed(1)}/10</span>
                    </div>
                    <div className="w-full bg-gray-800/60 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width:`${(p.value||0)*10}%`, background:p.color }}/>
                    </div>
                  </div>
                ))}

                {/* Comparaison groupe */}
                {groupAvg && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                    <span className="text-gray-500">vs group average</span>
                    <span style={{
                      color: report.overall_score >= groupAvg ? '#4ade80' : '#f87171'
                    }}>
                      {report.overall_score >= groupAvg ? '+' : ''}
                      {(report.overall_score - groupAvg).toFixed(1)} pts
                      {report.overall_score >= groupAvg ? ' above' : ' below'}
                    </span>
                  </div>
                )}

                {/* Sparkline historique */}
                {history.length >= 2 && (
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Last {history.length} months</span>
                      {history.length >= 2 && (
                        <span style={{
                          color: history[history.length-1]?.overall_score >= history[history.length-2]?.overall_score
                            ? '#4ade80' : '#f87171'
                        }}>
                          {history[history.length-1]?.overall_score >= history[history.length-2]?.overall_score ? '↑' : '↓'} trend
                        </span>
                      )}
                    </div>
                    <Sparkline data={history} color={scoreColor(report.overall_score)}/>
                  </div>
                )}

                {/* Objectif */}
                {report.objective && (
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Goal: reach {report.objective}/10</span>
                      <span style={{ color:'#4fb0ff' }}>
                        {Math.min(100, Math.round((report.overall_score / report.objective) * 100))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800/60 rounded-full h-2">
                      <div className="h-2 rounded-full"
                        style={{
                          width:`${Math.min(100, (report.overall_score / report.objective) * 100)}%`,
                          background:'linear-gradient(90deg,#902bd1,#4fb0ff)',
                        }}/>
                    </div>
                  </div>
                )}

                <button onClick={() => navigate('/players/performance')}
                  className="w-full py-2 rounded-xl text-xs border transition-all"
                  style={{ color:'#00d0cb', borderColor:'rgba(0,208,203,.2)' }}>
                  View full report →
                </button>
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-2xl p-10 border border-gray-700/50 text-center">
                <FiActivity className="mx-auto text-4xl text-gray-600 mb-3"/>
                <p className="text-gray-400 text-sm">No report this month yet</p>
                <p className="text-gray-600 text-xs mt-1">Your coach will evaluate you soon</p>
              </div>
            )}
          </motion.div>

          {/* ── Streak + upcoming sessions ── */}
          <motion.div variants={iV} className="space-y-5">

            {/* Streak this week */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiTrendingUp style={{ color:'#22c55e' }} size={14}/>
                This week
              </h2>
              <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                <div className="flex gap-2 mb-3">
                  {weekStreak.map((d,i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs text-gray-600">{d.label}</div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={d.isToday
                          ? { background:'rgba(0,208,203,.15)', color:'#00d0cb', border:'1px solid rgba(0,208,203,.3)' }
                          : d.attended
                            ? { background:'rgba(34,197,94,.15)', color:'#4ade80', border:'1px solid rgba(34,197,94,.25)' }
                            : d.isPast && d.hasSession
                              ? { background:'rgba(239,68,68,.1)', color:'#f87171', border:'1px solid rgba(239,68,68,.2)' }
                              : d.hasSession
                                ? { background:'rgba(30,41,59,.5)', color:'#64748b', border:'1px solid #1e293b' }
                                : { background:'transparent', color:'#1e293b', border:'1px solid #1e293b' }
                        }>
                        {d.attended ? '✓' : d.hasSession ? '•' : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs" style={{ color: streakCount >= 3 ? '#4ade80' : '#64748b' }}>
                  {streakCount > 0 ? `${streakCount} session${streakCount > 1 ? 's' : ''} attended this week` : 'No sessions attended yet this week'}
                </div>
              </div>
            </div>

            {/* Upcoming sessions */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiCalendar style={{ color:'#00d0cb' }} size={14}/>
                Next sessions
              </h2>
              {isLoading ? (
                <div className="space-y-2">
                  {[1,2].map(i => <div key={i} className="h-14 bg-gray-900/50 rounded-xl animate-pulse"/>)}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-2">
                  {upcomingSessions.map(s => {
                    const cat   = getCat(s.category);
                    const recur = s.recurrence && s.recurrence !== 'none';
                    const todayS = isToday(parseISO(s.date));
                    return (
                      <div key={s.id}
                        className="flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                        style={{ background:'rgba(15,23,42,.5)', borderColor:'rgba(51,65,85,.4)' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:cat.color }}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-medium text-white truncate">{s.title}</span>
                            {recur && <FiRepeat size={9} className="text-purple-400 flex-shrink-0"/>}
                            {todayS && (
                              <span className="text-xs px-1 py-0.5 rounded"
                                style={{ background:'rgba(0,208,203,.15)', color:'#00d0cb', fontSize:9 }}>Today</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 flex gap-2">
                            <span>{todayS ? 'Today' : format(parseISO(s.date),'MMM d')}</span>
                            <span>{fmtTime(s.start_time)}</span>
                            {s.location && <span>{s.location}</span>}
                          </div>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background:cat.color+'15', color:cat.color }}>{cat.label}</span>
                      </div>
                    );
                  })}
                  <button onClick={() => navigate('/players/training')}
                    className="w-full text-center text-xs py-1.5 transition-colors"
                    style={{ color:'#00d0cb' }}>
                    View all →
                  </button>
                </div>
              ) : (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <p className="text-gray-500 text-xs">No upcoming sessions</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Coach message ── */}
        {!isLoading && report?.comment && (
          <motion.div variants={iV}
            className="rounded-2xl p-5 border mb-6"
            style={{ background:'rgba(144,43,209,.06)', borderColor:'rgba(144,43,209,.2)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                {report.coach_name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{report.coach_name || 'Your coach'}</div>
                <div className="text-xs text-gray-500">{report.month} — monthly evaluation</div>
              </div>
            </div>
            <p className="text-sm text-gray-300 italic leading-relaxed">"{report.comment}"</p>
            {(report.strength || report.to_improve) && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800">
                {report.strength && (
                  <div className="flex-1">
                    <div className="text-xs text-green-400 mb-1 flex items-center gap-1">
                      <FiCheckCircle size={10}/>Strengths
                    </div>
                    <p className="text-xs text-gray-400">{report.strength}</p>
                  </div>
                )}
                {report.to_improve && (
                  <div className="flex-1">
                    <div className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                      <FiTrendingUp size={10}/>To improve
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
              <FaDumbbell style={{ fontSize:13, color:'#c084fc' }}/>
              Personal exercises assigned to you
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myExercises.map((ex,i) => {
                const cat = getCat(ex.category);
                return (
                  <div key={i}
                    className="flex items-center gap-3 p-4 rounded-xl border"
                    style={{ background:'rgba(144,43,209,.06)', borderColor:'rgba(144,43,209,.2)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background:cat.color+'15', color:cat.color }}>{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{ex.name}</div>
                      <div className="text-xs text-gray-500 flex gap-2 mt-0.5 flex-wrap">
                        <span>{ex.duration}min</span>
                        {ex.sets && <span>{ex.sets}×{ex.reps}</span>}
                        <span style={{ color:cat.color }}>{cat.label}</span>
                      </div>
                      {ex.session && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {ex.session.title} · {format(parseISO(ex.session.date),'MMM d')}
                        </div>
                      )}
                    </div>
                    {ex.intensity && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                        style={
                          ex.intensity==='high'   ? { background:'rgba(239,68,68,.12)', color:'#f87171' } :
                          ex.intensity==='medium' ? { background:'rgba(245,158,11,.12)', color:'#fbbf24' } :
                                                    { background:'rgba(34,197,94,.12)', color:'#4ade80' }
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
              style={{ color:'#c084fc' }}>
              View all personal exercises →
            </button>
          </motion.div>
        )}

        {/* ── Quick access ── */}
        <motion.div variants={iV}>
          <h2 className="text-sm font-semibold text-white mb-3">Quick access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'My Training',  desc:'Sessions & exercises', path:'/players/training',    gradient:'linear-gradient(135deg,#902bd1,#4fb0ff)' },
              { label:'Performance',  desc:'Monthly report',       path:'/players/performance', gradient:'linear-gradient(135deg,#00d0cb,#4fb0ff)' },
              { label:'My Profile',   desc:'View & edit',          path:'/players/profile',     gradient:'linear-gradient(135deg,#902bd1,#00d0cb)' },
              { label:'Settings',     desc:'Account settings',     path:'/players/settings',    gradient:'linear-gradient(135deg,#4fb0ff,#902bd1)' },
            ].map((a,i) => (
              <motion.div key={i} whileHover={{ scale:1.04, y:-4 }} whileTap={{ scale:0.97 }}
                onClick={() => navigate(a.path)}
                className="bg-gray-900/70 rounded-2xl p-5 cursor-pointer border border-gray-700/50 hover:border-gray-600 transition-all group">
                <div className="w-10 h-10 rounded-xl mb-3 group-hover:scale-110 transition-transform"
                  style={{ background:a.gradient }}/>
                <div className="text-sm font-semibold text-white mb-0.5">{a.label}</div>
                <div className="text-xs text-gray-500">{a.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default PlayersDashboard;