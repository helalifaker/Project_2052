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
import { validateSupabaseConfig } from "./validation";

export async function createClient() {
  // Use SUPABASE_URL if available, otherwise fall back to NEXT_PUBLIC_SUPABASE_URL
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  // SECURITY: For server-side user operations, prefer the secret key.
  const key = process.env.SUPABASE_SECRET_KEY;

  // Validate configuration before creating client (fails fast with clear errors)
  validateSupabaseConfig(url, key, "SUPABASE_SECRET_KEY");

  const cookieStore = await cookies();

  // TypeScript now knows url and key are defined (validateSupabaseConfig throws if not)
  return createServerClient(url!, key!, {
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

  // Validate configuration before creating client
  validateSupabaseConfig(
    url,
    key,
    "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
  );

  // TypeScript now knows url and key are defined
  return createServerClient(url!, key!, {
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
