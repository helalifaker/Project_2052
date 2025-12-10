import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import type {
  CalculationEngineInput,
  RentModel,
  FixedRentParams,
  RevenueShareParams,
  PartnerInvestmentParams,
  CapExConfiguration,
  TransitionPeriodInput,
} from "@/lib/engine/core/types";
import { CapExCategoryType } from "@/lib/engine/core/types";
import { mapHistoricalPeriod } from "@/lib/historical/line-item-mapper";

export type ProposalRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.leaseProposal.findUnique>>
>;

/**
 * Custom error class for configuration-related errors during calculation input reconstruction.
 * Provides structured error information for better API responses.
 */
export class CalculationConfigError extends Error {
  public readonly code: string;
  public readonly configType: string;
  public readonly userMessage: string;

  constructor(code: string, configType: string, message: string) {
    super(message);
    this.name = "CalculationConfigError";
    this.code = code;
    this.configType = configType;
    this.userMessage = message;
  }
}

type RentParams =
  | FixedRentParams
  | RevenueShareParams
  | PartnerInvestmentParams;

/**
 * Transform rent params from stored format to engine format.
 * Handles legacy field names (partnerLandSize → landSize, etc.)
 */
function transformRentParams(
  rentModel: RentModel,
  storedParams: unknown,
): RentParams {
  const params = JSON.parse(JSON.stringify(storedParams)) as Record<
    string,
    unknown
  >;

  // Helper to get value, preferring legacy field if new field is 0
  const getVal = (newField: string, legacyField: string): number => {
    const newVal = Number(params[newField] ?? 0);
    const legacyVal = Number(params[legacyField] ?? 0);
    // Prefer legacy field if new field is 0 but legacy has a value
    return newVal === 0 && legacyVal !== 0 ? legacyVal : newVal;
  };

  if (rentModel === "PARTNER_INVESTMENT") {
    // Map legacy partner prefix fields to engine format
    const landSize = getVal("landSize", "partnerLandSize");
    const landPricePerSqm = getVal("landPricePerSqm", "partnerLandPricePerSqm");
    const buaSize = getVal("buaSize", "partnerBuaSize");
    const constructionCostPerSqm = getVal(
      "constructionCostPerSqm",
      "partnerConstructionCostPerSqm",
    );

    // Yield and growth rates: legacy fields are stored as whole numbers (8 = 8%), need to divide by 100
    const yieldRateRaw = getVal("yieldRate", "partnerYieldRate");
    const growthRateRaw = getVal("growthRate", "partnerGrowthRate");

    // If using legacy fields (value > 1), convert from percentage
    const yieldRate = yieldRateRaw > 1 ? yieldRateRaw / 100 : yieldRateRaw;
    const growthRate = growthRateRaw > 1 ? growthRateRaw / 100 : growthRateRaw;

    // Prefer partnerFrequency (UI field name) over frequency (engine field name)
    // This handles the case where both exist in stored data
    const frequency = Number(params.partnerFrequency ?? params.frequency ?? 1);

    return {
      landSize: new Decimal(landSize),
      landPricePerSqm: new Decimal(landPricePerSqm),
      buaSize: new Decimal(buaSize),
      constructionCostPerSqm: new Decimal(constructionCostPerSqm),
      yieldRate: new Decimal(yieldRate),
      growthRate: new Decimal(growthRate),
      frequency,
    };
  }

  if (rentModel === "FIXED_ESCALATION") {
    return {
      baseRent: new Decimal(Number(params.baseRent ?? 0)),
      growthRate: new Decimal(Number(params.growthRate ?? 0)),
      frequency: Number(params.frequency ?? 1),
    };
  }

  if (rentModel === "REVENUE_SHARE") {
    return {
      revenueSharePercent: new Decimal(Number(params.revenueSharePercent ?? 0)),
    };
  }

  // Default to fixed escalation params if unknown model
  return {
    baseRent: new Decimal(Number(params.baseRent ?? 0)),
    growthRate: new Decimal(Number(params.growthRate ?? 0)),
    frequency: Number(params.frequency ?? 1),
  };
}

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && value && "toString" in value) {
    const parsed = Number((value as { toString: () => string }).toString());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/**
 * Historical period data structure needed for building CAPEX configuration.
 * Only year and balanceSheet/profitLoss fields are required.
 */
export interface HistoricalPeriodForCapex {
  year: number;
  profitLoss: {
    depreciation: Decimal;
  };
  balanceSheet: {
    grossPPE: Decimal;
    accumulatedDepreciation: Decimal;
  };
}

/**
 * Build CAPEX configuration from database and historical data.
 *
 * This function is exported for use by both:
 * - reconstructCalculationInput (for recalculation)
 * - /api/proposals/calculate (for initial calculation)
 *
 * @param historicalPeriods Array of historical periods (needs 2024 data for depreciation state)
 * @returns Complete CapExConfiguration with categories, historical state, and virtual assets
 */
export async function buildCapexConfig(
  historicalPeriods: HistoricalPeriodForCapex[],
): Promise<CapExConfiguration> {
  const year2024 = historicalPeriods.find((p) => p.year === 2024);
  const virtualAssets: CapExConfiguration["virtualAssets"] = [];

  // Create historical depreciation state based on 2024 actuals
  let historicalState: CapExConfiguration["historicalState"] = {
    grossPPE2024: new Decimal(0),
    accumulatedDepreciation2024: new Decimal(0),
    annualDepreciation: new Decimal(0),
    remainingToDepreciate: new Decimal(0),
  };

  if (year2024) {
    const grossPPE = year2024.balanceSheet.grossPPE;
    const accumulatedDep = year2024.balanceSheet.accumulatedDepreciation;
    const annualDepreciation = year2024.profitLoss.depreciation;
    const netBookValue = grossPPE.minus(accumulatedDep);

    historicalState = {
      grossPPE2024: grossPPE,
      accumulatedDepreciation2024: accumulatedDep,
      annualDepreciation: annualDepreciation,
      remainingToDepreciate: netBookValue.greaterThan(0)
        ? netBookValue
        : new Decimal(0),
    };
  }

  // Fetch CAPEX categories from database (global configuration)
  const dbCategories = await prisma.capExCategory.findMany({
    orderBy: { type: "asc" },
  });

  // Transform DB categories to engine format
  const categories = dbCategories.map((cat) => ({
    id: cat.id,
    type: cat.type as unknown as CapExCategoryType,
    name: cat.name,
    usefulLife: cat.usefulLife,
    reinvestFrequency: cat.reinvestFrequency ?? undefined,
    reinvestAmount: cat.reinvestAmount
      ? new Decimal(cat.reinvestAmount)
      : undefined,
    reinvestStartYear: cat.reinvestStartYear ?? undefined,
  }));

  // Fetch ALL global manual CAPEX items (2025+)
  const dbManualItems = await prisma.capExAsset.findMany({
    where: {
      proposalId: null, // Global items only
      purchaseYear: { gte: 2025 },
    },
    include: { category: true },
    orderBy: { purchaseYear: "asc" },
  });

  // Split manual items into transition (2025-2027) and dynamic (2028+) periods
  const dbTransitionItems = dbManualItems.filter(
    (item) => item.purchaseYear >= 2025 && item.purchaseYear <= 2027,
  );
  const dbDynamicItems = dbManualItems.filter(
    (item) => item.purchaseYear >= 2028,
  );

  // Transform transition items to engine format
  const transitionCapex = dbTransitionItems.map((item) => ({
    categoryType: item.category.type as unknown as CapExCategoryType,
    year: item.purchaseYear,
    amount: new Decimal(item.purchaseAmount),
  }));

  // Add dynamic period manual items as virtual assets (for depreciation)
  for (const item of dbDynamicItems) {
    virtualAssets.push({
      id: `manual-${item.id}`,
      categoryType: item.category.type as unknown as CapExCategoryType,
      purchaseYear: item.purchaseYear,
      purchaseAmount: new Decimal(item.purchaseAmount),
      usefulLife: item.usefulLife,
    });
  }

  return {
    categories,
    historicalState,
    transitionCapex,
    virtualAssets,
  };
}

/**
 * Transform staff config from stored format to engine format
 * Ensures all Decimal fields are proper Decimal instances
 */
function transformStaffConfig(storedStaff: unknown): Record<string, unknown> {
  const staff = JSON.parse(JSON.stringify(storedStaff)) as Record<
    string,
    unknown
  >;

  // Convert salary fields to Decimal
  if (staff.avgTeacherSalary !== undefined) {
    staff.avgTeacherSalary = new Decimal(toNumber(staff.avgTeacherSalary));
  }
  if (staff.avgAdminSalary !== undefined) {
    staff.avgAdminSalary = new Decimal(toNumber(staff.avgAdminSalary));
  }

  // Convert CPI rate to Decimal
  if (staff.cpiRate !== undefined) {
    staff.cpiRate = new Decimal(toNumber(staff.cpiRate));
  }

  // Convert fixed/variable costs to Decimal
  if (staff.fixedStaffCost !== undefined) {
    staff.fixedStaffCost = new Decimal(toNumber(staff.fixedStaffCost));
  }
  if (staff.variableStaffCostPerStudent !== undefined) {
    staff.variableStaffCostPerStudent = new Decimal(
      toNumber(staff.variableStaffCostPerStudent),
    );
  }

  return staff;
}

/**
 * Fetch global TransitionConfig and convert to TransitionPeriodInput format.
 * All proposals now use the same global transition configuration (2025-2027).
 */
async function fetchTransitionPeriods(): Promise<TransitionPeriodInput[]> {
  const config = await prisma.transitionConfig.findFirst();

  if (!config) {
    throw new CalculationConfigError(
      "TRANSITION_CONFIG_MISSING",
      "TransitionConfig",
      "Transition configuration not found. Please configure 2025-2027 assumptions in Admin > Transition Setup.",
    );
  }

  // Convert global config to TransitionPeriodInput array for years 2025-2027
  return [
    {
      year: 2025,
      preFillFromPriorYear: false,
      numberOfStudents: config.year2025Students,
      averageTuitionPerStudent: new Decimal(config.year2025AvgTuition),
      rentGrowthPercent: new Decimal(config.rentGrowthPercent),
    },
    {
      year: 2026,
      preFillFromPriorYear: false,
      numberOfStudents: config.year2026Students,
      averageTuitionPerStudent: new Decimal(config.year2026AvgTuition),
      rentGrowthPercent: new Decimal(config.rentGrowthPercent),
    },
    {
      year: 2027,
      preFillFromPriorYear: false,
      numberOfStudents: config.year2027Students,
      averageTuitionPerStudent: new Decimal(config.year2027AvgTuition),
      rentGrowthPercent: new Decimal(config.rentGrowthPercent),
    },
  ];
}

/**
 * Reconstruct CalculationEngineInput from stored proposal data.
 * Shared helper for scenarios/sensitivity endpoints to avoid code duplication.
 */
export async function reconstructCalculationInput(
  proposal: ProposalRecord & {
    assets?: unknown[];
    contractPeriodYears?: number | null;
  },
): Promise<CalculationEngineInput> {
  // RELIABILITY: All database calls are wrapped with specific error messages
  // These errors provide actionable guidance to users and better debugging context
  const systemConfig = await prisma.systemConfig.findFirst({
    orderBy: { confirmedAt: "desc" },
  });
  if (!systemConfig) {
    throw new CalculationConfigError(
      "SYSTEM_CONFIG_MISSING",
      "SystemConfig",
      "System configuration not found. Please configure system settings in Admin > System Config.",
    );
  }

  const historicalData = await prisma.historicalData.findMany({
    where: { confirmed: true },
    orderBy: { year: "asc" },
  });
  if (historicalData.length === 0) {
    throw new CalculationConfigError(
      "HISTORICAL_DATA_MISSING",
      "HistoricalData",
      "No confirmed historical data found. Please upload and confirm historical financial data in Admin > Historical Data.",
    );
  }

  const workingCapitalRatios = await prisma.workingCapitalRatios.findFirst({
    orderBy: { calculatedFrom2024: "desc" },
  });
  if (!workingCapitalRatios) {
    throw new CalculationConfigError(
      "WORKING_CAPITAL_MISSING",
      "WorkingCapitalRatios",
      "Working capital ratios not found. Please configure working capital ratios in Admin > Working Capital.",
    );
  }

  // Group historical data by year and statement type
  // Using the ORIGINAL line item names from the database
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
      historicalByYear[record.year] = { year: record.year, pl: {}, bs: {} };
    }

    // Store with ORIGINAL line item names (descriptive)
    // e.g., "Tuition French Cur.", "Salaries and Related Costs", etc.
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

  // Use the line item mapper to convert descriptive names to engine format
  const historicalPeriods = Object.values(historicalByYear).map((yearData) => {
    // Map using the line item mapper which handles:
    // - Descriptive names → programmatic names
    // - Negative expense values → positive
    // - Multiple revenue items → combined tuition + other
    // - Gross PPE - Acc Dep → Net PPE
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
        accumulatedDepreciation: mapped.balanceSheet.accumulatedDepreciation,
        accountsPayable: mapped.balanceSheet.accountsPayable,
        accruedExpenses: mapped.balanceSheet.accruedExpenses,
        deferredRevenue: mapped.balanceSheet.deferredRevenue,
        debt: mapped.balanceSheet.debt,
        equity: mapped.balanceSheet.equity,
      },
      immutable: true,
    };
  });

  // Build capexConfig using the exported shared function
  // This ensures consistency between initial calculation and recalculation
  const capexConfig = await buildCapexConfig(historicalPeriods);

  // Fetch global transition config (all proposals use same config)
  const transitionPeriods = await fetchTransitionPeriods();

  const input: CalculationEngineInput = {
    systemConfig: {
      zakatRate: new Decimal(systemConfig.zakatRate),
      debtInterestRate: new Decimal(systemConfig.debtInterestRate),
      depositInterestRate: new Decimal(systemConfig.depositInterestRate),
      discountRate: systemConfig.discountRate
        ? new Decimal(systemConfig.discountRate)
        : undefined,
      minCashBalance: new Decimal(systemConfig.minCashBalance),
    },
    contractPeriodYears: (proposal.contractPeriodYears ?? 30) as 25 | 30, // Default to 30 for legacy proposals
    historicalPeriods,
    transitionPeriods,
    dynamicPeriodConfig: {
      year: 2028,
      enrollment: JSON.parse(JSON.stringify(proposal.enrollment)),
      curriculum: (() => {
        const c = JSON.parse(JSON.stringify(proposal.curriculum)) as Record<
          string,
          unknown
        >;

        // Map wizard field names to engine field names (if wizard names are present)
        // This handles data saved from wizard vs data saved from detail page

        // National/French curriculum fee
        if (!c.nationalCurriculumFee && c.frenchBaseTuition2028) {
          c.nationalCurriculumFee = new Decimal(
            toNumber(c.frenchBaseTuition2028),
          );
        } else if (c.nationalCurriculumFee) {
          c.nationalCurriculumFee = new Decimal(
            toNumber(c.nationalCurriculumFee),
          );
        }

        // IB curriculum fee
        if (!c.ibCurriculumFee && c.ibBaseTuition2028) {
          c.ibCurriculumFee = new Decimal(toNumber(c.ibBaseTuition2028));
        } else if (c.ibCurriculumFee) {
          c.ibCurriculumFee = new Decimal(toNumber(c.ibCurriculumFee));
        }

        // National/French tuition growth rate
        if (
          !c.nationalTuitionGrowthRate &&
          c.frenchTuitionGrowthRate !== undefined
        ) {
          c.nationalTuitionGrowthRate = new Decimal(
            toNumber(c.frenchTuitionGrowthRate),
          );
        } else if (c.nationalTuitionGrowthRate !== undefined) {
          c.nationalTuitionGrowthRate = new Decimal(
            toNumber(c.nationalTuitionGrowthRate),
          );
        }

        // National/French tuition growth frequency
        if (
          !c.nationalTuitionGrowthFrequency &&
          c.frenchTuitionGrowthFrequency !== undefined
        ) {
          c.nationalTuitionGrowthFrequency = toNumber(
            c.frenchTuitionGrowthFrequency,
          );
        }

        // IB tuition growth rate
        if (c.ibTuitionGrowthRate !== undefined) {
          c.ibTuitionGrowthRate = new Decimal(toNumber(c.ibTuitionGrowthRate));
        }

        // IB tuition growth frequency (already in correct format)

        // IB student percentage
        if (!c.ibStudentPercentage && c.ibProgramPercentage !== undefined) {
          c.ibStudentPercentage = new Decimal(toNumber(c.ibProgramPercentage));
        } else if (c.ibStudentPercentage !== undefined) {
          c.ibStudentPercentage = new Decimal(toNumber(c.ibStudentPercentage));
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return c as any;
      })(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      staff: transformStaffConfig(proposal.staff) as any,
      rentModel: proposal.rentModel as RentModel,
      rentParams: transformRentParams(
        proposal.rentModel as RentModel,
        proposal.rentParams,
      ),
      otherOpexPercent: new Decimal(proposal.otherOpexPercent),
      capexConfig, // Use the shared capexConfig
    },
    rentModel: proposal.rentModel as RentModel,
    rentParams: transformRentParams(
      proposal.rentModel as RentModel,
      proposal.rentParams,
    ),
    capexConfig, // Use the same shared capexConfig at root level
    workingCapitalRatios: {
      arPercent: new Decimal(workingCapitalRatios.arPercent),
      prepaidPercent: new Decimal(workingCapitalRatios.prepaidPercent),
      apPercent: new Decimal(workingCapitalRatios.apPercent),
      accruedPercent: new Decimal(workingCapitalRatios.accruedPercent),
      deferredRevenuePercent: new Decimal(
        workingCapitalRatios.deferredRevenuePercent,
      ),
      // Calculate otherRevenueRatio from 2024 historical data
      // Formula: Other Revenue 2024 / Tuition Revenue 2024
      otherRevenueRatio: (() => {
        const year2024 = historicalPeriods.find((p) => p.year === 2024);
        if (year2024 && year2024.profitLoss.tuitionRevenue.greaterThan(0)) {
          return year2024.profitLoss.otherRevenue.dividedBy(
            year2024.profitLoss.tuitionRevenue,
          );
        }
        return new Decimal(0);
      })(),
      locked: workingCapitalRatios.locked,
      calculatedFrom2024: true,
    },
    circularSolverConfig: {
      maxIterations: 100,
      convergenceTolerance: new Decimal(0.01),
      relaxationFactor: new Decimal(0.5),
    },
  };

  reconstructDecimalsInObject(input);
  return input;
}

/**
 * Check if a field name should be converted to Decimal
 */
function shouldBeDecimal(key: string): boolean {
  const decimalPatterns = [
    "Rate",
    "Percent",
    "Fee",
    "Cost",
    "Opex",
    "Rent",
    "Amount",
    "Balance",
    "Interest",
    "Escalation",
    "Share",
    "Ratio",
    "Size",
    "Sqm",
    "Yield",
    "Salary",
    "Revenue",
    "Income",
    "Expense",
    "Price",
    "Value",
    "Tuition",
    "percentage",
    "baseRent",
    "growthRate",
    "revenueSharePercent",
    "yieldRate",
    "Tolerance",
    "Factor",
    // Balance sheet fields
    "cash",
    "ppe",
    "equity",
    "debt",
    "depreciation",
    "Receivable",
    "Payable",
    // P&L fields
    "zakat",
  ];
  return decimalPatterns.some(
    (pattern) =>
      key.includes(pattern) ||
      key.toLowerCase().includes(pattern.toLowerCase()),
  );
}

/**
 * Recursively reconstruct Decimal values in an object
 */
export function reconstructDecimalsInObject(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;

  // Handle arrays
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === "object" && item !== null) {
        reconstructDecimalsInObject(item);
      }
    }
    return;
  }

  const record = obj as Record<string, unknown>;

  for (const key in record) {
    const value = record[key];

    if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) {
      if (shouldBeDecimal(key)) {
        try {
          record[key] = new Decimal(value);
        } catch {
          // Keep as string
        }
      }
    } else if (typeof value === "number") {
      if (shouldBeDecimal(key)) {
        record[key] = new Decimal(value);
      }
    } else if (typeof value === "object" && value !== null) {
      reconstructDecimalsInObject(value);
    }
  }
}

export { toNumber };
