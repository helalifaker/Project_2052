# RLS Deployment Checklist

Use this checklist to ensure Row-Level Security is properly deployed to your Supabase project.

## Pre-Deployment

- [ ] **Review Prisma Schema**
  - Verify all tables match the schema in `/prisma/schema.prisma`
  - Confirm Role enum includes: ADMIN, PLANNER, VIEWER
  - Check that User table has required fields (id, email, role)

- [ ] **Backup Database**
  - Create a backup of your Supabase database
  - Document current table counts for verification
  - Save current policy configurations (if any exist)

- [ ] **Prepare Test Environment**
  - Create test users with each role (ADMIN, PLANNER, VIEWER)
  - Prepare sample data for testing
  - Document expected access patterns

## Deployment Steps

### Step 1: Apply Prisma Migrations
- [ ] Ensure all Prisma migrations are applied
- [ ] Verify tables exist in Supabase
- [ ] Check table structure matches schema

```bash
npx prisma migrate deploy
npx prisma db push  # if needed
```

### Step 2: Apply RLS Policies
- [ ] Open Supabase SQL Editor
- [ ] Copy contents of `/docs/supabase-rls-policies.sql`
- [ ] Execute the entire script
- [ ] Verify success message appears
- [ ] Check for any error messages

### Step 3: Verify Installation
- [ ] Run verification queries from the SQL script (Part 14)
- [ ] Confirm RLS is enabled on all 10 tables
- [ ] Verify 4 helper functions exist
- [ ] Check that policies were created (should see 30+ policies)

```sql
-- Quick verification
SELECT COUNT(DISTINCT tablename) as tables_with_rls
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
-- Expected: 10

SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';
-- Expected: 30+
```

## Testing

### Step 4: Run Automated Tests
- [ ] Execute `/docs/test-rls-policies.sql` in Supabase SQL Editor
- [ ] Review all test sections (Parts 1-13)
- [ ] Verify no security warnings in Part 11
- [ ] Check summary report in Part 13 shows "RLS FULLY CONFIGURED"

### Step 5: Create Test Users
- [ ] Create test ADMIN user
- [ ] Create test PLANNER user
- [ ] Create test VIEWER user
- [ ] Verify each user can authenticate

```sql
-- Run Part 6 from test-rls-policies.sql
INSERT INTO "User" (id, email, name, role)
VALUES
  (gen_random_uuid(), 'admin@test.project2052.com', 'Test Admin', 'ADMIN'),
  (gen_random_uuid(), 'planner@test.project2052.com', 'Test Planner', 'PLANNER'),
  (gen_random_uuid(), 'viewer@test.project2052.com', 'Test Viewer', 'VIEWER')
ON CONFLICT (email) DO NOTHING;
```

### Step 6: Test Read Access
Authenticate as each user and verify:

**As ADMIN:**
- [ ] Can read all users
- [ ] Can read all proposals
- [ ] Can read all system config
- [ ] Can read all scenarios

**As PLANNER:**
- [ ] Can read own user record only
- [ ] Can read all proposals
- [ ] Can read all system config (but not modify)
- [ ] Can read all scenarios

**As VIEWER:**
- [ ] Can read own user record only
- [ ] Can read all proposals
- [ ] Can read all system config
- [ ] Can read all scenarios
- [ ] Cannot read other users

### Step 7: Test Write Access

**As ADMIN:**
- [ ] Can create users
- [ ] Can create proposals
- [ ] Can update any proposal
- [ ] Can delete any proposal
- [ ] Can update system config
- [ ] Can delete any data

**As PLANNER:**
- [ ] Cannot create users
- [ ] Can create proposals
- [ ] Can update own proposals only
- [ ] Can delete own proposals only
- [ ] Cannot update system config
- [ ] Cannot delete others' proposals

**As VIEWER:**
- [ ] Cannot create users
- [ ] Cannot create proposals
- [ ] Cannot update proposals
- [ ] Cannot delete proposals
- [ ] Cannot update system config
- [ ] Cannot delete any data

