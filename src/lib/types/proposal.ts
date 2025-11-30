import { CreateProposal } from "@/lib/validation/proposal";
import Decimal from "decimal.js";

export interface ProposalFinancialYear {
  year: number;
  revenue?: Decimal | string;
  rent?: Decimal | string;
  opex?: Decimal | string;
  ebitda?: Decimal | string;
  netIncome?: Decimal | string;
  cashFlow?:
    | Decimal
    | string
    | { netChangeInCash?: Decimal | string; [key: string]: unknown };
  profitLoss?: {
    totalRevenue?: Decimal | string;
    rentExpense?: Decimal | string;
    staffCosts?: Decimal | string;
    otherOpex?: Decimal | string;
    ebitda?: Decimal | string;
    netIncome?: Decimal | string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ProposalMetrics {
  totalRent?: Decimal | string;
  npv?: Decimal | string;
  irr?: number | string; // IRR is a percentage, not a currency amount
  paybackPeriod?: number | string; // Payback period is in years
  totalRevenue?: Decimal | string;
  totalEbitda?: Decimal | string;
  [key: string]: unknown;
}

export interface Proposal
  extends Omit<Partial<CreateProposal>, "metrics" | "financials"> {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  creatorId?: string;
  developer?: string; // Often mapped from name or separate field
  metrics?: ProposalMetrics;
  financials?: ProposalFinancialYear[];
  [key: string]: unknown; // Allow flexibility for now
}
