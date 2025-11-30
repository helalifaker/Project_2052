import type ExcelJS from "exceljs";
import type { ExcelExportData, ProposalMetrics } from "./types";
import { applyStyle, setColumnWidths, disableGridLines, CELL_STYLES, COLORS } from "./formatting";

/**
 * Helper to convert unknown to number
 */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "bigint") return Number(value);
  return 0;
}

/**
 * Create Executive Summary sheet
 */
export function createSummarySheet(
  worksheet: ExcelJS.Worksheet,
  data: ExcelExportData,
): void {
  const { proposal } = data;

  // Remove gridlines for professional look
  disableGridLines(worksheet);

  // Column widths - compressed
  setColumnWidths(worksheet, [35, 35]);

  // --- HEADER ---
  const headerRow = worksheet.getRow(1);
  headerRow.height = 35;
  const headerCell = headerRow.getCell(1);
  headerCell.value = "EXECUTIVE SUMMARY";
  headerCell.font = {
    name: "Segoe UI",
    size: 16,
    bold: true,
    color: { argb: COLORS.text.white },
  };
  headerCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.brand.primary },
  };
  headerCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.mergeCells("A1:B1");

  let currentRow = 3;

  // --- PROPOSAL INFORMATION ---
  addSectionHeader(worksheet, currentRow++, "Proposal Information");

  addPropertyRow(worksheet, currentRow++, "Proposal Name", proposal.name);
  addPropertyRow(worksheet, currentRow++, "Rent Model", proposal.rentModel);
  addPropertyRow(
    worksheet,
    currentRow++,
    "Created Date",
    proposal.createdAt.toISOString().split("T")[0],
  );
  addPropertyRow(worksheet, currentRow++, "Created By", proposal.creator.email);
  if (proposal.developer) {
    addPropertyRow(worksheet, currentRow++, "Developer", proposal.developer);
  }
  if (proposal.property) {
    addPropertyRow(worksheet, currentRow++, "Property", proposal.property);
  }
  addPropertyRow(
    worksheet,
    currentRow++,
    "Contract Period",
    `${proposal.contractPeriodYears || 30} years`,
  );

  currentRow++; // Blank row

  // --- FINANCIAL METRICS ---
  if (proposal.metrics) {
    const metrics = proposal.metrics as ProposalMetrics;
    addSectionHeader(worksheet, currentRow++, "Financial Metrics");

    if (metrics.npv !== undefined) {
      const npvValue = toNumber(metrics.npv) / 1_000_000;
      addPropertyRow(
        worksheet,
        currentRow++,
        "NPV (Net Present Value)",
        `﷼ ${npvValue.toFixed(2)}M`,
      );
    }

    if (metrics.irr !== undefined) {
      addPropertyRow(
        worksheet,
        currentRow++,
        "IRR (Internal Rate of Return)",
        `${toNumber(metrics.irr).toFixed(2)}%`,
      );
    }

    if (metrics.paybackPeriod !== undefined) {
      addPropertyRow(
        worksheet,
        currentRow++,
        "Payback Period",
        `${toNumber(metrics.paybackPeriod).toFixed(1)} years`,
      );
    }

    if (metrics.roiPercent !== undefined) {
      addPropertyRow(
        worksheet,
        currentRow++,
        "ROI (Return on Investment)",
        `${toNumber(metrics.roiPercent).toFixed(2)}%`,
      );
    }

    currentRow++; // Blank row
  }

  // --- RENT MODEL DETAILS ---
  addSectionHeader(worksheet, currentRow++, "Rent Model Configuration");

  switch (proposal.rentModel) {
    case "FIXED_ESCALATION": {
      const config = proposal.rentParams as Record<string, unknown>;
      if (config?.baseRent) {
        const baseRent = toNumber(config.baseRent) / 1_000_000;
        addPropertyRow(
          worksheet,
          currentRow++,
          "Base Rent (2028)",
          `﷼ ${baseRent.toFixed(2)}M`,
        );
      }
      if (config?.growthRate !== undefined) {
        addPropertyRow(
          worksheet,
          currentRow++,
          "Growth Rate",
          `${(toNumber(config.growthRate) * 100).toFixed(1)}%`,
        );
      }
      if (config?.escalationFrequency) {
        addPropertyRow(
          worksheet,
          currentRow++,
          "Escalation Frequency",
          `${config.escalationFrequency} years`,
        );
      }
      break;
    }
    case "REVENUE_SHARE": {
      const config = proposal.rentParams as Record<string, unknown>;
      if (config?.revenueSharePercent !== undefined) {
        addPropertyRow(
          worksheet,
          currentRow++,
          "Revenue Share",
          `${(toNumber(config.revenueSharePercent) * 100).toFixed(1)}%`,
        );
      }
      break;
    }
    case "PARTNER_INVESTMENT": {
      const config = proposal.rentParams as Record<string, unknown>;
      if (config?.landSize) {
        addPropertyRow(
          worksheet,
          currentRow++,
          "Land Size",
          `${toNumber(config.landSize).toLocaleString()} m²`,
        );
      }
      if (config?.landPricePerSqm) {
        addPropertyRow(
          worksheet,
          currentRow++,
          "Land Price per m²",
          `﷼ ${toNumber(config.landPricePerSqm).toLocaleString()}`,
        );
      }
      if (config?.buaSize) {
        addPropertyRow(
          worksheet,
          currentRow++,
          "Built-up Area (BUA)",
          `${toNumber(config.buaSize).toLocaleString()} m²`,
        );
      }
      if (config?.constructionCostPerSqm) {
        addPropertyRow(
          worksheet,
          currentRow++,
          "Construction Cost per m²",
          `﷼ ${toNumber(config.constructionCostPerSqm).toLocaleString()}`,
        );
      }
      if (config?.yieldRate !== undefined) {
        addPropertyRow(
          worksheet,
          currentRow++,
          "Yield Rate",
          `${(toNumber(config.yieldRate) * 100).toFixed(1)}%`,
        );
      }
      break;
    }
  }

  currentRow++; // Blank row

  // --- KEY ASSUMPTIONS ---
  addSectionHeader(worksheet, currentRow++, "Key Assumptions");

  const enrollmentConfig = proposal.enrollment as Record<string, unknown>;
  if (enrollmentConfig?.steadyStateStudents) {
    addPropertyRow(
      worksheet,
      currentRow++,
      "Capacity (Steady State)",
      `${enrollmentConfig.steadyStateStudents} students`,
    );
  }

  if (proposal.otherOpexPercent !== undefined && proposal.otherOpexPercent !== null) {
    addPropertyRow(
      worksheet,
      currentRow++,
      "Other OpEx",
      `${(toNumber(proposal.otherOpexPercent) * 100).toFixed(1)}% of revenue`,
    );
  }

  // --- FOOTER ---
  currentRow += 2;
  const footerRow = worksheet.getRow(currentRow);
  const footerCell = footerRow.getCell(1);
  footerCell.value = "Generated by CapEx Advisor";
  footerCell.font = {
    name: "Segoe UI",
    size: 9,
    italic: true,
    color: { argb: COLORS.text.muted },
  };
  footerCell.alignment = { horizontal: "center" };
  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
}

/**
 * Add a section header row
 */
function addSectionHeader(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  title: string,
): void {
  const row = worksheet.getRow(rowNumber);
  row.height = 25;
  const cell = row.getCell(1);
  cell.value = title;
  cell.font = {
    name: "Segoe UI",
    size: 12,
    bold: true,
    color: { argb: COLORS.brand.primary },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.brand.light },
  };
  cell.border = {
    bottom: { style: "medium", color: { argb: COLORS.brand.primary } },
  };
  cell.alignment = { horizontal: "left", vertical: "middle" };
  worksheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
}

/**
 * Add a property-value row
 */
function addPropertyRow(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  property: string,
  value: string,
): void {
  const row = worksheet.getRow(rowNumber);
  row.height = 20;

  // Property cell (Column A)
  const propertyCell = row.getCell(1);
  propertyCell.value = property;
  applyStyle(propertyCell, CELL_STYLES.summaryProperty);

  // Value cell (Column B)
  const valueCell = row.getCell(2);
  valueCell.value = value;
  applyStyle(valueCell, CELL_STYLES.summaryValue);
}
