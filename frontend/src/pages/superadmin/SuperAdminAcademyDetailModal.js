import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import API from '../api';
import StatusBadge from './StatusBadge';
import { GOLD, BORDER_GLASS, BG_CARD, TEXT_MUTED } from './theme';

export default function SuperAdminAcademyDetailModal({ academyId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!academyId) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data: d } = await API.get(`/super-admin/academies/${academyId}/`);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.error || 'Failed to load academy.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [academyId]);

  const a = data?.academy;
  const admin = data?.primary_admin;

  return (
    <AnimatePresence>
      {academyId && (
        <motion.div
          className="fixed inset-0 z-[280] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl"
            style={{
              background: BG_CARD,
              border: `1px solid ${BORDER_GLASS}`,
              boxShadow: `0 0 60px ${GOLD}20`,
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: BORDER_GLASS }}>
              <div>
                <h3 className="text-lg font-extrabold text-white">{a?.name || 'Academy'}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {a?.billing_plan && <StatusBadge value={a.billing_plan} type="plan" />}
                  {a?.subscription_status && <StatusBadge value={a.subscription_status} />}
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
                <FiX size={22} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {loading && <p className="text-sm" style={{ color: TEXT_MUTED }}>Loading…</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}
              {!loading && data && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${BORDER_GLASS}` }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Primary admin</p>
                      {admin ? (
                        <div className="space-y-1 text-gray-300">
                          <p className="text-white font-semibold flex items-center gap-2"><FiUser size={14} />{admin.first_name} {admin.last_name}</p>
                          <p className="flex items-center gap-2"><FiMail size={14} className="opacity-50" />{admin.email}</p>
                          {admin.phone && <p className="flex items-center gap-2"><FiPhone size={14} className="opacity-50" />{admin.phone}</p>}
                        </div>
                      ) : (
                        <p style={{ color: TEXT_MUTED }}>No admin user linked.</p>
                      )}
                    </div>
                    <div className="rounded-xl p-4 flex flex-col justify-center" style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${BORDER_GLASS}` }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Totals</p>
                      <p className="text-2xl font-black text-white">{data.coach_count} <span className="text-sm font-semibold text-gray-400">coaches</span></p>
                      <p className="text-2xl font-black text-white mt-1">{data.player_count} <span className="text-sm font-semibold text-gray-400">players</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Coaches</h4>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: BORDER_GLASS }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: 'rgba(201,168,76,0.08)' }}>
                            <th className="text-left px-3 py-2 text-[10px] uppercase font-bold" style={{ color: GOLD }}>Name</th>
                            <th className="text-left px-3 py-2 text-[10px] uppercase font-bold" style={{ color: GOLD }}>Email</th>
                            <th className="text-left px-3 py-2 text-[10px] uppercase font-bold" style={{ color: GOLD }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.coaches || []).map(c => (
                            <tr key={c.id} className="border-t border-white/5">
                              <td className="px-3 py-2 text-gray-200">{c.first_name} {c.last_name}</td>
                              <td className="px-3 py-2 text-gray-400">{c.email}</td>
                              <td className="px-3 py-2"><StatusBadge value={(c.coach_status || 'active').toLowerCase()} /></td>
                            </tr>
                          ))}
                          {(!data.coaches || data.coaches.length === 0) && (
                            <tr><td colSpan={3} className="px-3 py-4 text-center" style={{ color: TEXT_MUTED }}>No coaches yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Players</h4>
                    <div className="rounded-xl overflow-hidden border max-h-56 overflow-y-auto" style={{ borderColor: BORDER_GLASS }}>
                      <table className="w-full text-sm">
                        <thead className="sticky top-0" style={{ background: 'rgba(201,168,76,0.08)' }}>
                          <tr>
                            <th className="text-left px-3 py-2 text-[10px] uppercase font-bold" style={{ color: GOLD }}>Name</th>
                            <th className="text-left px-3 py-2 text-[10px] uppercase font-bold" style={{ color: GOLD }}>Email</th>
                            <th className="text-left px-3 py-2 text-[10px] uppercase font-bold" style={{ color: GOLD }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.players || []).map(p => (
                            <tr key={p.id} className="border-t border-white/5">
                              <td className="px-3 py-2 text-gray-200">{p.full_name}</td>
                              <td className="px-3 py-2 text-gray-400">{p.email}</td>
                              <td className="px-3 py-2"><StatusBadge value={(p.status || 'Active').toLowerCase()} /></td>
                            </tr>
                          ))}
                          {(!data.players || data.players.length === 0) && (
                            <tr><td colSpan={3} className="px-3 py-4 text-center" style={{ color: TEXT_MUTED }}>No players yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
