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

import { NextResponse } from "next/server";
import { z } from "zod";
import Decimal from "decimal.js";
import { calculateFinancialProjections } from "@/lib/engine";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
  FixedRentParams,
  RevenueShareParams,
  PartnerInvestmentParams,
} from "@/lib/engine/core/types";
import { RentModel } from "@/lib/engine/core/types";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getCachedCalculation,
  setCachedCalculation,
  getCacheStats,
} from "@/lib/cache/calculation-cache";

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for Decimal.js values
 * Accepts string or number, converts to Decimal
 */
const DecimalSchema = z
  .union([z.string(), z.number()])
  .refine(
    (val) => {
      try {
        new Decimal(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid decimal value" },
  )
  .transform((val) => new Decimal(val));

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
  rent: DecimalSchema,
  staffCosts: DecimalSchema,
  otherOpex: DecimalSchema,
  depreciation: DecimalSchema,
  interest: DecimalSchema,
  zakat: DecimalSchema,
});

/**
 * Historical Period Balance Sheet Schema
 */
const HistoricalBSSchema = z.object({
  cash: DecimalSchema,
  accountsReceivable: DecimalSchema,
  prepaidExpenses: DecimalSchema,
  ppe: DecimalSchema,
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
const CapExConfigSchema = z.object({
  autoReinvestEnabled: z.boolean(),
  reinvestAmount: DecimalSchema,
  reinvestFrequency: z.number().int().positive(),
  existingAssets: z.array(z.unknown()), // Simplified
  newAssets: z.array(z.unknown()), // Simplified
});

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
  otherOpex: DecimalSchema,
  otherOpexPercent: DecimalSchema.optional(),
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
  otherOpex: number;
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

      // Historical periods (required) - fetch minimal placeholders if missing
      const historicalPeriods = body.historicalPeriods || [
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

      // Build transition periods from admin config when available, otherwise wizard inputs
      const transitionInputs = {
        year2025Students:
          transitionConfig?.year2025Students ??
          body.transition?.year2025?.students ??
          body.transition2025Students,
        year2025AvgTuition:
          transitionConfig?.year2025AvgTuition?.toNumber() ??
          body.transition?.year2025?.avgTuition ??
          body.transition2025AvgTuition,
        year2026Students:
          transitionConfig?.year2026Students ??
          body.transition?.year2026?.students ??
          body.transition2026Students,
        year2026AvgTuition:
          transitionConfig?.year2026AvgTuition?.toNumber() ??
          body.transition?.year2026?.avgTuition ??
          body.transition2026AvgTuition,
        year2027Students:
          transitionConfig?.year2027Students ??
          body.transition?.year2027?.students ??
          body.transition2027Students,
        year2027AvgTuition:
          transitionConfig?.year2027AvgTuition?.toNumber() ??
          body.transition?.year2027?.avgTuition ??
          body.transition2027AvgTuition,
        rentGrowthPercent:
          transitionConfig?.rentGrowthPercent ??
          (body.transition?.rentGrowthPercent
            ? new Decimal(body.transition.rentGrowthPercent).div(100)
            : undefined),
      };

      const makeTransition = (
        year: number,
        students?: number,
        tuition?: number,
      ) => ({
        year,
        preFillFromPriorYear: false,
        numberOfStudents: students,
        averageTuitionPerStudent:
          tuition !== undefined ? new Decimal(tuition) : undefined,
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
        (body.enrollment?.rampUpFRYear1Percentage ??
          body.rampUpFRYear1Percentage ??
          20) / 100,
        (body.enrollment?.rampUpFRYear2Percentage ??
          body.rampUpFRYear2Percentage ??
          40) / 100,
        (body.enrollment?.rampUpFRYear3Percentage ??
          body.rampUpFRYear3Percentage ??
          60) / 100,
        (body.enrollment?.rampUpFRYear4Percentage ??
          body.rampUpFRYear4Percentage ??
          80) / 100,
        (body.enrollment?.rampUpFRYear5Percentage ??
          body.rampUpFRYear5Percentage ??
          100) / 100,
      ];

      const ibRampPercents = [
        (body.enrollment?.rampUpIBYear1Percentage ??
          body.rampUpIBYear1Percentage ??
          0) / 100,
        (body.enrollment?.rampUpIBYear2Percentage ??
          body.rampUpIBYear2Percentage ??
          0) / 100,
        (body.enrollment?.rampUpIBYear3Percentage ??
          body.rampUpIBYear3Percentage ??
          0) / 100,
        (body.enrollment?.rampUpIBYear4Percentage ??
          body.rampUpIBYear4Percentage ??
          0) / 100,
        (body.enrollment?.rampUpIBYear5Percentage ??
          body.rampUpIBYear5Percentage ??
          0) / 100,
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
          ? new Decimal(body.staff.cpiRate).div(100)
          : body.cpiRate
            ? new Decimal(body.cpiRate).div(100)
            : undefined,
        cpiFrequency: body.staff?.cpiFrequency ?? body.cpiFrequency,
      };

      const otherOpexPercent =
        body.otherOpexPercent ??
        body.staff?.otherOpexPercent ??
        body.opexPercent ??
        10;

      // Rent params per model
      let rentParams:
        | FixedRentParams
        | RevenueShareParams
        | PartnerInvestmentParams;
      if (body.rentModel === "Fixed") {
        rentParams = {
          baseRent: new Decimal(body.baseRent ?? 0),
          growthRate: new Decimal(body.rentGrowthRate ?? 0).div(100),
          frequency: body.rentFrequency ?? 1,
        };
      } else if (body.rentModel === "RevShare") {
        rentParams = {
          revenueSharePercent: new Decimal(body.revenueSharePercent ?? 0).div(
            100,
          ),
        };
      } else {
        rentParams = {
          landSize: new Decimal(body.partnerLandSize ?? 0),
          landPricePerSqm: new Decimal(body.partnerLandPricePerSqm ?? 0),
          buaSize: new Decimal(body.partnerBuaSize ?? 0),
          constructionCostPerSqm: new Decimal(
            body.partnerConstructionCostPerSqm ?? 0,
          ),
          yieldRate: new Decimal(body.partnerYieldRate ?? 0).div(100),
          growthRate: new Decimal(body.partnerGrowthRate ?? 0).div(100),
          frequency: body.partnerFrequency ?? 1,
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
              ? new Decimal(frenchTuitionGrowthRate).div(100)
              : undefined,
          nationalTuitionGrowthFrequency: frenchTuitionGrowthFrequency,
          ibTuitionGrowthRate:
            ibTuitionGrowthRate !== undefined
              ? new Decimal(ibTuitionGrowthRate).div(100)
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
        otherOpex: new Decimal(0),
        otherOpexPercent: new Decimal(otherOpexPercent).div(100),
        capexConfig: {
          autoReinvestEnabled: false,
          reinvestAmount: new Decimal(0),
          reinvestFrequency: 1,
          existingAssets: [],
          newAssets: [],
        },
      };

      const input: CalculationEngineInput = {
        systemConfig: {
          zakatRate: new Decimal(sysConfig.zakatRate),
          debtInterestRate: new Decimal(sysConfig.debtInterestRate),
          depositInterestRate: new Decimal(sysConfig.depositInterestRate),
          minCashBalance: new Decimal(sysConfig.minCashBalance),
        },
        historicalPeriods,
        transitionPeriods,
        workingCapitalRatios: {
          arPercent: new Decimal(wc.arPercent),
          prepaidPercent: new Decimal(wc.prepaidPercent),
          apPercent: new Decimal(wc.apPercent),
          accruedPercent: new Decimal(wc.accruedPercent),
          deferredRevenuePercent: new Decimal(wc.deferredRevenuePercent),
          otherRevenueRatio: new Decimal(0.1), // Default: 10% of tuition (Section 1.3 of Financial Rules)
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
          autoReinvestEnabled: false,
          reinvestAmount: new Decimal(0),
          reinvestFrequency: 1,
          existingAssets: [],
          newAssets: [],
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
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const input = validationResult.data as CalculationEngineInput;

    // Extract proposal data for saving
    // If wizard format, use wizard data; otherwise extract from engine input
    const proposalData: ProposalPayload = {
      name: body.name || `Proposal ${new Date().toISOString().split("T")[0]}`,
      developer: body.developer,
      rentModel: input.rentModel,
      transition: input.transitionPeriods,
      enrollment: input.dynamicPeriodConfig.enrollment,
      curriculum: input.dynamicPeriodConfig.curriculum,
      staff: input.dynamicPeriodConfig.staff,
      rentParams: input.rentParams,
      otherOpex: input.dynamicPeriodConfig.otherOpex.toNumber(),
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
      // Execute calculation engine
      result = await calculateFinancialProjections(input);

      // Store result in cache for future requests
      setCachedCalculation(input, result);
    }

    // Log calculation success
    const calculationTimeMs = performance.now() - startTime;
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
    const proposal = await prisma.leaseProposal.create({
      data: {
        name: proposalData.name,
        rentModel: proposalData.rentModel,
        developer: proposalData.developer,
        createdBy: user.id,
        transition: proposalData.transition as unknown as Prisma.InputJsonValue,
        enrollment: proposalData.enrollment as unknown as Prisma.InputJsonValue,
        curriculum: proposalData.curriculum as unknown as Prisma.InputJsonValue,
        staff: proposalData.staff as unknown as Prisma.InputJsonValue,
        rentParams: proposalData.rentParams as unknown as Prisma.InputJsonValue,
        otherOpex: new Decimal(proposalData.otherOpex),
        financials:
          serializedResult.periods as unknown as Prisma.InputJsonValue,
        metrics: serializedResult.metrics as unknown as Prisma.InputJsonValue,
        calculatedAt: new Date(),
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
 */
function serializeObject(obj: unknown): unknown {
  if (obj instanceof Decimal) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeObject(value);
    }
    return serialized;
  }

  return obj;
}
