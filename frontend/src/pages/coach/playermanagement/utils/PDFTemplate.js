// ═══════════════════════════════════════════════════════════════
// PDFTemplate.js — White-paper Institutional A4 Report
// Returns INNER HTML only (no html/head/body wrappers).
// Styles are embedded inside the content via a <style> block,
// and base styles apply to the outer wrapper div.
// ═══════════════════════════════════════════════════════════════

const ACCENT = '#0f2a6e'; // institutional navy
const RED    = '#c9222a'; // header accent

const f = (v, d = 1) =>
  v !== null && v !== undefined && v !== '' ? parseFloat(v).toFixed(d) : '—';

const pct = (value, max = 10) =>
  Math.min(100, Math.max(0, (parseFloat(value || 0) / max) * 100));

const bar = (value, max = 10) => {
  const p = pct(value, max);
  return `
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="flex:1;height:3px;background:#e5e7eb;border-radius:99px;overflow:hidden;">
        <div style="width:${p}%;height:100%;background:${ACCENT};border-radius:99px;"></div>
      </div>
      <span style="font-size:9px;font-weight:700;color:#111827;min-width:30px;text-align:right;">${f(value)}/10</span>
    </div>`;
};

const pillarCard = (label, avg, scores) => {
  const entries = Object.entries(scores || {}).slice(0, 7);
  const rows = entries.map(([k, v]) => `
    <div style="margin-bottom:5px;">
      <div style="font-size:7.5px;color:#6b7280;text-transform:capitalize;margin-bottom:2px;">${k.replace(/_/g,' ')}</div>
      ${bar(v)}
    </div>`).join('');

  return `
    <div style="border:1px solid #e5e7eb;border-radius:6px;padding:10px 12px;background:#fafafa;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;
          margin-bottom:8px;padding-bottom:7px;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${ACCENT};">${label}</span>
        <span style="font-size:21px;font-weight:900;color:${ACCENT};letter-spacing:-1px;">
          ${f(avg)}<span style="font-size:10px;color:#9ca3af;font-weight:500;">/10</span>
        </span>
      </div>
      ${rows}
    </div>`;
};

