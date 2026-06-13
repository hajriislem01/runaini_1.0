import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import API from '../api';
import { GOLD, BORDER_GLASS, BG_CARD, TEXT_MUTED } from './theme';

const PLANS = [
  { value: 'trial', label: 'Trial' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

export default function SuperAdminCreateAdminModal({ open, onClose, onSuccess }) {
  const [academyName, setAcademyName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [club, setClub] = useState('');
  const [billingPlan, setBillingPlan] = useState('trial');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const reset = () => {
    setAcademyName('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setClub('');
    setBillingPlan('trial');
    setPassword('');
    setConfirm('');
    setError('');
    setOk('');
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    setOk('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!academyName.trim()) { setError('Academy name is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Valid email required.'); return; }

    setSubmitting(true);
    try {
      await API.post('/super-admin/academies/create/', {
        academy_name: academyName.trim(),
        email: email.trim().toLowerCase(),
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phone.replace(/\D/g, ''),
        club,
        billing_plan: billingPlan,
        username: email.trim().toLowerCase(),
      });
      setOk('Academy and admin created successfully.');
      onSuccess?.();
      setTimeout(() => {
        handleClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl"
            style={{
              background: BG_CARD,
              border: `1px solid ${BORDER_GLASS}`,
              boxShadow: `0 0 80px ${GOLD}22`,
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER_GLASS }}>
              <h3 className="text-lg font-extrabold text-white">Create academy &amp; admin</h3>
              <button type="button" onClick={handleClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {error && (
                <div className="flex gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
                  <FiAlertCircle className="flex-shrink-0 mt-0.5" />{error}
                </div>
              )}
              {ok && (
                <div className="flex gap-2 text-sm rounded-xl px-3 py-2" style={{ color: GOLD, border: `1px solid ${GOLD}44`, background: `${GOLD}12` }}>
                  <FiCheckCircle className="flex-shrink-0 mt-0.5" />{ok}
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Academy name</label>
                <input required value={academyName} onChange={e => setAcademyName(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/40 border text-white text-sm outline-none"
                  style={{ borderColor: BORDER_GLASS }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Admin email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/40 border text-white text-sm outline-none"
                  style={{ borderColor: BORDER_GLASS }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>First name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/40 border text-white text-sm outline-none"
                    style={{ borderColor: BORDER_GLASS }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Last name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/40 border text-white text-sm outline-none"
                    style={{ borderColor: BORDER_GLASS }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Phone (digits)</label>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 20))}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/40 border text-white text-sm outline-none"
                  style={{ borderColor: BORDER_GLASS }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Club / company (Optional)</label>
                <input value={club} onChange={e => setClub(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/40 border text-white text-sm outline-none"
                  style={{ borderColor: BORDER_GLASS }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Billing plan</label>
                <select value={billingPlan} onChange={e => setBillingPlan(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/50 border text-white text-sm outline-none"
                  style={{ borderColor: BORDER_GLASS }}>
                  {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Password</label>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 pr-10 rounded-xl bg-black/40 border text-white text-sm outline-none"
                  style={{ borderColor: BORDER_GLASS }}
                />
                <button type="button" className="absolute right-2 bottom-2 text-gray-500" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Confirm password</label>
                <input type={showPwd ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/40 border text-white text-sm outline-none"
                  style={{ borderColor: BORDER_GLASS }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose} disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold border" style={{ borderColor: BORDER_GLASS, color: TEXT_MUTED }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #a88b3a)` }}>
                  {submitting ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
