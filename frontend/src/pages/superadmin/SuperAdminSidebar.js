import React from 'react';
import { FiInbox, FiLayers, FiPieChart } from 'react-icons/fi';
import { GOLD, BORDER_GLASS, BG_CARD, TEXT_MUTED } from './theme';

const ITEMS = [
  { id: 'leads', label: 'Pending requests', icon: FiInbox },
  { id: 'academies', label: 'Active academies', icon: FiLayers },
  { id: 'stats', label: 'System stats', icon: FiPieChart },
];

export default function SuperAdminSidebar({ active, onSelect }) {
  return (
    <aside
      className="w-full md:w-56 flex-shrink-0 rounded-2xl p-3 flex flex-row md:flex-col gap-2 md:gap-1"
      style={{
        background: BG_CARD,
        border: `1px solid ${BORDER_GLASS}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <p
        className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-2 mb-1"
        style={{ color: TEXT_MUTED }}
      >
        Navigation
      </p>
      {ITEMS.map(item => {
        const Icon = item.icon;
        const isOn = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-3 py-3 md:py-2.5 rounded-xl text-left text-sm font-semibold transition-all"
            style={{
              color: isOn ? '#fff' : TEXT_MUTED,
              background: isOn ? `linear-gradient(90deg, ${GOLD}22, transparent)` : 'transparent',
              border: isOn ? `1px solid ${GOLD}55` : '1px solid transparent',
              boxShadow: isOn ? `0 0 20px ${GOLD}18` : 'none',
            }}
          >
            <Icon size={18} style={{ color: isOn ? GOLD : TEXT_MUTED }} />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
