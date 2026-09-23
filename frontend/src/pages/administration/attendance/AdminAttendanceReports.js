import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiCheck, FiX, FiClock, FiAlertCircle,
  FiChevronDown, FiChevronRight, FiCalendar,
  FiBarChart2, FiUsers, FiInbox, FiCornerDownRight,
} from 'react-icons/fi';
import API from '../../api';

/* ══════════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════════ */
const STATUSES = [
  { key: 'Present', label: 'Present', color: '#22c55e', dimColor: 'rgba(34,197,94,0.12)',  icon: FiCheck       },
  { key: 'Absent',  label: 'Absent',  color: '#ef4444', dimColor: 'rgba(239,68,68,0.12)',  icon: FiX           },
  { key: 'Late',    label: 'Late',    color: '#f59e0b', dimColor: 'rgba(245,158,11,0.12)', icon: FiClock       },
  { key: 'Excused', label: 'Excused', color: '#60a5fa', dimColor: 'rgba(96,165,250,0.12)', icon: FiAlertCircle },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

/* ══════════════════════════════════════════════════════════════
   Status badge
══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const { t } = useTranslation('attendance');
  const s = STATUSES.find(x => x.key === status) || STATUSES[0];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-0.5"
      style={{ color: s.color, background: s.dimColor }}>
      <s.icon size={10} /> {t(s.key.toLowerCase())}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   Slim progress bar row
══════════════════════════════════════════════════════════════ */
const StatusBar = ({ records }) => {
  const { t } = useTranslation('attendance');
  const total = records.length;
  if (!total) return null;
  return (
    <div className="flex h-1 w-24 rounded-full overflow-hidden gap-px flex-shrink-0">
      {STATUSES.map(s => {
        const count = records.filter(r => r.status === s.key).length;
        if (!count) return null;
        return (
          <motion.div
            key={s.key}
            title={`${t(s.key.toLowerCase())}: ${count}`}
            style={{ background: s.color, opacity: 0.7 }}
            initial={{ flex: 0 }}
            animate={{ flex: count / total }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Tree row components
══════════════════════════════════════════════════════════════ */

/** Group row — expandable */
const GroupRow = ({ group, records, children }) => {
  const { t } = useTranslation('attendance');
  const [open, setOpen] = useState(true);
  const groupRecords = records.filter(r => r.group_name === group.name);
  const presentCount = groupRecords.filter(r => r.status === 'Present').length;

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left group transition-colors hover:bg-white/[0.02]"
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }}>
          <FiChevronRight size={13} className="text-gray-600" />
        </motion.div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(144,43,209,0.3),rgba(0,208,203,0.2))', color: '#00d0cb' }}>
          {group.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-white">{group.name}</span>
          <span className="text-[11px] text-gray-600 ml-2">{groupRecords.length} {t('records')}</span>
        </div>
        {/* slim bar + fraction */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBar records={groupRecords} />
          <span className="text-[11px] text-gray-500 w-12 text-right">
            <span style={{ color: '#22c55e' }}>{presentCount}</span>/{groupRecords.length}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="ml-5 pl-4 border-l" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Subgroup row — expandable */
const SubgroupRow = ({ subgroupName, records }) => {
  const { t } = useTranslation('attendance');
  const [open, setOpen] = useState(true);
  const presentCount = records.filter(r => r.status === 'Present').length;

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/[0.02] transition-colors group"
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.16 }}>
          <FiChevronRight size={12} className="text-gray-700" />
        </motion.div>
        <FiCornerDownRight size={11} className="text-gray-700 flex-shrink-0" />
        <span className="flex-1 text-[12px] font-medium text-gray-400">{subgroupName || t('no_subgroup')}</span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBar records={records} />
          <span className="text-[11px] text-gray-600 w-12 text-right">
            <span style={{ color: '#22c55e' }}>{presentCount}</span>/{records.length}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="ml-4 pl-3 border-l" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {records.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.015] transition-colors"
                >
                  {/* Player name */}
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>
                    {(rec.player_name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-[12px] text-gray-300">{rec.player_name}</span>
                  {rec.coach_name && (
                    <span className="text-[10px] text-gray-700 hidden sm:block truncate max-w-[80px]">{rec.coach_name}</span>
                  )}
                  {rec.notes && (
                    <span className="text-[10px] text-gray-600 italic truncate max-w-[80px] hidden md:block" title={rec.notes}>
                      {rec.notes}
                    </span>
                  )}
                  <StatusBadge status={rec.status} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */
const AdminAttendanceReports = () => {
  const { t, i18n } = useTranslation('attendance');
  const [reports, setReports]   = useState([]);
  const [groups, setGroups]     = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading]   = useState(false);

  /* fetch groups once */
  useEffect(() => {
    API.get('groups/').then(r => setGroups(r.data)).catch(console.error);
  }, []);

  /* fetch reports on date change */
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await API.get(`attendance/admin/report/?date=${filterDate}`);
        setReports(res.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [filterDate]);

  /* build tree: group → subgroup → players */
  const tree = groups.map(g => {
    const gRecords = reports.filter(r => r.group_name === g.name);
    if (gRecords.length === 0) return null;

    // gather unique subgroup names within this group
    const subgroupNames = [...new Set(gRecords.map(r => r.subgroup_name || ''))];
    const subgroups = subgroupNames.map(sgName => ({
      name: sgName,
      records: gRecords.filter(r => (r.subgroup_name || '') === sgName),
    }));

    return { group: g, subgroups, records: gRecords };
  }).filter(Boolean);

  /* summary totals */
  const total   = reports.length;
  const present = reports.filter(r => r.status === 'Present').length;
  const absent  = reports.filter(r => r.status === 'Absent').length;
  const other   = reports.filter(r => ['Late','Excused'].includes(r.status)).length;

  const formattedDate = new Date(filterDate + 'T00:00:00').toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="min-h-screen text-white px-5 py-8 md:px-10"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Header ──────────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg,#902bd1,#00d0cb)' }}>
                <FiBarChart2 size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {t('reports_title')}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{formattedDate}</p>
              </div>
            </div>

            {/* Date filter */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border self-start sm:self-auto"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <FiCalendar size={13} className="text-gray-500 flex-shrink-0" />
              <input
                type="date" value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="date-input-clean bg-transparent text-sm text-gray-300 outline-none"
                style={{ colorScheme: 'dark', minWidth: 120 }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Summary strip ────────────────────────────────── */}
        <AnimatePresence>
          {!isLoading && total > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-6 px-5 py-4 rounded-xl border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                {[
                  { label: t('total'),         value: total,   color: '#9ca3af' },
                  { label: t('present'),       value: present, color: '#22c55e' },
                  { label: t('absent'),        value: absent,  color: '#ef4444' },
                  { label: t('late_excused'),  value: other,   color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                    <span className="text-xs text-gray-600">{s.label}</span>
                  </div>
                ))}
                {/* Global bar */}
                <div className="ml-auto flex-shrink-0">
                  <StatusBar records={reports} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tree table ───────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-2 mt-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : tree.length > 0 ? (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="space-y-2"
          >
            {/* Column labels */}
            <div className="flex items-center gap-3 px-4 py-1 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700 flex-1">{t('group_player')}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700 w-24 text-center hidden sm:block">{t('progress')}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700 w-16 text-right">{t('rate')}</span>
            </div>

            {tree.map(({ group, subgroups, records }) => (
              <motion.div key={group.id} variants={fadeUp}
                className="rounded-xl overflow-hidden border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <GroupRow group={group} records={records}>
                  {subgroups.map(sg => (
                    <SubgroupRow key={sg.name || 'none'} subgroupName={sg.name} records={sg.records} />
                  ))}
                </GroupRow>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <FiInbox size={24} className="text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-400 mb-1">
              {t('no_reports')}
            </h3>
            <p className="text-sm text-gray-700">
              {t('try_different_date')}
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AdminAttendanceReports;
