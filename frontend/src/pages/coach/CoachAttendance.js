import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiCheck, FiX, FiClock, FiAlertCircle, FiChevronLeft,
  FiChevronRight, FiMessageSquare, FiCalendar, FiUsers,
  FiArrowLeft, FiFileText, FiEdit2, FiCornerDownRight,
} from 'react-icons/fi';
import API from '../api';

/* ══════════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════════ */
const STATUSES = [
  { key: 'Present', label: 'Present', color: '#22c55e',  dimColor: 'rgba(34,197,94,0.12)',   icon: FiCheck       },
  { key: 'Absent',  label: 'Absent',  color: '#ef4444',  dimColor: 'rgba(239,68,68,0.12)',   icon: FiX           },
  { key: 'Late',    label: 'Late',    color: '#f59e0b',  dimColor: 'rgba(245,158,11,0.12)',  icon: FiClock       },
  { key: 'Excused', label: 'Excused', color: '#60a5fa',  dimColor: 'rgba(96,165,250,0.12)',  icon: FiAlertCircle },
];

const PAGE = { GROUPS: 'groups', PLAYERS: 'players', DOSSIER: 'dossier' };

const pageTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0,  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, x: -18, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
};

/* ══════════════════════════════════════════════════════════════
   Small helpers
══════════════════════════════════════════════════════════════ */
const initials = name =>
  (name || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const StatusBadge = ({ status, size = 'sm' }) => {
  const { t } = useTranslation('attendance');
  const s = STATUSES.find(x => x.key === status) || STATUSES[0];
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full px-2.5 ${size === 'sm' ? 'py-0.5 text-[11px]' : 'py-1 text-xs'}`}
      style={{ color: s.color, background: s.dimColor }}
    >
      <s.icon size={10} />
      {t(s.key.toLowerCase())}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   Note popover
══════════════════════════════════════════════════════════════ */
const NotePopover = ({ value, onChange, onClose }) => {
  const { t } = useTranslation('attendance');
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => window.addEventListener('mousedown', h), 0);
    return () => window.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -6 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-8 z-[200] w-64 rounded-xl shadow-2xl overflow-hidden"
      style={{ background: 'rgba(10,14,36,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <FiMessageSquare size={12} className="text-gray-500" />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('note_reason')}</span>
      </div>
      <div className="p-2">
        <textarea
          autoFocus
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={t('note_placeholder')}
          className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none outline-none px-1 py-1"
        />
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   View 1 — Group Selector
══════════════════════════════════════════════════════════════ */
const GroupsView = ({ groups, players, date, setDate, onSelect, isLoading }) => {
  const { t } = useTranslation('attendance');
  const playerCountForGroup = id => players.filter(p => Number(p.group?.id) === Number(id)).length;

  return (
    <motion.div key="groups" {...pageTransition}>
      {/* ── toolbar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('select_group_hint')}
          </p>
        </div>
        {/* Date */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <FiCalendar size={14} className="text-gray-500 flex-shrink-0" />
          <input
            type="date" value={date}
            onChange={e => setDate(e.target.value)}
            className="date-input-clean bg-transparent text-sm text-gray-300 outline-none"
            style={{ colorScheme: 'dark', minWidth: 120 }}
          />
        </div>
      </div>

      {/* ── group list ──────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center text-gray-600">{t('no_groups')}</div>
      ) : (
        <motion.div className="space-y-1" initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
          {groups.map(g => {
            const count = playerCountForGroup(g.id);
            const subCount = g.subgroups?.length || 0;
            return (
              <motion.button
                key={g.id}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                onClick={() => onSelect(g)}
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-left group transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(144,43,209,0.3),rgba(0,208,203,0.2))', color: '#00d0cb' }}>
                    {g.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-[#00d0cb] transition-colors">{g.name}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {t('players_count', { count })}
                      {subCount > 0 && ` · ${t('subgroups_count', { count: subCount })}`}
                    </p>
                  </div>
                </div>
                <FiChevronRight size={16} className="text-gray-600 group-hover:text-[#00d0cb] transition-colors" />
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   View 2 — Player List
══════════════════════════════════════════════════════════════ */
const PlayersView = ({ group, players, date, attendance, noteOpen, setNoteOpen,
  onStatusChange, onNotesChange, onBack, onSave, isSaving }) => {
  const { t, i18n } = useTranslation('attendance');
  const [activeSubgroup, setActiveSubgroup] = useState('');
  const subgroups = group?.subgroups || [];

  const filtered = players.filter(p => {
    const gMatch = Number(p.group?.id) === Number(group?.id);
    const sMatch = !activeSubgroup || Number(p.subgroup?.id) === Number(activeSubgroup);
    return gMatch && sMatch;
  });

  const presentCount = filtered.filter(p => attendance[p.id]?.status === 'Present').length;

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <motion.div key="players" {...pageTransition}>
      {/* ── header ──────────────────────────────────────── */}
      <div className="mb-6">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4">
          <FiArrowLeft size={13} /> {t('all_groups')}
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{group?.name}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <FiCalendar size={12} />{formattedDate}
              <span className="text-gray-700">·</span>
              <FiUsers size={12} />{filtered.length} player{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span style={{ color: '#22c55e' }} className="font-semibold">{presentCount}</span>
            <span className="text-gray-700">/</span>
            <span>{filtered.length}</span>
            <span className="text-gray-600">{t('present').toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* ── subgroup tabs ────────────────────────────────── */}
      {subgroups.length > 0 && (
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
          {[{ id: '', name: t('subgroup_all') }, ...subgroups].map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSubgroup(s.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={String(activeSubgroup) === String(s.id)
                ? { background: 'rgba(0,208,203,0.12)', color: '#00d0cb', border: '1px solid rgba(0,208,203,0.25)' }
                : { background: 'transparent', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* ── divider ──────────────────────────────────────── */}
      <div className="grid grid-cols-12 px-4 py-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-600">
        <span className="col-span-5">{t('player_label')}</span>
        <span className="col-span-6">{t('status_label')}</span>
        <span className="col-span-1 text-right">{t('note_label')}</span>
      </div>

      {/* ── player rows ─────────────────────────────────── */}
      <div className="space-y-px">
        <AnimatePresence>
          {filtered.map((player, i) => {
            const att = attendance[player.id] || { status: 'Present', notes: '' };
            const isNoteOpen = noteOpen === player.id;
            const hasNote = !!att.notes?.trim();
            const currentS = STATUSES.find(s => s.key === att.status) || STATUSES[0];

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="relative grid grid-cols-12 items-center px-4 py-3 rounded-xl group transition-colors"
                style={{
                  background: isNoteOpen ? 'rgba(0,208,203,0.04)' : 'rgba(255,255,255,0.02)',
                  borderLeft: `2px solid ${att.status !== 'Present' ? currentS.color + '50' : 'transparent'}`,
                }}
              >
                {/* Player info */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,rgba(144,43,209,0.4),rgba(79,176,255,0.4))' }}>
                    {player.profile_picture || player.photo_url
                      ? <img src={player.profile_picture || player.photo_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-white">{initials(player.full_name)}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{player.full_name}</p>
                    {player.position && (
                      <p className="text-[10px] text-gray-600 truncate">{player.position}</p>
                    )}
                  </div>
                </div>

                {/* Status buttons */}
                <div className="col-span-6 flex items-center gap-1 flex-wrap">
                  {STATUSES.map(s => {
                    const active = att.status === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => onStatusChange(player.id, s.key)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                        style={active
                          ? { color: s.color, background: s.dimColor, border: `1px solid ${s.color}40` }
                          : { color: '#4b5563', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        {t(s.key.toLowerCase())}
                      </button>
                    );
                  })}
                </div>

                {/* Note icon */}
                <div className="col-span-1 flex justify-end relative">
                  <button
                    onClick={e => { e.stopPropagation(); setNoteOpen(isNoteOpen ? null : player.id); }}
                    className="p-1.5 rounded-lg transition-colors"
                    style={hasNote || isNoteOpen
                      ? { color: '#00d0cb', background: 'rgba(0,208,203,0.1)' }
                      : { color: '#374151' }}
                  >
                    <FiMessageSquare size={13} />
                    {hasNote && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#00d0cb]" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isNoteOpen && (
                      <NotePopover
                        value={att.notes}
                        onChange={v => onNotesChange(player.id, v)}
                        onClose={() => setNoteOpen(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── footer ──────────────────────────────────────── */}
      <div className="mt-6 pt-4 flex items-center justify-between border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-xs text-gray-600">
          {t('players_count', { count: filtered.length })} · {date}
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onSave}
          disabled={isSaving || filtered.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(90deg,#902bd1,#00d0cb)', boxShadow: '0 4px 24px rgba(144,43,209,0.3)' }}
        >
          {isSaving
            ? <><div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" /> {t('saving')}</>
            : <><FiCheck size={14} /> {t('confirm_session')}</>}
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   View 3 — Dossier (read-only summary)
══════════════════════════════════════════════════════════════ */
const DossierView = ({ group, date, players, attendance, onEdit, onNewSession }) => {
  const { t, i18n } = useTranslation('attendance');
  const groupPlayers = players.filter(p => Number(p.group?.id) === Number(group?.id));

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = groupPlayers.filter(p => attendance[p.id]?.status === s.key).length;
    return acc;
  }, {});

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <motion.div key="dossier" {...pageTransition}>
      {/* ── dossier header ──────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            {t('session_confirmed')}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">{group?.name}</h1>
        <p className="text-sm text-gray-500">{formattedDate}</p>

        {/* Summary line */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          {STATUSES.map(s => counts[s.key] > 0 && (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="text-lg font-bold" style={{ color: s.color }}>{counts[s.key]}</span>
              <span className="text-xs text-gray-600">{t(s.key.toLowerCase())}</span>
            </div>
          ))}
        </div>

        {/* Thin divider progress */}
        <div className="mt-4 flex h-1 rounded-full overflow-hidden gap-px">
          {STATUSES.map(s => counts[s.key] > 0 && (
            <motion.div
              key={s.key}
              initial={{ flex: 0 }}
              animate={{ flex: counts[s.key] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: s.color, opacity: 0.7 }}
            />
          ))}
        </div>
      </div>

      {/* ── player list ─────────────────────────────────── */}
      <div className="space-y-px mb-8">
        {groupPlayers.map((player, i) => {
          const att = attendance[player.id] || { status: 'Present', notes: '' };
          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.025 }}
              className="flex items-center gap-4 py-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {player.profile_picture || player.photo_url
                  ? <img src={player.profile_picture || player.photo_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-gray-400">{initials(player.full_name)}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-200">{player.full_name}</span>
                {att.notes && (
                  <span className="text-[11px] text-gray-600 ml-2">— {att.notes}</span>
                )}
              </div>
              <StatusBadge status={att.status} />
            </motion.div>
          );
        })}
      </div>

      {/* ── actions ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white border border-transparent hover:border-white/10 transition-all"
        >
          <FiEdit2 size={13} /> {t('edit_session')}
        </button>
        <button
          onClick={onNewSession}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ color: '#00d0cb', background: 'rgba(0,208,203,0.08)', border: '1px solid rgba(0,208,203,0.15)' }}
        >
          <FiCornerDownRight size={13} /> {t('new_session')}
        </button>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Root component
══════════════════════════════════════════════════════════════ */
const CoachAttendance = () => {
  const [players, setPlayers]   = useState([]);
  const [groups, setGroups]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage]               = useState(PAGE.GROUPS);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance]   = useState({});
  const [noteOpen, setNoteOpen]       = useState(null);
  const [isSaving, setIsSaving]       = useState(false);

  /* fetch */
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [pRes, gRes] = await Promise.all([API.get('players/'), API.get('groups/')]);
        setPlayers(pRes.data);
        setGroups(gRes.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  /* load existing attendance when group/date selected */
  useEffect(() => {
    if (!selectedGroup || !date) return;
    (async () => {
      try {
        const res = await API.get(`attendance/coach/players/?group_id=${selectedGroup.id}&date=${date}`);
        const map = {};
        res.data.forEach(r => { map[r.player_id] = { status: r.status, notes: r.notes || '' }; });
        setAttendance(map);
      } catch (e) { console.error(e); }
    })();
  }, [selectedGroup, date]);

  /* init defaults */
  useEffect(() => {
    if (!selectedGroup) return;
    const groupPlayers = players.filter(p => Number(p.group?.id) === Number(selectedGroup?.id));
    setAttendance(prev => {
      const next = { ...prev };
      groupPlayers.forEach(p => { if (!next[p.id]) next[p.id] = { status: 'Present', notes: '' }; });
      return next;
    });
  }, [selectedGroup, players]);

  const handleGroupSelect = useCallback(group => {
    setSelectedGroup(group);
    setPage(PAGE.PLAYERS);
  }, []);

  const handleStatusChange = (id, status) =>
    setAttendance(p => ({ ...p, [id]: { ...p[id], status } }));

  const handleNotesChange = (id, notes) =>
    setAttendance(p => ({ ...p, [id]: { ...p[id], notes } }));

  const handleSave = async () => {
    if (!selectedGroup) return;
    const groupPlayers = players.filter(p => Number(p.group?.id) === Number(selectedGroup.id));
    setIsSaving(true);
    try {
      await API.post('attendance/coach/mark/', {
        group_id: selectedGroup.id,
        subgroup_id: null,
        date,
        attendances: groupPlayers.map(p => ({
          player_id: p.id,
          status: attendance[p.id]?.status || 'Present',
          notes: attendance[p.id]?.notes || '',
        })),
      });
      setPage(PAGE.DOSSIER);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white px-5 py-8 md:px-10"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
    >
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {page === PAGE.GROUPS && (
            <GroupsView
              key="groups"
              groups={groups}
              players={players}
              date={date}
              setDate={setDate}
              onSelect={handleGroupSelect}
              isLoading={isLoading}
            />
          )}
          {page === PAGE.PLAYERS && (
            <PlayersView
              key="players"
              group={selectedGroup}
              players={players}
              date={date}
              attendance={attendance}
              noteOpen={noteOpen}
              setNoteOpen={setNoteOpen}
              onStatusChange={handleStatusChange}
              onNotesChange={handleNotesChange}
              onBack={() => setPage(PAGE.GROUPS)}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}
          {page === PAGE.DOSSIER && (
            <DossierView
              key="dossier"
              group={selectedGroup}
              date={date}
              players={players}
              attendance={attendance}
              onEdit={() => setPage(PAGE.PLAYERS)}
              onNewSession={() => { setSelectedGroup(null); setAttendance({}); setPage(PAGE.GROUPS); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoachAttendance;
