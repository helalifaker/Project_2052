-- Migration: Consolidate otherOpex and otherOpexPercent
-- Purpose: Remove redundant otherOpex column, standardize on otherOpexPercent
-- Run: npx prisma db execute --file prisma/migrations/manual/migrate-other-opex-percent.sql

-- Step 1: Copy otherOpex values to otherOpexPercent where otherOpexPercent is NULL
-- Only copy if otherOpex looks like a percentage (between 0 and 1)
UPDATE "LeaseProposal"
SET "otherOpexPercent" = "otherOpex"
WHERE "otherOpexPercent" IS NULL
  AND "otherOpex" > 0
  AND "otherOpex" <= 1;

-- Step 2: For any remaining NULL values, set a default of 10%
UPDATE "LeaseProposal"
SET "otherOpexPercent" = 0.10
WHERE "otherOpexPercent" IS NULL;

-- Step 3: Make otherOpexPercent NOT NULL
ALTER TABLE "LeaseProposal" ALTER COLUMN "otherOpexPercent" SET NOT NULL;

-- Step 4: Drop the redundant otherOpex column
ALTER TABLE "LeaseProposal" DROP COLUMN "otherOpex";
