export const toastStyles = {
  success: { duration: 2000, style: { background: 'linear-gradient(to right, #10B981, #059669)', color: '#fff', padding: '16px 20px', borderRadius: '12px' }, icon: '🎉' },
  error: { duration: 3000, style: { background: 'linear-gradient(to right, #EF4444, #DC2626)', color: '#fff', padding: '16px 20px', borderRadius: '12px' }, icon: '❌' },
  warning: { duration: 3000, style: { background: 'linear-gradient(to right, #F59E0B, #D97706)', color: '#fff', padding: '16px 20px', borderRadius: '12px' }, icon: '⚠️' }
};

export const northAfricanCountries = [
  { value: 'TN', label: 'Tunisia' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'MA', label: 'Morocco' },
  { value: 'LY', label: 'Libya' },
  { value: 'EG', label: 'Egypt' },
  { value: 'MR', label: 'Mauritania' }
];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
