-- =====================================================
-- Project 2052: Supabase Row-Level Security (RLS) Policies
-- =====================================================
-- This script configures Row-Level Security for all tables in the Project 2052 application.
-- It implements role-based access control using the Role enum (ADMIN, PLANNER, VIEWER).
--
-- Roles:
-- - ADMIN: Full access to all tables and operations
-- - PLANNER: Can create and manage proposals, scenarios, and related data
-- - VIEWER: Read-only access to proposals and related data
--
-- Execute this script in the Supabase SQL Editor after running Prisma migrations.
-- =====================================================

-- =====================================================
-- STEP 1: Helper Functions
-- =====================================================

-- Function to get the current authenticated user's role
-- This function is used by all RLS policies to determine access rights
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role from the User table based on the authenticated user's email
  -- Supabase auth.jwt() returns the authenticated user's metadata
  SELECT role INTO user_role
  FROM "User"
  WHERE email = auth.jwt() ->> 'email';

  -- Return the role, or 'VIEWER' as default if user not found
  RETURN COALESCE(user_role, 'VIEWER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the current authenticated user's ID
CREATE OR REPLACE FUNCTION auth.get_user_id()
RETURNS TEXT AS $$
DECLARE
  user_id TEXT;
BEGIN
  -- Get the user ID from the User table based on the authenticated user's email
  SELECT id INTO user_id
  FROM "User"
  WHERE email = auth.jwt() ->> 'email';

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is ADMIN
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.get_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is ADMIN or PLANNER
CREATE OR REPLACE FUNCTION auth.is_admin_or_planner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.get_user_role() IN ('ADMIN', 'PLANNER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- STEP 2: Enable Row-Level Security on All Tables
-- =====================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaseProposal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Scenario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SensitivityAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HistoricalData" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CapExAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CapExConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TransitionConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkingCapitalRatios" ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- STEP 3: User Table Policies
-- =====================================================

-- Users can read their own data
DROP POLICY IF EXISTS "Users can read their own data" ON "User";
CREATE POLICY "Users can read their own data"
  ON "User"
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = email
  );

-- ADMIN can read all users
DROP POLICY IF EXISTS "ADMIN can read all users" ON "User";
CREATE POLICY "ADMIN can read all users"
  ON "User"
  FOR SELECT
  USING (
    auth.is_admin()
  );

-- Only ADMIN can create users
DROP POLICY IF EXISTS "Only ADMIN can create users" ON "User";
CREATE POLICY "Only ADMIN can create users"
  ON "User"
  FOR INSERT
  WITH CHECK (
    auth.is_admin()
  );

-- Only ADMIN can update users
DROP POLICY IF EXISTS "Only ADMIN can update users" ON "User";
CREATE POLICY "Only ADMIN can update users"
  ON "User"
  FOR UPDATE
  USING (
    auth.is_admin()
  )
  WITH CHECK (
    auth.is_admin()
  );

-- Only ADMIN can delete users
DROP POLICY IF EXISTS "Only ADMIN can delete users" ON "User";
CREATE POLICY "Only ADMIN can delete users"
  ON "User"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 4: LeaseProposal Table Policies
-- =====================================================

-- All authenticated users can read all proposals
DROP POLICY IF EXISTS "All authenticated users can read proposals" ON "LeaseProposal";
CREATE POLICY "All authenticated users can read proposals"
  ON "LeaseProposal"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- ADMIN and PLANNER can create proposals
DROP POLICY IF EXISTS "ADMIN and PLANNER can create proposals" ON "LeaseProposal";
CREATE POLICY "ADMIN and PLANNER can create proposals"
  ON "LeaseProposal"
  FOR INSERT
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- ADMIN and PLANNER can update their own proposals
DROP POLICY IF EXISTS "ADMIN and PLANNER can update their own proposals" ON "LeaseProposal";
CREATE POLICY "ADMIN and PLANNER can update their own proposals"
  ON "LeaseProposal"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  )
  WITH CHECK (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  );

-- ADMIN can update any proposal
DROP POLICY IF EXISTS "ADMIN can update any proposal" ON "LeaseProposal";
CREATE POLICY "ADMIN can update any proposal"
  ON "LeaseProposal"
  FOR UPDATE
  USING (
    auth.is_admin()
  )
  WITH CHECK (
    auth.is_admin()
  );

-- ADMIN and PLANNER can delete their own proposals
DROP POLICY IF EXISTS "ADMIN and PLANNER can delete their own proposals" ON "LeaseProposal";
CREATE POLICY "ADMIN and PLANNER can delete their own proposals"
  ON "LeaseProposal"
  FOR DELETE
  USING (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  );

