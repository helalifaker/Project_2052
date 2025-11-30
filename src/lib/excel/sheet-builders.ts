import type ExcelJS from "exceljs";
import Decimal from "decimal.js";
import type {
  TransposedSheetConfig,
  LineItemDefinition,
  StoredFinancialPeriod,
} from "./types";
import {
  applyStyle,
  applyRowStyle,
  setColumnWidths,
  freezeHeaderPanes,
  indentLabel,
  formatValue,
  CELL_STYLES,
  NUMBER_FORMATS,
} from "./formatting";

/**
 * Read a Decimal value from stored data
 */
function readDecimal(value: unknown): Decimal {
  if (value === null || value === undefined) return new Decimal(0);
  try {
    if (typeof value === "bigint") {
      return new Decimal(value.toString());
    }
    if (value instanceof Decimal) return value;
    if (typeof value === "number") return new Decimal(value);
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? new Decimal(parsed) : new Decimal(0);
    }
    return new Decimal(0);
  } catch {
    return new Decimal(0);
  }
}

/**
 * Extract data from a period object using a key path (supports nested keys with dot notation)
 */
function extractPeriodData(
  period: StoredFinancialPeriod,
  dataKey: string,
  statementType: "profitLoss" | "balanceSheet" | "cashFlow",
): Decimal {
  if (!dataKey) return new Decimal(0);

  const statement = period[statementType];
  if (!statement) return new Decimal(0);

  // Support nested keys like "assets.current.cash"
  const keys = dataKey.split(".");
  let value: unknown = statement;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return new Decimal(0);
    }
  }

  return readDecimal(value);
}

/**
 * Create a transposed financial statement sheet
 * Years go across as columns, line items go down as rows
 */
export function createTransposedSheet(
  config: TransposedSheetConfig,
  statementType: "profitLoss" | "balanceSheet" | "cashFlow",
): void {
  const { worksheet, periods, lineItems, freezePanes = true } = config;

  if (periods.length === 0) {
    throw new Error("No financial periods provided");
  }

  // Sort periods by year
  const sortedPeriods = [...periods].sort((a, b) => a.year - b.year);

  // --- HEADER ROW ---
  // Column A: "Line Item" | Columns B+: Years (2023, 2024, ...)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;

  // Column A header
  const lineItemHeader = headerRow.getCell(1);
  lineItemHeader.value = "Line Item";
  applyStyle(lineItemHeader, CELL_STYLES.headerRow);

  // Year columns (B, C, D, ...)
  sortedPeriods.forEach((period, index) => {
    const cell = headerRow.getCell(index + 2); // +2 because column A is label
    cell.value = period.year;
    applyStyle(cell, CELL_STYLES.headerRow);
  });

  // --- DATA ROWS ---
  let currentRow = 2; // Start from row 2 (row 1 is header)

  lineItems.forEach((lineItem) => {
    const row = worksheet.getRow(currentRow);
    row.height = 20;

    // Column A: Line item label with indentation
    const labelCell = row.getCell(1);
    const displayLabel = lineItem.indent
      ? indentLabel(lineItem.label, lineItem.indent)
      : lineItem.label;
    labelCell.value = displayLabel;

    // Determine style based on styleType
    let labelStyle = CELL_STYLES.lineItem;
    switch (lineItem.styleType) {
      case "header":
        labelStyle = CELL_STYLES.headerRow;
        break;
      case "sectionHeader":
        labelStyle = CELL_STYLES.sectionHeader;
        break;
      case "subtotal":
        labelStyle = CELL_STYLES.subtotal;
        break;
      case "grandTotal":
        labelStyle = CELL_STYLES.grandTotal;
        break;
    }

    applyStyle(labelCell, labelStyle);

    // Add custom borders if specified
    if (lineItem.borderTop) {
      labelCell.border = {
        ...labelCell.border,
        top: {
          style: lineItem.borderTop,
          color: { argb: "FFD1D5DB" },
        },
      };
    }
    if (lineItem.borderBottom) {
      labelCell.border = {
        ...labelCell.border,
        bottom: {
          style: lineItem.borderBottom,
          color: { argb: "FFD1D5DB" },
        },
      };
    }

    // Columns B+: Year data
    sortedPeriods.forEach((period, index) => {
      const cell = row.getCell(index + 2);

      // Section headers and other non-data rows have empty values
      if (
        lineItem.styleType === "sectionHeader" ||
        lineItem.styleType === "header" ||
        !lineItem.dataKey
      ) {
        cell.value = "";
      } else {
        // Extract and format the value
        const value = extractPeriodData(period, lineItem.dataKey, statementType);
        cell.value = value.toNumber();

        // Apply number format
        const numFmt = lineItem.numFmt || NUMBER_FORMATS.millions;
        cell.numFmt = numFmt;
      }

      // Apply value cell styling
      const valueCellStyle =
        lineItem.styleType === "subtotal"
          ? { ...CELL_STYLES.valueCell, ...CELL_STYLES.subtotal }
          : lineItem.styleType === "grandTotal"
            ? { ...CELL_STYLES.valueCell, ...CELL_STYLES.grandTotal }
            : CELL_STYLES.valueCell;

      applyStyle(cell, valueCellStyle);

      // Add custom borders
      if (lineItem.borderTop) {
        cell.border = {
          ...cell.border,
          top: {
            style: lineItem.borderTop,
            color: { argb: "FFD1D5DB" },
          },
        };
      }
      if (lineItem.borderBottom) {
        cell.border = {
          ...cell.border,
          bottom: {
            style: lineItem.borderBottom,
            color: { argb: "FFD1D5DB" },
          },
        };
      }
    });

    currentRow++;
  });

  // --- COLUMN WIDTHS ---
  // Compress columns for professional appearance
  const columnWidths: number[] = [
    32, // Column A: Line item labels (reduced from 35)
    ...sortedPeriods.map(() => 10), // Columns B+: Year data (reduced from 12)
  ];
  setColumnWidths(worksheet, columnWidths);

  // --- FREEZE PANES ---
  if (freezePanes) {
    freezeHeaderPanes(worksheet);
  }
}

