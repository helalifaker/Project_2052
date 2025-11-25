/**
 * Instrumentation file for Next.js
 *
 * This file is used to integrate observability tools like Sentry.
 * It runs once when the server starts.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Import Sentry server config
    await import("./sentry.server.config");
  }

  // Only run on edge
  if (process.env.NEXT_RUNTIME === "edge") {
    // Import Sentry edge config
    await import("./sentry.edge.config");
  }
}
