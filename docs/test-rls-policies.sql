-- =====================================================
-- RLS Policy Testing Script
-- =====================================================
-- This script helps verify that RLS policies are working correctly
-- Run this after applying supabase-rls-policies.sql
-- =====================================================

-- =====================================================
-- PART 1: Verification - Check RLS is Enabled
-- =====================================================

SELECT '=== PART 1: Verify RLS is Enabled ===' as test_section;

SELECT
  tablename,
  CASE
    WHEN rowsecurity = true THEN '✓ ENABLED'
    ELSE '✗ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'User',
    'LeaseProposal',
    'Scenario',
    'SensitivityAnalysis',
    'SystemConfig',
    'HistoricalData',
    'CapExAsset',
    'CapExConfig',
    'TransitionConfig',
    'WorkingCapitalRatios'
  )
ORDER BY tablename;


-- =====================================================
-- PART 2: Verification - Check Helper Functions Exist
-- =====================================================

SELECT '=== PART 2: Verify Helper Functions ===' as test_section;

SELECT
  routine_name,
  routine_type,
  '✓ EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'auth'
  AND routine_name IN (
    'get_user_role',
    'get_user_id',
    'is_admin',
    'is_admin_or_planner'
  )
ORDER BY routine_name;


-- =====================================================
-- PART 3: Verification - List All Policies
-- =====================================================

SELECT '=== PART 3: List All Policies by Table ===' as test_section;

SELECT
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(DISTINCT cmd::text, ', ' ORDER BY cmd::text) as operations
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;


-- =====================================================
-- PART 4: Detailed Policy Listing
-- =====================================================

SELECT '=== PART 4: Detailed Policies ===' as test_section;

SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN permissive = 'PERMISSIVE' THEN '✓'
    ELSE 'RESTRICTIVE'
  END as type
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;


-- =====================================================
-- PART 5: Test Current User Context
-- =====================================================

SELECT '=== PART 5: Current User Context ===' as test_section;

-- Note: These will only work if you're authenticated
SELECT
  auth.jwt() ->> 'email' as authenticated_email,
  auth.get_user_id() as user_id,
  auth.get_user_role() as user_role,
  auth.is_admin() as is_admin,
  auth.is_admin_or_planner() as can_create_proposals;


-- =====================================================
-- PART 6: Create Test Users (Run as ADMIN)
-- =====================================================

SELECT '=== PART 6: Create Test Users ===' as test_section;

-- Note: Only run this section if test users don't exist
-- Uncomment to execute

/*
-- Create test ADMIN user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'admin@test.project2052.com', 'Test Admin', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Create test PLANNER user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'planner@test.project2052.com', 'Test Planner', 'PLANNER')
ON CONFLICT (email) DO NOTHING;

-- Create test VIEWER user
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'viewer@test.project2052.com', 'Test Viewer', 'VIEWER')
ON CONFLICT (email) DO NOTHING;

SELECT 'Test users created successfully' as result;
*/


-- =====================================================
-- PART 7: Verify Test Users
-- =====================================================

SELECT '=== PART 7: Verify Test Users ===' as test_section;

SELECT
  email,
  name,
  role,
  created_at
FROM "User"
WHERE email LIKE '%@test.project2052.com'
ORDER BY role;


-- =====================================================
-- PART 8: Test Access Patterns (Run as different users)
-- =====================================================

SELECT '=== PART 8: Test Access Patterns ===' as test_section;

-- Test 1: Can I see users?
SELECT
  'User Table Access' as test_name,
  COUNT(*) as visible_users,
  CASE
    WHEN auth.is_admin() THEN 'Should see all users'
    ELSE 'Should see only self'
  END as expected_result
FROM "User";

-- Test 2: Can I see proposals?
SELECT
  'LeaseProposal Access' as test_name,
  COUNT(*) as visible_proposals,
  'All authenticated users should see all proposals' as expected_result
FROM "LeaseProposal";

-- Test 3: Can I see system config?
SELECT
  'SystemConfig Access' as test_name,
  COUNT(*) as visible_configs,
  'All authenticated users should see config' as expected_result
FROM "SystemConfig";


-- =====================================================
-- PART 9: Test Write Permissions
-- =====================================================

SELECT '=== PART 9: Write Permission Tests ===' as test_section;

-- Note: These tests should be run manually as different users
-- They will succeed or fail based on the user's role

/*
-- Test 1: Try to create a user (Should only work for ADMIN)
INSERT INTO "User" (id, email, name, role)
VALUES (gen_random_uuid(), 'test-write@example.com', 'Write Test', 'VIEWER');
-- Expected: SUCCESS for ADMIN, PERMISSION DENIED for others
-- Clean up:
-- DELETE FROM "User" WHERE email = 'test-write@example.com';

-- Test 2: Try to create a proposal (Should work for ADMIN and PLANNER)
INSERT INTO "LeaseProposal" (
  id, name, "rentModel", "createdBy",
  transition, enrollment, curriculum, staff,
  "rentParams", "otherOpex"
)
VALUES (
  gen_random_uuid(),
  'Test Proposal',
  'Fixed Rent',
  auth.get_user_id(),
  '{}'::json,
  '{}'::json,
  '{}'::json,
  '{}'::json,
  '{}'::json,
  0
);
-- Expected: SUCCESS for ADMIN and PLANNER, PERMISSION DENIED for VIEWER
-- Clean up:
-- DELETE FROM "LeaseProposal" WHERE name = 'Test Proposal';

-- Test 3: Try to update system config (Should only work for ADMIN)
UPDATE "SystemConfig"
SET "zakatRate" = 0.025
WHERE id IN (SELECT id FROM "SystemConfig" LIMIT 1);
-- Expected: SUCCESS for ADMIN, PERMISSION DENIED for others
*/