/**
 * Profit & Loss line item definitions
 */
export const PROFIT_LOSS_LINE_ITEMS: LineItemDefinition[] = [
  // Revenue Section
  { label: "REVENUE", dataKey: "", styleType: "sectionHeader" },
  {
    label: "Tuition Revenue (FR)",
    dataKey: "tuitionRevenue",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Tuition Revenue (IB)",
    dataKey: "tuitionIB",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Other Revenue",
    dataKey: "otherRevenue",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Total Revenue",
    dataKey: "totalRevenue",
    styleType: "subtotal",
    borderTop: "medium",
  },

  // Blank row
  { label: "", dataKey: "", styleType: "lineItem" },

  // Operating Expenses Section
  { label: "OPERATING EXPENSES", dataKey: "", styleType: "sectionHeader" },
  {
    label: "Rent Expense",
    dataKey: "rentExpense",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Staff Costs",
    dataKey: "staffCosts",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Other OpEx",
    dataKey: "otherOpex",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Total Operating Expenses",
    dataKey: "totalOpex",
    styleType: "subtotal",
    borderTop: "medium",
  },

  // Blank row
  { label: "", dataKey: "", styleType: "lineItem" },

  // EBITDA
  {
    label: "EBITDA",
    dataKey: "ebitda",
    styleType: "subtotal",
  },
  {
    label: "Depreciation",
    dataKey: "depreciation",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "EBIT",
    dataKey: "ebit",
    styleType: "subtotal",
  },

  // Blank row
  { label: "", dataKey: "", styleType: "lineItem" },

  // Interest
  {
    label: "Interest Expense",
    dataKey: "interestExpense",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Interest Income",
    dataKey: "interestIncome",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Net Interest",
    dataKey: "netInterest",
    styleType: "lineItem",
    indent: 1,
  },

  // Blank row
  { label: "", dataKey: "", styleType: "lineItem" },

  // Bottom Line
  {
    label: "EBT (Earnings Before Tax/Zakat)",
    dataKey: "ebt",
    styleType: "subtotal",
  },
  {
    label: "Zakat Expense",
    dataKey: "zakatExpense",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Net Income",
    dataKey: "netIncome",
    styleType: "grandTotal",
    borderTop: "medium",
    borderBottom: "double",
  },
];

/**
 * Balance Sheet line item definitions
 */
