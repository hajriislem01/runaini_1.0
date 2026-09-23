// ═══════════════════════════════════════════════════════════════
// PDFTemplate.js — Parent-friendly A4 Monthly Report
// Returns INNER HTML only (no html/head/body wrappers).
// Styles are embedded inside the content via a <style> block,
// and base styles apply to the outer wrapper div.
//
// Design goals (vs the old dense "scout report" version):
//  - Readable font sizes (11-13px body, not 7-9px)
//  - Fully localized via the `t` function passed in (fr/en/ar)
//  - Trend arrows vs the previous month's report, when available
//  - Player photo instead of just an initial
//  - A plain-language rating badge + a one-line scale legend
//  - Dropped the dense per-criterion "micro-criteria" grid — the
//    4 pillar averages carry the signal a parent actually needs
//  - Softer footer tone (no "Strictly Confidential" legalese)
// ═══════════════════════════════════════════════════════════════

const ACCENT = '#0f2a6e'; // institutional navy
const RED    = '#c9222a'; // header accent

// Arabic locale formatting renders Eastern Arabic-Indic digits (٠١٢) by default —
// the rest of the app forces Western digits everywhere, so PDF dates must match.
const toWestern = (str) =>
  String(str).replace(/[٠-٩۰-۹]/g, (d) =>
    String(d.charCodeAt(0) - (d.charCodeAt(0) >= 0x06F0 ? 0x06F0 : 0x0660))
  );

const f = (v, d = 1) =>
  v !== null && v !== undefined && v !== '' ? parseFloat(v).toFixed(d) : '—';

const pct = (value, max = 10) =>
  Math.min(100, Math.max(0, (parseFloat(value || 0) / max) * 100));

const barOnly = (value, max = 10) => {
  const p = pct(value, max);
  return `<div style="height:6px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:9px;">
    <div style="width:${p}%;height:100%;background:${ACCENT};border-radius:99px;"></div>
  </div>`;
};

// Rating bucket used for the plain-language badge next to the overall score
const ratingBucket = (score) => {
  const s = parseFloat(score || 0);
  if (s >= 8)   return { key: 'excellent', bg: '#dcfce7', color: '#15803d' };
  if (s >= 6.5) return { key: 'good',       bg: '#ccfbf1', color: '#0f766e' };
  if (s >= 5)   return { key: 'average',    bg: '#fef3c7', color: '#b45309' };
  return              { key: 'needsWork',  bg: '#fee2e2', color: '#b91c1c' };
};

// Trend arrow vs the previous month's value — omitted when there's nothing to compare to
const trendHTML = (current, previous) => {
  if (previous === undefined || previous === null) return '';
  const diff = parseFloat(current || 0) - parseFloat(previous || 0);
  if (Math.abs(diff) < 0.05) {
    return `<span style="font-size:12px;font-weight:800;color:#9ca3af;">–</span>`;
  }
  const up    = diff > 0;
  const color = up ? '#15803d' : '#b91c1c';
  const arrow = up ? '▲' : '▼';
  return `<span style="font-size:12px;font-weight:800;color:${color};">${arrow} ${Math.abs(diff).toFixed(1)}</span>`;
};

const pillarCard = (label, avg, prevAvg) => `
  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;background:#fafafa;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${ACCENT};">${label}</span>
      ${trendHTML(avg, prevAvg)}
    </div>
    <div style="display:flex;align-items:baseline;gap:5px;margin-top:6px;">
      <span style="font-size:32px;font-weight:900;color:${ACCENT};line-height:1;letter-spacing:-0.5px;">${f(avg)}</span>
      <span style="font-size:12px;color:#9ca3af;">/10</span>
    </div>
    ${barOnly(avg)}
  </div>`;

const badge = (label, ok) => `
  <span style="font-size:10px;padding:4px 12px;border-radius:99px;font-weight:800;
    background:${ok ? '#dcfce7' : '#fee2e2'};color:${ok ? '#15803d' : '#b91c1c'};
    border:1px solid ${ok ? '#86efac' : '#fca5a5'};">${label}</span>`;

/**
 * @param {object} report          the selected month's PlayerReport
 * @param {object} player          player profile (full_name, position, group, photo)
 * @param {string} academyName
 * @param {object} options
 * @param {function} options.t            i18next t() bound to the 'coachplayers' namespace
 * @param {string}   options.language     current i18n language ('fr' | 'en' | 'ar')
 * @param {object}   [options.previousReport]  the month right before this one, for trend arrows
 * @param {string}   [options.playerPhotoUrl]  player's profile picture URL, if any
 */
