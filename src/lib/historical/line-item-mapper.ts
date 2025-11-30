/**
 * Historical Data Line Item Mapper
 *
 * Maps descriptive line item names from the database to the programmatic names
 * expected by the calculation engine.
 *
 * Database stores items like "Tuition French Cur." but engine expects "revenue"
 */

import Decimal from "decimal.js";
import { ZERO } from "@/lib/engine/core/constants";
import { add, multiply } from "@/lib/engine/core/decimal-utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface LineItemMapping {
  target: string;
  transform?: "negate" | "abs";
}

export interface MappedProfitLoss {
  tuitionRevenueFR: Decimal;
  tuitionRevenueIB: Decimal;
  otherRevenue: Decimal;
  staffCosts: Decimal;
  rent: Decimal;
  otherOpex: Decimal;
  depreciation: Decimal;
  interestIncome: Decimal;
  interest: Decimal;
}

export interface MappedBalanceSheet {
  cash: Decimal;
  accountsReceivable: Decimal;
  prepaidExpenses: Decimal;
  ppeGross: Decimal;
  accumulatedDepreciation: Decimal;
  ppe: Decimal; // Calculated: ppeGross - accumulatedDepreciation
  accountsPayable: Decimal;
  accruedExpenses: Decimal;
  deferredRevenue: Decimal;
  debt: Decimal;
  equity: Decimal;
  retainedEarnings: Decimal;
  netResult: Decimal;
}

// ============================================================================
// MAPPING CONFIGURATIONS
// ============================================================================

/**
 * P&L line item mappings from database names to engine names
 */
export const PL_LINE_ITEM_MAP: Record<string, LineItemMapping> = {
  // Revenue items (stored as positive)
  "Tuition French Cur.": { target: "tuitionRevenueFR" },
  "Tuition IB": { target: "tuitionRevenueIB" },
  "Other Income": { target: "otherRevenue" },

  // Expense items (stored as NEGATIVE in database, need to negate to get positive)
  "Salaries and Related Costs": { target: "staffCosts", transform: "negate" },
  "School Rent": { target: "rent", transform: "negate" },
  "Others expenses": { target: "otherOpex", transform: "negate" },
  "Depreciation and Amortization": {
    target: "depreciation",
    transform: "negate",
  },

  // Interest items
  "Interest income": { target: "interestIncome" },
  "Interest expenses": { target: "interest", transform: "negate" },
};

/**
 * Balance Sheet line item mappings from database names to engine names
 */
export const BS_LINE_ITEM_MAP: Record<string, LineItemMapping> = {
  // Assets (stored as positive)
  "Cash on Hand and in Bank": { target: "cash" },
  "Accounts Receivable & others": { target: "accountsReceivable" },
  "Prepaid & Other Receivables": { target: "prepaidExpenses" },
  "Loans and Advances": { target: "prepaidExpenses" },
  "Tangible & Intangible Assets, Gross": { target: "ppeGross" },
  "Less: Acc. Dep. Amortization": {
    target: "accumulatedDepreciation",
    transform: "negate",
  },

  // Liabilities (stored as positive for liabilities)
  "Accounts Payable": { target: "accountsPayable" },
  "Deferred Income": { target: "deferredRevenue" },
  "Accrued Expenses": { target: "accruedExpenses" },
  Provisions: { target: "accruedExpenses" }, // Provisions mapped to accrued expenses
  debt: { target: "debt" },

  // Equity
  Equity: { target: "equity" },
  "Retain earning": { target: "retainedEarnings" },
  "Net Result": { target: "netResult" },
};

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Apply transform to a value based on mapping configuration
 */
function applyTransform(
  value: Decimal,
  transform?: "negate" | "abs"
): Decimal {
  if (!transform) return value;

  switch (transform) {
    case "negate":
      return multiply(value, new Decimal(-1));
    case "abs":
      return value.abs();
    default:
      return value;
  }
}

