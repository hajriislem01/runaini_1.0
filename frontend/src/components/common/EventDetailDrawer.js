import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers, FiEdit, FiTrash2, FiActivity, FiAlertCircle, FiUser } from 'react-icons/fi';
import { FaFutbol, FaTrophy, FaDumbbell } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

const EventDetailDrawer = ({
  detailSession, setDetailSession, isDetailLoading,
  handleEditEvent, setEventToDelete, setShowDeleteConfirm, setShowDayEventsModal,
  userType = 'admin', playerId = null
}) => {
  const { t, i18n } = useTranslation('agendamanagement');
  const isRtl = i18n.language === 'ar';
  const lang = i18n.language;

  // Filter exercises for Player Space (Hook declared before early return)
  const displayExercises = React.useMemo(() => {
    if (!detailSession || !detailSession.exercises) return [];
    if (userType !== 'player' || !playerId) return detailSession.exercises;
    
    return detailSession.exercises.filter(ex => {
      // Show if assigned to 'all' or explicitly to this player
      const assigned = ex.assigned_players || [];
      return !ex.assigned_to || ex.assigned_to === 'all' || assigned.includes(playerId);
    });
  }, [detailSession, userType, playerId]);

  if (!detailSession) return null;

  const fmtTime = (t) => {
    if (!t) return null;
    const parts = t.split(':');
    if (parts.length < 2) return t;
    const h = parseInt(parts[0]);
    const m = parts[1];
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${suffix}`;
  };

  const getDisplayTime = (session) => {
    if (session.start_time || session.end_time) {
      const start = fmtTime(session.start_time);
      const end = fmtTime(session.end_time);
      if (start && end && start !== end) return `${start} — ${end}`;
      return start || end || 'TBD';
    }
    if (session.date && session.date.includes('T')) {
      return format(parseISO(session.date), 'h:mm a');
    }
    return 'TBD';
  };

  const getLocalizedDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = parseISO(dateStr);
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        numberingSystem: 'latn'
      }).format(d);
    } catch (e) {
      return dateStr;
    }
  };

  const renderBadge = (session) => {
    let config = { color: 'from-blue-500 to-blue-600', icon: <FiClock />, label: t('badges.internalMeeting') };
    if (session.type === 'Meeting') {
      config = { color: 'from-blue-500 to-indigo-600', icon: <FiClock />, label: t('badges.internalMeeting') };
    } else if (session.type === 'Match Friendly') {
      config = { color: 'from-orange-500 to-red-600', icon: <FaFutbol />, label: t('badges.friendlyMatch') };
    } else if (session.type === 'Tournament') {
      config = { color: 'from-purple-500 to-indigo-600', icon: <FaTrophy />, label: t('types.tournament') };
    } else if (session._isTraining || session.type === 'Field Training') {
      config = { color: 'from-emerald-500 to-teal-600', icon: <FaDumbbell />, label: t('badges.teamTraining') };
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r shadow-sm ${config.color} ${isRtl ? 'flex-row-reverse' : ''}`}>
        {config.icon}{config.label}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {detailSession && (
        <div className="fixed inset-0 z-[110] flex justify-end pointer-events-none" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Backdrop for the Drawer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailSession(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`relative w-full max-w-lg md:max-w-xl bg-[#0c132a] shadow-2xl flex flex-col overflow-hidden pointer-events-auto ${
              isRtl ? 'border-r border-white/10' : 'border-l border-white/10'
            }`}
          >
            {/* Header */}
            <div className={`p-6 border-b border-white/10 flex items-center justify-between bg-black/20 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : ''}`}>
                <h2 className="text-xl font-bold text-white truncate leading-tight">{detailSession.title}</h2>
                <div className="mt-1.5">
                  {renderBadge(detailSession)}
                </div>
              </div>
              <button onClick={() => setDetailSession(null)}
                className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all ${isRtl ? 'mr-4' : 'ml-4'}`}>
                <FiX size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <div className="w-10 h-10 border-2 border-[#00d0cb]/30 border-t-[#00d0cb] rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm animate-pulse font-medium">Fetching deep-dive data...</p>
                </div>
              ) : (
                <div className="p-8 space-y-10">
                  {/* Meta Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className={`space-y-2 ${isRtl ? 'text-right' : ''}`}>
                      <p className={`text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <FiCalendar className="text-[#00d0cb]" /> {t('form.date')}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {detailSession.date ? getLocalizedDate(detailSession.date) : 'No date set'}
                      </p>
                    </div>
                    <div className={`space-y-2 ${isRtl ? 'text-right' : ''}`}>
                      <p className={`text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <FiClock className="text-[#00d0cb]" /> {t('form.startTime')}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {getDisplayTime(detailSession)}
                      </p>
                    </div>
                    <div className={`space-y-2 ${isRtl ? 'text-right' : ''}`}>
                      <p className={`text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <FiMapPin className="text-[#00d0cb]" /> {t('form.location')}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {detailSession.location || 'Academy Grounds'}
                      </p>
                    </div>
                    <div className={`space-y-2 ${isRtl ? 'text-right' : ''}`}>
                      <p className={`text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <FiUsers className="text-[#00d0cb]" /> {t('targetAudience')}
                      </p>
                      <p className="text-sm font-semibold text-white truncate">
                        {detailSession.group_name || 
                          (detailSession.groups_detail?.length > 0 || detailSession.subgroups_detail?.length > 0
                            ? [
                                ...(detailSession.groups_detail || [])
                                  .filter(g => !detailSession.subgroups_detail?.some(s => s.group_name === g.name))
                                  .map(g => g.name),
                                ...(detailSession.subgroups_detail || [])
                                  .map(s => `${s.group_name} > ${s.name}`)
                              ].join(' • ') 
                            : t('badges.allAcademy'))
                        }
                      </p>
                    </div>
                    <div className={`space-y-2 col-span-2 ${isRtl ? 'text-right' : ''}`}>
                      <p className={`text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <FiUser className="text-[#00d0cb]" /> {t('coachingStaff')}
                      </p>
                      <div className="text-sm font-semibold text-white">
                        {detailSession.coaches_detail && detailSession.coaches_detail.length > 0 ? (
                          <div className={`flex flex-wrap gap-2 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            {detailSession.coaches_detail.map((c) => (
                              <div key={c.id} className={`flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg py-1 ${isRtl ? 'pl-3 pr-1' : 'pr-3 pl-1'}`}>
                                {c.photo ? (
                                  <img src={c.photo} alt={c.name} className="w-6 h-6 rounded-full object-cover border border-[#00d0cb]/30" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00d0cb] to-[#4fb0ff] flex items-center justify-center text-[10px] font-bold text-white">
                                    {c.name.charAt(0)}
                                  </div>
                                )}
                                <span className="text-xs">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic font-normal">{t('noAssignedCoach')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Training Program Section */}
                  {(detailSession._isTraining || detailSession.type === 'Field Training' || detailSession.exercises?.length > 0) && (
                    <div className="space-y-6 pt-4 border-t border-white/5">
                      <h3 className={`text-lg font-bold text-white flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <FaDumbbell className="text-[#00d0cb]" /> {t('trainingProgram')}
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-medium">
                          {displayExercises.length} {t('exercises')} {userType === 'player' && `(${t('badges.specificTargets')})`}
                        </span>
                      </h3>
                      <div className="grid gap-4">
                        {displayExercises.length > 0 ? (
                          displayExercises.map((ex, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00d0cb]/20 transition-all group">
                              <div className={`flex items-start justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className={isRtl ? 'text-right' : ''}>
                                  <h4 className="font-bold text-white text-base group-hover:text-[#00d0cb] transition-colors">{ex.name}</h4>
                                  <div className={`flex items-center gap-2 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00d0cb]">
                                      {ex.duration || ex.duration_minutes || 15} {t('min')}
                                    </span>
                                    {ex.assigned_to === 'individual' && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase font-bold">
                                        {t('badges.specificTargets')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className={`flex gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <div className="text-center">
                                    <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">{t('sets')}</p>
                                    <p className="text-sm font-bold text-white">{ex.sets || '—'}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">{t('reps')}</p>
                                    <p className="text-sm font-bold text-white">{ex.reps || '—'}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">Int</p>
                                    <p className="text-sm font-bold text-white">{ex.intensity || 50}%</p>
                                  </div>
                                </div>
                              </div>
                              {ex.instructions && (
                                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-400 leading-relaxed italic text-center">
                                  "{ex.instructions}"
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic py-4 text-center">No exercises found for this session.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Descriptions Section */}
                  {(detailSession.description || detailSession.objectives || detailSession.notes) && (
                    <div className="space-y-8 pt-4 border-t border-white/5">
                      {detailSession.description && (
                        <div className="space-y-3">
                          <h3 className={`text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <FiAlertCircle className="text-[#00d0cb]" /> {t('form.notesLabel')}
                          </h3>
                          <div className={`p-5 rounded-2xl bg-white/5 border border-white/5 text-sm text-gray-400 leading-relaxed ${isRtl ? 'text-right' : ''}`}>
                            {detailSession.description}
                          </div>
                        </div>
                      )}
                      {detailSession.objectives && (
                        <div className="space-y-3">
                          <h3 className={`text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <FiActivity className="text-[#00d0cb]" /> {t('trainingProgram')}
                          </h3>
                          <div className={`p-5 rounded-2xl bg-white/5 border border-white/5 text-sm text-gray-400 leading-relaxed ${isRtl ? 'text-right' : ''}`}>
                            {detailSession.objectives}
                          </div>
                        </div>
                      )}
                      {detailSession.notes && (
                        <div className="space-y-3">
                          <h3 className={`text-xs font-bold text-amber-400 flex items-center gap-2 uppercase tracking-widest ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <FiAlertCircle className="text-amber-400" /> Special Notes
                          </h3>
                          <div className={`p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-sm text-amber-200/70 leading-relaxed italic ${isRtl ? 'text-right' : ''}`}>
                            {detailSession.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions (For Admin & Coach) */}
            {(userType === 'admin' || userType === 'coach') && (
              <div className={`p-6 border-t border-white/10 bg-black/40 flex gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button onClick={() => { handleEditEvent(detailSession); setDetailSession(null); setShowDayEventsModal && setShowDayEventsModal(false); }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00d0cb] to-[#4fb0ff] text-[#0c132a] font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#00d0cb]/20 transition-all">
                  <FiEdit size={16} /> {t('editSession')}
                </button>
                <button onClick={() => { setEventToDelete(detailSession); setShowDeleteConfirm(true); setDetailSession(null); setShowDayEventsModal && setShowDayEventsModal(false); }}
                  className="p-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
                  <FiTrash2 size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EventDetailDrawer;
