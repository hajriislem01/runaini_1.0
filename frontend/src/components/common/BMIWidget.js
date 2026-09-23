import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LuActivity, LuScale, LuRuler, LuCalendarHeart,
  LuInfo, LuTrendingUp, LuTrendingDown,
} from 'react-icons/lu';
import { calculateAge } from '../../utils/dateHelpers';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

/* ─── constants ────────────────────────────────────────────────────────────── */
const MIN_BMI = 14;
const MAX_BMI = 35;

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const getBmiCategory = (bmiNum, isYouth) => {
  if (bmiNum < 18.5) return {
    category : isYouth ? 'Steady Growth'  : 'Underweight',
    color    : isYouth ? '#3b82f6'        : '#f59e0b',
    status   : isYouth ? 'Growth Monitoring Phase' : 'Requires Nutrition Plan',
  };
  if (bmiNum < 25) return {
    category : isYouth ? 'Optimal Growth' : 'Normal Weight',
    color    : '#22c55e',
    status   : isYouth ? 'Good Athletic Balance'   : 'Athletic Balance',
  };
  if (bmiNum < 30) return {
    category : isYouth ? 'Strong Build'   : 'Overweight',
    color    : isYouth ? '#f59e0b'        : '#f97316',
    status   : isYouth ? 'Pre-adolescent Body Mass' : 'Focus on Conditioning',
  };
  return {
    category : isYouth ? 'Power Focus'   : 'Obese',
    color    : '#ef4444',
    status   : isYouth ? 'Pediatric Review Advised' : 'High Performance Risk',
  };
};

