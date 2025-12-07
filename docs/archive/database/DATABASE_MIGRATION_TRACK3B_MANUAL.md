# Track 3B Database Migration - Manual SQL

**Status:** Schema updated, configuration fixed, manual SQL execution required
**Date:** November 24, 2025
**Issue:** Prisma commands timing out despite correct directUrl configuration
**Resolution:** Manual SQL execution via Supabase Dashboard recommended

## ✅ Completed

1. **Prisma Schema Updated** - Added `SensitivityAnalysis` model to [prisma/schema.prisma](prisma/schema.prisma)
   - Relations added to `User` and `LeaseProposal` models
   - All fields configured correctly

## ⚠️ Pending - Manual Database Migration Needed

The `prisma db push` and `prisma migrate dev` commands are hanging when connecting to the database. The schema is ready, but the database table needs to be created manually.

### Option 1: Run SQL Directly (Recommended)

Execute the following SQL in your Supabase SQL Editor or via psql:

```sql
-- Create SensitivityAnalysis table
CREATE TABLE IF NOT EXISTS "SensitivityAnalysis" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "variable" TEXT NOT NULL,
    "rangeMin" DECIMAL(65,30) NOT NULL,
    "rangeMax" DECIMAL(65,30) NOT NULL,
    "impactMetric" TEXT NOT NULL,
    "dataPoints" JSONB,
    "tornadoData" JSONB,

    CONSTRAINT "SensitivityAnalysis_pkey" PRIMARY KEY ("id")
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "SensitivityAnalysis_proposalId_idx"
ON "SensitivityAnalysis"("proposalId");

-- Add foreign key constraints
ALTER TABLE "SensitivityAnalysis"
ADD CONSTRAINT "SensitivityAnalysis_proposalId_fkey"
FOREIGN KEY ("proposalId") REFERENCES "LeaseProposal"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SensitivityAnalysis"
ADD CONSTRAINT "SensitivityAnalysis_createdBy_fkey"
FOREIGN KEY ("createdBy") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Option 2: Wait and Retry Prisma Command

If you want to retry the Prisma command:

```bash
# Method 1: Using db push (faster, for development)
pnpm prisma db push --accept-data-loss

# Method 2: Using migrate dev (creates migration history)
pnpm prisma migrate dev --name add_sensitivity_analysis_track3b
```

### Option 3: Via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Paste the SQL from Option 1
3. Click "Run"

## Database Schema Overview

### SensitivityAnalysis Table Structure

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key (UUID) |
| `proposalId` | TEXT | No | Foreign key → LeaseProposal.id |
| `name` | TEXT | Yes | Optional name for the analysis |
| `createdAt` | TIMESTAMP | No | Auto-generated timestamp |
| `createdBy` | TEXT | No | Foreign key → User.id |
| `variable` | TEXT | No | Variable to test (enrollment, cpi, tuitionGrowth, rentEscalation) |
| `rangeMin` | DECIMAL | No | Minimum value for range (e.g., -20 for -20%) |
| `rangeMax` | DECIMAL | No | Maximum value for range (e.g., +20 for +20%) |
| `impactMetric` | TEXT | No | Metric to measure impact on (npv, totalRent, totalEbitda, etc.) |
| `dataPoints` | JSONB | Yes | Array of {inputValue, outputValue} for tornado chart |
| `tornadoData` | JSONB | Yes | Processed tornado chart data |

### Relations

- **LeaseProposal** → `sensitivityAnalyses` (one-to-many)
- **User** → `sensitivityAnalysesCreated` (one-to-many)

## Verification

After applying the migration, verify with:

```sql
-- Check table exists
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'SensitivityAnalysis';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'SensitivityAnalysis';

-- Check foreign keys
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'SensitivityAnalysis';
```

## Next Steps

Once the table is created:

1. ✅ Generate Prisma Client: `pnpm prisma generate`
2. ✅ Verify with: `pnpm tsc --noEmit`
3. ✅ Proceed with Track 3B implementation (Scenarios & Sensitivity APIs)

## Troubleshooting

**If you see "prepared statement already exists" error:**
- Wait 30 seconds for database connections to clear
- Try again

**If Prisma commands continue to hang:**
- Check Supabase dashboard for connection pooler status
- Verify DATABASE_URL in .env.local is correct
- Try using DIRECT_URL instead of pooler URL for migrations

---

**Document Created:** November 24, 2025
**Schema File:** [prisma/schema.prisma](prisma/schema.prisma:180-202)
**Status:** Ready for manual application
