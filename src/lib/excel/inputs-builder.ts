import type ExcelJS from "exceljs";
import Decimal from "decimal.js";
import type { ExcelExportData } from "./types";
import { applyStyle, setColumnWidths, disableGridLines, CELL_STYLES, COLORS } from "./formatting";

/**
 * Helper to convert unknown to number
 */
function toNumber(value: unknown): number {
  if (value instanceof Decimal) return value.toNumber();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "bigint") return Number(value);
  return 0;
}

/**
 * Create Inputs & Assumptions sheet with 10 comprehensive sections
 */
export function createInputsSheet(
  worksheet: ExcelJS.Worksheet,
  data: ExcelExportData,
): void {
  const { proposal, systemConfig, transitionConfig } = data;

  // Remove gridlines for professional look
  disableGridLines(worksheet);

  // Column widths - compressed
  setColumnWidths(worksheet, [40, 35]);

  // --- TITLE ---
  const headerRow = worksheet.getRow(1);
  headerRow.height = 35;
  const headerCell = headerRow.getCell(1);
  headerCell.value = "INPUTS & ASSUMPTIONS";
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

  // --- SECTION 1: PROPOSAL INFORMATION ---
  currentRow = addSectionHeader(worksheet, currentRow, "1. Proposal Information");
  currentRow = addPropertyRow(worksheet, currentRow, "Proposal Name", proposal.name);
  currentRow = addPropertyRow(worksheet, currentRow, "Rent Model", proposal.rentModel);
  currentRow = addPropertyRow(
    worksheet,
    currentRow,
    "Contract Period",
    `${proposal.contractPeriodYears || 30} years`,
  );
  if (proposal.developer) {
    currentRow = addPropertyRow(worksheet, currentRow, "Developer", proposal.developer);
  }
  if (proposal.property) {
    currentRow = addPropertyRow(worksheet, currentRow, "Property", proposal.property);
  }
  currentRow = addPropertyRow(
    worksheet,
    currentRow,
    "Created By",
    proposal.creator.email,
  );
  currentRow = addPropertyRow(
    worksheet,
    currentRow,
    "Created Date",
    proposal.createdAt.toISOString().split("T")[0],
  );
  currentRow++; // Blank row

  // --- SECTION 2: ENROLLMENT CONFIGURATION ---
  currentRow = addSectionHeader(worksheet, currentRow, "2. Enrollment Configuration");

  const enrollmentConfig = (proposal.enrollment || {}) as Record<string, unknown>;

  currentRow = addPropertyRow(
    worksheet,
    currentRow,
    "Steady State Capacity",
    enrollmentConfig.steadyStateStudents
      ? `${enrollmentConfig.steadyStateStudents} students`
      : "Not set",
  );

  if (enrollmentConfig.rampUpEnabled) {
    currentRow = addPropertyRow(worksheet, currentRow, "Ramp-up Enabled", "Yes");
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Ramp-up Start Year",
      `${enrollmentConfig.rampUpStartYear || "Not set"}`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Ramp-up End Year",
      `${enrollmentConfig.rampUpEndYear || "Not set"}`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Ramp-up Target",
      enrollmentConfig.rampUpTargetStudents
        ? `${enrollmentConfig.rampUpTargetStudents} students`
        : "Not set",
    );
  } else {
    currentRow = addPropertyRow(worksheet, currentRow, "Ramp-up Enabled", "No");
  }
  currentRow++; // Blank row

  // --- SECTION 3: CURRICULUM CONFIGURATION ---
  currentRow = addSectionHeader(worksheet, currentRow, "3. Curriculum Configuration");

  const curriculumConfig = (proposal.curriculum || {}) as Record<string, unknown>;

  currentRow = addPropertyRow(
    worksheet,
    currentRow,
    "French Curriculum Base Tuition (2028)",
    curriculumConfig.baseTuition2028
      ? `﷼ ${toNumber(curriculumConfig.baseTuition2028).toLocaleString()}`
      : "Not set",
  );
  if (curriculumConfig.growthRate !== undefined) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "FR Tuition Growth Rate",
      `${(toNumber(curriculumConfig.growthRate) * 100).toFixed(1)}%`,
    );
  }
  if (curriculumConfig.growthFrequency) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "FR Growth Frequency",
      `${curriculumConfig.growthFrequency} years`,
    );
  }

  if (curriculumConfig.ibProgramEnabled) {
    currentRow = addPropertyRow(worksheet, currentRow, "IB Program Enabled", "Yes");
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "IB Start Year",
      `${curriculumConfig.ibStartYear || "Not set"}`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "IB Base Tuition (2028)",
      curriculumConfig.ibBaseTuition2028
        ? `﷼ ${toNumber(curriculumConfig.ibBaseTuition2028).toLocaleString()}`
        : "Not set",
    );
    if (curriculumConfig.ibGrowthRate !== undefined) {
      currentRow = addPropertyRow(
        worksheet,
        currentRow,
        "IB Tuition Growth Rate",
        `${(toNumber(curriculumConfig.ibGrowthRate) * 100).toFixed(1)}%`,
      );
    }
    if (curriculumConfig.ibStudentPercent !== undefined) {
      currentRow = addPropertyRow(
        worksheet,
        currentRow,
        "IB Student Percentage",
        `${(toNumber(curriculumConfig.ibStudentPercent) * 100).toFixed(1)}%`,
      );
    }
  } else {
    currentRow = addPropertyRow(worksheet, currentRow, "IB Program Enabled", "No");
  }
  currentRow++; // Blank row

  // --- SECTION 4: STAFF COST CONFIGURATION ---
  currentRow = addSectionHeader(worksheet, currentRow, "4. Staff Cost Configuration");

  const staffConfig = (proposal.staff || {}) as Record<string, unknown>;

  if (staffConfig.teacherRatio) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Teacher Ratio",
      `1 teacher per ${staffConfig.teacherRatio} students`,
    );
  }
  if (staffConfig.nonTeacherRatio) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Non-Teacher Staff Ratio",
      `1 staff per ${staffConfig.nonTeacherRatio} students`,
    );
  }
  if (staffConfig.avgTeacherSalary2028) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Avg Teacher Salary (2028, monthly)",
      `﷼ ${toNumber(staffConfig.avgTeacherSalary2028).toLocaleString()}`,
    );
  }
  if (staffConfig.avgAdminSalary2028) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Avg Admin Salary (2028, monthly)",
      `﷼ ${toNumber(staffConfig.avgAdminSalary2028).toLocaleString()}`,
    );
  }
  if (staffConfig.cpiRate !== undefined) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "CPI Adjustment Rate",
      `${(toNumber(staffConfig.cpiRate) * 100).toFixed(1)}%`,
    );
  }
  if (staffConfig.cpiFrequency) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "CPI Adjustment Frequency",
      `${staffConfig.cpiFrequency} years`,
    );
  }
  currentRow++; // Blank row

  // --- SECTION 5: RENT MODEL PARAMETERS ---
  currentRow = addSectionHeader(worksheet, currentRow, "5. Rent Model Parameters");
  currentRow = addPropertyRow(worksheet, currentRow, "Selected Model", proposal.rentModel);

  const rentConfig = (proposal.rentParams || {}) as Record<string, unknown>;

  switch (proposal.rentModel) {
    case "FIXED_ESCALATION":
      if (rentConfig.baseRent) {
        const baseRent = toNumber(rentConfig.baseRent) / 1_000_000;
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Base Rent (2028)",
          `﷼ ${baseRent.toFixed(2)}M`,
        );
      }
      if (rentConfig.growthRate !== undefined) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Growth Rate",
          `${(toNumber(rentConfig.growthRate) * 100).toFixed(1)}%`,
        );
      }
      if (rentConfig.escalationFrequency) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Escalation Frequency",
          `${rentConfig.escalationFrequency} years`,
        );
      }
      break;

    case "REVENUE_SHARE":
      if (rentConfig.revenueSharePercent !== undefined) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Revenue Share Percentage",
          `${(toNumber(rentConfig.revenueSharePercent) * 100).toFixed(1)}%`,
        );
      }
      break;

    case "PARTNER_INVESTMENT":
      if (rentConfig.landSize) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Land Size",
          `${toNumber(rentConfig.landSize).toLocaleString()} m²`,
        );
      }
      if (rentConfig.landPricePerSqm) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Land Price per m²",
          `﷼ ${toNumber(rentConfig.landPricePerSqm).toLocaleString()}`,
        );
      }
      if (rentConfig.buaSize) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Built-up Area (BUA)",
          `${toNumber(rentConfig.buaSize).toLocaleString()} m²`,
        );
      }
      if (rentConfig.constructionCostPerSqm) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Construction Cost per m²",
          `﷼ ${toNumber(rentConfig.constructionCostPerSqm).toLocaleString()}`,
        );
      }
      if (rentConfig.yieldRate !== undefined) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Yield Rate",
          `${(toNumber(rentConfig.yieldRate) * 100).toFixed(1)}%`,
        );
      }
      if (rentConfig.growthRate !== undefined) {
        currentRow = addPropertyRow(
          worksheet,
          currentRow,
          "Rent Growth Rate",
          `${(toNumber(rentConfig.growthRate) * 100).toFixed(1)}%`,
        );
      }

      // Calculated fields for Partner Investment
      if (
        rentConfig.landSize &&
        rentConfig.landPricePerSqm &&
        rentConfig.buaSize &&
        rentConfig.constructionCostPerSqm
      ) {
        const landInvestment =
          toNumber(rentConfig.landSize) * toNumber(rentConfig.landPricePerSqm);
        const constructionInvestment =
          toNumber(rentConfig.buaSize) * toNumber(rentConfig.constructionCostPerSqm);
        const totalInvestment = landInvestment + constructionInvestment;

        currentRow = addCalculatedRow(
          worksheet,
          currentRow,
          "Total Land Investment",
          `﷼ ${(landInvestment / 1_000_000).toFixed(2)}M`,
        );
        currentRow = addCalculatedRow(
          worksheet,
          currentRow,
          "Total Construction Investment",
          `﷼ ${(constructionInvestment / 1_000_000).toFixed(2)}M`,
        );
        currentRow = addCalculatedRow(
          worksheet,
          currentRow,
          "Total Partner Investment",
          `﷼ ${(totalInvestment / 1_000_000).toFixed(2)}M`,
        );

        if (rentConfig.yieldRate) {
          const baseRent = totalInvestment * toNumber(rentConfig.yieldRate);
          currentRow = addCalculatedRow(
            worksheet,
            currentRow,
            "Base Rent (Year 1)",
            `﷼ ${(baseRent / 1_000_000).toFixed(2)}M`,
          );
        }
      }
      break;
  }
  currentRow++; // Blank row

  // --- SECTION 6: SYSTEM CONFIGURATION ---
  currentRow = addSectionHeader(worksheet, currentRow, "6. System Configuration");

  if (systemConfig) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Zakat Rate",
      `${(toNumber(systemConfig.zakatRate) * 100).toFixed(2)}%`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Debt Interest Rate",
      `${(toNumber(systemConfig.debtInterestRate) * 100).toFixed(2)}%`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Deposit Interest Rate",
      `${(toNumber(systemConfig.depositInterestRate) * 100).toFixed(2)}%`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Discount Rate (WACC)",
      `${(toNumber(systemConfig.discountRate) * 100).toFixed(2)}%`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Minimum Cash Balance",
      `﷼ ${(toNumber(systemConfig.minCashBalance) / 1_000_000).toFixed(2)}M`,
    );
  }
  currentRow++; // Blank row

  // --- SECTION 7: TRANSITION CONFIGURATION (2025-2027) ---
  currentRow = addSectionHeader(
    worksheet,
    currentRow,
    "7. Transition Configuration (2025-2027)",
  );

  if (transitionConfig) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "2025 Students",
      `${transitionConfig.year2025Students} students`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "2025 Avg Tuition",
      `﷼ ${toNumber(transitionConfig.year2025AvgTuition).toLocaleString()}`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "2026 Students",
      `${transitionConfig.year2026Students} students`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "2026 Avg Tuition",
      `﷼ ${toNumber(transitionConfig.year2026AvgTuition).toLocaleString()}`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "2027 Students",
      `${transitionConfig.year2027Students} students`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "2027 Avg Tuition",
      `﷼ ${toNumber(transitionConfig.year2027AvgTuition).toLocaleString()}`,
    );
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Rent Growth % (2025-2027)",
      `${(toNumber(transitionConfig.rentGrowthPercent) * 100).toFixed(1)}%`,
    );
  } else {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Status",
      "No transition config set",
    );
  }
  currentRow++; // Blank row

  // --- SECTION 8: CAPEX CONFIGURATION ---
  currentRow = addSectionHeader(worksheet, currentRow, "8. CapEx Configuration");
  currentRow = addPropertyRow(
    worksheet,
    currentRow,
    "Note",
    "CapEx categories managed via admin panel",
  );
  currentRow++; // Blank row

  // --- SECTION 9: WORKING CAPITAL RATIOS ---
  currentRow = addSectionHeader(worksheet, currentRow, "9. Working Capital Ratios");
  currentRow = addPropertyRow(
    worksheet,
    currentRow,
    "Note",
    "Working capital ratios auto-calculated from historical data",
  );
  currentRow++; // Blank row

  // --- SECTION 10: OTHER OPEX ---
  currentRow = addSectionHeader(worksheet, currentRow, "10. Other OpEx");

  if (proposal.otherOpexPercent !== undefined && proposal.otherOpexPercent !== null) {
    currentRow = addPropertyRow(
      worksheet,
      currentRow,
      "Other OpEx % of Revenue",
      `${(toNumber(proposal.otherOpexPercent) * 100).toFixed(1)}%`,
    );
  } else {
    currentRow = addPropertyRow(worksheet, currentRow, "Other OpEx % of Revenue", "Not set");
  }
}

/**
 * Add a section header row
 */
function addSectionHeader(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  title: string,
): number {
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
  return rowNumber + 1;
}

/**
 * Add a property-value row
 */
function addPropertyRow(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  property: string,
  value: string,
): number {
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

  return rowNumber + 1;
}

/**
 * Add a calculated/derived value row (gray background, italic)
 */
function addCalculatedRow(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  property: string,
  value: string,
): number {
  const row = worksheet.getRow(rowNumber);
  row.height = 20;

  // Property cell (Column A)
  const propertyCell = row.getCell(1);
  propertyCell.value = `  ${property}`; // Indent calculated fields
  propertyCell.font = {
    name: "Segoe UI",
    size: 10,
    italic: true,
    color: { argb: COLORS.text.muted },
  };
  propertyCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.background.lightGray },
  };
  propertyCell.alignment = { horizontal: "left", vertical: "middle" };

  // Value cell (Column B)
  const valueCell = row.getCell(2);
  valueCell.value = value;
  valueCell.font = {
    name: "Segoe UI",
    size: 10,
    italic: true,
    color: { argb: COLORS.text.muted },
  };
  valueCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.background.lightGray },
  };
  valueCell.alignment = { horizontal: "left", vertical: "middle" };

  return rowNumber + 1;
}
