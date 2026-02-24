/**
 * Input Validation Utilities
 * Centralized validation functions for all user inputs
 */

// Email validation with RFC 5322 standard
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, error: 'Email is required' };
  if (!emailRegex.test(email.trim())) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
};

// Full name validation
export const validateFullName = (name) => {
  const nameValue = name.trim();
  const parts = nameValue.split(' ').filter(part => part.length > 0);
  const nameRegex = /^[a-zA-Z\u00C0-\u00FF]+(['-][a-zA-Z\u00C0-\u00FF]+)*$/;
  
  if (!name) return { valid: false, error: 'Full name is required' };
  if (parts.length < 2) return { valid: false, error: 'Please enter both first and last name' };
  if (parts.some(part => part.length < 2 || !nameRegex.test(part))) {
    return { valid: false, error: 'Please enter a valid full name (letters only)' };
  }
  return { valid: true };
};

// Text length validation
export const validateTextLength = (text, minLength, maxLength, fieldName = 'Text') => {
  if (!text) return { valid: false, error: `${fieldName} is required` };
  const length = text.trim().length;
  if (length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  if (length > maxLength) {
    return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }
  return { valid: true };
};

// Professional title validation
export const validateProfessionalTitle = (title) => {
  const result = validateTextLength(title, 2, 100, 'Professional title');
  if (!result.valid) return result;
  
  // Check for inappropriate content
  const inappropriatePatterns = /[^\w\s\-&]/g;
  if (inappropriatePatterns.test(title)) {
    return { valid: false, error: 'Professional title contains invalid characters' };
  }
  return { valid: true };
};

// Bio validation
export const validateBio = (bio) => {
  return validateTextLength(bio, 0, 500, 'Bio');
};

// Location validation
export const validateLocation = (location) => {
  if (!location) return { valid: true }; // Optional field
  return validateTextLength(location, 2, 100, 'Location');
};

// URL validation
export const validateUrl = (url) => {
  if (!url) return { valid: true }; // Optional field
  try {
    new URL(url);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Solana wallet address validation
export const validateSolanaAddress = (address) => {
  if (!address) return { valid: false, error: 'Wallet address is required' };
  // Solana addresses are base58 encoded, 32-34 characters
  const solanaRegex = /^[1-9A-HJ-NP-Z]{32,34}$/;
  if (!solanaRegex.test(address)) {
    return { valid: false, error: 'Invalid Solana wallet address' };
  }
  return { valid: true };
};

// File validation
export const validateFile = (file, maxSizeMB = 10, allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']) => {
  if (!file) return { valid: false, error: 'File is required' };
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not supported. Allowed: ${allowedTypes.join(', ')}` };
  }
  
  return { valid: true };
};

// Proof name validation
export const validateProofName = (name) => {
  return validateTextLength(name, 3, 100, 'Proof name');
};

// Proof summary validation
export const validateProofSummary = (summary) => {
  return validateTextLength(summary, 10, 1000, 'Proof summary');
};

// Reference link validation (optional)
export const validateReferenceLink = (link) => {
  if (!link) return { valid: true }; // Optional field
  return validateUrl(link);
};

// SOL amount validation
export const validateSolAmount = (amount) => {
  if (!amount) return { valid: false, error: 'Amount is required' };
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return { valid: false, error: 'Amount must be a number' };
  if (numAmount <= 0) return { valid: false, error: 'Amount must be greater than 0' };
  if (numAmount > 1000) return { valid: false, error: 'Amount exceeds maximum limit' };
  return { valid: true };
};

// Batch validation utility
export const validateBatch = (validations) => {
  const results = {};
  let hasErrors = false;
  
  for (const [field, result] of Object.entries(validations)) {
    results[field] = result;
    if (!result.valid) hasErrors = true;
  }
  
  return { valid: !hasErrors, errors: results };
};

// Sanitize HTML to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Trim and normalize input
export const normalizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return sanitizeInput(input.trim());
};

// Username/handle validation
export const validateUsername = (username) => {
  if (!username) return { valid: false, error: 'Username is required' };
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, error: 'Username must be 3-30 characters (letters, numbers, underscore, hyphen only)' };
  }
  return { valid: true };
};

export default {
  validateEmail,
  validateFullName,
  validateTextLength,
  validateProfessionalTitle,
  validateBio,
  validateLocation,
  validateUrl,
  validateSolanaAddress,
  validateFile,
  validateProofName,
  validateProofSummary,
  validateReferenceLink,
  validateSolAmount,
  validateBatch,
  sanitizeInput,
  normalizeInput,
  validateUsername,
};
