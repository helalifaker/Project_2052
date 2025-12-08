/**
 * Executive PDF Report Generator
 * ================================
 * Premium quality PDF generation for board-level lease proposal presentations.
 * Uses jsPDF with custom styling for a professional, executive aesthetic.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Proposal } from "@/lib/types/proposal";
import { safeNumber } from "@/lib/format-utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

/* eslint-disable no-restricted-syntax -- DTO interface for PDF generation */
interface FinancialYearData {
  year: number;
  profitLoss?: {
    totalRevenue?: number | string;
    rentExpense?: number | string;
    staffCosts?: number | string;
    otherOpex?: number | string;
    depreciation?: number | string;
    ebitda?: number | string;
    ebit?: number | string;
    interestExpense?: number | string;
    zakatExpense?: number | string;
    netIncome?: number | string;
  };
  balanceSheet?: {
    cash?: number | string;
    totalAssets?: number | string;
    totalLiabilities?: number | string;
    totalEquity?: number | string;
  };
  cashFlow?: {
    netChangeInCash?: number | string;
    cashFlowFromOperations?: number | string;
    cashFlowFromInvesting?: number | string;
    cashFlowFromFinancing?: number | string;
  };
}

interface ProposalMetrics {
  totalRent?: number | string;
  npv?: number | string;
  irr?: number | string;
  paybackPeriod?: number | string;
  totalRevenue?: number | string;
  totalEbitda?: number | string;
  contractNAV?: number | string;
  contractEbitdaNPV?: number | string;
  peakDebt?: number | string;
  maxDebt?: number | string;
  finalCash?: number | string;
}

interface ExtendedProposal extends Omit<Proposal, "metrics" | "financials"> {
  metrics?: ProposalMetrics;
  financials?: FinancialYearData[];
  contractPeriodYears?: number;
  rentParams?: {
    baseRent?: number | string;
    revenueSharePercent?: number | string;
    escalationRate?: number | string;
    escalationFrequency?: number;
    landCost?: number | string;
    constructionCost?: number | string;
    yieldRate?: number | string;
  };
  enrollment?: {
    totalCapacity?: number;
    frenchCapacity?: number;
    ibCapacity?: number;
    steadyStateStudents?: number;
    rampUpYears?: number;
  };
  curriculum?: {
    ibProgramEnabled?: boolean;
    frenchProgramEnabled?: boolean;
  };
  otherOpexPercent?: number | string;
}
/* eslint-enable no-restricted-syntax */

// ============================================================================
// EXECUTIVE COLOR PALETTE
// ============================================================================

