import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Returns the ISO yyyy-MM-dd string from a Date object */
const toISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Parses a yyyy-MM-dd string to a local Date (avoids UTC offset issues) */
const fromISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Build calendar grid starting on Sunday: returns array of {date, inMonth} for 6 rows × 7 cols */
const buildGrid = (year, month) => {
  const firstDay = new Date(year, month, 1);
  // getDay(): 0=Sun … 6=Sat — since Sunday is start, startOffset is just firstDay.getDay()
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const grid = [];

  for (let i = 0; i < 42; i++) {
    const rel = i - startOffset;
    if (rel < 0) {
      grid.push({ date: new Date(year, month - 1, daysInPrev + rel + 1), inMonth: false });
    } else if (rel >= daysInMonth) {
      grid.push({ date: new Date(year, month + 1, rel - daysInMonth + 1), inMonth: false });
    } else {
      grid.push({ date: new Date(year, month, rel + 1), inMonth: true });
    }
  }
  return grid;
};

// ─── Component ────────────────────────────────────────────────────────────────
const CustomDatePicker = ({
  value = '',
  onChange,
  placeholder = 'Select date',
  maxDate = '',
  minDate = '',
  accentColor = '#4fb0ff',
  label,
  id = 'date-picker',
  hasError = false,
}) => {
  const { t, i18n } = useTranslation('agendamanagement');
  const isRtl = i18n.language === 'ar';

  const today = new Date();
  const initialDate = fromISO(value) || today;

  const [open, setOpen]       = useState(false);
  const [viewYear, setViewYear]   = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const wrapperRef = useRef(null);
  const popoverRef = useRef(null);

  // Fallback localized helpers to be bulletproof
  const getLocalizedMonth = useCallback((monthIdx) => {
    const monthKey = MONTH_KEYS[monthIdx];
    const val = t(`calendar.months.${monthKey}`);
    if (val && val !== `calendar.months.${monthKey}`) return val;
    return MONTHS[monthIdx];
  }, [t]);

  const getLocalizedDay = useCallback((dayIdx) => {
    const dayKey = DAY_KEYS[dayIdx];
    const val = t(`calendar.daysShort.${dayKey}`);
    if (val && val !== `calendar.daysShort.${dayKey}`) return val;
    return DAYS_OF_WEEK[dayIdx];
  }, [t]);

  const formatDisplay = useCallback((isoStr) => {
    if (!isoStr) return null;
    const d = fromISO(isoStr);
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthName = getLocalizedMonth(d.getMonth()).slice(0, 3);
    const yearNum = d.getFullYear();
    return `${dayNum} ${monthName} ${yearNum}`;
  }, [getLocalizedMonth]);

  // Sync internal view when value changes externally
  useEffect(() => {
    if (value) {
      const d = fromISO(value);
      if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = useCallback(() => {
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });
  }, []);

  const selectDay = useCallback((date) => {
    const iso = toISO(date);
    onChange(iso);
    setOpen(false);
  }, [onChange]);

  const clearValue = useCallback((e) => {
    e.stopPropagation();
    onChange('');
  }, [onChange]);

  const isDisabled = useCallback((date) => {
    const iso = toISO(date);
    if (maxDate && iso > maxDate) return true;
    if (minDate && iso < minDate) return true;
    return false;
  }, [maxDate, minDate]);

  const isSelected = useCallback((date) => value && toISO(date) === value, [value]);
  const isToday    = useCallback((date) => toISO(date) === toISO(today), [today]);

  const grid = buildGrid(viewYear, viewMonth);
  const displayLabel = formatDisplay(value);

  return (
    <div ref={wrapperRef} className="relative w-full" id={id} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Trigger ──────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(o => !o);
          }
        }}
        aria-haspopup="true"
        aria-expanded={open}
        className={[
          'relative flex items-center gap-2 w-full px-3 md:px-4 py-2.5 rounded-xl',
          'bg-gray-800/30 border transition-all cursor-pointer select-none',
          isRtl ? 'text-right flex-row-reverse' : 'text-left',
          hasError
            ? 'border-red-500/50 hover:border-red-500/80 shadow-lg shadow-red-500/5'
            : open
              ? 'border-[#4fb0ff]/60 ring-1 ring-[#4fb0ff]/20'
              : 'border-gray-700/50 hover:border-[#4fb0ff]/40',
        ].join(' ')}
      >
        <FiCalendar className="text-gray-400 flex-shrink-0" size={14} />
        <span className={`flex-1 text-xs sm:text-sm truncate ${displayLabel ? 'text-white' : 'text-gray-500'}`}>
          {displayLabel || placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={clearValue}
            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 p-0.5 rounded"
            aria-label="Clear date"
          >
            <FiX size={12} />
          </button>
        )}
      </div>

      {/* ── Popover calendar ─────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            key="calendar-popover"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={[
              'absolute top-full mt-2 z-[9999] shadow-2xl drop-shadow-md isolate',
              isRtl ? 'right-0' : 'left-0',
              'w-full max-w-[280px] sm:max-w-[300px]',
              'bg-[#0d1117] border border-gray-700/60',
              'rounded-2xl shadow-2xl shadow-black/60 p-4',
              'overflow-hidden',
            ].join(' ')}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Month / Year header */}
            <div className={`flex items-center justify-between mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-all"
              >
                {isRtl ? <FiChevronRight size={15} /> : <FiChevronLeft size={15} />}
              </button>

              <div className="text-sm font-bold text-white tracking-wide select-none">
                <span style={{ color: accentColor }}>{getLocalizedMonth(viewMonth)}</span>
                {' '}
                <span className="text-gray-300">{viewYear}</span>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-all"
              >
                {isRtl ? <FiChevronLeft size={15} /> : <FiChevronRight size={15} />}
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_OF_WEEK.map((d, idx) => (
                <div key={idx} className="text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wider py-1">
                  {getLocalizedDay(idx)}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {grid.map(({ date, inMonth }, idx) => {
                const sel      = isSelected(date);
                const tod      = isToday(date);
                const disabled = isDisabled(date);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && selectDay(date)}
                    className={[
                      'relative h-8 w-full flex items-center justify-center rounded-lg',
                      'text-xs font-medium transition-all',
                      !sel && !disabled && inMonth
                        ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                        : '',
                      !inMonth ? 'text-gray-700' : '',
                      tod && !sel ? 'font-bold' : '',
                      disabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer',
                    ].join(' ')}
                    style={sel
                      ? { background: accentColor + '25', color: accentColor, boxShadow: `0 0 0 1.5px ${accentColor}` }
                      : tod && !sel
                        ? { color: accentColor }
                        : {}
                    }
                  >
                    {date.getDate()}
                    {tod && !sel && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: accentColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer: Today shortcut + clear */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="text-xs text-gray-600 hover:text-red-400 transition-colors px-1"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                disabled={isDisabled(today)}
                onClick={() => !isDisabled(today) && selectDay(today)}
                className="text-xs font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-white/8"
                style={{ color: accentColor }}
              >
                {t('actions.today')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
