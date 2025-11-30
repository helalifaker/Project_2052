-- Add discountRate column to SystemConfig table
ALTER TABLE "SystemConfig"
ADD COLUMN IF NOT EXISTS "discountRate" DECIMAL(65,30) NOT NULL DEFAULT 0.08;

-- Update existing rows to have the default value
UPDATE "SystemConfig"
SET "discountRate" = 0.08
WHERE "discountRate" IS NULL OR "discountRate" = 0;
