import React, { useEffect, useState } from 'react';
import { FiMoreVertical, FiEye } from 'react-icons/fi';
import API from '../api';
import StatusBadge from './StatusBadge';
import SuperAdminAcademyDetailModal from './SuperAdminAcademyDetailModal';
import { GOLD, BORDER_GLASS, BG_CARD, TEXT_MUTED } from './theme';

export default function SuperAdminAcademiesPanel({ refreshTick }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = e => {
      if (!e.target.closest('[data-sa-academy-menu]')) setMenuOpen(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await API.get('/super-admin/academies/');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.detail || 'Could not load academies.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Academy admins</h2>
        <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
          Every row is an academy with its primary admin and roster counts.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: BG_CARD, border: `1px solid ${BORDER_GLASS}`, backdropFilter: 'blur(16px)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr style={{ background: 'rgba(201,168,76,0.07)' }}>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Academy</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Admin</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Plan</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Status</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Coaches</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Players</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }} />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: TEXT_MUTED }}>Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: TEXT_MUTED }}>No academies yet.</td></tr>
              )}
              {!loading && rows.map(row => (
                <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02] relative">
                  <td className="px-4 py-3 font-semibold text-white">{row.name}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-200">{row.admin_display_name || '—'}</div>
                    <div className="text-xs text-gray-500">{row.admin_email || ''}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={row.billing_plan} type="plan" /></td>
                  <td className="px-4 py-3"><StatusBadge value={row.subscription_status} /></td>
                  <td className="px-4 py-3 text-right text-gray-200 font-mono">{row.coach_count}</td>
                  <td className="px-4 py-3 text-right text-gray-200 font-mono">{row.player_count}</td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      type="button"
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                      onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === row.id ? null : row.id); }}
                    >
                      <FiMoreVertical size={18} />
                    </button>
                    {menuOpen === row.id && (
                      <div
                        data-sa-academy-menu
                        className="absolute right-2 top-full mt-1 z-20 rounded-xl py-1 min-w-[140px] text-left shadow-xl"
                        style={{ background: '#0c0e14', border: `1px solid ${BORDER_GLASS}` }}
                      >
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-200 hover:bg-white/5 flex items-center gap-2"
                          onClick={() => { setDetailId(row.id); setMenuOpen(null); }}
                        >
                          <FiEye size={14} /> View details
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SuperAdminAcademyDetailModal academyId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
