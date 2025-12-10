const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePhone = (phone) => {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');

  // Check if it's a 10-digit number directly
  if (/^\d{10}$/.test(cleaned)) {
    return true;
  }

  // If it has more than 10 digits, try to strip country code (assuming 1-3 digits)
  // This is a simple heuristic; for a real app, use libphonenumber-js
  if (cleaned.length > 10) {
    const withoutCountryCode = cleaned.slice(-10);
    return /^\d{10}$/.test(withoutCountryCode);
  }

  return false;
};

const normalizeEmail = (email) => {
  // For Gmail, remove dots before @
  if (email.includes('@gmail.com')) {
    const [localPart, domain] = email.split('@');
    return localPart.replace(/\./g, '') + '@' + domain;
  }
  return email.toLowerCase().trim();
};

const normalizePhone = (phone) => {
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Remove country code if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  // Remove leading country code (usually 1-3 digits like +91)
  cleaned = cleaned.replace(/^\d{1,3}/, '');
  return cleaned;
};

const normalizeName = (name) => {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
};

const statusTransitions = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['converted', 'lost'],
  converted: [],
  lost: [],
};

const isValidStatusTransition = (fromStatus, toStatus) => {
  if (fromStatus === toStatus) return true;
  // Any status can go to 'lost'
  if (toStatus === 'lost') return true;
  return statusTransitions[fromStatus]?.includes(toStatus) || false;
};

module.exports = {
  validateEmail,
  validatePhone,
  normalizeEmail,
  normalizePhone,
  normalizeName,
  isValidStatusTransition,
};
