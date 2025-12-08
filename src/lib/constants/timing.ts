/**
 * Timing Constants
 *
 * Centralized timing values for animations, delays, and transitions.
 * These ensure consistent UX behavior across the application.
 */

// ============================================================================
// REDIRECT DELAYS
// ============================================================================

/**
 * Redirect delays in milliseconds
 */
export const REDIRECT_DELAYS = {
  /** Quick redirect after action (e.g., form submission) */
  quick: 500,
  /** Standard redirect after success message display */
  standard: 1500,
  /** Extended redirect for important notifications */
  extended: 2000,
  /** Long delay for email verification success */
  verification: 2000,
} as const;

// ============================================================================
// AUTO-HIDE DELAYS
// ============================================================================

/**
 * Auto-hide delays for notifications and alerts in milliseconds
 */
export const AUTO_HIDE_DELAYS = {
  /** Short notification (toast) */
  toast: 3000,
  /** Standard alert */
  alert: 5000,
  /** Success message that user should read */
  success: 5000,
  /** Long-lasting notification */
  long: 10000,
  /** Error messages (longer to ensure reading) */
  error: 8000,
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATIONS = {
  /** Instant/no animation */
  instant: 0,
  /** Very fast micro-interaction */
  fast: 100,
  /** Standard transition */
  normal: 200,
  /** Slightly slower for emphasis */
  medium: 300,
  /** Noticeable animation */
  slow: 500,
  /** Long animation for charts/graphs */
  chart: 750,
  /** Extended animation for dramatic effect */
  extended: 1000,
  /** Number ticker/counter animations */
  counter: 2000,
} as const;

/**
 * Chart-specific animation durations
 */
export const CHART_ANIMATION_DURATIONS = {
  /** Default chart animation */
  default: 500,
  /** Waterfall chart animation */
  waterfall: 1500,
  /** Line chart reveal */
  line: 750,
  /** Bar chart grow */
  bar: 500,
  /** Pie chart rotate */
  pie: 1000,
} as const;

// ============================================================================
// DEBOUNCE & THROTTLE
// ============================================================================

/**
 * Debounce delays in milliseconds
 */
export const DEBOUNCE_DELAYS = {
  /** Fast typing (autocomplete) */
  typing: 150,
  /** Standard input (search, filter) */
  input: 300,
  /** Slider/range input */
  slider: 300,
  /** Window resize */
  resize: 200,
  /** Scroll events */
  scroll: 100,
  /** API calls */
  api: 500,
} as const;

/**
 * Throttle intervals in milliseconds
 */
export const THROTTLE_INTERVALS = {
  /** Mouse move tracking */
  mouseMove: 50,
  /** Scroll tracking */
  scroll: 100,
  /** Window resize */
  resize: 100,
  /** Drag operations */
  drag: 16, // ~60fps
} as const;

// ============================================================================
// TRANSITION EASINGS
// ============================================================================

/**
 * CSS easing functions
 */
export const EASINGS = {
  /** Linear - no acceleration */
  linear: "linear",
  /** Standard ease */
  ease: "ease",
  /** Ease in - slow start */
  easeIn: "ease-in",
  /** Ease out - slow end */
  easeOut: "ease-out",
  /** Ease in-out - slow start and end */
  easeInOut: "ease-in-out",
  /** Custom exponential ease out */
  easeOutExpo: "cubic-bezier(0.19, 1, 0.22, 1)",
  /** Spring-like bounce */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  /** Smooth deceleration */
  smoothOut: "cubic-bezier(0, 0, 0.2, 1)",
} as const;

// ============================================================================
// API TIMEOUTS
// ============================================================================

/**
 * API timeout values in milliseconds
 */
export const API_TIMEOUTS = {
  /** Quick read operations */
  read: 5000,
  /** Standard operations */
  standard: 10000,
  /** Write operations */
  write: 15000,
  /** File upload/download */
  upload: 30000,
  /** Heavy calculations */
  calculation: 30000,
  /** Authentication operations */
  auth: 15000,
} as const;

// ============================================================================
// POLLING INTERVALS
// ============================================================================

/**
 * Polling intervals in milliseconds
 */
export const POLLING_INTERVALS = {
  /** Real-time updates */
  realtime: 1000,
  /** Frequent updates */
  fast: 5000,
  /** Standard updates */
  normal: 15000,
  /** Background updates */
  slow: 60000,
  /** Infrequent checks */
  background: 300000, // 5 minutes
} as const;

// ============================================================================
// SESSION & TIMEOUT
// ============================================================================

/**
 * Session-related timing in milliseconds
 */
export const SESSION_TIMING = {
  /** Cookie wait after login */
  cookieWait: 100,
  /** Session verification delay */
  verificationDelay: 100,
  /** Idle timeout warning (25 minutes) */
  idleWarning: 25 * 60 * 1000,
  /** Idle timeout (30 minutes) */
  idleTimeout: 30 * 60 * 1000,
} as const;

// ============================================================================
// SPRING PHYSICS (for motion libraries)
// ============================================================================

/**
 * Spring physics configurations for framer-motion / react-spring
 */
export const SPRING_CONFIGS = {
  /** Gentle spring */
  gentle: { damping: 30, stiffness: 100 },
  /** Default spring */
  default: { damping: 60, stiffness: 100 },
  /** Snappy spring */
  snappy: { damping: 30, stiffness: 300 },
  /** Bouncy spring */
  bouncy: { damping: 10, stiffness: 200 },
  /** No bounce - critical damping */
  noBounce: { damping: 26, stiffness: 170 },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a CSS transition string
 * @param property - CSS property to transition
 * @param duration - Duration from ANIMATION_DURATIONS
 * @param easing - Easing from EASINGS
 */
export function createTransition(
  property: string = "all",
  duration: keyof typeof ANIMATION_DURATIONS = "normal",
  easing: keyof typeof EASINGS = "easeOut",
): string {
  return `${property} ${ANIMATION_DURATIONS[duration]}ms ${EASINGS[easing]}`;
}

/**
 * Create multiple CSS transitions
 * @param transitions - Array of [property, duration, easing] tuples
 */
export function createTransitions(
  transitions: Array<
    [
      property: string,
      duration?: keyof typeof ANIMATION_DURATIONS,
      easing?: keyof typeof EASINGS,
    ]
  >,
): string {
  return transitions
    .map(([prop, dur = "normal", ease = "easeOut"]) =>
      createTransition(prop, dur, ease),
    )
    .join(", ");
}
