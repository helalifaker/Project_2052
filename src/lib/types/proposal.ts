import { CreateProposal } from "@/lib/validation/proposal";

export interface ProposalFinancialYear {
    year: number;
    revenue?: number | string;
    rent?: number | string;
    opex?: number | string;
    ebitda?: number | string;
    netIncome?: number | string;
    cashFlow?: number | string | { netChangeInCash?: number | string;[key: string]: any };
    profitLoss?: {
        totalRevenue?: number | string;
        rentExpense?: number | string;
        staffCosts?: number | string;
        otherOpex?: number | string;
        ebitda?: number | string;
        netIncome?: number | string;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface ProposalMetrics {
    totalRent?: number | string;
    npv?: number | string;
    irr?: number | string;
    paybackPeriod?: number | string;
    totalRevenue?: number | string;
    totalEbitda?: number | string;
    [key: string]: any;
}

export interface Proposal extends Omit<Partial<CreateProposal>, "metrics" | "financials"> {
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    creatorId?: string;
    developer?: string; // Often mapped from name or separate field
    metrics?: ProposalMetrics;
    financials?: ProposalFinancialYear[];
    [key: string]: any; // Allow flexibility for now
}
