# Row-Level Security (RLS) Setup Guide

## Overview

This guide explains how to set up and use Row-Level Security (RLS) policies for the Project 2052 application in Supabase.

## What is Row-Level Security?

Row-Level Security (RLS) is a PostgreSQL feature that restricts which rows users can access in database tables based on security policies. In Project 2052, we use RLS to implement role-based access control (RBAC) at the database level.

## Role-Based Access Control

Project 2052 uses three user roles:

### ADMIN
- **Full access** to all tables and operations
- Can create, read, update, and delete all data
- Can manage users, system configuration, and all proposals
- Can delete any user's proposals and scenarios

### PLANNER
- **Create and manage** proposals, scenarios, and sensitivity analyses
- Can create proposals and related data
- Can update/delete their own proposals, scenarios, and analyses
- **Read-only access** to system configuration and other users' data
- Cannot manage users or delete others' proposals

### VIEWER
- **Read-only access** to all proposals and related data
- Cannot create, update, or delete any data
- Cannot access user management features
- Can view dashboards, proposals, scenarios, and analyses

## Setup Instructions

### 1. Prerequisites

Before applying RLS policies, ensure:
- Your Prisma migrations have been applied to Supabase
- You have access to the Supabase SQL Editor
- You have SUPERUSER or equivalent permissions in your Supabase project

### 2. Apply RLS Policies

1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Create a new query
4. Copy the entire contents of `/docs/supabase-rls-policies.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the script

The script will:
- Create helper functions for role checking
- Enable RLS on all tables
- Create comprehensive policies for each table
- Grant necessary permissions
- Display a success message

### 3. Verify Installation

After running the script, verify the policies are working:

1. **Check enabled RLS:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

2. **List all policies:**
```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

3. **Test role functions:**
```sql
-- These queries should work for authenticated users
SELECT auth.get_user_role();
SELECT auth.get_user_id();
SELECT auth.is_admin();
SELECT auth.is_admin_or_planner();
```

## How RLS Works in Project 2052

### Authentication Flow

1. User authenticates with Supabase Auth
2. JWT token contains user's email
3. Helper functions query the `User` table to get role and ID
4. Policies use these functions to determine access

### Policy Patterns

#### Read Access
- **User table:** Users see their own data; ADMIN sees all
- **All other tables:** All authenticated users have read access

#### Write Access (Create/Update)
- **User table:** Only ADMIN
- **System tables** (Config, Historical): ADMIN and PLANNER
- **Proposal tables:** ADMIN and PLANNER can create; owners can modify their own

#### Delete Access
- **User table:** Only ADMIN
- **System tables:** Only ADMIN
- **Proposal tables:** Owners can delete their own; ADMIN can delete any

## Testing RLS Policies

### Create Test Users

Create test users with different roles:

```sql
-- Create an ADMIN user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'admin@example.com', 'Admin User', 'ADMIN');

-- Create a PLANNER user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'planner@example.com', 'Planner User', 'PLANNER');

-- Create a VIEWER user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'viewer@example.com', 'Viewer User', 'VIEWER');
```

### Test Scenarios

1. **VIEWER trying to create a proposal** (should fail):
   - Login as VIEWER
   - Attempt to INSERT into LeaseProposal
   - Should receive permission denied error

2. **PLANNER creating and modifying own proposal** (should succeed):
   - Login as PLANNER
   - Create a proposal
   - Update the same proposal
   - Should succeed for both operations

3. **PLANNER trying to modify another's proposal** (should fail):
   - Login as PLANNER
   - Attempt to UPDATE another user's proposal
   - Should receive no rows affected or permission denied

4. **ADMIN managing any data** (should succeed):
   - Login as ADMIN
   - Create, update, delete any records
   - All operations should succeed

## Security Considerations

### 1. JWT Token Security
- RLS policies rely on Supabase Auth JWT tokens
- Ensure proper JWT validation is enabled
- Use HTTPS for all connections

### 2. Helper Functions
- Functions are marked `SECURITY DEFINER`
- They run with elevated privileges to query the User table
- Keep these functions simple and audited

### 3. Policy Bypass
- Database SUPERUSER and service role can bypass RLS
- Use service role only in trusted server-side code
- Never expose service role key to client

### 4. Performance Impact
- RLS adds overhead to queries
- Use indexes on frequently filtered columns (createdBy, email)
- Monitor query performance in production

## Common Issues and Solutions

### Issue: Policies not applying
**Solution:** Verify RLS is enabled on the table:
```sql
ALTER TABLE "TableName" ENABLE ROW LEVEL SECURITY;
```

### Issue: Users can't see any data
**Solution:** Check if user exists in User table and JWT is valid:
```sql
SELECT * FROM "User" WHERE email = auth.jwt() ->> 'email';
```

### Issue: ADMIN can't access data
**Solution:** Verify ADMIN policies exist and helper functions work:
```sql
SELECT auth.get_user_role(); -- Should return 'ADMIN'
SELECT auth.is_admin();      -- Should return true
```

### Issue: Performance degradation
**Solution:** Add indexes on filtered columns:
```sql
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_proposal_created_by ON "LeaseProposal"("createdBy");
```

## Maintenance

### Updating Policies

To update a policy:
1. Drop the existing policy
2. Create the new policy

```sql
DROP POLICY IF EXISTS "policy_name" ON "TableName";
CREATE POLICY "policy_name" ON "TableName"
  FOR SELECT
  USING (your_condition);
```

The provided script uses `DROP POLICY IF EXISTS` for idempotency, so you can re-run it safely.

### Adding New Tables

When adding new tables to the schema:
1. Enable RLS: `ALTER TABLE "NewTable" ENABLE ROW LEVEL SECURITY;`
2. Create appropriate policies following existing patterns
3. Test with all three roles

### Monitoring

Monitor RLS performance:
```sql
-- Check slow queries involving RLS policies
SELECT * FROM pg_stat_statements
WHERE query LIKE '%LeaseProposal%'
ORDER BY total_exec_time DESC;
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma Schema Reference](/prisma/schema.prisma)
- [RLS Policies Script](/docs/supabase-rls-policies.sql)

## Support

For issues or questions:
1. Check this guide first
2. Review the RLS policies script comments
3. Test with verification queries
4. Check Supabase logs for detailed error messages

---

**Last Updated:** November 25, 2024
**Version:** 1.0
**Compatible with:** Project 2052 Schema v2.1
