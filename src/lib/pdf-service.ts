import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Proposal } from "@/lib/types/proposal";
import {
  formatCurrency,
  formatMillions,
  formatNumber,
  formatPercent,
  safeNumber,
} from "./format-utils";
import {
  generateExecutiveSummary,
  generateFinancialAnalysis,
} from "./report-insights";

// ============================================================================
// TYPES
// ============================================================================

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

/* eslint-disable no-restricted-syntax -- DTO interface for PDF generation, not used in calculations */
interface FinancialYearData {
  year: number;
  profitLoss: {
    totalRevenue: number | string;
    rentExpense: number | string;
    staffCosts: number | string;
    otherOpex: number | string;
    ebitda: number | string;
    netIncome: number | string;
  };
  cashFlow: {
    netChangeInCash: number | string;
  };
}

interface ProposalWithExtendedData
  extends Omit<Proposal, "contractPeriodYears"> {
  contractPeriodYears?: number;
  rentParams?: {
    baseRent?: number | string;
    revenueSharePercent?: number | string;
    growthRate?: number | string;
    frequency?: number;
  };
  enrollment?: {
    totalCapacity?: number;
    steadyStateStudents?: number;
  };
  curriculum?: {
    ibProgramEnabled?: boolean;
  };
}
/* eslint-enable no-restricted-syntax */

