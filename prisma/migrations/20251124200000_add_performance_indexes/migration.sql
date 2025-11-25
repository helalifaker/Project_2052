-- CreateIndex
-- PERFORMANCE OPTIMIZATION: Indexes for common query patterns
-- These indexes dramatically improve query performance on the LeaseProposal table

-- Index on createdBy for filtering by user
CREATE INDEX IF NOT EXISTS "idx_created_by" ON "LeaseProposal"("createdBy");

-- Index on createdAt for sorting and date-range filtering
CREATE INDEX IF NOT EXISTS "idx_created_at" ON "LeaseProposal"("createdAt");

-- Index on rentModel for filtering by rent model type
CREATE INDEX IF NOT EXISTS "idx_rent_model" ON "LeaseProposal"("rentModel");

-- Composite index on createdAt and createdBy for efficient user-filtered date queries
CREATE INDEX IF NOT EXISTS "idx_created_composite" ON "LeaseProposal"("createdAt", "createdBy");
