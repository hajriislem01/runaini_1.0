import React from 'react';

const ScoreBar = ({ label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
    <span style={{ fontSize: 12, color: '#94a3b8', width: 110, flexShrink: 0 }}>{label}</span>
    <div style={{ flex: 1, height: 5, background: '#0f172a', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${(value / 10) * 100}%`, height: '100%', background: color, borderRadius: 99 }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color, width: 28, textAlign: 'right', flexShrink: 0 }}>
      {parseFloat(value).toFixed(1)}
    </span>
  </div>
);

export default ScoreBar;
