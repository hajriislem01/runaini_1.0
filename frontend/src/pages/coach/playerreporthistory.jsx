import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiFileText } from 'react-icons/fi';
import { FaHeartbeat, FaGraduationCap } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend,
} from 'chart.js';
import API from '../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ─── Barre de score ────────────────────────────────────────────────────────────
const ScoreBar = ({ label, value, color }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
    <span style={{ fontSize:12, color:'#94a3b8', width:110, flexShrink:0 }}>{label}</span>
    <div style={{ flex:1, height:5, background:'#0f172a', borderRadius:99, overflow:'hidden' }}>
      <div style={{ width:`${(value/10)*100}%`, height:'100%', background:color, borderRadius:99 }} />
    </div>
    <span style={{ fontSize:12, fontWeight:700, color, width:28, textAlign:'right', flexShrink:0 }}>
      {parseFloat(value).toFixed(1)}
    </span>
  </div>
);

// ─── Badge santé ───────────────────────────────────────────────────────────────
const Badge = ({ ok, label }) => (
  <span style={{
    fontSize:11, padding:'3px 8px', borderRadius:99,
    background: ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
    color:       ok ? '#4ade80'              : '#f87171',
    border:      ok ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
  }}>{label}</span>
);

// ═══════════════════════════════════════════════════════════════════════════════
const PlayerReportHistory = ({ player, onClose }) => {
  const [reports, setReports]         = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);  // index dans reports[]

  useEffect(() => {
    if (!player) return;
    fetchReports();
  }, [player]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await API.get(`reports/player-history/?player=${player.id}`);
      const sorted = [...res.data].sort((a, b) => a.month.localeCompare(b.month));
      setReports(sorted);
      setActiveIndex(sorted.length - 1); // Dernier mois par défaut
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const report = reports[activeIndex];

  // ── Graphe progression ─────────────────────────────────────────────────────
  const progData = {
    labels: reports.map(r => {
      const [y, m] = r.month.split('-');
      return new Date(+y, +m-1).toLocaleDateString('en', { month:'short', year:'2-digit' });
    }),
    datasets: [
      {
        label:'Overall',
        data: reports.map(r => parseFloat(r.overall_score.toFixed(1))),
        borderColor:'#4fb0ff', backgroundColor:'rgba(79,176,255,0.08)',
        fill:true, tension:0.4, borderWidth:2, pointRadius:4,
        pointBackgroundColor: reports.map((_, i) => i === activeIndex ? '#fff' : '#4fb0ff'),
        pointBorderColor:     reports.map((_, i) => i === activeIndex ? '#4fb0ff' : 'transparent'),
        pointBorderWidth:     reports.map((_, i) => i === activeIndex ? 2 : 0),
        pointRadius:          reports.map((_, i) => i === activeIndex ? 6 : 3),
      },
      {
        label:'Technical',
        data: reports.map(r => parseFloat(r.technical_avg.toFixed(1))),
        borderColor:'#f59e0b', borderDash:[4,4], backgroundColor:'transparent',
        tension:0.4, borderWidth:1.5, pointRadius:2, pointBackgroundColor:'#f59e0b',
      },
    ],
  };

  const progOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    onClick: (_, els) => { if (els.length) setActiveIndex(els[0].index); },
    scales:{
      x:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#475569', font:{ size:11 } } },
      y:{ min:0, max:10, grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#475569', font:{ size:11 } } },
    },
  };

  const attPct = report && report.attendance_total > 0
    ? Math.round((report.attendance_present / report.attendance_total) * 100) : 0;

  const formatMonth = (m) => {
    if (!m) return '';
    const [y, mo] = m.split('-');
    return new Date(+y, +mo-1).toLocaleDateString('en', { month:'long', year:'numeric' });
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.95, opacity:0 }}
        className="w-full max-w-3xl my-8 rounded-2xl border border-gray-800 overflow-hidden"
        style={{ background:'#0f172a' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800"
          style={{ background:'linear-gradient(135deg,rgba(144,43,209,0.08),rgba(79,176,255,0.08))' }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {player.full_name?.charAt(0)}
            </div>
            <div>
              <div className="text-white font-semibold text-base">{player.full_name}</div>
              <div className="text-xs text-gray-500">
                {player.position} · {player.group?.name || '—'} ·{' '}
                <span style={{ color:'#4fb0ff' }}>{reports.length} reports available</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-3 py-2 rounded-lg text-white flex items-center gap-1"
              style={{ background:'linear-gradient(135deg,#902bd1,#4fb0ff)' }}>
              <FiFileText size={12} />Export PDF
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* ── Month tabs ── */}
        {reports.length > 0 && (
          <div className="flex gap-2 px-5 py-3 border-b border-gray-800 overflow-x-auto">
            {reports.map((r, i) => (
              <button key={r.month} onClick={() => setActiveIndex(i)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border"
                style={i === activeIndex
                  ? { background:'rgba(79,176,255,0.15)', borderColor:'#4fb0ff', color:'#4fb0ff' }
                  : { background:'#1e293b', borderColor:'#1e293b', color:'#64748b' }}>
                {formatMonth(r.month)}
              </button>
            ))}
          </div>
        )}

        {/* ── Body ── */}
        <div className="p-5">

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4fb0ff]" />
            </div>
          )}

          {/* No reports */}
          {!isLoading && reports.length === 0 && (
            <div className="text-center py-16">
              <FiFileText className="mx-auto text-4xl text-gray-600 mb-3" />
              <div className="text-gray-400 text-sm">No evaluations yet for {player.full_name}</div>
              <div className="text-gray-600 text-xs mt-1">Use the "Evaluate" button to add a monthly report</div>
            </div>
          )}

          {/* Report content */}
          {!isLoading && report && (
            <AnimatePresence mode="wait">
              <motion.div key={report.month}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-6 }} transition={{ duration:0.15 }}>

                {/* Score cards */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { label:'Overall', val:report.overall_score, color:'#4fb0ff', bg:'rgba(79,176,255,0.1)', border:'rgba(79,176,255,0.2)' },
                    { label:'Technical', val:report.technical_avg, color:'#4fb0ff', bg:'rgba(79,176,255,0.06)', border:'rgba(79,176,255,0.12)' },
                    { label:'Tactical',  val:report.tactical_avg,  color:'#f59e0b', bg:'rgba(245,158,11,0.06)', border:'rgba(245,158,11,0.12)' },
                    { label:'Physical',  val:report.physical_avg,  color:'#22c55e', bg:'rgba(34,197,94,0.06)',  border:'rgba(34,197,94,0.12)'  },
                    { label:'Mental',    val:report.mental_avg,    color:'#a855f7', bg:'rgba(168,85,247,0.06)', border:'rgba(168,85,247,0.12)' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                      style={{ background:s.bg, border:`1px solid ${s.border}` }}>
                      <div className="text-xl font-bold" style={{ color:s.color }}>
                        {parseFloat(s.val || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Technical + Tactical scores */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-xl p-3" style={{ background:'#1e293b' }}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Technical</div>
                    {Object.entries(report.technical_scores || {}).map(([k, v]) => (
                      <ScoreBar key={k} label={k} value={v} color="#4fb0ff" />
                    ))}
                  </div>
                  <div className="rounded-xl p-3" style={{ background:'#1e293b' }}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tactical</div>
                    {Object.entries(report.tactical_scores || {}).map(([k, v]) => (
                      <ScoreBar key={k} label={k} value={v} color="#f59e0b" />
                    ))}
                  </div>
                  <div className="rounded-xl p-3" style={{ background:'#1e293b' }}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Physical</div>
                    {Object.entries(report.physical_scores || {}).map(([k, v]) => (
                      <ScoreBar key={k} label={k} value={v} color="#22c55e" />
                    ))}
                  </div>
                  <div className="rounded-xl p-3" style={{ background:'#1e293b' }}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mental</div>
                    {Object.entries(report.mental_scores || {}).map(([k, v]) => (
                      <ScoreBar key={k} label={k} value={v} color="#a855f7" />
                    ))}
                  </div>
                </div>

                {/* Health + Attendance */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-xl p-3" style={{ background:'#1e293b' }}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <FaHeartbeat style={{ fontSize:11, color:'#ef4444' }} />Health & Academic
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge ok={!report.is_injured} label={report.is_injured ? 'Injured' : 'Not injured'} />
                      <Badge ok={report.medical_cert_valid} label={report.medical_cert_valid ? 'Medical cert. valid' : 'No medical cert.'} />
                      {report.fatigue_level && (
                        <Badge ok={report.fatigue_level <= 2} label={`Fatigue ${report.fatigue_level}/5`} />
                      )}
                      {report.sleep_quality && (
                        <Badge ok={report.sleep_quality >= 3} label={`Sleep ${report.sleep_quality}/5`} />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {report.school_grade_avg != null && (
                        <div className="rounded-lg p-2 text-center" style={{ background:'#0f172a' }}>
                          <div className="text-base font-bold" style={{ color:'#a855f7' }}>
                            {parseFloat(report.school_grade_avg).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">Grade /20</div>
                        </div>
                      )}
                      {report.school_attendance != null && (
                        <div className="rounded-lg p-2 text-center" style={{ background:'#0f172a' }}>
                          <div className="text-base font-bold" style={{ color:'#22c55e' }}>
                            {parseFloat(report.school_attendance).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">School att.</div>
                        </div>
                      )}
                      {report.school_behaviour != null && (
                        <div className="rounded-lg p-2 text-center" style={{ background:'#0f172a' }}>
                          <div className="text-base font-bold" style={{ color:'#4fb0ff' }}>
                            {report.school_behaviour}
                          </div>
                          <div className="text-xs text-gray-500">Behaviour</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl p-3" style={{ background:'#1e293b' }}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Attendance — {attPct}%
                    </div>
                    <div className="text-xl font-bold" style={{ color:'#00d0cb' }}>
                      {report.attendance_present}
                      <span className="text-sm font-normal text-gray-500"> / {report.attendance_total} sessions</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[...Array(report.attendance_total || 0)].map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full"
                          style={{ background: i < report.attendance_present ? '#22c55e' : '#ef4444' }} />
                      ))}
                    </div>
                    <div className="flex gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>Present
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>Absent
                      </span>
                    </div>
                  </div>
                </div>

                {/* Textes */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    { label:'Strength', val:report.strength, color:'#22c55e' },
                    { label:'To improve', val:report.to_improve, color:'#f59e0b' },
                    { label:'Objective — next month', val:report.objective, color:'#4fb0ff' },
                    { label:'Coach comment', val:report.comment, color:'#94a3b8' },
                  ].map(f => f.val && (
                    <div key={f.label} className="rounded-xl p-3" style={{ background:'#1e293b' }}>
                      <div className="text-xs font-semibold mb-1.5" style={{ color:f.color }}>{f.label}</div>
                      <div className="text-sm text-gray-300 leading-relaxed">{f.val}</div>
                    </div>
                  ))}
                </div>

                {/* Graphe progression */}
                {reports.length > 1 && (
                  <div className="rounded-xl p-3" style={{ background:'#1e293b' }}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Progression — click a point to see that month's report
                    </div>
                    <div style={{ position:'relative', width:'100%', height:140 }}>
                      <Line data={progData} options={progOpts} />
                    </div>
                    <div className="flex gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="inline-block w-3 h-0.5 bg-[#4fb0ff]"></span>Overall
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="inline-block w-3 h-0.5 border-t border-dashed border-[#f59e0b]"></span>Technical
                      </span>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ── Footer navigation ── */}
        {reports.length > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
            <button onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white disabled:opacity-30 bg-gray-800 border border-gray-700">
              <FiChevronLeft size={14} />Previous month
            </button>
            <span className="text-xs text-gray-500">
              {activeIndex + 1} / {reports.length}
            </span>
            <button onClick={() => setActiveIndex(i => Math.min(reports.length - 1, i + 1))}
              disabled={activeIndex === reports.length - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white disabled:opacity-30 bg-gray-800 border border-gray-700">
              Next month<FiChevronRight size={14} />
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
};

export default PlayerReportHistory;