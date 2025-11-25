/**
 * VALIDATION ERROR TESTS
 *
 * Tests for validation failure scenarios to improve branch coverage.
 * These tests intentionally create invalid financial statements to ensure
 * error handling branches are covered.
 */

import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import {
  generateProfitLossStatement,
  validateProfitLossStatement,
  type ProfitLossStatement,
} from "./profit-loss";
import {
  generateBalanceSheet,
  validateBalanceSheet,
  type BalanceSheet,
} from "./balance-sheet";
import {
  generateCashFlowStatement,
  validateCashFlowStatement,
  type CashFlowStatement,
} from "./cash-flow";
import {
  validateFinancialPeriod,
  validatePeriodLinkage,
  type FinancialPeriod,
} from "./validators";
import { PeriodType } from "../core/types";
import { ZERO } from "../core/constants";

describe("Profit & Loss - Validation Failures", () => {
  it("should fail validation when Zakat is incorrect", () => {
    // Generate a valid P&L first
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(1000000),
      otherRevenue: new Decimal(0),
      rentExpense: new Decimal(100000),
      staffCosts: new Decimal(200000),
      otherOpex: new Decimal(100000),
      depreciation: new Decimal(50000),
      interestExpense: new Decimal(25000),
      interestIncome: new Decimal(0),
    });

    // Corrupt the Zakat value
    const invalidPL: ProfitLossStatement = {
      ...pl,
      zakatExpense: new Decimal(99999), // Wrong value
    };

    const isValid = validateProfitLossStatement(invalidPL);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Net Income is incorrect", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(1000000),
      otherRevenue: new Decimal(0),
      rentExpense: new Decimal(100000),
      staffCosts: new Decimal(200000),
      otherOpex: new Decimal(100000),
      depreciation: new Decimal(50000),
      interestExpense: new Decimal(25000),
      interestIncome: new Decimal(0),
    });

    // Corrupt the Net Income value
    const invalidPL: ProfitLossStatement = {
      ...pl,
      netIncome: new Decimal(88888), // Wrong value
    };

    const isValid = validateProfitLossStatement(invalidPL);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Total Revenue is incorrect", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(1000000),
      otherRevenue: new Decimal(100000),
      rentExpense: new Decimal(100000),
      staffCosts: new Decimal(200000),
      otherOpex: new Decimal(100000),
      depreciation: new Decimal(50000),
      interestExpense: new Decimal(25000),
      interestIncome: new Decimal(0),
    });

    // Corrupt the Total Revenue value
    const invalidPL: ProfitLossStatement = {
      ...pl,
      totalRevenue: new Decimal(99999), // Wrong value, should be 1,100,000
    };

    const isValid = validateProfitLossStatement(invalidPL);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Total OpEx is incorrect", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(1000000),
      otherRevenue: new Decimal(0),
      rentExpense: new Decimal(100000),
      staffCosts: new Decimal(200000),
      otherOpex: new Decimal(100000),
      depreciation: new Decimal(50000),
      interestExpense: new Decimal(25000),
      interestIncome: new Decimal(0),
    });

    // Corrupt the Total OpEx value
    const invalidPL: ProfitLossStatement = {
      ...pl,
      totalOpex: new Decimal(99999), // Wrong value, should be 400,000
    };

    const isValid = validateProfitLossStatement(invalidPL);
    expect(isValid).toBe(false);
  });

  it("should fail validation when EBITDA is incorrect", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(1000000),
      otherRevenue: new Decimal(0),
      rentExpense: new Decimal(100000),
      staffCosts: new Decimal(200000),
      otherOpex: new Decimal(100000),
      depreciation: new Decimal(50000),
      interestExpense: new Decimal(25000),
      interestIncome: new Decimal(0),
    });

    // Corrupt the EBITDA value
    const invalidPL: ProfitLossStatement = {
      ...pl,
      ebitda: new Decimal(99999), // Wrong value
    };

    const isValid = validateProfitLossStatement(invalidPL);
    expect(isValid).toBe(false);
  });

  it("should fail validation when EBIT is incorrect", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(1000000),
      otherRevenue: new Decimal(0),
      rentExpense: new Decimal(100000),
      staffCosts: new Decimal(200000),
      otherOpex: new Decimal(100000),
      depreciation: new Decimal(50000),
      interestExpense: new Decimal(25000),
      interestIncome: new Decimal(0),
    });

    // Corrupt the EBIT value
    const invalidPL: ProfitLossStatement = {
      ...pl,
      ebit: new Decimal(99999), // Wrong value
    };

    const isValid = validateProfitLossStatement(invalidPL);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Net Interest is incorrect", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(1000000),
      otherRevenue: new Decimal(0),
      rentExpense: new Decimal(100000),
      staffCosts: new Decimal(200000),
      otherOpex: new Decimal(100000),
      depreciation: new Decimal(50000),
      interestExpense: new Decimal(25000),
      interestIncome: new Decimal(5000),
    });

    // Corrupt the Net Interest value
    const invalidPL: ProfitLossStatement = {
      ...pl,
      netInterest: new Decimal(99999), // Wrong value, should be 20,000
    };

    const isValid = validateProfitLossStatement(invalidPL);
    expect(isValid).toBe(false);
  });

  it("should fail validation when EBT is incorrect", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(1000000),
      otherRevenue: new Decimal(0),
      rentExpense: new Decimal(100000),
      staffCosts: new Decimal(200000),
      otherOpex: new Decimal(100000),
      depreciation: new Decimal(50000),
      interestExpense: new Decimal(25000),
      interestIncome: new Decimal(0),
    });

    // Corrupt the EBT value
    const invalidPL: ProfitLossStatement = {
      ...pl,
      ebt: new Decimal(99999), // Wrong value
    };

    const isValid = validateProfitLossStatement(invalidPL);
    expect(isValid).toBe(false);
  });
});

