/**
 * POST /api/proposals/calculate
 *
 * Financial Calculation Engine API Endpoint
 *
 * This endpoint processes 30-year financial projections for school lease proposals.
 * It integrates the Phase 2 calculation engine with the API layer.
 *
 * Request Body: CalculationEngineInput (validated with Zod)
 * Response: CalculationEngineOutput with complete financial projections
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { z } from "zod";
import Decimal from "decimal.js";
import {
  calculateWithTimeout,
  CalculationTimeoutError,
} from "@/lib/engine/core/calculation-utils";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
  FixedRentParams,
  RevenueShareParams,
  PartnerInvestmentParams,
} from "@/lib/engine/core/types";
import { RentModel, CapExCategoryType } from "@/lib/engine/core/types";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import type { InputJsonValue } from "@/lib/types/prisma-helpers";
import { prisma } from "@/lib/prisma";
import {
  getCachedCalculation,
  setCachedCalculation,
  getCacheStats,
} from "@/lib/cache/calculation-cache";
import { mapHistoricalPeriod } from "@/lib/historical/line-item-mapper";

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for Decimal.js values
 * Accepts string, number, or existing Decimal, converts to Decimal
 */
const DecimalSchema = z
  .any()
  .refine(
    (val) => {
      // Accept Decimal objects directly
      if (Decimal.isDecimal(val)) return true;
      // Accept strings and numbers that can be converted to Decimal
      if (typeof val === "string" || typeof val === "number") {
        try {
          new Decimal(val);
          return true;
        } catch {
          return false;
        }
      }
      // Accept Prisma.Decimal (which has a toString method)
      if (
        val &&
        typeof val === "object" &&
        typeof val.toString === "function"
      ) {
        try {
          new Decimal(val.toString());
          return true;
        } catch {
          return false;
        }
      }
      return false;
    },
    { message: "Invalid decimal value" },
  )
  .transform((val) => {
    if (Decimal.isDecimal(val)) return val;
    if (typeof val === "string" || typeof val === "number") {
      return new Decimal(val);
    }
    // Handle Prisma.Decimal and other objects with toString
    return new Decimal(val.toString());
  });

/**
 * System Configuration Schema
 */
const SystemConfigSchema = z.object({
  zakatRate: DecimalSchema,
  debtInterestRate: DecimalSchema,
  depositInterestRate: DecimalSchema,
  minCashBalance: DecimalSchema,
});

/**
 * Historical Period P&L Schema
 */
const HistoricalPLSchema = z.object({
  revenue: DecimalSchema,
  tuitionRevenue: DecimalSchema.optional(), // New: separate tuition revenue
  otherRevenue: DecimalSchema.optional(), // New: other revenue (cafeteria, etc.)
  rent: DecimalSchema,
  staffCosts: DecimalSchema,
  otherOpex: DecimalSchema,
  depreciation: DecimalSchema,
  interest: DecimalSchema, // Interest expense
  interestIncome: DecimalSchema.optional(), // New: interest income on deposits
  zakat: DecimalSchema,
});

/**
 * Historical Period Balance Sheet Schema
 */
const HistoricalBSSchema = z.object({
  cash: DecimalSchema,
  accountsReceivable: DecimalSchema,
  prepaidExpenses: DecimalSchema,
  grossPPE: DecimalSchema, // Gross PP&E (total cost of assets)
  ppe: DecimalSchema, // Net PP&E (Gross - Accumulated Depreciation)
  accumulatedDepreciation: DecimalSchema,
  accountsPayable: DecimalSchema,
  accruedExpenses: DecimalSchema,
  deferredRevenue: DecimalSchema,
  debt: DecimalSchema,
  equity: DecimalSchema,
});

/**
 * Historical Period Input Schema
 */
const HistoricalPeriodInputSchema = z.object({
  year: z.number().int().min(2020).max(2030),
  profitLoss: HistoricalPLSchema,
  balanceSheet: HistoricalBSSchema,
  immutable: z.boolean(),
});

/**
 * Transition Period Input Schema
 */
const TransitionPeriodInputSchema = z.object({
  year: z.number().int().min(2024).max(2028),
  preFillFromPriorYear: z.boolean(),
  numberOfStudents: z.number().int().nonnegative().optional(),
  averageTuitionPerStudent: DecimalSchema.optional(),
  revenueGrowthRate: DecimalSchema.optional(),
  rentGrowthPercent: DecimalSchema.optional(),
});

/**
 * Working Capital Ratios Schema
 */
const WorkingCapitalRatiosSchema = z.object({
  arPercent: DecimalSchema,
  prepaidPercent: DecimalSchema,
  apPercent: DecimalSchema,
  accruedPercent: DecimalSchema,
  deferredRevenuePercent: DecimalSchema,
  otherRevenueRatio: DecimalSchema,
  locked: z.boolean(),
  calculatedFrom2024: z.boolean(),
});

/**
 * Rent Model Parameters Schemas (individual)
 */
const FixedRentParamsSchema = z.object({
  baseRent: DecimalSchema,
  growthRate: DecimalSchema,
  frequency: z.number().int().min(1).max(5),
});

const RevenueShareParamsSchema = z.object({
  revenueSharePercent: DecimalSchema,
});