export const BALANCE_SHEET_LINE_ITEMS: LineItemDefinition[] = [
  // Assets
  { label: "ASSETS", dataKey: "", styleType: "sectionHeader" },
  { label: "Current Assets", dataKey: "", styleType: "sectionHeader", indent: 1 },
  { label: "Cash", dataKey: "cash", styleType: "lineItem", indent: 2 },
  {
    label: "Accounts Receivable",
    dataKey: "accountsReceivable",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Prepaid Expenses",
    dataKey: "prepaidExpenses",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Total Current Assets",
    dataKey: "totalCurrentAssets",
    styleType: "subtotal",
    indent: 1,
    borderTop: "thin",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  {
    label: "Non-Current Assets",
    dataKey: "",
    styleType: "sectionHeader",
    indent: 1,
  },
  {
    label: "Gross PP&E",
    dataKey: "grossPPE",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Accumulated Depreciation",
    dataKey: "accumulatedDepreciation",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Net PP&E",
    dataKey: "propertyPlantEquipment",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Total Non-Current Assets",
    dataKey: "totalNonCurrentAssets",
    styleType: "subtotal",
    indent: 1,
    borderTop: "thin",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  {
    label: "TOTAL ASSETS",
    dataKey: "totalAssets",
    styleType: "grandTotal",
    borderTop: "medium",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  // Liabilities & Equity
  { label: "LIABILITIES & EQUITY", dataKey: "", styleType: "sectionHeader" },
  {
    label: "Current Liabilities",
    dataKey: "",
    styleType: "sectionHeader",
    indent: 1,
  },
  {
    label: "Accounts Payable",
    dataKey: "accountsPayable",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Accrued Expenses",
    dataKey: "accruedExpenses",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Deferred Revenue",
    dataKey: "deferredRevenue",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Total Current Liabilities",
    dataKey: "totalCurrentLiabilities",
    styleType: "subtotal",
    indent: 1,
    borderTop: "thin",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  {
    label: "Non-Current Liabilities",
    dataKey: "",
    styleType: "sectionHeader",
    indent: 1,
  },
  {
    label: "Debt Balance",
    dataKey: "debtBalance",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Total Non-Current Liabilities",
    dataKey: "totalNonCurrentLiabilities",
    styleType: "subtotal",
    indent: 1,
    borderTop: "thin",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  {
    label: "Total Liabilities",
    dataKey: "totalLiabilities",
    styleType: "subtotal",
    borderTop: "medium",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  // Equity
  { label: "Equity", dataKey: "", styleType: "sectionHeader", indent: 1 },
  {
    label: "Retained Earnings",
    dataKey: "retainedEarnings",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Net Income (Current Year)",
    dataKey: "netIncomeCurrentYear",
    styleType: "lineItem",
    indent: 2,
  },
  {
    label: "Total Equity",
    dataKey: "totalEquity",
    styleType: "subtotal",
    indent: 1,
    borderTop: "thin",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  {
    label: "TOTAL LIABILITIES & EQUITY",
    dataKey: "totalLiabEquity",
    styleType: "grandTotal",
    borderTop: "medium",
    borderBottom: "double",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  {
    label: "Balance Check (should be 0)",
    dataKey: "balanceDifference",
    styleType: "lineItem",
    numFmt: NUMBER_FORMATS.millions,
  },
];

/**
 * Cash Flow Statement line item definitions
 */
export const CASH_FLOW_LINE_ITEMS: LineItemDefinition[] = [
  // Operating Activities
  { label: "OPERATING ACTIVITIES", dataKey: "", styleType: "sectionHeader" },
  {
    label: "Net Income",
    dataKey: "netIncome",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Depreciation",
    dataKey: "depreciation",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Change in Accounts Receivable",
    dataKey: "changeInAR",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Change in Prepaid Expenses",
    dataKey: "changeInPrepaid",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Change in Accounts Payable",
    dataKey: "changeInAP",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Change in Accrued Expenses",
    dataKey: "changeInAccrued",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Change in Deferred Revenue",
    dataKey: "changeInDeferredRevenue",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Cash Flow from Operations",
    dataKey: "cashFlowFromOperations",
    styleType: "subtotal",
    borderTop: "medium",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  // Investing Activities
  { label: "INVESTING ACTIVITIES", dataKey: "", styleType: "sectionHeader" },
  {
    label: "CapEx (Capital Expenditures)",
    dataKey: "capex",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Cash Flow from Investing",
    dataKey: "cashFlowFromInvesting",
    styleType: "subtotal",
    borderTop: "medium",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  // Financing Activities
  { label: "FINANCING ACTIVITIES", dataKey: "", styleType: "sectionHeader" },
  {
    label: "Debt Issuance",
    dataKey: "debtIssuance",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Debt Repayment",
    dataKey: "debtRepayment",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Cash Flow from Financing",
    dataKey: "cashFlowFromFinancing",
    styleType: "subtotal",
    borderTop: "medium",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  // Net Change in Cash
  {
    label: "Net Change in Cash",
    dataKey: "netChangeInCash",
    styleType: "subtotal",
    borderTop: "medium",
  },
  {
    label: "Beginning Cash",
    dataKey: "beginningCash",
    styleType: "lineItem",
    indent: 1,
  },
  {
    label: "Ending Cash",
    dataKey: "endingCash",
    styleType: "grandTotal",
    borderTop: "medium",
    borderBottom: "double",
  },

  { label: "", dataKey: "", styleType: "lineItem" },

  {
    label: "Cash Reconciliation (should be 0)",
    dataKey: "cashReconciliationDiff",
    styleType: "lineItem",
    numFmt: NUMBER_FORMATS.millions,
  },
];
