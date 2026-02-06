# Row-Level Security Architecture

## Overview

This document explains the technical architecture of Row-Level Security (RLS) implementation in Project 2052.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│  (Next.js Frontend + API Routes)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Authenticated Request
                        │ (JWT Token in Headers)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Auth                            │
│  - Validates JWT Token                                      │
│  - Extracts User Email                                      │
│  - Sets auth.jwt() context                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ JWT Context Available
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Helper Functions (auth schema)            │ │
│  │                                                        │ │
│  │  get_user_role()          ┌──> Query User table      │ │
│  │  get_user_id()            │    by JWT email          │ │
│  │  is_admin()               │    ┌─────────────┐       │ │
│  │  is_admin_or_planner()    └────│ User Table  │       │ │
│  │                                 │ - id        │       │ │
│  │                                 │ - email     │       │ │
│  │                                 │ - role      │       │ │
│  │                                 └─────────────┘       │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           │ Role Determined                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             RLS Policies (per table)                   │ │
│  │                                                        │ │
│  │  SELECT: Check if user can read row                   │ │
│  │  INSERT: Check if user can create row                 │ │
│  │  UPDATE: Check if user can modify row                 │ │
│  │  DELETE: Check if user can delete row                 │ │
│  │                                                        │ │
│  │  Policies use:                                         │ │
│  │  - auth.get_user_role()                               │ │
│  │  - auth.get_user_id()                                 │ │
│  │  - auth.is_admin()                                    │ │
│  │  - auth.is_admin_or_planner()                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           │ Access Granted/Denied            │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Database Tables (public schema)           │ │
│  │                                                        │ │
│  │  User                    LeaseProposal                 │ │
│  │  Scenario                SensitivityAnalysis           │ │
│  │  SystemConfig            HistoricalData                │ │
│  │  CapExAsset              CapExConfig                   │ │
│  │  TransitionConfig        WorkingCapitalRatios          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
1. User Login
   ├─> User enters credentials in Next.js app
   ├─> Supabase Auth validates credentials
   └─> JWT token issued with user email

2. Authenticated Request
   ├─> Client includes JWT in request headers
   ├─> Supabase validates JWT signature
   ├─> JWT email extracted and available to SQL
   └─> auth.jwt() ->> 'email' returns user email

3. Role Resolution
   ├─> Helper function get_user_role() executes
   ├─> Queries User table: WHERE email = auth.jwt() ->> 'email'
   ├─> Returns role: 'ADMIN', 'PLANNER', or 'VIEWER'
   └─> Role cached for transaction

4. Policy Evaluation
   ├─> User queries LeaseProposal table
   ├─> RLS policies execute automatically
   ├─> Policies call is_admin() or is_admin_or_planner()
   ├─> Access decision made per row
   └─> Only permitted rows returned

5. Response
   ├─> Filtered results returned to application
   └─> User sees only data they're authorized to access
