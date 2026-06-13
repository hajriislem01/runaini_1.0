import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMoreVertical, FiCheck, FiX, FiArchive, FiMail, FiPhone, FiUser, FiHome,
  FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle,
} from 'react-icons/fi';
import API from '../api';
import StatusBadge from './StatusBadge';
import { GOLD, BORDER_GLASS, BG_CARD, TEXT_MUTED, GOLD_LIGHT } from './theme';

function splitContactName(name) {
  const t = (name || '').trim();
  if (!t) return { first: '', last: '' };
  const i = t.indexOf(' ');
  if (i === -1) return { first: t, last: '' };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

const PLANS = [
  { value: 'trial', label: 'Trial' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

export default function SuperAdminLeadsPanel({ refreshTick, onChanged }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuId, setMenuId] = useState(null);

  const [approveLead, setApproveLead] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [club, setClub] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [billingPlan, setBillingPlan] = useState('trial');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/super-admin/leads/?status=pending');
      setLeads(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not load leads.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshTick]);

  useEffect(() => {
    if (!menuId) return undefined;
    const close = e => {
      if (!e.target.closest('[data-sa-lead-menu]')) setMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuId]);

  const openApprove = lead => {
    setMenuId(null);
    setFormError('');
    setFormOk('');
    const { first, last } = splitContactName(lead.contact_name);
    setFirstName(first);
    setLastName(last);
    setClub('');
    setPhone((lead.phone || '').replace(/\D/g, '').slice(0, 8));
    setPassword('');
    setConfirm('');
    setBillingPlan('trial');
    setApproveLead(lead);
  };

  const closeApprove = () => {
    if (submitting) return;
    setApproveLead(null);
  };

  const submitApprove = async e => {
    e.preventDefault();
    setFormError('');
    setFormOk('');
    if (password.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setFormError('Passwords do not match.'); return; }
    if (!/^\d{8}$/.test(phone)) { setFormError('Phone must be exactly 8 digits.'); return; }

    setSubmitting(true);
    try {
      await API.post(`/super-admin/leads/${approveLead.id}/approve/`, {
        password,
        first_name: firstName,
        last_name: lastName,
        club,
        phone,
        billing_plan: billingPlan,
        username: approveLead.email,
      });
      setFormOk('Academy created.');
      onChanged?.();
      await load();
      setTimeout(() => { setApproveLead(null); setFormOk(''); }, 1000);
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.detail || 'Approval failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const doReject = async lead => {
    setMenuId(null);
    if (!window.confirm(`Reject lead from "${lead.academy_name}"?`)) return;
    try {
      await API.post(`/super-admin/leads/${lead.id}/reject/`);
      onChanged?.();
      await load();
    } catch (err) {
      window.alert(err.response?.data?.error || 'Reject failed.');
    }
  };

  const doArchive = async lead => {
    setMenuId(null);
    if (!window.confirm(`Archive lead from "${lead.academy_name}"? It will leave the pending queue.`)) return;
    try {
      await API.post(`/super-admin/leads/${lead.id}/archive/`);
      onChanged?.();
      await load();
    } catch (err) {
      window.alert(err.response?.data?.error || 'Archive failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Pending requests</h2>
        <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>Inbound leads from the public request form.</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: BG_CARD, border: `1px solid ${BORDER_GLASS}`, backdropFilter: 'blur(16px)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr style={{ background: 'rgba(201,168,76,0.07)' }}>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Academy</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Contact</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Email</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Phone</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Status</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: GOLD }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: TEXT_MUTED }}>Loading…</td></tr>
              )}
              {!loading && leads.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: TEXT_MUTED }}>No pending requests.</td></tr>
              )}
              {!loading && leads.map(lead => (
                <tr key={lead.id} className="border-t border-white/5 hover:bg-white/[0.02] relative">
                  <td className="px-4 py-3 font-semibold text-white">{lead.academy_name}</td>
                  <td className="px-4 py-3 text-gray-300">{lead.contact_name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">+216 {lead.phone}</td>
                  <td className="px-4 py-3"><StatusBadge value="pending" /></td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      type="button"
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 inline-flex"
                      onClick={e => { e.stopPropagation(); setMenuId(menuId === lead.id ? null : lead.id); }}
                    >
                      <FiMoreVertical size={18} />
                    </button>
                    {menuId === lead.id && (
                      <div
                        data-sa-lead-menu
                        className="absolute right-4 top-full mt-1 z-30 rounded-xl py-1 min-w-[160px] text-left shadow-xl"
                        style={{ background: '#0c0e14', border: `1px solid ${BORDER_GLASS}` }}
                      >
                        <button type="button" className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-300 hover:bg-white/5 flex items-center gap-2"
                          onClick={() => openApprove(lead)}>
                          <FiCheck size={14} /> Approve…
                        </button>
                        <button type="button" className="w-full px-3 py-2 text-left text-xs font-semibold text-amber-200 hover:bg-white/5 flex items-center gap-2"
                          onClick={() => doArchive(lead)}>
                          <FiArchive size={14} /> Archive
                        </button>
                        <button type="button" className="w-full px-3 py-2 text-left text-xs font-semibold text-red-300 hover:bg-white/5 flex items-center gap-2"
                          onClick={() => doReject(lead)}>
                          <FiX size={14} /> Reject
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

      <AnimatePresence>
        {approveLead && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeApprove}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl flex flex-col md:flex-row"
              style={{
                background: BG_CARD,
                border: `1px solid ${BORDER_GLASS}`,
                boxShadow: `0 0 80px ${GOLD}18`,
              }}
            >
              <div
                className="md:w-[42%] p-6 md:border-r flex-shrink-0"
                style={{ borderColor: BORDER_GLASS, background: 'linear-gradient(165deg, rgba(201,168,76,0.12), transparent)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Lead summary</p>
                <h3 className="text-xl font-black text-white leading-tight mb-4">{approveLead.academy_name}</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <FiUser className="mt-0.5 flex-shrink-0 opacity-70" style={{ color: GOLD_LIGHT }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold" style={{ color: TEXT_MUTED }}>Contact name</p>
                      <p className="text-white font-medium">{approveLead.contact_name}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiMail className="mt-0.5 flex-shrink-0 opacity-70" style={{ color: GOLD_LIGHT }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold" style={{ color: TEXT_MUTED }}>Email</p>
                      <p className="text-gray-200 break-all">{approveLead.email}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiPhone className="mt-0.5 flex-shrink-0 opacity-70" style={{ color: GOLD_LIGHT }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold" style={{ color: TEXT_MUTED }}>Phone</p>
                      <p className="text-white font-mono">+216 {approveLead.phone}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiHome className="mt-0.5 flex-shrink-0 opacity-70" style={{ color: GOLD_LIGHT }} />
                    <div>
                      <p className="text-[10px] uppercase font-bold" style={{ color: TEXT_MUTED }}>Academy</p>
                      <p className="text-white">{approveLead.academy_name}</p>
                    </div>
                  </li>
                </ul>
                <p className="text-xs mt-6 pt-4 border-t border-white/10" style={{ color: TEXT_MUTED }}>
                  Submitted {new Date(approveLead.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex-1 p-6 md:p-8">
                <h4 className="text-sm font-bold text-white mb-1">Finalize onboarding</h4>
                <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>Set plan and credentials for the new academy admin.</p>

                {formError && (
                  <div className="flex gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">
                    <FiAlertCircle className="flex-shrink-0 mt-0.5" size={16} />{formError}
                  </div>
                )}
                {formOk && (
                  <div className="flex gap-2 text-sm rounded-xl px-3 py-2 mb-3" style={{ color: GOLD, border: `1px solid ${GOLD}44`, background: `${GOLD}10` }}>
                    <FiCheckCircle size={16} />{formOk}
                  </div>
                )}

                <form onSubmit={submitApprove} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase" style={{ color: TEXT_MUTED }}>First name</label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm outline-none" style={{ borderColor: BORDER_GLASS }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase" style={{ color: TEXT_MUTED }}>Last name</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm outline-none" style={{ borderColor: BORDER_GLASS }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase" style={{ color: TEXT_MUTED }}>Club / company</label>
                    <input value={club} onChange={e => setClub(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm outline-none" style={{ borderColor: BORDER_GLASS }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase" style={{ color: TEXT_MUTED }}>Phone (+216, 8 digits)</label>
                    <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm outline-none font-mono" style={{ borderColor: BORDER_GLASS }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase" style={{ color: TEXT_MUTED }}>Billing plan</label>
                    <select value={billingPlan} onChange={e => setBillingPlan(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-black/50 border text-white text-sm outline-none" style={{ borderColor: BORDER_GLASS }}>
                      {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-bold uppercase" style={{ color: TEXT_MUTED }}>Admin password</label>
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      className="mt-1 w-full px-3 py-2 pr-10 rounded-xl bg-black/40 border text-white text-sm outline-none" style={{ borderColor: BORDER_GLASS }} />
                    <button type="button" className="absolute right-2 bottom-2 text-gray-500" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase" style={{ color: TEXT_MUTED }}>Confirm password</label>
                    <input type={showPwd ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm outline-none" style={{ borderColor: BORDER_GLASS }} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeApprove} disabled={submitting}
                      className="flex-1 py-3 rounded-xl text-sm font-bold border" style={{ borderColor: BORDER_GLASS, color: TEXT_MUTED }}>Cancel</button>
                    <button type="submit" disabled={submitting}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #a88b3a)` }}>
                      {submitting ? 'Creating…' : 'Approve & create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
