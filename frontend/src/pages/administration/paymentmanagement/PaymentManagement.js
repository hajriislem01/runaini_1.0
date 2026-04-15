import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { usePaymentManagement } from './hooks/usePaymentManagement';
import { containerVariants, itemVariants } from './utils/paymentHelpers';

import PaymentHeader from './components/PaymentHeader';
import PaymentStats from './components/PaymentStats';
import PaymentFilters from './components/PaymentFilters';
import PaymentTabs from './components/PaymentTabs';

import OverviewTab from './tabs/OverviewTab';
import AddPaymentTab from './tabs/AddPaymentTab';
import HistoryTab from './tabs/HistoryTab';

import PaymentDetailModal from './modals/PaymentDetailModal';

const PaymentManagement = () => {
  const {
    players, groups, payments, stats, isLoading, isSubmitting,
    currentMonth, setCurrentMonth, selectedGroup, setSelectedGroup,
    selectedSubgroup, setSelectedSubgroup, activeTab, setActiveTab,
    form, setForm, errors, setErrors, historyFilters, setHistoryFilters,
    selectedPayment, setSelectedPayment, showModal, setShowModal,
    subgroups, filteredPlayers, paidPlayers, unpaidPlayers, filteredPayments,
    prevMonth, nextMonth, handleSubmit, handleDelete
  } = usePaymentManagement();

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        
        <motion.div variants={itemVariants} className="mb-8">
          <PaymentHeader 
            stats={stats} currentMonth={currentMonth}
            prevMonth={prevMonth} nextMonth={nextMonth} itemVariants={itemVariants}
          />
          <PaymentStats 
            stats={stats} isLoading={isLoading} itemVariants={itemVariants}
          />
        </motion.div>

        <PaymentFilters 
          groups={groups} subgroups={subgroups}
          selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup}
          selectedSubgroup={selectedSubgroup} setSelectedSubgroup={setSelectedSubgroup}
          itemVariants={itemVariants}
        />

        <PaymentTabs 
          activeTab={activeTab} setActiveTab={setActiveTab} itemVariants={itemVariants}
        />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab 
              isLoading={isLoading} paidPlayers={paidPlayers} unpaidPlayers={unpaidPlayers}
              payments={payments} setForm={setForm} currentMonth={currentMonth}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'add' && (
            <AddPaymentTab 
              form={form} setForm={setForm} errors={errors}
              handleSubmit={handleSubmit} isSubmitting={isSubmitting}
              filteredPlayers={filteredPlayers} stats={stats} currentMonth={currentMonth}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab 
              filteredPayments={filteredPayments}
              historyFilters={historyFilters} setHistoryFilters={setHistoryFilters}
              setSelectedPayment={setSelectedPayment} setShowModal={setShowModal}
              handleDelete={handleDelete}
            />
          )}
        </AnimatePresence>

      </div>

      <PaymentDetailModal 
        showModal={showModal} setShowModal={setShowModal} selectedPayment={selectedPayment}
      />
    </motion.div>
  );
};

export default PaymentManagement;