describe("Balance Sheet - Validation Failures", () => {
  it("should fail validation when Assets ≠ Liabilities + Equity", () => {
    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: new Decimal(1000000),
        accountsReceivable: new Decimal(500000),
        prepaidExpenses: new Decimal(100000),
        propertyPlantEquipment: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(2000000),
        accountsPayable: new Decimal(300000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(100000),
        debtBalance: new Decimal(4000000),
        retainedEarnings: new Decimal(3000000),
        netIncomeCurrentYear: new Decimal(1000000),
      },
      { useDebtPlug: false },
    );

    // Corrupt the total assets to create imbalance
    const invalidBS: BalanceSheet = {
      ...bs,
      totalAssets: new Decimal(99999999), // Wrong value
      balanceDifference: new Decimal(50000000), // Large difference
    };

    const isValid = validateBalanceSheet(invalidBS);
    expect(isValid).toBe(false);
  });

  it("should fail validation when balance difference exceeds tolerance", () => {
    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: new Decimal(1000000),
        accountsReceivable: new Decimal(500000),
        prepaidExpenses: new Decimal(100000),
        propertyPlantEquipment: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(2000000),
        accountsPayable: new Decimal(300000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(100000),
        debtBalance: new Decimal(4000000),
        retainedEarnings: new Decimal(3000000),
        netIncomeCurrentYear: new Decimal(1000000),
      },
      { useDebtPlug: false },
    );

    // Set a non-zero balance difference
    const invalidBS: BalanceSheet = {
      ...bs,
      balanceDifference: new Decimal(1000), // Non-zero difference
    };

    const isValid = validateBalanceSheet(invalidBS);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Total Current Assets is incorrect", () => {
    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: new Decimal(1000000),
        accountsReceivable: new Decimal(500000),
        prepaidExpenses: new Decimal(100000),
        propertyPlantEquipment: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(2000000),
        accountsPayable: new Decimal(300000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(100000),
        retainedEarnings: new Decimal(3000000),
        netIncomeCurrentYear: new Decimal(1000000),
      },
      { useDebtPlug: true },
    );

    // Corrupt the Total Current Assets value
    const invalidBS: BalanceSheet = {
      ...bs,
      totalCurrentAssets: new Decimal(99999), // Wrong value, should be 1,600,000
    };

    const isValid = validateBalanceSheet(invalidBS);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Total Non-Current Assets is incorrect", () => {
    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: new Decimal(1000000),
        accountsReceivable: new Decimal(500000),
        prepaidExpenses: new Decimal(100000),
        propertyPlantEquipment: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(2000000),
        accountsPayable: new Decimal(300000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(100000),
        retainedEarnings: new Decimal(3000000),
        netIncomeCurrentYear: new Decimal(1000000),
      },
      { useDebtPlug: true },
    );

    // Corrupt the Total Non-Current Assets value
    const invalidBS: BalanceSheet = {
      ...bs,
      totalNonCurrentAssets: new Decimal(99999), // Wrong value, should be 8,000,000
    };

    const isValid = validateBalanceSheet(invalidBS);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Total Current Liabilities is incorrect", () => {
    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: new Decimal(1000000),
        accountsReceivable: new Decimal(500000),
        prepaidExpenses: new Decimal(100000),
        propertyPlantEquipment: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(2000000),
        accountsPayable: new Decimal(300000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(100000),
        retainedEarnings: new Decimal(3000000),
        netIncomeCurrentYear: new Decimal(1000000),
      },
      { useDebtPlug: true },
    );

    // Corrupt the Total Current Liabilities value
    const invalidBS: BalanceSheet = {
      ...bs,
      totalCurrentLiabilities: new Decimal(99999), // Wrong value, should be 600,000
    };

    const isValid = validateBalanceSheet(invalidBS);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Total Non-Current Liabilities is incorrect", () => {
    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: new Decimal(1000000),
        accountsReceivable: new Decimal(500000),
        prepaidExpenses: new Decimal(100000),
        propertyPlantEquipment: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(2000000),
        accountsPayable: new Decimal(300000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(100000),
        retainedEarnings: new Decimal(3000000),
        netIncomeCurrentYear: new Decimal(1000000),
      },
      { useDebtPlug: true },
    );

    // Corrupt the Total Non-Current Liabilities value
    const invalidBS: BalanceSheet = {
      ...bs,
      totalNonCurrentLiabilities: new Decimal(99999), // Wrong value
    };

    const isValid = validateBalanceSheet(invalidBS);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Total Liabilities is incorrect", () => {
    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: new Decimal(1000000),
        accountsReceivable: new Decimal(500000),
        prepaidExpenses: new Decimal(100000),
        propertyPlantEquipment: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(2000000),
        accountsPayable: new Decimal(300000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(100000),
        retainedEarnings: new Decimal(3000000),
        netIncomeCurrentYear: new Decimal(1000000),
      },
      { useDebtPlug: true },
    );

    // Corrupt the Total Liabilities value
    const invalidBS: BalanceSheet = {
      ...bs,
      totalLiabilities: new Decimal(99999), // Wrong value
    };

    const isValid = validateBalanceSheet(invalidBS);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Total Equity is incorrect", () => {
    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: new Decimal(1000000),
        accountsReceivable: new Decimal(500000),
        prepaidExpenses: new Decimal(100000),
        propertyPlantEquipment: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(2000000),
        accountsPayable: new Decimal(300000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(100000),
        retainedEarnings: new Decimal(3000000),
        netIncomeCurrentYear: new Decimal(1000000),
      },
      { useDebtPlug: true },
    );

    // Corrupt the Total Equity value
    const invalidBS: BalanceSheet = {
      ...bs,
      totalEquity: new Decimal(99999), // Wrong value, should be 4,000,000
    };

    const isValid = validateBalanceSheet(invalidBS);
    expect(isValid).toBe(false);
  });
});

