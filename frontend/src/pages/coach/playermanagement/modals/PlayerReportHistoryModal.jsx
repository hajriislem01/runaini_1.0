import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX, FiChevronLeft, FiChevronRight, FiFileText } from 'react-icons/fi';
import { FaHeartbeat } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import API from '../../../api';
import toast from 'react-hot-toast';
import { useAcademyData } from '../../../../context/AdminContext';
import ScoreBar from '../components/ScoreBar';
import HealthBadge from '../components/HealthBadge';
import useReportPDF from '../hooks/useReportPDF';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ── Hidden-scrollbar style injected once ── */
const SCROLLBAR_CSS = `
  .prhm-tabs::-webkit-scrollbar { display: none; }
  .prhm-tabs { -ms-overflow-style: none; scrollbar-width: none; }
`;

const toWestern = (num) =>
  String(num).replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) =>
    String(d.charCodeAt(0) - (d.charCodeAt(0) >= 0x06F0 ? 0x06F0 : 0x0660))
  );

const PlayerReportHistoryModal = ({ player, onClose }) => {
  const { t, i18n } = useTranslation('coachplayers');
  const isRtl = i18n.language === 'ar';

  const { academyData } = useAcademyData();
  const { generatePDF, isGenerating } = useReportPDF();
  const tabsRef = useRef(null);

  const [reports,     setReports]     = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  /* Inject CSS once */
  useEffect(() => {
    if (document.getElementById('prhm-style')) return;
    const tag = document.createElement('style');
    tag.id = 'prhm-style';
    tag.textContent = SCROLLBAR_CSS;
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    if (!player) return;
    fetchReports();
  // eslint-disable-next-line
  }, [player]);

  /* Scroll active tab into view */
  useEffect(() => {
    if (!tabsRef.current) return;
    const btn = tabsRef.current.children[activeIndex];
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIndex]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res  = await API.get(`reports/player-history/?player=${player.id}`);
      const data = Array.isArray(res.data) ? res.data : [];
      const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));
      setReports(sorted);
      setActiveIndex(sorted.length > 0 ? sorted.length - 1 : 0);
    } catch {
      toast.error(t('failedToLoad') || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const report = reports[activeIndex];

  const handleExportPDF = (e) => {
    e?.stopPropagation();
    if (!report || isGenerating) return;
    generatePDF(report, player, academyData?.name || 'RunAiNi Academy');
  };

  const fmtMonth = (m) => {
    if (!m) return '';
    const [y, mo] = m.split('-');
    return new Date(+y, +mo - 1).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
  };

  const progData = {
    labels: reports.map(r => {
      const [y, m] = r.month.split('-');
      return new Date(+y, +m - 1).toLocaleDateString(i18n.language, { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: t('overall') || 'Overall',
        data: reports.map(r => parseFloat(r.overall_score?.toFixed(1) || 0)),
        borderColor: '#4fb0ff', backgroundColor: 'rgba(79,176,255,0.08)',
        fill: true, tension: 0.4, borderWidth: 2,
        pointBackgroundColor: reports.map((_, i) => i === activeIndex ? '#fff' : '#4fb0ff'),
        pointBorderColor:     reports.map((_, i) => i === activeIndex ? '#4fb0ff' : 'transparent'),
        pointBorderWidth:     reports.map((_, i) => i === activeIndex ? 2 : 0),
        pointRadius:          reports.map((_, i) => i === activeIndex ? 6 : 3),
      },
      {
        label: t('pillar_technical'),
        data: reports.map(r => parseFloat(r.technical_avg?.toFixed(1) || 0)),
        borderColor: '#f59e0b', backgroundColor: 'transparent',
        borderDash: [4, 4], fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 0,
      },
    ],
  };

  const progOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      y: { min: 0, max: 10, grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
    },
    onClick: (_, els) => { if (els.length > 0) setActiveIndex(els[0].index); },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl flex flex-col rounded-2xl shadow-2xl border border-gray-800"
        style={{ maxHeight: '90vh', background: 'linear-gradient(135deg,#0a0f2a,#0f172a)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── FIXED HEADER ── */}
        <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#0f172a]/80 rounded-t-2xl flex-shrink-0 gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] p-px flex-shrink-0 relative">
              <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center text-lg font-bold text-white relative overflow-hidden">
                {player?.profile_picture || player?.photo_url ? (
                  <img 
                    src={player.profile_picture || player.photo_url} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                <span className="relative z-0">{player?.full_name?.charAt(0)?.toUpperCase() || 'P'}</span>
              </div>
            </div>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h2 className="text-base font-bold text-white leading-tight">{player.full_name}</h2>
              <div className="text-xs text-gray-400 mt-0.5">
                {player.position ? t('pos_' + player.position.toLowerCase()) || player.position : t('unknown')}
                <span className="mx-1.5 text-gray-700">·</span>
                <span style={{ color: '#4fb0ff' }}>{toWestern(reports.length)} {reports.length === 1 ? t('reportSingular') : t('reportsPlural')}</span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-2 flex-shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleExportPDF}
              disabled={isLoading || isGenerating || !report}
              style={{ background: 'linear-gradient(135deg,#902bd1,#4fb0ff)' }}
              className={`text-xs px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg cursor-pointer border-none disabled:opacity-50 ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              {isGenerating
                ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('generating')}</>
                : <><FiFileText size={13} />{t('exportPdf')}</>}
            </motion.button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
              <FiX size={15} />
            </button>
          </div>
        </div>

        {/* ── MONTH TAB STRIP (horizontal scroll, hidden scrollbar) ── */}
        {reports.length > 0 && (
          <div
            className="prhm-tabs flex-shrink-0 border-b border-gray-800"
            style={{ overflowX: 'auto', overflowY: 'hidden' }}
          >
            <div
              ref={tabsRef}
              className={`flex gap-2 px-5 py-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}
              style={{ width: 'max-content', minWidth: '100%' }}
            >
              {reports.map((r, i) => (
                <button
                  key={r.month}
                  onClick={() => setActiveIndex(i)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border"
                  style={i === activeIndex
                    ? { background: 'rgba(79,176,255,0.15)', borderColor: '#4fb0ff', color: '#4fb0ff' }
                    : { background: 'transparent', borderColor: '#1e293b', color: '#64748b' }}
                >
                  {fmtMonth(r.month)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SCROLLABLE BODY ── */}
        <div className="overflow-y-auto flex-1 p-5">

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4fb0ff]" />
            </div>
          )}

          {/* Empty */}
          {!isLoading && reports.length === 0 && (
            <div className="text-center py-16">
              <FiFileText className="mx-auto text-4xl text-gray-600 mb-3" />
              <div className="text-gray-400 text-sm">{t('noEvaluationsYet', { name: player.full_name })}</div>
              <div className="text-gray-600 text-xs mt-1">{t('useEvaluateToAdd')}</div>
            </div>
          )}

          {/* Report content */}
          {!isLoading && report && (
            <AnimatePresence mode="wait">
              <motion.div
                key={report.month}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Score cards */}
                <div className={`grid grid-cols-5 gap-2 ${isRtl ? 'text-right' : ''}`}>
                  {[
                    { label: t('overall') || 'Overall',   val: report.overall_score,  color: '#4fb0ff', bg: 'rgba(79,176,255,0.1)',   border: 'rgba(79,176,255,0.2)'  },
                    { label: t('pillar_technical'), val: report.technical_avg,  color: '#4fb0ff', bg: 'rgba(79,176,255,0.06)',  border: 'rgba(79,176,255,0.12)' },
                    { label: t('pillar_tactical'),  val: report.tactical_avg,   color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.12)' },
                    { label: t('pillar_physical'),  val: report.physical_avg,   color: '#22c55e', bg: 'rgba(34,197,94,0.06)',   border: 'rgba(34,197,94,0.12)'  },
                    { label: t('pillar_mental'),    val: report.mental_avg,     color: '#a855f7', bg: 'rgba(168,85,247,0.06)',  border: 'rgba(168,85,247,0.12)' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                      <div className="text-xl font-bold" style={{ color: s.color }}>
                        {toWestern(parseFloat(s.val || 0).toFixed(1))}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Pillar bars */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isRtl ? 'text-right' : ''}`}>
                  {[
                    { label: t('pillar_technical'), scores: report.technical_scores, color: '#4fb0ff' },
                    { label: t('pillar_tactical'),  scores: report.tactical_scores,  color: '#f59e0b' },
                    { label: t('pillar_physical'),  scores: report.physical_scores,  color: '#22c55e' },
                    { label: t('pillar_mental'),    scores: report.mental_scores,    color: '#a855f7' },
                  ].map(p => (
                    <div key={p.label} className="rounded-xl p-3 bg-[#1e293b]">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{p.label}</div>
                      {Object.entries(p.scores || {}).map(([k, v]) => (
                        <ScoreBar key={k} label={t('crit_' + k.toLowerCase().replace(/\s+/g, '_')) || k} value={v} color={p.color} isRtl={isRtl} />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Health & Attendance */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isRtl ? 'text-right' : ''}`}>
                  <div className="rounded-xl p-3 bg-[#1e293b]">
                    <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <FaHeartbeat style={{ fontSize: 11, color: '#ef4444' }} /> {t('healthAcademic')}
                    </div>
                    <div className={`flex flex-wrap gap-1.5 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <HealthBadge ok={!report.is_injured}         label={report.is_injured ? t('injuredStatus') : t('notInjured')} />
                      <HealthBadge ok={report.medical_cert_valid}  label={report.medical_cert_valid ? t('certValid') : t('noCert')} />
                      {report.fatigue_level && <HealthBadge ok={report.fatigue_level <= 2} label={`${t('fatigue')} ${toWestern(report.fatigue_level)}/5`} />}
                      {report.sleep_quality && <HealthBadge ok={report.sleep_quality >= 3} label={`${t('sleep')} ${toWestern(report.sleep_quality)}/5`} />}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {report.school_grade_avg != null && (
                        <div className="rounded-lg p-2 text-center bg-[#0f172a]">
                          <div className="text-base font-bold text-[#a855f7]">{toWestern(parseFloat(report.school_grade_avg).toFixed(1))}</div>
                          <div className="text-xs text-gray-500">{t('grade20')}</div>
                        </div>
                      )}
                      {report.school_attendance != null && (
                        <div className="rounded-lg p-2 text-center bg-[#0f172a]">
                          <div className="text-base font-bold text-[#22c55e]">{toWestern(parseFloat(report.school_attendance).toFixed(0))}%</div>
                          <div className="text-xs text-gray-500">{t('schoolAtt')}</div>
                        </div>
                      )}
                      {report.school_behaviour != null && (
                        <div className="rounded-lg p-2 text-center bg-[#0f172a]">
                          <div className="text-base font-bold text-[#4fb0ff]">{toWestern(report.school_behaviour)}</div>
                          <div className="text-xs text-gray-500">{t('behaviour')}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl p-3 bg-[#1e293b]">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {t('trainingAttendance')} — {report.attendance_total > 0
                        ? toWestern(Math.round((report.attendance_present / report.attendance_total) * 100)) : 0}%
                    </div>
                    <div className="text-xl font-bold" style={{ color: '#00d0cb' }}>
                      {toWestern(report.attendance_present)}
                      <span className="text-sm font-normal text-gray-500"> / {toWestern(report.attendance_total)} {t('sessions')}</span>
                    </div>
                    <div className={`flex flex-wrap gap-1 mt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      {[...Array(report.attendance_total || 0)].map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full"
                          style={{ background: i < report.attendance_present ? '#22c55e' : '#ef4444' }} />
                      ))}
                    </div>
                    <div className={`flex gap-3 mt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className={`flex items-center gap-1 text-xs text-gray-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> {t('present')}
                      </span>
                      <span className={`flex items-center gap-1 text-xs text-gray-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> {t('absent')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text feedback */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isRtl ? 'text-right' : ''}`}>
                  {[
                    { label: t('strength'),               val: report.strength,   color: '#22c55e' },
                    { label: t('toImprove'),              val: report.to_improve, color: '#f59e0b' },
                    { label: t('objectiveForNextMonth'),  val: report.objective,  color: '#4fb0ff' },
                    { label: t('coachComment'),           val: report.comment,    color: '#94a3b8' },
                  ].filter(f => f.val).map(f => (
                    <div key={f.label} className="rounded-xl p-3 bg-[#1e293b]">
                      <div className="text-xs font-semibold mb-1.5" style={{ color: f.color }}>{f.label}</div>
                      <div className="text-sm text-gray-300 leading-relaxed">{f.val}</div>
                    </div>
                  ))}
                </div>

                {/* Progression chart */}
                {reports.length > 1 && (
                  <div className={`rounded-xl p-3 bg-[#1e293b] ${isRtl ? 'text-right' : ''}`}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {t('progressionClickPoint')}
                    </div>
                    <div style={{ position: 'relative', width: '100%', height: 130 }}>
                      <Line data={progData} options={progOpts} />
                    </div>
                    <div className={`flex gap-4 mt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className={`flex items-center gap-1 text-xs text-gray-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="inline-block w-3 h-0.5 bg-[#4fb0ff]" /> {t('overall') || 'Overall'}
                      </span>
                      <span className={`flex items-center gap-1 text-xs text-gray-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="inline-block w-3 h-0.5 border-t border-dashed border-[#f59e0b]" /> {t('pillar_technical')}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ── FOOTER NAVIGATION ── */}
        {reports.length > 1 && (
          <div className={`flex items-center justify-between px-5 py-3 border-t border-gray-800 bg-[#0f172a]/80 rounded-b-2xl flex-shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white disabled:opacity-30 bg-gray-800 border border-gray-700 ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              <FiChevronLeft size={14} className={isRtl ? 'rotate-180' : ''} /> {t('previous')}
            </button>
            <span className="text-xs text-gray-500">{toWestern(activeIndex + 1)} / {toWestern(reports.length)}</span>
            <button
              onClick={() => setActiveIndex(i => Math.min(reports.length - 1, i + 1))}
              disabled={activeIndex === reports.length - 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white disabled:opacity-30 bg-gray-800 border border-gray-700 ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              {t('next')} <FiChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
};

export default PlayerReportHistoryModal;
