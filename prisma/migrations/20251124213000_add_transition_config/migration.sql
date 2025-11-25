-- Add TransitionConfig table for admin-managed transition assumptions
CREATE TABLE "TransitionConfig" (
    "id" TEXT NOT NULL,
    "year2025Students" INTEGER NOT NULL,
    "year2025AvgTuition" DECIMAL(65,30) NOT NULL,
    "year2026Students" INTEGER NOT NULL,
    "year2026AvgTuition" DECIMAL(65,30) NOT NULL,
    "year2027Students" INTEGER NOT NULL,
    "year2027AvgTuition" DECIMAL(65,30) NOT NULL,
    "rentGrowthPercent" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "TransitionConfig_pkey" PRIMARY KEY ("id")
);
