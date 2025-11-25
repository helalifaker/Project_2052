// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
  debug: process.env.NODE_ENV === "development",

  // Enable profiling
  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profiling is in beta, we recommend trying it only on staging and production.
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Server-specific integrations
  integrations: [
    // Prisma integration for database query tracking
    Sentry.prismaIntegration(),
  ],

  // Filter sensitive data
  beforeSend(event, _hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-api-key"];
    }

    // Remove sensitive query parameters
    if (event.request?.query_string) {
      const queryString = event.request.query_string;
      const sensitiveParams = ["token", "api_key", "password", "secret"];

      if (typeof queryString === "string") {
        sensitiveParams.forEach((param) => {
          if (queryString.includes(param)) {
            event.request!.query_string = queryString.replace(
              new RegExp(`${param}=[^&]*`, "gi"),
              `${param}=[REDACTED]`,
            );
          }
        });
      }
    }

    return event;
  },

  // Breadcrumb filtering
  beforeBreadcrumb(breadcrumb) {
    // Filter out console.log breadcrumbs in production
    if (
      breadcrumb.category === "console" &&
      process.env.NODE_ENV === "production"
    ) {
      return null;
    }

    // Sanitize URLs in breadcrumbs
    if (breadcrumb.data?.url) {
      try {
        const url = new URL(breadcrumb.data.url);
        // Remove query parameters that might contain sensitive data
        url.search = "";
        breadcrumb.data.url = url.toString();
      } catch {
        // Invalid URL, leave as is
      }
    }

    return breadcrumb;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Prisma connection errors (these are logged separately)
    "P1001", // Can't reach database server
    "P1002", // Database server timeout
    // Next.js specific errors that aren't actionable
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],
});
