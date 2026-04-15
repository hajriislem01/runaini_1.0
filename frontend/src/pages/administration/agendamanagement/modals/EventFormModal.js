import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronRight } from 'react-icons/fi';

const EventFormModal = ({
  showEventModal, resetForm, selectedEvent,
  eventForm, handleFormChange,
  handleSubmit, isSubmitting,
  groupsWithSubgroups, expandedGroup, setExpandedGroup,
  handleGroupToggle, handleSubgroupToggle
}) => {
  if (!showEventModal) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Event Title</label>
                <input type="text" name="title" value={eventForm.title} onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                  placeholder="Event name" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Date</label>
                  <input type="date" name="date" value={eventForm.date} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Type</label>
                  <select name="type" value={eventForm.type} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                    <option value="training" className="bg-gray-900">Training</option>
                    <option value="match" className="bg-gray-900">Match</option>
                    <option value="meeting" className="bg-gray-900">Meeting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Start Time</label>
                  <input type="time" name="startTime" value={eventForm.startTime} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">End Time</label>
                  <input type="time" name="endTime" value={eventForm.endTime} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Location</label>
                <input type="text" name="location" value={eventForm.location} onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                  placeholder="Training field, stadium, etc." />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Assigned Groups</label>
                <div className="space-y-3">
                  {groupsWithSubgroups.map(group => (
                    <div key={group.id}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id={`group-${group.id}`}
                          checked={eventForm.assignedGroups.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="h-4 w-4 text-[#00d0cb] rounded" />
                        <label htmlFor={`group-${group.id}`} className="font-medium text-gray-300">{group.name}</label>
                        {group.subgroups?.length > 0 && (
                          <button type="button"
                            onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                            className="ml-auto text-gray-400 hover:text-white">
                            <FiChevronRight className={`transition-transform ${expandedGroup === group.id ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                      </div>
                      {expandedGroup === group.id && group.subgroups?.length > 0 && (
                        <div className="ml-7 mt-2 space-y-2">
                          {group.subgroups.map(sub => (
                            <div key={sub.id} className="flex items-center gap-3">
                              <input type="checkbox" id={`sub-${sub.id}`}
                                checked={eventForm.assignedSubgroups.includes(sub.id)}
                                onChange={() => handleSubgroupToggle(sub.id)}
                                className="h-4 w-4 text-[#902bd1] rounded" />
                              <label htmlFor={`sub-${sub.id}`} className="text-sm text-gray-400">{sub.name}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Description</label>
                <textarea name="description" value={eventForm.description} onChange={handleFormChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-500"
                  placeholder="Event details, objectives..." />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForm}
                  className="px-6 py-3 text-gray-300 bg-gray-800/50 rounded-xl border border-gray-700 font-medium">
                  Cancel
                </button>
                <motion.button type="submit" disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 text-white font-semibold rounded-xl disabled:opacity-70 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                  ) : (
                    selectedEvent ? 'Update Event' : 'Create Event'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventFormModal;
