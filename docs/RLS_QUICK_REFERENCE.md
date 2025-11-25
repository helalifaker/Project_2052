# RLS Quick Reference Card

## Role Permissions Matrix

| Resource | ADMIN | PLANNER | VIEWER |
|----------|-------|---------|--------|
| **Users** | CRUD | Read (self) | Read (self) |
| **LeaseProposal** | CRUD (all) | CRUD (own) + Read (all) | Read (all) |
| **Scenario** | CRUD (all) | CRUD (own) + Read (all) | Read (all) |
| **SensitivityAnalysis** | CRUD (all) | CRUD (own) + Read (all) | Read (all) |
| **SystemConfig** | CRUD | Read | Read |
| **HistoricalData** | CRUD | Create + Update + Read | Read |
| **CapExAsset** | CRUD | Create + Update + Read | Read |
| **CapExConfig** | CRUD | Create + Update + Read | Read |
| **TransitionConfig** | CRUD | Create + Update + Read | Read |
| **WorkingCapitalRatios** | CRUD | Create + Update + Read | Read |

**Legend:** CRUD = Create, Read, Update, Delete | (own) = only items created by user | (all) = all items

## Helper Functions

```sql
-- Get current user's role (returns 'ADMIN', 'PLANNER', or 'VIEWER')
SELECT auth.get_user_role();

-- Get current user's ID
SELECT auth.get_user_id();

-- Check if current user is ADMIN (returns boolean)
SELECT auth.is_admin();

-- Check if current user is ADMIN or PLANNER (returns boolean)
SELECT auth.is_admin_or_planner();
```

## Common Queries

### Check if RLS is enabled on a table
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'LeaseProposal';
```

### List all policies for a table
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'LeaseProposal';
```

### View all enabled RLS tables
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;
```

### Test user authentication
```sql
-- Check current user's email from JWT
SELECT auth.jwt() ->> 'email' as current_user_email;

-- Check if user exists in database
SELECT id, email, name, role
FROM "User"
WHERE email = auth.jwt() ->> 'email';
```

## Policy Patterns

### Read Policy (all authenticated)
```sql
CREATE POLICY "policy_name"
  ON "TableName"
  FOR SELECT
  USING (auth.jwt() IS NOT NULL);
```

### Create Policy (ADMIN and PLANNER)
```sql
CREATE POLICY "policy_name"
  ON "TableName"
  FOR INSERT
  WITH CHECK (auth.is_admin_or_planner());
```

### Update Policy (own items)
```sql
CREATE POLICY "policy_name"
  ON "TableName"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner() AND
    "createdBy" = auth.get_user_id()
  )
  WITH CHECK (
    auth.is_admin_or_planner() AND
    "createdBy" = auth.get_user_id()
  );
```

### Delete Policy (ADMIN only)
```sql
CREATE POLICY "policy_name"
  ON "TableName"
  FOR DELETE
  USING (auth.is_admin());
```

## Troubleshooting Commands

### User can't see any data
```sql
-- 1. Check if user is authenticated
SELECT auth.jwt() IS NOT NULL as is_authenticated;

-- 2. Check user's role
SELECT auth.get_user_role() as role;

-- 3. Verify user exists
SELECT * FROM "User" WHERE email = auth.jwt() ->> 'email';
```

### Permission denied errors
```sql
-- 1. Check which policies apply
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'YourTable';

-- 2. Test policy conditions manually
SELECT
  auth.is_admin() as is_admin,
  auth.is_admin_or_planner() as can_create,
  auth.get_user_id() as user_id;
```

### Disable RLS temporarily (testing only!)
```sql
-- WARNING: This removes all security. Use only for debugging.
ALTER TABLE "TableName" DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE "TableName" ENABLE ROW LEVEL SECURITY;
```

## Setup Commands

### Enable RLS on new table
```sql
ALTER TABLE "NewTable" ENABLE ROW LEVEL SECURITY;
```

### Apply all policies from script
```bash
# In Supabase SQL Editor, run:
# /docs/supabase-rls-policies.sql
```

### Create test users
```sql
-- ADMIN test user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'admin@test.com', 'Test Admin', 'ADMIN');

-- PLANNER test user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'planner@test.com', 'Test Planner', 'PLANNER');

-- VIEWER test user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'viewer@test.com', 'Test Viewer', 'VIEWER');
```

## Performance Tips

### Add indexes for RLS columns
```sql
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_proposal_created_by ON "LeaseProposal"("createdBy");
CREATE INDEX idx_scenario_created_by ON "Scenario"("createdBy");
CREATE INDEX idx_sensitivity_created_by ON "SensitivityAnalysis"("createdBy");
```

### Monitor query performance
```sql
-- Enable pg_stat_statements extension first
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%LeaseProposal%'
ORDER BY total_exec_time DESC
LIMIT 10;
```

## Security Best Practices

1. **Never bypass RLS in client code**
   - Always use the `anon` or `authenticated` role
   - Reserve `service_role` for trusted backend only

2. **Validate JWT tokens**
   - Ensure Supabase Auth is properly configured
   - Use short-lived tokens with refresh

3. **Audit policy changes**
   - Log all policy modifications
   - Review policies during security audits

4. **Test with all roles**
   - Create test users for each role
   - Verify access patterns match requirements

5. **Monitor for bypasses**
   - Check for SUPERUSER usage in logs
   - Alert on service_role usage from unexpected sources

## Quick Links

- [Full Setup Guide](./RLS_SETUP_GUIDE.md)
- [SQL Policies Script](./supabase-rls-policies.sql)
- [Prisma Schema](../prisma/schema.prisma)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** November 25, 2024
