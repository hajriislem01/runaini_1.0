import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiAlertTriangle, FiCheckCircle, FiInfo, FiChevronDown, FiChevronUp, FiCalendar, FiCheck, FiTag, FiEdit3, FiUsers } from 'react-icons/fi';
import { FaStar, FaRegStar, FaHeartbeat, FaGraduationCap } from 'react-icons/fa';
import {
  Chart as ChartJS,
  RadialLinearScale, PointElement, LineElement, Filler,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js';
import { Radar, Bar, Line } from 'react-chartjs-2';
import API from '../../api';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
);

// ─── KPI Groups ────────────────────────────────────────────────────────────────
const KPI_GROUPS = {
  'Technical': [
    { key: 'finishing',    label: 'Finishing',       pillar: 'technical' },
    { key: 'dribbling',    label: 'Dribbling',       pillar: 'technical' },
    { key: 'ball_control', label: 'Ball control',    pillar: 'technical' },
    { key: 'shooting',     label: 'Shooting',        pillar: 'technical' },
    { key: 'passing',      label: 'Passing',         pillar: 'technical' },
    { key: 'heading',      label: 'Heading',         pillar: 'technical' },
    { key: 'tackling',     label: 'Tackling',        pillar: 'technical' },
  ],
  'Tactical': [
    { key: 'positioning',  label: 'Positioning',     pillar: 'tactical' },
    { key: 'game_reading', label: 'Game reading',    pillar: 'tactical' },
    { key: 'pressing',     label: 'Pressing',        pillar: 'tactical' },
    { key: 'decision',     label: 'Decision making', pillar: 'tactical' },
    { key: 'off_ball',     label: 'Off-the-ball',    pillar: 'tactical' },
    { key: 'transition',   label: 'Transition',      pillar: 'tactical' },
  ],
  'Physical': [
    { key: 'speed',        label: 'Speed',           pillar: 'physical' },
    { key: 'endurance',    label: 'Endurance',       pillar: 'physical' },
    { key: 'strength',     label: 'Strength',        pillar: 'physical' },
    { key: 'agility',      label: 'Agility',         pillar: 'physical' },
    { key: 'explosivity',  label: 'Explosivity',     pillar: 'physical' },
  ],
  'Mental': [
    { key: 'attitude',      label: 'Attitude',       pillar: 'mental' },
    { key: 'resilience',    label: 'Resilience',     pillar: 'mental' },
    { key: 'leadership',    label: 'Leadership',     pillar: 'mental' },
    { key: 'concentration', label: 'Concentration',  pillar: 'mental' },
    { key: 'confidence',    label: 'Confidence',     pillar: 'mental' },
  ],
  'Health': [
    { key: 'fatigue',      label: 'Fatigue (inv)',   pillar: 'health' },
    { key: 'sleep',        label: 'Sleep quality',   pillar: 'health' },
    { key: 'injury_risk',  label: 'Injury risk (inv)',pillar: 'health' },
  ],
  'Academic': [
    { key: 'school_grade', label: 'School grade',   pillar: 'academic' },
    { key: 'school_att',   label: 'Attendance %',   pillar: 'academic' },
    { key: 'behaviour',    label: 'Behaviour',      pillar: 'academic' },
  ],
};

const KPI_COLORS = [
  '#4fb0ff','#22c55e','#f59e0b','#a855f7','#ef4444',
  '#00d0cb','#ec4899','#3b82f6','#84cc16','#f97316',
];

const GROUP_COLORS = {
  'Technical': '#4fb0ff', 'Tactical': '#f59e0b',
  'Physical': '#22c55e',  'Mental': '#a855f7',
  'Health': '#ef4444',    'Academic': '#ec4899',
};

// ─── API helper ────────────────────────────────────────────────────────────────
const fetchKpiAnalysis = async (playerId, months) => {
  try {
    const res = await API.get('reports/kpi-analysis/', { params: { player: playerId, months } });
    return res.data; // { player, reports: [...], group_avg: [...] }
  } catch {
    return { reports: [], group_avg: [] };
  }
};

// ─── KPI value extractor ───────────────────────────────────────────────────────
const getKpiValue = (report, kpiKey) => {
  if (!report) return 0;
  const all = { ...report.technical_scores, ...report.tactical_scores, ...report.physical_scores, ...report.mental_scores };
  const map = {
    finishing:'Finishing', dribbling:'Dribbling', ball_control:'Ball control',
    shooting:'Shooting', passing:'Passing', heading:'Heading', tackling:'Tackling',
    positioning:'Positioning', game_reading:'Game reading', pressing:'Pressing',
    decision:'Decision making', off_ball:'Off-the-ball', transition:'Transition',
    speed:'Speed', endurance:'Endurance', strength:'Strength', agility:'Agility', explosivity:'Explosivity',
    attitude:'Attitude', resilience:'Resilience', leadership:'Leadership',
    concentration:'Concentration', confidence:'Confidence',
  };
  if (kpiKey === 'fatigue')     return report.fatigue_level    ? Math.max(0, (6 - report.fatigue_level) * 2)    : 0;
  if (kpiKey === 'sleep')       return report.sleep_quality    ? report.sleep_quality * 2                        : 0;
  if (kpiKey === 'injury_risk') return report.is_injured       ? 2 : 8;
  if (kpiKey === 'school_grade')return report.school_grade_avg ? parseFloat((report.school_grade_avg / 2).toFixed(1)) : 0;
  if (kpiKey === 'school_att')  return report.school_attendance? parseFloat((report.school_attendance / 10).toFixed(1)) : 0;
  if (kpiKey === 'behaviour')   return report.school_behaviour || 0;
  return parseFloat((all[map[kpiKey]] || 0).toFixed(1));
};