export async function generateComprehensiveReport(
  proposal: Proposal,
  chartImage?: string,
) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let currentY = margin;

  // Helper to check page break
  const checkPageBreak = (heightNeeded: number) => {
    if (currentY + heightNeeded > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Helper for section headers
  const addSectionHeader = (title: string) => {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), margin, currentY);
    currentY += 10;
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
  };

  // Helper for paragraphs
  const addParagraph = (text: string) => {
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
    const height = splitText.length * 5;
    checkPageBreak(height + 10);
    doc.text(splitText, margin, currentY);
    currentY += height + 10;
  };

  // ==========================================
  // 1. COVER PAGE / HEADER
  // ==========================================
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont("helvetica", "bold");
  doc.text("Lease Proposal Assessment", margin, currentY);
  currentY += 10;

  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont("helvetica", "normal");
  doc.text("Project Zeta Executive Report", margin, currentY);
  currentY += 20;

  // Proposal Details Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 40, 3, 3, "FD");

  const detailsY = currentY + 15;
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(proposal.name || "Untitled Proposal", margin + 10, detailsY);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Developer: ${proposal.developer || "N/A"}`,
    margin + 10,
    detailsY + 8,
  );
  doc.text(
    `Rent Model: ${proposal.rentModel || "N/A"}`,
    margin + 10,
    detailsY + 14,
  );
  doc.text(
    `Date: ${new Date().toLocaleDateString()}`,
    pageWidth - margin - 50,
    detailsY + 8,
  );

  currentY += 50;

  // ==========================================
  // 2. EXECUTIVE SUMMARY
  // ==========================================
  addSectionHeader("Executive Summary");
  const summaryText = generateExecutiveSummary(proposal);
  addParagraph(summaryText);

  // KPI Grid (Simulated with AutoTable for layout)
  const metrics = proposal.metrics;
  const kpiData = [
    [
      {
        content: "Total Rent (30y)",
        styles: {
          textColor: [100, 116, 139] as [number, number, number],
          fontSize: 8,
        },
      },
      {
        content: "NPV",
        styles: {
          textColor: [100, 116, 139] as [number, number, number],
          fontSize: 8,
        },
      },
      {
        content: "IRR",
        styles: {
          textColor: [100, 116, 139] as [number, number, number],
          fontSize: 8,
        },
      },
      {
        content: "Payback",
        styles: {
          textColor: [100, 116, 139] as [number, number, number],
          fontSize: 8,
        },
      },
    ],
    [
      {
        content: formatMillions(metrics?.totalRent),
        styles: {
          fontSize: 14,
          fontStyle: "bold" as const,
          textColor: [15, 23, 42] as [number, number, number],
        },
      },
      {
        content: formatMillions(metrics?.npv),
        styles: {
          fontSize: 14,
          fontStyle: "bold" as const,
          textColor: (safeNumber(metrics?.npv) >= 0
            ? [21, 128, 61]
            : [185, 28, 28]) as [number, number, number],
        },
      },
      {
        content: formatPercent(metrics?.irr),
        styles: {
          fontSize: 14,
          fontStyle: "bold" as const,
          textColor: [15, 23, 42] as [number, number, number],
        },
      },
      {
        content: `${safeNumber(metrics?.paybackPeriod).toFixed(1)} Yrs`,
        styles: {
          fontSize: 14,
          fontStyle: "bold" as const,
          textColor: [15, 23, 42] as [number, number, number],
        },
      },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: kpiData,
    theme: "plain",
    styles: { cellPadding: 5, halign: "center" },
    columnStyles: {
      0: { cellWidth: (pageWidth - margin * 2) / 4 },
      1: { cellWidth: (pageWidth - margin * 2) / 4 },
      2: { cellWidth: (pageWidth - margin * 2) / 4 },
      3: { cellWidth: (pageWidth - margin * 2) / 4 },
    },
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // ==========================================
  // 3. RENT TRAJECTORY CHART
  // ==========================================
  if (chartImage) {
    checkPageBreak(100);
    addSectionHeader("Rent Trajectory (2028-2053)");
    // Aspect ratio 16:9 roughly
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = imgWidth * 0.5;
    doc.addImage(chartImage, "PNG", margin, currentY, imgWidth, imgHeight);
    currentY += imgHeight + 15;
  }

  // ==========================================
  // 4. KEY ASSUMPTIONS
  // ==========================================
  addSectionHeader("Key Assumptions");

  // Assumptions Data
  const extendedProposal = proposal as ProposalWithExtendedData;
  const assumptionsData = [
    [
      "Contract Period",
      `${safeNumber(extendedProposal.contractPeriodYears) || 30} Years`,
    ],
    ["Rent Model", proposal.rentModel || "N/A"],
    [
      "Base Rent / Share",
      proposal.rentModel === "FIXED"
        ? formatCurrency(extendedProposal.rentParams?.baseRent)
        : formatPercent(extendedProposal.rentParams?.revenueSharePercent),
    ],
    [
      "Escalation",
      proposal.rentModel === "FIXED"
        ? `${formatPercent(extendedProposal.rentParams?.growthRate)} every ${extendedProposal.rentParams?.frequency} years`
        : "N/A",
    ],
    [
      "Capacity",
      `${formatNumber(extendedProposal.enrollment?.totalCapacity)} Students`,
    ],
    [
      "Steady State",
      `${formatNumber(extendedProposal.enrollment?.steadyStateStudents)} Students`,
    ],
    [
      "IB Program",
      extendedProposal.curriculum?.ibProgramEnabled ? "Yes" : "No",
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Assumption", "Value"]],
    body: assumptionsData,
    theme: "striped",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // ==========================================
  // 5. FINANCIAL ANALYSIS
  // ==========================================
  addSectionHeader("Financial Analysis");
  const analysisText = generateFinancialAnalysis(proposal);
  addParagraph(analysisText);

  // ==========================================
  // 6. FINANCIAL STATEMENTS (Pivot Years)
  // ==========================================
  addSectionHeader("Financial Statements (Pivot Years)");

  // Define Pivot Years
  const pivotYears = [
    2023, 2024, 2025, 2028, 2029, 2030, 2040, 2041, 2052, 2053,
  ];
  const financials = proposal.financials || [];

  // Filter data for pivot years
  const pivotData = pivotYears.map((year) => {
    const yearData = (financials as FinancialYearData[] | undefined)?.find(
      (f) => f.year === year,
    );
    return {
      year,
      revenue: safeNumber(yearData?.profitLoss?.totalRevenue),
      rent: safeNumber(yearData?.profitLoss?.rentExpense),
      staffCosts: safeNumber(yearData?.profitLoss?.staffCosts),
      opex: safeNumber(yearData?.profitLoss?.otherOpex),
      ebitda: safeNumber(yearData?.profitLoss?.ebitda),
      netIncome: safeNumber(yearData?.profitLoss?.netIncome),
      cashFlow: safeNumber(yearData?.cashFlow?.netChangeInCash),
    };
  });

  // Prepare Table Data
  // Rows: Revenue, Rent, Staff, Opex, EBITDA, Net Income, Cash Flow
  const tableRows = [
    ["Revenue", ...pivotData.map((d) => formatMillions(d.revenue))],
    ["Rent", ...pivotData.map((d) => formatMillions(d.rent))],
    ["Staff Costs", ...pivotData.map((d) => formatMillions(d.staffCosts))],
    ["Other OpEx", ...pivotData.map((d) => formatMillions(d.opex))],
    ["EBITDA", ...pivotData.map((d) => formatMillions(d.ebitda))],
    ["Net Income", ...pivotData.map((d) => formatMillions(d.netIncome))],
    ["Cash Flow", ...pivotData.map((d) => formatMillions(d.cashFlow))],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Item", ...pivotYears.map((y) => y.toString())]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 8,
      halign: "center",
    },
    styles: { fontSize: 8, cellPadding: 3, halign: "right" },
    columnStyles: { 0: { halign: "left", fontStyle: "bold", cellWidth: 30 } },
    didParseCell: function (data) {
      // Highlight EBITDA and Net Income rows
      if (data.row.index === 4 || data.row.index === 5) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  doc.save(`${(proposal.name || "Proposal").replace(/\s+/g, "_")}_Report.pdf`);
}