-- ADMIN can delete any proposal
DROP POLICY IF EXISTS "ADMIN can delete any proposal" ON "LeaseProposal";
CREATE POLICY "ADMIN can delete any proposal"
  ON "LeaseProposal"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 5: Scenario Table Policies
-- =====================================================

-- All authenticated users can read all scenarios
DROP POLICY IF EXISTS "All authenticated users can read scenarios" ON "Scenario";
CREATE POLICY "All authenticated users can read scenarios"
  ON "Scenario"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- ADMIN and PLANNER can create scenarios
DROP POLICY IF EXISTS "ADMIN and PLANNER can create scenarios" ON "Scenario";
CREATE POLICY "ADMIN and PLANNER can create scenarios"
  ON "Scenario"
  FOR INSERT
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- ADMIN and PLANNER can update their own scenarios
DROP POLICY IF EXISTS "ADMIN and PLANNER can update their own scenarios" ON "Scenario";
CREATE POLICY "ADMIN and PLANNER can update their own scenarios"
  ON "Scenario"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  )
  WITH CHECK (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  );

-- ADMIN can update any scenario
DROP POLICY IF EXISTS "ADMIN can update any scenario" ON "Scenario";
CREATE POLICY "ADMIN can update any scenario"
  ON "Scenario"
  FOR UPDATE
  USING (
    auth.is_admin()
  )
  WITH CHECK (
    auth.is_admin()
  );

-- ADMIN and PLANNER can delete their own scenarios
DROP POLICY IF EXISTS "ADMIN and PLANNER can delete their own scenarios" ON "Scenario";
CREATE POLICY "ADMIN and PLANNER can delete their own scenarios"
  ON "Scenario"
  FOR DELETE
  USING (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  );

-- ADMIN can delete any scenario
DROP POLICY IF EXISTS "ADMIN can delete any scenario" ON "Scenario";
CREATE POLICY "ADMIN can delete any scenario"
  ON "Scenario"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 6: SensitivityAnalysis Table Policies
-- =====================================================

-- All authenticated users can read all sensitivity analyses
DROP POLICY IF EXISTS "All authenticated users can read sensitivity analyses" ON "SensitivityAnalysis";
CREATE POLICY "All authenticated users can read sensitivity analyses"
  ON "SensitivityAnalysis"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- ADMIN and PLANNER can create sensitivity analyses
DROP POLICY IF EXISTS "ADMIN and PLANNER can create sensitivity analyses" ON "SensitivityAnalysis";
CREATE POLICY "ADMIN and PLANNER can create sensitivity analyses"
  ON "SensitivityAnalysis"
  FOR INSERT
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- ADMIN and PLANNER can update their own sensitivity analyses
DROP POLICY IF EXISTS "ADMIN and PLANNER can update their own sensitivity analyses" ON "SensitivityAnalysis";
CREATE POLICY "ADMIN and PLANNER can update their own sensitivity analyses"
  ON "SensitivityAnalysis"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  )
  WITH CHECK (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  );

-- ADMIN can update any sensitivity analysis
DROP POLICY IF EXISTS "ADMIN can update any sensitivity analysis" ON "SensitivityAnalysis";
CREATE POLICY "ADMIN can update any sensitivity analysis"
  ON "SensitivityAnalysis"
  FOR UPDATE
  USING (
    auth.is_admin()
  )
  WITH CHECK (
    auth.is_admin()
  );

-- ADMIN and PLANNER can delete their own sensitivity analyses
DROP POLICY IF EXISTS "ADMIN and PLANNER can delete their own sensitivity analyses" ON "SensitivityAnalysis";
CREATE POLICY "ADMIN and PLANNER can delete their own sensitivity analyses"
  ON "SensitivityAnalysis"
  FOR DELETE
  USING (
    auth.is_admin_or_planner() AND "createdBy" = auth.get_user_id()
  );

-- ADMIN can delete any sensitivity analysis
DROP POLICY IF EXISTS "ADMIN can delete any sensitivity analysis" ON "SensitivityAnalysis";
CREATE POLICY "ADMIN can delete any sensitivity analysis"
  ON "SensitivityAnalysis"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 7: SystemConfig Table Policies
-- =====================================================

-- All authenticated users can read system config
DROP POLICY IF EXISTS "All authenticated users can read system config" ON "SystemConfig";
CREATE POLICY "All authenticated users can read system config"
  ON "SystemConfig"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- Only ADMIN can create system config