```

## Helper Function Architecture

### Function: `auth.get_user_role()`

```sql
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM "User"
  WHERE email = auth.jwt() ->> 'email';

  RETURN COALESCE(user_role, 'VIEWER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Flow:**
```
JWT Token → Extract Email → Query User Table → Return Role → Cache in Transaction
```

**Performance:** O(1) with email index, called once per transaction

---

### Function: `auth.get_user_id()`

```sql
CREATE OR REPLACE FUNCTION auth.get_user_id()
RETURNS TEXT AS $$
DECLARE
  user_id TEXT;
BEGIN
  SELECT id INTO user_id
  FROM "User"
  WHERE email = auth.jwt() ->> 'email';

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Flow:**
```
JWT Token → Extract Email → Query User Table → Return User ID → Use in Policies
```

**Usage:** Check if user owns a resource (createdBy = auth.get_user_id())

---

### Function: `auth.is_admin()`

```sql
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.get_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Flow:**
```
Call get_user_role() → Compare to 'ADMIN' → Return Boolean
```

---

### Function: `auth.is_admin_or_planner()`

```sql
CREATE OR REPLACE FUNCTION auth.is_admin_or_planner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.get_user_role() IN ('ADMIN', 'PLANNER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Flow:**
```
Call get_user_role() → Check if in ('ADMIN', 'PLANNER') → Return Boolean
```

## Policy Architecture

### Policy Types

#### 1. Read Policies (SELECT)
**Purpose:** Control which rows user can see

**Pattern for public tables:**
```sql
CREATE POLICY "All authenticated can read"
  ON "TableName"
  FOR SELECT
  USING (auth.jwt() IS NOT NULL);
```

**Pattern for restricted tables:**
```sql
CREATE POLICY "Users read own data"
  ON "User"
  FOR SELECT
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "ADMIN reads all"
  ON "User"
  FOR SELECT
  USING (auth.is_admin());
```

---

#### 2. Create Policies (INSERT)
**Purpose:** Control who can create new rows

**Pattern:**
```sql
CREATE POLICY "ADMIN and PLANNER can create"
  ON "TableName"
  FOR INSERT
  WITH CHECK (auth.is_admin_or_planner());
```

---

#### 3. Update Policies (UPDATE)
**Purpose:** Control who can modify existing rows

**Pattern (consolidated):**
```sql
-- Single policy combining admin-override and ownership check.
-- Avoids overlapping permissive policies (Supabase perf warning).
CREATE POLICY "ADMIN can update any, PLANNER own resources"
  ON "LeaseProposal"
  FOR UPDATE
  USING (
    is_admin() OR (is_admin_or_planner() AND "createdBy" = get_user_id())
  )
  WITH CHECK (
    is_admin() OR (is_admin_or_planner() AND "createdBy" = get_user_id())
  );
```

---

#### 4. Delete Policies (DELETE)
**Purpose:** Control who can delete rows

**Pattern (consolidated):**
```sql
-- Single policy combining admin-override and ownership check.
CREATE POLICY "ADMIN can delete any, PLANNER own resources"
  ON "LeaseProposal"
  FOR DELETE
  USING (
    is_admin() OR (is_admin_or_planner() AND "createdBy" = get_user_id())
  );
```

## Policy Evaluation Order

```
User executes: SELECT * FROM "LeaseProposal"
                     │
                     ▼
         ┌───────────────────────┐
         │  RLS Enabled?         │
         └───────────┬───────────┘
                     │
         YES ───────►│
                     ▼
         ┌───────────────────────┐
         │  Find SELECT policies │
         │  for LeaseProposal    │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────────────────┐
         │ Policy 1:                         │
         │ "All authenticated can read"      │
         │ USING (auth.jwt() IS NOT NULL)    │
         └───────────┬───────────────────────┘
                     │
         ┌───────────▼───────────┐
         │ JWT exists?           │
         │ YES → Include all rows│
         │ NO  → Include no rows │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Apply additional      │
         │ WHERE clauses         │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Return filtered rows  │
         └───────────────────────┘
```

### Policy Consolidation (v2.1)

PostgreSQL combines multiple permissive policies for the same operation with OR. While functionally correct, this creates overlapping policy evaluation that the Supabase performance advisor flags. To avoid this, we consolidate the OR logic into a single policy:

```sql
-- BEFORE (two overlapping permissive policies):
-- Policy 1: ADMIN and PLANNER can update their own proposals
-- Policy 2: ADMIN can update any proposal

-- AFTER (single consolidated policy):
CREATE POLICY "ADMIN can update any, PLANNER own proposals"
  ON "LeaseProposal"
  FOR UPDATE
  USING (
    is_admin() OR (is_admin_or_planner() AND "createdBy" = get_user_id())
  )
  WITH CHECK (
    is_admin() OR (is_admin_or_planner() AND "createdBy" = get_user_id())
  );
```

This pattern is applied consistently across LeaseProposal, Negotiation, Scenario, and SensitivityAnalysis tables for UPDATE and DELETE operations, and on the User table for SELECT.

## Table-Specific Architecture

### User Table
```
┌─────────────────────────────────────┐
│            User Table               │
├─────────────────────────────────────┤
│ Policies:                           │
│  SELECT: (consolidated)             │
│   - Own data OR ADMIN reads all     │
│  INSERT/UPDATE/DELETE:              │
│   - ADMIN only                      │
└─────────────────────────────────────┘
```

### LeaseProposal Table
```
┌─────────────────────────────────────┐
│        LeaseProposal Table          │
├─────────────────────────────────────┤
│ Policies:                           │
│  SELECT:                            │
│   - All authenticated               │
│  INSERT:                            │
│   - ADMIN and PLANNER               │
│  UPDATE: (consolidated)             │
│   - ADMIN any, PLANNER own only     │
│  DELETE: (consolidated)             │
│   - ADMIN any, PLANNER own only     │
└─────────────────────────────────────┘
```

### SystemConfig Table
```
┌─────────────────────────────────────┐
│        SystemConfig Table           │
├─────────────────────────────────────┤
│ Policies:                           │
│  SELECT:                            │
│   - All authenticated               │
│  INSERT/UPDATE/DELETE:              │
│   - ADMIN only                      │
└─────────────────────────────────────┘
```

## Performance Architecture

### Query Execution Path

```
1. Application Query
   SELECT * FROM "LeaseProposal"
   WHERE "rentModel" = 'Fixed Rent'

2. RLS Policy Applied (Behind the Scenes)
   SELECT * FROM "LeaseProposal"
   WHERE "rentModel" = 'Fixed Rent'
   AND (auth.jwt() IS NOT NULL)  ← RLS policy added

3. Helper Function Called
   auth.jwt() executed
   ↓
   Returns JWT object with email

4. Index Usage
   - WHERE clause uses idx_rent_model index
   - RLS check is in-memory (JWT already validated)

5. Result Set
   Returns only rows passing both conditions
```

### Performance Optimizations

#### 1. Indexes on RLS Columns
```sql
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_proposal_created_by ON "LeaseProposal"("createdBy");
```

**Impact:** O(n) → O(log n) for user lookup

---

#### 2. Function Caching
Helper functions marked SECURITY DEFINER execute once per transaction:
- First call: Query User table
- Subsequent calls: Use cached result

---

#### 3. JWT Validation
Supabase validates JWT before query execution:
- Invalid JWT → Reject request
- Valid JWT → Set auth context
- No repeated validation per row

---

#### 4. Policy Simplification
Simple policies execute faster:
```sql
-- Fast (simple boolean check)
USING (auth.is_admin())

-- Slower (subquery)
USING (id IN (SELECT id FROM ... WHERE ...))
```

## Security Architecture

### Defense in Depth

```
Layer 1: Network
├─> HTTPS encryption
└─> Firewall rules

Layer 2: Authentication
├─> JWT signature validation
├─> Token expiration checks
└─> Refresh token rotation

Layer 3: Row-Level Security
├─> RLS enabled on all tables
├─> Policies enforce role-based access
└─> Helper functions validate roles

Layer 4: Application
├─> Input validation
├─> Error handling (no data leakage)
└─> Logging and monitoring

Layer 5: Audit
├─> Access logs
├─> Policy change tracking
└─> Regular security reviews
```

### Security Boundaries

```
┌──────────────────────────────────────────┐
│           Untrusted Zone                 │
│  - Client application                    │
│  - User browser                          │
│  - Public internet                       │
└────────────────┬─────────────────────────┘
                 │
                 │ JWT Token
                 │ (Validated by Supabase)
                 ▼
┌──────────────────────────────────────────┐
│           Trusted Zone                   │
│  ┌────────────────────────────────────┐  │
│  │  Supabase Auth                     │  │
│  │  - Validates JWT                   │  │
│  │  - Cannot be bypassed              │  │
│  └────────────────────────────────────┘  │
│                 │                         │
│                 ▼                         │
│  ┌────────────────────────────────────┐  │
│  │  PostgreSQL RLS                    │  │
│  │  - Enforced at database level      │  │
│  │  - Cannot be bypassed from client  │  │
│  └────────────────────────────────────┘  │
│                 │                         │
│                 ▼                         │
│  ┌────────────────────────────────────┐  │
│  │  Data                              │  │
│  │  - Only accessible via RLS         │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Service Role (Backend Only)

```
┌─────────────────────────────────────────┐
│        Backend Service (Trusted)        │
│  - API Routes (server-side)             │
│  - Background jobs                      │
│  - Admin tools                          │
└────────────────┬────────────────────────┘
                 │
                 │ Service Role Key
                 │ (Bypasses RLS)
                 ▼
┌─────────────────────────────────────────┐
│          Direct Database Access         │
│  - No RLS enforcement                   │
│  - Full CRUD permissions                │
│  - Use with extreme caution             │
└─────────────────────────────────────────┘

WARNING: Service role should NEVER be exposed to client
```

## Maintenance Architecture

### Policy Update Workflow

```
1. Schema Change Detected
   ├─> New table added
   ├─> Column added/removed
   └─> Relationship changed

2. Update RLS Policies
   ├─> Edit supabase-rls-policies.sql
   ├─> Add/modify policies
   └─> Update helper functions if needed

3. Test Locally
   ├─> Run test-rls-policies.sql
   ├─> Verify all checks pass
   └─> Test with different roles

4. Deploy to Staging
   ├─> Execute updated SQL script
   ├─> Run integration tests
   └─> Verify no regressions

5. Deploy to Production
   ├─> Follow deployment checklist
   ├─> Execute SQL script
   ├─> Monitor for issues
   └─> Roll back if needed
```

## Monitoring Architecture

### Key Metrics

```
1. Security Metrics
   ├─> Permission denied errors (rate)
   ├─> Failed JWT validations (rate)
   ├─> Unauthorized access attempts (count)
   └─> Policy violations (count)

2. Performance Metrics
   ├─> Query latency with RLS (p50, p95, p99)
   ├─> Helper function execution time (avg)
   ├─> Index usage (hit rate)
   └─> Full table scans (count)

3. Operational Metrics
   ├─> Active policies (count)
   ├─> Tables with RLS enabled (count)
   ├─> Policy updates (frequency)
   └─> RLS-related incidents (count)
```

## Summary

The RLS architecture provides:

1. **Security:** Database-level access control, impossible to bypass from client
2. **Flexibility:** Role-based permissions with granular control
3. **Performance:** Optimized with indexes and caching
4. **Maintainability:** Clear patterns and comprehensive documentation
5. **Auditability:** All access controlled and logged

---

**Last Updated:** February 2026
**Version:** 2.1 (Consolidated overlapping RLS policies, secured _prisma_migrations)
**Related Documentation:**
- [RLS Setup Guide](./rls-setup-guide.md)
- [RLS Quick Reference](./rls-quick-reference.md)
- [Negotiation Workflow](../features/negotiations/README.md)
