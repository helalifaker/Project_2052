-- Manual migration: Add type and usefulLife columns to CapExCategory
--
-- This migration transforms the old CapExCategory schema to the new schema
-- with the required 'type' enum field and 'usefulLife' field.
--
-- Strategy:
-- 1. Create the CapExCategoryType enum if it doesn't exist
-- 2. Drop the old CapExCategory table and related data
-- 3. Let Prisma recreate the table with the new schema
-- 4. Categories will be seeded via seed-capex-categories.ts

-- Create the enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "CapExCategoryType" AS ENUM ('IT_EQUIPMENT', 'FURNITURE', 'EDUCATIONAL_EQUIPMENT', 'BUILDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop the old CapExCategory table
-- This will cascade delete related CapExAsset and CapExTransition records
-- Since we're fixing a broken implementation, this is acceptable
DROP TABLE IF EXISTS "CapExCategory" CASCADE;

-- Note: After running this migration, run:
-- 1. npx prisma db push --accept-data-loss
-- 2. npx tsx prisma/seed-capex-categories.ts
