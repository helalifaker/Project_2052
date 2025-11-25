import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import type {
  CalculationEngineInput,
  RentModel,
} from "@/lib/engine/core/types";

type ProposalRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.leaseProposal.findUnique>>
>;

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
 * Reconstruct CalculationEngineInput from stored proposal data.
 * Shared helper for scenarios/sensitivity endpoints to avoid code duplication.
 */
export async function reconstructCalculationInput(
  proposal: ProposalRecord,
): Promise<CalculationEngineInput> {
  const systemConfig = await prisma.systemConfig.findFirst({
    orderBy: { confirmedAt: "desc" },
  });
  if (!systemConfig) throw new Error("System configuration not found");

  const historicalData = await prisma.historicalData.findMany({
    where: { confirmed: true },
    orderBy: { year: "asc" },
  });
  if (historicalData.length === 0) throw new Error("Historical data not found");

  const workingCapitalRatios = await prisma.workingCapitalRatios.findFirst({
    orderBy: { calculatedFrom2024: "desc" },
  });
  if (!workingCapitalRatios)
    throw new Error("Working capital ratios not found");

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

    if (
      record.statementType === "PROFIT_LOSS" ||
      record.statementType === "PL"
    ) {
      historicalByYear[record.year].pl[record.lineItem] = record.amount;
    } else if (
      record.statementType === "BALANCE_SHEET" ||
      record.statementType === "BS"
    ) {
      historicalByYear[record.year].bs[record.lineItem] = record.amount;
    }
  }

  const historicalPeriods = Object.values(historicalByYear).map((yearData) => ({
    year: yearData.year,
    profitLoss: {
      revenue: new Decimal(yearData.pl.revenue || 0),
      rent: new Decimal(yearData.pl.rent || 0),
      staffCosts: new Decimal(yearData.pl.staffCosts || 0),
      otherOpex: new Decimal(yearData.pl.otherOpex || 0),
      depreciation: new Decimal(yearData.pl.depreciation || 0),
      interest: new Decimal(yearData.pl.interest || 0),
      zakat: new Decimal(yearData.pl.zakat || 0),
    },
    balanceSheet: {
      cash: new Decimal(yearData.bs.cash || 0),
      accountsReceivable: new Decimal(yearData.bs.accountsReceivable || 0),
      prepaidExpenses: new Decimal(yearData.bs.prepaidExpenses || 0),
      ppe: new Decimal(yearData.bs.ppe || 0),
      accumulatedDepreciation: new Decimal(
        yearData.bs.accumulatedDepreciation || 0,
      ),
      accountsPayable: new Decimal(yearData.bs.accountsPayable || 0),
      accruedExpenses: new Decimal(yearData.bs.accruedExpenses || 0),
      deferredRevenue: new Decimal(yearData.bs.deferredRevenue || 0),
      debt: new Decimal(yearData.bs.debt || 0),
      equity: new Decimal(yearData.bs.equity || 0),
    },
    immutable: true,
  }));

  const input: CalculationEngineInput = {
    systemConfig: {
      zakatRate: new Decimal(systemConfig.zakatRate),
      debtInterestRate: new Decimal(systemConfig.debtInterestRate),
      depositInterestRate: new Decimal(systemConfig.depositInterestRate),
      minCashBalance: new Decimal(systemConfig.minCashBalance),
    },
    historicalPeriods,
    transitionPeriods: JSON.parse(JSON.stringify(proposal.transition)),
    dynamicPeriodConfig: {
      year: 2028,
      enrollment: JSON.parse(JSON.stringify(proposal.enrollment)),
      curriculum: JSON.parse(JSON.stringify(proposal.curriculum)),
      staff: JSON.parse(JSON.stringify(proposal.staff)),
      rentModel: proposal.rentModel as RentModel,
      rentParams: JSON.parse(JSON.stringify(proposal.rentParams)),
      otherOpex: new Decimal(proposal.otherOpex),
      capexConfig: {
        autoReinvestEnabled: false,
        existingAssets: [],
        newAssets: [],
      },
    },
    rentModel: proposal.rentModel as RentModel,
    rentParams: JSON.parse(JSON.stringify(proposal.rentParams)),
    capexConfig: {
      autoReinvestEnabled: false,
      existingAssets: [],
      newAssets: [],
    },
    workingCapitalRatios: {
      arPercent: new Decimal(workingCapitalRatios.arPercent),
      prepaidPercent: new Decimal(workingCapitalRatios.prepaidPercent),
      apPercent: new Decimal(workingCapitalRatios.apPercent),
      accruedPercent: new Decimal(workingCapitalRatios.accruedPercent),
      deferredRevenuePercent: new Decimal(
        workingCapitalRatios.deferredRevenuePercent,
      ),
      otherRevenueRatio: new Decimal(0.1),
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
 * Recursively reconstruct Decimal values in an object
 */
export function reconstructDecimalsInObject(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;

  const record = obj as Record<string, unknown>;

  for (const key in record) {
    const value = record[key];

    if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) {
      if (
        key.includes("Rate") ||
        key.includes("Percent") ||
        key.includes("Fee") ||
        key.includes("Cost") ||
        key.includes("Opex") ||
        key.includes("Rent") ||
        key.includes("Amount") ||
        key.includes("Balance") ||
        key.includes("Escalation")
      ) {
        try {
          record[key] = new Decimal(value);
        } catch {
          // Keep as string
        }
      }
    } else if (typeof value === "number") {
      if (
        key.includes("Rate") ||
        key.includes("Percent") ||
        key.includes("Fee") ||
        key.includes("Cost") ||
        key.includes("Opex") ||
        key.includes("Rent") ||
        key.includes("Amount") ||
        key.includes("Balance") ||
        key.includes("Escalation")
      ) {
        record[key] = new Decimal(value);
      }
    } else if (typeof value === "object" && value !== null) {
      reconstructDecimalsInObject(value);
    }
  }
}

export { toNumber };
export type { ProposalRecord };