const PartnerInvestmentParamsSchema = z.object({
  landSize: DecimalSchema,
  landPricePerSqm: DecimalSchema,
  buaSize: DecimalSchema,
  constructionCostPerSqm: DecimalSchema,
  yieldRate: DecimalSchema,
  growthRate: DecimalSchema,
  frequency: z.number().int().min(1).max(5),
});

/**
 * Enrollment Configuration Schema
 */
const EnrollmentConfigSchema = z.object({
  rampUpEnabled: z.boolean(),
  rampUpStartYear: z.number().int(),
  rampUpEndYear: z.number().int(),
  rampUpTargetStudents: z.number().int().nonnegative(),
  rampPlanPercentages: z.array(z.number()).optional(),
  steadyStateStudents: z.number().int().nonnegative(),
  gradeDistribution: z.array(z.unknown()), // Simplified for now
});

/**
 * Curriculum Configuration Schema
 */
const CurriculumConfigSchema = z.object({
  ibProgramEnabled: z.boolean(),
  ibStartYear: z.number().int(),
  nationalCurriculumFee: DecimalSchema,
  ibCurriculumFee: DecimalSchema,
  ibStudentPercentage: DecimalSchema,
  nationalTuitionGrowthRate: DecimalSchema.optional(),
  nationalTuitionGrowthFrequency: z.number().int().min(1).max(5).optional(),
  ibTuitionGrowthRate: DecimalSchema.optional(),
  ibTuitionGrowthFrequency: z.number().int().min(1).max(5).optional(),
});

/**
 * Staff Configuration Schema
 */
const StaffConfigSchema = z.object({
  fixedStaffCost: DecimalSchema,
  variableStaffCostPerStudent: DecimalSchema,
  staffCostAsRevenuePercent: DecimalSchema.optional(),
  studentsPerTeacher: z.number().int().positive().optional(),
  studentsPerNonTeacher: z.number().int().positive().optional(),
  avgTeacherSalary: DecimalSchema.optional(),
  avgAdminSalary: DecimalSchema.optional(),
  cpiRate: DecimalSchema.optional(),
  cpiFrequency: z.number().int().min(1).max(5).optional(),
});

/**
 * CapEx Configuration Schema
 */
const CapExConfigSchema = z
  .object({
    // New structure (required)
    categories: z
      .array(
        z.object({
          id: z.string(),
          type: z.string(),
          name: z.string(),
          usefulLife: z.number().int().positive(),
          reinvestFrequency: z.number().int().positive().optional(),
          reinvestAmount: DecimalSchema.optional(),
          reinvestStartYear: z.number().int().optional(),
        }),
      )
      .min(1, "At least one CAPEX category is required"),
    historicalState: z.object({
      grossPPE2024: DecimalSchema,
      accumulatedDepreciation2024: DecimalSchema,
      annualDepreciation: DecimalSchema,
      remainingToDepreciate: DecimalSchema,
    }),
    transitionCapex: z.array(z.unknown()).default([]),
    virtualAssets: z.array(z.unknown()).default([]),

    // Legacy fields (optional for backward compatibility)
    autoReinvestEnabled: z.boolean().optional(),
    reinvestAmount: DecimalSchema.optional(),
    reinvestFrequency: z.number().int().positive().optional(),
    existingAssets: z.array(z.unknown()).optional(),
    newAssets: z.array(z.unknown()).optional(),
  })
  .passthrough(); // Allow additional properties

/**
 * Dynamic Period Configuration Schema
 */
const DynamicPeriodConfigSchema = z.object({
  year: z.number().int(),
  enrollment: EnrollmentConfigSchema,
  curriculum: CurriculumConfigSchema,
  staff: StaffConfigSchema,
  rentModel: z.nativeEnum(RentModel),
  rentParams: z.unknown(), // Will be parsed in transform based on rentModel
  otherOpexPercent: DecimalSchema, // % of revenue as decimal (e.g., 0.31 = 31%)
  capexConfig: CapExConfigSchema,
});

/**
 * Circular Solver Configuration Schema
 */
const CircularSolverConfigSchema = z.object({
  maxIterations: z.number().int().positive(),
  convergenceTolerance: DecimalSchema,
  relaxationFactor: DecimalSchema,
});

/**
 * Complete Calculation Engine Input Schema
 */