/**
 * Map P&L line items from database format to engine format
 *
 * @param plRecords Object with line item names as keys and Decimal values
 * @returns MappedProfitLoss with engine-compatible field names
 */
export function mapProfitLossLineItems(
  plRecords: Record<string, Decimal.Value>
): MappedProfitLoss {
  const result: Record<string, Decimal> = {
    tuitionRevenueFR: ZERO,
    tuitionRevenueIB: ZERO,
    otherRevenue: ZERO,
    staffCosts: ZERO,
    rent: ZERO,
    otherOpex: ZERO,
    depreciation: ZERO,
    interestIncome: ZERO,
    interest: ZERO,
  };

  for (const [lineItem, value] of Object.entries(plRecords)) {
    const mapping = PL_LINE_ITEM_MAP[lineItem];
    if (mapping) {
      const decimalValue = new Decimal(value);
      result[mapping.target] = applyTransform(decimalValue, mapping.transform);
    }
  }

  return result as unknown as MappedProfitLoss;
}

/**
 * Map Balance Sheet line items from database format to engine format
 *
 * @param bsRecords Object with line item names as keys and Decimal values
 * @returns MappedBalanceSheet with engine-compatible field names
 */
export function mapBalanceSheetLineItems(
  bsRecords: Record<string, Decimal.Value>
): MappedBalanceSheet {
  const result: Record<string, Decimal> = {
    cash: ZERO,
    accountsReceivable: ZERO,
    prepaidExpenses: ZERO, // Not in database, default to 0
    ppeGross: ZERO,
    accumulatedDepreciation: ZERO,
    ppe: ZERO,
    accountsPayable: ZERO,
    accruedExpenses: ZERO,
    deferredRevenue: ZERO,
    debt: ZERO, // Not in database, default to 0
    equity: ZERO,
    retainedEarnings: ZERO,
    netResult: ZERO,
  };

  for (const [lineItem, value] of Object.entries(bsRecords)) {
    const mapping = BS_LINE_ITEM_MAP[lineItem];
    if (mapping) {
      const decimalValue = new Decimal(value);
      const transformed = applyTransform(decimalValue, mapping.transform);
      // Some balance sheet fields (e.g., prepaid expenses) may appear multiple times
      // in the source data. Accumulate values instead of overwriting so the engine
      // sees the combined total.
      result[mapping.target] = add(result[mapping.target] ?? ZERO, transformed);
    }
  }

  // Calculate Net PP&E = Gross - Accumulated Depreciation
  result.ppe = add(result.ppeGross, multiply(result.accumulatedDepreciation, new Decimal(-1)));

  return result as unknown as MappedBalanceSheet;
}

/**
 * Convert mapped P&L to engine input format
 *
 * Combines French and IB tuition into single tuitionRevenue
 * Calculates net interest from income - expense
 */
export function toEngineProfitLossInput(mapped: MappedProfitLoss): {
  revenue: Decimal;
  tuitionRevenue: Decimal;
  otherRevenue: Decimal;
  rent: Decimal;
  staffCosts: Decimal;
  otherOpex: Decimal;
  depreciation: Decimal;
  interest: Decimal;
  interestIncome: Decimal;
  zakat: Decimal;
} {
  const tuitionRevenue = add(mapped.tuitionRevenueFR, mapped.tuitionRevenueIB);
  const totalRevenue = add(tuitionRevenue, mapped.otherRevenue);

  return {
    revenue: totalRevenue, // Legacy field for backward compatibility
    tuitionRevenue,
    otherRevenue: mapped.otherRevenue,
    rent: mapped.rent,
    staffCosts: mapped.staffCosts,
    otherOpex: mapped.otherOpex,
    depreciation: mapped.depreciation,
    interest: mapped.interest, // Interest expense
    interestIncome: mapped.interestIncome, // Interest income on deposits
    zakat: ZERO, // Not in historical data, calculated by engine
  };
}

