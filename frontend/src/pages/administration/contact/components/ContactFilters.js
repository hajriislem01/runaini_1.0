import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

const ContactFilters = ({ filters, handleFilterChange, clearFilters, itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#902bd1] to-[#00d0cb]">
              <FiSearch className="text-lg" />
            </div>
            Search & Filter
          </h2>
          {(filters.country || filters.city || filters.searchQuery) && (
            <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white">
              Clear filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Country</label>
            <select name="country" value={filters.country} onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
              <option value="" className="bg-gray-900">All Countries</option>
              <option value="TN" className="bg-gray-900">Tunisia</option>
              <option value="DZ" className="bg-gray-900">Algeria</option>
              <option value="MA" className="bg-gray-900">Morocco</option>
              <option value="LY" className="bg-gray-900">Libya</option>
              <option value="EG" className="bg-gray-900">Egypt</option>
              <option value="MR" className="bg-gray-900">Mauritania</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">City</label>
            <input type="text" name="city" value={filters.city} onChange={handleFilterChange}
              placeholder="Enter city name"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="searchQuery" value={filters.searchQuery} onChange={handleFilterChange}
                placeholder="Search by name..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactFilters;
