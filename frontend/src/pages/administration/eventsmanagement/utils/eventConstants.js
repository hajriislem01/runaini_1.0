export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const formatDate = (dateString, format = 'short') => {
  if (format === 'long') {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
  const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const getEventStatus = (event) => {
  if (event.status === 'completed') return 'Completed';
  if (event.status === 'cancelled') return 'Cancelled';
  if (event.winner) return 'Winner Selected';
  if (event.participants?.every(p => p.status === 'accepted')) return 'All Accepted';
  if (event.participants?.some(p => p.status === 'pending')) return 'Pending Approvals';
  return 'Open';
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30';
    case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Winner Selected': return 'bg-[#902bd1]/20 text-[#902bd1] border-[#902bd1]/30';
    case 'All Accepted': return 'bg-[#00d0cb]/20 text-[#00d0cb] border-[#00d0cb]/30';
    case 'Pending Approvals': return 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30';
    case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-800/50 text-gray-300 border-gray-700/50';
  }
};

export const getEventTypeColor = (type) => {
  return type === 'Tournament' ? 'from-[#902bd1] to-[#00d0cb]' : 'from-[#902bd1] to-[#4fb0ff]';
};