DROP POLICY IF EXISTS "Only ADMIN can create system config" ON "SystemConfig";
CREATE POLICY "Only ADMIN can create system config"
  ON "SystemConfig"
  FOR INSERT
  WITH CHECK (
    auth.is_admin()
  );

-- Only ADMIN can update system config
DROP POLICY IF EXISTS "Only ADMIN can update system config" ON "SystemConfig";
CREATE POLICY "Only ADMIN can update system config"
  ON "SystemConfig"
  FOR UPDATE
  USING (
    auth.is_admin()
  )
  WITH CHECK (
    auth.is_admin()
  );

-- Only ADMIN can delete system config
DROP POLICY IF EXISTS "Only ADMIN can delete system config" ON "SystemConfig";
CREATE POLICY "Only ADMIN can delete system config"
  ON "SystemConfig"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 8: HistoricalData Table Policies
-- =====================================================

-- All authenticated users can read historical data
DROP POLICY IF EXISTS "All authenticated users can read historical data" ON "HistoricalData";
CREATE POLICY "All authenticated users can read historical data"
  ON "HistoricalData"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- ADMIN and PLANNER can create historical data
DROP POLICY IF EXISTS "ADMIN and PLANNER can create historical data" ON "HistoricalData";
CREATE POLICY "ADMIN and PLANNER can create historical data"
  ON "HistoricalData"
  FOR INSERT
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- ADMIN and PLANNER can update historical data
DROP POLICY IF EXISTS "ADMIN and PLANNER can update historical data" ON "HistoricalData";
CREATE POLICY "ADMIN and PLANNER can update historical data"
  ON "HistoricalData"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner()
  )
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- Only ADMIN can delete historical data
DROP POLICY IF EXISTS "Only ADMIN can delete historical data" ON "HistoricalData";
CREATE POLICY "Only ADMIN can delete historical data"
  ON "HistoricalData"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 9: CapExAsset Table Policies
-- =====================================================

-- All authenticated users can read CapEx assets
DROP POLICY IF EXISTS "All authenticated users can read CapEx assets" ON "CapExAsset";
CREATE POLICY "All authenticated users can read CapEx assets"
  ON "CapExAsset"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- ADMIN and PLANNER can create CapEx assets
DROP POLICY IF EXISTS "ADMIN and PLANNER can create CapEx assets" ON "CapExAsset";
CREATE POLICY "ADMIN and PLANNER can create CapEx assets"
  ON "CapExAsset"
  FOR INSERT
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- ADMIN and PLANNER can update CapEx assets
DROP POLICY IF EXISTS "ADMIN and PLANNER can update CapEx assets" ON "CapExAsset";
CREATE POLICY "ADMIN and PLANNER can update CapEx assets"
  ON "CapExAsset"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner()
  )
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- Only ADMIN can delete CapEx assets
DROP POLICY IF EXISTS "Only ADMIN can delete CapEx assets" ON "CapExAsset";
CREATE POLICY "Only ADMIN can delete CapEx assets"
  ON "CapExAsset"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 10: CapExConfig Table Policies
-- =====================================================

-- All authenticated users can read CapEx config
DROP POLICY IF EXISTS "All authenticated users can read CapEx config" ON "CapExConfig";
CREATE POLICY "All authenticated users can read CapEx config"
  ON "CapExConfig"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- ADMIN and PLANNER can create CapEx config
DROP POLICY IF EXISTS "ADMIN and PLANNER can create CapEx config" ON "CapExConfig";
CREATE POLICY "ADMIN and PLANNER can create CapEx config"
  ON "CapExConfig"
  FOR INSERT
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- ADMIN and PLANNER can update CapEx config
DROP POLICY IF EXISTS "ADMIN and PLANNER can update CapEx config" ON "CapExConfig";
CREATE POLICY "ADMIN and PLANNER can update CapEx config"
  ON "CapExConfig"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner()
  )
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- Only ADMIN can delete CapEx config
DROP POLICY IF EXISTS "Only ADMIN can delete CapEx config" ON "CapExConfig";
CREATE POLICY "Only ADMIN can delete CapEx config"
  ON "CapExConfig"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 11: TransitionConfig Table Policies
-- =====================================================

-- All authenticated users can read transition config
DROP POLICY IF EXISTS "All authenticated users can read transition config" ON "TransitionConfig";
CREATE POLICY "All authenticated users can read transition config"
  ON "TransitionConfig"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- ADMIN and PLANNER can create transition config
