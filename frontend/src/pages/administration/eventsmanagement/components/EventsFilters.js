import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiZap, FiTarget, FiMapPin, FiUsers, FiCalendar } from 'react-icons/fi';

const EventsFilters = ({ showFilters, setShowFilters, filters, handleFilterChange, clearFilters, groups, filteredCount, itemVariants }) => (
  <motion.div variants={itemVariants} className="mb-8">
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1 relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input type="text" name="searchTerm" value={filters.searchTerm}
          onChange={handleFilterChange}
          placeholder="Search events by name or description..."
          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setShowFilters(!showFilters)}
        className="px-6 py-3 bg-gray-900/50 text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors flex items-center justify-center gap-2">
        <FiFilter />{showFilters ? 'Hide Filters' : 'Show Filters'}
      </motion.button>
    </div>

    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#4fb0ff]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiZap className="text-[#eab308]" />Event Type
                </label>
                <select name="type" value={filters.type} onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                  <option value="" className="bg-gray-900">All Types</option>
                  <option value="Match Friendly" className="bg-gray-900">Match Friendly</option>
                  <option value="Tournament" className="bg-gray-900">Tournament</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiTarget className="text-[#22c55e]" />Status
                </label>
                <select name="status" value={filters.status} onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                  <option value="" className="bg-gray-900">All Status</option>
                  <option value="open" className="bg-gray-900">Open</option>
                  <option value="completed" className="bg-gray-900">Completed</option>
                  <option value="cancelled" className="bg-gray-900">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiMapPin className="text-[#4fb0ff]" />Location
                </label>
                <input type="text" name="location" value={filters.location}
                  onChange={handleFilterChange} placeholder="Filter by location"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiUsers className="text-[#902bd1]" />Group
                </label>
                <select name="group" value={filters.group} onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                  <option value="" className="bg-gray-900">All Groups</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id} className="bg-gray-900">{group.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiCalendar className="text-[#00d0cb]" />Date
                </label>
                <input type="date" name="date" value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700/50">
              <div className="text-gray-400 text-sm">
                {filteredCount} event{filteredCount !== 1 ? 's' : ''} found
              </div>
              <button onClick={clearFilters}
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                <FiX size={18} />Clear Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default EventsFilters;