describe("Cash Flow - Validation Failures", () => {
  it("should fail validation when Net Change in Cash is incorrect", () => {
    const cf = generateCashFlowStatement({
      year: 2025,
      netIncome: new Decimal(1000000),
      depreciation: new Decimal(400000),
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(20000),
      capex: new Decimal(-500000),
      debtIssuance: new Decimal(200000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(1500000),
    });

    // Corrupt the net change in cash
    const invalidCF: CashFlowStatement = {
      ...cf,
      netChangeInCash: new Decimal(777777), // Wrong value
    };

    const isValid = validateCashFlowStatement(invalidCF);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Ending Cash is incorrect", () => {
    const cf = generateCashFlowStatement({
      year: 2025,
      netIncome: new Decimal(1000000),
      depreciation: new Decimal(400000),
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(20000),
      capex: new Decimal(-500000),
      debtIssuance: new Decimal(200000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(1500000),
    });

    // Corrupt the ending cash
    const invalidCF: CashFlowStatement = {
      ...cf,
      endingCash: new Decimal(555555), // Wrong value
    };

    const isValid = validateCashFlowStatement(invalidCF);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Cash Flow from Operations (CFO) is incorrect", () => {
    const cf = generateCashFlowStatement({
      year: 2025,
      netIncome: new Decimal(1000000),
      depreciation: new Decimal(400000),
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(20000),
      capex: new Decimal(-500000),
      debtIssuance: new Decimal(200000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(1500000),
    });

    // Corrupt the CFO value
    const invalidCF: CashFlowStatement = {
      ...cf,
      cashFlowFromOperations: new Decimal(888888), // Wrong value
    };

    const isValid = validateCashFlowStatement(invalidCF);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Cash Flow from Investing (CFI) is incorrect", () => {
    const cf = generateCashFlowStatement({
      year: 2025,
      netIncome: new Decimal(1000000),
      depreciation: new Decimal(400000),
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(20000),
      capex: new Decimal(-500000),
      debtIssuance: new Decimal(200000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(1500000),
    });

    // Corrupt the CFI value
    const invalidCF: CashFlowStatement = {
      ...cf,
      cashFlowFromInvesting: new Decimal(777777), // Wrong value, should be -500000
    };

    const isValid = validateCashFlowStatement(invalidCF);
    expect(isValid).toBe(false);
  });

  it("should fail validation when Cash Flow from Financing (CFF) is incorrect", () => {
    const cf = generateCashFlowStatement({
      year: 2025,
      netIncome: new Decimal(1000000),
      depreciation: new Decimal(400000),
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(20000),
      capex: new Decimal(-500000),
      debtIssuance: new Decimal(200000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(1500000),
    });

    // Corrupt the CFF value
    const invalidCF: CashFlowStatement = {
      ...cf,
      cashFlowFromFinancing: new Decimal(666666), // Wrong value, should be 200000
    };

    const isValid = validateCashFlowStatement(invalidCF);
    expect(isValid).toBe(false);
  });
});

describe("Period Linkage - Validation Failures", () => {
  it("should detect broken Retained Earnings continuity", () => {
    // Create a valid prior period
    const pl2024 = generateProfitLossStatement({
      year: 2024,
      tuitionRevenue: new Decimal(5000000),
      otherRevenue: new Decimal(250000),
      rentExpense: new Decimal(1000000),
      staffCosts: new Decimal(2500000),
      otherOpex: new Decimal(500000),
      depreciation: new Decimal(400000),
      interestExpense: new Decimal(100000),
      interestIncome: new Decimal(25000),
    });

    const cf2024 = generateCashFlowStatement({
      year: 2024,
      netIncome: pl2024.netIncome,
      depreciation: pl2024.depreciation,
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(40000),
      capex: new Decimal(-1000000),
      debtIssuance: new Decimal(500000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(2000000),
    });

    const bs2024 = generateBalanceSheet(
      {
        year: 2024,
        cash: cf2024.endingCash,
        accountsReceivable: new Decimal(1000000),
        prepaidExpenses: new Decimal(200000),
        propertyPlantEquipment: new Decimal(15000000),
        accumulatedDepreciation: new Decimal(3000000),
        accountsPayable: new Decimal(500000),
        accruedExpenses: new Decimal(300000),
        deferredRevenue: new Decimal(400000),
        retainedEarnings: new Decimal(5000000),
        netIncomeCurrentYear: pl2024.netIncome,
      },
      { useDebtPlug: true },
    );

    const priorPeriod: FinancialPeriod = {
      year: 2024,
      periodType: PeriodType.HISTORICAL,
      profitLoss: pl2024,
      balanceSheet: bs2024,
      cashFlow: { ...cf2024, cashReconciliationDiff: ZERO },
      calculatedAt: new Date(),
      converged: true,
      balanceSheetBalanced: true,
      cashFlowReconciled: true,
    };

    // Create current period with BROKEN retained earnings linkage
    const pl2025 = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(5500000),
      otherRevenue: new Decimal(275000),
      rentExpense: new Decimal(1100000),
      staffCosts: new Decimal(2750000),
      otherOpex: new Decimal(550000),
      depreciation: new Decimal(450000),
      interestExpense: new Decimal(110000),
      interestIncome: new Decimal(30000),
    });

    const cf2025 = generateCashFlowStatement({
      year: 2025,
      netIncome: pl2025.netIncome,
      depreciation: pl2025.depreciation,
      changeInAR: new Decimal(110000),
      changeInPrepaid: new Decimal(28000),
      changeInAP: new Decimal(55000),
      changeInAccrued: new Decimal(33000),
      changeInDeferredRevenue: new Decimal(44000),
      capex: new Decimal(-1100000),
      debtIssuance: new Decimal(550000),
      debtRepayment: new Decimal(0),
      beginningCash: bs2024.cash,
    });

    const bs2025 = generateBalanceSheet(
      {
        year: 2025,
        cash: cf2025.endingCash,
        accountsReceivable: new Decimal(1100000),
        prepaidExpenses: new Decimal(220000),
        propertyPlantEquipment: new Decimal(16000000),
        accumulatedDepreciation: new Decimal(3450000),
        accountsPayable: new Decimal(550000),
        accruedExpenses: new Decimal(330000),
        deferredRevenue: new Decimal(440000),
        retainedEarnings: new Decimal(9999999), // WRONG! Should link to prior period's total equity
        netIncomeCurrentYear: pl2025.netIncome,
      },
      { useDebtPlug: true },
    );

    const currentPeriod: FinancialPeriod = {
      year: 2025,
      periodType: PeriodType.TRANSITION,
      profitLoss: pl2025,
      balanceSheet: bs2025,
      cashFlow: { ...cf2025, cashReconciliationDiff: ZERO },
      calculatedAt: new Date(),
      converged: true,
      balanceSheetBalanced: true,
      cashFlowReconciled: true,
    };

    const result = validatePeriodLinkage(priorPeriod, currentPeriod);

    // Should detect the broken retained earnings continuity
    expect(result.retainedEarningsContinuity).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should detect PP&E continuity warning when accumulated depreciation decreases", () => {
    // Create prior period
    const pl2024 = generateProfitLossStatement({
      year: 2024,
      tuitionRevenue: new Decimal(5000000),
      otherRevenue: new Decimal(250000),
      rentExpense: new Decimal(1000000),
      staffCosts: new Decimal(2500000),
      otherOpex: new Decimal(500000),
      depreciation: new Decimal(400000),
      interestExpense: new Decimal(100000),
      interestIncome: new Decimal(25000),
    });

    const cf2024 = generateCashFlowStatement({
      year: 2024,
      netIncome: pl2024.netIncome,
      depreciation: pl2024.depreciation,
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(40000),
      capex: new Decimal(-1000000),
      debtIssuance: new Decimal(500000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(2000000),
    });

    const bs2024 = generateBalanceSheet(
      {
        year: 2024,
        cash: cf2024.endingCash,
        accountsReceivable: new Decimal(1000000),
        prepaidExpenses: new Decimal(200000),
        propertyPlantEquipment: new Decimal(15000000),
        accumulatedDepreciation: new Decimal(5000000), // High accumulated depreciation
        accountsPayable: new Decimal(500000),
        accruedExpenses: new Decimal(300000),
        deferredRevenue: new Decimal(400000),
        retainedEarnings: new Decimal(5000000),
        netIncomeCurrentYear: pl2024.netIncome,
      },
      { useDebtPlug: true },
    );

    const priorPeriod: FinancialPeriod = {
      year: 2024,
      periodType: PeriodType.HISTORICAL,
      profitLoss: pl2024,
      balanceSheet: bs2024,
      cashFlow: { ...cf2024, cashReconciliationDiff: ZERO },
      calculatedAt: new Date(),
      converged: true,
      balanceSheetBalanced: true,
      cashFlowReconciled: true,
    };

    // Create current period with DECREASED accumulated depreciation (invalid!)
    const pl2025 = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(5500000),
      otherRevenue: new Decimal(275000),
      rentExpense: new Decimal(1100000),
      staffCosts: new Decimal(2750000),
      otherOpex: new Decimal(550000),
      depreciation: new Decimal(450000),
      interestExpense: new Decimal(110000),
      interestIncome: new Decimal(30000),
    });

    const cf2025 = generateCashFlowStatement({
      year: 2025,
      netIncome: pl2025.netIncome,
      depreciation: pl2025.depreciation,
      changeInAR: new Decimal(110000),
      changeInPrepaid: new Decimal(28000),
      changeInAP: new Decimal(55000),
      changeInAccrued: new Decimal(33000),
      changeInDeferredRevenue: new Decimal(44000),
      capex: new Decimal(-1100000),
      debtIssuance: new Decimal(550000),
      debtRepayment: new Decimal(0),
      beginningCash: bs2024.cash,
    });

    const bs2025 = generateBalanceSheet(
      {
        year: 2025,
        cash: cf2025.endingCash,
        accountsReceivable: new Decimal(1100000),
        prepaidExpenses: new Decimal(220000),
        propertyPlantEquipment: new Decimal(16000000),
        accumulatedDepreciation: new Decimal(2000000), // DECREASED! Should be >= 5M
        accountsPayable: new Decimal(550000),
        accruedExpenses: new Decimal(330000),
        deferredRevenue: new Decimal(440000),
        retainedEarnings: bs2024.totalEquity,
        netIncomeCurrentYear: pl2025.netIncome,
      },
      { useDebtPlug: true },
    );

    const currentPeriod: FinancialPeriod = {
      year: 2025,
      periodType: PeriodType.TRANSITION,
      profitLoss: pl2025,
      balanceSheet: bs2025,
      cashFlow: { ...cf2025, cashReconciliationDiff: ZERO },
      calculatedAt: new Date(),
      converged: true,
      balanceSheetBalanced: true,
      cashFlowReconciled: true,
    };

    const result = validatePeriodLinkage(priorPeriod, currentPeriod);

    // Should detect the PP&E continuity warning
    expect(result.ppeContinuity).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(
      result.errors.some((e) => e.includes("PP&E continuity warning")),
    ).toBe(true);
  });

  it("should detect broken cash continuity", () => {
    // Create prior period
    const pl2024 = generateProfitLossStatement({
      year: 2024,
      tuitionRevenue: new Decimal(5000000),
      otherRevenue: new Decimal(250000),
      rentExpense: new Decimal(1000000),
      staffCosts: new Decimal(2500000),
      otherOpex: new Decimal(500000),
      depreciation: new Decimal(400000),
      interestExpense: new Decimal(100000),
      interestIncome: new Decimal(25000),
    });

    const cf2024 = generateCashFlowStatement({
      year: 2024,
      netIncome: pl2024.netIncome,
      depreciation: pl2024.depreciation,
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(40000),
      capex: new Decimal(-1000000),
      debtIssuance: new Decimal(500000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(2000000),
    });

    const bs2024 = generateBalanceSheet(
      {
        year: 2024,
        cash: cf2024.endingCash,
        accountsReceivable: new Decimal(1000000),
        prepaidExpenses: new Decimal(200000),
        propertyPlantEquipment: new Decimal(15000000),
        accumulatedDepreciation: new Decimal(3000000),
        accountsPayable: new Decimal(500000),
        accruedExpenses: new Decimal(300000),
        deferredRevenue: new Decimal(400000),
        retainedEarnings: new Decimal(5000000),
        netIncomeCurrentYear: pl2024.netIncome,
      },
      { useDebtPlug: true },
    );

    const priorPeriod: FinancialPeriod = {
      year: 2024,
      periodType: PeriodType.HISTORICAL,
      profitLoss: pl2024,
      balanceSheet: bs2024,
      cashFlow: { ...cf2024, cashReconciliationDiff: ZERO },
      calculatedAt: new Date(),
      converged: true,
      balanceSheetBalanced: true,
      cashFlowReconciled: true,
    };

    // Create current period with BROKEN cash continuity
    const pl2025 = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(5500000),
      otherRevenue: new Decimal(275000),
      rentExpense: new Decimal(1100000),
      staffCosts: new Decimal(2750000),
      otherOpex: new Decimal(550000),
      depreciation: new Decimal(450000),
      interestExpense: new Decimal(110000),
      interestIncome: new Decimal(30000),
    });

    const cf2025 = generateCashFlowStatement({
      year: 2025,
      netIncome: pl2025.netIncome,
      depreciation: pl2025.depreciation,
      changeInAR: new Decimal(110000),
      changeInPrepaid: new Decimal(28000),
      changeInAP: new Decimal(55000),
      changeInAccrued: new Decimal(33000),
      changeInDeferredRevenue: new Decimal(44000),
      capex: new Decimal(-1100000),
      debtIssuance: new Decimal(550000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(999999), // WRONG! Should be bs2024.cash
    });

    const bs2025 = generateBalanceSheet(
      {
        year: 2025,
        cash: cf2025.endingCash,
        accountsReceivable: new Decimal(1100000),
        prepaidExpenses: new Decimal(220000),
        propertyPlantEquipment: new Decimal(16000000),
        accumulatedDepreciation: new Decimal(3450000),
        accountsPayable: new Decimal(550000),
        accruedExpenses: new Decimal(330000),
        deferredRevenue: new Decimal(440000),
        retainedEarnings: bs2024.totalEquity,
        netIncomeCurrentYear: pl2025.netIncome,
      },
      { useDebtPlug: true },
    );

    const currentPeriod: FinancialPeriod = {
      year: 2025,
      periodType: PeriodType.TRANSITION,
      profitLoss: pl2025,
      balanceSheet: bs2025,
      cashFlow: { ...cf2025, cashReconciliationDiff: ZERO },
      calculatedAt: new Date(),
      converged: true,
      balanceSheetBalanced: true,
      cashFlowReconciled: true,
    };

    const result = validatePeriodLinkage(priorPeriod, currentPeriod);

    // Should detect broken cash continuity
    expect(result.cashContinuity).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("Cash continuity"))).toBe(true);
  });
});

describe("Financial Period - Validation Warnings", () => {
  it("should produce warning when cashFlowReconciled flag is false", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(5000000),
      otherRevenue: new Decimal(250000),
      rentExpense: new Decimal(1000000),
      staffCosts: new Decimal(2500000),
      otherOpex: new Decimal(500000),
      depreciation: new Decimal(400000),
      interestExpense: new Decimal(100000),
      interestIncome: new Decimal(25000),
    });

    const cf = generateCashFlowStatement({
      year: 2025,
      netIncome: pl.netIncome,
      depreciation: pl.depreciation,
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(40000),
      capex: new Decimal(-1000000),
      debtIssuance: new Decimal(500000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(2000000),
    });

    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: cf.endingCash,
        accountsReceivable: new Decimal(1000000),
        prepaidExpenses: new Decimal(200000),
        propertyPlantEquipment: new Decimal(15000000),
        accumulatedDepreciation: new Decimal(3000000),
        accountsPayable: new Decimal(500000),
        accruedExpenses: new Decimal(300000),
        deferredRevenue: new Decimal(400000),
        retainedEarnings: new Decimal(5000000),
        netIncomeCurrentYear: pl.netIncome,
      },
      { useDebtPlug: true },
    );

    const period: FinancialPeriod = {
      year: 2025,
      periodType: PeriodType.TRANSITION,
      profitLoss: pl,
      balanceSheet: bs,
      cashFlow: { ...cf, cashReconciliationDiff: ZERO },
      calculatedAt: new Date(),
      converged: true,
      balanceSheetBalanced: true,
      cashFlowReconciled: false, // Set to false to trigger warning
    };

    const result = validateFinancialPeriod(period);

    // Should have warnings about cashFlowReconciled flag
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(
      result.warnings.some((w) =>
        w.includes("Cash Flow reconciled flag is false"),
      ),
    ).toBe(true);
  });

  it("should produce warning when converged flag is false", () => {
    const pl = generateProfitLossStatement({
      year: 2025,
      tuitionRevenue: new Decimal(5000000),
      otherRevenue: new Decimal(250000),
      rentExpense: new Decimal(1000000),
      staffCosts: new Decimal(2500000),
      otherOpex: new Decimal(500000),
      depreciation: new Decimal(400000),
      interestExpense: new Decimal(100000),
      interestIncome: new Decimal(25000),
    });

    const cf = generateCashFlowStatement({
      year: 2025,
      netIncome: pl.netIncome,
      depreciation: pl.depreciation,
      changeInAR: new Decimal(100000),
      changeInPrepaid: new Decimal(25000),
      changeInAP: new Decimal(50000),
      changeInAccrued: new Decimal(30000),
      changeInDeferredRevenue: new Decimal(40000),
      capex: new Decimal(-1000000),
      debtIssuance: new Decimal(500000),
      debtRepayment: new Decimal(0),
      beginningCash: new Decimal(2000000),
    });

    const bs = generateBalanceSheet(
      {
        year: 2025,
        cash: cf.endingCash,
        accountsReceivable: new Decimal(1000000),
        prepaidExpenses: new Decimal(200000),
        propertyPlantEquipment: new Decimal(15000000),
        accumulatedDepreciation: new Decimal(3000000),
        accountsPayable: new Decimal(500000),
        accruedExpenses: new Decimal(300000),
        deferredRevenue: new Decimal(400000),
        retainedEarnings: new Decimal(5000000),
        netIncomeCurrentYear: pl.netIncome,
      },
      { useDebtPlug: true },
    );

    const period: FinancialPeriod = {
      year: 2025,
      periodType: PeriodType.TRANSITION,
      profitLoss: pl,
      balanceSheet: bs,
      cashFlow: { ...cf, cashReconciliationDiff: ZERO },
      calculatedAt: new Date(),
      converged: false, // Set to false to trigger warning
      balanceSheetBalanced: true,
      cashFlowReconciled: true,
    };

    const result = validateFinancialPeriod(period);

    // Should have warnings about converged flag
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("did not converge"))).toBe(
      true,
    );
  });
});
