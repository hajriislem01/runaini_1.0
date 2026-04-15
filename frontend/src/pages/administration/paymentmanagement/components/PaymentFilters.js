import React from 'react';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';

const PaymentFilters = ({
  groups, subgroups,
  selectedGroup, setSelectedGroup,
  selectedSubgroup, setSelectedSubgroup,
  itemVariants
}) => {
  return (
    <motion.div variants={itemVariants} className="mb-6">
      <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FiFilter className="text-[#4fb0ff]" />Filter by Group
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Group</label>
            <select value={selectedGroup}
              onChange={(e) => { setSelectedGroup(e.target.value); setSelectedSubgroup(''); }}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
              <option value="" className="bg-gray-900">All Groups</option>
              {groups.map(g => (
                <option key={g.id} value={g.id} className="bg-gray-900">{g.name}</option>
              ))}
            </select>
          </div>
          {selectedGroup && subgroups.length > 0 && (
            <div>
              <label className="block text-gray-300 font-medium mb-2">Subgroup</label>
              <select value={selectedSubgroup} onChange={(e) => setSelectedSubgroup(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                <option value="" className="bg-gray-900">All Subgroups</option>
                {subgroups.map(s => (
                  <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentFilters;