// ─── Smart Alert engine ────────────────────────────────────────────────────────
const computeAlerts = (playerId, reports, playerName) => {
  if (!reports || reports.length < 2) return [];
  const alerts = [];
  const latest  = reports[reports.length - 1];
  const prev    = reports[reports.length - 2];
  const attPct  = latest.attendance_total > 0
    ? (latest.attendance_present / latest.attendance_total) * 100 : 100;

  if (latest.overall_score < prev.overall_score - 1.0)
    alerts.push({ type: 'danger', icon: 'regression',
      title: 'Performance regression',
      msg: `Score dropped ${(prev.overall_score - latest.overall_score).toFixed(1)} pts vs last month.` });

  if (attPct < 75)
    alerts.push({ type: 'warning', icon: 'attendance',
      title: 'Low attendance',
      msg: `Only ${Math.round(attPct)}% this month (${latest.attendance_present}/${latest.attendance_total} sessions).` });

  const fatigue3 = reports.slice(-3).every(r => r.fatigue_level >= 4);
  if (fatigue3)
    alerts.push({ type: 'warning', icon: 'fatigue',
      title: 'Chronic fatigue risk',
      msg: 'Fatigue level ≥ 4 for 3 consecutive months — consider reducing training load.' });

  if (latest.is_injured)
    alerts.push({ type: 'danger', icon: 'injury',
      title: 'Currently injured',
      msg: 'Player is marked as injured this month.' });

  if (latest.school_grade_avg && latest.school_grade_avg < 10)
    alerts.push({ type: 'purple', icon: 'academic',
      title: 'Academic alert',
      msg: `School average is ${latest.school_grade_avg.toFixed(1)}/20 — below passing threshold.` });

  if (latest.overall_score > prev.overall_score + 0.8)
    alerts.push({ type: 'success', icon: 'progress',
      title: 'Strong progress',
      msg: `+${(latest.overall_score - prev.overall_score).toFixed(1)} pts vs last month. Keep it up!` });

  return alerts;
};

// ─── Alert badge ───────────────────────────────────────────────────────────────
const ALERT_STYLES = {
  danger:  { bg:'bg-red-500/10',    border:'border-red-500/30',    icon:'text-red-400',    title:'text-red-300',    text:'text-red-200' },
  warning: { bg:'bg-amber-500/10',  border:'border-amber-500/30',  icon:'text-amber-400',  title:'text-amber-300',  text:'text-amber-200' },
  success: { bg:'bg-green-500/10',  border:'border-green-500/30',  icon:'text-green-400',  title:'text-green-300',  text:'text-green-200' },
  purple:  { bg:'bg-purple-500/10', border:'border-purple-500/30', icon:'text-purple-400', title:'text-purple-300', text:'text-purple-200' },
};

const AlertIcon = ({ icon, className }) => {
  const cls = `flex-shrink-0 ${className}`;
  if (icon === 'regression' || icon === 'injury') return <FiAlertTriangle className={cls} size={16}/>;
  if (icon === 'progress')   return <FiCheckCircle className={cls} size={16}/>;
  if (icon === 'academic')   return <FaGraduationCap className={cls} style={{fontSize:16}}/>;
  if (icon === 'fatigue' || icon === 'attendance') return <FiInfo className={cls} size={16}/>;
  return <FiInfo className={cls} size={16}/>;
};