-- =====================================================
-- PART 10: Policy Coverage Analysis
-- =====================================================

SELECT '=== PART 10: Policy Coverage Analysis ===' as test_section;

-- Check that all CRUD operations have policies for key tables
WITH expected_policies AS (
  SELECT unnest(ARRAY[
    'User', 'LeaseProposal', 'Scenario', 'SensitivityAnalysis',
    'SystemConfig', 'HistoricalData', 'CapExAsset', 'TransitionConfig'
  ]) as tablename,
  unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) as operation
),
actual_policies AS (
  SELECT DISTINCT tablename, cmd::text as operation
  FROM pg_policies
  WHERE schemaname = 'public'
)
SELECT
  e.tablename,
  e.operation,
  CASE
    WHEN a.operation IS NOT NULL THEN '✓ HAS POLICY'
    ELSE '✗ MISSING POLICY'
  END as policy_status
FROM expected_policies e
LEFT JOIN actual_policies a
  ON e.tablename = a.tablename
  AND e.operation = a.operation
ORDER BY e.tablename, e.operation;


-- =====================================================
-- PART 11: Security Audit
-- =====================================================

SELECT '=== PART 11: Security Audit ===' as test_section;

-- Check for tables without RLS enabled
SELECT
  tablename,
  '✗ RLS NOT ENABLED - SECURITY RISK!' as warning
FROM pg_tables
WHERE schemaname = 'public'
  AND tableowner != 'postgres'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
  AND tablename NOT LIKE '_prisma%'
  AND rowsecurity = false;

-- Check for policies without restrictive conditions
SELECT
  tablename,
  policyname,
  cmd,
  '⚠ Review policy - may be too permissive' as warning
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual IS NULL
    OR qual = 'true'
  )
  AND cmd != 'SELECT';


-- =====================================================
-- PART 12: Performance Check
-- =====================================================

SELECT '=== PART 12: Performance Indexes ===' as test_section;

-- Check for indexes on RLS-filtered columns
SELECT
  t.tablename,
  i.indexname,
  '✓ INDEX EXISTS' as status
FROM pg_indexes i
JOIN pg_tables t ON i.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND (
    i.indexname LIKE '%email%'
    OR i.indexname LIKE '%created_by%'
    OR i.indexname LIKE '%createdBy%'
  )
ORDER BY t.tablename, i.indexname;


-- =====================================================
-- PART 13: Summary Report
-- =====================================================

SELECT '=== FINAL SUMMARY REPORT ===' as test_section;

WITH stats AS (
  SELECT
    COUNT(DISTINCT tablename) FILTER (WHERE rowsecurity = true) as tables_with_rls,
    COUNT(DISTINCT tablename) FILTER (WHERE rowsecurity = false) as tables_without_rls
  FROM pg_tables
  WHERE schemaname = 'public' AND tableowner != 'postgres'
),
policy_stats AS (
  SELECT COUNT(*) as total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
),
function_stats AS (
  SELECT COUNT(*) as helper_functions
  FROM information_schema.routines
  WHERE routine_schema = 'auth'
    AND routine_name IN ('get_user_role', 'get_user_id', 'is_admin', 'is_admin_or_planner')
)
SELECT
  s.tables_with_rls as "Tables with RLS",
  s.tables_without_rls as "Tables without RLS",
  p.total_policies as "Total Policies",
  f.helper_functions as "Helper Functions",
  CASE
    WHEN s.tables_with_rls >= 10
      AND p.total_policies >= 30
      AND f.helper_functions = 4
    THEN '✓ RLS FULLY CONFIGURED'
    ELSE '⚠ INCOMPLETE SETUP'
  END as "Status"
FROM stats s
CROSS JOIN policy_stats p
CROSS JOIN function_stats f;


-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'RLS Policy Testing Complete!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Review the results above to verify:';
  RAISE NOTICE '  1. RLS is enabled on all tables';
  RAISE NOTICE '  2. All helper functions exist';
  RAISE NOTICE '  3. Policies cover all CRUD operations';
  RAISE NOTICE '  4. No security risks identified';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Create test users (Part 6)';
  RAISE NOTICE '  2. Test write permissions as each role (Part 9)';
  RAISE NOTICE '  3. Verify access patterns match requirements';
  RAISE NOTICE '';
  RAISE NOTICE 'For detailed testing instructions, see:';
  RAISE NOTICE '  /docs/RLS_SETUP_GUIDE.md';
  RAISE NOTICE '=====================================================';
END $$;
