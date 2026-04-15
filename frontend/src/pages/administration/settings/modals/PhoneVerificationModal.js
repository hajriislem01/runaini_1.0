import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiCheck } from 'react-icons/fi';

const PhoneVerificationModal = ({
  showVerificationModal, setShowVerificationModal,
  verificationStep, setVerificationStep,
  verificationCode, setVerificationCode,
  countdown, handleVerifyCode, handlePhoneVerification,
  academyData
}) => {
  return (
    <AnimatePresence>
      {showVerificationModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700 relative">
            <button onClick={() => { setShowVerificationModal(false); setVerificationStep('phone'); setVerificationCode(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <FiX size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Phone Verification</h3>
              <p className="text-gray-400">We sent a 6-digit code to {academyData.phone}</p>
            </div>
            {verificationStep === 'code' && (
              <div className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map(index => (
                    <input key={index} type="text" maxLength="1"
                      value={verificationCode[index] || ''}
                      onChange={(e) => {
                        const newCode = verificationCode.split('');
                        newCode[index] = e.target.value;
                        setVerificationCode(newCode.join(''));
                      }}
                      className="w-12 h-12 text-center text-xl bg-gray-800/50 border-2 border-gray-700 rounded-xl focus:border-[#00d0cb] outline-none text-white" />
                  ))}
                </div>
                <button onClick={handlePhoneVerification} disabled={countdown > 0}
                  className={`text-sm font-medium ${countdown > 0 ? 'text-gray-500' : 'text-[#00d0cb] hover:text-[#4fb0ff]'}`}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleVerifyCode}
                  className="w-full px-6 py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                  <FiCheck size={20} />Verify Code
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhoneVerificationModal;
