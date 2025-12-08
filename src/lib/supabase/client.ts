/**
 * Supabase Client for Browser/Client Components
 *
 * Uses the NEW Supabase API Keys (publishable/secret):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (NEW - preferred)
 *
 * ✅ This code path uses NEW API keys only. Legacy anon keys are not supported.
 *
 * This client is safe to use in client components and browser code.
 */

import { createBrowserClient } from "@supabase/ssr";
import { validateSupabaseConfig } from "./validation";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Validate configuration before creating client (fails fast with clear errors)
  validateSupabaseConfig(url, key, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  // TypeScript now knows url and key are defined (validateSupabaseConfig throws if not)
  return createBrowserClient(url!, key!);
}
