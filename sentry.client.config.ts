// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN - Data Source Name
  // Get this from your Sentry project settings
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.NODE_ENV ||
    "development",

  // Adjust this value in production, or use tracesSampler for greater control
  // Percentage of transactions to capture (0.0 to 1.0)
  // Production: 10% to reduce noise and costs
  // Staging/Dev: 100% for comprehensive debugging
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  // Replay configuration for session replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  replaysSessionSampleRate: 0.1, // Capture 10% of normal sessions

  // Add Session Replay integration
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content, images, and media for privacy
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration({
      // Custom routing instrumentation for Next.js App Router
      enableInp: true, // Enable Interaction to Next Paint tracking
    }),
  ],

  // Filter out certain errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Filter out common browser extension errors
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      // Chrome extensions
      if (error.message.includes("chrome-extension://")) {
        return null;
      }
      // Firefox extensions
      if (error.message.includes("moz-extension://")) {
        return null;
      }
      // Safari extensions
      if (error.message.includes("safari-extension://")) {
        return null;
      }
    }

    // Filter out ResizeObserver errors (common and usually harmless)
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      error.message === "ResizeObserver loop limit exceeded"
    ) {
      return null;
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Random plugins/extensions
    "top.GLOBALS",
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "http://tt.epicplay.com",
    "Can't find variable: ZiteReader",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    "http://loading.retry.widdit.com/",
    "atomicFindClose",
    // Facebook borked
    "fb_xd_fragment",
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
    "conduitPage",
    // Generic error code from errors outside the security sandbox
    "Script error.",
    // Avast extension error
    "_avast_submit",
  ],

  // Ignore errors from certain URLs
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Firefox extensions
    /^moz-extension:\/\//i,
    // Safari extensions
    /^safari-extension:\/\//i,
  ],
});
