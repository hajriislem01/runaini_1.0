import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX, FiUser, FiUsers, FiLayers, FiCheck } from 'react-icons/fi';
import CustomDatePicker from '../../paymentmanagement/components/CustomDatePicker';

/* ── Luxury Multi-Select ─────────────────────────────────────────── */
const LuxuryMultiSelect = ({
  label,
  icon: Icon,
  items = [],
  selectedIds = [],
  onToggle,
  placeholder = 'Select...',
  variant = 'blue',
  isRtl = false,
}) => {
  const { t } = useTranslation('agendamanagement');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = safeItems.filter(item =>
    item?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item?.full_name?.toLowerCase().includes(search.toLowerCase())
  );
  const selectedItems = safeItems.filter(item => selectedIds.includes(item.id));

  const colors = {
    blue:   { ring: 'focus:ring-[#4fb0ff]', bg: 'bg-[#4fb0ff]/10', text: 'text-[#4fb0ff]', border: 'border-[#4fb0ff]/20' },
    teal:   { ring: 'focus:ring-[#00d0cb]', bg: 'bg-[#00d0cb]/10', text: 'text-[#00d0cb]', border: 'border-[#00d0cb]/20' },
    purple: { ring: 'focus:ring-[#902bd1]', bg: 'bg-[#902bd1]/10', text: 'text-[#902bd1]', border: 'border-[#902bd1]/20' },
  }[variant];

  return (
    <div className="relative">
      <label className={`text-gray-400 text-sm font-medium mb-2 flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
        <Icon size={14} className={colors.text} />
        {label}
        {selectedIds.length > 0 && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} ml-auto font-bold`}>
            {selectedIds.length} {t('form.selected')}
          </span>
        )}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[52px] w-full px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-xl cursor-pointer hover:border-gray-600 transition-all flex flex-wrap gap-2 items-center focus-within:ring-2 ${colors.ring} ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        {selectedItems.length === 0 && !isOpen && (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        )}
        {selectedItems.map(item => (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={item.id}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${isRtl ? 'flex-row-reverse' : ''}`}
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
              className={`w-full bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 p-0 ${isRtl ? 'text-right' : ''}`}
              placeholder={t('form.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`absolute left-0 right-0 top-full mt-2 z-[70] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm italic">{t('form.noResults')}</div>
              ) : (
                <div className="py-1">
                  {filteredItems.map(item => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                        className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${isRtl ? 'flex-row-reverse' : ''} ${
                          isSelected ? `${colors.bg} ${colors.text}` : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <div className={`flex flex-col ${isRtl ? 'items-end' : ''}`}>
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

/* ── EventFormModal ──────────────────────────────────────────────── */
const EventFormModal = ({
  showEventModal, resetForm, selectedEvent,
  eventForm, handleFormChange,
  handleSubmit, isSubmitting,
  groupsWithSubgroups, coaches, players,
  handleGroupToggle, handleSubgroupToggle,
  handleCoachToggle, handlePlayerToggle,
}) => {
  const { t, i18n } = useTranslation('agendamanagement');
  const isRtl = i18n.language === 'ar';

  const filteredSubgroups = useMemo(() => {
    return groupsWithSubgroups
      .filter(g => eventForm.assignedGroups.includes(g.id))
      .flatMap(g => (g.subgroups || []).map(s => ({ ...s, group_name: g.name })));
  }, [groupsWithSubgroups, eventForm.assignedGroups]);

  const coachesList = useMemo(() => {
    return (coaches || []).map(c => {
      const profileId = c.coach_profile?.id || c.id;
      return {
        id: profileId,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username,
        role: 'Coach',
      };
    });
  }, [coaches]);

  if (!showEventModal) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className={`p-6 sm:p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-right' : ''}>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedEvent ? t('form.editLabel') : t('form.newLabel')}{' '}
                <span className="text-[#00d0cb]">{t('form.eventLabel')}</span>
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">{t('form.configureSubtitle')}</p>
            </div>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-white p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <FiX size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
            <form id="event-form" onSubmit={handleSubmit} className="space-y-8">

              {/* ── Basic Info ── */}
              <section className="space-y-4">
                <div className={`flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="h-px flex-1 bg-gray-800" />
                  <span>{t('form.basicInfoSection')}</span>
                  <div className="h-px flex-1 bg-gray-800" />
                </div>

                {/* Title */}
                <div>
                  <label className={`block text-gray-400 text-sm font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
                    {t('form.eventTitleLabel')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleFormChange}
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-600 transition-all"
                    placeholder={t('form.titlePlaceholder')}
                    required
                  />
                </div>

                {/* Date + Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-gray-400 text-sm font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
                      {t('form.dateLabel')}
                    </label>
                    <CustomDatePicker
                      id="modal-event-date"
                      value={eventForm.date}
                      onChange={(iso) => handleFormChange({ target: { name: 'date', value: iso } })}
                      accentColor="#00d0cb"
                      placeholder={t('form.selectDatePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className={`block text-gray-400 text-sm font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
                      {t('form.eventTypeLabel')}
                    </label>
                    <select
                      name="type"
                      value={eventForm.type}
                      onChange={handleFormChange}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                    >
                      <option value="training">{t('types.training')}</option>
                      <option value="match">{t('types.matchFriendly')}</option>
                      <option value="meeting">{t('types.meeting')}</option>
                    </select>
                  </div>
                </div>

                {/* Start + End Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-gray-400 text-sm font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
                      {t('form.startTimeLabel')}
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={eventForm.startTime}
                      onChange={handleFormChange}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-gray-400 text-sm font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
                      {t('form.endTimeLabel')}
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={eventForm.endTime}
                      onChange={handleFormChange}
                      className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className={`block text-gray-400 text-sm font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
                    {t('form.locationLabel')}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={eventForm.location}
                    onChange={handleFormChange}
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-600"
                    placeholder={t('form.locationPlaceholder')}
                  />
                </div>
              </section>

              {/* ── Targeting ── */}
              <section className="space-y-6">
                <div className={`flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="h-px flex-1 bg-gray-800" />
                  <span>{t('form.targetingSection')}</span>
                  <div className="h-px flex-1 bg-gray-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LuxuryMultiSelect
                    label={t('form.targetGroupsLabel')}
                    icon={FiUsers}
                    variant="teal"
                    items={groupsWithSubgroups}
                    selectedIds={eventForm.assignedGroups}
                    onToggle={handleGroupToggle}
                    placeholder={t('form.allGroupsPlaceholder')}
                    isRtl={isRtl}
                  />
                  <LuxuryMultiSelect
                    label={t('form.targetSubgroupsLabel')}
                    icon={FiLayers}
                    variant="purple"
                    items={filteredSubgroups}
                    selectedIds={eventForm.assignedSubgroups}
                    onToggle={handleSubgroupToggle}
                    placeholder={eventForm.assignedGroups.length === 0 ? t('form.selectGroupFirst') : t('form.selectSubgroupsPlaceholder')}
                    isRtl={isRtl}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LuxuryMultiSelect
                    label={t('form.targetCoachesLabel')}
                    icon={FiUser}
                    variant="blue"
                    items={coachesList}
                    selectedIds={eventForm.targetCoaches}
                    onToggle={handleCoachToggle}
                    placeholder={t('form.coachesPlaceholder')}
                    isRtl={isRtl}
                  />
                  <LuxuryMultiSelect
                    label={t('form.targetPlayersLabel')}
                    icon={FiUser}
                    variant="blue"
                    items={players}
                    selectedIds={eventForm.targetPlayers}
                    onToggle={handlePlayerToggle}
                    placeholder={t('form.playersPlaceholder')}
                    isRtl={isRtl}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <p className={`text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1 ${isRtl ? 'text-right' : ''}`}>
                    {t('form.smartVisibilityTitle')}
                  </p>
                  <p className={`text-xs text-gray-500 leading-relaxed ${isRtl ? 'text-right' : ''}`}>
                    {t('form.smartVisibilityDesc')}
                  </p>
                </div>
              </section>

              {/* ── Additional Details ── */}
              <section className="space-y-4">
                <div className={`flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="h-px flex-1 bg-gray-800" />
                  <span>{t('form.additionalSection')}</span>
                  <div className="h-px flex-1 bg-gray-800" />
                </div>
                <div>
                  <label className={`block text-gray-400 text-sm font-medium mb-2 ${isRtl ? 'text-right' : ''}`}>
                    {t('form.notesLabel')}
                  </label>
                  <textarea
                    name="description"
                    value={eventForm.description}
                    onChange={handleFormChange}
                    rows="4"
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className="w-full px-5 py-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00d0cb] text-white placeholder-gray-600 resize-none"
                    placeholder={t('form.notesPlaceholder')}
                  />
                </div>
              </section>
            </form>
          </div>

          {/* Footer */}
          <div className={`p-6 sm:p-8 border-t border-gray-800 bg-gray-900/50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-8 py-4 text-gray-400 bg-gray-800/50 hover:bg-gray-800 hover:text-white rounded-2xl border border-gray-700/50 font-bold text-sm transition-all"
            >
              {t('actions.discard')}
            </button>
            <motion.button
              form="event-form"
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-10 py-4 text-white font-black rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-[#00d0cb]/10"
              style={{ background: 'linear-gradient(135deg, #4fb0ff, #00d0cb)' }}
            >
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('actions.processing')}</>
              ) : (
                selectedEvent ? t('actions.updateEvent') : t('actions.publishEvent')
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventFormModal;
