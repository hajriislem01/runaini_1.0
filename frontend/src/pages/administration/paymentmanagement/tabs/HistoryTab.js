import React from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiEye, FiXCircle } from 'react-icons/fi';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { format } from 'date-fns';
import { getMethodColor, getStatusColor } from '../utils/paymentHelpers';

const HistoryTab = ({
  filteredPayments, historyFilters, setHistoryFilters,
  setSelectedPayment, setShowModal, handleDelete
}) => {
  return (
    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
              <FiFilter />
            </div>
            Payment History
          </h2>
          <div className="flex flex-wrap gap-3">
            {['method', 'status'].map(filterKey => (
              <select key={filterKey}
                value={historyFilters[filterKey]}
                onChange={(e) => setHistoryFilters(p => ({ ...p, [filterKey]: e.target.value }))}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0cb]">
                <option value="all" className="bg-gray-900">All {filterKey}s</option>
                {filterKey === 'method' && ['cash', 'card', 'bank_transfer', 'check', 'online'].map(m => (
                  <option key={m} value={m} className="bg-gray-900">{m.replace('_', ' ')}</option>
                ))}
                {filterKey === 'status' && ['Completed', 'Pending', 'Late'].map(s => (
                  <option key={s} value={s} className="bg-gray-900">{s}</option>
                ))}
              </select>
            ))}
            <input type="date" value={historyFilters.startDate}
              onChange={(e) => setHistoryFilters(p => ({ ...p, startDate: e.target.value }))}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none" />
            <input type="date" value={historyFilters.endDate}
              onChange={(e) => setHistoryFilters(p => ({ ...p, endDate: e.target.value }))}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none"
              max={format(new Date(), 'yyyy-MM-dd')} />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: filteredPayments.length, color: '#4fb0ff' },
            { label: 'Completed', value: filteredPayments.filter(p => p.status === 'Completed').length, color: '#22c55e' },
            { label: 'Pending', value: filteredPayments.filter(p => p.status === 'Pending').length, color: '#eab308' },
            { label: 'Total Amount', value: `$${filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}`, color: '#902bd1' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <p className="text-gray-400 text-sm mb-1">{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-700/50">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-800/50">
              <tr>
                {['Player', 'Month', 'Amount', 'Date', 'Method', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-900/30 divide-y divide-gray-700/50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    <FaRegCalendarCheck className="mx-auto text-3xl mb-3 opacity-30" />
                    <p>No payment records found</p>
                  </td>
                </tr>
              ) : filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{payment.player_name}</div>
                    <div className="text-xs text-gray-400">{payment.group_name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{payment.month}</td>
                  <td className="px-6 py-4 text-[#22c55e] font-bold">${parseFloat(payment.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{payment.payment_date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(payment.method)}`}>
                      {payment.method?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
                        className="text-[#00d0cb] hover:text-[#4fb0ff] p-2 rounded-lg hover:bg-[#00d0cb]/10">
                        <FiEye size={18} />
                      </button>
                      <button onClick={() => handleDelete(payment.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10">
                        <FiXCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryTab;
