import React, { useEffect, useState } from 'react';
import { FiLayers, FiUsers, FiUserCheck, FiInbox, FiCheckCircle, FiXCircle, FiArchive } from 'react-icons/fi';
import API from '../api';
import { GOLD, GOLD_LIGHT, BORDER_GLASS, BG_CARD, TEXT_MUTED } from './theme';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: BG_CARD,
        border: `1px solid ${BORDER_GLASS}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }}
      />
      <Icon size={22} style={{ color: GOLD }} className="mb-3" />
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: GOLD_LIGHT }}>{label}</p>
      {sub && <p className="text-[10px] mt-2" style={{ color: TEXT_MUTED }}>{sub}</p>}
    </div>
  );
}

export default function SuperAdminStatsPanel({ refreshTick }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await API.get('/super-admin/stats/');
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.detail || 'Failed to load stats.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  if (loading && !stats) {
    return <p className="text-sm" style={{ color: TEXT_MUTED }}>Loading statistics…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">System overview</h2>
        <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>Aggregated counts across the platform.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FiLayers} label="Academies" value={stats?.academy_count ?? '—'} />
        <StatCard icon={FiUserCheck} label="Academy admins" value={stats?.admin_count ?? '—'} />
        <StatCard icon={FiUsers} label="Coaches" value={stats?.coach_count ?? '—'} />
        <StatCard icon={FiUsers} label="Players" value={stats?.player_count ?? '—'} />
        <StatCard icon={FiInbox} label="Pending leads" value={stats?.pending_leads ?? '—'} sub="Awaiting review" />
        <StatCard icon={FiCheckCircle} label="Approved leads" value={stats?.approved_leads ?? '—'} />
        <StatCard icon={FiXCircle} label="Rejected leads" value={stats?.rejected_leads ?? '—'} />
        <StatCard icon={FiArchive} label="Archived leads" value={stats?.archived_leads ?? '—'} />
      </div>

      {stats?.plans_distribution && stats.plans_distribution.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: BG_CARD,
            border: `1px solid ${BORDER_GLASS}`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest opacity-80">
            Academy Plans Distribution
          </h3>
          <div className="space-y-3">
            {stats.plans_distribution.map((p) => (
              <div key={p.billing_plan} className="flex items-center justify-between">
                <span className="text-xs font-medium capitalize" style={{ color: GOLD_LIGHT }}>
                  {p.billing_plan}
                </span>
                <div className="flex-1 mx-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      background: GOLD,
                      width: `${(p.count / stats.academy_count) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