### Step 8: Test Edge Cases
- [ ] PLANNER cannot update another PLANNER's proposal
- [ ] PLANNER cannot delete another PLANNER's proposal
- [ ] VIEWER attempting to create proposal gets permission denied
- [ ] Unauthenticated users cannot access any data
- [ ] User with invalid JWT cannot access data

## Performance Verification

### Step 9: Check Indexes
- [ ] Verify index on `User.email` exists
- [ ] Verify index on `LeaseProposal.createdBy` exists
- [ ] Verify index on `Scenario.createdBy` exists
- [ ] Verify index on `SensitivityAnalysis.createdBy` exists

```sql
-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND (indexname LIKE '%email%' OR indexname LIKE '%created%')
ORDER BY tablename;
```

### Step 10: Performance Testing
- [ ] Run sample queries with RLS enabled
- [ ] Compare query performance before/after RLS
- [ ] Verify no significant performance degradation
- [ ] Monitor slow query log for RLS-related issues

```sql
-- Sample performance test
EXPLAIN ANALYZE
SELECT * FROM "LeaseProposal"
WHERE "createdBy" = auth.get_user_id();
```

## Security Audit

### Step 11: Security Verification
- [ ] No tables without RLS enabled (except _prisma_migrations)
- [ ] No policies with unrestricted access
- [ ] Service role key is secure and not exposed
- [ ] JWT validation is enabled in Supabase
- [ ] Helper functions are SECURITY DEFINER
- [ ] No SUPERUSER usage in application code

```sql
-- Run security audit from test-rls-policies.sql Part 11
-- Verify no warnings or risks
```

### Step 12: Code Review
- [ ] Application uses `anon` or `authenticated` role only
- [ ] Service role is only used in trusted backend
- [ ] No RLS bypass attempts in code
- [ ] Proper error handling for permission denied
- [ ] JWT tokens are validated and refreshed

## Documentation

### Step 13: Update Documentation
- [ ] Document deployment date
- [ ] Record any issues encountered
- [ ] Update team documentation with RLS info
- [ ] Create runbook for RLS maintenance
- [ ] Document test user credentials securely

### Step 14: Team Training
- [ ] Brief team on RLS implementation
- [ ] Share RLS_QUICK_REFERENCE.md with developers
- [ ] Explain role-based access control
- [ ] Demonstrate how to test with different roles
- [ ] Provide examples of common queries

## Post-Deployment

### Step 15: Monitoring
- [ ] Set up monitoring for permission denied errors
- [ ] Monitor query performance
- [ ] Track RLS policy hits in logs
- [ ] Set alerts for unusual access patterns
- [ ] Review security logs weekly

### Step 16: Cleanup
- [ ] Remove test data if needed
- [ ] Archive test users or mark them clearly
- [ ] Document any policy customizations
- [ ] Update issue tracker

## Rollback Plan

In case of critical issues:

### Rollback Step 1: Disable RLS (Emergency Only)
```sql
-- WARNING: This removes all security
-- Only use in emergency, restore from backup instead

ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaseProposal" DISABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

### Rollback Step 2: Restore from Backup
- [ ] Stop application
- [ ] Restore database from pre-deployment backup
- [ ] Verify data integrity
- [ ] Restart application
- [ ] Document issue for review

### Rollback Step 3: Review and Fix
- [ ] Identify root cause of failure
- [ ] Fix issues in RLS policies
- [ ] Test in staging environment
- [ ] Re-attempt deployment

## Sign-off

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

### Deployment Results

- [ ] All pre-deployment checks passed
- [ ] RLS policies deployed successfully
- [ ] All tests passed
- [ ] Performance is acceptable
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team notified

**Notes:**
```
[Add any deployment notes, issues, or observations here]
```

---

**Checklist Version:** 1.0
**Last Updated:** November 25, 2024
**Compatible with:** Project 2052 RLS Policies v1.0
