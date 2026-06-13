import React from 'react';
import { GOLD, GOLD_LIGHT } from './theme';

const VARIANTS = {
  'on leave': { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)', color: '#fde68a', label: 'On leave' },
  inactive: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(156,163,175,0.35)', color: '#d1d5db', label: 'Inactive' },
  injured: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(248,113,113,0.35)', color: '#fca5a5', label: 'Injured' },
  actif: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.45)', color: '#86efac', label: 'Actif' },
  inactif: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(156,163,175,0.35)', color: '#d1d5db', label: 'Inactif' },
  blessé: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(248,113,113,0.35)', color: '#fca5a5', label: 'Blessé' },
  active: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.45)', color: '#86efac', label: 'Active' },
  trial: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.45)', color: '#fde047', label: 'Trial' },
  pending: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)', color: '#fcd34d', label: 'Pending' },
  approved: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)', color: '#86efac', label: 'Approved' },
  rejected: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', color: '#fca5a5', label: 'Rejected' },
  archived: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(156,163,175,0.35)', color: '#d1d5db', label: 'Archived' },
  suspended: { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.4)', color: '#fdba74', label: 'Suspended' },
  past_due: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.35)', color: '#fca5a5', label: 'Past due' },
  cancelled: { bg: 'rgba(75,85,99,0.2)', border: 'rgba(107,114,128,0.4)', color: '#9ca3af', label: 'Cancelled' },
  default: { bg: 'rgba(201,168,76,0.1)', border: `${GOLD}44`, color: GOLD_LIGHT, label: '' },
};

const PLAN_LABELS = {
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export default function StatusBadge({ value, type = 'status' }) {
  const key = (value || '').toString().toLowerCase();
  let v;
  if (type === 'plan') {
    const label = PLAN_LABELS[key] || value || '—';
    v = { bg: 'rgba(201,168,76,0.12)', border: `${GOLD}55`, color: GOLD_LIGHT, label };
  } else {
    v = VARIANTS[key] || { ...VARIANTS.default, label: value || '—' };
  }
  if (!v.label && value) v = { ...v, label: value };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.color,
      }}
    >
      {v.label}
    </span>
  );
}
