// This file configures the initialization of Sentry for edge features (middleware, edge routes, etc.)
// The config you add here will be used whenever pages/api routes are going to be processed by the Edge Runtime.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN - Data Source Name
  // Get this from your Sentry project settings
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment:
    process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",

  // Adjust this value in production, or use tracesSampler for greater control
  // Percentage of transactions to capture (0.0 to 1.0)
  // Production: 10% to reduce noise and costs
  // Staging/Dev: 100% for comprehensive debugging
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  // Disabled in development to reduce console noise
  debug: false,

  // Filter sensitive data
  beforeSend(event, _hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-api-key"];
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Next.js specific errors that aren't actionable
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],
});
