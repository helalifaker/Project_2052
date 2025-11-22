-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PLANNER', 'VIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "zakatRate" DECIMAL(65,30) NOT NULL DEFAULT 0.025,
    "debtInterestRate" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "depositInterestRate" DECIMAL(65,30) NOT NULL DEFAULT 0.02,
    "minCashBalance" DECIMAL(65,30) NOT NULL DEFAULT 1000000,
    "confirmedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalData" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "statementType" TEXT NOT NULL,
    "lineItem" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoricalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingCapitalRatios" (
    "id" TEXT NOT NULL,
    "arPercent" DECIMAL(65,30) NOT NULL,
    "prepaidPercent" DECIMAL(65,30) NOT NULL,
    "apPercent" DECIMAL(65,30) NOT NULL,
    "accruedPercent" DECIMAL(65,30) NOT NULL,
    "deferredRevenuePercent" DECIMAL(65,30) NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT true,
    "calculatedFrom2024" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingCapitalRatios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapExAsset" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT,
    "year" INTEGER NOT NULL,
    "assetName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "usefulLife" INTEGER NOT NULL,
    "depreciationMethod" TEXT NOT NULL,
    "fixedAmount" DECIMAL(65,30),
    "rate" DECIMAL(65,30),
    "nbv" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapExAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapExConfig" (
    "id" TEXT NOT NULL,
    "autoReinvestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reinvestFrequency" INTEGER,
    "reinvestAmount" DECIMAL(65,30),
    "reinvestAmountPercent" DECIMAL(65,30),

    CONSTRAINT "CapExConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaseProposal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rentModel" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transition" JSONB NOT NULL,
    "enrollment" JSONB NOT NULL,
    "curriculum" JSONB NOT NULL,
    "staff" JSONB NOT NULL,
    "rentParams" JSONB NOT NULL,
    "otherOpex" DECIMAL(65,30) NOT NULL,
    "financials" JSONB,
    "metrics" JSONB,
    "calculatedAt" TIMESTAMP(3),

    CONSTRAINT "LeaseProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalData_year_statementType_lineItem_key" ON "HistoricalData"("year", "statementType", "lineItem");