/**
 * Convert mapped Balance Sheet to engine input format
 */
export function toEngineBalanceSheetInput(mapped: MappedBalanceSheet): {
  cash: Decimal;
  accountsReceivable: Decimal;
  prepaidExpenses: Decimal;
  grossPPE: Decimal;
  ppe: Decimal;
  accumulatedDepreciation: Decimal;
  accountsPayable: Decimal;
  accruedExpenses: Decimal;
  deferredRevenue: Decimal;
  debt: Decimal;
  equity: Decimal;
} {
  return {
    cash: mapped.cash,
    accountsReceivable: mapped.accountsReceivable,
    prepaidExpenses: mapped.prepaidExpenses,
    grossPPE: mapped.ppeGross, // Gross PP&E (total cost of assets)
    ppe: mapped.ppe, // Net PP&E (Gross - Accumulated Depreciation)
    accumulatedDepreciation: mapped.accumulatedDepreciation,
    accountsPayable: mapped.accountsPayable,
    accruedExpenses: mapped.accruedExpenses,
    deferredRevenue: mapped.deferredRevenue,
    debt: mapped.debt,
    equity: mapped.equity,
  };
}

/**
 * Full mapping pipeline: takes raw database records and returns engine-ready input
 */
export function mapHistoricalPeriod(
  plRecords: Record<string, Decimal.Value>,
  bsRecords: Record<string, Decimal.Value>,
  options?: { verbose?: boolean }
): {
  profitLoss: ReturnType<typeof toEngineProfitLossInput>;
  balanceSheet: ReturnType<typeof toEngineBalanceSheetInput>;
} {
  const verbose = options?.verbose ?? false;

  if (verbose) {
    console.log("📊 Mapping historical period data...");
    console.log("   P&L records:", Object.keys(plRecords).length);
    console.log("   BS records:", Object.keys(bsRecords).length);
  }

  const mappedPL = mapProfitLossLineItems(plRecords);
  const mappedBS = mapBalanceSheetLineItems(bsRecords);

  if (verbose) {
    console.log("   === MAPPED P&L ===");
    console.log(`   Tuition FR: ${mappedPL.tuitionRevenueFR.toFixed(2)}`);
    console.log(`   Tuition IB: ${mappedPL.tuitionRevenueIB.toFixed(2)}`);
    console.log(`   Other Revenue: ${mappedPL.otherRevenue.toFixed(2)}`);
    console.log(`   Staff Costs: ${mappedPL.staffCosts.toFixed(2)}`);
    console.log(`   Rent: ${mappedPL.rent.toFixed(2)}`);
    console.log(`   Other OpEx: ${mappedPL.otherOpex.toFixed(2)}`);
    console.log(`   Depreciation: ${mappedPL.depreciation.toFixed(2)}`);
    console.log("   === MAPPED BS ===");
    console.log(`   Cash: ${mappedBS.cash.toFixed(2)}`);
    console.log(`   AR: ${mappedBS.accountsReceivable.toFixed(2)}`);
    console.log(`   Prepaid: ${mappedBS.prepaidExpenses.toFixed(2)}`);
    console.log(`   PPE Gross: ${mappedBS.ppeGross.toFixed(2)}`);
    console.log(`   Acc Dep: ${mappedBS.accumulatedDepreciation.toFixed(2)}`);
    console.log(`   Net PPE: ${mappedBS.ppe.toFixed(2)}`);
    console.log(`   AP: ${mappedBS.accountsPayable.toFixed(2)}`);
    console.log(`   Accrued: ${mappedBS.accruedExpenses.toFixed(2)}`);
    console.log(`   Deferred Revenue: ${mappedBS.deferredRevenue.toFixed(2)}`);
    console.log(`   Equity: ${mappedBS.equity.toFixed(2)}`);
  }

  return {
    profitLoss: toEngineProfitLossInput(mappedPL),
    balanceSheet: toEngineBalanceSheetInput(mappedBS),
  };
}
