


export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};


export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && cleaned.length >= 10;
};


export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { valid: false, error: 'Username is required' };
  }
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must not exceed 20 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true, error: '' };
};


export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required', strength: null };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters', strength: null };
  }

  if (password.length > 100) {
    return { valid: false, error: 'Password must not exceed 100 characters', strength: null };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter', strength: null };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter', strength: null };
  }

  if (!/(?=.*[0-9])/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number', strength: null };
  }

  
  const strength = calculatePasswordStrength(password);

  return { valid: true, error: '', strength };
};


export const calculatePasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: '', color: '' };
  }

  let score = 0;

  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  let label = '';
  let color = '';

  if (score <= 2) {
    label = 'Weak';
    color = 'bg-red-500';
  } else if (score <= 4) {
    label = 'Medium';
    color = 'bg-yellow-500';
  } else {
    label = 'Strong';
    color = 'bg-green-500';
  }

  return { score, label, color };
};


export const validateSKU = (sku) => {
  if (!sku || !sku.trim()) {
    return { valid: false, error: 'SKU code is required' };
  }
  if (sku.trim().length < 3) {
    return { valid: false, error: 'SKU code must be at least 3 characters' };
  }
  if (!/^[A-Z0-9-_]+$/i.test(sku)) {
    return { valid: false, error: 'SKU code can only contain letters, numbers, hyphens, and underscores' };
  }
  return { valid: true, error: '' };
};


export const validatePositiveNumber = (value, fieldName, allowZero = false) => {
  if (value === '' || value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  const numValue = parseFloat(value);

  if (numValue < 0) {
    return { valid: false, error: `${fieldName} cannot be negative` };
  }

  if (!allowZero && numValue === 0) {
    return { valid: false, error: `${fieldName} must be greater than 0` };
  }

  return { valid: true, error: '' };
};


export const validateRequired = (value, fieldName, minLength = 0) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (minLength > 0 && typeof value === 'string' && value.trim().length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  return { valid: true, error: '' };
};


export const validateDate = (date, fieldName, afterDate = null, afterFieldName = '') => {
  if (!date) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (afterDate && new Date(date) < new Date(afterDate)) {
    return {
      valid: false,
      error: `${fieldName} must be on or after ${afterFieldName}`
    };
  }

  return { valid: true, error: '' };
};


export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }

  return { valid: true, error: '' };
};


export const validatePercentage = (value, fieldName) => {
  if (value === '' || value === null || value === undefined) {
    
    return { valid: true, error: '' };
  }

  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  const numValue = parseFloat(value);

  if (numValue < 0 || numValue > 100) {
    return { valid: false, error: `${fieldName} must be between 0 and 100` };
  }

  return { valid: true, error: '' };
};


export const validateArrayNotEmpty = (arr, fieldName) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return { valid: false, error: `At least one ${fieldName} is required` };
  }

  return { valid: true, error: '' };
};

export default {
  isValidEmail,
  isValidPhone,
  validateUsername,
  validatePassword,
  calculatePasswordStrength,
  validateSKU,
  validatePositiveNumber,
  validateRequired,
  validateDate,
  validateConfirmPassword,
  validatePercentage,
  validateArrayNotEmpty,
};
