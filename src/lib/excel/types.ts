import type ExcelJS from "exceljs";

/**
 * Simplified types for Prisma models (used during build when Prisma client isn't available)
 */
export interface LeaseProposal {
  id: string;
  name: string | null;
  developer: string | null;
  property: string | null;
  rentModel: string | null;
  contractPeriodYears?: number;
  enrollment: unknown;
  curriculum: unknown;
  staff: unknown;
  rentParams: unknown;
  otherOpexPercent: unknown;
  financials: unknown;
  metrics: unknown;
  calculatedAt: Date | null;
  createdAt: Date;
  createdBy: string;
}

export interface SystemConfig {
  id: string;
  zakatRate: unknown;
  debtInterestRate: unknown;
  depositInterestRate: unknown;
  discountRate: unknown;
  minCashBalance: unknown;
}

export interface TransitionConfig {
  id: string;
  year2025Students: number;
  year2025AvgTuition: unknown;
  year2026Students: number;
  year2026AvgTuition: unknown;
  year2027Students: number;
  year2027AvgTuition: unknown;
  rentGrowthPercent: unknown;
  updatedAt: Date;
}

/**
 * Financial period data structure from calculation engine
 */
export interface StoredFinancialPeriod {
  year: number;
  profitLoss: Record<string, unknown>;
  balanceSheet: Record<string, unknown>;
  cashFlow: Record<string, unknown>;
}

/**
 * Proposal metrics structure
 */
export interface ProposalMetrics {
  npv?: number | string;
  irr?: number | string;
  paybackPeriod?: number | string;
  roiPercent?: number | string;
}

/**
 * Complete proposal data for Excel export
 */
export interface ExcelExportData {
  proposal: LeaseProposal & {
    creator: { email: string };
  };
  periods: StoredFinancialPeriod[];
  systemConfig: SystemConfig | null;
  transitionConfig: TransitionConfig | null;
}

/**
 * Line item definition for transposed financial statements
 */
export interface LineItemDefinition {
  /** Display label for the line item */
  label: string;
  /** Key to extract data from period object (empty for section headers) */
  dataKey: string;
  /** Visual style type */
  styleType:
    | "header"
    | "sectionHeader"
    | "lineItem"
    | "subtotal"
    | "grandTotal";
  /** Indentation level (0-3) */
  indent?: number;
  /** Whether to add a top border */
  borderTop?: "thin" | "medium" | "double";
  /** Whether to add a bottom border */
  borderBottom?: "thin" | "medium" | "double";
  /** Number format override */
  numFmt?: string;
}

/**
 * Configuration for creating a transposed sheet
 */
export interface TransposedSheetConfig {
  /** Worksheet to populate */
  worksheet: ExcelJS.Worksheet;
  /** Financial periods data */
  periods: StoredFinancialPeriod[];
  /** Line item definitions */
  lineItems: LineItemDefinition[];
  /** Sheet title for freeze panes */
  freezePanes?: boolean;
}

/**
 * Cell style configuration
 */
export interface CellStyle {
  font?: Partial<ExcelJS.Font>;
  fill?: ExcelJS.Fill;
  border?: Partial<ExcelJS.Borders>;
  alignment?: Partial<ExcelJS.Alignment>;
  numFmt?: string;
}

/**
 * Section configuration for Inputs & Assumptions sheet
 */
export interface InputSection {
  /** Section title */
  title: string;
  /** Section data rows */
  rows: Array<{
    property: string;
    value: string | number;
    /** Whether to format as calculated/derived */
    isCalculated?: boolean;
  }>;
  /** Optional table data */
  table?: {
    headers: string[];
    rows: Array<Array<string | number>>;
  };
}
