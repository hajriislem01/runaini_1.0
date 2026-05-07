import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiUser, FiUsers, FiLayers, FiCheck } from 'react-icons/fi';

const LuxuryMultiSelect = ({ 
  label, 
  icon: Icon, 
  items = [], 
  selectedIds = [], 
  onToggle, 
  placeholder = "Select...",
  variant = "blue"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter(item => 
    item?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItems = safeItems.filter(item => selectedIds.includes(item.id));

  const colors = {
    blue: {
      ring: "focus:ring-[#4fb0ff]",
      bg: "bg-[#4fb0ff]/10",
      text: "text-[#4fb0ff]",
      border: "border-[#4fb0ff]/20",
      active: "bg-[#4fb0ff]"
    },
    teal: {
      ring: "focus:ring-[#00d0cb]",
      bg: "bg-[#00d0cb]/10",
      text: "text-[#00d0cb]",
      border: "border-[#00d0cb]/20",
      active: "bg-[#00d0cb]"
    },
    purple: {
      ring: "focus:ring-[#902bd1]",
      bg: "bg-[#902bd1]/10",
      text: "text-[#902bd1]",
      border: "border-[#902bd1]/20",
      active: "bg-[#902bd1]"
    }
  }[variant];

  return (
    <div className="relative">
      <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
        <Icon size={14} className={colors.text} />
        {label}
        {selectedIds.length > 0 && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} ml-auto font-bold`}>
            {selectedIds.length} Selected
          </span>
        )}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[52px] w-full px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-xl cursor-pointer hover:border-gray-600 transition-all flex flex-wrap gap-2 items-center focus-within:ring-2 ${colors.ring}`}
      >
        {selectedItems.length === 0 && !isOpen && (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        )}
        
        {selectedItems.map(item => (
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            key={item.id}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
            onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
          >
            {item.name || item.full_name}
            <FiX className="cursor-pointer hover:text-white" />
          </motion.span>
        ))}

        <div className="flex-1 min-w-[60px]">
          {isOpen && (
            <input 
              autoFocus
              type="text" 
              className="w-full bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 p-0"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 top-full mt-2 z-[70] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
            >
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm italic">No results found</div>
              ) : (
                <div className="py-1">
                  {filteredItems.map(item => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                        className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? `${colors.bg} ${colors.text}` : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name || item.full_name}</span>
                          {item.group_name && <span className="text-[10px] opacity-60 uppercase">{item.group_name}</span>}
                          {item.role && <span className="text-[10px] opacity-60 uppercase">{item.role}</span>}
                        </div>
                        {isSelected && <FiCheck className="shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const EventFormModal = ({
  showEventModal, resetForm, selectedEvent,
  eventForm, handleFormChange,
  handleSubmit, isSubmitting,
  groupsWithSubgroups, coaches, players,
  handleGroupToggle, handleSubgroupToggle,
  handleCoachToggle, handlePlayerToggle
}) => {
  const filteredSubgroups = useMemo(() => {
    return groupsWithSubgroups
      .filter(g => eventForm.assignedGroups.includes(g.id))
      .flatMap(g => (g.subgroups || []).map(s => ({ ...s, group_name: g.name })));
  }, [groupsWithSubgroups, eventForm.assignedGroups]);

  // Transform coaches to include names
  const coachesList = useMemo(() => {
    return (coaches || []).map(c => {
      // API returns coach_profile object with id
      const profileId = c.coach_profile?.id || c.id;
      return {
        id: profileId,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username,
        role: 'Coach'
      };
    });
  }, [coaches]);

  if (!showEventModal) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedEvent ? 'EDIT' : 'NEW'} <span className="text-[#00d0cb]">EVENT</span>
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Configure visibility and event details</p>
            </div>
            <button onClick={resetForm} className="text-gray-500 hover:text-white p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all">
              <FiX size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
            <form id="event-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Info Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <div className="h-px flex-1 bg-gray-800"/>
                  <span>Basic Information</span>
                  <div className="h-px flex-1 bg-gray-800"/>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Event Title</label>
                  <input type="text" name="title" value={eventForm.title} onChange={handleFormChange}
                    className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-600 transition-all"
                    placeholder="E.g., Tactical Session, Friendly Match..." required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Date</label>
                    <input type="date" name="date" value={eventForm.date} onChange={handleFormChange}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Event Type</label>
                    <select name="type" value={eventForm.type} onChange={handleFormChange}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white">
                      <option value="training">Training</option>
                      <option value="match">Match Friendly</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Start Time</label>
                    <input type="time" name="startTime" value={eventForm.startTime} onChange={handleFormChange}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">End Time</label>
                    <input type="time" name="endTime" value={eventForm.endTime} onChange={handleFormChange}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white" required />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Location</label>
                  <input type="text" name="location" value={eventForm.location} onChange={handleFormChange}
                    className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-600"
                    placeholder="Field number, Stadium name..." />
                </div>
              </section>

              {/* Targeting Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <div className="h-px flex-1 bg-gray-800"/>
                  <span>Granular Visibility Targets</span>
                  <div className="h-px flex-1 bg-gray-800"/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LuxuryMultiSelect 
                    label="Target Groups" icon={FiUsers}
                    variant="teal"
                    items={groupsWithSubgroups}
                    selectedIds={eventForm.assignedGroups}
                    onToggle={handleGroupToggle}
                    placeholder="All academy groups..."
                  />
                  
                  <LuxuryMultiSelect 
                    label="Target Sub-groups" icon={FiLayers}
                    variant="purple"
                    items={filteredSubgroups}
                    selectedIds={eventForm.assignedSubgroups}
                    onToggle={handleSubgroupToggle}
                    placeholder={eventForm.assignedGroups.length === 0 ? "Select group first..." : "Select subgroups..."}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LuxuryMultiSelect 
                    label="Target Specific Coaches" icon={FiUser} 
                    variant="blue"
                    items={coachesList}
                    selectedIds={eventForm.targetCoaches}
                    onToggle={handleCoachToggle}
                    placeholder="Search coaches..."
                  />
                  
                  <LuxuryMultiSelect 
                    label="Target Specific Players" icon={FiUser} 
                    variant="blue"
                    items={players}
                    selectedIds={eventForm.targetPlayers}
                    onToggle={handlePlayerToggle}
                    placeholder="Search players..."
                  />
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1">Smart Visibility Logic</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This event will only appear for the selected targets. If groups/subgroups are selected, 
                    associated coaches and players will see it automatically. Individual targeting filters specifically for meetings or elite sessions.
                  </p>
                </div>
              </section>

              {/* Additional Details Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <div className="h-px flex-1 bg-gray-800"/>
                  <span>Additional Details</span>
                  <div className="h-px flex-1 bg-gray-800"/>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Description / Objectives</label>
                  <textarea name="description" value={eventForm.description} onChange={handleFormChange}
                    rows="4"
                    className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-600 resize-none"
                    placeholder="Provide context, required gear, or specific objectives for this event..." />
                </div>
              </section>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 sm:p-8 border-t border-gray-800 bg-gray-900/50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button type="button" onClick={resetForm}
              className="w-full sm:w-auto px-8 py-4 text-gray-400 bg-gray-800/50 hover:bg-gray-800 hover:text-white rounded-2xl border border-gray-700/50 font-bold text-sm transition-all order-2 sm:order-1">
              DISCARD
            </button>
            <motion.button form="event-form" type="submit" disabled={isSubmitting}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-10 py-4 text-white font-black rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-[#00d0cb]/10 order-1 sm:order-2"
              style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}>
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>PROCESSING</>
              ) : (
                selectedEvent ? 'UPDATE EVENT' : 'PUBLISH EVENT'
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventFormModal;