const CalculationEngineInputSchema = z
  .object({
    systemConfig: SystemConfigSchema,
    contractPeriodYears: z.union([z.literal(25), z.literal(30)]).default(30),
    historicalPeriods: z.array(HistoricalPeriodInputSchema).min(1),
    transitionPeriods: z.array(TransitionPeriodInputSchema).min(1),
    workingCapitalRatios: WorkingCapitalRatiosSchema,
    rentModel: z.nativeEnum(RentModel),
    rentParams: z.unknown(), // Will be parsed in transform based on rentModel
    dynamicPeriodConfig: DynamicPeriodConfigSchema,
    capexConfig: CapExConfigSchema,
    circularSolverConfig: CircularSolverConfigSchema,
  })
  .transform((data) => {
    // Parse rentParams with the correct schema based on rentModel
    let rentParams: unknown;
    if (data.rentModel === RentModel.FIXED_ESCALATION) {
      rentParams = FixedRentParamsSchema.parse(data.rentParams);
    } else if (data.rentModel === RentModel.REVENUE_SHARE) {
      rentParams = RevenueShareParamsSchema.parse(data.rentParams);
    } else if (data.rentModel === RentModel.PARTNER_INVESTMENT) {
      rentParams = PartnerInvestmentParamsSchema.parse(data.rentParams);
    } else {
      throw new Error(`Unknown rent model: ${data.rentModel}`);
    }

    // Parse dynamicPeriodConfig.rentParams with the correct schema
    let dynamicRentParams: unknown;
    if (data.dynamicPeriodConfig.rentModel === RentModel.FIXED_ESCALATION) {
      dynamicRentParams = FixedRentParamsSchema.parse(
        data.dynamicPeriodConfig.rentParams,
      );
    } else if (data.dynamicPeriodConfig.rentModel === RentModel.REVENUE_SHARE) {
      dynamicRentParams = RevenueShareParamsSchema.parse(
        data.dynamicPeriodConfig.rentParams,
      );
    } else if (
      data.dynamicPeriodConfig.rentModel === RentModel.PARTNER_INVESTMENT
    ) {
      dynamicRentParams = PartnerInvestmentParamsSchema.parse(
        data.dynamicPeriodConfig.rentParams,
      );
    } else {
      throw new Error(
        `Unknown dynamic rent model: ${data.dynamicPeriodConfig.rentModel}`,
      );
    }

    return {
      ...data,
      rentParams,
      dynamicPeriodConfig: {
        ...data.dynamicPeriodConfig,
        rentParams: dynamicRentParams,
      },
      capexConfig: data.capexConfig, // Explicitly preserve CAPEX config
    };
  });

type ProposalPayload = {
  name: string;
  developer?: string;
  rentModel: RentModel;
  property?: string;
  negotiationRound?: number;
  version?: string;
  origin?: string;
  status?: string;
  parentProposalId?: string;
  transition: CalculationEngineInput["transitionPeriods"];
  enrollment: CalculationEngineInput["dynamicPeriodConfig"]["enrollment"];
  curriculum: CalculationEngineInput["dynamicPeriodConfig"]["curriculum"];
  staff: CalculationEngineInput["dynamicPeriodConfig"]["staff"];
  rentParams: CalculationEngineInput["rentParams"];
  otherOpexPercent: number; // % of revenue as decimal (e.g., 0.31 = 31%)
};

// ============================================================================
// API ENDPOINT HANDLER
// ============================================================================

/**
 * POST /api/proposals/calculate
 *
 * Calculate 30-year financial projections and save proposal to database
 *
 * Accepts either:
 * 1. Full CalculationEngineInput (for advanced use)
 * 2. Simplified wizard format (name, developer, transition, enrollment, etc.)
 */
