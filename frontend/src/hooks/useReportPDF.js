
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const scoreColor = (s) => {
  if (!s && s !== 0) return '#64748b';
  if (s >= 8) return '#4ade80';
  if (s >= 7) return '#4fb0ff';
  if (s >= 6) return '#f59e0b';
  return '#f87171';
};

const fmt = (v, d = 1) =>
  v !== null && v !== undefined ? parseFloat(v).toFixed(d) : '—';

const buildHTML = (report, player, academyName) => {
  const piliers = [
    { label:'Technical', value:report.technical_avg, color:'#4fb0ff' },
    { label:'Tactical',  value:report.tactical_avg,  color:'#f59e0b' },
    { label:'Physical',  value:report.physical_avg,  color:'#22c55e' },
    { label:'Mental',    value:report.mental_avg,    color:'#a855f7' },
  ];

  const attPct = report.attendance_total > 0
    ? Math.round((report.attendance_present / report.attendance_total) * 100)
    : null;

  const pillarsHTML = piliers.map(p => `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:12px;color:#94a3b8">${p.label}</span>
        <span style="font-size:12px;font-weight:700;color:${p.color}">${fmt(p.value)}/10</span>
      </div>
      <div style="height:6px;background:#1e293b;border-radius:99px;overflow:hidden">
        <div style="height:100%;width:${(parseFloat(p.value||0))*10}%;background:${p.color};border-radius:99px"></div>
      </div>
    </div>
  `).join('');

  const criteriaHTML = Object.entries({
    ...report.technical_scores,
    ...report.tactical_scores,
    ...report.physical_scores,
    ...report.mental_scores,
  }).map(([k,v]) => `
    <span style="display:inline-block;margin:2px;padding:3px 8px;border-radius:99px;font-size:10px;background:rgba(79,176,255,.12);color:#4fb0ff">
      ${k.replace(/_/g,' ')} ${fmt(v)}
    </span>
  `).join('');

  const dotsHTML = Array.from({ length:report.attendance_total||0 }, (_,i) =>
    `<div style="width:8px;height:8px;border-radius:50%;background:${i < report.attendance_present ? '#4ade80' : '#ef4444'}"></div>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #0a0f2a;
    color: #fff;
    width: 794px;
    min-height: 1123px;
    padding: 40px;
  }
  .header {
    display:flex; align-items:center; justify-content:space-between;
    border-bottom: 2px solid rgba(144,43,209,.4);
    padding-bottom: 20px; margin-bottom: 24px;
  }
  .academy { font-size:13px; color:#64748b; }
  .title { font-size:22px; font-weight:700; color:#fff; margin-bottom:2px; }
  .subtitle { font-size:12px; color:#64748b; }
  .logo-circle {
    width:50px; height:50px; border-radius:12px;
    background:linear-gradient(135deg,#902bd1,#4fb0ff);
    display:flex; align-items:center; justify-content:center;
    font-size:20px; font-weight:700; color:#fff;
  }
  .hero {
    background:linear-gradient(135deg,rgba(144,43,209,.15),rgba(0,208,203,.08));
    border:1px solid rgba(0,208,203,.2);
    border-radius:12px; padding:20px; margin-bottom:20px;
    display:flex; align-items:center; gap:20px;
  }
  .score-circle {
    width:80px; height:80px; border-radius:50%;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    flex-shrink:0;
  }
  .score-num { font-size:28px; font-weight:700; line-height:1; }
  .score-sub { font-size:10px; color:#64748b; }
  .player-name { font-size:18px; font-weight:700; color:#fff; margin-bottom:4px; }
  .player-meta { font-size:12px; color:#64748b; margin-bottom:8px; }
  .badge {
    display:inline-block; padding:3px 10px; border-radius:99px;
    font-size:10px; font-weight:600; margin-right:5px;
  }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .card {
    background:#0f172a; border:1px solid #1e293b;
    border-radius:10px; padding:14px;
  }
  .card-title {
    font-size:10px; font-weight:700; text-transform:uppercase;
    letter-spacing:.5px; color:#64748b; margin-bottom:10px;
  }
  .health-row {
    display:flex; justify-content:space-between; align-items:center;
    font-size:11px; padding:4px 0;
    border-bottom:1px solid #1e293b;
  }
  .health-row:last-child { border-bottom:none; }
  .h-key { color:#64748b; }
  .dots-row { display:flex; gap:2px; flex-wrap:wrap; }
  .school-row {
    display:flex; justify-content:space-between; align-items:center;
    font-size:11px; padding:4px 0; border-bottom:1px solid #1e293b;
  }
  .school-row:last-child { border-bottom:none; }
  .coach-card {
    background:rgba(144,43,209,.06);
    border:1px solid rgba(144,43,209,.2);
    border-radius:10px; padding:14px; margin-bottom:16px;
  }
  .coach-head { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .coach-av {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg,#902bd1,#4fb0ff);
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:700; color:#fff; flex-shrink:0;
  }
  .coach-name { font-size:12px; font-weight:600; color:#c084fc; }
  .coach-date { font-size:10px; color:#64748b; }
  .quote {
    font-size:11px; color:#94a3b8; font-style:italic; line-height:1.6;
    padding:8px 10px; background:#0f172a; border-radius:8px;
    border-left:2px solid rgba(144,43,209,.4); margin-bottom:10px;
  }
  .cf-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cf-block { background:#0f172a; border-radius:8px; padding:8px 10px; }
  .cf-lbl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; margin-bottom:3px; }
  .cf-text { font-size:10px; color:#94a3b8; line-height:1.5; }
  .footer {
    margin-top:24px; padding-top:14px;
    border-top:1px solid #1e293b;
    display:flex; justify-content:space-between; align-items:center;
  }
  .footer-text { font-size:10px; color:#334155; }
  .watermark {
    font-size:11px; font-weight:700;
    background:linear-gradient(135deg,#902bd1,#00d0cb);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .dev-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
  .dev-item {
    display:flex; align-items:center; gap:8px;
    padding:6px 8px; border-radius:8px;
    font-size:11px;
  }
  .dev-rank {
    width:18px; height:18px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:700; flex-shrink:0;
  }
  .dev-name { color:#e2e8f0; flex:1; }
  .dev-score { font-weight:700; flex-shrink:0; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div>
    <div class="academy">${academyName || 'RunAiNi Academy'}</div>
    <div class="title">Monthly Performance Report</div>
    <div class="subtitle">${report.month} · Generated ${new Date().toLocaleDateString('en-GB')}</div>
  </div>
  <div class="logo-circle">${(player?.full_name || 'P').charAt(0)}</div>
</div>

<!-- Hero score -->
<div class="hero">
  <div class="score-circle" style="border:3px solid ${scoreColor(report.overall_score)};background:${scoreColor(report.overall_score)}10">
    <div class="score-num" style="color:${scoreColor(report.overall_score)}">${fmt(report.overall_score)}</div>
    <div class="score-sub">/10</div>
  </div>
  <div>
    <div class="player-name">${player?.full_name || '—'}</div>
    <div class="player-meta">
      ${player?.position || ''} · ${player?.group?.name || ''} · ${academyName || ''}
    </div>
    <div>
      <span class="badge" style="background:rgba(74,222,128,.12);color:#4ade80;border:1px solid rgba(74,222,128,.25)">
        Overall ${fmt(report.overall_score)}/10
      </span>
      ${attPct !== null ? `<span class="badge" style="background:rgba(0,208,203,.12);color:#00d0cb;border:1px solid rgba(0,208,203,.25)">Attendance ${attPct}%</span>` : ''}
      ${report.is_injured ? `<span class="badge" style="background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25)">Injured</span>` : ''}
    </div>
  </div>
</div>

<!-- 4 Piliers -->
<div class="card" style="margin-bottom:16px">
  <div class="card-title">4 Pillars</div>
  ${pillarsHTML}
</div>

<!-- Criteria chips si disponibles -->
${criteriaHTML ? `
<div class="card" style="margin-bottom:16px">
  <div class="card-title">Detailed criteria</div>
  <div style="display:flex;flex-wrap:wrap;gap:3px">${criteriaHTML}</div>
</div>
` : ''}

<!-- Health + School + Attendance -->
<div class="two-col">
  <div class="card">
    <div class="card-title">Health</div>
    <div class="health-row">
      <span class="h-key">Injury</span>
      <span style="color:${report.is_injured ? '#f87171' : '#4ade80'};font-weight:600">
        ${report.is_injured ? `Injured${report.injury_details ? ' — ' + report.injury_details : ''}` : 'None'}
      </span>
    </div>
    ${report.fatigue_level !== null && report.fatigue_level !== undefined ? `
    <div class="health-row">
      <span class="h-key">Fatigue</span>
      <span style="color:#f59e0b;font-weight:600">${report.fatigue_level}/5</span>
    </div>` : ''}
    ${report.sleep_quality !== null && report.sleep_quality !== undefined ? `
    <div class="health-row">
      <span class="h-key">Sleep quality</span>
      <span style="color:#4fb0ff;font-weight:600">${report.sleep_quality}/5</span>
    </div>` : ''}
    <div class="health-row">
      <span class="h-key">Medical cert</span>
      <span style="color:${report.medical_cert_valid ? '#4ade80' : '#f87171'};font-weight:600">
        ${report.medical_cert_valid ? 'Valid' : 'Invalid'}
      </span>
    </div>
  </div>

  <div class="card">
    <div class="card-title">School</div>
    ${report.school_grade_avg !== null && report.school_grade_avg !== undefined ? `
    <div class="school-row">
      <span style="color:#64748b">Grade</span>
      <span style="color:${scoreColor(report.school_grade_avg/2)};font-weight:700">${fmt(report.school_grade_avg)}/20</span>
    </div>` : ''}
    ${report.school_attendance !== null && report.school_attendance !== undefined ? `
    <div class="school-row">
      <span style="color:#64748b">Attendance</span>
      <span style="color:${report.school_attendance >= 80 ? '#4ade80' : '#f87171'};font-weight:700">${Math.round(report.school_attendance)}%</span>
    </div>` : ''}
    ${report.school_behaviour !== null && report.school_behaviour !== undefined ? `
    <div class="school-row">
      <span style="color:#64748b">Behaviour</span>
      <span style="color:${scoreColor(report.school_behaviour)};font-weight:700">${fmt(report.school_behaviour, 0)}/10</span>
    </div>` : ''}
    ${attPct !== null ? `
    <div class="school-row" style="margin-top:6px">
      <span style="color:#64748b">Training</span>
      <span style="color:#00d0cb;font-weight:700">${report.attendance_present}/${report.attendance_total} sessions</span>
    </div>
    <div style="margin-top:6px">
      <div class="dots-row">${dotsHTML}</div>
    </div>` : ''}
  </div>
</div>

<!-- Coach message -->
${report.comment || report.strength || report.to_improve || report.objective ? `
<div class="coach-card">
  <div class="coach-head">
    <div class="coach-av">${(report.coach_name || 'C').charAt(0)}</div>
    <div>
      <div class="coach-name">${report.coach_name || 'Coach'}</div>
      <div class="coach-date">${report.month} — Monthly evaluation</div>
    </div>
  </div>
  ${report.comment ? `<div class="quote">"${report.comment}"</div>` : ''}
  <div class="cf-grid">
    ${report.strength ? `
    <div class="cf-block">
      <div class="cf-lbl" style="color:#4ade80">Strengths</div>
      <div class="cf-text">${report.strength}</div>
    </div>` : ''}
    ${report.to_improve ? `
    <div class="cf-block">
      <div class="cf-lbl" style="color:#f59e0b">To improve</div>
      <div class="cf-text">${report.to_improve}</div>
    </div>` : ''}
    ${report.objective ? `
    <div class="cf-block" style="grid-column:span 2">
      <div class="cf-lbl" style="color:#4fb0ff">Monthly goal</div>
      <div class="cf-text">${report.objective}</div>
    </div>` : ''}
  </div>
</div>
` : ''}

<!-- Footer -->
<div class="footer">
  <div class="footer-text">
    Confidential · ${player?.full_name || ''} · ${report.month} · ${academyName || 'RunAiNi Academy'}
  </div>
  <div class="watermark">RunAiNi</div>
</div>

</body>
</html>
  `;
};

// ═══════════════════════════════════════════════════════════════════════════════
const useReportPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async (report, player, academyName = '') => {
    if (!report) { toast.error('No report data available'); return; }
    setIsGenerating(true);

    const toastId = toast.loading('Generating PDF...');
    try {
      // Charger jsPDF + html2canvas dynamiquement
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      // Créer un conteneur HTML invisible
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed; top: -9999px; left: -9999px;
        width: 794px; background: #0a0f2a;
      `;
      container.innerHTML = buildHTML(report, player, academyName);
      document.body.appendChild(container);

      // Attendre le rendu
      await new Promise(r => setTimeout(r, 300));

      // Capture avec html2canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0f2a',
        logging: false,
        width: 794,
        windowWidth: 794,
      });

      document.body.removeChild(container);

      // Générer le PDF A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData  = canvas.toDataURL('image/png');
      const pdfW     = pdf.internal.pageSize.getWidth();
      const pdfH     = pdf.internal.pageSize.getHeight();
      const imgH     = (canvas.height * pdfW) / canvas.width;
      let   position = 0;
      let   remaining = imgH;

      // Gestion multi-pages
      pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
      remaining -= pdfH;

      while (remaining > 0) {
        position -= pdfH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
        remaining -= pdfH;
      }

      // Téléchargement
      const fileName = `report_${(player?.full_name || 'player').replace(/\s+/g,'_')}_${report.month}.pdf`;
      pdf.save(fileName);

      toast.success('PDF downloaded ✅', { id: toastId });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generatePDF, isGenerating };
};

export default useReportPDF;