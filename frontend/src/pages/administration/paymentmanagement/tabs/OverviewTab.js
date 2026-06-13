import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const OverviewTab = ({ 
  isLoading, paidPlayers, unpaidPlayers, payments,
  setForm, currentMonth, setActiveTab
}) => {
  const { t, i18n } = useTranslation('paymentmanagement');
  const isRtl = i18n.language === 'ar';

  return (
    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Paid Players */}
        <div className="bg-gray-900/40 rounded-2xl border border-gray-700/50 p-6">
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 text-white ${isRtl ? 'flex-row-reverse' : ''}`}>
            <FiCheckCircle className="text-[#22c55e]" />
            <span>{t('overview.paidPlayers', 'Paid Players ({{count}})', { count: paidPlayers.length })}</span>
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-700/30 rounded-xl animate-pulse" />)}
            </div>
          ) : paidPlayers.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {paidPlayers.map(player => {
                const payment = payments.find(p => p.player === player.id);
                return (
                  <motion.div key={player.id} whileHover={{ x: isRtl ? -4 : 4 }}
                    className={`flex items-center justify-between p-3 bg-[#22c55e]/5 rounded-xl border border-[#22c55e]/20 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-full border border-white/10 shadow-lg overflow-hidden bg-gray-800 flex items-center justify-center shrink-0">
                        {player.photo_url ? (
                          <img src={player.photo_url} alt={player.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="text-gray-500" size={18} />
                        )}
                      </div>
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <div className="text-white text-sm font-medium">{player.full_name}</div>
                        <div className="text-gray-400 text-xs">{player.position}</div>
                      </div>
                    </div>
                    {payment && (
                      <div className={isRtl ? 'text-left' : 'text-right'}>
                        <div className="text-[#22c55e] font-bold">{parseFloat(payment.amount).toFixed(2)} {t('currency.symbol', 'DT')}</div>
                        <div className="text-gray-400 text-xs">{payment.payment_date}</div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FiCheckCircle className="mx-auto text-3xl mb-2 opacity-30" />
              <p>{t('overview.noPaidPlayers', 'No paid players this month')}</p>
            </div>
          )}
        </div>

        {/* Unpaid Players */}
        <div className="bg-gray-900/40 rounded-2xl border border-gray-700/50 p-6">
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 text-white ${isRtl ? 'flex-row-reverse' : ''}`}>
            <FiXCircle className="text-red-400" />
            <span>{t('overview.unpaidPlayers', 'Unpaid Players ({{count}})', { count: unpaidPlayers.length })}</span>
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-700/30 rounded-xl animate-pulse" />)}
            </div>
          ) : unpaidPlayers.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {unpaidPlayers.map(player => (
                <motion.div key={player.id} whileHover={{ x: isRtl ? -4 : 4 }}
                  className={`flex items-center justify-between p-3 bg-red-500/5 rounded-xl border border-red-500/20 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-full border border-white/10 shadow-lg overflow-hidden bg-gray-800 flex items-center justify-center shrink-0">
                      {player.photo_url ? (
                        <img src={player.photo_url} alt={player.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-gray-500" size={18} />
                      )}
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <div className="text-white text-sm font-medium">{player.full_name}</div>
                      <div className="text-gray-400 text-xs">{player.position}</div>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setForm(prev => ({ ...prev, player: player.id, month: currentMonth }));
                      setActiveTab('add');
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-lg text-white"
                    style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                    {t('overview.payNow', 'Pay Now')}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FiCheckCircle className="mx-auto text-3xl mb-2 text-[#22c55e] opacity-50" />
              <p>{t('overview.allPlayersPaid', 'All players paid this month! 🎉')}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewTab;
