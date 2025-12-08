/**
 * Constants - Central Export
 *
 * Import all application constants from one place:
 * import { APP_NAME, DEFAULT_STAFF, REDIRECT_DELAYS } from '@/lib/constants';
 *
 * Categories:
 * - app.ts: Branding, contact info, routes
 * - business-defaults.ts: Default values for proposals
 * - periods.ts: Year boundaries and period helpers
 * - timing.ts: Animation and delay values
 * - validation.ts: Form validation rules
 */

// Application branding and routes
export {
  APP_NAME,
  APP_TAGLINE,
  APP_FULL_TITLE,
  APP_DESCRIPTION,
  SUPPORT_EMAIL,
  HELP_URL,
  ROUTES,
  API_ROUTES,
  EXTERNAL_LINKS,
  DEFAULT_META,
} from "./app";

// Business defaults for proposals
export {
  DEFAULT_ENROLLMENT,
  DEFAULT_FRENCH_PROGRAM,
  DEFAULT_IB_PROGRAM,
  DEFAULT_CURRICULUM,
  DEFAULT_STAFF,
  DEFAULT_FIXED_RENT,
  DEFAULT_REVENUE_SHARE,
  DEFAULT_PARTNER_INVESTMENT,
  DEFAULT_FINANCIAL_RATES,
  DEFAULT_OTHER_OPEX_PERCENT,
  OPEX_PERCENTAGE_RANGE,
  getDefaultRentParams,
} from "./business-defaults";

// Period and year constants
export {
  // Re-exported from engine
  HISTORICAL_START_YEAR,
  HISTORICAL_END_YEAR,
  TRANSITION_START_YEAR,
  TRANSITION_END_YEAR,
  DYNAMIC_START_YEAR,
  getDynamicEndYear,
  getTotalPeriodCount,
  // UI-specific
  PERIOD_LABELS,
  PERIOD_DESCRIPTIONS,
  PERIOD_YEAR_RANGES,
  DEFAULT_RAMP_UP_END_YEAR,
  DEFAULT_IB_START_YEAR,
  CONTRACT_PERIOD_OPTIONS,
  DEFAULT_CONTRACT_PERIOD_YEARS,
  getDynamicYearRange,
  getAllPeriodYearRanges,
  HISTORICAL_YEARS,
  TRANSITION_YEARS,
  getDynamicYears,
  getAllProjectionYears,
  YEAR_RANGE_PRESETS,
  getYearRangeOptions,
} from "./periods";

// Timing and animation
export {
  REDIRECT_DELAYS,
  AUTO_HIDE_DELAYS,
  ANIMATION_DURATIONS,
  CHART_ANIMATION_DURATIONS,
  DEBOUNCE_DELAYS,
  THROTTLE_INTERVALS,
  EASINGS,
  API_TIMEOUTS,
  POLLING_INTERVALS,
  SESSION_TIMING,
  SPRING_CONFIGS,
  createTransition,
  createTransitions,
} from "./timing";

// Validation rules
export {
  NAME_VALIDATION,
  EMAIL_VALIDATION,
  PASSWORD_VALIDATION,
  DEVELOPER_VALIDATION,
  PROPERTY_VALIDATION,
  NOTES_VALIDATION,
  PROPOSAL_NAME_VALIDATION,
  PERCENTAGE_VALIDATION,
  GROWTH_RATE_VALIDATION,
  FREQUENCY_VALIDATION,
  CURRENCY_VALIDATION,
  STUDENT_COUNT_VALIDATION,
  validatePassword,
  validateEmail,
} from "./validation";
