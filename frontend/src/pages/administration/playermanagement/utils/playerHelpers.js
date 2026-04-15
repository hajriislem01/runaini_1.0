export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return Math.min(strength, 5);
};

export const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
export const strengthColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-400',
  'bg-green-600'
];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const validatePlayerForm = (formData, editPlayerId, setErrors) => {
  const newErrors = {};

  if (!formData.full_name.trim()) {
    newErrors.full_name = 'Full name is required';
  }

  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Invalid email format';
  }

  if (!editPlayerId && !formData.password) {
    newErrors.password = 'Password is required';
  }

  if (formData.height && (formData.height < 100 || formData.height > 250)) {
    newErrors.height = 'Height must be between 100-250 cm';
  }

  if (formData.weight && (formData.weight < 30 || formData.weight > 200)) {
    newErrors.weight = 'Weight must be between 30-200 kg';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
