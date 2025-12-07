/**
 * Supabase Client for Server Components and API Routes
 *
 * Uses the NEW Supabase API Keys (publishable/secret):
 * - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL (fallback)
 * - SUPABASE_SECRET_KEY (NEW - preferred)
 *
 * ⚠️ Legacy Keys: This code path uses NEW keys only. Legacy keys (anon/service_role)
 * are kept only for compatibility during migration. Once all components are migrated,
 * legacy keys should be deactivated in Supabase dashboard.
 *
 * This client should ONLY be used in server-side code (Server Components, API routes, Server Actions).
 * ⚠️ NEVER expose the secret key in client-side code.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // Use SUPABASE_URL if available, otherwise fall back to NEXT_PUBLIC_SUPABASE_URL
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  // SECURITY: For server-side user operations, prefer the secret key.
  // The secret key allows server-side auth verification while respecting RLS.
  // Only fall back to anon key if explicitly configured for user-context operations.
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error(
      "Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable",
    );
  }

  // SECURITY: Require SUPABASE_SECRET_KEY for server operations
  // This prevents silent fallback to less privileged keys which could cause
  // unexpected authorization behavior
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY environment variable. " +
        "This key is required for server-side authentication operations. " +
        "Please ensure it is set in your environment configuration.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Create an admin client with service role key (bypasses RLS)
 *
 * Uses the new SUPABASE_SECRET_KEY when available. Falls back to
 * SUPABASE_SERVICE_ROLE_KEY for legacy compatibility (should be phased out).
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Prefer the new admin secret; fallback to service_role only if secret missing
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable",
    );
  }

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY (legacy) environment variable.",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      get() {
        return undefined;
      },
      set() {
        // No-op for admin client
      },
      remove() {
        // No-op for admin client
      },
    },
  });
}
