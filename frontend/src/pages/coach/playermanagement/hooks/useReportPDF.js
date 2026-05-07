import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { buildPDFHTML } from '../utils/PDFTemplate';

// ── A4 dimensions at 96dpi ─────────────────────────────────────────────────────
const PDF_W = 800;
const PDF_H = 1122;

const useReportPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async (report, player, academyName = '') => {
    if (!report) {
      toast.error('No report data available');
      return;
    }

    setIsGenerating(true);
    let container = null;

    try {
      // 1 ── Lazy-load html2canvas + jsPDF ────────────────────────────────────
      const [h2cModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const html2canvas = h2cModule.default || h2cModule;
      const { jsPDF }   = jsPDFModule;

      // 2 ── Hidden container at exact 800×1122px ──────────────────────────────
      container = document.createElement('div');
      Object.assign(container.style, {
        position:      'fixed',
        left:          '-9999px',
        top:           '0',
        width:         `${PDF_W}px`,
        height:        `${PDF_H}px`,
        overflow:      'hidden',
        zIndex:        '-9999',
        pointerEvents: 'none',
      });
      container.innerHTML = buildPDFHTML(
        report,
        player,
        academyName || 'RunAiNi Academy'
      );
      document.body.appendChild(container);

      // 3 ── Wait for browser to paint ─────────────────────────────────────────
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4 ── Capture ───────────────────────────────────────────────────────────
      const canvas = await html2canvas(container, {
        scale:           3,           // 2400×3366px → crisp text at A4
        useCORS:         true,
        allowTaint:      true,
        backgroundColor: '#ffffff',   // white page
        logging:         false,
        width:           PDF_W,
        height:          PDF_H,
        windowWidth:     PDF_W,
        windowHeight:    PDF_H,
      });

      // 5 ── Filename ──────────────────────────────────────────────────────────
      const safeName = (player?.full_name || 'Player')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '');
      const [year, month] = (report.month || '').split('-');
      const monthName = report.month
        ? new Date(+year, +month - 1).toLocaleDateString('en-GB', { month: 'long' })
        : 'Unknown';
      const filename = `Performance_Report_${safeName}_${monthName}_${year || ''}.pdf`;

      // 6 ── Build single-page A4 PDF ──────────────────────────────────────────
      const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pageW   = pdf.internal.pageSize.getWidth();
      const pageH   = pdf.internal.pageSize.getHeight();

      // addImage fills the entire A4 page — single image, guaranteed one page
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
      pdf.save(filename);

      toast.success('Report downloaded ✓');
    } catch (err) {
      console.error('PDF Error:', err);
      toast.error('PDF generation failed — check the console for details.');
    } finally {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setIsGenerating(false);
    }
  }, []);

  return { generatePDF, isGenerating };
};

export default useReportPDF;
