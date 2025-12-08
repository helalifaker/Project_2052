import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Increase workers in CI from 1 to 4 for faster parallel execution
  workers: process.env.CI ? 4 : undefined,
  reporter: "html",

  // Global test timeout - prevents tests from hanging indefinitely
  timeout: 30000, // 30 seconds per test

  // Global setup for authentication
  globalSetup: require.resolve("./tests/fixtures/global-setup"),

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Add timeouts to prevent tests from hanging
    actionTimeout: 10000, // 10s for actions (clicks, fills, etc.)
    navigationTimeout: 30000, // 30s for page navigation
  },

  projects: [
    // Chromium - runs in both CI and local
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Firefox and WebKit - only run locally, not in CI (saves time)
    ...(process.env.CI
      ? []
      : [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]),
    // RBAC-specific test project
    {
      name: "rbac",
      testDir: "./tests/security",
      testMatch: /rbac\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
