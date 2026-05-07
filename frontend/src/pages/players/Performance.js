import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity, FiChevronDown, FiChevronUp,
  FiTrendingUp, FiBook, FiCheckCircle, FiDownload,
} from 'react-icons/fi';
import { FaStar, FaRegStar, FaHeartbeat } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import useReportPDF from '../coach/playermanagement/hooks/useReportPDF';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (s) => {
  if (!s && s !== 0) return '#64748b';
  if (s >= 8) return '#4ade80';
  if (s >= 7) return '#4fb0ff';
  if (s >= 6) return '#f59e0b';
  return '#f87171';
};

const fmt = (v, digits = 1) =>
  v !== null && v !== undefined ? parseFloat(v).toFixed(digits) : '—';

const StarRating = ({ score, max = 10 }) => {
  const stars = Math.round((score / max) * 5);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i =>
        i <= stars
          ? <FaStar key={i} style={{ fontSize:13, color:'#f59e0b' }}/>
          : <FaRegStar key={i} style={{ fontSize:13, color:'#334155' }}/>
      )}
    </div>
  );
};

// ── Radar SVG ─────────────────────────────────────────────────────────────────
const RadarChart = ({ player, group }) => {
  const labels = ['Technical','Tactical','Physical','Mental','Health','School'];
  const colors = ['#4fb0ff','#f59e0b','#22c55e','#a855f7','#ef4444','#ec4899'];
  const cx = 130, cy = 110, r = 80;
  const angles = labels.map((_,i) => (Math.PI * 2 * i) / 6 - Math.PI / 2);

  const toXY = (val, angle) => ({
    x: cx + (val / 10) * r * Math.cos(angle),
    y: cy + (val / 10) * r * Math.sin(angle),
  });

  const playerVals = [
    parseFloat(player?.technical_avg||0),
    parseFloat(player?.tactical_avg||0),
    parseFloat(player?.physical_avg||0),
    parseFloat(player?.mental_avg||0),
    (() => {
      const f = player?.fatigue_level ? Math.max(0,(6-player.fatigue_level)*2) : 0;
      const s = player?.sleep_quality ? player.sleep_quality*2 : 0;
      return (player?.fatigue_level||player?.sleep_quality) ? (f+s)/2 : 0;
    })(),
    (() => {
      const g = player?.school_grade_avg ? parseFloat((player.school_grade_avg/2).toFixed(1)) : 0;
      const a = player?.school_attendance ? parseFloat((player.school_attendance/10).toFixed(1)) : 0;
      return (g||a) ? (g+a)/2 : 0;
    })(),
  ];

  const groupVals = group
    ? [group.technical_avg||6.8, group.tactical_avg||6.8, group.physical_avg||6.8, group.mental_avg||6.8, 6.5, 7.0]
    : [6.8,6.8,6.8,6.8,6.5,7.0];

  const rings = [2,4,6,8,10];

  const playerPts = angles.map((a,i) => { const p=toXY(playerVals[i],a); return `${p.x},${p.y}`; }).join(' ');
  const groupPts  = angles.map((a,i) => { const p=toXY(groupVals[i],a); return `${p.x},${p.y}`; }).join(' ');

  return (
    <svg viewBox="0 0 260 230" width="100%" style={{ maxHeight:220 }}>
      {rings.map(rv => (
        <polygon key={rv}
          points={angles.map(a => { const p=toXY(rv,a); return `${p.x},${p.y}`; }).join(' ')}
          fill="none" stroke="#1e293b" strokeWidth="0.5"/>
      ))}
      {angles.map((a,i) => {
        const p = toXY(10,a);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1e293b" strokeWidth="0.5"/>;
      })}
      <polygon points={groupPts} fill="rgba(51,65,85,.15)" stroke="#475569" strokeWidth="1" strokeDasharray="3,2"/>
      <polygon points={playerPts} fill="rgba(79,176,255,.12)" stroke="#4fb0ff" strokeWidth="2"/>
      {angles.map((a,i) => {
        const p = toXY(playerVals[i],a);
        return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={colors[i]}/>;
      })}
      {labels.map((lbl,i) => {
        const p = toXY(11.5, angles[i]);
        const anchor = p.x < cx-5 ? 'end' : p.x > cx+5 ? 'start' : 'middle';
        return (
          <g key={i}>
            <text x={p.x} y={p.y} textAnchor={anchor} fontSize="9" fill={colors[i]} fontWeight="600">{lbl}</text>
            <text x={p.x} y={p.y+10} textAnchor={anchor} fontSize="9" fill={colors[i]} opacity=".8">{fmt(playerVals[i])}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Sparkline ─────────────────────────────────────────────────────────────────
const Sparkline = ({ data = [], color = '#4fb0ff', height = 40 }) => {
  if (data.length < 2) return null;
  const vals  = data.map(d => parseFloat(d.overall_score||0));
  const min   = Math.min(...vals);
  const max   = Math.max(...vals);
  const range = max - min || 1;
  const w = 300;
  const pts = vals.map((v,i) => {
    const x = (i/(vals.length-1))*w;
    const y = height - ((v-min)/range)*(height-6) - 3;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" style={{ height }}>
      <polygon points={`0,${height} ${pts} ${w},${height}`} fill={color+'12'}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      {vals.map((v,i) => {
        const x = (i/(vals.length-1))*w;
        const y = height - ((v-min)/range)*(height-6) - 3;
        return i===vals.length-1
          ? <circle key={i} cx={x} cy={y} r="3.5" fill={color}/>
          : <circle key={i} cx={x} cy={y} r="2" fill={color} opacity=".6"/>;
      })}
    </svg>
  );
};

// ── Multi-line chart ──────────────────────────────────────────────────────────
const MultiLineChart = ({ data = [] }) => {
  if (data.length < 2) return null;
  const LINES = [
    { key:'technical_avg', color:'#4fb0ff', label:'Technical' },
    { key:'tactical_avg',  color:'#f59e0b', label:'Tactical'  },
    { key:'physical_avg',  color:'#22c55e', label:'Physical'  },
    { key:'mental_avg',    color:'#a855f7', label:'Mental'    },
  ];
  const w = 300, h = 100;
  const toY = (v) => h - ((parseFloat(v||0)-0)/(10-0))*(h-8) - 4;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h+20}`} width="100%" style={{ height:h+20 }}>
        {[2,4,6,8,10].map(v => (
          <line key={v} x1="0" y1={toY(v)} x2={w} y2={toY(v)}
            stroke="#1e293b" strokeWidth={v===6?'1':'0.5'} strokeDasharray={v===6?'':'3,2'}/>
        ))}
        {LINES.map(line => {
          const pts = data.map((d,i) => {
            const x = (i/(data.length-1))*w;
            const y = toY(d[line.key]||0);
            return `${x},${y}`;
          }).join(' ');
          return <polyline key={line.key} points={pts} fill="none"
            stroke={line.color} strokeWidth="2" strokeLinejoin="round"/>;
        })}
        {data.map((d,i) => {
          const x = (i/(data.length-1))*w;
          return (
            <text key={i} x={x} y={h+16} textAnchor="middle"
              fontSize="8" fill="#475569">
              {d.month?.slice(5)}
            </text>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {LINES.map(l => (
          <div key={l.key} className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ background:l.color }}/>
            <span className="text-xs text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
const Performance = () => {
  const navigate = useNavigate();
  const { player, isLoading: playerLoading, playerName } = usePlayer();
  const { generatePDF, isGenerating } = useReportPDF();

  const [tab,           setTab]           = useState('report');
  const [report,        setReport]        = useState(null);
  const [history,       setHistory]       = useState([]);
  const [groupAvg,      setGroupAvg]      = useState(null);
  const [groupReports,  setGroupReports]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [expandedPillar,setExpandedPillar]= useState(null);
  const [expandedMonth, setExpandedMonth] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!player) return;
    const load = async () => {
      setLoading(true);
      try {
        const month = format(new Date(), 'yyyy-MM');
        const [rRes, histRes, grpRes] = await Promise.all([
          API.get(`reports/?month=${month}`),
          API.get(`reports/?player=${player.id}`).catch(()=>({ data:[] })),
          API.get(`reports/?month=${month}`).catch(()=>({ data:[] })),
        ]);
        const myReport = rRes.data.find(r => r.player === player.id);
        setReport(myReport || null);
        const sorted = [...histRes.data].sort((a,b)=>a.month>b.month?1:-1);
        setHistory(sorted);
        setGroupReports(grpRes.data);
        if (grpRes.data.length > 0) {
          const scores = grpRes.data.map(r=>parseFloat(r.overall_score||0)).filter(Boolean);
          setGroupAvg(scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : null);
        }
      } catch { toast.error('Failed to load performance data'); }
      finally  { setLoading(false); }
    };
    load();
  }, [player]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const rankInGroup = useMemo(() => {
    if (!report || groupReports.length < 2) return null;
    const sorted = [...groupReports].sort((a,b)=>parseFloat(b.overall_score||0)-parseFloat(a.overall_score||0));
    const idx    = sorted.findIndex(r => r.player === player?.id);
    if (idx < 0) return null;
    return { rank:idx+1, total:sorted.length, pct:Math.round(((idx+1)/sorted.length)*100) };
  }, [report, groupReports, player]);

  const prevReport = history.length >= 2 ? history[history.length-2] : null;
  const delta      = report && prevReport
    ? parseFloat(report.overall_score||0) - parseFloat(prevReport.overall_score||0)
    : null;

  const devAreas = useMemo(() => {
    if (!report) return { strengths:[], toImprove:[] };
    const all = {
      ...report.technical_scores,
      ...report.tactical_scores,
      ...report.physical_scores,
      ...report.mental_scores,
    };
    const items = Object.entries(all)
      .map(([k,v]) => ({ label:k, score:parseFloat(v||0) }))
      .filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score);
    return { strengths: items.slice(0,3), toImprove: items.slice(-3).reverse() };
  }, [report]);

  const cV = { hidden:{opacity:0}, visible:{opacity:1,transition:{staggerChildren:0.07}} };
  const iV = { hidden:{y:16,opacity:0}, visible:{y:0,opacity:1} };
  const isLoading = loading || playerLoading;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right"/>
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <motion.div variants={iV} className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                Performance Report
              </h1>
              <p className="text-gray-400 mt-1 text-sm">Monthly evaluation · Player & parent view</p>
            </div>
            {/* Export PDF button */}
            {!isLoading && report && (
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                onClick={() => generatePDF(report, player, player?.academy?.name)}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                {isGenerating
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  : <FiDownload size={14}/>}
                {isGenerating ? 'Generating...' : 'Export PDF'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={iV}
          className="flex bg-gray-900/70 border border-gray-700/50 rounded-xl overflow-hidden mb-6">
          {[
            { key:'report',   label:'Report'      },
            { key:'progress', label:'Progression' },
            { key:'history',  label:'History'     },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-3 text-sm font-semibold transition-all"
              style={tab===t.key
                ? { background:'rgba(79,176,255,.2)', color:'#4fb0ff', borderBottom:'2px solid #4fb0ff' }
                : { color:'#64748b' }}>
              {t.label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00d0cb]"/>
          </div>
        ) : (
          <>
            {/* ══════════════════ REPORT ══════════════════ */}
            {tab === 'report' && (
              <motion.div variants={iV} className="space-y-5">
                {!report ? (
                  <div className="bg-gray-900/50 rounded-2xl p-16 border border-gray-700/50 text-center">
                    <FiActivity className="mx-auto text-5xl text-gray-600 mb-4"/>
                    <p className="text-white text-lg">No report this month yet</p>
                    <p className="text-gray-500 text-sm mt-2">Your coach will evaluate you soon</p>
                  </div>
                ) : (
                  <>
                    {/* Hero */}
                    <div className="rounded-2xl p-5 border"
                      style={{ background:'linear-gradient(135deg,rgba(144,43,209,.1),rgba(0,208,203,.06))', borderColor:'rgba(0,208,203,.2)' }}>
                      <div className="flex items-center gap-5 flex-wrap">
                        <div className="w-20 h-20 rounded-full border-3 flex flex-col items-center justify-center flex-shrink-0"
                          style={{ border:`3px solid ${scoreColor(report.overall_score)}`, background:scoreColor(report.overall_score)+'10' }}>
                          <div className="text-3xl font-bold" style={{ color:scoreColor(report.overall_score) }}>
                            {fmt(report.overall_score)}
                          </div>
                          <div className="text-xs text-gray-500">/10</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-bold text-white mb-1">{playerName} · {report.month}</div>
                          <div className="text-xs text-gray-500 mb-2">{player?.position} · {player?.group?.name}</div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {groupAvg && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={report.overall_score >= groupAvg
                                  ? { background:'rgba(74,222,128,.12)', color:'#4ade80', border:'1px solid rgba(74,222,128,.2)' }
                                  : { background:'rgba(248,113,113,.12)', color:'#f87171', border:'1px solid rgba(248,113,113,.2)' }}>
                                {report.overall_score >= groupAvg ? '+' : ''}{fmt(report.overall_score - groupAvg)} vs group avg
                              </span>
                            )}
                            {delta !== null && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={delta >= 0
                                  ? { background:'rgba(79,176,255,.12)', color:'#4fb0ff', border:'1px solid rgba(79,176,255,.2)' }
                                  : { background:'rgba(248,113,113,.12)', color:'#f87171', border:'1px solid rgba(248,113,113,.2)' }}>
                                {delta >= 0 ? '↑ +' : '↓ '}{fmt(delta)} vs last month
                              </span>
                            )}
                            {rankInGroup && (
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background:'rgba(144,43,209,.15)', color:'#c084fc', border:'1px solid rgba(144,43,209,.25)' }}>
                                Top {rankInGroup.pct}% of group
                              </span>
                            )}
                          </div>
                          <StarRating score={report.overall_score}/>
                        </div>
                      </div>
                    </div>

                    {/* Radar */}
                    <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Player profile</span>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-[#4fb0ff] rounded"/>Player</span>
                          <span className="flex items-center gap-1.5"><div className="w-4 h-0" style={{ borderTop:'1px dashed #475569' }}/>Group avg</span>
                        </div>
                      </div>
                      <RadarChart player={report} group={groupAvg ? { technical_avg:groupAvg, tactical_avg:groupAvg, physical_avg:groupAvg, mental_avg:groupAvg } : null}/>
                    </div>

                    {/* 4 Piliers expandables */}
                    <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">4 Pillars</span>
                        <span className="text-xs text-gray-600">Tap to expand criteria</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { key:'technical', label:'Technical', avg:report.technical_avg, scores:report.technical_scores, color:'#4fb0ff' },
                          { key:'tactical',  label:'Tactical',  avg:report.tactical_avg,  scores:report.tactical_scores,  color:'#f59e0b' },
                          { key:'physical',  label:'Physical',  avg:report.physical_avg,  scores:report.physical_scores,  color:'#22c55e' },
                          { key:'mental',    label:'Mental',    avg:report.mental_avg,    scores:report.mental_scores,    color:'#a855f7' },
                        ].map(p => {
                          const expanded  = expandedPillar === p.key;
                          const prevAvg   = prevReport ? parseFloat(prevReport[`${p.key}_avg`]||0) : null;
                          const pDelta    = prevAvg !== null ? parseFloat(p.avg||0) - prevAvg : null;
                          const criteria  = p.scores ? Object.entries(p.scores) : [];
                          return (
                            <div key={p.key}>
                              <div className="flex items-center gap-3 cursor-pointer py-1"
                                onClick={() => setExpandedPillar(expanded ? null : p.key)}>
                                <div className="text-xs text-gray-400 w-16 flex-shrink-0">{p.label}</div>
                                <div className="flex-1 h-2 bg-gray-800/60 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all"
                                    style={{ width:`${(parseFloat(p.avg||0))*10}%`, background:p.color }}/>
                                </div>
                                <div className="text-sm font-bold w-8 text-right" style={{ color:p.color }}>{fmt(p.avg)}</div>
                                {pDelta !== null && (
                                  <div className="text-xs w-10 text-right"
                                    style={{ color:pDelta>=0?'#4ade80':'#f87171' }}>
                                    {pDelta>=0?'+':''}{fmt(pDelta)}
                                  </div>
                                )}
                                {criteria.length > 0 && (
                                  expanded
                                    ? <FiChevronUp size={13} className="text-gray-500"/>
                                    : <FiChevronDown size={13} className="text-gray-500"/>
                                )}
                              </div>
                              <AnimatePresence>
                                {expanded && criteria.length > 0 && (
                                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                                    exit={{ height:0, opacity:0 }} className="overflow-hidden">
                                    <div className="ml-16 mt-1 mb-2 flex flex-wrap gap-1.5">
                                      {criteria.map(([k,v]) => (
                                        <span key={k} className="text-xs px-2 py-0.5 rounded-full"
                                          style={{ background:p.color+'15', color:p.color }}>
                                          {k.replace(/_/g,' ')} {fmt(v)}
                                        </span>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Development areas */}
                    {(devAreas.strengths.length > 0 || devAreas.toImprove.length > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/70 rounded-2xl p-4 border border-gray-700/50">
                          <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">Top strengths</div>
                          <div className="space-y-2">
                            {devAreas.strengths.map((item,i) => (
                              <div key={i} className="flex items-center gap-2 p-2 rounded-xl"
                                style={{ background:'rgba(34,197,94,.06)' }}>
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background:'rgba(34,197,94,.2)', color:'#4ade80' }}>{i+1}</div>
                                <span className="text-xs text-gray-300 flex-1 truncate capitalize">{item.label.replace(/_/g,' ')}</span>
                                <span className="text-xs font-bold" style={{ color:'#4ade80' }}>{fmt(item.score)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-900/70 rounded-2xl p-4 border border-gray-700/50">
                          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">To improve</div>
                          <div className="space-y-2">
                            {devAreas.toImprove.map((item,i) => (
                              <div key={i} className="flex items-center gap-2 p-2 rounded-xl"
                                style={{ background:'rgba(245,158,11,.06)' }}>
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background:'rgba(245,158,11,.2)', color:'#f59e0b' }}>{i+1}</div>
                                <span className="text-xs text-gray-300 flex-1 truncate capitalize">{item.label.replace(/_/g,' ')}</span>
                                <span className="text-xs font-bold" style={{ color:scoreColor(item.score) }}>{fmt(item.score)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Health + School + Attendance */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Health */}
                      <div className="bg-gray-900/70 rounded-2xl p-4 border border-gray-700/50">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <FaHeartbeat style={{ fontSize:11 }}/>Health
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Fatigue</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full"
                                  style={{ background: i<=(report.fatigue_level||0)?'#f59e0b':'#1e293b' }}/>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Sleep</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full"
                                  style={{ background: i<=(report.sleep_quality||0)?'#4fb0ff':'#1e293b' }}/>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Injury</span>
                            <span style={{ color:report.is_injured?'#f87171':'#4ade80' }}>
                              {report.is_injured ? 'Injured' : 'None'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Med cert</span>
                            <span style={{ color:report.medical_cert_valid?'#4ade80':'#f87171' }}>
                              {report.medical_cert_valid ? 'Valid' : 'Invalid'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* School */}
                      <div className="bg-gray-900/70 rounded-2xl p-4 border border-gray-700/50">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <FiBook size={11}/>School
                        </div>
                        <div className="space-y-2">
                          {report.school_grade_avg != null && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Grade</span>
                              <span className="font-bold" style={{ color:scoreColor(report.school_grade_avg/2) }}>
                                {fmt(report.school_grade_avg)}/20
                              </span>
                            </div>
                          )}
                          {report.school_attendance != null && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Attendance</span>
                              <span className="font-bold" style={{ color:report.school_attendance>=80?'#4ade80':'#f87171' }}>
                                {Math.round(report.school_attendance)}%
                              </span>
                            </div>
                          )}
                          {report.school_behaviour != null && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Behaviour</span>
                              <span className="font-bold" style={{ color:scoreColor(report.school_behaviour) }}>
                                {fmt(report.school_behaviour,0)}/10
                              </span>
                            </div>
                          )}
                          {!report.school_grade_avg && !report.school_attendance && !report.school_behaviour && (
                            <p className="text-xs text-gray-600">No data</p>
                          )}
                        </div>
                      </div>

                      {/* Attendance */}
                      <div className="bg-gray-900/70 rounded-2xl p-4 border border-gray-700/50">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <FiCheckCircle size={11}/>Attendance
                        </div>
                        <div className="text-xl font-bold mb-0.5" style={{ color:'#00d0cb' }}>
                          {report.attendance_total > 0
                            ? `${Math.round((report.attendance_present/report.attendance_total)*100)}%`
                            : '—'}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {report.attendance_present}/{report.attendance_total} sessions
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length:report.attendance_total||0 }, (_,i) => (
                            <div key={i} className="w-2 h-2 rounded-full"
                              style={{ background:i<report.attendance_present?'#4ade80':'#f87171' }}/>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sparkline */}
                    {history.length >= 2 && (
                      <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {history.length}-month progression
                          </span>
                          {history.length >= 2 && (() => {
                            const first = parseFloat(history[0].overall_score||0);
                            const last  = parseFloat(history[history.length-1].overall_score||0);
                            const diff  = last - first;
                            return (
                              <span className="text-xs font-bold" style={{ color:diff>=0?'#4ade80':'#f87171' }}>
                                {diff>=0?'↑ +':'↓ '}{fmt(diff)} pts
                              </span>
                            );
                          })()}
                        </div>
                        <Sparkline data={history} color={scoreColor(report.overall_score)}/>
                        <div className="flex justify-between mt-1">
                          {history.map((h,i) => (
                            <span key={i} className="text-gray-600" style={{ fontSize:9 }}>{h.month?.slice(5)}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coach message */}
                    <div className="rounded-2xl p-5 border"
                      style={{ background:'rgba(144,43,209,.06)', borderColor:'rgba(144,43,209,.2)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                          style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
                          {report.coach_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{report.coach_name || 'Your coach'}</div>
                          <div className="text-xs text-gray-500">{report.month} — monthly evaluation</div>
                        </div>
                      </div>
                      {report.comment && (
                        <div className="text-sm text-gray-300 italic leading-relaxed mb-3 p-3 rounded-xl"
                          style={{ background:'rgba(15,23,42,.6)', borderLeft:'2px solid rgba(144,43,209,.4)' }}>
                          "{report.comment}"
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {report.strength && (
                          <div className="p-3 rounded-xl" style={{ background:'rgba(15,23,42,.6)' }}>
                            <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Strengths</div>
                            <p className="text-xs text-gray-400 leading-relaxed">{report.strength}</p>
                          </div>
                        )}
                        {report.to_improve && (
                          <div className="p-3 rounded-xl" style={{ background:'rgba(15,23,42,.6)' }}>
                            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">To improve</div>
                            <p className="text-xs text-gray-400 leading-relaxed">{report.to_improve}</p>
                          </div>
                        )}
                      </div>
                      {report.objective && (
                        <div className="p-3 rounded-xl" style={{ background:'rgba(15,23,42,.6)' }}>
                          <div className="text-xs font-bold text-[#4fb0ff] uppercase tracking-wider mb-2">Monthly goal</div>
                          <p className="text-xs text-gray-300 mb-2">{report.objective}</p>
                          <div className="h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width:`${Math.min(100,(parseFloat(report.overall_score||0)/10)*100)}%`, background:'linear-gradient(90deg,#902bd1,#4fb0ff)' }}/>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ══════════════════ PROGRESSION ══════════════════ */}
            {tab === 'progress' && (
              <motion.div variants={iV} className="space-y-5">
                {history.length < 2 ? (
                  <div className="bg-gray-900/50 rounded-2xl p-16 border border-gray-700/50 text-center">
                    <FiTrendingUp className="mx-auto text-5xl text-gray-600 mb-4"/>
                    <p className="text-gray-400">Not enough data yet</p>
                    <p className="text-gray-600 text-sm mt-1">At least 2 monthly reports are needed</p>
                  </div>
                ) : (
                  <>
                    {/* Multi-line chart */}
                    <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Pillar progression — {history.length} months
                      </div>
                      <MultiLineChart data={history}/>
                    </div>

                    {/* Trend per pillar */}
                    <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        {history.length}-month trends
                      </div>
                      <div className="space-y-3">
                        {[
                          { key:'physical_avg',  label:'Physical',  color:'#22c55e' },
                          { key:'technical_avg', label:'Technical', color:'#4fb0ff' },
                          { key:'mental_avg',    label:'Mental',    color:'#a855f7' },
                          { key:'tactical_avg',  label:'Tactical',  color:'#f59e0b' },
                        ].map(p => {
                          const first = parseFloat(history[0][p.key]||0);
                          const last  = parseFloat(history[history.length-1][p.key]||0);
                          const diff  = last - first;
                          return (
                            <div key={p.key} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:p.color }}/>
                              <div className="text-xs text-gray-400 w-16 flex-shrink-0">{p.label}</div>
                              <div className="flex-1 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width:`${last*10}%`, background:p.color }}/>
                              </div>
                              <div className="text-xs font-bold w-8 text-right" style={{ color:p.color }}>{fmt(last)}</div>
                              <div className="text-xs font-bold w-14 text-right"
                                style={{ color:diff>=0?'#4ade80':'#f87171' }}>
                                {diff>=0?'↑ +':'↓ '}{fmt(diff)} pts
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Radar comparatif */}
                    {history.length >= 2 && (
                      <div className="bg-gray-900/70 rounded-2xl p-5 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Profile comparison</span>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-[#4fb0ff] rounded"/>{history[history.length-1].month}</span>
                            <span className="flex items-center gap-1.5"><div className="w-4 h-0" style={{ borderTop:'1px dashed #475569' }}/>{history[0].month}</span>
                          </div>
                        </div>
                        <RadarChart player={history[history.length-1]} group={history[0]}/>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ══════════════════ HISTORY ══════════════════ */}
            {tab === 'history' && (
              <motion.div variants={iV} className="space-y-2">
                {history.length === 0 ? (
                  <div className="bg-gray-900/50 rounded-2xl p-16 border border-gray-700/50 text-center">
                    <p className="text-gray-400">No reports yet</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-4">
                      {history.length} monthly report{history.length>1?'s':''} · Tap a month to see details
                    </p>
                    {history.length >= 2 && (
                      <div className="bg-gray-900/70 rounded-2xl p-4 border border-gray-700/50 mb-4">
                        <Sparkline data={[...history].reverse()} color="#4fb0ff" height={48}/>
                        <div className="flex justify-between mt-1">
                          {[...history].reverse().map((h,i) => (
                            <span key={i} style={{ fontSize:9, color:'#475569' }}>{h.month?.slice(5)}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {[...history].reverse().map((h,i) => {
                      const sc    = parseFloat(h.overall_score||0);
                      const prev  = i < history.length-1 ? parseFloat([...history].reverse()[i+1]?.overall_score||0) : null;
                      const delta = prev !== null ? sc - prev : null;
                      const exp   = expandedMonth === h.month;
                      return (
                        <div key={h.month}>
                          <div className="flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all"
                            style={{
                              background: exp?'rgba(79,176,255,.06)':'rgba(15,23,42,.6)',
                              borderColor: exp?'rgba(79,176,255,.3)':'rgba(30,41,59,.8)',
                            }}
                            onClick={() => setExpandedMonth(exp ? null : h.month)}>
                            <div className="text-sm font-semibold text-white w-16 flex-shrink-0">{h.month}</div>
                            <div className="flex-1 h-2 bg-gray-800/60 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width:`${sc*10}%`, background:scoreColor(sc) }}/>
                            </div>
                            <div className="text-sm font-bold w-8 text-right" style={{ color:scoreColor(sc) }}>{fmt(sc)}</div>
                            <div className="text-xs w-8 text-right"
                              style={{ color:delta===null?'#64748b':delta>0?'#4ade80':delta<0?'#f87171':'#64748b' }}>
                              {delta===null?'—':delta>0?`+${fmt(delta)}`:fmt(delta)}
                            </div>
                            {/* Export PDF pour ce mois */}
                            <button
                              onClick={e => { e.stopPropagation(); generatePDF(h, player, player?.academy?.name); }}
                              disabled={isGenerating}
                              className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-500 hover:text-white transition-all flex-shrink-0"
                              title="Export PDF">
                              <FiDownload size={13}/>
                            </button>
                          </div>
                          <AnimatePresence>
                            {exp && (
                              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                                exit={{ height:0, opacity:0 }} className="overflow-hidden">
                                <div className="mt-1 mb-2 p-4 rounded-xl border"
                                  style={{ background:'rgba(30,41,59,.5)', borderColor:'rgba(51,65,85,.4)' }}>
                                  <div className="grid grid-cols-4 gap-3 mb-3">
                                    {[
                                      { label:'Technical', val:h.technical_avg, color:'#4fb0ff' },
                                      { label:'Tactical',  val:h.tactical_avg,  color:'#f59e0b' },
                                      { label:'Physical',  val:h.physical_avg,  color:'#22c55e' },
                                      { label:'Mental',    val:h.mental_avg,    color:'#a855f7' },
                                    ].map(p => (
                                      <div key={p.label} className="text-center bg-gray-900/60 rounded-xl py-2">
                                        <div className="text-base font-bold" style={{ color:p.color }}>{fmt(p.val)}</div>
                                        <div className="text-xs text-gray-500">{p.label}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-4 text-xs text-gray-500 mb-2 flex-wrap">
                                    <span>Attendance: <span className="text-white">{h.attendance_present}/{h.attendance_total}</span></span>
                                    {h.school_grade_avg && <span>School: <span className="text-white">{fmt(h.school_grade_avg)}/20</span></span>}
                                    {h.is_injured && <span className="text-red-400">Injured</span>}
                                  </div>
                                  {h.comment && <p className="text-xs text-gray-400 italic">"{h.comment}"</p>}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Performance;