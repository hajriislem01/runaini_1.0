import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiCheck, FiX, FiClock, FiAlertCircle, FiCalendar,
} from 'react-icons/fi';
import API from '../api';
import toast from 'react-hot-toast';
import AdminToaster from '../administration/shared/AdminToaster';

/* ══════════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════════ */
const STATUSES = {
  Present: { color: '#22c55e', dimColor: 'rgba(34,197,94,0.1)',  dotColor: '#22c55e', icon: FiCheck,       label: 'Present'  },
  Absent:  { color: '#ef4444', dimColor: 'rgba(239,68,68,0.1)',  dotColor: '#ef4444', icon: FiX,           label: 'Absent'   },
  Late:    { color: '#f59e0b', dimColor: 'rgba(245,158,11,0.1)', dotColor: '#f59e0b', icon: FiClock,       label: 'Late'     },
  Excused: { color: '#60a5fa', dimColor: 'rgba(96,165,250,0.1)', dotColor: '#60a5fa', icon: FiAlertCircle, label: 'Excused'  },
};

/* ══════════════════════════════════════════════════════════════
   Group history entries by month
══════════════════════════════════════════════════════════════ */
const groupByMonth = (history, locale) => {
  const result = [];
  const seen = {};
  history.forEach(rec => {
    const d = new Date(rec.date + 'T00:00:00');
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    if (!seen[key]) {
      seen[key] = true;
      result.push({ key, label, records: [] });
    }
    result[result.length - 1].records.push(rec);
  });
  return result;
};

/* ══════════════════════════════════════════════════════════════
   Inline stat number
══════════════════════════════════════════════════════════════ */
const StatItem = ({ value, label, color }) => (
  <div className="flex flex-col items-center">
    <span className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</span>
    <span className="text-[10px] uppercase tracking-widest text-gray-600 mt-0.5 font-semibold">{label}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Attendance rate bar
══════════════════════════════════════════════════════════════ */
const RateBar = ({ pct }) => {
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color }}>{pct}%</span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Timeline entry
══════════════════════════════════════════════════════════════ */
const TimelineEntry = ({ record, isLast, index }) => {
  const { t, i18n } = useTranslation('attendance');
  const s = STATUSES[record.status] || STATUSES.Present;
  const Icon = s.icon;
  const d = new Date(record.date + 'T00:00:00');
  const dayNum  = d.toLocaleDateString(i18n.language, { day: 'numeric' });
  const dayName = d.toLocaleDateString(i18n.language, { weekday: 'short' });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 240, damping: 24 }}
      className="flex items-start gap-4"
    >
      {/* Date column */}
      <div className="w-12 text-right flex-shrink-0 pt-0.5">
        <p className="text-[11px] font-bold text-gray-400 uppercase">{dayName}</p>
        <p className="text-lg font-bold text-white leading-none">{dayNum}</p>
      </div>

      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2"
          style={{
            background: s.dotColor,
            ringColor: `${s.dotColor}30`,
            boxShadow: record.status !== 'Present' ? `0 0 8px ${s.dotColor}50` : 'none',
            border: `2px solid ${s.dotColor}`,
            outline: `3px solid ${s.dotColor}20`,
          }}
        />
        {!isLast && (
          <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.06)', minHeight: 24 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-0.5"
            style={{ color: s.color, background: s.dimColor }}
          >
            <Icon size={10} /> {t(record.status.toLowerCase())}
          </span>
          {record.coach_name && (
            <span className="text-[11px] text-gray-700">{record.coach_name}</span>
          )}
        </div>
        {record.notes && (
          <p className="text-[11px] text-gray-600 mt-1 italic">{record.notes}</p>
        )}
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */
const PlayerAttendanceView = () => {
  const { t, i18n } = useTranslation('attendance');
  const [stats, setStats] = useState({
    total: 0, present: 0, absent: 0, excused: 0, late: 0, attendance_percentage: 0,
  });
  const [history, setHistory]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('attendance/player/my/');
        if (res.data) { setStats(res.data.stats); setHistory(res.data.history); }
      } catch (e) {
        console.error(e);
        toast.error(t('load_error', 'Failed to load attendance data'));
      }
      finally { setIsLoading(false); }
    })();
  }, [t]);

  const pct    = stats.attendance_percentage || 0;
  const months = groupByMonth(history, i18n.language);

  return (
    <div
      className="min-h-screen text-white px-5 py-8 md:px-10"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
    >
      <AdminToaster position="top-right" />
      <div className="max-w-2xl mx-auto">

        {/* ── Page heading ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <FiCalendar size={14} className="text-gray-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              {t('my_attendance')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t('record')}
          </h1>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : (
          <>
            {/* ── Stats panel ────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 240, damping: 22 }}
              className="rounded-2xl border p-6 mb-8"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {/* Attendance rate */}
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                    {t('attendance_rate')}
                  </span>
                  <span className="text-xs text-gray-600">{stats.total} {t('sessions')}</span>
                </div>
                <RateBar pct={pct} />
              </div>

              {/* Divider */}
              <div className="border-t mb-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Counts */}
              <div className="grid grid-cols-4 gap-2">
                <StatItem value={stats.present} label={t('present')} color="#22c55e" />
                <StatItem value={stats.absent}  label={t('absent')}  color="#ef4444" />
                <StatItem value={stats.late}    label={t('late')}    color="#f59e0b" />
                <StatItem value={stats.excused} label={t('excused')} color="#60a5fa" />
              </div>
            </motion.div>

            {/* ── Timeline ─────────────────────────────────── */}
            {history.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                    {t('history')}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <span className="text-[11px] text-gray-700">{history.length} {t('sessions')}</span>
                </div>

                <div>
                  {months.map(({ key, label, records }) => (
                    <div key={key} className="mb-6">
                      {/* Month label */}
                      <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-3 ml-16">
                        {label}
                      </p>

                      {/* Timeline entries */}
                      <div>
                        {records.map((rec, i) => (
                          <TimelineEntry
                            key={rec.id}
                            record={rec}
                            isLast={i === records.length - 1 && key === months[months.length - 1].key}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <FiCalendar size={20} className="text-gray-700" />
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  {t('no_history')}
                </p>
                <p className="text-xs text-gray-700">
                  {t('no_history_hint')}
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default PlayerAttendanceView;
