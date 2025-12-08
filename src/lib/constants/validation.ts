/**
 * Validation Constants
 *
 * Centralized validation rules for forms across the application.
 * These constants ensure consistent validation behavior.
 */

// ============================================================================
// USER VALIDATION
// ============================================================================

/**
 * Name field validation rules
 */
export const NAME_VALIDATION = {
  /** Minimum name length */
  minLength: 2,
  /** Maximum name length */
  maxLength: 100,
  /** Error messages */
  messages: {
    required: "Name is required",
    tooShort: "Name must be at least 2 characters",
    tooLong: "Name cannot exceed 100 characters",
  },
} as const;

/**
 * Email field validation rules
 */
export const EMAIL_VALIDATION = {
  /** Maximum email length */
  maxLength: 255,
  /** Regex pattern for email validation */
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** Error messages */
  messages: {
    required: "Email is required",
    invalid: "Please enter a valid email address",
    tooLong: "Email cannot exceed 255 characters",
  },
} as const;

/**
 * Password field validation rules
 */
export const PASSWORD_VALIDATION = {
  /** Minimum password length */
  minLength: 8,
  /** Maximum password length */
  maxLength: 128,
  /** Whether uppercase is required */
  requireUppercase: true,
  /** Whether lowercase is required */
  requireLowercase: true,
  /** Whether number is required */
  requireNumber: true,
  /** Whether special character is required */
  requireSpecial: false,
  /** Error messages */
  messages: {
    required: "Password is required",
    tooShort: "Password must be at least 8 characters",
    tooLong: "Password cannot exceed 128 characters",
    needsUppercase: "Password must contain at least one uppercase letter",
    needsLowercase: "Password must contain at least one lowercase letter",
    needsNumber: "Password must contain at least one number",
    needsSpecial: "Password must contain at least one special character",
    mismatch: "Passwords do not match",
  },
} as const;

// ============================================================================
// NEGOTIATION VALIDATION
// ============================================================================

/**
 * Developer name validation rules
 */
export const DEVELOPER_VALIDATION = {
  /** Minimum length */
  minLength: 1,
  /** Maximum length */
  maxLength: 100,
  /** Error messages */
  messages: {
    required: "Developer name is required",
    tooLong: "Developer name cannot exceed 100 characters",
  },
} as const;

/**
 * Property name validation rules
 */
export const PROPERTY_VALIDATION = {
  /** Minimum length */
  minLength: 1,
  /** Maximum length */
  maxLength: 200,
  /** Error messages */
  messages: {
    required: "Property name is required",
    tooLong: "Property name cannot exceed 200 characters",
  },
} as const;

/**
 * Notes field validation rules
 */
export const NOTES_VALIDATION = {
  /** Maximum length */
  maxLength: 2000,
  /** Error messages */
  messages: {
    tooLong: "Notes cannot exceed 2000 characters",
  },
} as const;

// ============================================================================
// PROPOSAL VALIDATION
// ============================================================================

/**
 * Proposal name validation rules
 */
export const PROPOSAL_NAME_VALIDATION = {
  /** Minimum length */
  minLength: 1,
  /** Maximum length */
  maxLength: 200,
  /** Error messages */
  messages: {
    required: "Proposal name is required",
    tooLong: "Proposal name cannot exceed 200 characters",
  },
} as const;

// ============================================================================
// NUMERIC VALIDATION
// ============================================================================

/**
 * Percentage field validation rules
 */
export const PERCENTAGE_VALIDATION = {
  /** Minimum value */
  min: 0,
  /** Maximum value */
  max: 100,
  /** Error messages */
  messages: {
    outOfRange: "Percentage must be between 0 and 100",
    negative: "Percentage cannot be negative",
    exceedsMax: "Percentage cannot exceed 100%",
  },
} as const;

/**
 * Growth rate validation rules (annual percentage)
 */
export const GROWTH_RATE_VALIDATION = {
  /** Minimum value */
  min: 0,
  /** Maximum value */
  max: 20,
  /** Error messages */
  messages: {
    negative: "Growth rate cannot be negative",
    exceedsMax: "Growth rate cannot exceed 20%",
  },
} as const;

/**
 * Frequency validation rules (years between adjustments)
 */
export const FREQUENCY_VALIDATION = {
  /** Minimum value */
  min: 1,
  /** Maximum value */
  max: 5,
  /** Error messages */
  messages: {
    tooLow: "Frequency must be at least 1 year",
    tooHigh: "Frequency cannot exceed 5 years",
    notInteger: "Frequency must be a whole number",
  },
} as const;

/**
 * Currency amount validation rules
 */
export const CURRENCY_VALIDATION = {
  /** Minimum value */
  min: 0,
  /** Maximum value for rent/amounts (500M SAR) */
  maxAmount: 500000000,
  /** Error messages */
  messages: {
    negative: "Amount cannot be negative",
    required: "Amount is required",
    exceedsMax: "Amount exceeds maximum allowed value",
  },
} as const;

/**
 * Student count validation rules
 */
export const STUDENT_COUNT_VALIDATION = {
  /** Minimum value */
  min: 0,
  /** Maximum value */
  max: 10000,
  /** Error messages */
  messages: {
    negative: "Student count cannot be negative",
    exceedsMax: "Student count cannot exceed 10,000",
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate password against all rules
 * @param password - Password to validate
 * @returns Object with isValid boolean and array of error messages
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    return { isValid: false, errors: [PASSWORD_VALIDATION.messages.required] };
  }

  if (password.length < PASSWORD_VALIDATION.minLength) {
    errors.push(PASSWORD_VALIDATION.messages.tooShort);
  }

  if (password.length > PASSWORD_VALIDATION.maxLength) {
    errors.push(PASSWORD_VALIDATION.messages.tooLong);
  }

  if (PASSWORD_VALIDATION.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push(PASSWORD_VALIDATION.messages.needsUppercase);
  }

  if (PASSWORD_VALIDATION.requireLowercase && !/[a-z]/.test(password)) {
    errors.push(PASSWORD_VALIDATION.messages.needsLowercase);
  }

  if (PASSWORD_VALIDATION.requireNumber && !/\d/.test(password)) {
    errors.push(PASSWORD_VALIDATION.messages.needsNumber);
  }

  if (
    PASSWORD_VALIDATION.requireSpecial &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push(PASSWORD_VALIDATION.messages.needsSpecial);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email) {
    return { isValid: false, error: EMAIL_VALIDATION.messages.required };
  }

  if (email.length > EMAIL_VALIDATION.maxLength) {
    return { isValid: false, error: EMAIL_VALIDATION.messages.tooLong };
  }

  if (!EMAIL_VALIDATION.pattern.test(email)) {
    return { isValid: false, error: EMAIL_VALIDATION.messages.invalid };
  }

  return { isValid: true };
}
