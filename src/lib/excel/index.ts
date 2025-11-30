/**
 * Excel Export Library
 *
 * Provides utilities for generating professional Excel reports
 * from financial proposal data.
 */

// Type exports
export type {
  StoredFinancialPeriod,
  ProposalMetrics,
  ExcelExportData,
  LineItemDefinition,
  TransposedSheetConfig,
  CellStyle,
  InputSection,
} from "./types";

// Formatting exports
export {
  COLORS,
  NUMBER_FORMATS,
  CELL_STYLES,
  applyStyle,
  applyRowStyle,
  setColumnWidths,
  freezeHeaderPanes,
  disableGridLines,
  indentLabel,
  formatValue,
} from "./formatting";
