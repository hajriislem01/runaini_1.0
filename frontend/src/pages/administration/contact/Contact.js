import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';

import { useContactData } from './hooks/useContactData';
import { containerVariants, itemVariants } from './utils/contactConstants';

import ContactHeader from './components/ContactHeader';
import ContactFilters from './components/ContactFilters';
import AcademyCard from './components/AcademyCard';
import AcademyModal from './modals/AcademyModal';

const Contact = () => {
  const {
    academies, filteredAcademies, isLoading,
    selectedAcademy, setSelectedAcademy,
    filters, handleFilterChange, clearFilters,
    stats
  } = useContactData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d0cb]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">

        <ContactHeader stats={stats} itemVariants={itemVariants} />

        <ContactFilters 
          filters={filters} handleFilterChange={handleFilterChange} 
          clearFilters={clearFilters} itemVariants={itemVariants} 
        />

        {/* Results Info */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gradient-to-r from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-xl border border-[#4fb0ff]/30 p-4">
            <span className="text-gray-300">
              Showing <span className="font-bold text-white">{filteredAcademies.length}</span> of{' '}
              <span className="font-bold text-white">{academies.length}</span> academies
            </span>
          </div>
        </motion.div>

        {/* Academies Grid */}
        <motion.div variants={itemVariants}>
          {filteredAcademies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAcademies.map(academy => (
                <AcademyCard key={academy.id} academy={academy} setSelectedAcademy={setSelectedAcademy} />
              ))}
            </div>
          ) : (
            <motion.div variants={itemVariants}
              className="bg-gradient-to-br from-[#4fb0ff]/20 to-[#00d0cb]/20 backdrop-blur-sm rounded-2xl border border-[#4fb0ff]/30 p-12 text-center">
              <div className="text-5xl mb-4 text-gray-400 flex justify-center"><FiUsers /></div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No academies found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-6 py-3 text-white font-medium rounded-xl"
                style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                Clear Filters
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Modal */}
        <AcademyModal academy={selectedAcademy} onClose={() => setSelectedAcademy(null)} />

      </div>
    </motion.div>
  );
};

export default Contact;
