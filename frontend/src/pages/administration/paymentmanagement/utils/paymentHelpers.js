export const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30';
    case 'Pending': return 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30';
    case 'Late': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-800/50 text-gray-300 border-gray-700/50';
  }
};

export const getMethodColor = (method) => {
  switch (method) {
    case 'cash': return 'text-[#22c55e] bg-[#22c55e]/10';
    case 'card': return 'text-[#902bd1] bg-[#902bd1]/10';
    case 'bank_transfer': return 'text-[#4fb0ff] bg-[#4fb0ff]/10';
    case 'check': return 'text-[#eab308] bg-[#eab308]/10';
    case 'online': return 'text-[#00d0cb] bg-[#00d0cb]/10';
    default: return 'text-gray-400 bg-gray-800/50';
  }
};

export const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
export const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
