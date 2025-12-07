/**
 * Playwright Global Setup
 *
 * Runs before all tests to set up authenticated sessions for each role.
 * Sessions are cached in tests/.auth/ directory for faster test execution.
 */

import { chromium, FullConfig } from "@playwright/test";
import {
  Role,
  hasCredentials,
  hasValidCachedSession,
  authenticateAs,
  getStorageStatePath,
} from "./auth";
import * as fs from "fs";
import * as path from "path";

const ROLES: Role[] = ["admin", "planner", "viewer"];

async function globalSetup(config: FullConfig) {
  // Ensure auth directory exists
  const authDir = path.join(__dirname, "../.auth");
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Check which roles have credentials
  const rolesWithCredentials = ROLES.filter(hasCredentials);

  if (rolesWithCredentials.length === 0) {
    console.warn(
      "\n" +
        "============================================================\n" +
        "  WARNING: No E2E auth credentials provided.\n" +
        "  RBAC tests will be skipped.\n" +
        "\n" +
        "  To enable RBAC testing, set environment variables:\n" +
        "    E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD\n" +
        "    E2E_PLANNER_EMAIL, E2E_PLANNER_PASSWORD\n" +
        "    E2E_VIEWER_EMAIL, E2E_VIEWER_PASSWORD\n" +
        "============================================================\n",
    );
    return;
  }

  console.log("\nSetting up E2E auth sessions...\n");

  // Get base URL from config
  const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:3000";

  const browser = await chromium.launch();

  for (const role of ROLES) {
    if (!hasCredentials(role)) {
      console.log(`  [SKIP] ${role}: No credentials provided`);
      continue;
    }

    if (hasValidCachedSession(role)) {
      console.log(`  [CACHED] ${role}: Using existing session`);
      continue;
    }

    console.log(`  [AUTH] ${role}: Authenticating...`);

    try {
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();

      await authenticateAs(page, role);
      await context.storageState({ path: getStorageStatePath(role) });

      console.log(`  [OK] ${role}: Session cached`);
      await context.close();
    } catch (error) {
      console.error(`  [FAIL] ${role}: ${(error as Error).message}`);
    }
  }

  await browser.close();

  console.log("\nAuth setup complete.\n");
}

export default globalSetup;
