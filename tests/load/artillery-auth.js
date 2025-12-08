/**
 * Artillery Authentication Plugin for Supabase
 *
 * This module provides authentication hooks for Artillery load tests.
 * It signs in via Supabase and sets the required cookies for API requests.
 *
 * Environment Variables Required:
 * - ARTILLERY_TEST_EMAIL: Test user email
 * - ARTILLERY_TEST_PASSWORD: Test user password
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon/public key
 *
 * Usage in artillery.yml:
 * ```yaml
 * config:
 *   processor: "./tests/load/artillery-auth.js"
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@supabase/supabase-js");

// Supabase configuration from environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Test credentials from environment
const TEST_EMAIL = process.env.ARTILLERY_TEST_EMAIL;
const TEST_PASSWORD = process.env.ARTILLERY_TEST_PASSWORD;

// Cache for authenticated session to avoid re-authenticating each scenario
let cachedSession = null;
let sessionExpiresAt = 0;

/**
 * Extract project reference from Supabase URL
 * e.g., https://abc123.supabase.co -> abc123
 */
function getProjectRef() {
  if (!SUPABASE_URL) return "project";
  const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : "project";
}

/**
 * Format cookie value for Supabase SSR format
 * The cookie stores base64-encoded session data
 */
function formatSupabaseCookie(session) {
  const cookieData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };
  // Supabase SSR uses base64 encoding for the cookie value
  return Buffer.from(JSON.stringify(cookieData)).toString("base64");
}

/**
 * Get authenticated session (with caching)
 */
async function getSession() {
  // Return cached session if still valid (with 5 min buffer)
  const now = Math.floor(Date.now() / 1000);
  if (cachedSession && sessionExpiresAt > now + 300) {
    return cachedSession;
  }

  // Validate configuration
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(
      "Artillery Auth Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return null;
  }

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.error(
      "Artillery Auth Error: Missing ARTILLERY_TEST_EMAIL or ARTILLERY_TEST_PASSWORD"
    );
    console.error(
      "Set these environment variables to enable authenticated load testing"
    );
    return null;
  }

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Sign in with email/password
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (error) {
    console.error("Artillery Auth Error: Sign in failed -", error.message);
    return null;
  }

  if (!data.session) {
    console.error("Artillery Auth Error: No session returned from sign in");
    return null;
  }

  // Cache the session
  cachedSession = data.session;
  sessionExpiresAt = data.session.expires_at;

  console.log(
    `Artillery: Authenticated as ${data.user?.email} (expires in ${Math.floor((sessionExpiresAt - now) / 60)} min)`
  );

  return cachedSession;
}

/**
 * Artillery beforeRequest hook
 * Sets authentication cookies before each HTTP request
 *
 * @param {Object} requestParams - Artillery request parameters
 * @param {Object} context - Artillery virtual user context
 * @param {Object} ee - Artillery event emitter
 * @param {Function} next - Callback to continue
 */
async function setAuthCookies(requestParams, context, ee, next) {
  try {
    const session = await getSession();

    if (session) {
      const projectRef = getProjectRef();
      const cookieName = `sb-${projectRef}-auth-token`;
      const cookieValue = formatSupabaseCookie(session);

      // Set cookie header
      if (!requestParams.headers) {
        requestParams.headers = {};
      }

      // Set the auth cookie in Supabase SSR format
      requestParams.headers["Cookie"] = `${cookieName}=${cookieValue}`;

      // Also set Authorization header as fallback
      requestParams.headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error("Artillery Auth Error:", error.message);
  }

  next();
}

/**
 * Artillery beforeScenario hook
 * Called before each virtual user scenario starts
 * Pre-authenticates and stores session in context
 *
 * @param {Object} context - Artillery virtual user context
 * @param {Object} ee - Artillery event emitter
 * @param {Function} next - Callback to continue
 */
async function beforeScenario(context, ee, next) {
  try {
    const session = await getSession();

    if (session) {
      // Store auth data in context for use in requests
      context.vars.accessToken = session.access_token;
      context.vars.isAuthenticated = true;

      const projectRef = getProjectRef();
      context.vars.authCookieName = `sb-${projectRef}-auth-token`;
      context.vars.authCookieValue = formatSupabaseCookie(session);
    } else {
      context.vars.isAuthenticated = false;
      console.warn(
        "Artillery: Running scenario without authentication (check credentials)"
      );
    }
  } catch (error) {
    console.error("Artillery beforeScenario error:", error.message);
    context.vars.isAuthenticated = false;
  }

  next();
}

/**
 * Artillery function to add auth headers to a request
 * Can be called from scenarios via function: "addAuthHeaders"
 */
function addAuthHeaders(requestParams, context, ee, next) {
  if (context.vars.isAuthenticated) {
    if (!requestParams.headers) {
      requestParams.headers = {};
    }

    requestParams.headers["Cookie"] =
      `${context.vars.authCookieName}=${context.vars.authCookieValue}`;
    requestParams.headers["Authorization"] =
      `Bearer ${context.vars.accessToken}`;
  }

  next();
}

// Export hooks for Artillery
module.exports = {
  beforeScenario,
  setAuthCookies,
  addAuthHeaders,
};
