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

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable",
    );
  }

  return createBrowserClient(url, key);
}
