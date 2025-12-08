/**
 * Application Constants
 *
 * Centralized branding, contact information, and application metadata.
 * Change these values to update branding across all pages.
 */

// ============================================================================
// APPLICATION BRANDING
// ============================================================================

/**
 * Application name and branding
 */
export const APP_NAME = "Project 2052";

/**
 * Application tagline
 */
export const APP_TAGLINE = "Lease Proposal Platform";

/**
 * Full application title for page headers
 */
export const APP_FULL_TITLE = `${APP_NAME} - ${APP_TAGLINE}`;

/**
 * Application description for meta tags
 */
export const APP_DESCRIPTION =
  "Financial planning application for 30-year lease proposal projections in Saudi Arabian Riyals (SAR).";

// ============================================================================
// CONTACT INFORMATION
// ============================================================================

/**
 * Support email address
 */
export const SUPPORT_EMAIL = "support@project2052.com";

/**
 * Help desk URL (if any)
 */
export const HELP_URL = "/help";

// ============================================================================
// NAVIGATION ROUTES
// ============================================================================

/**
 * Core application routes
 */
export const ROUTES = {
  /** Home/landing page */
  home: "/",
  /** Main dashboard */
  dashboard: "/dashboard",
  /** Login page */
  login: "/login",
  /** Registration page */
  register: "/register",
  /** Forgot password page */
  forgotPassword: "/forgot-password",
  /** Reset password page */
  resetPassword: "/reset-password",
  /** Email verification page */
  verifyEmail: "/verify-email",
  /** Proposals list */
  proposals: "/proposals",
  /** Create new proposal */
  newProposal: "/proposals/new",
  /** Negotiations list */
  negotiations: "/negotiations",
  /** Admin section */
  admin: "/admin",
  /** Admin configuration */
  adminConfig: "/admin/config",
  /** Admin historical data */
  adminHistorical: "/admin/historical",
  /** Admin transition config */
  adminTransition: "/admin/transition",
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * API route paths
 */
export const API_ROUTES = {
  /** Authentication */
  auth: {
    signup: "/api/auth/signup",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    invalidateSession: "/api/auth/invalidate-session",
  },
  /** Proposals */
  proposals: {
    base: "/api/proposals",
    byId: (id: string) => `/api/proposals/${id}`,
    calculate: "/api/proposals/calculate",
    duplicate: (id: string) => `/api/proposals/${id}/duplicate`,
    recalculate: (id: string) => `/api/proposals/${id}/recalculate`,
    scenarios: (id: string) => `/api/proposals/${id}/scenarios`,
  },
  /** Negotiations */
  negotiations: {
    base: "/api/negotiations",
    byId: (id: string) => `/api/negotiations/${id}`,
  },
  /** Dashboard */
  dashboard: {
    metrics: "/api/dashboard/metrics",
  },
  /** Health check */
  health: "/api/health",
  /** Historical data */
  historical: "/api/historical",
  /** Users */
  users: {
    base: "/api/users",
    byId: (id: string) => `/api/users/${id}`,
  },
} as const;

// ============================================================================
// EXTERNAL LINKS
// ============================================================================

/**
 * External resource URLs
 */
export const EXTERNAL_LINKS = {
  /** Documentation */
  docs: "https://docs.project2052.com",
  /** Privacy policy */
  privacy: "/privacy",
  /** Terms of service */
  terms: "/terms",
} as const;

// ============================================================================
// SEO / META
// ============================================================================

/**
 * Default meta tags for pages
 */
export const DEFAULT_META = {
  title: APP_FULL_TITLE,
  description: APP_DESCRIPTION,
  keywords:
    "lease proposal, financial planning, 30-year projection, SAR, Saudi Arabia",
} as const;
