/**
 * Supabase Configuration Validation
 *
 * Validates Supabase URL and API key formats to fail fast with clear error messages.
 * This prevents cryptic errors from the Supabase client when misconfigured.
 */

/**
 * Validation result for Supabase configuration
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates Supabase URL format
 *
 * Expected format: https://<project-ref>.supabase.co
 * - Must be HTTPS
 * - Must be a valid URL
 * - Should end with .supabase.co (warning if not)
 */
export function validateSupabaseUrl(url: string | undefined): ValidationResult {
  if (!url) {
    return { valid: false, error: "Supabase URL is not defined" };
  }

  // Check if it's a valid URL
  try {
    const parsed = new URL(url);

    // Must use HTTPS in production
    if (parsed.protocol !== "https:") {
      // Allow http for local development (localhost/127.0.0.1)
      if (
        parsed.protocol === "http:" &&
        (parsed.hostname === "localhost" ||
          parsed.hostname === "127.0.0.1" ||
          parsed.hostname.startsWith("192.168."))
      ) {
        // Local development is OK
      } else {
        return {
          valid: false,
          error: `Supabase URL must use HTTPS. Got: ${parsed.protocol}`,
        };
      }
    }

    // Warn (but don't fail) if not a standard Supabase domain
    if (
      !parsed.hostname.endsWith(".supabase.co") &&
      !parsed.hostname.includes("localhost") &&
      !parsed.hostname.includes("127.0.0.1")
    ) {
      console.warn(
        `Supabase URL does not appear to be a standard Supabase domain: ${parsed.hostname}. ` +
          `If using a custom domain, this is expected.`,
      );
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: `Invalid Supabase URL format: ${url}. Expected a valid URL like https://xxxx.supabase.co`,
    };
  }
}

/**
 * Valid Supabase key prefixes
 *
 * Supabase supports two key formats:
 * 1. Legacy JWT tokens: eyJ<base64>.<base64>.<signature>
 * 2. New format (2024+): sb_<type>_<random> where type is publishable, secret, anon, service_role
 */
const VALID_KEY_PREFIXES = [
  "eyJ", // Legacy JWT format
  "sb_publishable_", // New public/publishable key
  "sb_secret_", // New secret key
  "sb_anon_", // New anon key (alternative naming)
  "sb_service_role_", // New service role key
];

/**
 * Validates Supabase API key format
 *
 * Supabase keys come in two formats:
 * 1. Legacy: JWT tokens (eyJ<base64>.<base64>.<signature>)
 * 2. New (2024+): sb_<type>_<random> (e.g., sb_publishable_xxx, sb_secret_xxx)
 */
export function validateSupabaseKey(
  key: string | undefined,
  keyName: string,
): ValidationResult {
  if (!key) {
    return { valid: false, error: `${keyName} is not defined` };
  }

  // Check if key starts with any valid prefix
  const hasValidPrefix = VALID_KEY_PREFIXES.some((prefix) =>
    key.startsWith(prefix),
  );

  if (!hasValidPrefix) {
    return {
      valid: false,
      error:
        `${keyName} does not appear to be a valid Supabase API key. ` +
        `Expected either a JWT token (starting with 'eyJ') or ` +
        `a new-format key (starting with 'sb_publishable_', 'sb_secret_', etc.). ` +
        `Please check your environment configuration.`,
    };
  }

  // For legacy JWT tokens, validate structure
  if (key.startsWith("eyJ")) {
    const parts = key.split(".");
    if (parts.length !== 3) {
      return {
        valid: false,
        error:
          `${keyName} has invalid JWT structure. ` +
          `Expected 3 parts (header.payload.signature), got ${parts.length}. ` +
          `Please verify you're using the correct API key from Supabase dashboard.`,
      };
    }

    // Basic length check for JWT - typically 200+ characters
    if (key.length < 100) {
      return {
        valid: false,
        error:
          `${keyName} appears too short (${key.length} chars). ` +
          `Supabase JWT keys are typically 200+ characters. ` +
          `Please verify you copied the full key.`,
      };
    }
  } else {
    // For new format keys, just check minimum length (they're typically 40+ chars)
    if (key.length < 30) {
      return {
        valid: false,
        error:
          `${keyName} appears too short (${key.length} chars). ` +
          `Supabase API keys are typically 40+ characters. ` +
          `Please verify you copied the full key.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validates complete Supabase configuration
 *
 * @param url - Supabase project URL
 * @param key - API key (anon, secret, or service_role)
 * @param keyName - Display name for error messages
 * @throws Error with descriptive message if validation fails
 */
export function validateSupabaseConfig(
  url: string | undefined,
  key: string | undefined,
  keyName: string,
): void {
  const urlResult = validateSupabaseUrl(url);
  if (!urlResult.valid) {
    throw new Error(
      `Supabase configuration error: ${urlResult.error}\n\n` +
        `Please check your environment variables:\n` +
        `- NEXT_PUBLIC_SUPABASE_URL (for client-side)\n` +
        `- SUPABASE_URL (for server-side)`,
    );
  }

  const keyResult = validateSupabaseKey(key, keyName);
  if (!keyResult.valid) {
    throw new Error(
      `Supabase configuration error: ${keyResult.error}\n\n` +
        `Please check your environment variables and ensure you're using ` +
        `the correct key from your Supabase project settings.`,
    );
  }
}
