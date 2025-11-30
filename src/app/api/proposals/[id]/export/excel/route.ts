import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";
import ExcelJS from "exceljs";
import type { Prisma } from "@prisma/client";
import type { StoredFinancialPeriod, ExcelExportData } from "@/lib/excel/types";
import { createSummarySheet } from "@/lib/excel/summary-builder";
import { createInputsSheet } from "@/lib/excel/inputs-builder";
import {
  createTransposedSheet,
  PROFIT_LOSS_LINE_ITEMS,
  BALANCE_SHEET_LINE_ITEMS,
  CASH_FLOW_LINE_ITEMS,
} from "@/lib/excel/sheet-builders";
import { addChartNamedRanges } from "@/lib/excel/chart-ranges";

/**
 * Normalize stored financial periods from Prisma JSON
 */
const normalizeStoredPeriods = (
  financials: Prisma.JsonValue,
): StoredFinancialPeriod[] => {
  if (!Array.isArray(financials)) return [];

  return financials
    .map((period) =>
      typeof period === "object" && period !== null
        ? (period as Record<string, unknown>)
        : null,
    )
    .filter((period): period is Record<string, unknown> => period !== null)
    .map((period) => ({
      year: typeof period.year === "number" ? period.year : 0,
      profitLoss:
        period.profitLoss && typeof period.profitLoss === "object"
          ? (period.profitLoss as Record<string, unknown>)
          : {},
      balanceSheet:
        period.balanceSheet && typeof period.balanceSheet === "object"
          ? (period.balanceSheet as Record<string, unknown>)
          : {},
      cashFlow:
        period.cashFlow && typeof period.cashFlow === "object"
          ? (period.cashFlow as Record<string, unknown>)
          : {},
    }));
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check auth
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  // Await params (Next.js 15+ requirement)
  const { id } = await params;

  try {
    // Fetch proposal with all related data
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    // Fetch system config and transition config
    const systemConfig = await prisma.systemConfig.findFirst();
    const transitionConfig = await prisma.transitionConfig.findFirst();

    // Normalize financial periods
    const periods = normalizeStoredPeriods(proposal.financials);

    if (periods.length === 0) {
      return NextResponse.json(
        { error: "No financial data available for this proposal" },
        { status: 400 },
      );
    }

    // Prepare export data
    const exportData: ExcelExportData = {
      proposal,
      periods,
      systemConfig,
      transitionConfig,
    };

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CapEx Advisor";
    workbook.created = new Date();
    workbook.company = "CapEx Advisor";
    workbook.description = `Financial analysis for ${proposal.name}`;

    // --- SHEET 1: EXECUTIVE SUMMARY ---
    const summarySheet = workbook.addWorksheet("Executive Summary", {
      properties: { tabColor: { argb: "FFC9A86C" } }, // Copper (Chart-1)
    });
    createSummarySheet(summarySheet, exportData);

    // --- SHEET 2: INPUTS & ASSUMPTIONS ---
    const inputsSheet = workbook.addWorksheet("Inputs & Assumptions", {
      properties: { tabColor: { argb: "FFE4D4B8" } }, // Copper-300 (Light accent)
    });
    createInputsSheet(inputsSheet, exportData);

    // --- SHEET 3: PROFIT & LOSS ---
    const plSheet = workbook.addWorksheet("Profit & Loss", {
      properties: { tabColor: { argb: "FF2D7A4F" } }, // Desert Sage (Financial positive)
    });
    createTransposedSheet(
      {
        worksheet: plSheet,
        periods,
        lineItems: PROFIT_LOSS_LINE_ITEMS,
        freezePanes: true,
      },
      "profitLoss",
    );

    // --- SHEET 4: BALANCE SHEET ---
    const bsSheet = workbook.addWorksheet("Balance Sheet", {
      properties: { tabColor: { argb: "FF4A7C96" } }, // Twilight Blue (Chart-2)
    });
    createTransposedSheet(
      {
        worksheet: bsSheet,
        periods,
        lineItems: BALANCE_SHEET_LINE_ITEMS,
        freezePanes: true,
      },
      "balanceSheet",
    );

    // --- SHEET 5: CASH FLOW ---
    const cfSheet = workbook.addWorksheet("Cash Flow", {
      properties: { tabColor: { argb: "FF7A9E8A" } }, // Sage (Chart-3)
    });
    createTransposedSheet(
      {
        worksheet: cfSheet,
        periods,
        lineItems: CASH_FLOW_LINE_ITEMS,
        freezePanes: true,
      },
      "cashFlow",
    );

    // --- ADD CHART NAMED RANGES ---
    addChartNamedRanges(workbook, periods.length);

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return Excel file
    const filename = `${proposal.name.replace(/[^a-zA-Z0-9]/g, "_")}_Financial_Report.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Excel file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