DROP POLICY IF EXISTS "ADMIN and PLANNER can create transition config" ON "TransitionConfig";
CREATE POLICY "ADMIN and PLANNER can create transition config"
  ON "TransitionConfig"
  FOR INSERT
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- ADMIN and PLANNER can update transition config
DROP POLICY IF EXISTS "ADMIN and PLANNER can update transition config" ON "TransitionConfig";
CREATE POLICY "ADMIN and PLANNER can update transition config"
  ON "TransitionConfig"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner()
  )
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- Only ADMIN can delete transition config
DROP POLICY IF EXISTS "Only ADMIN can delete transition config" ON "TransitionConfig";
CREATE POLICY "Only ADMIN can delete transition config"
  ON "TransitionConfig"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 12: WorkingCapitalRatios Table Policies
-- =====================================================

-- All authenticated users can read working capital ratios
DROP POLICY IF EXISTS "All authenticated users can read working capital ratios" ON "WorkingCapitalRatios";
CREATE POLICY "All authenticated users can read working capital ratios"
  ON "WorkingCapitalRatios"
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
  );

-- ADMIN and PLANNER can create working capital ratios
DROP POLICY IF EXISTS "ADMIN and PLANNER can create working capital ratios" ON "WorkingCapitalRatios";
CREATE POLICY "ADMIN and PLANNER can create working capital ratios"
  ON "WorkingCapitalRatios"
  FOR INSERT
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- ADMIN and PLANNER can update working capital ratios
DROP POLICY IF EXISTS "ADMIN and PLANNER can update working capital ratios" ON "WorkingCapitalRatios";
CREATE POLICY "ADMIN and PLANNER can update working capital ratios"
  ON "WorkingCapitalRatios"
  FOR UPDATE
  USING (
    auth.is_admin_or_planner()
  )
  WITH CHECK (
    auth.is_admin_or_planner()
  );

-- Only ADMIN can delete working capital ratios
DROP POLICY IF EXISTS "Only ADMIN can delete working capital ratios" ON "WorkingCapitalRatios";
CREATE POLICY "Only ADMIN can delete working capital ratios"
  ON "WorkingCapitalRatios"
  FOR DELETE
  USING (
    auth.is_admin()
  );


-- =====================================================
-- STEP 13: Grant Necessary Permissions
-- =====================================================

-- Grant usage on auth schema to authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION auth.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin_or_planner() TO authenticated;


-- =====================================================
-- STEP 14: Verification Queries (Optional - Comment out if not needed)
-- =====================================================

-- Uncomment these queries to verify the policies are working correctly
-- Run these as different users to test access control

/*
-- Verify current user's role
SELECT auth.get_user_role() as my_role;

-- Verify current user's ID
SELECT auth.get_user_id() as my_id;

-- Verify if current user is admin
SELECT auth.is_admin() as am_i_admin;

-- Verify if current user is admin or planner
SELECT auth.is_admin_or_planner() as can_i_create;

-- List all policies on User table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'User';

-- List all policies on LeaseProposal table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'LeaseProposal';
*/


-- =====================================================
-- COMPLETION NOTICE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Row-Level Security (RLS) policies have been successfully applied!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables with RLS enabled:';
  RAISE NOTICE '  - User';
  RAISE NOTICE '  - LeaseProposal';
  RAISE NOTICE '  - Scenario';
  RAISE NOTICE '  - SensitivityAnalysis';
  RAISE NOTICE '  - SystemConfig';
  RAISE NOTICE '  - HistoricalData';
  RAISE NOTICE '  - CapExAsset';
  RAISE NOTICE '  - CapExConfig';
  RAISE NOTICE '  - TransitionConfig';
  RAISE NOTICE '  - WorkingCapitalRatios';
  RAISE NOTICE '';
  RAISE NOTICE 'Access Control Summary:';
  RAISE NOTICE '  ADMIN:   Full access to all tables and operations';
  RAISE NOTICE '  PLANNER: Can create/update/delete own proposals and related data';
  RAISE NOTICE '  VIEWER:  Read-only access to all data';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Test the policies with different user roles';
  RAISE NOTICE '  2. Verify that users can only access data according to their role';
  RAISE NOTICE '  3. Create test users with different roles for validation';
  RAISE NOTICE '';
  RAISE NOTICE 'To test policies, uncomment the verification queries at the end of this script.';
  RAISE NOTICE '=====================================================';
END $$;
