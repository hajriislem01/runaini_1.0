import React from 'react';
import { useAcademyData } from '../../../../context/AdminContext';
import { useProfileContext } from '../../../../context/ProfileContext';

const PaymentReceipt = ({ payment }) => {
  const { academyData } = useAcademyData();
  const { profileData } = useProfileContext();

  if (!payment) return null;

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const academyName = academyData?.name || 'Academy Name';
  const academyLogo = academyData?.logo_url;
  const academyEmail = academyData?.email || '';
  const academyPhone = academyData?.phone || '';
  const academyAddress = academyData?.address || '';
  const primaryColor = academyData?.primary_color || '#0c132a';
  const secondaryColor = academyData?.secondary_color || '#902bd1';
  const officialName = profileData?.full_name || 'Administration Service';

  const receiptID = payment.id
    ? `REC-${new Date().getFullYear()}-${String(payment.id).padStart(4, '0')}`
    : `REC-${Date.now().toString().slice(-6)}`;

  const currentYear = new Date().getFullYear();
  const description = `${payment.month || 'Monthly'} ${currentYear} Training Membership — ${academyName}`;

  return (
    <div id="payment-receipt-print" className="bg-white text-slate-900 hidden print:flex flex-col font-sans relative overflow-hidden box-border"
      style={{ width: '210mm', height: '297mm', padding: '0' }}>

      {/* 1. Header Border - Slimmer */}
      <div className="flex w-full h-2">
        <div className="flex-1" style={{ background: primaryColor }} />
        <div className="w-1/4" style={{ background: secondaryColor }} />
      </div>

      {/* 2. Controlled Watermark Size */}
      {academyLogo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-[0.03] z-0 pointer-events-none grayscale">
          <img src={academyLogo} alt="" className="w-full h-full object-contain" />
        </div>
      )}

      <div className="p-14 flex-1 flex flex-col justify-between relative z-10 box-border">

        {/* Section 1: Header - Compact & Clean */}
        <div className="flex justify-between items-center pb-10 border-b border-slate-100">
          <div className="flex items-center gap-6">
            {academyLogo ? (
              <img src={academyLogo} alt="Logo" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 border-2 rounded-2xl flex items-center justify-center font-black text-3xl" style={{ borderColor: primaryColor, color: primaryColor }}>
                {academyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-slate-900">{academyName}</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Official Athletic Division</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-2">Payment Receipt</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Date: <span className="text-slate-900 ml-1 font-extrabold">{formatDate(payment.payment_date)}</span></p>
          </div>
        </div>

        {/* Section 2: Info Grid - Balanced Padding */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 py-12 border-b border-slate-100">
          <div className="pr-8 space-y-3">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Athlete Entity</span>
            <div>
              <p className="text-xl font-black uppercase text-slate-900 tracking-tight leading-none">{payment.player_name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{payment.group_name} {payment.subgroup_name && `• ${payment.subgroup_name}`}</p>
            </div>
          </div>
          <div className="px-8 space-y-3">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Verification</span>
            <div>
              <p className="text-xs font-black uppercase text-slate-900 leading-none">{officialName}</p>
              <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest mt-2 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span> Verified Transfer
              </p>
            </div>
          </div>
          <div className="pl-8 space-y-3 text-right">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Registry ID</span>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none tracking-widest uppercase">{receiptID}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{payment.method?.replace('_', ' ')} Registry</p>
            </div>
          </div>
        </div>

        {/* Section 3: Table - Clean Verticality */}
        <div className="flex-1 py-10">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="py-4 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Description</th>
                <th className="py-4 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Value (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-16 px-8 border-b border-slate-100 border-dotted">
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{description}</p>
                  <p className="text-[10px] text-slate-400 font-medium max-w-md leading-relaxed italic">
                    Contribution for professional athletic development, facility infrastructure and institutional governance.
                  </p>
                </td>
                <td className="py-16 px-8 border-b border-slate-100 border-dotted text-right align-top">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">${parseFloat(payment.amount).toFixed(2)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Footer - Compact & Professional */}
        <div className="pt-10 border-t border-slate-100 flex justify-between items-end">
          <div className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Academy Contacts</h4>
              <div className="text-[10px] text-slate-500 font-bold uppercase space-y-1">
                <p className="text-slate-900 font-black tracking-wider">{academyPhone}</p>
                <p className="lowercase underline decoration-slate-100">{academyEmail}</p>
              </div>
            </div>
            {/* Security Markings - Minimal */}
            <div className="flex gap-1.5 opacity-10">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-slate-900 rounded-full" />
              ))}
            </div>
          </div>

          <div className="text-right">
            <div className="w-64 h-[1px] bg-slate-900 mb-6 ml-auto opacity-10"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Authorized Signature</p>
            <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest mt-1">Official Registry Seal</p>
          </div>
        </div>

        {/* Attribution - Minimal */}
        <div className="mt-8 text-center opacity-20 pt-6">
          <p className="text-[7px] text-slate-400 font-bold uppercase tracking-[0.8em]">
            Digital Infrastructure by <span className="text-slate-900">RUNAINI</span>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; }
          #payment-receipt-print {
            visibility: visible !important;
            display: flex !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            zoom: 1;
          }
        }
      `}} />
    </div>
  );
};

export default PaymentReceipt;