export async function POST(request: Request) {
  // Check auth - only ADMIN and PLANNER can run calculations
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  const { user } = authResult;
  const startTime = performance.now();

  try {
    // Parse request body
    const body = await request.json();

    // Check if this is the simplified wizard format (has 'name' and 'developer')
    // vs the full CalculationEngineInput format (has 'systemConfig' and 'historicalPeriods')
    const isWizardFormat = body.name && body.developer && !body.systemConfig;

    if (isWizardFormat) {
      console.log("📝 Transforming wizard data to calculation engine input...");

      // Load system config (default if missing)
      const sysConfig = (await prisma.systemConfig.findFirst({
        orderBy: { confirmedAt: "desc" },
      })) || {
        zakatRate: new Decimal(0.025),
        debtInterestRate: new Decimal(0.05),
        depositInterestRate: new Decimal(0.02),
        discountRate: new Decimal(0.07), // Default NPV discount rate
        minCashBalance: new Decimal(1_000_000),
      };

      // Load working capital ratios (required)
      const wc = await prisma.workingCapitalRatios.findFirst({
        orderBy: { calculatedFrom2024: "desc" },
      });
      if (!wc) {
        return NextResponse.json(
          {
            error: "Working capital ratios missing",
            message: "Admin must set 2024 WC ratios before calculations.",
          },
          { status: 400 },
        );
      }

      // Load admin-managed transition config if available
      const transitionConfig = await prisma.transitionConfig.findFirst({
        orderBy: { updatedAt: "desc" },
      });

      const toDecimalOrUndefined = (
        value?:
          | Decimal
          | number
          | string
          | null
          | undefined
          | { toNumber: () => number },
      ): Decimal | undefined => {
        if (value === null || value === undefined) return undefined;
        if (Decimal.isDecimal(value)) return value;
        if (typeof value === "number" || typeof value === "string") {
          return new Decimal(value);
        }
        // Handle objects with toNumber method (like Prisma.Decimal)
        if (
          typeof value === "object" &&
          value !== null &&
          "toNumber" in value
        ) {
          const prismaDecimal = value as { toNumber: () => number };
          return new Decimal(prismaDecimal.toNumber());
        }
        return undefined;
      };

      // Historical periods - load from database if not provided
      let historicalPeriods = body.historicalPeriods;
      if (!historicalPeriods) {
        // Fetch historical data from database
        const historicalData = await prisma.historicalData.findMany({
          where: { confirmed: true },
          orderBy: { year: "asc" },
        });

        if (historicalData.length > 0) {
          // Group by year and statement type
          const historicalByYear: Record<
            number,
            {
              year: number;
              pl: Record<string, Decimal.Value>;
              bs: Record<string, Decimal.Value>;
            }
          > = {};
          for (const record of historicalData) {
            if (!historicalByYear[record.year]) {
              historicalByYear[record.year] = {
                year: record.year,
                pl: {},
                bs: {},
              };
            }
            if (
              record.statementType === "PROFIT_LOSS" ||
              record.statementType === "PL" ||
              record.statementType === "P&L"
            ) {
              historicalByYear[record.year].pl[record.lineItem] = record.amount;
            } else if (
              record.statementType === "BALANCE_SHEET" ||
              record.statementType === "BS"
            ) {
              historicalByYear[record.year].bs[record.lineItem] = record.amount;
            }
          }

          // Map using line item mapper
          historicalPeriods = Object.values(historicalByYear).map(
            (yearData) => {
              const mapped = mapHistoricalPeriod(yearData.pl, yearData.bs);
              return {
                year: yearData.year,
                profitLoss: {
                  revenue: mapped.profitLoss.revenue,
                  tuitionRevenue: mapped.profitLoss.tuitionRevenue,
                  otherRevenue: mapped.profitLoss.otherRevenue,
                  rent: mapped.profitLoss.rent,
                  staffCosts: mapped.profitLoss.staffCosts,
                  otherOpex: mapped.profitLoss.otherOpex,
                  depreciation: mapped.profitLoss.depreciation,
                  interest: mapped.profitLoss.interest,
                  interestIncome: mapped.profitLoss.interestIncome,
                  zakat: mapped.profitLoss.zakat,
                },
                balanceSheet: {
                  cash: mapped.balanceSheet.cash,
                  accountsReceivable: mapped.balanceSheet.accountsReceivable,
                  prepaidExpenses: mapped.balanceSheet.prepaidExpenses,
                  grossPPE: mapped.balanceSheet.grossPPE,
                  ppe: mapped.balanceSheet.ppe,
                  accumulatedDepreciation:
                    mapped.balanceSheet.accumulatedDepreciation,
                  accountsPayable: mapped.balanceSheet.accountsPayable,
                  accruedExpenses: mapped.balanceSheet.accruedExpenses,
                  deferredRevenue: mapped.balanceSheet.deferredRevenue,
                  debt: mapped.balanceSheet.debt,
                  equity: mapped.balanceSheet.equity,
                },
                immutable: true,
              };
            },
          );
        } else {
          // Fallback to minimal placeholders if no database data
          historicalPeriods = [
            {
              year: 2023,
              profitLoss: {
                revenue: new Decimal(45000000),
                rent: new Decimal(9000000),
                staffCosts: new Decimal(18000000),
                otherOpex: new Decimal(4500000),
                depreciation: new Decimal(1800000),
                interest: new Decimal(900000),
                zakat: new Decimal(270000),
              },
              balanceSheet: {
                cash: new Decimal(4500000),
                accountsReceivable: new Decimal(4500000),
                prepaidExpenses: new Decimal(1575000),
                grossPPE: new Decimal(36000000), // Gross = Net + AccDep
                ppe: new Decimal(27000000),
                accumulatedDepreciation: new Decimal(9000000),
                accountsPayable: new Decimal(2520000),
                accruedExpenses: new Decimal(1575000),
                deferredRevenue: new Decimal(6750000),
                debt: new Decimal(18000000),
                equity: new Decimal(8730000),
              },
              immutable: true,
            },
            {
              year: 2024,
              profitLoss: {
                revenue: new Decimal(50000000),
                rent: new Decimal(10000000),
                staffCosts: new Decimal(20000000),
                otherOpex: new Decimal(5000000),
                depreciation: new Decimal(2000000),
                interest: new Decimal(1000000),
                zakat: new Decimal(300000),
              },
              balanceSheet: {
                cash: new Decimal(5000000),
                accountsReceivable: new Decimal(5000000),
                prepaidExpenses: new Decimal(1750000),
                grossPPE: new Decimal(40000000), // Gross = Net + AccDep
                ppe: new Decimal(30000000),
                accumulatedDepreciation: new Decimal(10000000),
                accountsPayable: new Decimal(2800000),
                accruedExpenses: new Decimal(1750000),
                deferredRevenue: new Decimal(7500000),
                debt: new Decimal(20000000),
                equity: new Decimal(9700000),
              },
              immutable: false,
            },
          ];
        }
      }

      // Build transition periods from admin config when available, otherwise wizard inputs
      const transitionInputs = {
        year2025Students:
          transitionConfig?.year2025Students ??
          body.transition?.year2025?.students ??
          body.transition2025Students,
        year2025AvgTuition:
          toDecimalOrUndefined(transitionConfig?.year2025AvgTuition) ??
          toDecimalOrUndefined(body.transition?.year2025?.avgTuition) ??
          toDecimalOrUndefined(body.transition2025AvgTuition),
        year2026Students:
          transitionConfig?.year2026Students ??
          body.transition?.year2026?.students ??
          body.transition2026Students,
        year2026AvgTuition:
          toDecimalOrUndefined(transitionConfig?.year2026AvgTuition) ??
          toDecimalOrUndefined(body.transition?.year2026?.avgTuition) ??
          toDecimalOrUndefined(body.transition2026AvgTuition),
        year2027Students:
          transitionConfig?.year2027Students ??
          body.transition?.year2027?.students ??
          body.transition2027Students,
        year2027AvgTuition:
          toDecimalOrUndefined(transitionConfig?.year2027AvgTuition) ??
          toDecimalOrUndefined(body.transition?.year2027?.avgTuition) ??
          toDecimalOrUndefined(body.transition2027AvgTuition),
        rentGrowthPercent:
          transitionConfig?.rentGrowthPercent ??
          (body.transition?.rentGrowthPercent
            ? new Decimal(body.transition.rentGrowthPercent).div(100)
            : undefined),
      };

      const makeTransition = (
        year: number,
        students?: number,
        tuition?: Decimal,
      ) => ({
        year,
        preFillFromPriorYear: false,
        numberOfStudents: students,
        averageTuitionPerStudent: tuition,
        rentGrowthPercent: transitionInputs.rentGrowthPercent,
      });

      const transitionPeriods = [
        makeTransition(
          2025,
          transitionInputs.year2025Students,
          transitionInputs.year2025AvgTuition,
        ),
        makeTransition(
          2026,
          transitionInputs.year2026Students,
          transitionInputs.year2026AvgTuition,
        ),
        makeTransition(
          2027,
          transitionInputs.year2027Students,
          transitionInputs.year2027AvgTuition,
        ),
      ];

      // Enrollment/ramp plan (per curriculum)
      const frCapacity =
        body.enrollment?.frenchCapacity ?? body.frenchCapacity ?? 1000;
      const ibCapacity = body.enrollment?.ibCapacity ?? body.ibCapacity ?? 0;
      const totalCapacity = frCapacity + ibCapacity;
      const ibEnabled =
        body.curriculum?.ibProgramEnabled ?? body.ibProgramEnabled ?? false;
      const ibStartYear =
        body.curriculum?.ibStartYear ?? body.ibStartYear ?? 2028;

      const frRampPercents = [
        body.enrollment?.rampUpFRYear1Percentage ??
          body.rampUpFRYear1Percentage ??
          0.2,
        body.enrollment?.rampUpFRYear2Percentage ??
          body.rampUpFRYear2Percentage ??
          0.4,
        body.enrollment?.rampUpFRYear3Percentage ??
          body.rampUpFRYear3Percentage ??
          0.6,
        body.enrollment?.rampUpFRYear4Percentage ??
          body.rampUpFRYear4Percentage ??
          0.8,
        body.enrollment?.rampUpFRYear5Percentage ??
          body.rampUpFRYear5Percentage ??
          1.0,
      ];

      const ibRampPercents = [
        body.enrollment?.rampUpIBYear1Percentage ??
          body.rampUpIBYear1Percentage ??
          0,
        body.enrollment?.rampUpIBYear2Percentage ??
          body.rampUpIBYear2Percentage ??
          0,
        body.enrollment?.rampUpIBYear3Percentage ??
          body.rampUpIBYear3Percentage ??
          0,
        body.enrollment?.rampUpIBYear4Percentage ??
          body.rampUpIBYear4Percentage ??
          0,
        body.enrollment?.rampUpIBYear5Percentage ??
          body.rampUpIBYear5Percentage ??
          0,
      ];

      const rampPercents = [0, 1, 2, 3, 4].map((index) => {
        const frStudents = frCapacity * frRampPercents[index];
        const ibStudents =
          ibEnabled && 2028 + index >= ibStartYear
            ? ibCapacity * ibRampPercents[index]
            : 0;
        const total = totalCapacity > 0 ? totalCapacity : 1;
        return (frStudents + ibStudents) / total;
      });

      // Curriculum
      const frenchFee =
        body.curriculum?.frenchBaseTuition2028 ??
        body.frenchBaseTuition2028 ??
        30000;
      const ibFee =
        body.curriculum?.ibBaseTuition2028 ?? body.ibBaseTuition2028 ?? 45000;
      const ibPct =
        ibEnabled && totalCapacity > 0 ? ibCapacity / totalCapacity : 0;
      const frenchTuitionGrowthRate =
        body.curriculum?.frenchTuitionGrowthRate ??
        body.frenchTuitionGrowthRate;
      const frenchTuitionGrowthFrequency =
        body.curriculum?.frenchTuitionGrowthFrequency ??
        body.frenchTuitionGrowthFrequency;
      const ibTuitionGrowthRate =
        body.curriculum?.ibTuitionGrowthRate ?? body.ibTuitionGrowthRate;
      const ibTuitionGrowthFrequency =
        body.curriculum?.ibTuitionGrowthFrequency ??
        body.ibTuitionGrowthFrequency;

      // Staff/OpEx
      const staffConfig = {
        fixedStaffCost: new Decimal(0),
        variableStaffCostPerStudent: new Decimal(0),
        studentsPerTeacher:
          body.staff?.studentsPerTeacher ?? body.studentsPerTeacher,
        studentsPerNonTeacher:
          body.staff?.studentsPerNonTeacher ?? body.studentsPerNonTeacher,
        avgTeacherSalary: body.staff?.avgTeacherSalary
          ? new Decimal(body.staff.avgTeacherSalary)
          : body.avgTeacherSalary
            ? new Decimal(body.avgTeacherSalary)
            : undefined,
        avgAdminSalary: body.staff?.avgAdminSalary
          ? new Decimal(body.staff.avgAdminSalary)
          : body.avgAdminSalary
            ? new Decimal(body.avgAdminSalary)
            : undefined,
        cpiRate: body.staff?.cpiRate
          ? new Decimal(body.staff.cpiRate)
          : body.cpiRate
            ? new Decimal(body.cpiRate)
            : undefined,
        cpiFrequency: body.staff?.cpiFrequency ?? body.cpiFrequency,
      };

      const otherOpexPercent =
        body.otherOpexPercent ??
        body.staff?.otherOpexPercent ??
        body.opexPercent ??
        0.1;

      // Rent params per model
      // Handle both nested (body.rentParams.x) and flat (body.x) formats for all models
      let rentParams:
        | FixedRentParams
        | RevenueShareParams
        | PartnerInvestmentParams;
      if (body.rentModel === "Fixed") {
        rentParams = {
          baseRent: new Decimal(
            body.rentParams?.baseRent ?? body.baseRent ?? 0,
          ),
          growthRate: new Decimal(
            body.rentParams?.growthRate ?? body.rentGrowthRate ?? 0,
          ),
          frequency: body.rentParams?.frequency ?? body.rentFrequency ?? 1,
        };
      } else if (body.rentModel === "RevShare") {
        rentParams = {
          revenueSharePercent: new Decimal(
            body.rentParams?.revenueSharePercent ??
              body.revenueSharePercent ??
              0,
          ),
        };
      } else {
        // Partner Investment: Handle both nested (body.rentParams.landSize) and flat (body.partnerLandSize) formats
        rentParams = {
          landSize: new Decimal(
            body.rentParams?.landSize ?? body.partnerLandSize ?? 0,
          ),
          landPricePerSqm: new Decimal(
            body.rentParams?.landPricePerSqm ??
              body.partnerLandPricePerSqm ??
              0,
          ),
          buaSize: new Decimal(
            body.rentParams?.buaSize ?? body.partnerBuaSize ?? 0,
          ),
          constructionCostPerSqm: new Decimal(
            body.rentParams?.constructionCostPerSqm ??
              body.partnerConstructionCostPerSqm ??
              0,
          ),
          yieldRate: new Decimal(
            body.rentParams?.yieldRate ?? body.partnerYieldRate ?? 0,
          ),
          growthRate: new Decimal(
            body.rentParams?.growthRate ?? body.partnerGrowthRate ?? 0,
          ),
          frequency: body.rentParams?.frequency ?? body.partnerFrequency ?? 1,
        };
      }

      const dynamicPeriodConfig = {
        year: 2028,
        enrollment: {
          rampUpEnabled: true,
          rampUpStartYear: 2028,
          rampUpEndYear: 2032,
          rampUpTargetStudents: totalCapacity > 0 ? totalCapacity : 1,
          rampPlanPercentages: rampPercents,
          steadyStateStudents: totalCapacity > 0 ? totalCapacity : 1,
          gradeDistribution: [],
        },
        curriculum: {
          ibProgramEnabled: ibEnabled,
          ibStartYear,
          nationalCurriculumFee: new Decimal(frenchFee),
          ibCurriculumFee: new Decimal(ibFee),
          nationalTuitionGrowthRate:
            frenchTuitionGrowthRate !== undefined
              ? new Decimal(frenchTuitionGrowthRate)
              : undefined,
          nationalTuitionGrowthFrequency: frenchTuitionGrowthFrequency,
          ibTuitionGrowthRate:
            ibTuitionGrowthRate !== undefined
              ? new Decimal(ibTuitionGrowthRate)
              : undefined,
          ibTuitionGrowthFrequency: ibTuitionGrowthFrequency,
          ibStudentPercentage: new Decimal(ibPct),
        },
        staff: staffConfig,
        rentModel: (body.rentModel === "Fixed"
          ? RentModel.FIXED_ESCALATION
          : body.rentModel === "RevShare"
            ? RentModel.REVENUE_SHARE
            : RentModel.PARTNER_INVESTMENT) as RentModel,
        rentParams,
        otherOpexPercent: new Decimal(otherOpexPercent),
        capexConfig: {
          categories: [
            {
              id: "cat-it",
              type: CapExCategoryType.IT_EQUIPMENT,
              name: "IT Equipment",
              usefulLife: 5,
              reinvestFrequency: undefined,
              reinvestAmount: undefined,
            },
          ],
          historicalState: {
            grossPPE2024: new Decimal(40000000),
            accumulatedDepreciation2024: new Decimal(10000000),
            annualDepreciation: new Decimal(1000000),
            remainingToDepreciate: new Decimal(30000000),
          },
          transitionCapex: [],
          virtualAssets: [],
        },
      };

      const input: CalculationEngineInput = {
        systemConfig: {
          zakatRate: new Decimal(sysConfig.zakatRate),
          debtInterestRate: new Decimal(sysConfig.debtInterestRate),
          depositInterestRate: new Decimal(sysConfig.depositInterestRate),
          discountRate: sysConfig.discountRate
            ? new Decimal(sysConfig.discountRate)
            : undefined,
          minCashBalance: new Decimal(sysConfig.minCashBalance),
        },
        contractPeriodYears: body.contractPeriodYears ?? 30,
        historicalPeriods,
        transitionPeriods,
        workingCapitalRatios: {
          arPercent: new Decimal(wc.arPercent),
          prepaidPercent: new Decimal(wc.prepaidPercent),
          apPercent: new Decimal(wc.apPercent),
          accruedPercent: new Decimal(wc.accruedPercent),
          deferredRevenuePercent: new Decimal(wc.deferredRevenuePercent),
          // Calculate otherRevenueRatio from 2024 historical data (Section 1.3 of Financial Rules)
          // Formula: Other Revenue 2024 / Tuition Revenue 2024
          otherRevenueRatio: (() => {
            const year2024 = historicalPeriods.find(
              (p: { year: number }) => p.year === 2024,
            );
            if (year2024?.profitLoss?.tuitionRevenue) {
              const tuition = Decimal.isDecimal(
                year2024.profitLoss.tuitionRevenue,
              )
                ? year2024.profitLoss.tuitionRevenue
                : new Decimal(year2024.profitLoss.tuitionRevenue);
              const other = Decimal.isDecimal(year2024.profitLoss.otherRevenue)
                ? year2024.profitLoss.otherRevenue
                : new Decimal(year2024.profitLoss.otherRevenue ?? 0);
              if (tuition.greaterThan(0)) {
                return other.dividedBy(tuition);
              }
            }
            return new Decimal(0);
          })(),
          locked: wc.locked,
          calculatedFrom2024: true,
        },
        rentModel:
          body.rentModel === "Fixed"
            ? RentModel.FIXED_ESCALATION
            : body.rentModel === "RevShare"
              ? RentModel.REVENUE_SHARE
              : RentModel.PARTNER_INVESTMENT,
        rentParams,
        dynamicPeriodConfig,
        capexConfig: {
          categories: [
            {
              id: "cat-it",
              type: CapExCategoryType.IT_EQUIPMENT,
              name: "IT Equipment",
              usefulLife: 5,
              reinvestFrequency: undefined,
              reinvestAmount: undefined,
            },
          ],
          historicalState: {
            grossPPE2024: new Decimal(40000000),
            accumulatedDepreciation2024: new Decimal(10000000),
            annualDepreciation: new Decimal(1000000),
            remainingToDepreciate: new Decimal(30000000),
          },
          transitionCapex: [],
          virtualAssets: [],
        },
        circularSolverConfig: {
          maxIterations: 100,
          convergenceTolerance: new Decimal(0.01),
          relaxationFactor: new Decimal(0.5),
        },
      };

      body.systemConfig = input.systemConfig;
      body.historicalPeriods = input.historicalPeriods;
      body.transitionPeriods = input.transitionPeriods;
      body.workingCapitalRatios = input.workingCapitalRatios;
      body.rentModel = input.rentModel;
      body.rentParams = input.rentParams;
      body.dynamicPeriodConfig = input.dynamicPeriodConfig;
      body.capexConfig = input.capexConfig;
      body.circularSolverConfig = input.circularSolverConfig;
    }

    // Validate input with Zod
    const validationResult = CalculationEngineInputSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "❌ Validation errors:",
        JSON.stringify(validationResult.error.issues, null, 2),
      );
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    // TypeScript can't perfectly infer the transform output matches CalculationEngineInput
    // but the transform ensures all required fields are present
    const input = validationResult.data as CalculationEngineInput;

    // Extract proposal data for saving
    // If wizard format, use wizard data; otherwise extract from engine input
    // Include capacity fields that UI expects (frenchCapacity, ibCapacity)
    const frenchCapacity =
      body.enrollment?.frenchCapacity ??
      body.frenchCapacity ??
      (input.dynamicPeriodConfig.enrollment.steadyStateStudents || 1000);
    const ibCapacity = body.enrollment?.ibCapacity ?? body.ibCapacity ?? 0;

    // Get otherOpexPercent - stored as decimal (e.g., 0.10 for 10%)
    const otherOpexPercentValue = input.dynamicPeriodConfig.otherOpexPercent
      ? Decimal.isDecimal(input.dynamicPeriodConfig.otherOpexPercent)
        ? (input.dynamicPeriodConfig.otherOpexPercent as Decimal).toNumber()
        : Number(input.dynamicPeriodConfig.otherOpexPercent)
      : (body.otherOpexPercent ??
          body.staff?.otherOpexPercent ??
          body.opexPercent ??
          10) / 100;

    // Create enrollment data with UI-friendly fields added
    const enrollmentWithCapacity = {
      ...input.dynamicPeriodConfig.enrollment,
      // Add capacity fields for UI display (not part of engine type)
      frenchCapacity,
      ibCapacity,
      totalCapacity: frenchCapacity + ibCapacity,
    };

    const proposalData: ProposalPayload = {
      name: body.name || `Proposal ${new Date().toISOString().split("T")[0]}`,
      developer: body.developer,
      rentModel: input.rentModel,
      transition: input.transitionPeriods,
      enrollment:
        enrollmentWithCapacity as unknown as CalculationEngineInput["dynamicPeriodConfig"]["enrollment"],
      curriculum: input.dynamicPeriodConfig.curriculum,
      staff: input.dynamicPeriodConfig.staff,
      rentParams: input.rentParams,
      otherOpexPercent: otherOpexPercentValue,
    };

    // Log calculation request
    console.log(
      `📊 Calculation request received: ${input.historicalPeriods.length} historical periods, ${input.transitionPeriods.length} transition periods, rent model: ${input.rentModel}`,
    );

    // PERFORMANCE OPTIMIZATION: Check cache first
    let result: CalculationEngineOutput | undefined =
      getCachedCalculation(input);
    let cacheHit = false;

    if (result) {
      cacheHit = true;
      console.log("⚡ Using cached calculation result");
    } else {
      // Execute calculation engine with timeout protection
      try {
        result = await calculateWithTimeout(input);
      } catch (error) {
        if (error instanceof CalculationTimeoutError) {
          console.error("⏱️ Calculation timeout:", error.message);
          return NextResponse.json(
            {
              error: "Calculation timed out",
              message:
                "The financial calculation took too long. Please try simplifying your inputs or try again later.",
            },
            { status: 504 },
          );
        }
        throw error; // Re-throw other errors
      }

      // Store result in cache for future requests
      setCachedCalculation(input, result);
    }

    // Log calculation success
    const endTime = performance.now();
    const calculationTimeMs = endTime - startTime;
    console.log(
      `✅ Calculation completed in ${calculationTimeMs.toFixed(2)}ms: ${result.periods.length} periods, ${result.validation.allPeriodsBalanced ? "balanced" : "UNBALANCED"}`,
    );

    // Log cache statistics
    const cacheStats = getCacheStats();
    console.log(
      `📊 Cache stats: ${cacheStats.hits} hits, ${cacheStats.misses} misses, hit rate: ${cacheStats.hitRatePercent}`,
    );

    // Serialize Decimal values to strings for JSON response
    const serializedResult = serializeCalculationOutput(result);

    // Save proposal to database
    console.log("💾 Saving proposal to database...");
    // Fetch TransitionConfig to record audit timestamp
    const transitionConfig = await prisma.transitionConfig.findFirst();

    const proposal = await prisma.leaseProposal.create({
      data: {
        name: proposalData.name,
        rentModel: proposalData.rentModel,
        developer: proposalData.developer,
        createdBy: user.id,
        contractPeriodYears: input.contractPeriodYears, // FIX: Save contract period
        enrollment: proposalData.enrollment as any,
        curriculum: proposalData.curriculum as any,
        staff: proposalData.staff as any,
        rentParams: proposalData.rentParams as any,
        otherOpexPercent: new Decimal(proposalData.otherOpexPercent),
        financials: serializedResult.periods as any,
        metrics: serializedResult.metrics as any,
        calculatedAt: new Date(),
        transitionConfigUpdatedAt: transitionConfig?.updatedAt || new Date(),
      },
    });

    console.log(`✅ Proposal saved with ID: ${proposal.id}`);

    return NextResponse.json(
      {
        success: true,
        id: proposal.id,
        data: serializedResult,
        meta: {
          calculationTimeMs,
          periodsCalculated: result.periods.length,
          allBalanced: result.validation.allPeriodsBalanced,
          allReconciled: result.validation.allCashFlowsReconciled,
          cacheHit,
          cacheStats: getCacheStats(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Calculation failed:", error);

    if (
      error instanceof Error &&
      error.message.includes("Invalid enrollment config")
    ) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: error.message,
        },
        { status: 400 },
      );
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    // Handle calculation errors
    return NextResponse.json(
      {
        error: "Calculation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Serialize CalculationEngineOutput for JSON response
 * Converts all Decimal.js values to strings
 */
type SerializedCalculationOutput = {
  periods: Array<
    Omit<
      CalculationEngineOutput["periods"][number],
      "profitLoss" | "balanceSheet" | "cashFlow"
    > & {
      profitLoss: Record<string, unknown>;
      balanceSheet: Record<string, unknown>;
      cashFlow: Record<string, unknown>;
    }
  >;
  metrics: Record<string, unknown>;
  validation: Record<string, unknown>;
  performance: CalculationEngineOutput["performance"];
  calculatedAt: string;
};

function serializeCalculationOutput(
  output: CalculationEngineOutput,
): SerializedCalculationOutput {
  return {
    periods: output.periods.map((period) => ({
      ...period,
      profitLoss: serializeObject(period.profitLoss) as Record<string, unknown>,
      balanceSheet: serializeObject(period.balanceSheet) as Record<
        string,
        unknown
      >,
      cashFlow: serializeObject(period.cashFlow) as Record<string, unknown>,
    })),
    metrics: serializeObject(output.metrics) as Record<string, unknown>,
    validation: serializeObject(output.validation) as Record<string, unknown>,
    performance: output.performance,
    calculatedAt: output.calculatedAt.toISOString(),
  };
}

/**
 * Recursively serialize object, converting Decimal to string
 * Uses a simple, aggressive approach to catch all Decimal objects
 */
function serializeObject(obj: unknown): unknown {
  // Handle primitives
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  // Handle Decimal instances
  if (obj instanceof Decimal) {
    return obj.toString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeObject);
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle objects with Decimal-like structure (has s, e, d properties)
  // This catches Decimal objects that aren't instanceof Decimal (different context/version)
  if (
    typeof obj === "object" &&
    "s" in obj &&
    "e" in obj &&
    "d" in obj &&
    Array.isArray((obj as { d: unknown }).d)
  ) {
    // This is a Decimal-like object, convert to Decimal then to string
    try {
      return new Decimal(obj as Decimal.Value).toString();
    } catch {
      // If conversion fails, try toString
      if (typeof (obj as { toString?: () => string }).toString === "function") {
        return (obj as { toString: () => string }).toString();
      }
      return String(obj);
    }
  }

  // Handle plain objects
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip functions and non-enumerable properties
    if (typeof value === "function") continue;
    if (key === "constructor") continue; // Skip constructor property
    result[key] = serializeObject(value);
  }
  return result;
}
