import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

// PERFORMANCE OPTIMIZATION: Bundle analyzer
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Disabled temporarily due to context issues with next-themes/sonner

  // PERFORMANCE OPTIMIZATION: Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    compiler: {
      // Remove console.log in production
      removeConsole: {
        exclude: ["error", "warn"],
      },
    },
  }),

  // PERFORMANCE OPTIMIZATION: Optimize package imports
  experimental: {
    optimizePackageImports: [
      "recharts",
      "@tanstack/react-table",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },

  // Next.js 16 Turbopack config (required to silence webpack/turbopack warning)
  turbopack: {},
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Organization and project from Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress all logs
  silent: process.env.NODE_ENV === "development",

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Automatically annotate Next.js data fetching methods for performance monitoring
  widenClientFileUpload: true,

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Transpile SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,
};

// Only wrap config with Sentry if DSN is provided
const configWithSentry = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;

// Wrap with bundle analyzer
export default withBundleAnalyzer(configWithSentry);
