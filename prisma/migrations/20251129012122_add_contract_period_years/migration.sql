-- AlterTable: Add contractPeriodYears field to LeaseProposal
-- This field controls the dynamic projection period length (25 or 30 years)
-- Default: 30 years (maintains current behavior: 2028-2057)

ALTER TABLE "LeaseProposal"
ADD COLUMN "contractPeriodYears" INTEGER NOT NULL DEFAULT 30;

-- Add check constraint to enforce valid values (25 or 30 years only)
ALTER TABLE "LeaseProposal"
ADD CONSTRAINT "LeaseProposal_contractPeriodYears_check"
CHECK ("contractPeriodYears" IN (25, 30));

-- Create index for filtering proposals by contract period
CREATE INDEX "LeaseProposal_contractPeriodYears_idx"
ON "LeaseProposal"("contractPeriodYears");

-- Verify migration: All existing proposals should have contractPeriodYears=30
-- SELECT COUNT(*) as total_proposals,
--        COUNT(CASE WHEN "contractPeriodYears" = 30 THEN 1 END) as with_30_years
-- FROM "LeaseProposal";
