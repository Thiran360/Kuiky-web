export const validateField = (type, value) => {
  switch (type) {
    case 'email':
      // Standard email regex
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'phone':
      // 10-digit number check (Update if you need international format)
      return /^[6-9]\d{9}$/.test(value);
    default:
      return true;
  }
};