// ═══════════════════════════════════════════════════════════════════════════════
const CoachAnalysis = () => {
  const [players,       setPlayers]       = useState([]);
  const [groups,        setGroups]        = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [monthsRange,   setMonthsRange]   = useState(6);
  const [progType,      setProgType]      = useState('line');
  const [activeView,    setActiveView]    = useState('advanced'); // 'simple' | 'advanced'

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedKpis,    setSelectedKpis]    = useState(['finishing','dribbling','speed','positioning','attitude','school_grade']);
  const [reportsData,     setReportsData]     = useState({});
  const [groupAvgData,    setGroupAvgData]    = useState([]);

  const [notes,     setNotes]     = useState([]);
  const [noteText,  setNoteText]  = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType,  setNoteType]  = useState('info');

  const [showRangeDropdown,    setShowRangeDropdown]    = useState(false);
  const [showGroupDropdown,    setShowGroupDropdown]    = useState(false);
  const [showNoteTypeDropdown, setShowNoteTypeDropdown] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    const closeAll = () => {
      setShowRangeDropdown(false);
      setShowGroupDropdown(false);
      setShowNoteTypeDropdown(false);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const noteColors = {
    info:    { bg:'bg-blue-500/10',  border:'border-blue-500/30',  title:'text-blue-300',  text:'text-blue-200'  },
    warning: { bg:'bg-red-500/10',   border:'border-red-500/30',   title:'text-red-300',   text:'text-red-200'   },
    success: { bg:'bg-green-500/10', border:'border-green-500/30', title:'text-green-300', text:'text-green-200' },
  };

  // Load players & groups
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [pr, gr] = await Promise.all([API.get('players/'), API.get('groups/')]);
        setPlayers(pr.data);
        setGroups(gr.data);
        if (pr.data.length > 0) {
          const first = pr.data[0];
          setSelectedPlayers([first.id]);
          const data = await fetchKpiAnalysis(first.id, monthsRange);
          setReportsData({ [first.id]: data.reports });
          setGroupAvgData(data.group_avg);
        }
      } catch { toast.error('Failed to load data'); }
      finally   { setIsLoading(false); }
    };
    load();
  // eslint-disable-next-line
  }, []);

  // Re-fetch when monthsRange changes
  useEffect(() => {
    if (selectedPlayers.length === 0) return;
    const reload = async () => {
      const newData = {};
      let latestGroupAvg = [];
      for (const pid of selectedPlayers) {
        const data = await fetchKpiAnalysis(pid, monthsRange);
        newData[pid] = data.reports;
        if (data.group_avg.length > 0) latestGroupAvg = data.group_avg;
      }
      setReportsData(newData);
      if (latestGroupAvg.length > 0) setGroupAvgData(latestGroupAvg);
    };
    reload();
  // eslint-disable-next-line
  }, [monthsRange]);

  const getPlayerName = (pid) => players.find(p => p.id === pid)?.full_name || `Player ${pid}`;
  const getLatest     = (pid) => { const r = reportsData[pid] || []; return r[r.length - 1]; };
  const getGroupKpiAvg = (kpiKey) => {
    if (!groupAvgData.length) return 0;
    const latest = groupAvgData[groupAvgData.length - 1];
    const pillar = Object.values(KPI_GROUPS).flat().find(x => x.key === kpiKey)?.pillar;
    const map = { technical: latest.avg_technical, tactical: latest.avg_tactical, physical: latest.avg_physical, mental: latest.avg_mental };
    return parseFloat((map[pillar] || latest.avg_overall || 0).toFixed(1));
  };

  const togglePlayer = async (p) => {
    const isSelected = selectedPlayers.includes(p.id);
    if (isSelected) {
      setSelectedPlayers(prev => prev.filter(id => id !== p.id));
    } else {
      setSelectedPlayers(prev => [...prev, p.id]);
      if (!reportsData[p.id]) {
        const data = await fetchKpiAnalysis(p.id, monthsRange);
        setReportsData(rd => ({ ...rd, [p.id]: data.reports }));
        if (data.group_avg.length > 0) setGroupAvgData(data.group_avg);
      }
    }
  };

  const selectPlayerForDeepAnalysis = async (p) => {
    setActiveView('advanced');
    setSelectedPlayers([p.id]);
    if (!reportsData[p.id]) {
      const data = await fetchKpiAnalysis(p.id, monthsRange);
      setReportsData(rd => ({ ...rd, [p.id]: data.reports }));
      if (data.group_avg.length > 0) setGroupAvgData(data.group_avg);
    }
  };

  const toggleKpi = (k) => {
    if (selectedKpis.includes(k)) setSelectedKpis(prev => prev.filter(x => x !== k));
    else if (selectedKpis.length < 8) setSelectedKpis(prev => [...prev, k]);
    else toast.error('Max 8 KPIs');
  };

  const filteredPlayers = useMemo(() =>
    players.filter(p => !selectedGroup || p.group?.id === parseInt(selectedGroup))
  , [players, selectedGroup]);

  // ── All alerts for selected players ─────────────────────────────────────────
  const allAlerts = useMemo(() => {
    const result = [];
    selectedPlayers.forEach(pid => {
      const alerts = computeAlerts(pid, reportsData[pid], getPlayerName(pid));
      alerts.forEach(a => result.push({ ...a, playerName: getPlayerName(pid), pid }));
    });
    return result;
  }, [selectedPlayers, reportsData]);

  // ── Radar ────────────────────────────────────────────────────────────────────
  const radarData = useMemo(() => {
    if (!selectedPlayers.length || !selectedKpis.length) return null;
    const labels = selectedKpis.map(k => Object.values(KPI_GROUPS).flat().find(x => x.key === k)?.label || k);
    const datasets = selectedPlayers.map((pid, i) => ({
      label: getPlayerName(pid),
      data:  selectedKpis.map(k => getKpiValue(getLatest(pid), k)),
      borderColor:      KPI_COLORS[i % KPI_COLORS.length],
      backgroundColor:  KPI_COLORS[i % KPI_COLORS.length] + '20',
      borderWidth: 2, pointRadius: 4,
      pointBackgroundColor: KPI_COLORS[i % KPI_COLORS.length],
    }));
    datasets.push({
      label:'Group avg', data: selectedKpis.map(k => getGroupKpiAvg(k)),
      borderColor:'rgba(156,163,175,0.5)', backgroundColor:'rgba(156,163,175,0.06)',
      borderWidth:1.5, borderDash:[4,4], pointRadius:2,
      pointBackgroundColor:'rgba(156,163,175,0.5)',
    });
    return { labels, datasets };
  // eslint-disable-next-line
  }, [selectedPlayers, selectedKpis, reportsData, groupAvgData]);

  // ── Bar (current month) ──────────────────────────────────────────────────────
  const barData = useMemo(() => {
    if (!selectedPlayers.length || !selectedKpis.length) return null;
    const labels = selectedKpis.map(k => Object.values(KPI_GROUPS).flat().find(x => x.key === k)?.label || k);
    return {
      labels,
      datasets: selectedPlayers.map((pid, i) => ({
        label: getPlayerName(pid),
        data:  selectedKpis.map(k => parseFloat(getKpiValue(getLatest(pid), k).toFixed(1))),
        backgroundColor: KPI_COLORS[i % KPI_COLORS.length] + 'cc',
        borderRadius: 4,
      })),
    };
  }, [selectedPlayers, selectedKpis, reportsData]);

  // ── Progression ──────────────────────────────────────────────────────────────
  const progData = useMemo(() => {
    if (!selectedPlayers.length || !selectedKpis.length) return null;
    const months   = (reportsData[selectedPlayers[0]] || []).map(r => r.month);
    const datasets = [];
    selectedPlayers.forEach((pid, pi) =>
      selectedKpis.forEach((kk, ki) => {
        const rpts  = reportsData[pid] || [];
        const color = selectedPlayers.length > 1 ? KPI_COLORS[pi % KPI_COLORS.length] : KPI_COLORS[ki % KPI_COLORS.length];
        const label = Object.values(KPI_GROUPS).flat().find(x => x.key === kk)?.label || kk;
        datasets.push({
          label: selectedPlayers.length > 1 ? `${getPlayerName(pid).split(' ')[0]} – ${label}` : label,
          data: rpts.map(r => parseFloat(getKpiValue(r, kk).toFixed(1))),
          borderColor: color, backgroundColor: progType === 'bar' ? color + 'cc' : color + '18',
          fill: progType === 'line', tension: 0.4, borderWidth: 2,
          pointRadius: 3, pointBackgroundColor: color,
          borderRadius: progType === 'bar' ? 3 : 0,
        });
      })
    );
    datasets.push({
      label:'Group avg', data: groupAvgData.map(r => r.avg_overall || 0),
      borderColor:'rgba(156,163,175,0.4)', backgroundColor:'transparent',
      borderDash:[5,5], tension:0.4, borderWidth:1.5, pointRadius:2,
      pointBackgroundColor:'rgba(156,163,175,0.4)',
    });
    return { labels: months, datasets };
  }, [selectedPlayers, selectedKpis, reportsData, groupAvgData, progType]);

  // ── Pillar breakdown ─────────────────────────────────────────────────────────
  const pillarData = useMemo(() => {
    if (!selectedPlayers.length) return null;
    return {
      labels: ['Technical','Tactical','Physical','Mental','Health','Academic'],
      datasets: [
        ...selectedPlayers.map((pid, i) => {
          const r = getLatest(pid);
          const healthScore = r ? parseFloat(((getKpiValue(r,'fatigue')+getKpiValue(r,'sleep'))/2).toFixed(1)) : 0;
          const acadScore   = r ? parseFloat(((getKpiValue(r,'school_grade')+getKpiValue(r,'school_att'))/2).toFixed(1)) : 0;
          return {
            label: getPlayerName(pid),
            data: r ? [
              parseFloat(r.technical_avg.toFixed(1)),
              parseFloat(r.tactical_avg.toFixed(1)),
              parseFloat(r.physical_avg.toFixed(1)),
              parseFloat(r.mental_avg.toFixed(1)),
              healthScore, acadScore,
            ] : [0,0,0,0,0,0],
            backgroundColor: KPI_COLORS[i % KPI_COLORS.length] + 'cc',
            borderRadius: 4,
          };
        }),
        {
          label:'Group avg',
          data: groupAvgData.length > 0
            ? (() => { const g = groupAvgData[groupAvgData.length-1];
                return [g.avg_technical||0,g.avg_tactical||0,g.avg_physical||0,g.avg_mental||0,g.avg_overall||0,g.avg_overall||0]; })()
            : [0,0,0,0,0,0],
          backgroundColor:'rgba(156,163,175,0.3)', borderRadius:4,
        },
      ],
    };
  }, [selectedPlayers, reportsData, groupAvgData]);

  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ grid:{ color:'rgba(255,255,255,0.05)' }, ticks:{ color:'#6b7280', font:{ size:11 } } },
      y:{ min:0, max:10, grid:{ color:'rgba(255,255,255,0.05)' }, ticks:{ color:'#6b7280', font:{ size:11 } } },
    },
  };
  const radarOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{ r:{
      min:0, max:10,
      ticks:{ stepSize:2, color:'#6b7280', font:{ size:10 }, backdropColor:'transparent' },
      grid:{ color:'rgba(255,255,255,0.08)' },
      pointLabels:{ color:'#9ca3af', font:{ size:11 } },
      angleLines:{ color:'rgba(255,255,255,0.08)' },
    }},
  };

  const addNote = () => {
    if (!noteTitle.trim() || !noteText.trim()) { toast.error('Title and note required'); return; }
    setNotes(prev => [{ id:Date.now(), type:noteType, title:noteTitle, text:noteText, date:format(new Date(),'MMM d, yyyy') }, ...prev]);
    setNoteTitle(''); setNoteText('');
  };

  const iV = { hidden:{ y:16, opacity:0 }, visible:{ y:0, opacity:1 } };
  const cV = { hidden:{ opacity:0 }, visible:{ opacity:1, transition:{ staggerChildren:0.07 } } };

  // ── Simple Quick View ────────────────────────────────────────────────────────
  const SimpleView = () => (
    <motion.div variants={iV} className="space-y-3">
      {filteredPlayers.length === 0 && (
        <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-700/50">
          <FiUsers className="mx-auto text-4xl text-gray-600 mb-3"/>
          <p className="text-gray-300 font-medium">No players found</p>
          <p className="text-gray-500 text-sm mt-1">Add players to your academy to see their overview here.</p>
        </div>
      )}
      {filteredPlayers.map((p, idx) => {
        const reports = reportsData[p.id] || [];
        const r     = reports[reports.length - 1] || null;
        const prev  = reports[reports.length - 2] || null;
        const delta = r && prev ? (r.overall_score - prev.overall_score) : 0;
        const alerts= computeAlerts(p.id, reports, p.full_name);
        const danger = alerts.filter(a => a.type === 'danger').length;
        const warn   = alerts.filter(a => a.type === 'warning').length;
        const attPct = r ? Math.round((r.attendance_present / r.attendance_total) * 100) : 0;
        const color  = KPI_COLORS[idx % KPI_COLORS.length];

        return (
          <div key={p.id} className="bg-gray-900/65 rounded-2xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative overflow-hidden"
                style={{ background: color + '50', border: `1.5px solid ${color}` }}>
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
                <span className="relative z-0">{p.full_name?.charAt(0)?.toUpperCase() || 'P'}</span>
              </div>
              <div className="flex-1 min-w-32">
                <div className="font-medium text-white text-sm">{p.full_name}</div>
                <div className="text-xs text-gray-500">{p.position} · {p.group?.name || '—'}</div>
              </div>

              {/* Overall score */}
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color }}>{r?.overall_score?.toFixed(1) || '—'}</div>
                <div className="text-xs text-gray-500">Overall</div>
              </div>

              {/* Trend */}
              <div className={`text-center px-3 py-1 rounded-xl text-sm font-bold ${
                delta > 0 ? 'bg-green-500/20 text-green-400' :
                delta < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-gray-400'
              }`}>
                {delta > 0 ? `↑ +${delta.toFixed(1)}` : delta < 0 ? `↓ ${delta.toFixed(1)}` : '→ Stable'}
              </div>

              {/* Attendance */}
              <div className="text-center">
                <div className={`text-lg font-bold ${!r ? 'text-gray-500' : attPct >= 80 ? 'text-green-400' : attPct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {r ? `${attPct}%` : '—'}
                </div>
                <div className="text-xs text-gray-500">Attendance</div>
              </div>

              {/* School grade */}
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  (r?.school_grade_avg||0) >= 14 ? 'text-green-400' :
                  (r?.school_grade_avg||0) >= 10 ? 'text-amber-400' : 'text-red-400'
                }`}>{r?.school_grade_avg ? r.school_grade_avg.toFixed(1) : '—'}</div>
                <div className="text-xs text-gray-500">School /20</div>
              </div>

              {/* Alerts */}
              <div className="flex gap-2">
                {!r ? (
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-700/50 text-gray-400">No data</span>
                ) : (
                  <>
                    {danger > 0 && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">
                        {danger} alert{danger > 1 ? 's' : ''}
                      </span>
                    )}
                    {warn > 0 && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400">
                        {warn} warning{warn > 1 ? 's' : ''}
                      </span>
                    )}
                    {danger === 0 && warn === 0 && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-400">OK</span>
                    )}
                  </>
                )}
              </div>

              {/* Go deeper */}
              <button onClick={() => selectPlayerForDeepAnalysis(p)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-80"
                style={{ background: `linear-gradient(135deg, ${color}80, ${color})` }}>
                Deep analysis →
              </button>
            </div>
          </div>
        );
      })}
    </motion.div>
  );

  return (
    <motion.div className="min-h-screen text-white p-6 md:p-8 lg:p-10"
      style={{ background:'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div variants={iV} className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#902bd1] via-[#00d0cb] to-[#00d0cb] bg-clip-text text-transparent">
                KPI Analysis
              </h1>
              <p className="text-gray-400 mt-1 text-sm">Private workspace — not included in official reports</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* View toggle */}
              <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50 mr-2">
                <button onClick={() => setActiveView('simple')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === 'simple' ? 'bg-[#4fb0ff] text-white' : 'text-gray-400 hover:text-white'}`}>
                  Quick view
                </button>
                <button onClick={() => setActiveView('advanced')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === 'advanced' ? 'bg-[#902bd1] text-white' : 'text-gray-400 hover:text-white'}`}>
                  KPI Advanced
                </button>
              </div>

              {/* Luxury Range Filter */}
              <div className="relative inline-block text-left" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => { setShowRangeDropdown(!showRangeDropdown); setShowGroupDropdown(false); }}
                  className="px-4 py-2.5 bg-gray-900/65 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white text-sm flex items-center gap-3 transition-all min-w-[140px]"
                >
                  <FiCalendar className={monthsRange ? 'text-[#00d0cb]' : 'text-gray-500'} />
                  <span className="font-medium">{monthsRange} months</span>
                  <FiChevronDown className={`transition-transform duration-200 ${showRangeDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showRangeDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                    >
                      {[3, 6, 12, 24].map(range => (
                        <div key={range} 
                          onClick={() => { setMonthsRange(range); setShowRangeDropdown(false); }} 
                          className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <span className="font-medium">{range} months</span>
                          {monthsRange === range && <FiCheck className="text-[#00d0cb]" />}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Luxury Group Filter */}
              <div className="relative inline-block text-left" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => { setShowGroupDropdown(!showGroupDropdown); setShowRangeDropdown(false); }}
                  className="px-4 py-2.5 bg-gray-900/65 border border-gray-700/50 hover:border-[#00d0cb]/40 rounded-xl text-white text-sm flex items-center gap-3 transition-all min-w-[150px]"
                >
                  <FiUsers className={selectedGroup ? 'text-[#00d0cb]' : 'text-gray-500'} />
                  <span className="font-medium truncate max-w-[100px]">
                    {selectedGroup ? groups.find(g => Number(g.id) === Number(selectedGroup))?.name : 'All groups'}
                  </span>
                  <FiChevronDown className={`transition-transform duration-200 ${showGroupDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showGroupDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 right-0 w-max min-w-full z-[100] bg-[#0c132a]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                    >
                      <div onClick={() => { setSelectedGroup(''); setShowGroupDropdown(false); }} className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                        <span className="font-medium">All groups</span>
                        {!selectedGroup && <FiCheck className="text-[#00d0cb]" />}
                      </div>
                      {groups.map(g => (
                        <div key={g.id} onClick={() => { setSelectedGroup(g.id); setShowGroupDropdown(false); }} className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                          <span className="font-medium">{g.name}</span>
                          {Number(selectedGroup) === Number(g.id) && <FiCheck className="text-[#00d0cb]" />}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SIMPLE VIEW ── */}
        {activeView === 'simple' && (
          <>
            <motion.div variants={iV} className="mb-4 flex items-center gap-2">
              <FiActivity className="text-[#4fb0ff]" size={16}/>
              <span className="text-sm text-gray-300 font-medium">All players — quick snapshot</span>
              <span className="ml-2 text-xs text-gray-500">Click "Deep analysis" to go to advanced KPI mode</span>
            </motion.div>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00d0cb]"/>
              </div>
            ) : <SimpleView />}
          </>
        )}

        {/* ── ADVANCED VIEW ── */}
        {activeView === 'advanced' && (
          <>
            {/* Smart Alerts */}
            {allAlerts.length > 0 && (
              <motion.div variants={iV} className="mb-6">
                <div className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <FiAlertTriangle className="text-amber-400" size={15}/>
                  Smart alerts
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {allAlerts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allAlerts.map((a, i) => {
                    const s = ALERT_STYLES[a.type] || ALERT_STYLES.warning;
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}>
                        <AlertIcon icon={a.icon} className={s.icon}/>
                        <div>
                          <div className={`text-xs font-semibold ${s.title}`}>{a.playerName} — {a.title}</div>
                          <div className={`text-xs mt-0.5 ${s.text}`}>{a.msg}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Player selector */}
            <motion.div variants={iV} className="bg-gray-900/65 rounded-2xl p-5 border border-gray-700/50 mb-5">
              <div className="text-sm font-medium text-gray-300 mb-3">
                Select players <span className="text-gray-500">(click to add/remove)</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {isLoading ? [1,2,3,4].map(i => <div key={i} className="h-10 w-32 bg-gray-700/50 rounded-xl animate-pulse"/>) :
                  filteredPlayers.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No players found. Add players to your academy first.</p>
                  ) :
                  filteredPlayers.map((p, idx) => {
                    const sel   = selectedPlayers.includes(p.id);
                    const color = KPI_COLORS[idx % KPI_COLORS.length];
                    const pAlerts = computeAlerts(p.id, reportsData[p.id] || [], p.full_name);
                    return (
                      <motion.button key={p.id} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                        onClick={() => togglePlayer(p)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          sel ? 'text-white' : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:text-white'}`}
                        style={sel ? { background: color+'30', borderColor: color } : {}}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative overflow-hidden"
                          style={{ background: sel ? color : '#374151' }}>
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
                          <span className="relative z-0">{p.full_name?.charAt(0)?.toUpperCase() || 'P'}</span>
                        </div>
                        <div>
                          <div style={{ color: sel ? color : undefined }}>{p.full_name}</div>
                          <div className="text-xs text-gray-500">{p.position}</div>
                        </div>
                        {pAlerts.some(a => a.type === 'danger') && (
                          <span className="w-2 h-2 rounded-full bg-red-500 ml-1 flex-shrink-0"></span>
                        )}
                        {sel && <div className="w-2 h-2 rounded-full ml-1" style={{ background: color }}/>}
                      </motion.button>
                    );
                  })
                }
              </div>
            </motion.div>

            {/* KPI Selector */}
            <motion.div variants={iV} className="bg-gray-900/65 rounded-2xl p-5 border border-gray-700/50 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-300">
                  Select KPIs <span className="text-gray-500">(max 8)</span>
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#4fb0ff] text-white text-xs font-bold">
                    {selectedKpis.length}
                  </span>
                </div>
                <button onClick={() => setSelectedKpis([])} className="text-xs text-gray-500 hover:text-white px-3 py-1 rounded-lg hover:bg-gray-800">
                  Clear all
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(KPI_GROUPS).map(([grp, kpis]) => (
                  <div key={grp}>
                    <div className="flex items-center gap-2 mb-2">
                      {grp === 'Health'   && <FaHeartbeat style={{ fontSize:12, color: GROUP_COLORS[grp] }}/>}
                      {grp === 'Academic' && <FaGraduationCap style={{ fontSize:12, color: GROUP_COLORS[grp] }}/>}
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GROUP_COLORS[grp] }}>{grp}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {kpis.map(kpi => {
                        const sel   = selectedKpis.includes(kpi.key);
                        const si    = selectedKpis.indexOf(kpi.key);
                        const color = sel ? KPI_COLORS[si % KPI_COLORS.length] : undefined;
                        return (
                          <button key={kpi.key} onClick={() => toggleKpi(kpi.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              sel ? 'text-white' : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:text-white'}`}
                            style={sel ? { background: color+'22', borderColor: color, color } : {}}>
                            <div className="w-2 h-2 rounded-full" style={{ background: sel ? color : '#4b5563' }}/>
                            {kpi.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Auto insight */}
            {selectedPlayers.length > 0 && selectedKpis.length > 0 && (() => {
              const pid  = selectedPlayers[0];
              const r    = getLatest(pid);
              const kl   = Object.values(KPI_GROUPS).flat().find(k => k.key === selectedKpis[0])?.label || selectedKpis[0];
              const val  = r ? getKpiValue(r, selectedKpis[0]) : 0;
              return (
                <motion.div variants={iV} className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl mb-5">
                  <FaStar className="text-amber-400 flex-shrink-0" style={{ fontSize:14 }}/>
                  <span className="text-sm text-green-300">
                    <span className="font-semibold">{getPlayerName(pid)}</span>'s {kl} is <span className="font-bold">{val.toFixed(1)}/10</span> —{' '}
                    {val >= 8 ? 'excellent, above group average 🟢' : val >= 6 ? 'good, close to group average 🟡' : 'needs attention, below group average 🔴'}
                  </span>
                </motion.div>
              );
            })()}

            {/* Empty state — no selection */}
            {(selectedPlayers.length === 0 || selectedKpis.length === 0) && (
              <motion.div variants={iV} className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-700/50 mb-5">
                <FiActivity className="mx-auto text-4xl text-gray-600 mb-3"/>
                <p className="text-gray-400">Select players and KPIs above to see the charts</p>
              </motion.div>
            )}

            {/* Empty state — player selected but no reports yet */}
            {selectedPlayers.length > 0 && selectedKpis.length > 0 &&
              selectedPlayers.every(pid => (reportsData[pid] || []).length === 0) && (
              <motion.div variants={iV} className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-700/50 mb-5">
                <FiEdit3 className="mx-auto text-4xl text-gray-600 mb-3"/>
                <p className="text-gray-300 font-medium">No reports yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Fill in monthly player reports to unlock KPI analysis and charts.
                </p>
              </motion.div>
            )}

            {selectedPlayers.length > 0 && selectedKpis.length > 0 &&
              selectedPlayers.some(pid => (reportsData[pid] || []).length > 0) && (
              <>
                {/* Radar + Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                  <motion.div variants={iV} className="bg-gray-900/65 rounded-2xl border border-gray-700/50 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                      <div>
                        <div className="text-sm font-medium text-white">KPI Radar</div>
                        <div className="text-xs text-gray-400">Player profile vs group avg</div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {selectedPlayers.map((pid,i) => (
                          <div key={pid} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ background: KPI_COLORS[i%KPI_COLORS.length] }}/>
                            <span className="text-xs text-gray-400">{getPlayerName(pid).split(' ')[0]}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-500"/>
                          <span className="text-xs text-gray-400">Group</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4" style={{ height:280 }}>
                      {radarData && <Radar data={radarData} options={radarOpts}/>}
                    </div>
                  </motion.div>

                  <motion.div variants={iV} className="bg-gray-900/65 rounded-2xl border border-gray-700/50 overflow-hidden">
                    <div className="p-4 border-b border-gray-700/50">
                      <div className="text-sm font-medium text-white">KPI Comparison</div>
                      <div className="text-xs text-gray-400">Current month values</div>
                    </div>
                    <div className="p-4" style={{ height:280 }}>
                      {barData && <Bar data={barData} options={chartOpts}/>}
                    </div>
                  </motion.div>
                </div>

                {/* Progression */}
                <motion.div variants={iV} className="bg-gray-900/65 rounded-2xl border border-gray-700/50 overflow-hidden mb-5">
                  <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <div>
                      <div className="text-sm font-medium text-white">Progression over time</div>
                      <div className="text-xs text-gray-400">{monthsRange} months — selected KPIs</div>
                    </div>
                    <div className="flex gap-2">
                      {['line','bar'].map(t => (
                        <button key={t} onClick={() => setProgType(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                            progType===t ? 'bg-[#E6F1FB] text-[#185FA5] border-[#B5D4F4]'
                                        : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:text-white'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-3 mb-3">
                      {selectedPlayers.map((pid,pi) =>
                        selectedKpis.map((kk,ki) => {
                          const label = Object.values(KPI_GROUPS).flat().find(x => x.key===kk)?.label||kk;
                          const color = selectedPlayers.length>1 ? KPI_COLORS[pi%KPI_COLORS.length] : KPI_COLORS[ki%KPI_COLORS.length];
                          return (
                            <div key={`${pid}-${kk}`} className="flex items-center gap-1">
                              <div className="w-2.5 h-2.5 rounded-sm" style={{ background:color }}/>
                              <span className="text-xs text-gray-400">
                                {selectedPlayers.length>1 ? `${getPlayerName(pid).split(' ')[0]} – ${label}` : label}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div style={{ height:240 }}>
                      {progData && (progType==='line'
                        ? <Line data={progData} options={chartOpts}/>
                        : <Bar  data={progData} options={chartOpts}/>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Pillar breakdown — NOW includes Health & Academic */}
                <motion.div variants={iV} className="bg-gray-900/65 rounded-2xl border border-gray-700/50 overflow-hidden mb-5">
                  <div className="p-4 border-b border-gray-700/50">
                    <div className="text-sm font-medium text-white">Full pillar breakdown vs group</div>
                    <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                      <span className="text-[#4fb0ff]">Technical</span>
                      <span className="text-amber-400">Tactical</span>
                      <span className="text-green-400">Physical</span>
                      <span className="text-purple-400">Mental</span>
                      <span className="text-red-400 flex items-center gap-1"><FaHeartbeat style={{fontSize:11}}/>Health</span>
                      <span className="text-pink-400 flex items-center gap-1"><FaGraduationCap style={{fontSize:11}}/>Academic</span>
                    </div>
                  </div>
                  <div className="p-4" style={{ height:260 }}>
                    {pillarData && <Bar data={pillarData} options={{
                      ...chartOpts,
                      scales:{ ...chartOpts.scales,
                        x:{ ...chartOpts.scales.x, ticks:{ autoSkip:false, color:'#6b7280', font:{ size:11 } } } }
                    }}/>}
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}

        {/* ── Private Notes ── */}
        <motion.div variants={iV} className="bg-gray-900/65 rounded-2xl border border-gray-700/50 relative overflow-visible">
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <div>
              <div className="text-sm font-medium text-white">Private notes</div>
              <div className="text-xs text-gray-400">Never shown in official reports</div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Private</span>
          </div>
          <div className="p-4 space-y-3">
            <AnimatePresence>
              {notes.map(note => {
                const c = noteColors[note.type];
                return (
                  <motion.div key={note.id} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${c.bg} ${c.border}`}>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${c.title}`}>{note.title}</div>
                      <div className={`text-xs mt-1 ${c.text}`}>{note.text}</div>
                      <div className="text-xs text-gray-500 mt-1">{note.date}</div>
                    </div>
                    <button onClick={() => setNotes(prev => prev.filter(n => n.id !== note.id))}
                      className="text-gray-500 hover:text-white flex-shrink-0"><FiX size={14}/></button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div className="border-t border-gray-700/50 pt-3">
              <div className="flex gap-2 mb-2">
                <div className="relative inline-block text-left" onClick={e => e.stopPropagation()}>
                  <button 
                    type="button"
                    onClick={() => setShowNoteTypeDropdown(!showNoteTypeDropdown)}
                    className="px-4 py-2 bg-gray-900/40 border border-gray-700/50 rounded-xl text-white text-xs flex items-center gap-3 hover:border-[#00d0cb]/40 transition-all min-w-[120px] shadow-sm"
                  >
                    <FiTag className="text-[#00d0cb]" />
                    <span className="font-medium truncate">{noteType === 'info' ? 'Note' : noteType === 'warning' ? 'Warning' : 'Positive'}</span>
                    <FiChevronDown className={`transition-transform duration-200 ${showNoteTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showNoteTypeDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-0 min-w-full w-[180px] z-[9999] bg-[#0c132a] border border-[#00d0cb]/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-2 space-y-1"
                      >
                        {[
                          { id: 'info', name: 'Note', icon: <FiInfo className="text-blue-400" /> },
                          { id: 'warning', name: 'Warning', icon: <FiAlertTriangle className="text-red-400" /> },
                          { id: 'success', name: 'Positive', icon: <FiCheckCircle className="text-green-400" /> },
                        ].map(opt => (
                          <div 
                            key={opt.id} 
                            onClick={() => { setNoteType(opt.id); setShowNoteTypeDropdown(false); }} 
                            className={`px-4 py-3 text-xs text-gray-300 hover:text-white hover:bg-[#00d0cb]/10 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${noteType === opt.id ? 'bg-[#00d0cb]/10 text-[#00d0cb]' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              {opt.icon}
                              <span className="font-medium">{opt.name}</span>
                            </div>
                            {noteType === opt.id && <FiCheck className="text-[#00d0cb]" />}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input placeholder="Title..." value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00d0cb]"/>
              </div>
              <textarea rows="2" placeholder="Write a private observation..."
                value={noteText} onChange={e => setNoteText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00d0cb] resize-none mb-2"/>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Visible only to you</span>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={addNote}
                  className="px-4 py-1.5 text-white rounded-lg text-xs font-medium"
                  style={{ background:'linear-gradient(135deg,#4fb0ff,#00d0cb)' }}>
                  Add note
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CoachAnalysis;