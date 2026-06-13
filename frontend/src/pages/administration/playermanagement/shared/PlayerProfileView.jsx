import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin,
  FiCalendar, FiUsers, FiGrid, FiActivity, FiEdit2,
} from 'react-icons/fi';
import { FaMedal, FaFutbol } from 'react-icons/fa';

const toWestern = (num) =>
  String(num).replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) =>
    String(d.charCodeAt(0) - (d.charCodeAt(0) >= 0x06F0 ? 0x06F0 : 0x0660))
  );

// ─── Position colour helper ────────────────────────────────────────────────────
const posColor = (pos) => {
  if (!pos) return '#4fb0ff';
  const p = pos.toLowerCase();
  if (p.includes('keeper') || p.includes('goal')) return '#f59e0b';
  if (p.includes('defend'))  return '#22c55e';
  if (p.includes('mid'))     return '#4fb0ff';
  if (p.includes('forward') || p.includes('attack')) return '#ef4444';
  return '#4fb0ff';
};

// ─── Status colour helper ──────────────────────────────────────────────────────
const statusStyle = (status) => {
  if (status === 'Active')   return 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,.25)]';
  if (status === 'Injured')  return 'bg-amber-500/20  text-amber-400  border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

// ═══════════════════════════════════════════════════════════════════════════════
const PlayerProfileView = ({ player, onBack }) => {
  const { t, i18n } = useTranslation('coachplayers');
  const isRtl = i18n.language === 'ar';

  if (!player) return null;

  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const iV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  // Resolve nested objects from serializer
  const groupName    = typeof player.group    === 'object' ? player.group?.name    : player.group;
  const subgroupName = typeof player.subgroup === 'object' ? player.subgroup?.name : player.subgroup;
  const email        = player.user?.email || player.email;
  const photoSrc     = player.profile_picture || player.photo_url;

  // Name: use full_name — it might include a space so we grab the first char safely
  const displayName  = player.full_name || player.name || 'Unnamed Player';

  // Physical stats — only shown when actually populated
  const hasPhysical  = player.height || player.weight || player.foot;
  const hasContact   = email || player.phone || player.address;
  const hasGroup     = groupName || subgroupName;

  return (
    <motion.div className="min-h-screen text-white p-4 sm:p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg,#000000 0%,#0a0f2a 45%,#180033 100%)' }}
      initial="hidden" animate="visible" variants={cV}
      dir={isRtl ? 'rtl' : 'ltr'}>

      <div className="max-w-7xl mx-auto">
      {/* ══ HERO BANNER ══ */}
      <div className="shadow-xl p-6 md:p-8 mb-6 md:mb-8 relative overflow-hidden border border-gray-700/50" 
           style={{ background: 'var(--main-gradient)', borderRadius: 'var(--dashboard-radius)' }}>
        {/* Decoration blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-white/5" />
        </div>

        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
          <div className={`flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full ${isRtl ? 'md:flex-row-reverse' : ''}`}>

            {/* Avatar */}
            <div className="relative flex-shrink-0 w-32 h-32 md:w-40 md:h-40">
              <div className="w-full h-full overflow-hidden border-4 shadow-xl"
                style={{ 
                  borderColor: 'rgba(255,255,255,.2)',
                  borderRadius: 'var(--dashboard-radius)'
                }}>
                {photoSrc ? (
                  <img src={photoSrc} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold uppercase"
                       style={{ background: 'rgba(255,255,255,.1)', color: 'var(--header-text-color)' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Status dot */}
              {player.status && (
                <div className={`absolute bottom-0 ${isRtl ? 'left-0' : 'right-0'} w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-[#0a0f2a] ${
                  player.status === 'Active' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,.7)]' :
                  player.status === 'Injured' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
              )}
            </div>

            {/* Name & meta */}
            <div className={`flex-1 mt-2 md:mt-0 ${isRtl ? 'text-right' : 'text-left'}`}>
              <p className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: 'var(--header-text-color)', opacity: 0.7 }}>
                {t('playerProfileDetailedView')}
              </p>
              <div className={`flex items-center gap-3 flex-wrap mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--header-text-color)' }}>{displayName}</h1>
                <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold ${isRtl ? 'flex-row-reverse' : ''}`}
                  style={{ background: 'var(--header-text-color)', color: '#000', opacity: 0.9, borderRadius: 'var(--dashboard-radius)' }}>
                  <FaMedal style={{ fontSize: 11 }} />{t('player') || 'PLAYER'}
                </span>
              </div>

              {/* Inline badges */}
              <div className={`flex flex-wrap gap-2 mt-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {player.position && (
                  <span className={`flex items-center gap-1 px-3 py-1 text-sm font-bold border ${isRtl ? 'flex-row-reverse' : ''}`}
                    style={{ borderRadius: 'var(--dashboard-radius)', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--header-text-color)' }}>
                    <FaFutbol style={{ fontSize: 11 }} />{t('pos_' + player.position.toLowerCase()) || player.position}
                  </span>
                )}
                {player.status && (
                  <span className={`px-3 py-1 text-sm font-semibold border ${statusStyle(player.status)}`} style={{ borderRadius: 'var(--dashboard-radius)' }}>
                    {player.status === 'Active' ? t('activeStatus') : player.status === 'Injured' ? t('injuredStatus') : player.status === 'Inactive' ? t('inactiveStatus') : t('onTrialStatus') || player.status}
                  </span>
                )}
                {groupName && (
                  <span className={`flex items-center gap-1 px-3 py-1 text-sm font-medium border ${isRtl ? 'flex-row-reverse' : ''}`}
                    style={{ borderRadius: 'var(--dashboard-radius)', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--header-text-color)' }}>
                    <FiUsers size={12} />{groupName}
                    {subgroupName && <span className={`opacity-70 ${isRtl ? 'mr-1' : 'ml-1'}`}>/ {subgroupName}</span>}
                  </span>
                )}
              </div>
            </div>

            {/* Back */}
            {onBack && (
              <div className={`flex gap-2 self-center mt-4 md:mt-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white shadow-lg flex-shrink-0 transition-all bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] ${isRtl ? 'flex-row-reverse' : ''}`}
                  style={{ borderRadius: 'var(--dashboard-radius)' }}>
                  <FiArrowLeft size={15} className={isRtl ? 'rotate-180' : ''} />{t('goBack')}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div>
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRtl ? 'text-right' : ''}`}>

          {/* ── LEFT COLUMN ── */}
          <motion.div variants={iV} className="space-y-5">

            {/* Contact */}
            {hasContact && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className={`text-base font-bold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#902bd1,#4fb0ff)' }} />
                  {t('contactInformation')}
                </h2>
                <div className="space-y-3">
                  {email && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <FiMail className="text-[#4fb0ff] flex-shrink-0" size={15} />
                      <span className={`text-sm text-gray-300 break-all ${isRtl ? 'text-right' : ''}`}>{email}</span>
                    </div>
                  )}
                  {player.phone && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <FiPhone className="text-[#00d0cb] flex-shrink-0" size={15} />
                      <span className="text-sm text-gray-300">{toWestern(player.phone)}</span>
                    </div>
                  )}
                  {player.address && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gray-800/30 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <FiMapPin className="text-[#902bd1] flex-shrink-0" size={15} />
                      <span className="text-sm text-gray-300">{player.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Physical Stats */}
            {hasPhysical && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className={`text-base font-bold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#f59e0b,#ef4444)' }} />
                  {t('physicalProfile')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {player.height && (
                    <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 text-center">
                      <p className="text-xs text-gray-500 mb-1">{t('height')}</p>
                      <p className="text-lg font-bold text-[#00d0cb]">{toWestern(player.height)} <span className="text-xs text-gray-500">{t('cm')}</span></p>
                    </div>
                  )}
                  {player.weight && (
                    <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 text-center">
                      <p className="text-xs text-gray-500 mb-1">{t('weight')}</p>
                      <p className="text-lg font-bold text-[#902bd1]">{toWestern(player.weight)} <span className="text-xs text-gray-500">{t('kg')}</span></p>
                    </div>
                  )}
                  {player.foot && (
                    <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 text-center col-span-2">
                      <p className="text-xs text-gray-500 mb-1">{t('preferredFoot')}</p>
                      <p className="text-base font-bold text-white">{player.foot}</p>
                    </div>
                  )}
                  {player.date_of_birth && (
                    <div className={`p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 col-span-2 flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <FiCalendar className="text-[#4fb0ff] flex-shrink-0" size={15} />
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <p className="text-xs text-gray-500">{t('dateOfBirth')}</p>
                        <p className="text-sm text-white font-medium">{toWestern(player.date_of_birth)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Group Assignment */}
            {hasGroup && (
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className={`text-base font-bold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-1 h-5 rounded-full bg-[#00d0cb]" />
                  <FiUsers size={14} className="text-[#00d0cb]" />{t('teamAffiliation')}
                </h2>
                <div className="space-y-2">
                  {groupName && (
                    <div className={`flex justify-between items-center p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-xs text-gray-500 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}><FiUsers size={11} />{t('group')}</span>
                      <span className="text-sm text-white font-medium">{groupName}</span>
                    </div>
                  )}
                  {subgroupName && (
                    <div className={`flex justify-between items-center p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-xs text-gray-500 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}><FiGrid size={11} />{t('subgroup')}</span>
                      <span className="text-sm font-bold px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(79,176,255,.15)', color: '#4fb0ff', border: '1px solid rgba(79,176,255,.25)' }}>
                        {subgroupName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bio */}
            {player.bio && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className={`text-base font-bold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#4fb0ff,#00d0cb)' }} />
                  {t('about')}
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">{player.bio}</p>
              </motion.div>
            )}

            {/* Health / Notes */}
            {player.notes && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className={`text-base font-bold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <FiActivity className="text-[#22c55e]" size={16} />
                  {t('coachNotes')}
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">{player.notes}</p>
              </motion.div>
            )}

            {/* Position detail card — only if position exists */}
            {player.position && (
              <motion.div variants={iV} className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
                <h2 className={`text-base font-bold text-white mb-5 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <FaFutbol className="text-[#f59e0b]" style={{ fontSize: 16 }} />
                  {t('playingPosition')}
                </h2>
                <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: posColor(player.position) + '20', border: `1px solid ${posColor(player.position)}30` }}>
                    <FaFutbol style={{ fontSize: 26, color: posColor(player.position) }} />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <p className="text-2xl font-extrabold" style={{ color: posColor(player.position) }}>
                      {t('pos_' + player.position.toLowerCase()) || player.position}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{t('fieldPosition')}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {!player.bio && !player.notes && !player.position && (
              <motion.div variants={iV}
                className="bg-gray-900/70 rounded-2xl p-12 border border-dashed border-gray-700/50 text-center">
                <FiEdit2 className="mx-auto text-gray-600 mb-4" size={36} />
                <p className="text-white text-base font-medium mb-1">{t('noDetailedProfileYet')}</p>
                <p className="text-gray-500 text-sm">
                  {t('playerHasNotFilledBio')}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default PlayerProfileView;
