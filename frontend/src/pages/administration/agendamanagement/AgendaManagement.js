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
import EventDetailDrawer from '../../../components/common/EventDetailDrawer';
import DeleteConfirmModal from './modals/DeleteConfirmModal';

const AgendaManagement = () => {
  const {
    events, groupsWithSubgroups, coaches, players, isLoading,
    showEventModal, setShowEventModal, selectedEvent,
    currentDate, setCurrentDate, selectedGroups, setSelectedGroups,
    selectedSubgroups, setSelectedSubgroups, selectedDay, setSelectedDay,
    showDayEventsModal, setShowDayEventsModal, expandedGroup, setExpandedGroup,
    showDeleteConfirm, setShowDeleteConfirm, eventToDelete, setEventToDelete,
    isSubmitting, eventForm, setEventForm,
    handleFormChange, handleGroupToggle, handleSubgroupToggle,
    handleCoachToggle, handlePlayerToggle, resetForm,
    handleSubmit, handleEditEvent, handleConfirmDelete, handleDayClick, createEventForDay,
    filteredEvents, stats, calendarDays,
    detailSession, setDetailSession, isDetailLoading, handleOpenDetail
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
          groupsWithSubgroups={groupsWithSubgroups}
          coaches={coaches} players={players}
          expandedGroup={expandedGroup}
          setExpandedGroup={setExpandedGroup}
          handleGroupToggle={handleGroupToggle} handleSubgroupToggle={handleSubgroupToggle}
          handleCoachToggle={handleCoachToggle} handlePlayerToggle={handlePlayerToggle}
        />

        <DayEventsModal
          showDayEventsModal={showDayEventsModal} setShowDayEventsModal={setShowDayEventsModal}
          selectedDay={selectedDay} calendarDays={calendarDays}
          handleEditEvent={handleEditEvent} setEventToDelete={setEventToDelete}
          setShowDeleteConfirm={setShowDeleteConfirm} createEventForDay={createEventForDay}
          handleOpenDetail={handleOpenDetail}
        />

        <EventDetailDrawer
          detailSession={detailSession} setDetailSession={setDetailSession}
          isDetailLoading={isDetailLoading}
          handleEditEvent={handleEditEvent}
          setEventToDelete={setEventToDelete}
          setShowDeleteConfirm={setShowDeleteConfirm}
          setShowDayEventsModal={setShowDayEventsModal}
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
