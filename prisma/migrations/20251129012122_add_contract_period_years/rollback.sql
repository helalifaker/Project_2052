-- Rollback Migration: Remove contractPeriodYears from LeaseProposal
-- WARNING: This will permanently delete the contractPeriodYears column and all its data

-- Drop the index
DROP INDEX IF EXISTS "LeaseProposal_contractPeriodYears_idx";

-- Drop the check constraint
ALTER TABLE "LeaseProposal"
DROP CONSTRAINT IF EXISTS "LeaseProposal_contractPeriodYears_check";

-- Drop the column
ALTER TABLE "LeaseProposal"
DROP COLUMN IF EXISTS "contractPeriodYears";

-- Verify rollback
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'LeaseProposal' AND column_name = 'contractPeriodYears';
-- Should return 0 rows