/* ─── component ────────────────────────────────────────────────────────────── */
const BMIWidget = ({ player, t }) => {
  const [selectedYear, setSelectedYear] = useState(null);

  if (!player?.weight || !player?.height) return null;
  const weight = parseFloat(player.weight);
  const height = parseFloat(player.height);
  if (height <= 0 || weight <= 0) return null;

  const hM      = height / 100;
  const bmiNum  = weight / (hM * hM);
  const bmi     = bmiNum.toFixed(1);
  const age     = player.date_of_birth ? calculateAge(player.date_of_birth) : null;
  const isYouth = age !== null && age < 18;

  const { category, color, status } = getBmiCategory(bmiNum, isYouth);
  const tr          = (key, fb) => (t ? t(key, fb) : fb);
  const labelCat    = tr(`bmi.categories.${category.replace(/\s+/g, '_')}`, category);
  const labelStatus = tr(`bmi.status.${status.replace(/\s+/g, '_')}`, status);

  /* ── biometric history ──────────────────────────────────────────────────── */
  const rawHistory  = player.biometric_history;
  const hasHistory  = Array.isArray(rawHistory) && rawHistory.length > 1;

  const availableYears = useMemo(() => {
    if (!hasHistory) return [];
    return [...new Set(rawHistory.map(h => new Date(h.date).getFullYear()))]
      .sort((a, b) => a - b);
  }, [hasHistory, rawHistory]);

  const activeYear = selectedYear ?? availableYears[availableYears.length - 1] ?? null;

  const filteredHistory = useMemo(() => {
    if (!hasHistory) return [];
    return activeYear
      ? rawHistory.filter(h => new Date(h.date).getFullYear() === activeYear)
      : rawHistory;
  }, [hasHistory, rawHistory, activeYear]);

  /* ── chart config ───────────────────────────────────────────────────────── */
  const chartData = {
    labels: filteredHistory.map(h => {
      const d = new Date(h.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }),
    datasets: [{
      label              : 'BMI',
      data               : filteredHistory.map(h => parseFloat(h.bmi)),
      borderColor        : color,
      backgroundColor    : `${color}18`,
      borderWidth        : 2.5,
      pointBackgroundColor: color,
      pointBorderColor   : '#0f172a',
      pointBorderWidth   : 2,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: color,
      pointHoverBorderWidth: 2,
      pointRadius        : 5,
      pointHoverRadius   : 7,
      fill               : true,
      tension            : 0.4,
    }],
  };

  const bmiValues = filteredHistory.map(h => parseFloat(h.bmi));
  const chartOptions = {
    responsive         : true,
    maintainAspectRatio: false,
    animation          : { duration: 500 },
    plugins: {
      legend : { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,15,30,0.95)',
        titleColor     : 'rgba(255,255,255,0.5)',
        bodyColor      : '#fff',
        borderColor    : `${color}40`,
        borderWidth    : 1,
        padding        : 10,
        displayColors  : false,
        titleFont      : { size: 10, weight: 'bold' },
        bodyFont       : { size: 14, weight: 'bold' },
        callbacks      : {
          title: ctx => `${ctx[0].label}/${activeYear ?? ''}`,
          label: ctx => `BMI: ${ctx.parsed.y.toFixed(1)}`,
        },
      },
    },
    scales: {
      x: {
        grid : { display: false, drawBorder: false },
        ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 9, weight: '600' }, maxRotation: 0 },
      },
      y: {
        display     : false,
        grid        : { display: false },
        suggestedMin: bmiValues.length ? Math.min(...bmiValues) - 2 : MIN_BMI,
        suggestedMax: bmiValues.length ? Math.max(...bmiValues) + 2 : MAX_BMI,
      },
    },
    interaction: { mode: 'nearest', intersect: false },
  };

  /* ── trend ──────────────────────────────────────────────────────────────── */
  let trend = null;
  if (hasHistory) {
    const prev = [...rawHistory]
      .reverse()
      .find(h => h.bmi && Math.abs(parseFloat(h.bmi) - bmiNum) > 0.05);
    if (prev) {
      const delta = bmiNum - parseFloat(prev.bmi);
      trend = { isUp: delta > 0, val: Math.abs(delta).toFixed(1) };
    }
  }

  /* ── gauge ──────────────────────────────────────────────────────────────── */
  const clamped = Math.max(MIN_BMI, Math.min(MAX_BMI, bmiNum));
  const percent = ((clamped - MIN_BMI) / (MAX_BMI - MIN_BMI)) * 100;

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl p-5 sm:p-6 md:p-8 mb-6 overflow-hidden border border-white/[0.07] shadow-2xl"
      style={{
        background    : 'linear-gradient(145deg,rgba(15,23,42,0.78),rgba(15,23,42,0.48))',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Ambient glows */}
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-[90px] opacity-[0.18] pointer-events-none" style={{ background: color }} />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-[80px] opacity-[0.08] pointer-events-none" style={{ background: '#4fb0ff' }} />

      {/*
        ── LAYOUT ──────────────────────────────────────────────────────────────
        Mobile/Tablet : single column
        XL+           : left (flex-1) | right (fixed 260px IMC card)
      */}
      <div className="relative z-10 flex flex-col xl:flex-row gap-5 xl:gap-8">

        {/* ═══════════════════════════════════════════════════════════════════
            LEFT — Header · Mini-cards · Pediatric notice · Evolution chart
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
              <LuActivity size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide leading-tight">
                {tr('bmi.title_rich', 'Physical Performance & BMI')}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {tr('bmi.subtitle', 'Biometric tracking & body composition')}
              </p>
            </div>
          </div>

          {/* ── Mini stat cards: Height / Weight / Age ── */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { Icon: LuRuler,         value: height,     unit: 'cm',   hover: 'group-hover:text-blue-400'   },
              { Icon: LuScale,         value: weight,     unit: 'kg',   hover: 'group-hover:text-amber-400'  },
              { Icon: LuCalendarHeart, value: age ?? '—', unit: 'yrs',  hover: 'group-hover:text-rose-400'   },
            ].map(({ Icon, value, unit, hover }, i) => (
              <div
                key={i}
                className="bg-black/20 rounded-2xl p-3 sm:p-4 border border-white/5
                           flex flex-col items-center justify-center gap-1
                           group hover:bg-black/30 transition-colors"
              >
                <Icon size={18} className={`text-gray-500 transition-colors ${hover}`} />
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">{value}</div>
                <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">{unit}</div>
              </div>
            ))}
          </div>

          {/* Pediatric notice */}
          {isYouth && (
            <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
              <LuInfo size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {tr(
                  'bmi.pediatric_notice',
                  'For youth academy players, BMI is assessed alongside growth stages and physical development — not strict adult-only thresholds. Consult club medical staff for precise growth percentiles.',
                )}
              </p>
            </div>
          )}

          {/* ── Biometric Evolution chart ── */}
          {hasHistory && (
            <div className="bg-black/20 rounded-2xl p-4 sm:p-5 border border-white/5">

              {/* Chart toolbar */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <LuTrendingUp size={12} className="text-blue-400" />
                  Biometric Evolution
                </h3>

                {/* Year tabs (only when >1 year) */}
                {availableYears.length > 1 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {availableYears.map(yr => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(yr)}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all"
                        style={
                          activeYear === yr
                            ? { background: `${color}22`, color, border: `1px solid ${color}45` }
                            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }
                        }
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                )}

                {/* Single-year badge */}
                {availableYears.length === 1 && (
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                  >
                    {availableYears[0]}
                  </span>
                )}
              </div>

              {/* Chart or empty state */}
              {filteredHistory.length >= 2 ? (
                <>
                  <div className="h-36 sm:h-44 w-full">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                  {/* Delta footer */}
                  <div className="flex items-center justify-between mt-2.5 text-[9px] sm:text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
                    <span>↑ Higher</span>
                    <span style={{ color }}>
                      Δ {(
                        parseFloat(filteredHistory[filteredHistory.length - 1]?.bmi ?? bmiNum) -
                        parseFloat(filteredHistory[0]?.bmi ?? bmiNum)
                      ).toFixed(1)} since first entry
                    </span>
                    <span>Lower ↓</span>
                  </div>
                </>
              ) : (
                <div className="h-20 flex items-center justify-center">
                  <p className="text-[11px] text-gray-500 italic text-center">
                    Not enough data points for {activeYear}.
                    {availableYears.length > 1 && ' Try another year or add a new check-in.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT — IMC Gauge card
            On mobile/tablet this sits below the left column (single-column).
            On xl+ it appears as a fixed 260px sidebar.
        ═══════════════════════════════════════════════════════════════════ */}
        {/*
          RIGHT — IMC Gauge card
          - On xl+ (side-by-side): fixed 260px, vertically centered next to the left column
          - On mobile/tablet: full width, card capped at 340px and centered with mx-auto
        */}
        <div className="xl:w-[260px] w-full flex-shrink-0 flex flex-col items-center xl:justify-center">
          <div
            className="bg-black/30 rounded-3xl p-6 border border-white/[0.06] relative overflow-hidden
                       w-full max-w-[340px] xl:max-w-none mx-auto"
            style={{ boxShadow: `0 0 48px -16px ${color}40` }}
          >
            {/* Watermark icon — decorative */}
            <div className="absolute bottom-3 right-3 opacity-[0.05] pointer-events-none select-none">
              <LuTrendingUp size={88} style={{ color }} />
            </div>

            {/* ── Label row: IMC Score title + trend badge, both centered ── */}
            <div className="flex items-center justify-center gap-2 mb-3 relative z-10">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                {tr('bmi.imc_score', 'IMC Score')}
              </span>
              {trend && (
                <div
                  className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full border ${
                    trend.isUp
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                      : 'text-blue-400 bg-blue-500/10 border-blue-500/25'
                  }`}
                  title="Change vs last measurement"
                >
                  {trend.isUp ? <LuTrendingUp size={9} /> : <LuTrendingDown size={9} />}
                  {trend.val}
                </div>
              )}
            </div>

            {/* ── Big BMI number ── */}
            <div className="relative z-10 flex flex-col items-center leading-none mb-1">
              <span
                className="text-[5rem] sm:text-[5.5rem] xl:text-[5rem] font-black tracking-tighter"
                style={{ color, textShadow: `0 0 40px ${color}50` }}
              >
                {bmi}
              </span>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                kg/m²
              </div>
            </div>

            {/* ── Category badge — centered ── */}
            <div className="flex justify-center mt-3 mb-5 relative z-10">
              <div
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border font-bold text-xs"
                style={{ backgroundColor: `${color}14`, borderColor: `${color}40`, color }}
              >
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                {labelCat}
              </div>
            </div>

            {/* ── Gradient scale bar ── */}
            <div className="relative z-10">
              {/* Range labels */}
              <div className="flex justify-between text-[9px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                <span>{MIN_BMI}</span>
                <span>Healthy</span>
                <span>{MAX_BMI}</span>
              </div>

              {/* Track */}
              <div className="h-2.5 w-full bg-gray-800/70 rounded-full overflow-hidden relative border border-gray-700/30">
                <div
                  className="absolute inset-0 opacity-70 rounded-full"
                  style={{ background: 'linear-gradient(to right,#3b82f6 12%,#22c55e 38%,#f59e0b 68%,#ef4444 94%)' }}
                />
                <motion.div
                  initial={{ left: 0 }}
                  animate={{ left: `${percent}%` }}
                  transition={{ type: 'spring', stiffness: 40, damping: 15 }}
                  className="absolute top-0 bottom-0 w-2 -ml-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] z-20"
                />
              </div>

              {/* Status */}
              <div className="mt-3 text-center relative z-10">
                <span className="text-[11px] font-semibold text-gray-400 leading-snug">{labelStatus}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default BMIWidget;
