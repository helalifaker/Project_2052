import type ExcelJS from "exceljs";
import type { StoredFinancialPeriod } from "./types";

/**
 * Add named ranges to workbook for quick chart creation
 *
 * Named ranges allow users to quickly select data ranges when
 * creating charts in Excel, saving ~80% of chart creation time.
 */
export function addChartNamedRanges(
  workbook: ExcelJS.Workbook,
  yearCount: number,
): void {
  // Calculate the last column letter based on year count
  // Column B is year 1, so last column is B + (yearCount - 1)
  const lastColIndex = 1 + yearCount; // 1 for column B, + years
  const lastCol = columnIndexToLetter(lastColIndex);

  try {
    // --- PROFIT & LOSS RANGES ---

    // Chart 1: Total Revenue time series
    workbook.definedNames.add(
      `'Profit & Loss'!$B$6:$${lastCol}$6`,
      "Chart_TotalRevenue",
    );

    // Chart 2: Profitability (EBITDA, EBIT, Net Income)
    workbook.definedNames.add(
      `'Profit & Loss'!$B$14:$${lastCol}$14,'Profit & Loss'!$B$16:$${lastCol}$16,'Profit & Loss'!$B$24:$${lastCol}$24`,
      "Chart_Profitability",
    );

    // Chart 3: Rent Expense over time
    workbook.definedNames.add(
      `'Profit & Loss'!$B$9:$${lastCol}$9`,
      "Chart_RentExpense",
    );

    // --- BALANCE SHEET RANGES ---

    // Chart 4: Net PP&E (Property, Plant & Equipment)
    workbook.definedNames.add(
      `'Balance Sheet'!$B$13:$${lastCol}$13`,
      "Chart_NetPPE",
    );

    // Chart 5: Debt Balance over time
    workbook.definedNames.add(
      `'Balance Sheet'!$B$27:$${lastCol}$27`,
      "Chart_Debt",
    );

    // --- CASH FLOW RANGES ---

    // Chart 6: Ending Cash position
    workbook.definedNames.add(
      `'Cash Flow'!$B$20:$${lastCol}$20`,
      "Chart_CashFlow",
    );
  } catch (error) {
    console.warn("Failed to add chart named ranges:", error);
    // Non-critical - continue export even if named ranges fail
  }
}

/**
 * Convert column index (1-based) to Excel letter (A, B, C, ..., AA, AB, ...)
 */
function columnIndexToLetter(index: number): string {
  let column = "";
  let n = index;

  while (n > 0) {
    const remainder = (n - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    n = Math.floor((n - 1) / 26);
  }

  return column;
}

/**
 * Find row numbers for specific line items in transposed sheets
 * This helps create accurate named ranges
 */
export function findLineItemRow(
  lineItemLabel: string,
  lineItems: Array<{ label: string }>,
): number {
  const index = lineItems.findIndex((item) => item.label === lineItemLabel);
  return index >= 0 ? index + 2 : -1; // +2 because row 1 is header, data starts at row 2
}
