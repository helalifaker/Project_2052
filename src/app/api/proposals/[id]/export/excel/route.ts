import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";
import ExcelJS from "exceljs";
import Decimal from "decimal.js";

type ProposalMetrics = {
  npv?: number | string;
  irr?: number | string;
  paybackPeriod?: number | string;
  roiPercent?: number | string;
};

type ProfitLossRow = {
  revenue: Decimal.Value;
  rent: Decimal.Value;
  operatingCosts: Decimal.Value;
  ebitda: Decimal.Value;
  netIncome: Decimal.Value;
};

type CashFlowRow = {
  operating: Decimal.Value;
  investing: Decimal.Value;
  free: Decimal.Value;
  cumulative: Decimal.Value;
};

const toNumber = (value: unknown): number => {
  if (value instanceof Decimal) return value.toNumber();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
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

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CapEx Advisor";
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Property", key: "property", width: 30 },
      { header: "Value", key: "value", width: 30 },
    ];

    // Add summary data
    summarySheet.addRow({ property: "Proposal Name", value: proposal.name });
    summarySheet.addRow({
      property: "Rent Model",
      value: proposal.rentModel,
    });
    summarySheet.addRow({
      property: "Created Date",
      value: proposal.createdAt.toISOString().split("T")[0],
    });
    summarySheet.addRow({
      property: "Created By",
      value: proposal.creator.email,
    });
    summarySheet.addRow({ property: "", value: "" });

    // Financial Metrics
    if (proposal.metrics) {
      const metrics = proposal.metrics as ProposalMetrics;
      summarySheet.addRow({ property: "Financial Metrics", value: "" });
      if (metrics.npv !== undefined) {
        summarySheet.addRow({
          property: "NPV",
          value: `€${(toNumber(metrics.npv) / 1_000_000).toFixed(2)}M`,
        });
      }
      if (metrics.irr !== undefined) {
        summarySheet.addRow({
          property: "IRR",
          value: `${toNumber(metrics.irr).toFixed(2)}%`,
        });
      }
      if (metrics.paybackPeriod !== undefined) {
        summarySheet.addRow({
          property: "Payback Period",
          value: `${toNumber(metrics.paybackPeriod).toFixed(1)} years`,
        });
      }
      if (metrics.roiPercent !== undefined) {
        summarySheet.addRow({
          property: "ROI",
          value: `${toNumber(metrics.roiPercent).toFixed(2)}%`,
        });
      }
    }

    // Style the header row
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    summarySheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    // Financial Statements Sheet
    if (proposal.financials) {
      const financials = proposal.financials as {
        profitAndLoss?: ProfitLossRow[];
        cashFlow?: CashFlowRow[];
      };

      // P&L Sheet
      if (financials.profitAndLoss) {
        const plSheet = workbook.addWorksheet("Profit & Loss");
        const plData = financials.profitAndLoss;

        plSheet.columns = [
          { header: "Year", key: "year", width: 10 },
          { header: "Revenue", key: "revenue", width: 15 },
          { header: "Rent Expense", key: "rent", width: 15 },
          { header: "Operating Costs", key: "opex", width: 15 },
          { header: "EBITDA", key: "ebitda", width: 15 },
          { header: "Net Income", key: "netIncome", width: 15 },
        ];

        // Add data rows
        plData.forEach((row, index) => {
          plSheet.addRow({
            year: index + 1,
            revenue: toNumber(row.revenue) / 1_000_000,
            rent: toNumber(row.rent) / 1_000_000,
            opex: toNumber(row.operatingCosts) / 1_000_000,
            ebitda: toNumber(row.ebitda) / 1_000_000,
            netIncome: toNumber(row.netIncome) / 1_000_000,
          });
        });

        // Style header
        plSheet.getRow(1).font = { bold: true };
        plSheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F46E5" },
        };
        plSheet.getRow(1).font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };
      }

      // Cash Flow Sheet
      if (financials.cashFlow) {
        const cfSheet = workbook.addWorksheet("Cash Flow");
        const cfData = financials.cashFlow;

        cfSheet.columns = [
          { header: "Year", key: "year", width: 10 },
          { header: "Operating CF", key: "operating", width: 15 },
          { header: "Investing CF", key: "investing", width: 15 },
          { header: "Free CF", key: "free", width: 15 },
          { header: "Cumulative CF", key: "cumulative", width: 15 },
        ];

        cfData.forEach((row, index) => {
          cfSheet.addRow({
            year: index + 1,
            operating: toNumber(row.operating) / 1_000_000,
            investing: toNumber(row.investing) / 1_000_000,
            free: toNumber(row.free) / 1_000_000,
            cumulative: toNumber(row.cumulative) / 1_000_000,
          });
        });

        // Style header
        cfSheet.getRow(1).font = { bold: true };
        cfSheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F46E5" },
        };
        cfSheet.getRow(1).font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };
      }
    }

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${proposal.name.replace(/\s+/g, "_")}_Report.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 },
    );
  }
}
