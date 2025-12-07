/**
 * Playwright Auth Fixtures for RBAC Testing
 *
 * Provides authenticated page fixtures for each role (admin, planner, viewer).
 * Auth sessions are cached to speed up test execution.
 */

/* eslint-disable react-hooks/rules-of-hooks -- Playwright's `use` function is not React's use() hook */

import {
  test as base,
  Page,
  BrowserContext,
  expect,
  Browser,
} from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

export type Role = "admin" | "planner" | "viewer";

interface RoleCredentials {
  email?: string;
  password?: string;
}

const roleCredentials: Record<Role, RoleCredentials> = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
  },
  planner: {
    email: process.env.E2E_PLANNER_EMAIL,
    password: process.env.E2E_PLANNER_PASSWORD,
  },
  viewer: {
    email: process.env.E2E_VIEWER_EMAIL,
    password: process.env.E2E_VIEWER_PASSWORD,
  },
};

const STORAGE_STATE_DIR = path.join(__dirname, "../.auth");

// Ensure auth directory exists
if (!fs.existsSync(STORAGE_STATE_DIR)) {
  fs.mkdirSync(STORAGE_STATE_DIR, { recursive: true });
}

/**
 * Get the storage state file path for a role
 */
export function getStorageStatePath(role: Role): string {
  return path.join(STORAGE_STATE_DIR, `${role}.json`);
}

/**
 * Check if credentials are available for a role
 */
export function hasCredentials(role: Role): boolean {
  const creds = roleCredentials[role];
  return Boolean(creds.email && creds.password);
}

/**
 * Check if a cached session exists and is still valid (< 30 min old)
 */
export function hasValidCachedSession(role: Role): boolean {
  const storagePath = getStorageStatePath(role);
  if (!fs.existsSync(storagePath)) {
    return false;
  }

  const stats = fs.statSync(storagePath);
  const ageMs = Date.now() - stats.mtimeMs;
  const maxAgeMs = 30 * 60 * 1000; // 30 minutes

  return ageMs < maxAgeMs;
}

/**
 * Authenticate as a specific role
 */
export async function authenticateAs(page: Page, role: Role): Promise<void> {
  const creds = roleCredentials[role];

  if (!creds.email || !creds.password) {
    throw new Error(
      `Missing credentials for role: ${role}. ` +
        `Set E2E_${role.toUpperCase()}_EMAIL and E2E_${role.toUpperCase()}_PASSWORD environment variables.`,
    );
  }

  // Navigate to login page
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Fill login form
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);

  // Submit and wait for redirect
  await Promise.all([
    page.waitForURL(/\/(dashboard|admin|proposals|$)/, { timeout: 15000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);

  // Verify we're logged in (not on login page)
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * Setup auth state for a role (authenticate and cache session)
 */
export async function setupAuthState(
  browser: Browser,
  role: Role,
): Promise<void> {
  if (!browser) {
    throw new Error("Browser instance required for auth setup");
  }

  if (!hasCredentials(role)) {
    console.log(`Skipping ${role} auth setup (no credentials)`);
    return;
  }

  if (hasValidCachedSession(role)) {
    console.log(`Using cached ${role} session`);
    return;
  }

  console.log(`Setting up ${role} auth session...`);

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await authenticateAs(page, role);
    await context.storageState({ path: getStorageStatePath(role) });
    console.log(`${role} auth session cached`);
  } finally {
    await context.close();
  }
}

/**
 * Create a page with authenticated context for a role
 */
async function createAuthenticatedPage(
  browser: Browser,
  role: Role,
): Promise<{ page: Page; context: BrowserContext }> {
  if (!browser) {
    throw new Error("Browser instance required");
  }

  const storagePath = getStorageStatePath(role);

  // Setup auth if needed
  if (!hasValidCachedSession(role)) {
    if (!hasCredentials(role)) {
      throw new Error(
        `No credentials for role: ${role}. ` +
          `Set E2E_${role.toUpperCase()}_EMAIL and E2E_${role.toUpperCase()}_PASSWORD.`,
      );
    }

    const setupContext = await browser.newContext();
    const setupPage = await setupContext.newPage();
    await authenticateAs(setupPage, role);
    await setupContext.storageState({ path: storagePath });
    await setupContext.close();
  }

  // Create new context with cached auth state
  const context = await browser.newContext({ storageState: storagePath });
  const page = await context.newPage();

  return { page, context };
}

// Extended test fixture interface
interface AuthFixtures {
  adminPage: Page;
  plannerPage: Page;
  viewerPage: Page;
  authenticatedContext: (role: Role) => Promise<BrowserContext>;
}

/**
 * Extended Playwright test with role-specific page fixtures
 */
export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    if (!hasCredentials("admin")) {
      test.skip(true, "Missing admin credentials");
      return;
    }

    const { page, context } = await createAuthenticatedPage(browser, "admin");
    await use(page);
    await context.close();
  },

  plannerPage: async ({ browser }, use) => {
    if (!hasCredentials("planner")) {
      test.skip(true, "Missing planner credentials");
      return;
    }

    const { page, context } = await createAuthenticatedPage(browser, "planner");
    await use(page);
    await context.close();
  },

  viewerPage: async ({ browser }, use) => {
    if (!hasCredentials("viewer")) {
      test.skip(true, "Missing viewer credentials");
      return;
    }

    const { page, context } = await createAuthenticatedPage(browser, "viewer");
    await use(page);
    await context.close();
  },

  authenticatedContext: async ({ browser }, use) => {
    const contexts: BrowserContext[] = [];

    const createContext = async (role: Role): Promise<BrowserContext> => {
      const { context } = await createAuthenticatedPage(browser, role);
      contexts.push(context);
      return context;
    };

    await use(createContext);

    // Cleanup all created contexts
    for (const ctx of contexts) {
      await ctx.close();
    }
  },
});

export { expect };
