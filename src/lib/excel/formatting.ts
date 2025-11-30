import type ExcelJS from "exceljs";
import type { CellStyle } from "./types";

/**
 * Brand color palette - Sahara Twilight theme (matches app)
 */
export const COLORS = {
  // Primary brand colors - Copper
  brand: {
    primary: "FFC9A86C", // Copper-500 (Primary)
    dark: "FFA47B42", // Copper-700 (Darker for emphasis)
    light: "FFF7F3EB", // Copper-100 (Light backgrounds)
    accent: "FFE4D4B8", // Copper-300 (Accents)
  },
  // Semantic colors
  text: {
    dark: "FF1C1A17", // Stone-950 (Warm charcoal)
    muted: "FF6B6760", // Stone-600 (Muted text)
    white: "FFFFFFFF",
  },
  background: {
    white: "FFFFFFFF",
    lightGray: "FFF5F4F1", // Stone-100 (Warm light gray)
    subtotal: "FFF7F3EB", // Copper-100 (Warm tinted)
  },
  border: {
    gray: "FFE8E6E1", // Stone-200 (Warm border)
  },
  // Financial semantic colors
  financial: {
    positive: "FF2D7A4F", // Desert Sage (Profits)
    negative: "FFB84233", // Terracotta (Losses)
    warning: "FFC4850A", // Saffron (Warning)
  },
} as const;

/**
 * Excel number formats
 */
export const NUMBER_FORMATS = {
  millions: '#,##0.0,,"M"', // 125.8M
  percentage: "0.0%", // 8.5%
  percentagePrecise: "0.00%", // 2.50%
  wholeNumber: "#,##0", // 1,200
  currency: '"﷼ "#,##0.00', // SAR currency
} as const;

/**
 * Font configurations
 */
const FONTS = {
  base: {
    name: "Segoe UI",
    family: 2,
  },
  header: {
    name: "Segoe UI",
    size: 11,
    bold: true,
    color: { argb: COLORS.text.white },
  },
  sectionHeader: {
    name: "Segoe UI",
    size: 10,
    bold: true,
    color: { argb: COLORS.text.muted },
  },
  subtotal: {
    name: "Segoe UI",
    size: 10,
    bold: true,
    color: { argb: COLORS.text.dark },
  },
  grandTotal: {
    name: "Segoe UI",
    size: 11,
    bold: true,
    color: { argb: COLORS.text.dark },
  },
  regular: {
    name: "Segoe UI",
    size: 10,
    color: { argb: COLORS.text.dark },
  },
} as const;

/**
 * Predefined cell styles
 */
export const CELL_STYLES: Record<string, CellStyle> = {
  // Header row for years/columns
  headerRow: {
    font: FONTS.header,
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.brand.primary },
    },
    border: {
      top: { style: "medium", color: { argb: COLORS.brand.primary } },
      bottom: { style: "medium", color: { argb: COLORS.brand.primary } },
      left: { style: "thin", color: { argb: COLORS.border.gray } },
      right: { style: "thin", color: { argb: COLORS.border.gray } },
    },
    alignment: {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    },
  },

  // Section headers (e.g., "REVENUE", "OPERATING EXPENSES")
  sectionHeader: {
    font: FONTS.sectionHeader,
    border: {
      top: { style: "thin", color: { argb: COLORS.border.gray } },
    },
    alignment: {
      horizontal: "left",
      vertical: "middle",
    },
  },

  // Regular line items
  lineItem: {
    font: FONTS.regular,
    alignment: {
      horizontal: "left",
      vertical: "middle",
    },
  },

  // Subtotals (e.g., "Total Revenue", "Total OpEx")
  subtotal: {
    font: FONTS.subtotal,
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.background.subtotal },
    },
    border: {
      top: { style: "medium", color: { argb: COLORS.border.gray } },
    },
    alignment: {
      horizontal: "left",
      vertical: "middle",
    },
  },

  // Grand totals (e.g., "Net Income", "Total Assets")
  grandTotal: {
    font: FONTS.grandTotal,
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.brand.dark },
    },
    border: {
      top: { style: "medium", color: { argb: COLORS.brand.primary } },
      bottom: { style: "double", color: { argb: COLORS.brand.dark } },
    },
    alignment: {
      horizontal: "left",
      vertical: "middle",
    },
  },

  // Value cells (data) - centered to align with year headers
  valueCell: {
    font: FONTS.regular,
    alignment: {
      horizontal: "center",
      vertical: "middle",
    },
    numFmt: NUMBER_FORMATS.millions,
  },

  // Summary sheet property label
  summaryProperty: {
    font: {
      name: "Segoe UI",
      size: 10,
      color: { argb: COLORS.text.muted },
    },
    alignment: {
      horizontal: "left",
      vertical: "middle",
    },
  },

  // Summary sheet value
  summaryValue: {
    font: {
      name: "Segoe UI",
      size: 10,
      bold: true,
      color: { argb: COLORS.text.dark },
    },
    alignment: {
      horizontal: "left",
      vertical: "middle",
    },
  },
};

/**
 * Apply a predefined style to a cell
 */
export function applyStyle(
  cell: ExcelJS.Cell,
  style: CellStyle,
  overrides?: Partial<CellStyle>,
): void {
  const finalStyle = { ...style, ...overrides };

  if (finalStyle.font) {
    cell.font = finalStyle.font as ExcelJS.Font;
  }
  if (finalStyle.fill) {
    cell.fill = finalStyle.fill;
  }
  if (finalStyle.border) {
    cell.border = finalStyle.border as ExcelJS.Borders;
  }
  if (finalStyle.alignment) {
    cell.alignment = finalStyle.alignment as ExcelJS.Alignment;
  }
  if (finalStyle.numFmt) {
    cell.numFmt = finalStyle.numFmt;
  }
}

/**
 * Apply styles to an entire row
 */
export function applyRowStyle(
  row: ExcelJS.Row,
  style: CellStyle,
  options?: {
    startColumn?: number;
    endColumn?: number;
  },
): void {
  const start = options?.startColumn ?? 1;
  const end = options?.endColumn ?? row.cellCount;

  for (let col = start; col <= end; col++) {
    const cell = row.getCell(col);
    applyStyle(cell, style);
  }
}

/**
 * Set column widths for a worksheet
 */
export function setColumnWidths(
  worksheet: ExcelJS.Worksheet,
  widths: number[],
): void {
  widths.forEach((width, index) => {
    const column = worksheet.getColumn(index + 1);
    column.width = width;
  });
}

/**
 * Freeze panes at row 1 and column A
 */
export function freezeHeaderPanes(worksheet: ExcelJS.Worksheet): void {
  worksheet.views = [
    {
      state: "frozen",
      xSplit: 1, // Freeze column A
      ySplit: 1, // Freeze row 1
      activeCell: "B2",
      topLeftCell: "B2",
      showGridLines: false, // Hide gridlines for cleaner look
    },
  ];
}

/**
 * Disable gridlines for a worksheet
 */
export function disableGridLines(worksheet: ExcelJS.Worksheet): void {
  worksheet.views = worksheet.views?.map((view) => ({
    ...view,
    showGridLines: false,
  })) || [{ showGridLines: false }];
}

/**
 * Add indentation to a cell (via spaces in label)
 */
export function indentLabel(label: string, level: number): string {
  const indent = "  ".repeat(level); // 2 spaces per level
  return `${indent}${label}`;
}

/**
 * Format a value for display with appropriate number format
 */
export function formatValue(
  value: unknown,
  formatType: keyof typeof NUMBER_FORMATS = "millions",
): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "bigint") return Number(value);
  return 0;
}
