import React from 'react';
import {
  FiUsers, FiUser, FiCalendar, FiTarget, FiCreditCard, FiAward
} from 'react-icons/fi';
import {
  FaUserTie, FaEnvelope
} from 'react-icons/fa';

export const getStatCards = (stats) => [
  {
    label: 'Total Players',
    value: stats.totalPlayers,
    icon: <FiUsers className="text-2xl" />,
    color: 'from-[#902bd1] to-[#4fb0ff]',
    trend: 'Active',
    trendColor: 'text-cyan-400'
  },
  {
    label: 'Total Coaches',
    value: stats.totalCoaches,
    icon: <FiUser className="text-2xl" />,
    color: 'from-[#00d0cb] to-[#4fb0ff]',
    trend: 'Active',
    trendColor: 'text-cyan-400'
  },
  {
    label: 'Upcoming Events',
    value: stats.totalEvents,
    icon: <FiCalendar className="text-2xl" />,
    color: 'from-[#4fb0ff] to-[#7c3aed]',
    trend: 'Scheduled',
    trendColor: 'text-blue-400'
  },
  {
    label: 'Active Groups',
    value: stats.activeGroups,
    icon: <FiAward className="text-2xl" />,
    color: 'from-[#902bd1] to-[#7c3aed]',
    trend: 'Groups',
    trendColor: 'text-purple-400'
  }
];

export const getQuickActions = () => [
  { title: 'Manage Players', description: 'View and manage all players', icon: <FiUsers className="text-2xl" />, color: 'from-[#902bd1] to-[#4fb0ff]', to: '/administration/player-management' },
  { title: 'Manage Coaches', description: 'View and manage coaches', icon: <FiUser className="text-2xl" />, color: 'from-[#00d0cb] to-[#4fb0ff]', to: '/administration/coach-management' },
  { title: 'Create Event', description: 'Schedule a new event', icon: <FiTarget className="text-2xl" />, color: 'from-[#4fb0ff] to-[#7c3aed]', to: '/administration/create-event' },
  { title: 'View Agenda', description: 'Check upcoming events', icon: <FiCalendar className="text-2xl" />, color: 'from-[#902bd1] to-[#7c3aed]', to: '/administration/agenda-management' }
];

export const getOverviewItems = () => [
  { icon: <FiUsers className="text-[#4fb0ff] text-lg" />, label: 'Players Management', to: '/administration/player-management' },
  { icon: <FaUserTie className="text-[#00d0cb] text-lg" />, label: 'Coaches Management', to: '/administration/coach-management' },
  { icon: <FiCreditCard className="text-[#902bd1] text-lg" />, label: 'Payments & Billing', to: '/administration/payment-management' },
  { icon: <FaEnvelope className="text-yellow-400 text-lg" />, label: 'Contact & Support', to: '/administration/contact' },
];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
