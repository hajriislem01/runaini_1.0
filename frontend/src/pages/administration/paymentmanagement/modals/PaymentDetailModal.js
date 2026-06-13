import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiDownload, FiPrinter } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { getStatusColor } from '../utils/paymentHelpers';
import PaymentReceipt from '../components/PaymentReceipt';

const PaymentDetailModal = ({ showModal, setShowModal, selectedPayment }) => {
  const { t, i18n } = useTranslation('paymentmanagement');
  const isRtl = i18n.language === 'ar';

  const getMethodName = (methodId) => {
    switch(methodId) {
      case 'cash': return t('method.cash', 'Cash');
      case 'card': return t('method.card', 'Credit/Debit Card');
      case 'bank_transfer': return t('method.bankTransfer', 'Bank Transfer');
      case 'check': return t('method.cheque', 'Check');
      case 'online': return t('method.online', 'Online Payment');
      default: return methodId;
    }
  };

  const getStatusName = (statusId) => {
    switch(statusId) {
      case 'Completed': return t('form.completed', 'Completed');
      case 'Pending': return t('status.pending', 'Pending');
      case 'Late': return t('status.overdue', 'Late');
      default: return statusId;
    }
  };

  return (
    <AnimatePresence>
      {showModal && selectedPayment && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 w-full max-w-lg p-6"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className={`flex justify-between items-center mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <FiCreditCard className="text-[#00d0cb]" />
                <span>{t('form.paymentReceipt', 'Payment Receipt')}</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: t('form.transactionId', 'Transaction ID'), value: `PAY-${selectedPayment.id}` },
                { label: t('table.player', 'Player'), value: selectedPayment.player_name },
                { label: t('form.groupLabel', 'Group'), value: selectedPayment.group_name },
                { label: t('table.month', 'Month'), value: selectedPayment.month },
                { label: t('table.amount', 'Amount'), value: `${parseFloat(selectedPayment.amount).toFixed(2)} ${t('currency.symbol', 'DT')}`, color: '#22c55e' },
                { label: t('table.paymentDate', 'Date'), value: selectedPayment.payment_date },
                { label: t('table.paymentMethod', 'Method'), value: getMethodName(selectedPayment.method) },
              ].map(item => (
                <div key={item.label} className={`flex justify-between items-center p-3 bg-gray-800/30 rounded-xl ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium" style={{ color: item.color || 'white' }}>{item.value}</span>
                </div>
              ))}
              <div className={`flex justify-between items-center p-3 bg-gray-800/30 rounded-xl ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-400">{t('table.status', 'Status')}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedPayment.status)}`}>
                  {getStatusName(selectedPayment.status)}
                </span>
              </div>
              {selectedPayment.notes && (
                <div className={`p-3 bg-gray-800/30 rounded-xl ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="text-gray-400 text-sm mb-1">{t('form.notesLabel', 'Notes')}</div>
                  <div className="text-white">{selectedPayment.notes}</div>
                </div>
              )}
              {selectedPayment.receipt_url && (
                <a href={selectedPayment.receipt_url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-[#00d0cb] hover:text-[#4fb0ff] p-3 bg-gray-800/30 rounded-xl ${isRtl ? 'flex-row-reverse justify-start' : ''}`}>
                  <FiDownload />
                  <span>{t('form.viewReceipt', 'View Receipt')}</span>
                </a>
              )}
            </div>
            <div className={`flex justify-end gap-3 mt-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => window.print()}
                className={`px-4 py-2 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <FiPrinter size={16} />
                <span>{t('form.print', 'Print')}</span>
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                {t('form.close', 'Close')}
              </button>
            </div>
          </motion.div>
          <PaymentReceipt payment={selectedPayment} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentDetailModal;
