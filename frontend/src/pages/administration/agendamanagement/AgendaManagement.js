import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { containerVariants, itemVariants } from './utils/agendaConstants';
import { useAgendaData } from './hooks/useAgendaData';

import AgendaHeader from './components/AgendaHeader';
import AgendaFilters from './components/AgendaFilters';
import CalendarGrid from './components/CalendarGrid';

import EventFormModal from './modals/EventFormModal';
import DayEventsModal from './modals/DayEventsModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';

const AgendaManagement = () => {
  const {
    events, groupsWithSubgroups, coaches, isLoading,
    showEventModal, setShowEventModal, selectedEvent,
    currentDate, setCurrentDate, selectedGroups, setSelectedGroups,
    selectedSubgroups, setSelectedSubgroups, selectedDay, setSelectedDay,
    showDayEventsModal, setShowDayEventsModal, expandedGroup, setExpandedGroup,
    showDeleteConfirm, setShowDeleteConfirm, eventToDelete, setEventToDelete,
    isSubmitting, eventForm, setEventForm,
    handleFormChange, handleGroupToggle, handleSubgroupToggle, resetForm,
    handleSubmit, handleEditEvent, handleConfirmDelete, handleDayClick, createEventForDay,
    filteredEvents, stats, calendarDays
  } = useAgendaData();

  return (
    <motion.div
      className="min-h-screen text-white p-4 md:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0f2a 45%, #180033 100%)' }}
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <AgendaHeader 
          stats={stats} isLoading={isLoading}
          resetForm={resetForm} setShowEventModal={setShowEventModal}
          itemVariants={itemVariants} 
        />

        <AgendaFilters 
          groupsWithSubgroups={groupsWithSubgroups}
          selectedGroups={selectedGroups} setSelectedGroups={setSelectedGroups}
          selectedSubgroups={selectedSubgroups} setSelectedSubgroups={setSelectedSubgroups}
          expandedGroup={expandedGroup} setExpandedGroup={setExpandedGroup}
          itemVariants={itemVariants}
        />

        <CalendarGrid 
          currentDate={currentDate} setCurrentDate={setCurrentDate}
          calendarDays={calendarDays} handleDayClick={handleDayClick}
          itemVariants={itemVariants}
        />

        <EventFormModal 
          showEventModal={showEventModal} resetForm={resetForm} selectedEvent={selectedEvent}
          eventForm={eventForm} handleFormChange={handleFormChange}
          handleSubmit={handleSubmit} isSubmitting={isSubmitting}
          groupsWithSubgroups={groupsWithSubgroups} expandedGroup={expandedGroup}
          setExpandedGroup={setExpandedGroup}
          handleGroupToggle={handleGroupToggle} handleSubgroupToggle={handleSubgroupToggle}
        />

        <DayEventsModal 
          showDayEventsModal={showDayEventsModal} setShowDayEventsModal={setShowDayEventsModal}
          selectedDay={selectedDay} calendarDays={calendarDays}
          handleEditEvent={handleEditEvent} setEventToDelete={setEventToDelete}
          setShowDeleteConfirm={setShowDeleteConfirm} createEventForDay={createEventForDay}
        />

        <DeleteConfirmModal 
          showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm}
          eventToDelete={eventToDelete} setEventToDelete={setEventToDelete}
          handleConfirmDelete={handleConfirmDelete}
        />
      </div>
    </motion.div>
  );
};

export default AgendaManagement;
