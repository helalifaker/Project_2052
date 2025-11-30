/**
 * Comparison Utility Functions
 *
 * Helper functions for comparing proposals and calculating comparison insights
 */

import Decimal from 'decimal.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProposalMetrics {
  id: string;
  name: string;
  developer: string | null;
  totalRent?: number;
  npv?: number;
  irr?: number;
  totalEbitda?: number;
  avgEbitda?: number;
  npvEbitda?: number;
  nav?: number;
  finalCash?: number;
  maxDebt?: number;
  peakDebt?: number;
  contractPeriodYears?: number;
}

export interface MetricRange {
  min: number;
  max: number;
  range: number;
  spreadPercent: number;
}

export interface MetricWinner {
  winnerId: string;
  winnerName: string;
  value: number;
}

export interface ComparisonInsights {
  npv: MetricRange & { winnerId: string; winnerName: string };
  rent: MetricRange & { winnerId: string; winnerName: string };
  npvEbitda: MetricRange & { winnerId: string; winnerName: string };
  nav: MetricRange & { winnerId: string; winnerName: string };
  finalCash: MetricRange & { winnerId: string; winnerName: string };
  maxDebt: { max: number; riskiestId: string; riskiestName: string };
}

export interface WaterfallSegment {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
  cumulative: number;
}

export interface ProfitabilityWaterfallData {
  proposalId: string;
  proposalName: string;
  segments: WaterfallSegment[];
  netIncome: number;
  isWinner: boolean;
}

