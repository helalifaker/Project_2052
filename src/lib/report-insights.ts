import { Decimal } from "decimal.js";

// Type for proposal metrics - accepts multiple formats for flexibility
/* eslint-disable no-restricted-syntax */
interface ProposalMetrics {
  npv?: Decimal | number | string;
  totalRent?: Decimal | number | string;
  irr?: Decimal | number | string;
  totalRevenue?: Decimal | number | string;
  totalEbitda?: Decimal | number | string;
  [key: string]: unknown;
}
/* eslint-enable no-restricted-syntax */

// Type for proposal data
interface ProposalData {
  metrics?: ProposalMetrics;
  rentModel?: string;
  developer?: string;
  [key: string]: unknown;
}

// Helper to format money
const formatMoney = (amount: number | Decimal) => {
  const val = typeof amount === "object" ? amount.toNumber() : amount;
  return `SAR ${(val / 1_000_000).toFixed(1)}M`;
};

// Helper to format percent
const formatPercent = (value: number | Decimal) => {
  const val = typeof value === "object" ? value.toNumber() : value;
  return `${(val * 100).toFixed(1)}%`;
};

export function generateExecutiveSummary(proposal: ProposalData): string {
  const metrics = proposal.metrics || {};
  const npv = new Decimal(metrics.npv || 0);
  const totalRent = new Decimal(metrics.totalRent || 0);
  const irr = new Decimal(metrics.irr || 0);

  let sentiment = "";
  if (npv.greaterThan(0)) {
    sentiment = "demonstrates strong financial viability";
  } else if (npv.greaterThan(-5_000_000)) {
    sentiment = "shows marginal viability requiring optimization";
  } else {
    sentiment = "presents significant financial challenges";
  }

  const rentModel = proposal.rentModel;
  const developer = proposal.developer || "the developer";

  return `This proposal from ${developer}, utilizing a ${rentModel} structure, ${sentiment}. Over the 30-year term, the total rent obligation is projected at ${formatMoney(totalRent)}, with a Net Present Value (NPV) of ${formatMoney(npv)}. The internal rate of return (IRR) stands at ${formatPercent(irr)}, indicating the project's potential efficiency relative to capital costs.`;
}

export function generateFinancialAnalysis(proposal: ProposalData): string {
  const metrics = proposal.metrics || {};
  const totalRevenue = new Decimal(metrics.totalRevenue || 0);
  const totalEbitda = new Decimal(metrics.totalEbitda || 0);
  const margin = totalRevenue.isZero()
    ? 0
    : totalEbitda.dividedBy(totalRevenue).toNumber();

  const rentModel = proposal.rentModel;
  let rentCommentary = "";

  if (rentModel === "Fixed Escalation") {
    rentCommentary =
      "The Fixed Escalation model provides predictable cost structures, allowing for easier long-term budgeting, though it lacks flexibility in downturns.";
  } else if (rentModel === "Revenue Share") {
    rentCommentary =
      "The Revenue Share model aligns landlord incentives with school performance, reducing risk during the ramp-up phase but potentially increasing costs in high-performance years.";
  } else {
    rentCommentary =
      "The Partner model balances initial capital expenditure with long-term operational costs.";
  }

  return `The project is estimated to generate ${formatMoney(totalRevenue)} in total revenue, yielding an EBITDA of ${formatMoney(totalEbitda)} (${formatPercent(margin)} margin). ${rentCommentary} Careful monitoring of enrollment ramp-up in the first 5 years (2028-2032) is critical to meeting these targets.`;
}
