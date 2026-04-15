import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiUser, FiCalendar, FiDollarSign, FiCreditCard, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';

const AddPaymentTab = ({
  form, setForm, errors, handleSubmit,
  isSubmitting, filteredPlayers, stats, currentMonth
}) => {
  return (
    <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">
            <FiPlus />
          </div>
          Record New Payment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Player */}
            <div>
              <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                <FiUser className="text-[#4fb0ff]" />Select Player *
              </label>
              <select value={form.player}
                onChange={(e) => setForm(p => ({ ...p, player: e.target.value }))}
                className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.player ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}>
                <option value="" className="bg-gray-900">Select a player</option>
                {filteredPlayers.map(p => {
                  const isPaid = stats.paid_player_ids.includes(p.id);
                  return (
                    <option key={p.id} value={p.id} className="bg-gray-900">
                      {p.full_name} {isPaid ? '✅ Paid' : '❌ Unpaid'}
                    </option>
                  );
                })}
              </select>
              {errors.player && <p className="text-red-400 text-sm mt-1">• {errors.player}</p>}
            </div>

            {/* Month */}
            <div>
              <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                <FiCalendar className="text-[#00d0cb]" />Month *
              </label>
              <input type="month" value={form.month}
                onChange={(e) => setForm(p => ({ ...p, month: e.target.value }))}
                className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.month ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`} />
              {errors.month && <p className="text-red-400 text-sm mt-1">• {errors.month}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                <FiDollarSign className="text-[#22c55e]" />Amount *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">$</span>
                <input type="number" value={form.amount}
                  onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                  className={`pl-8 w-full px-4 py-3 bg-gray-800/50 border ${errors.amount ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`}
                  placeholder="0.00" min="0.01" step="0.01" />
              </div>
              {errors.amount && <p className="text-red-400 text-sm mt-1">• {errors.amount}</p>}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                <FiCalendar className="text-[#902bd1]" />Payment Date *
              </label>
              <input type="date" value={form.payment_date}
                onChange={(e) => setForm(p => ({ ...p, payment_date: e.target.value }))}
                max={format(new Date(), 'yyyy-MM-dd')}
                className={`w-full px-4 py-3 bg-gray-800/50 border ${errors.payment_date ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white`} />
              {errors.payment_date && <p className="text-red-400 text-sm mt-1">• {errors.payment_date}</p>}
            </div>

            {/* Method */}
            <div>
              <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                <FiCreditCard className="text-[#4fb0ff]" />Payment Method
              </label>
              <select value={form.method}
                onChange={(e) => setForm(p => ({ ...p, method: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                <option value="cash" className="bg-gray-900">Cash</option>
                <option value="card" className="bg-gray-900">Credit/Debit Card</option>
                <option value="bank_transfer" className="bg-gray-900">Bank Transfer</option>
                <option value="check" className="bg-gray-900">Check</option>
                <option value="online" className="bg-gray-900">Online Payment</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Status</label>
              <select value={form.status}
                onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                <option value="Completed" className="bg-gray-900">Completed</option>
                <option value="Pending" className="bg-gray-900">Pending</option>
                <option value="Late" className="bg-gray-900">Late</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">Notes (Optional)</label>
            <textarea value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              rows="3"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
              placeholder="Any additional notes..." />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">Receipt (Optional)</label>
            <label className="cursor-pointer block">
              <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-700 rounded-xl hover:border-[#00d0cb] transition-colors">
                {form.receipt ? (
                  <div className="text-center">
                    <div className="font-medium text-white">{form.receipt.name}</div>
                    <div className="text-sm text-gray-400">{Math.round(form.receipt.size / 1024)} KB</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <FiDownload className="mx-auto text-gray-400 text-2xl mb-1" />
                    <p className="text-sm text-gray-300">Click to upload receipt</p>
                  </div>
                )}
                <input type="file" onChange={(e) => setForm(p => ({ ...p, receipt: e.target.files[0] }))}
                  className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4">
            <button type="button"
              onClick={() => setForm({ player: '', amount: '', payment_date: format(new Date(), 'yyyy-MM-dd'), month: currentMonth, method: 'cash', status: 'Completed', notes: '', receipt: null })}
              className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700">
              Clear
            </button>
            <motion.button type="submit" disabled={isSubmitting}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-8 py-3 text-white font-semibold rounded-xl disabled:opacity-70 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
              ) : (
                <><FiPlus />Record Payment</>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddPaymentTab;
