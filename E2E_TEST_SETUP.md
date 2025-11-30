# E2E Test Setup Guide

## Required Environment Variables

E2E tests require test user credentials to be set in environment variables. These should be configured in your `.env.local` file or CI/CD environment.

### Required Variables

```bash
E2E_ADMIN_EMAIL=admin@test.com
E2E_ADMIN_PASSWORD=test-admin-password

E2E_PLANNER_EMAIL=planner@test.com
E2E_PLANNER_PASSWORD=test-planner-password

E2E_VIEWER_EMAIL=viewer@test.com
E2E_VIEWER_PASSWORD=test-viewer-password
```

## Setting Up Test Users

### Option 1: Manual Setup in Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Create test users with the email addresses specified in your environment variables
4. Assign appropriate roles (ADMIN, PLANNER, VIEWER) in your database

### Option 2: Create Test Users Programmatically

You can create test users via the Supabase Auth API or through your application's user management interface.

## Test Behavior

- **When credentials are provided:** Tests will authenticate and run normally
- **When credentials are missing:** Tests will be skipped with a clear message indicating which credentials need to be set

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/e2e/admin-config.spec.ts

# Run in headed mode (see browser)
pnpm test:e2e:headed
```

## Notes

- Test users must exist in Supabase Auth (not just in your database)
- Test users should have the correct roles assigned
- Passwords should match what's set in your environment variables
- For CI/CD, set these as secure environment variables in your pipeline configuration

