import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiDownload, FiPrinter } from 'react-icons/fi';
import { getStatusColor } from '../utils/paymentHelpers';

const PaymentDetailModal = ({ showModal, setShowModal, selectedPayment }) => {
  return (
    <AnimatePresence>
      {showModal && selectedPayment && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiCreditCard className="text-[#00d0cb]" />Payment Receipt
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Transaction ID', value: `PAY-${selectedPayment.id}` },
                { label: 'Player', value: selectedPayment.player_name },
                { label: 'Group', value: selectedPayment.group_name },
                { label: 'Month', value: selectedPayment.month },
                { label: 'Amount', value: `$${parseFloat(selectedPayment.amount).toFixed(2)}`, color: '#22c55e' },
                { label: 'Date', value: selectedPayment.payment_date },
                { label: 'Method', value: selectedPayment.method?.replace('_', ' ') },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium" style={{ color: item.color || 'white' }}>{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                <span className="text-gray-400">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
              </div>
              {selectedPayment.notes && (
                <div className="p-3 bg-gray-800/30 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Notes</div>
                  <div className="text-white">{selectedPayment.notes}</div>
                </div>
              )}
              {selectedPayment.receipt_url && (
                <a href={selectedPayment.receipt_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#00d0cb] hover:text-[#4fb0ff] p-3 bg-gray-800/30 rounded-xl">
                  <FiDownload />View Receipt
                </a>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => window.print()}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 flex items-center gap-2">
                <FiPrinter size={16} />Print
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentDetailModal;
