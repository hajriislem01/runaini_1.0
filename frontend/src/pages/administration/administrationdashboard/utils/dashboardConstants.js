import React from 'react';
import {
  FiUsers, FiUser, FiCalendar, FiTarget, FiCreditCard, FiAward
} from 'react-icons/fi';
import {
  FaUserTie, FaEnvelope
} from 'react-icons/fa';

export const getStatCards = (stats, t) => [
  {
    label: t('stats.totalPlayers'),
    value: stats.totalPlayers,
    icon: <FiUsers className="text-2xl" />,
    color: 'from-[#902bd1] to-[#4fb0ff]',
    trend: t('stats.active'),
    trendColor: 'text-cyan-400'
  },
  {
    label: t('stats.totalCoaches'),
    value: stats.totalCoaches,
    icon: <FiUser className="text-2xl" />,
    color: 'from-[#00d0cb] to-[#4fb0ff]',
    trend: t('stats.active'),
    trendColor: 'text-cyan-400'
  },
  {
    label: t('stats.upcomingEvents'),
    value: stats.totalEvents,
    icon: <FiCalendar className="text-2xl" />,
    color: 'from-[#4fb0ff] to-[#7c3aed]',
    trend: t('stats.scheduled'),
    trendColor: 'text-blue-400'
  },
  {
    label: t('stats.activeGroups'),
    value: stats.activeGroups,
    icon: <FiAward className="text-2xl" />,
    color: 'from-[#902bd1] to-[#7c3aed]',
    trend: t('stats.groups'),
    trendColor: 'text-purple-400'
  }
];

export const getQuickActions = (t) => [
  { title: t('quickActions.managePlayers'), description: t('quickActions.managePlayersDesc'), icon: <FiUsers className="text-2xl" />, color: 'from-[#902bd1] to-[#4fb0ff]', to: '/administration/player-management' },
  { title: t('quickActions.manageCoaches'), description: t('quickActions.manageCoachesDesc'), icon: <FiUser className="text-2xl" />, color: 'from-[#00d0cb] to-[#4fb0ff]', to: '/administration/coach-management' },
  { title: t('quickActions.createEvent'), description: t('quickActions.createEventDesc'), icon: <FiTarget className="text-2xl" />, color: 'from-[#4fb0ff] to-[#7c3aed]', to: '/administration/create-event' },
  { title: t('quickActions.viewAgenda'), description: t('quickActions.viewAgendaDesc'), icon: <FiCalendar className="text-2xl" />, color: 'from-[#902bd1] to-[#7c3aed]', to: '/administration/agenda-management' }
];

export const getOverviewItems = (t) => [
  { icon: <FiUsers className="text-[#4fb0ff] text-lg" />, label: t('overview.players'), to: '/administration/player-management' },
  { icon: <FaUserTie className="text-[#00d0cb] text-lg" />, label: t('overview.coaches'), to: '/administration/coach-management' },
  { icon: <FiCreditCard className="text-[#902bd1] text-lg" />, label: t('overview.payments'), to: '/administration/payment-management' },
  { icon: <FaEnvelope className="text-yellow-400 text-lg" />, label: t('overview.contact'), to: '/administration/contact' },
];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
