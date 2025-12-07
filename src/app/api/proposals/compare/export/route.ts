import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import { jsPDF } from "jspdf";
import { z } from "zod";

/**
 * Export Comparison to PDF API Endpoint
 *
 * Track 4B: Proposal Comparison Page - Advanced Features
 *
 * Features:
 * - Accept list of proposal IDs in request body
 * - Generate PDF with comparison matrix table
 * - Include all selected proposal metrics
 * - Show winner highlighting
 * - Include financial statements side-by-side
 * - Return PDF as downloadable file
 */

const ExportComparisonRequestSchema = z.object({
  proposalIds: z.array(z.string()).min(2).max(5),
});

type ProposalWithMetrics = {
  id: string;
  name: string | null;
  developer: string | null;
  property: string | null;
  rentModel: string | null;
  enrollment: unknown;
  curriculum: unknown;
  staff: unknown;
  rentParams: unknown;
  financials: unknown;
  metrics: unknown;
  calculatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    email: string;
  } | null;
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && value && "toString" in value) {
    const parsed = Number((value as { toString: () => string }).toString());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

type FinancialPeriodSnapshot = {
  year: number;
  profitLoss?: Record<string, unknown>;
  balanceSheet?: Record<string, unknown>;
  cashFlow?: Record<string, unknown>;
};

const normalizeFinancials = (
  financials: unknown,
): FinancialPeriodSnapshot[] => {
  if (!Array.isArray(financials)) return [];

  return financials
    .map((period) =>
      typeof period === "object" && period !== null
        ? (period as Record<string, unknown>)
        : null,
    )
    .filter((period): period is Record<string, unknown> => period !== null)
    .map((period) => ({
      year:
        typeof period.year === "number" ? period.year : toNumber(period.year),
      profitLoss:
        period.profitLoss && typeof period.profitLoss === "object"
          ? (period.profitLoss as Record<string, unknown>)
          : undefined,
      balanceSheet:
        period.balanceSheet && typeof period.balanceSheet === "object"
          ? (period.balanceSheet as Record<string, unknown>)
          : undefined,
      cashFlow:
        period.cashFlow && typeof period.cashFlow === "object"
          ? (period.cashFlow as Record<string, unknown>)
          : undefined,
    }));
};

export async function POST(request: Request) {
  // Check auth
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    // Parse request body
    const body = await request.json();
    const validation = ExportComparisonRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { proposalIds } = validation.data;

    // Fetch proposals with only the fields needed for PDF generation
    // PERFORMANCE: Using select instead of include to avoid fetching large JSON fields
    // that aren't needed (enrollment, curriculum, staff, rentParams)
    const proposals: ProposalWithMetrics[] =
      await prisma.leaseProposal.findMany({
        where: {
          id: { in: proposalIds },
        },
        select: {
          id: true,
          name: true,
          developer: true,
          property: true,
          rentModel: true,
          financials: true, // Needed for Year 10 financial statements
          metrics: true, // Needed for comparison matrix
          calculatedAt: true,
          createdAt: true,
          updatedAt: true,
          // Excluded: enrollment, curriculum, staff, rentParams (not used in PDF)
          enrollment: true, // Keep for type compatibility (can be removed if type is updated)
          curriculum: true,
          staff: true,
          rentParams: true,
          creator: {
            select: {
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    if (proposals.length === 0) {
      return NextResponse.json(
        { error: "No proposals found" },
        { status: 404 },
      );
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    const margin = 15;
    const usableWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(18);
    doc.text("Proposal Comparison Report", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 10;

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      yPos,
      { align: "center" },
    );
    yPos += 15;

    // Comparison Matrix Table
    doc.setFontSize(14);
    doc.text("Comparison Matrix", margin, yPos);
    yPos += 8;

    // Calculate column widths
    const labelColWidth = 50;
    const valueColWidth = (usableWidth - labelColWidth) / proposals.length;

    // Draw table header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    // Header row
    doc.rect(margin, yPos, labelColWidth, 10);
    doc.text("Metric", margin + 2, yPos + 6);

    proposals.forEach((proposal, index) => {
      const xPos = margin + labelColWidth + index * valueColWidth;
      doc.rect(xPos, yPos, valueColWidth, 10);
      const proposalName = proposal.name || "Unnamed";
      const text =
        proposalName.length > 20
          ? proposalName.substring(0, 20) + "..."
          : proposalName;
      doc.text(text, xPos + 2, yPos + 6);
    });
    yPos += 10;

    doc.setFont("helvetica", "normal");

    // Metrics to compare
    const metrics = [
      {
        label: "Developer",
        getValue: (p: ProposalWithMetrics) => p.developer || "N/A",
      },
      {
        label: "Rent Model",
        getValue: (p: ProposalWithMetrics) => p.rentModel,
      },
      {
        label: "NPV (M)",
        getValue: (p: ProposalWithMetrics) => {
          const metricsData =
            p.metrics &&
            typeof p.metrics === "object" &&
            !Array.isArray(p.metrics)
              ? (p.metrics as Record<string, unknown>)
              : null;
          const npv = metricsData ? metricsData.npv : null;
          return npv !== undefined && npv !== null
            ? `€${(toNumber(npv) / 1_000_000).toFixed(2)}M`
            : "N/A";
        },
        isNumeric: true,
      },
      {
        label: "IRR (%)",
        getValue: (p: ProposalWithMetrics) => {
          const metricsData =
            p.metrics &&
            typeof p.metrics === "object" &&
            !Array.isArray(p.metrics)
              ? (p.metrics as Record<string, unknown>)
              : null;
          const irr = metricsData ? metricsData.irr : null;
          return irr !== undefined && irr !== null
            ? `${toNumber(irr).toFixed(2)}%`
            : "N/A";
        },
        isNumeric: true,
      },
      {
        label: "Payback Period (years)",
        getValue: (p: ProposalWithMetrics) => {
          const metricsData =
            p.metrics &&
            typeof p.metrics === "object" &&
            !Array.isArray(p.metrics)
              ? (p.metrics as Record<string, unknown>)
              : null;
          const pp = metricsData ? metricsData.paybackPeriod : null;
          return pp !== undefined && pp !== null
            ? toNumber(pp).toFixed(1)
            : "N/A";
        },
        isNumeric: true,
      },
      {
        label: "Total Rent (30yr, M)",
        getValue: (p: ProposalWithMetrics) => {
          const metricsData =
            p.metrics &&
            typeof p.metrics === "object" &&
            !Array.isArray(p.metrics)
              ? (p.metrics as Record<string, unknown>)
              : null;
          const totalRent = metricsData ? metricsData.totalRent : null;
          return totalRent !== undefined && totalRent !== null
            ? `€${(toNumber(totalRent) / 1_000_000).toFixed(2)}M`
            : "N/A";
        },
        isNumeric: true,
      },
      {
        label: "Avg EBITDA (M)",
        getValue: (p: ProposalWithMetrics) => {
          const metricsData =
            p.metrics &&
            typeof p.metrics === "object" &&
            !Array.isArray(p.metrics)
              ? (p.metrics as Record<string, unknown>)
              : null;
          const avgEbitda = metricsData ? metricsData.avgEbitda : null;
          return avgEbitda !== undefined && avgEbitda !== null
            ? `€${(toNumber(avgEbitda) / 1_000_000).toFixed(2)}M`
            : "N/A";
        },
        isNumeric: true,
      },
      {
        label: "Peak Debt (M)",
        getValue: (p: ProposalWithMetrics) => {
          const metricsData =
            p.metrics &&
            typeof p.metrics === "object" &&
            !Array.isArray(p.metrics)
              ? (p.metrics as Record<string, unknown>)
              : null;
          const peakDebt = metricsData ? metricsData.peakDebt : null;
          return peakDebt !== undefined && peakDebt !== null
            ? `€${(toNumber(peakDebt) / 1_000_000).toFixed(2)}M`
            : "N/A";
        },
        isNumeric: true,
      },
      {
        label: "Final Cash (M)",
        getValue: (p: ProposalWithMetrics) => {
          const metricsData =
            p.metrics &&
            typeof p.metrics === "object" &&
            !Array.isArray(p.metrics)
              ? (p.metrics as Record<string, unknown>)
              : null;
          const finalCash = metricsData ? metricsData.finalCash : null;
          return finalCash !== undefined && finalCash !== null
            ? `€${(toNumber(finalCash) / 1_000_000).toFixed(2)}M`
            : "N/A";
        },
        isNumeric: true,
      },
    ];

    // Find winners for numeric metrics
    const findWinner = (metricIndex: number): number | null => {
      const metric = metrics[metricIndex];
      if (!metric.isNumeric) return null;

      let bestValue: number | null = null;
      let bestIndex: number | null = null;

      proposals.forEach((proposal, index) => {
        const valueStr = metric.getValue(proposal);
        if (valueStr === "N/A") return;

        // Parse numeric value (remove currency symbols, M, %, etc.)
        const numericStr = valueStr.replace(/[€M%,]/g, "");
        const value = parseFloat(numericStr);

        if (isNaN(value)) return;

        // For NPV, IRR, Total Rent, Avg EBITDA, Final Cash: higher is better
        // For Payback Period, Peak Debt: lower is better
        const isBetterValue =
          metric.label.includes("Payback") || metric.label.includes("Debt")
            ? bestValue === null || value < bestValue
            : bestValue === null || value > bestValue;

        if (isBetterValue) {
          bestValue = value;
          bestIndex = index;
        }
      });

      return bestIndex;
    };

    // Draw metric rows
    metrics.forEach((metric, metricIndex) => {
      const winnerIndex = findWinner(metricIndex);

      // Check if we need a new page
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      // Label cell
      doc.rect(margin, yPos, labelColWidth, 8);
      doc.text(metric.label, margin + 2, yPos + 5);

      // Value cells
      proposals.forEach((proposal, index) => {
        const xPos = margin + labelColWidth + index * valueColWidth;
        const value = metric.getValue(proposal) || "N/A";

        // Highlight winner
        if (index === winnerIndex) {
          doc.setFillColor(220, 252, 231); // Light green
          doc.rect(xPos, yPos, valueColWidth, 8, "FD");
        } else {
          doc.rect(xPos, yPos, valueColWidth, 8);
        }

        doc.text(value, xPos + 2, yPos + 5);
      });

      yPos += 8;
    });

    yPos += 10;

    // Financial Statements Summary Section
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text("Financial Statements Summary", margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.text(
      "Key financial metrics from Year 10 (2034) projections:",
      margin,
      yPos,
    );
    yPos += 8;

    // Year 10 Financial Summary Table
    const year10Metrics = [
      {
        label: "Revenue (M)",
        path: "profitLoss.totalRevenue",
      },
      {
        label: "EBITDA (M)",
        path: "profitLoss.ebitda",
      },
      {
        label: "Net Income (M)",
        path: "profitLoss.netIncome",
      },
      {
        label: "Total Assets (M)",
        path: "balanceSheet.totalAssets",
      },
      {
        label: "Debt Balance (M)",
        path: "balanceSheet.debtBalance",
      },
      {
        label: "Cash Balance (M)",
        path: "balanceSheet.cash",
      },
      {
        label: "Operating CF (M)",
        path: "cashFlow.cashFlowFromOperations",
      },
    ];

    // Header
    doc.setFont("helvetica", "bold");
    doc.rect(margin, yPos, labelColWidth, 8);
    doc.text("Metric (Year 10)", margin + 2, yPos + 5);

    proposals.forEach((proposal, index) => {
      const xPos = margin + labelColWidth + index * valueColWidth;
      doc.rect(xPos, yPos, valueColWidth, 8);
      const proposalName = proposal.name || "Unnamed";
      const text =
        proposalName.length > 15
          ? proposalName.substring(0, 15) + "..."
          : proposalName;
      doc.text(text, xPos + 2, yPos + 5);
    });
    yPos += 8;

    doc.setFont("helvetica", "normal");

    // Year 10 data rows
    year10Metrics.forEach((metric) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      doc.rect(margin, yPos, labelColWidth, 8);
      doc.text(metric.label, margin + 2, yPos + 5);

      proposals.forEach((proposal, index) => {
        const xPos = margin + labelColWidth + index * valueColWidth;
        doc.rect(xPos, yPos, valueColWidth, 8);

        // Get Year 10 (2034) data
        const financials = normalizeFinancials(proposal.financials);
        const year10Data = financials.find((f) => f.year === 2034);

        if (year10Data) {
          const keys = metric.path.split(".");
          let value: unknown = year10Data;
          for (const key of keys) {
            if (value && typeof value === "object") {
              value = (value as Record<string, unknown>)[key];
            } else {
              value = undefined;
              break;
            }
          }

          if (value !== undefined && value !== null) {
            const formattedValue = `€${(toNumber(value) / 1_000_000).toFixed(2)}M`;
            doc.text(formattedValue, xPos + 2, yPos + 5);
          } else {
            doc.text("N/A", xPos + 2, yPos + 5);
          }
        } else {
          doc.text("N/A", xPos + 2, yPos + 5);
        }
      });

      yPos += 8;
    });

    // Footer
    doc.setFontSize(8);
    doc.text(
      "CapEx Advisor - Generated with Claude Code",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");

    // Return PDF as response
    const filename = `Comparison_${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating comparison PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