export const buildPDFHTML = (report, player, academyName = 'RunAiNi Academy') => {
  const attPct = report.attendance_total > 0
    ? Math.round((report.attendance_present / report.attendance_total) * 100)
    : null;

  const overall  = parseFloat(report.overall_score || 0);
  const initial  = (player?.full_name || 'P').charAt(0).toUpperCase();

  const [year, month] = (report.month || '').split('-');
  const monthLabel = report.month
    ? new Date(+year, +month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '—';

  const allCriteria = {
    ...report.technical_scores,
    ...report.tactical_scores,
    ...report.physical_scores,
    ...report.mental_scores,
  };
  const entries = Object.entries(allCriteria);
  const col1 = entries.filter((_, i) => i % 3 === 0);
  const col2 = entries.filter((_, i) => i % 3 === 1);
  const col3 = entries.filter((_, i) => i % 3 === 2);

  const microCol = (list) => list.map(([k, v]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;
        padding:2.5px 0;border-bottom:1px solid #f9fafb;">
      <span style="font-size:7.5px;color:#6b7280;text-transform:capitalize;">${k.replace(/_/g,' ')}</span>
      <span style="font-size:8px;font-weight:700;color:#111827;">${f(v)}</span>
    </div>`).join('');

  return `
<style>
  .pdf-root * { box-sizing:border-box; margin:0; padding:0; }
  .pdf-root table { border-collapse:collapse; width:100%; }
</style>

<div class="pdf-root" style="
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

    <!-- BLACK HEADER -->
    <div style="background:#111827;flex-shrink:0;">
      <div style="height:4px;background:${RED};"></div>
      <div style="padding:13px 22px;display:flex;align-items:center;justify-content:space-between;">
        <!-- Left: Logo + Title -->
        <div style="display:flex;align-items:center;gap:13px;">
          <div style="width:44px;height:44px;border-radius:8px;background:${ACCENT};
            border:2px solid rgba(255,255,255,0.15);flex-shrink:0;
            display:flex;align-items:center;justify-content:center;
            font-size:19px;font-weight:900;color:#fff;">${initial}</div>
          <div>
            <div style="font-size:8px;color:#9ca3af;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;margin-bottom:3px;">${academyName}</div>
            <div style="font-size:17px;font-weight:900;color:#fff;letter-spacing:-0.3px;">Official Performance Report</div>
          </div>
        </div>
        <!-- Centre: Cycle -->
        <div style="text-align:center;">
          <div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Reference Cycle</div>
          <div style="font-size:13px;font-weight:800;color:#fff;">${monthLabel}</div>
          <div style="font-size:8px;color:#4b5563;margin-top:3px;">Issued: ${new Date().toLocaleDateString('en-GB')}</div>
        </div>
        <!-- Right: Overall -->
        <div style="text-align:right;">
          <div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:4px;">Overall Index</div>
          <div style="font-size:42px;font-weight:900;color:#fff;letter-spacing:-3px;line-height:1;">
            ${f(overall)}<span style="font-size:15px;color:#4b5563;font-weight:500;">/10</span>
          </div>
        </div>
      </div>
      <div style="height:3px;background:${RED};"></div>
    </div>

    <!-- PLAYER STRIP -->
    <div style="background:#f9fafb;border-bottom:1px solid #e5e7eb;
      padding:9px 22px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div>
        <span style="font-size:15px;font-weight:900;color:#111827;text-transform:uppercase;letter-spacing:-0.3px;">
          ${player?.full_name || '—'}
        </span>
        <span style="font-size:10px;color:#6b7280;margin-left:12px;">
          ${player?.position || ''} &nbsp;·&nbsp; Group: ${player?.group?.name || 'Unassigned'}
        </span>
      </div>
      <div style="display:flex;gap:5px;align-items:center;">
        ${report.is_injured
          ? '<span style="font-size:8px;padding:3px 10px;border-radius:99px;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;font-weight:800;">INJURY ACTIVE</span>'
          : '<span style="font-size:8px;padding:3px 10px;border-radius:99px;background:#dcfce7;color:#15803d;border:1px solid #86efac;font-weight:800;">CLEARED</span>'}
        ${attPct !== null ? `<span style="font-size:8px;padding:3px 10px;border-radius:99px;background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;font-weight:800;">ATT. ${attPct}%</span>` : ''}
        ${report.medical_cert_valid
          ? '<span style="font-size:8px;padding:3px 10px;border-radius:99px;background:#dcfce7;color:#15803d;border:1px solid #86efac;font-weight:800;">CERT. VALID</span>'
          : '<span style="font-size:8px;padding:3px 10px;border-radius:99px;background:#fef9c3;color:#92400e;border:1px solid #fcd34d;font-weight:800;">CERT. REQUIRED</span>'}
      </div>
    </div>

    <!-- BODY -->
    <div style="padding:12px 22px;flex:1;display:flex;flex-direction:column;gap:10px;overflow:hidden;">

      <!-- 2×2 PILLAR GRID -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex-shrink:0;">
        ${pillarCard('Technical', report.technical_avg, report.technical_scores)}
        ${pillarCard('Tactical',  report.tactical_avg,  report.tactical_scores)}
        ${pillarCard('Physical',  report.physical_avg,  report.physical_scores)}
        ${pillarCard('Mental',    report.mental_avg,    report.mental_scores)}
      </div>

      <!-- MICRO-CRITERIA 3-col -->
      ${entries.length > 0 ? `
      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:9px 13px;background:#fafafa;flex-shrink:0;">
        <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${ACCENT};
            margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid #f3f4f6;">
          Micro-Criteria Assessment
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 14px;">
          <div>${microCol(col1)}</div>
          <div>${microCol(col2)}</div>
          <div>${microCol(col3)}</div>
        </div>
      </div>` : ''}

      <!-- HEALTH / ATTENDANCE / ACADEMIC TABLE -->
      <div style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;flex-shrink:0;">
        <div style="background:#111827;padding:6px 13px;">
          <span style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#fff;">
            Health, Attendance &amp; Academic
          </span>
        </div>
        <table>
          <tbody>
            <tr style="background:#f9fafb;">
              <td style="padding:5px 12px;font-size:9px;color:#6b7280;border-bottom:1px solid #f3f4f6;width:25%;">Injury</td>
              <td style="padding:5px 12px;font-size:9px;font-weight:700;color:${report.is_injured ? '#b91c1c' : '#15803d'};border-bottom:1px solid #f3f4f6;width:25%;">${report.is_injured ? 'Active' : 'None'}</td>
              <td style="padding:5px 12px;font-size:9px;color:#6b7280;border-bottom:1px solid #f3f4f6;border-left:1px solid #e5e7eb;width:25%;">Training Att.</td>
              <td style="padding:5px 12px;font-size:9px;font-weight:700;color:#111827;border-bottom:1px solid #f3f4f6;width:25%;">${attPct !== null ? `${attPct}% (${report.attendance_present}/${report.attendance_total})` : '—'}</td>
            </tr>
            <tr>
              <td style="padding:5px 12px;font-size:9px;color:#6b7280;border-bottom:1px solid #f3f4f6;">Fatigue</td>
              <td style="padding:5px 12px;font-size:9px;font-weight:700;color:#111827;border-bottom:1px solid #f3f4f6;">${report.fatigue_level ? report.fatigue_level + '/5' : '—'}</td>
              <td style="padding:5px 12px;font-size:9px;color:#6b7280;border-bottom:1px solid #f3f4f6;border-left:1px solid #e5e7eb;">Academic Grade</td>
              <td style="padding:5px 12px;font-size:9px;font-weight:700;color:#111827;border-bottom:1px solid #f3f4f6;">${report.school_grade_avg ? f(report.school_grade_avg) + '/20' : '—'}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:5px 12px;font-size:9px;color:#6b7280;">Sleep</td>
              <td style="padding:5px 12px;font-size:9px;font-weight:700;color:#111827;">${report.sleep_quality ? report.sleep_quality + '/5' : '—'}</td>
              <td style="padding:5px 12px;font-size:9px;color:#6b7280;border-left:1px solid #e5e7eb;">School Att.</td>
              <td style="padding:5px 12px;font-size:9px;font-weight:700;color:#111827;">${report.school_attendance ? f(report.school_attendance, 0) + '%' : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- STRATEGIC COMMENTS -->
      <div style="display:grid;grid-template-columns:${(report.strength && report.to_improve) ? '1fr 1fr' : '1fr'};gap:8px;flex-shrink:0;">
        ${report.strength ? `
        <div style="border:1px solid #e5e7eb;border-top:3px solid #15803d;border-radius:0 0 6px 6px;padding:9px 13px;background:#fafafa;">
          <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#15803d;margin-bottom:6px;">Core Strengths</div>
          <div style="font-size:9px;color:#374151;line-height:1.6;">${report.strength}</div>
        </div>` : ''}
        ${report.to_improve ? `
        <div style="border:1px solid #e5e7eb;border-top:3px solid #b45309;border-radius:0 0 6px 6px;padding:9px 13px;background:#fafafa;">
          <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#b45309;margin-bottom:6px;">Development Areas</div>
          <div style="font-size:9px;color:#374151;line-height:1.6;">${report.to_improve}</div>
        </div>` : ''}
      </div>

      ${report.comment ? `
      <div style="border:1px solid #e5e7eb;border-left:3px solid ${ACCENT};border-radius:0 6px 6px 0;padding:9px 13px;background:#fafafa;flex-shrink:0;">
        <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${ACCENT};margin-bottom:5px;">Official Technical Comment</div>
        <div style="font-size:9px;color:#374151;font-style:italic;line-height:1.6;">${report.comment}</div>
      </div>` : ''}

      <div style="flex:1;"></div>

      <!-- FOOTER -->
      <div style="padding-top:10px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-end;flex-shrink:0;">
        <div>
          <div style="font-size:8px;color:#9ca3af;letter-spacing:0.5px;">Ref: ${player?.id || '—'} · ${monthLabel}</div>
          <div style="font-size:7px;color:#d1d5db;margin-top:2px;text-transform:uppercase;letter-spacing:1px;">Strictly Confidential — ${academyName}</div>
        </div>
        <div style="text-align:right;">
          <div style="width:210px;height:1px;background:#d1d5db;margin-bottom:7px;margin-left:auto;"></div>
          <div style="font-size:9px;font-weight:800;color:#111827;text-transform:uppercase;letter-spacing:2px;">Head Coach</div>
          <div style="font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-top:3px;">Authorized Signature</div>
        </div>
      </div>

    </div>
  </div>
</div>`;
};
