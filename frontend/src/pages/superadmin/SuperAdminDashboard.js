import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiLogOut, FiArrowLeft, FiPlus } from 'react-icons/fi';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminLeadsPanel from './SuperAdminLeadsPanel';
import SuperAdminAcademiesPanel from './SuperAdminAcademiesPanel';
import SuperAdminStatsPanel from './SuperAdminStatsPanel';
import SuperAdminCreateAdminModal from './SuperAdminCreateAdminModal';
import { GOLD, BORDER_GLASS, BG_DEEP, BG_CARD, TEXT_MUTED } from './theme';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('leads');
  const [refreshTick, setRefreshTick] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const bumpRefresh = useCallback(() => setRefreshTick(t => t + 1), []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let role = '';
    try {
      role = JSON.parse(localStorage.getItem('user') || '{}').role;
    } catch { /* ignore */ }
    if (!token || role !== 'superadmin') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: `linear-gradient(160deg, ${BG_DEEP} 0%, #0a0c12 40%, #120a18 100%)` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <header
        className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-4 md:px-8 py-5 border-b"
        style={{ borderColor: BORDER_GLASS, background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2a)`, boxShadow: `0 0 28px ${GOLD}44` }}
          >
            <FiShield className="text-black" size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black text-white tracking-tight truncate">Super Admin</h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] truncate" style={{ color: GOLD }}>
              Management console
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-black transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #b8923a)`, boxShadow: `0 0 24px ${GOLD}33` }}
          >
            <FiPlus size={18} strokeWidth={2.5} /> Create admin
          </button>
          <Link
            to="/"
            className="text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors"
            style={{ color: TEXT_MUTED }}
          >
            <FiArrowLeft size={14} /> Site
          </Link>
          <Link
            to="/logout"
            className="text-sm font-bold flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors"
            style={{ border: `1px solid ${BORDER_GLASS}`, background: BG_CARD }}
          >
            <FiLogOut size={14} /> Log out
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        <SuperAdminSidebar active={tab} onSelect={setTab} />
        <main
          className="flex-1 min-w-0 rounded-2xl p-5 md:p-8"
          style={{
            background: BG_CARD,
            border: `1px solid ${BORDER_GLASS}`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 0 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,168,76,0.08)`,
          }}
        >
          {tab === 'leads' && <SuperAdminLeadsPanel refreshTick={refreshTick} onChanged={bumpRefresh} />}
          {tab === 'academies' && <SuperAdminAcademiesPanel refreshTick={refreshTick} />}
          {tab === 'stats' && <SuperAdminStatsPanel refreshTick={refreshTick} />}
        </main>
      </div>

      <SuperAdminCreateAdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={bumpRefresh}
      />
    </div>
  );
}