export const buildPDFHTML = (report, player, academyName , options = {}) => {
  const {
    t = (key) => key,
    language = 'en',
    previousReport = null,
    playerPhotoUrl = null,
  } = options;

  const isRtl = language === 'ar';
  const dir   = isRtl ? 'rtl' : 'ltr';
  const rowDir = isRtl ? 'row-reverse' : 'row';

  const attPct = report.attendance_total > 0
    ? Math.round((report.attendance_present / report.attendance_total) * 100)
    : null;

  const overall  = parseFloat(report.overall_score || 0);
  const rating   = ratingBucket(overall);
  const initial  = (player?.full_name || 'P').charAt(0).toUpperCase();

  const [year, month] = (report.month || '').split('-');
  const monthLabel = report.month
    ? toWestern(new Date(+year, +month - 1).toLocaleDateString(language, { month: 'long', year: 'numeric' }))
    : '—';

  const commentBlock = (label, value, accentColor) => value ? `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:11px 14px;background:#fafafa;border-${isRtl ? 'right' : 'left'}:3px solid ${accentColor};">
      <div style="font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${accentColor};margin-bottom:5px;">${label}</div>
      <div style="font-size:11.5px;color:#374151;line-height:1.6;">${value}</div>
    </div>` : '';

  const comments = [
    commentBlock(t('Strengths'), report.strength, '#15803d'),
    commentBlock(t('toImprove'), report.to_improve, '#b45309'),
    commentBlock(t('Objective For Next Month'), report.objective, ACCENT),
    commentBlock(t('CoachComment'), report.comment, '#6b7280'),
  ].filter(Boolean);

  return `
<style>
  .pdf-root * { box-sizing:border-box; margin:0; padding:0; }
  .pdf-root table { border-collapse:collapse; width:100%; }
</style>

<div class="pdf-root" dir="${dir}" style="
  font-family:-apple-system,'Helvetica Neue',Arial,Helvetica,sans-serif;
  background:#ffffff;
  color:#111827;
  width:800px;
  height:1122px;
  overflow:hidden;
  position:relative;
">

  <!-- WATERMARK -->
  <div style="
    position:absolute;top:50%;left:50%;
    transform:translate(-50%,-50%) rotate(-40deg);
    font-size:110px;font-weight:900;
    color:rgba(15,42,110,0.04);
    white-space:nowrap;pointer-events:none;
    z-index:0;letter-spacing:-2px;
    font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;
  ">${academyName.toUpperCase()}</div>

  <!-- PAGE -->
  <div style="position:relative;z-index:1;height:1122px;display:flex;flex-direction:column;">

    <!-- HEADER: player photo + name, month, overall score & rating -->
    <div style="background:#111827;flex-shrink:0;">
      <div style="height:4px;background:${RED};"></div>
      <div style="padding:18px 24px;display:flex;flex-direction:${rowDir};align-items:center;justify-content:space-between;gap:16px;">

        <!-- Player -->
        <div style="display:flex;flex-direction:${rowDir};align-items:center;gap:14px;">
          <div style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,0.2);
            flex-shrink:0;background:${ACCENT};display:flex;align-items:center;justify-content:center;">
            ${playerPhotoUrl
              ? `<img src="${playerPhotoUrl}" style="width:100%;height:100%;object-fit:cover;" />`
              : `<span style="font-size:22px;font-weight:900;color:#fff;">${initial}</span>`}
          </div>
          <div style="text-align:${isRtl ? 'right' : 'left'};">
            <div style="font-size:19px;font-weight:900;color:#fff;letter-spacing:-0.3px;">${player?.full_name || '—'}</div>
            <div style="font-size:11px;color:#9ca3af;margin-top:3px;">
              ${player?.position || ''}${player?.group?.name ? ` · ${player.group.name}` : ''}
            </div>
          </div>
        </div>

        <!-- Cycle -->
        <div style="text-align:center;">
          <div style="font-size:8.5px;color:#4b5563;text-transform:uppercase;letter-spacing:2px;">${academyName}</div>
          <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-top:3px;">${t('Rapport de Performance')}</div>
          <div style="font-size:15px;font-weight:800;color:#fff;margin-top:4px;">${monthLabel}</div>
        </div>

        <!-- Overall -->
        <div style="text-align:${isRtl ? 'left' : 'right'};">
          <div style="font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">${t('Overall_Score')}</div>
          <div style="font-size:38px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1;margin-top:3px;">
            ${f(overall)}<span style="font-size:14px;color:#6b7280;font-weight:500;">/10</span>
          </div>
          <div style="margin-top:5px;">
            <span style="font-size:10px;font-weight:800;padding:3px 11px;border-radius:99px;background:${rating.bg};color:${rating.color};">
              ${t(rating.key)}
            </span>
          </div>
        </div>
      </div>
      <div style="height:3px;background:${RED};"></div>
    </div>

   

    <!-- BODY -->
    <div style="padding:16px 24px;flex:1;display:flex;flex-direction:column;gap:14px;overflow:hidden;">

      <!-- 2×2 PILLAR GRID -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;flex-shrink:0;">
        ${pillarCard(t('technical'), report.technical_avg, previousReport?.technical_avg)}
        ${pillarCard(t('tactical'),  report.tactical_avg,  previousReport?.tactical_avg)}
        ${pillarCard(t('physical'),  report.physical_avg,  previousReport?.physical_avg)}
        ${pillarCard(t('mental'),    report.mental_avg,    previousReport?.mental_avg)}
      </div>
      ${previousReport ? `
      <div style="text-align:${isRtl ? 'right' : 'left'};margin-top:-6px;">
        <span style="font-size:9px;color:#9ca3af;font-style:italic;">${t('pdf_vsLastMonth')}</span>
      </div>` : ''}

      <!-- HEALTH / ATTENDANCE / ACADEMIC TABLE -->
      <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;flex-shrink:0;">
        <div style="background:#111827;padding:8px 16px;">
          <span style="font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#fff;">
            ${t('Health&Academic')}
          </span>
        </div>
        <table>
          <tbody>
            <tr style="background:#f9fafb;">
              <td style="padding:8px 16px;font-size:11px;color:#6b7280;border-bottom:1px solid #f3f4f6;width:25%;">${t('Injured Status')}</td>
              <td style="padding:8px 16px;font-size:11px;font-weight:700;color:${report.is_injured ? '#b91c1c' : '#15803d'};border-bottom:1px solid #f3f4f6;width:25%;">${report.is_injured ? t('Injured Status') : t('not Injured')}</td>
              <td style="padding:8px 16px;font-size:11px;color:#6b7280;border-bottom:1px solid #f3f4f6;border-${isRtl ? 'right' : 'left'}:1px solid #e5e7eb;width:25%;">${t('Training Attendance')}</td>
              <td style="padding:8px 16px;font-size:11px;font-weight:700;color:#111827;border-bottom:1px solid #f3f4f6;width:25%;">${attPct !== null ? `${attPct}% ` : '—'}</td>
            </tr>
            <tr>
              <td style="padding:8px 16px;font-size:11px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${t('Fatigue')}</td>
              <td style="padding:8px 16px;font-size:11px;font-weight:700;color:#111827;border-bottom:1px solid #f3f4f6;">${report.fatigue_level ? report.fatigue_level + '/5' : '—'}</td>
              <td style="padding:8px 16px;font-size:11px;color:#6b7280;border-bottom:1px solid #f3f4f6;border-${isRtl ? 'right' : 'left'}:1px solid #e5e7eb;">${t('Grade')}</td>
              <td style="padding:8px 16px;font-size:11px;font-weight:700;color:#111827;border-bottom:1px solid #f3f4f6;">${report.school_grade_avg ? f(report.school_grade_avg) + '/20' : '—'}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:8px 16px;font-size:11px;color:#6b7280;">${t('Sleep')}</td>
              <td style="padding:8px 16px;font-size:11px;font-weight:700;color:#111827;">${report.sleep_quality ? report.sleep_quality + '/5' : '—'}</td>
              <td style="padding:8px 16px;font-size:11px;color:#6b7280;border-${isRtl ? 'right' : 'left'}:1px solid #e5e7eb;">${t('School Attendance')}</td>
              <td style="padding:8px 16px;font-size:11px;font-weight:700;color:#111827;">${report.school_attendance ? f(report.school_attendance, 0) + '%' : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- COMMENTS -->
      ${comments.length > 0 ? `
      <div style="display:grid;grid-template-columns:${comments.length > 1 ? '1fr 1fr' : '1fr'};gap:10px;flex-shrink:0;">
        ${comments.join('')}
      </div>` : ''}

      <div style="flex:1;"></div>

      <!-- FOOTER -->
      <div style="padding-top:12px;border-top:1px solid #e5e7eb;display:flex;flex-direction:${rowDir};justify-content:space-between;align-items:flex-end;flex-shrink:0;gap:16px;">
        <div style="text-align:${isRtl ? 'right' : 'left'};">
          <div style="font-size:9.5px;color:#9ca3af;">${t('pdf_reportRef')}: ${player?.id || '—'} · ${monthLabel}</div>
          <div style="font-size:9px;color:#c4c9d2;margin-top:3px;">${t('pdf_confidentialNote', { academy: academyName })}</div>
        </div>
        <div style="text-align:${isRtl ? 'left' : 'right'};">
          <div style="width:190px;height:1px;background:#d1d5db;margin-bottom:7px;${isRtl ? 'margin-right' : 'margin-left'}:auto;"></div>
          <div 
        </div>
      </div>

    </div>
  </div>
</div>`;
};