const COLORS = {
  // Primary Palette
  copper: { r: 166, g: 139, b: 91 }, // #A68B5B - Executive accent
  copperLight: { r: 201, g: 168, b: 108 }, // #C9A86C
  copperMuted: { r: 228, g: 212, b: 184 }, // #E4D4B8

  // Neutrals
  slate900: { r: 15, g: 23, b: 42 }, // #0F172A - Primary text
  slate800: { r: 30, g: 41, b: 59 }, // #1E293B
  slate700: { r: 51, g: 65, b: 85 }, // #334155
  slate600: { r: 71, g: 85, b: 105 }, // #475569
  slate500: { r: 100, g: 116, b: 139 }, // #64748B
  slate400: { r: 148, g: 163, b: 184 }, // #94A3B8
  slate300: { r: 203, g: 213, b: 225 }, // #CBD5E1
  slate200: { r: 226, g: 232, b: 240 }, // #E2E8F0
  slate100: { r: 241, g: 245, b: 249 }, // #F1F5F9
  slate50: { r: 248, g: 250, b: 252 }, // #F8FAFC

  // Semantic Colors
  positive: { r: 21, g: 128, b: 61 }, // #15803D - Green
  positiveLight: { r: 220, g: 252, b: 231 }, // #DCFCE7
  negative: { r: 185, g: 28, b: 28 }, // #B91C1C - Red
  negativeLight: { r: 254, g: 226, b: 226 }, // #FEE2E2
  warning: { r: 180, g: 83, b: 9 }, // #B45309 - Amber
  warningLight: { r: 254, g: 243, b: 199 }, // #FEF3C7

  // White
  white: { r: 255, g: 255, b: 255 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatMoney = (value: unknown, decimals = 1): string => {
  const num = safeNumber(value);
  if (Math.abs(num) >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B SAR`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M SAR`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K SAR`;
  }
  return `${num.toFixed(0)} SAR`;
};

const formatMillions = (value: unknown, decimals = 1): string => {
  const num = safeNumber(value);
  return `${(num / 1_000_000).toFixed(decimals)}M`;
};

const formatPercent = (value: unknown, decimals = 1): string => {
  const num = safeNumber(value);
  // If value is already a decimal (0.15 for 15%), multiply by 100
  if (Math.abs(num) < 1) {
    return `${(num * 100).toFixed(decimals)}%`;
  }
  // If value is already a percentage (15 for 15%)
  return `${num.toFixed(decimals)}%`;
};

const formatNumber = (value: unknown): string => {
  const num = safeNumber(value);
  return new Intl.NumberFormat("en-US").format(num);
};

const formatYear = (year: number): string => year.toString();

// ============================================================================
// INSIGHT GENERATORS
// ============================================================================

function generateExecutiveSummary(proposal: ExtendedProposal): string {
  const metrics = proposal.metrics || {};
  const npv = safeNumber(metrics.npv);
  const totalRent = safeNumber(metrics.totalRent);
  const irr = safeNumber(metrics.irr);
  const nav = safeNumber(metrics.contractNAV);

  let sentiment: string;
  let recommendation: string;

  if (npv > 50_000_000) {
    sentiment = "demonstrates exceptional financial strength";
    recommendation = "highly recommended for approval";
  } else if (npv > 10_000_000) {
    sentiment = "shows strong financial viability";
    recommendation = "recommended for approval with standard monitoring";
  } else if (npv > 0) {
    sentiment = "exhibits moderate financial potential";
    recommendation =
      "conditionally recommended pending risk mitigation strategies";
  } else if (npv > -10_000_000) {
    sentiment = "presents marginal viability concerns";
    recommendation = "requires significant negotiation before consideration";
  } else {
    sentiment = "reveals substantial financial challenges";
    recommendation = "not recommended in current form";
  }

  const rentModel = proposal.rentModel || "Standard";
  const developer = proposal.developer || "the proposed developer";
  const contractYears = proposal.contractPeriodYears || 30;

  return `This ${contractYears}-year lease proposal from ${developer}, structured under a ${rentModel} model, ${sentiment}. The total rent obligation amounts to ${formatMoney(totalRent)}, with a Net Present Value of ${formatMoney(npv)} and an Internal Rate of Return of ${formatPercent(irr)}. The Net Annualized Value (NAV) stands at ${formatMoney(nav)}, providing a normalized annual measure of value creation. Based on our comprehensive financial analysis, this proposal is ${recommendation}.`;
}

function generateRiskAssessment(proposal: ExtendedProposal): string[] {
  const risks: string[] = [];
  const metrics = proposal.metrics || {};
  const npv = safeNumber(metrics.npv);
  const peakDebt = safeNumber(metrics.peakDebt || metrics.maxDebt);
  const payback = safeNumber(metrics.paybackPeriod);
  const irr = safeNumber(metrics.irr);

  // NPV Risk
  if (npv < 0) {
    risks.push(
      `Negative NPV Risk: The proposal shows a negative NPV of ${formatMoney(npv)}, indicating potential value destruction over the contract term.`,
    );
  }

  // Debt Risk
  if (peakDebt > 100_000_000) {
    risks.push(
      `High Leverage Risk: Peak debt reaches ${formatMoney(peakDebt)}, requiring careful cash flow management and covenant monitoring.`,
    );
  }

  // Payback Risk
  if (payback > 15) {
    risks.push(
      `Extended Payback Risk: The ${payback.toFixed(1)}-year payback period exceeds half the contract term, increasing exposure to market volatility.`,
    );
  }

  // IRR Risk
  if (irr < 0.05) {
    risks.push(
      `Return Risk: IRR of ${formatPercent(irr)} falls below typical hurdle rates, questioning capital allocation efficiency.`,
    );
  }

  // Enrollment Risk
  const enrollment = proposal.enrollment;
  if (enrollment?.rampUpYears && enrollment.rampUpYears > 5) {
    risks.push(
      `Ramp-Up Risk: Extended ${enrollment.rampUpYears}-year enrollment ramp-up increases early-stage cash burn and uncertainty.`,
    );
  }

  // Rent Model Specific Risks
  if (proposal.rentModel === "REVSHARE") {
    risks.push(
      `Variable Cost Risk: Revenue share model creates cost volatility tied to enrollment performance, amplifying downside scenarios.`,
    );
  }

  if (risks.length === 0) {
    risks.push(
      "No significant risks identified. Standard monitoring protocols recommended.",
    );
  }

  return risks;
}

function generateKeyStrengths(proposal: ExtendedProposal): string[] {
  const strengths: string[] = [];
  const metrics = proposal.metrics || {};
  const npv = safeNumber(metrics.npv);
  const irr = safeNumber(metrics.irr);
  const finalCash = safeNumber(metrics.finalCash);

  if (npv > 50_000_000) {
    strengths.push(
      `Strong Value Creation: NPV of ${formatMoney(npv)} indicates substantial value generation over the contract term.`,
    );
  }

  if (irr > 0.12) {
    strengths.push(
      `Attractive Returns: IRR of ${formatPercent(irr)} significantly exceeds typical cost of capital benchmarks.`,
    );
  }

  if (finalCash > 100_000_000) {
    strengths.push(
      `Robust Terminal Position: Final cash position of ${formatMoney(finalCash)} provides strong exit flexibility.`,
    );
  }

  if (proposal.rentModel === "FIXED") {
    strengths.push(
      `Predictable Cost Structure: Fixed escalation model enables accurate long-term budgeting and reduces rent volatility.`,
    );
  }

  if (
    proposal.enrollment?.steadyStateStudents &&
    proposal.enrollment.totalCapacity
  ) {
    const utilization =
      proposal.enrollment.steadyStateStudents /
      proposal.enrollment.totalCapacity;
    if (utilization > 0.85) {
      strengths.push(
        `High Utilization Target: ${formatPercent(utilization)} steady-state occupancy maximizes revenue per square meter.`,
      );
    }
  }

  if (strengths.length === 0) {
    strengths.push(
      "Standard proposal metrics within acceptable ranges for further negotiation.",
    );
  }

  return strengths;
}

function generateFinancialCommentary(proposal: ExtendedProposal): string {
  const metrics = proposal.metrics || {};
  const financials = proposal.financials || [];

  const totalRevenue = safeNumber(metrics.totalRevenue);
  const totalEbitda = safeNumber(metrics.totalEbitda);
  const margin = totalRevenue > 0 ? totalEbitda / totalRevenue : 0;

  // Find key years
  const firstDynamic = financials.find((f) => f.year === 2028);
  const terminal = financials.find((f) => f.year === 2053);

  const firstRevenue = safeNumber(firstDynamic?.profitLoss?.totalRevenue);
  const terminalRevenue = safeNumber(terminal?.profitLoss?.totalRevenue);
  const cagr =
    firstRevenue > 0 ? Math.pow(terminalRevenue / firstRevenue, 1 / 25) - 1 : 0;

  let rentCommentary: string;
  switch (proposal.rentModel) {
    case "FIXED":
      rentCommentary =
        "The Fixed Escalation structure provides cost certainty, facilitating long-term planning while potentially limiting upside sharing with the landlord.";
      break;
    case "REVSHARE":
      rentCommentary =
        "The Revenue Share model aligns landlord incentives with operational performance, reducing early-stage risk but increasing rent in high-performance scenarios.";
      break;
    case "PARTNER":
      rentCommentary =
        "The Partner Investment model balances capital contribution with yield expectations, creating a shared-interest alignment structure.";
      break;
    default:
      rentCommentary =
        "The rent structure presents standard commercial terms requiring detailed evaluation.";
  }

  return `Over the ${proposal.contractPeriodYears || 30}-year contract period, cumulative revenue is projected at ${formatMoney(totalRevenue)}, generating total EBITDA of ${formatMoney(totalEbitda)} at an average margin of ${formatPercent(margin)}. Revenue demonstrates a compound annual growth rate of ${formatPercent(cagr)}, driven by enrollment maturation and tuition escalation. ${rentCommentary} The financial trajectory shows progressive strengthening from Year 1 (2028) through the terminal year, with steady-state operations anticipated by Year 5-6.`;
}

// ============================================================================
// PDF DOCUMENT BUILDER
// ============================================================================

export async function generateExecutiveReport(
  proposal: Proposal,
  chartImage?: string,
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  }) as jsPDFWithAutoTable;

  const extendedProposal = proposal as ExtendedProposal;
  const pageWidth = doc.internal.pageSize.width; // 210mm
  const pageHeight = doc.internal.pageSize.height; // 297mm
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;
  let pageNumber = 0;

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const setColor = (
    color: { r: number; g: number; b: number },
    type: "fill" | "text" | "draw" = "text",
  ) => {
    if (type === "fill") doc.setFillColor(color.r, color.g, color.b);
    else if (type === "text") doc.setTextColor(color.r, color.g, color.b);
    else doc.setDrawColor(color.r, color.g, color.b);
  };

  const addNewPage = () => {
    doc.addPage();
    pageNumber++;
    currentY = margin;
    addPageHeader();
  };

  const checkPageBreak = (heightNeeded: number): boolean => {
    if (currentY + heightNeeded > pageHeight - 25) {
      addNewPage();
      return true;
    }
    return false;
  };

  const addPageHeader = () => {
    // Top accent line
    setColor(COLORS.copper, "fill");
    doc.rect(0, 0, pageWidth, 3, "F");

    // Header text
    doc.setFontSize(8);
    setColor(COLORS.slate500);
    doc.setFont("helvetica", "normal");
    doc.text("PROJECT ZETA  •  CONFIDENTIAL", margin, 12);

    doc.text(`Page ${pageNumber}`, pageWidth - margin, 12, { align: "right" });

    // Separator line
    setColor(COLORS.slate200, "draw");
    doc.setLineWidth(0.3);
    doc.line(margin, 15, pageWidth - margin, 15);

    currentY = 25;
  };

  const addPageFooter = () => {
    const footerY = pageHeight - 12;

    setColor(COLORS.slate300, "draw");
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(7);
    setColor(COLORS.slate400);
    doc.text(
      `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}  |  Proposal ID: ${proposal.id?.slice(0, 8) || "N/A"}`,
      margin,
      footerY,
    );
    doc.text(
      "For internal decision-making purposes only",
      pageWidth - margin,
      footerY,
      { align: "right" },
    );
  };

  const addSectionTitle = (title: string) => {
    checkPageBreak(20);

    // Copper accent bar
    setColor(COLORS.copper, "fill");
    doc.rect(margin, currentY, 3, 8, "F");

    // Title text
    doc.setFontSize(14);
    setColor(COLORS.slate800);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), margin + 8, currentY + 6);

    currentY += 15;
  };

  const addSubsectionTitle = (title: string) => {
    checkPageBreak(15);

    doc.setFontSize(11);
    setColor(COLORS.slate700);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, currentY);

    currentY += 8;
  };

  const addParagraph = (text: string, indent = 0) => {
    doc.setFontSize(10);
    setColor(COLORS.slate600);
    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(text, contentWidth - indent);
    const lineHeight = 5;
    const totalHeight = lines.length * lineHeight;

    checkPageBreak(totalHeight + 5);

    doc.text(lines, margin + indent, currentY);
    currentY += totalHeight + 5;
  };

  const addBulletPoint = (text: string, bulletChar = "•") => {
    doc.setFontSize(10);
    setColor(COLORS.copper);
    doc.setFont("helvetica", "bold");
    doc.text(bulletChar, margin, currentY);

    setColor(COLORS.slate600);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, contentWidth - 8);
    doc.text(lines, margin + 6, currentY);

    currentY += lines.length * 5 + 3;
  };

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  pageNumber = 1;

  // Full-page copper accent at top
  setColor(COLORS.copper, "fill");
  doc.rect(0, 0, pageWidth, 60, "F");

  // Decorative lines (subtle pattern)
  setColor({ r: 200, g: 175, b: 130 }, "fill"); // Lighter copper
  for (let i = 0; i < 5; i++) {
    doc.rect(pageWidth - 80 + i * 12, 15 + i * 6, 60, 0.5, "F");
  }

  // Main title
  doc.setFontSize(28);
  setColor(COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text("LEASE PROPOSAL", margin, 35);
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("EXECUTIVE ASSESSMENT REPORT", margin, 45);

  // Proposal name section
  currentY = 80;

  setColor(COLORS.slate100, "fill");
  doc.roundedRect(margin, currentY, contentWidth, 50, 3, 3, "F");

  doc.setFontSize(10);
  setColor(COLORS.slate500);
  doc.setFont("helvetica", "normal");
  doc.text("PROPOSAL NAME", margin + 10, currentY + 12);

  doc.setFontSize(20);
  setColor(COLORS.slate900);
  doc.setFont("helvetica", "bold");
  const proposalName = proposal.name || "Untitled Proposal";
  const nameLines = doc.splitTextToSize(proposalName, contentWidth - 20);
  doc.text(nameLines, margin + 10, currentY + 25);

  doc.setFontSize(11);
  setColor(COLORS.slate600);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Developer: ${proposal.developer || "N/A"}`,
    margin + 10,
    currentY + 40,
  );

  currentY += 65;

  // Key metrics grid
  const metrics = extendedProposal.metrics || {};
  const kpiMetrics = [
    {
      label: "Total Rent",
      value: formatMoney(metrics.totalRent),
      subtext: `${extendedProposal.contractPeriodYears || 30}-Year`,
    },
    {
      label: "Net Present Value",
      value: formatMoney(metrics.npv),
      subtext: "@ 5% Discount",
      isPositive: safeNumber(metrics.npv) >= 0,
    },
    {
      label: "Internal Rate of Return",
      value: formatPercent(metrics.irr),
      subtext: "Annualized",
    },
    {
      label: "Payback Period",
      value: `${safeNumber(metrics.paybackPeriod).toFixed(1)} Years`,
      subtext: "From 2028",
    },
  ];

  const cardWidth = (contentWidth - 15) / 2;
  const cardHeight = 40;

  kpiMetrics.forEach((metric, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (cardWidth + 5);
    const y = currentY + row * (cardHeight + 5);

    // Card background
    setColor(COLORS.white, "fill");
    setColor(COLORS.slate200, "draw");
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");

    // Label
    doc.setFontSize(8);
    setColor(COLORS.slate500);
    doc.setFont("helvetica", "normal");
    doc.text(metric.label.toUpperCase(), x + 8, y + 12);

    // Value
    doc.setFontSize(16);
    if (metric.isPositive !== undefined) {
      setColor(metric.isPositive ? COLORS.positive : COLORS.negative);
    } else {
      setColor(COLORS.slate900);
    }
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, x + 8, y + 26);

    // Subtext
    doc.setFontSize(8);
    setColor(COLORS.slate400);
    doc.setFont("helvetica", "normal");
    doc.text(metric.subtext, x + 8, y + 34);
  });

  currentY += 100;

  // Report metadata
  doc.setFontSize(9);
  setColor(COLORS.slate400);
  doc.setFont("helvetica", "normal");
  const reportDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Report Generated: ${reportDate}`, margin, currentY);
  doc.text(`Rent Model: ${proposal.rentModel || "N/A"}`, margin, currentY + 6);

  // Footer
  addPageFooter();

  // ==========================================
  // PAGE 2: EXECUTIVE SUMMARY
  // ==========================================
  addNewPage();

  addSectionTitle("Executive Summary");
  addParagraph(generateExecutiveSummary(extendedProposal));

  currentY += 5;

  // Recommendation Box
  const npv = safeNumber(metrics.npv);
  const isPositive = npv >= 0;

  setColor(isPositive ? COLORS.positiveLight : COLORS.negativeLight, "fill");
  setColor(isPositive ? COLORS.positive : COLORS.negative, "draw");
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, contentWidth, 25, 2, 2, "FD");

  doc.setFontSize(9);
  setColor(isPositive ? COLORS.positive : COLORS.negative);
  doc.setFont("helvetica", "bold");
  doc.text("RECOMMENDATION", margin + 8, currentY + 10);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const recommendation = isPositive
    ? npv > 50_000_000
      ? "APPROVED - Strong financial profile supports immediate progression"
      : "CONDITIONAL APPROVAL - Proceed with standard risk monitoring"
    : "REQUIRES REVIEW - Significant concerns warrant further negotiation";
  doc.text(recommendation, margin + 8, currentY + 19);

  currentY += 35;

  // Key Strengths
  addSubsectionTitle("Key Strengths");
  generateKeyStrengths(extendedProposal).forEach((strength) => {
    checkPageBreak(15);
    addBulletPoint(strength, "✓");
  });

  currentY += 5;

  // Risk Assessment
  addSubsectionTitle("Risk Assessment");
  generateRiskAssessment(extendedProposal).forEach((risk) => {
    checkPageBreak(15);
    addBulletPoint(risk, "!");
  });

  addPageFooter();

  // ==========================================
  // PAGE 3: FINANCIAL ANALYSIS
  // ==========================================
  addNewPage();

  addSectionTitle("Financial Analysis");
  addParagraph(generateFinancialCommentary(extendedProposal));

  // Chart Image
  if (chartImage) {
    currentY += 5;
    checkPageBreak(80);

    addSubsectionTitle("Rent Trajectory Visualization");

    const imgWidth = contentWidth;
    const imgHeight = imgWidth * 0.45;

    try {
      doc.addImage(chartImage, "PNG", margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10;
    } catch {
      doc.setFontSize(10);
      setColor(COLORS.slate400);
      doc.text("[Chart visualization unavailable]", margin, currentY + 20);
      currentY += 40;
    }
  }

  addPageFooter();

  // ==========================================
  // PAGE 4: FINANCIAL STATEMENTS
  // ==========================================
  addNewPage();

  addSectionTitle("Financial Statements - Pivot Years");

  // Pivot years selection
  const pivotYears = [2023, 2024, 2025, 2028, 2030, 2035, 2040, 2045, 2053];
  const financials = extendedProposal.financials || [];

  // Extract data for pivot years
  const pivotData = pivotYears.map((year) => {
    const yearData = financials.find((f) => f.year === year);
    return {
      year,
      revenue: safeNumber(yearData?.profitLoss?.totalRevenue),
      rent: safeNumber(yearData?.profitLoss?.rentExpense),
      staffCosts: safeNumber(yearData?.profitLoss?.staffCosts),
      otherOpex: safeNumber(yearData?.profitLoss?.otherOpex),
      depreciation: safeNumber(yearData?.profitLoss?.depreciation),
      ebitda: safeNumber(yearData?.profitLoss?.ebitda),
      netIncome: safeNumber(yearData?.profitLoss?.netIncome),
      cash: safeNumber(yearData?.balanceSheet?.cash),
      operatingCF: safeNumber(yearData?.cashFlow?.cashFlowFromOperations),
    };
  });

  // Profit & Loss Table
  addSubsectionTitle("Profit & Loss Summary (SAR Millions)");

  const plRows = [
    ["Revenue", ...pivotData.map((d) => formatMillions(d.revenue))],
    ["Rent Expense", ...pivotData.map((d) => `(${formatMillions(d.rent)})`)],
    [
      "Staff Costs",
      ...pivotData.map((d) => `(${formatMillions(d.staffCosts)})`),
    ],
    ["Other OpEx", ...pivotData.map((d) => `(${formatMillions(d.otherOpex)})`)],
    ["EBITDA", ...pivotData.map((d) => formatMillions(d.ebitda))],
    ["Net Income", ...pivotData.map((d) => formatMillions(d.netIncome))],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Metric", ...pivotYears.map((y) => formatYear(y))]],
    body: plRows,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: "right",
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 8,
    },
    columnStyles: {
      0: {
        halign: "left",
        fontStyle: "bold",
        cellWidth: 28,
        textColor: [30, 41, 59],
      },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: function (data) {
      // Highlight EBITDA and Net Income rows
      if (data.row.index === 4 || data.row.index === 5) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Cash Position Table
  checkPageBreak(50);
  addSubsectionTitle("Cash Flow Summary (SAR Millions)");

  const cfRows = [
    [
      "Operating Cash Flow",
      ...pivotData.map((d) => formatMillions(d.operatingCF)),
    ],
    ["Cash Position", ...pivotData.map((d) => formatMillions(d.cash))],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Metric", ...pivotYears.map((y) => formatYear(y))]],
    body: cfRows,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: "right",
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 8,
    },
    columnStyles: {
      0: {
        halign: "left",
        fontStyle: "bold",
        cellWidth: 28,
        textColor: [30, 41, 59],
      },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY = doc.lastAutoTable.finalY + 10;

  addPageFooter();

  // ==========================================
  // PAGE 5: KEY ASSUMPTIONS
  // ==========================================
  addNewPage();

  addSectionTitle("Key Assumptions & Parameters");

  // Contract Parameters
  addSubsectionTitle("Contract Parameters");

  const contractData = [
    ["Contract Period", `${extendedProposal.contractPeriodYears || 30} Years`],
    ["Contract Start", "2028"],
    [
      "Contract End",
      `${2028 + (extendedProposal.contractPeriodYears || 30) - 1}`,
    ],
    ["Rent Model", proposal.rentModel || "N/A"],
  ];

  // Rent model specific parameters
  if (proposal.rentModel === "FIXED") {
    contractData.push(
      [
        "Base Rent",
        formatMoney(extendedProposal.rentParams?.baseRent) + " /year",
      ],
      [
        "Escalation Rate",
        formatPercent(extendedProposal.rentParams?.escalationRate || 0),
      ],
      [
        "Escalation Frequency",
        `Every ${extendedProposal.rentParams?.escalationFrequency || 3} years`,
      ],
    );
  } else if (proposal.rentModel === "REVSHARE") {
    contractData.push([
      "Revenue Share",
      formatPercent(extendedProposal.rentParams?.revenueSharePercent || 0),
    ]);
  } else if (proposal.rentModel === "PARTNER") {
    contractData.push(
      ["Land Cost", formatMoney(extendedProposal.rentParams?.landCost)],
      [
        "Construction Cost",
        formatMoney(extendedProposal.rentParams?.constructionCost),
      ],
      [
        "Yield Rate",
        formatPercent(extendedProposal.rentParams?.yieldRate || 0),
      ],
    );
  }

  autoTable(doc, {
    startY: currentY,
    body: contractData,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: [30, 41, 59] },
      1: { halign: "left" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Enrollment Parameters
  checkPageBreak(60);
  addSubsectionTitle("Enrollment Parameters");

  const enrollment = extendedProposal.enrollment || {};
  const enrollmentData = [
    [
      "Total Capacity",
      `${formatNumber(enrollment.totalCapacity || (enrollment.frenchCapacity || 0) + (enrollment.ibCapacity || 0))} students`,
    ],
    [
      "Steady State Target",
      `${formatNumber(enrollment.steadyStateStudents || 0)} students`,
    ],
    ["Ramp-Up Period", `${enrollment.rampUpYears || 5} years`],
  ];

  if (enrollment.frenchCapacity) {
    enrollmentData.push([
      "French Section",
      `${formatNumber(enrollment.frenchCapacity)} students`,
    ]);
  }
  if (enrollment.ibCapacity) {
    enrollmentData.push([
      "IB Section",
      `${formatNumber(enrollment.ibCapacity)} students`,
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    body: enrollmentData,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: [30, 41, 59] },
      1: { halign: "left" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Operational Parameters
  checkPageBreak(50);
  addSubsectionTitle("Operational Parameters");

  const operationalData = [
    [
      "Other OpEx",
      `${formatPercent(extendedProposal.otherOpexPercent || 0)} of revenue`,
    ],
    [
      "IB Program",
      extendedProposal.curriculum?.ibProgramEnabled ? "Enabled" : "Disabled",
    ],
    [
      "French Program",
      extendedProposal.curriculum?.frenchProgramEnabled
        ? "Enabled"
        : "Disabled",
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: operationalData,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: [30, 41, 59] },
      1: { halign: "left" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  addPageFooter();

  // ==========================================
  // PAGE 6: APPENDIX - FULL DATA
  // ==========================================
  addNewPage();

  addSectionTitle("Appendix: Complete Financial Projection");

  // Filter to contract period and show every 2nd year
  const appendixYears = financials
    .filter((f) => f.year >= 2028)
    .filter((_, i) => i % 2 === 0 || i === financials.length - 1);

  if (appendixYears.length > 0) {
    const appendixRows = appendixYears.map((yearData) => [
      yearData.year.toString(),
      formatMillions(yearData.profitLoss?.totalRevenue),
      formatMillions(yearData.profitLoss?.rentExpense),
      formatMillions(yearData.profitLoss?.ebitda),
      formatMillions(yearData.profitLoss?.netIncome),
      formatMillions(yearData.balanceSheet?.cash),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Year", "Revenue", "Rent", "EBITDA", "Net Income", "Cash"]],
      body: appendixRows,
      theme: "striped",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        halign: "right",
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 7,
      },
      columnStyles: {
        0: { halign: "center", fontStyle: "bold" },
      },
    });
  }

  addPageFooter();

  // ==========================================
  // FINALIZE AND SAVE
  // ==========================================

  // Ensure all pages have footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Update page numbers
    doc.setFontSize(8);
    setColor(COLORS.slate500);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 12, {
      align: "right",
    });
  }

  // Save
  const filename = `${(proposal.name || "Proposal").replace(/[^a-zA-Z0-9]/g, "_")}_Executive_Report.pdf`;
  doc.save(filename);
}