export interface ProposalWithFinancials extends ProposalMetrics {
  financials: Array<{
    year: number;
    profitLoss: {
      totalRevenue: number;
      rentExpense: number;
      staffCosts: number;
      otherOpex: number;
      ebitda: number;
      depreciation: number;
      ebit: number;
      interestIncome: number;
      interestExpense: number;
      zakatExpense: number;
      netIncome: number;
    };
  }>;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate average annual costs accounting for contract period
 * Ensures fair comparison between proposals with different contract lengths
 */
export function calculateAverageAnnualCosts(
  totalCosts: number,
  contractPeriodYears: number
): number {
  if (contractPeriodYears <= 0) return 0;
  return totalCosts / contractPeriodYears;
}

/**
 * Find the winner for a specific metric across proposals
 * @param proposals - Array of proposals to compare
 * @param metric - Metric key to compare
 * @param direction - Whether higher or lower is better
 */
export function getMetricWinner(
  proposals: ProposalMetrics[],
  metric: keyof ProposalMetrics,
  direction: 'higher' | 'lower'
): MetricWinner {
  if (proposals.length === 0) {
    return { winnerId: '', winnerName: '', value: 0 };
  }

  let winner = proposals[0];

  for (const proposal of proposals) {
    const currentValue = proposal[metric];
    const winnerValue = winner[metric];

    // Skip if either value is undefined or null
    if (currentValue === undefined || currentValue === null) continue;
    if (winnerValue === undefined || winnerValue === null) {
      winner = proposal;
      continue;
    }

    // Compare based on direction
    if (direction === 'higher' && currentValue > winnerValue) {
      winner = proposal;
    } else if (direction === 'lower' && currentValue < winnerValue) {
      winner = proposal;
    }
  }

  return {
    winnerId: winner.id,
    winnerName: winner.name,
    value: (winner[metric] as number) ?? 0,
  };
}

/**
 * Calculate range and spread for a specific metric
 * @param proposals - Array of proposals to analyze
 * @param metric - Metric key to calculate range for
 */
export function calculateMetricRange(
  proposals: ProposalMetrics[],
  metric: keyof ProposalMetrics
): MetricRange {
  const values = proposals
    .map(p => p[metric])
    .filter((v): v is number => typeof v === 'number');

  if (values.length === 0) {
    return { min: 0, max: 0, range: 0, spreadPercent: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const spreadPercent = min !== 0 ? (range / Math.abs(min)) * 100 : 0;

  return { min, max, range, spreadPercent };
}

/**
 * Calculate comprehensive comparison insights across all metrics
 * @param proposals - Array of proposals to compare
 */
export function calculateComparisonInsights(
  proposals: ProposalMetrics[]
): ComparisonInsights {
  // NPV - higher is better
  const npvWinner = getMetricWinner(proposals, 'npv', 'higher');
  const npvRange = calculateMetricRange(proposals, 'npv');

  // Rent - lower is better
  const rentWinner = getMetricWinner(proposals, 'totalRent', 'lower');
  const rentRange = calculateMetricRange(proposals, 'totalRent');

  // NPV EBITDA - higher is better
  const npvEbitdaWinner = getMetricWinner(proposals, 'npvEbitda', 'higher');
  const npvEbitdaRange = calculateMetricRange(proposals, 'npvEbitda');

  // NAV (Net Annualized Value) - higher is better
  const navWinner = getMetricWinner(proposals, 'nav', 'higher');
  const navRange = calculateMetricRange(proposals, 'nav');

  // Final Cash - higher is better
  const finalCashWinner = getMetricWinner(proposals, 'finalCash', 'higher');
  const finalCashRange = calculateMetricRange(proposals, 'finalCash');

  // Max Debt - lowest risk (lower is better, but we track the highest for warning)
  const debtValues = proposals
    .map(p => ({ id: p.id, name: p.name, debt: p.maxDebt ?? p.peakDebt ?? 0 }))
    .filter(p => p.debt > 0);

  const riskiest = debtValues.length > 0
    ? debtValues.reduce((prev, curr) => curr.debt > prev.debt ? curr : prev)
    : { id: '', name: '', debt: 0 };

  return {
    npv: {
      ...npvRange,
      winnerId: npvWinner.winnerId,
      winnerName: npvWinner.winnerName,
    },
    rent: {
      ...rentRange,
      winnerId: rentWinner.winnerId,
      winnerName: rentWinner.winnerName,
    },
    npvEbitda: {
      ...npvEbitdaRange,
      winnerId: npvEbitdaWinner.winnerId,
      winnerName: npvEbitdaWinner.winnerName,
    },
    nav: {
      ...navRange,
      winnerId: navWinner.winnerId,
      winnerName: navWinner.winnerName,
    },
    finalCash: {
      ...finalCashRange,
      winnerId: finalCashWinner.winnerId,
      winnerName: finalCashWinner.winnerName,
    },
    maxDebt: {
      max: riskiest.debt,
      riskiestId: riskiest.id,
      riskiestName: riskiest.name,
    },
  };
}

/**
 * Extract profitability waterfall data from a proposal's financials
 * Creates waterfall segments showing average annual revenue → costs → net income breakdown
 */
export function extractProfitabilityWaterfall(
  proposal: ProposalWithFinancials,
  contractPeriodYears: number = 25
): ProfitabilityWaterfallData {
  // Calculate contract period totals (2028 to 2028 + contractPeriodYears - 1)
  const contractStartYear = 2028;
  const contractEndYear = contractStartYear + contractPeriodYears - 1;

  const contractPeriodData = proposal.financials.filter(
    f => f.year >= contractStartYear && f.year <= contractEndYear
  );

  // Sum totals across contract period using Decimal.js
  const totals = contractPeriodData.reduce(
    (acc, period) => ({
      revenue: acc.revenue.plus(period.profitLoss.totalRevenue),
      rent: acc.rent.plus(period.profitLoss.rentExpense),
      staff: acc.staff.plus(period.profitLoss.staffCosts),
      otherOpex: acc.otherOpex.plus(period.profitLoss.otherOpex),
      ebitda: acc.ebitda.plus(period.profitLoss.ebitda),
      depreciation: acc.depreciation.plus(period.profitLoss.depreciation),
      ebit: acc.ebit.plus(period.profitLoss.ebit),
      interestNet: acc.interestNet.plus(
        period.profitLoss.interestIncome - period.profitLoss.interestExpense
      ),
      zakat: acc.zakat.plus(period.profitLoss.zakatExpense),
      netIncome: acc.netIncome.plus(period.profitLoss.netIncome),
    }),
    {
      revenue: new Decimal(0),
      rent: new Decimal(0),
      staff: new Decimal(0),
      otherOpex: new Decimal(0),
      ebitda: new Decimal(0),
      depreciation: new Decimal(0),
      ebit: new Decimal(0),
      interestNet: new Decimal(0),
      zakat: new Decimal(0),
      netIncome: new Decimal(0),
    }
  );

  // Convert to average annual values in millions for fair comparison
  const toAvgAnnualMillions = (decimal: Decimal) =>
    decimal.dividedBy(contractPeriodYears).dividedBy(1_000_000).toNumber();

  // Build waterfall segments (cumulative calculation)
  let cumulative = 0;
  const segments: WaterfallSegment[] = [];

  // Revenue (starting point)
  const revenue = toAvgAnnualMillions(totals.revenue);
  cumulative = revenue;
  segments.push({
    label: 'Revenue',
    value: revenue,
    type: 'positive',
    cumulative,
  });

  // Rent expense (negative)
  const rent = toAvgAnnualMillions(totals.rent);
  cumulative -= rent;
  segments.push({
    label: 'Rent',
    value: rent,
    type: 'negative',
    cumulative,
  });

  // Staff costs (negative)
  const staff = toAvgAnnualMillions(totals.staff);
  cumulative -= staff;
  segments.push({
    label: 'Staff',
    value: staff,
    type: 'negative',
    cumulative,
  });

  // Other OpEx (negative)
  const otherOpex = toAvgAnnualMillions(totals.otherOpex);
  cumulative -= otherOpex;
  segments.push({
    label: 'Other OpEx',
    value: otherOpex,
    type: 'negative',
    cumulative,
  });

  // EBITDA (total marker)
  const ebitda = toAvgAnnualMillions(totals.ebitda);
  segments.push({
    label: 'EBITDA',
    value: ebitda,
    type: 'total',
    cumulative,
  });

  // Depreciation (negative)
  const depreciation = toAvgAnnualMillions(totals.depreciation);
  cumulative -= depreciation;
  segments.push({
    label: 'Depreciation',
    value: depreciation,
    type: 'negative',
    cumulative,
  });

  // Interest (net - can be positive or negative)
  const interestNet = toAvgAnnualMillions(totals.interestNet);
  cumulative += interestNet;
  segments.push({
    label: 'Interest (Net)',
    value: Math.abs(interestNet),
    type: interestNet >= 0 ? 'positive' : 'negative',
    cumulative,
  });

  // Zakat (negative)
  const zakat = toAvgAnnualMillions(totals.zakat);
  cumulative -= zakat;
  segments.push({
    label: 'Zakat',
    value: zakat,
    type: 'negative',
    cumulative,
  });

  // Net Income (final total)
  const netIncome = toAvgAnnualMillions(totals.netIncome);
  segments.push({
    label: 'Net Income',
    value: netIncome,
    type: 'total',
    cumulative,
  });

  return {
    proposalId: proposal.id,
    proposalName: proposal.name,
    segments,
    netIncome,
    isWinner: false, // Will be set by caller
  };
}

/**
 * Format a number as millions with appropriate suffix
 * @param value - Number in absolute units
 * @param decimals - Number of decimal places (default: 1)
 */
export function formatAsMillions(value: number, decimals: number = 1): string {
  const millions = value / 1_000_000;
  return `${millions.toFixed(decimals)}M`;
}

/**
 * Calculate percentage spread between min and max values
 * @param min - Minimum value
 * @param max - Maximum value
 */
export function calculateSpreadPercent(min: number, max: number): number {
  if (min === 0) return 0;
  const range = max - min;
  return (range / Math.abs(min)) * 100;
}
