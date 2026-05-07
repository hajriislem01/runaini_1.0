import React from 'react';

const HealthBadge = ({ ok, label }) => (
  <span style={{
    fontSize: 11, padding: '3px 8px', borderRadius: 99,
    background: ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
    color: ok ? '#4ade80' : '#f87171',
    border: ok ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
  }}>{label}</span>
);

export default HealthBadge;
