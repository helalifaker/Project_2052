"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Role } from "@/lib/types/roles";
import {
  Copy,
  Trash2,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Calendar,
  FileText,
  Wallet,
  Calculator,
} from "lucide-react";
import { formatMillions } from "@/lib/utils/financial";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { calculateNPV } from "@/lib/utils/financial";
import { ProposalProfitabilityChart } from "./charts/ProposalProfitabilityChart";
import { ProposalCashFlowChart } from "./charts/ProposalCashFlowChart";
// PERFORMANCE OPTIMIZATION: Using BaseAreaChart instead of direct Recharts imports
// This consolidates Recharts usage and improves tree-shaking
import { BaseAreaChart } from "@/components/charts/BaseAreaChart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ExecutiveCard,
  ExecutiveCardContent,
  ExecutiveCardHeader,
  ExecutiveCardTitle,
  ExecutiveLabel,
  ExecutiveValue,
  ExecutiveTrend,
} from "@/components/ui/executive-card";
import { Badge } from "@/components/ui/badge";
import { generateExecutiveReport } from "@/lib/pdf";
import { BentoGrid, BentoItem } from "@/components/dashboard/BentoGrid";

// PERFORMANCE OPTIMIZATION: Lazy-load PDF report component (~200KB jsPDF)
// Only loaded when user clicks Export PDF button
const ProposalPDFReport = dynamic(
  () =>
    import("@/components/proposals/reports/ProposalPDFReport").then((mod) => ({
      default: mod.ProposalPDFReport,
    })),
  { ssr: false },
);

/**
 * Filter financials to contract period only (2028 to 2028+contractPeriodYears-1)
 */
function getContractPeriodFinancials(
  financials: any[],
  contractPeriodYears: number,
): any[] {
  const startYear = 2028;
  const endYear = startYear + contractPeriodYears - 1;
  return financials.filter((p) => p.year >= startYear && p.year <= endYear);
}

/**
 * Parse value to Decimal, handling various input types
 */
function parseDecimal(value: unknown): Decimal {
  if (value instanceof Decimal) return value;
  if (typeof value === "number") return new Decimal(value);
  if (typeof value === "string") return new Decimal(value);
  return new Decimal(0);
}

/**
 * Calculate contract period KPIs from proposal data
 */
function calculateContractPeriodKPIs(
  proposal: any,
  adminDiscountRate: Decimal,
): {
  totalContractRent: Decimal;
  rentNPV: Decimal;
  totalContractEBITDA: Decimal;
  finalCash: Decimal;
  totalContractCapEx: Decimal;
  contractEndYear: number;
} {
  const contractPeriodYears = proposal.contractPeriodYears || 30;
  const contractEndYear = 2028 + contractPeriodYears - 1;

  // Extract contract period financials
  const allFinancials = Array.isArray(proposal.financials)
    ? proposal.financials
    : [];
  const contractFinancials = getContractPeriodFinancials(
    allFinancials,
    contractPeriodYears,
  );

  // Calculate Total Rent
  let totalContractRent = new Decimal(0);
  contractFinancials.forEach((period) => {
    const rentExpense = parseDecimal(period.profitLoss?.rentExpense);
    totalContractRent = totalContractRent.plus(rentExpense);
  });

  // Calculate Rent NPV (rent as negative cash flows)
  const rentCashFlows = contractFinancials.map((p) =>
    parseDecimal(p.profitLoss?.rentExpense).neg(),
  );
  const rentNPV = calculateNPV(rentCashFlows, adminDiscountRate);

  // Calculate Total EBITDA
  let totalContractEBITDA = new Decimal(0);
  contractFinancials.forEach((period) => {
    const ebitda = parseDecimal(period.profitLoss?.ebitda);
    totalContractEBITDA = totalContractEBITDA.plus(ebitda);
  });

  // Get Final Cash (end of contract period)
  const contractEndPeriod = contractFinancials[contractFinancials.length - 1];
  const finalCash = parseDecimal(contractEndPeriod?.balanceSheet?.cash);

  // Calculate CapEx Invested (sum depreciation from P&L during contract period)
  let totalContractCapEx = new Decimal(0);
  contractFinancials.forEach((period) => {
    const depreciation = parseDecimal(period.profitLoss?.depreciation);
    totalContractCapEx = totalContractCapEx.plus(depreciation);
  });

  return {
    totalContractRent,
    rentNPV,
    totalContractEBITDA,
    finalCash,
    totalContractCapEx,
    contractEndYear,
  };
}

/**
 * Extract profitability journey data for charting
 */
function extractProfitabilityData(financials: any[]): Array<{
  year: number;
  revenue: number;
  costs: number;
  netIncome: number;
}> {
  return financials.map((period) => ({
    year: period.year,
    revenue: parseDecimal(period.profitLoss?.totalRevenue).toNumber(),
    costs: parseDecimal(period.profitLoss?.totalOpex).toNumber(),
    netIncome: parseDecimal(period.profitLoss?.netIncome).toNumber(),
  }));
}

/**
 * Extract cash flow data for waterfall chart
 */
function extractCashFlowData(financials: any[]): Array<{
  year: number;
  cash: number;
  operatingCF: number;
  investingCF: number;
  financingCF: number;
}> {
  return financials.map((period) => ({
    year: period.year,
    cash: parseDecimal(period.balanceSheet?.cash).toNumber(),
    operatingCF: parseDecimal(
      period.cashFlow?.cashFlowFromOperations,
    ).toNumber(),
    investingCF: parseDecimal(
      period.cashFlow?.cashFlowFromInvesting,
    ).toNumber(),
    financingCF: parseDecimal(
      period.cashFlow?.cashFlowFromFinancing,
    ).toNumber(),
  }));
}

interface ProposalOverviewTabProps {
  proposal: any;
  onUpdate: (updatedProposal: any) => void;
}

export function ProposalOverviewTab({
  proposal,
  onUpdate,
}: ProposalOverviewTabProps) {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const [deleting, setDeleting] = useState(false);
  const [adminDiscountRate, setAdminDiscountRate] = useState<Decimal>(
    new Decimal(0.05),
  );

  // Check if user can edit/delete (PLANNER or ADMIN)
  const canEdit = hasRole([Role.ADMIN, Role.PLANNER]);
  const canDelete = hasRole([Role.ADMIN, Role.PLANNER]);

  // Fetch admin discount rate from SystemConfig
  useEffect(() => {
    async function fetchDiscountRate() {
      try {
        const response = await fetch("/api/config");
        const data = await response.json();
        if (data.discountRate) {
          setAdminDiscountRate(new Decimal(data.discountRate));
        }
      } catch (error) {
        console.error("Failed to fetch discount rate:", error);
      }
    }
    fetchDiscountRate();
  }, []);

  // Calculate contract period KPIs
  const contractKPIs = useMemo(
    () => calculateContractPeriodKPIs(proposal, adminDiscountRate),
    [proposal, adminDiscountRate],
  );

  // Extract chart data
  const profitabilityData = useMemo(
    () => extractProfitabilityData(proposal.financials || []),
    [proposal.financials],
  );

  const cashFlowData = useMemo(
    () => extractCashFlowData(proposal.financials || []),
    [proposal.financials],
  );

  // Extract key metrics from proposal.metrics
  const metrics = proposal.metrics || {};

  // Handle both string (from JSON) and number formats
  const parseMetric = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const totalRent = parseMetric(metrics.totalRent);
  const npv = parseMetric(metrics.npv);
  const totalEbitda = parseMetric(metrics.totalEbitda);
  const finalCash = parseMetric(metrics.finalCash);
  const maxDebt = parseMetric(metrics.maxDebt || metrics.peakDebt);

  // Extract rent trajectory data from financials for the chart
  const rentTrajectoryData = useMemo(() => {
    if (!proposal.financials || !Array.isArray(proposal.financials)) {
      return [];
    }

    return proposal.financials.map(
      (period: {
        year: number;
        profitLoss?: { rentExpense?: string | number };
      }) => ({
        year: period.year,
        rent: period.profitLoss?.rentExpense
          ? Number(period.profitLoss.rentExpense) / 1_000_000 // Convert to millions
          : 0,
      }),
    );
  }, [proposal.financials]);

  // Format tooltip value as SAR millions
  const formatTooltipValue = (value: number) => {
    return `${value.toFixed(2)} M SAR`;
  };

  // Handle duplicate
  const handleDuplicate = async () => {
    try {
      toast.info("Duplicating proposal...");

      const response = await fetch(`/api/proposals/${proposal.id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate proposal");
      }

      const newProposal = await response.json();
      toast.success("Proposal duplicated successfully");
      router.push(`/proposals/${newProposal.id}`);
    } catch (error) {
      console.error("Error duplicating proposal:", error);
      toast.error("Failed to duplicate proposal");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete proposal");
      }

      toast.success("Proposal deleted successfully");
      router.push("/proposals");
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast.error("Failed to delete proposal");
      setDeleting(false);
    }
  };

  // Handle export
  const handleExportExcel = async () => {
    try {
      toast.info("Generating Excel export...");

      const response = await fetch(
        `/api/proposals/${proposal.id}/export/excel`,
      );

      if (!response.ok) {
        throw new Error("Failed to generate Excel export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposal.developer}_${proposal.rentModel}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel export downloaded");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Generating executive PDF report...");

      // 1. Capture Chart using modern-screenshot (supports CSS Color Level 4)
      const chartElement = document.getElementById("proposal-pdf-report");
      let chartImage: string | undefined = undefined;

      if (chartElement) {
        try {
          const { domToPng } = await import("modern-screenshot");

          // Temporarily make the element visible for capture
          const originalStyles = {
            position: chartElement.style.position,
            top: chartElement.style.top,
            left: chartElement.style.left,
          };

          chartElement.style.position = "fixed";
          chartElement.style.top = "0";
          chartElement.style.left = "0";

          // Allow time for Recharts to render
          await new Promise((resolve) => setTimeout(resolve, 100));

          chartImage = await domToPng(chartElement, {
            scale: 2, // High resolution for print quality
            backgroundColor: "#ffffff",
          });

          // Restore original positioning
          chartElement.style.position = originalStyles.position;
          chartElement.style.top = originalStyles.top;
          chartElement.style.left = originalStyles.left;
        } catch (e) {
          console.error("Failed to capture chart:", e);
          toast.error("Chart capture failed, generating report without chart.");
        }
      }

      // 2. Generate executive PDF with data and chart
      await generateExecutiveReport(proposal, chartImage);

      toast.success("Executive PDF report exported successfully!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            className="h-8 text-xs"
          >
            <Copy className="h-3 w-3 mr-2" />
            Duplicate
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          className="h-8 text-xs"
          data-testid="export-excel-btn"
        >
          <Download className="h-3 w-3 mr-2" />
          Export Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          className="h-8 text-xs"
          data-testid="export-pdf-btn"
        >
          <Download className="h-3 w-3 mr-2" />
          Export PDF
        </Button>
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-8 text-xs">
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Proposal?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  proposal &quot;{proposal.name}&quot; and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <BentoGrid dense>
        {/* Row 1: KPI Cards (2 cols each = 6 cards total) */}
        {/* Total Contract Rent */}
        <BentoItem colSpan={2}>
          <ExecutiveCard size="ultra-compact">
            <ExecutiveCardHeader className="pb-1" size="ultra-compact">
              <ExecutiveLabel size="ultra-compact">
                Total Contract Rent
              </ExecutiveLabel>
              <DollarSign
                className="h-3 w-3 absolute top-3 right-3"
                style={{ color: "var(--atelier-chart-proposal-b)" }}
              />
            </ExecutiveCardHeader>
            <ExecutiveCardContent size="ultra-compact">
              <ExecutiveValue size="ultra-compact">
                {formatMillions(contractKPIs.totalContractRent.toNumber())}
              </ExecutiveValue>
              <ExecutiveTrend direction="neutral" size="ultra-compact">
                {proposal.contractPeriodYears || 30}-Year Total
              </ExecutiveTrend>
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        {/* Rent NPV */}
        <BentoItem colSpan={2}>
          <ExecutiveCard size="ultra-compact">
            <ExecutiveCardHeader className="pb-1" size="ultra-compact">
              <ExecutiveLabel size="ultra-compact">Rent NPV</ExecutiveLabel>
              <TrendingDown
                className="h-3 w-3 absolute top-3 right-3"
                style={{ color: "var(--atelier-chart-proposal-a)" }}
              />
            </ExecutiveCardHeader>
            <ExecutiveCardContent size="ultra-compact">
              <ExecutiveValue
                size="ultra-compact"
                style={{ color: "var(--atelier-chart-proposal-a)" }}
              >
                {formatMillions(contractKPIs.rentNPV.abs().toNumber())}
              </ExecutiveValue>
              <ExecutiveTrend direction="neutral" size="ultra-compact">
                @ {adminDiscountRate.times(100).toFixed(1)}% Discount
              </ExecutiveTrend>
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        {/* EBITDA NPV */}
        <BentoItem colSpan={2}>
          <ExecutiveCard size="ultra-compact">
            <ExecutiveCardHeader className="pb-1" size="ultra-compact">
              <ExecutiveLabel size="ultra-compact">EBITDA NPV</ExecutiveLabel>
              <TrendingUp
                className="h-3 w-3 absolute top-3 right-3"
                style={{ color: "var(--atelier-chart-proposal-b)" }}
              />
            </ExecutiveCardHeader>
            <ExecutiveCardContent size="ultra-compact">
              <ExecutiveValue
                style={{ color: "var(--atelier-chart-proposal-b)" }}
                size="ultra-compact"
              >
                {formatMillions(
                  parseDecimal(proposal.metrics?.contractEbitdaNPV).toNumber(),
                )}
              </ExecutiveValue>
              <ExecutiveTrend direction="positive" size="ultra-compact">
                Present Value
              </ExecutiveTrend>
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        {/* CapEx Invested */}
        <BentoItem colSpan={2}>
          <ExecutiveCard size="ultra-compact">
            <ExecutiveCardHeader className="pb-1" size="ultra-compact">
              <ExecutiveLabel size="ultra-compact">
                CapEx Invested
              </ExecutiveLabel>
              <Building2
                className="h-3 w-3 absolute top-3 right-3"
                style={{ color: "var(--accent-gold)" }}
              />
            </ExecutiveCardHeader>
            <ExecutiveCardContent size="ultra-compact">
              <ExecutiveValue
                style={{ color: "var(--accent-gold)" }}
                size="ultra-compact"
              >
                {formatMillions(contractKPIs.totalContractCapEx.toNumber())}
              </ExecutiveValue>
              <ExecutiveTrend direction="neutral" size="ultra-compact">
                Contract Total
              </ExecutiveTrend>
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        {/* Final Cash Position */}
        <BentoItem colSpan={2}>
          <ExecutiveCard size="ultra-compact">
            <ExecutiveCardHeader className="pb-1" size="ultra-compact">
              <ExecutiveLabel size="ultra-compact">
                Final Cash Position
              </ExecutiveLabel>
              <Wallet
                className="h-3 w-3 absolute top-3 right-3"
                style={{
                  color: contractKPIs.finalCash.greaterThanOrEqualTo(0)
                    ? "var(--atelier-chart-proposal-b)"
                    : "var(--financial-negative)",
                }}
              />
            </ExecutiveCardHeader>
            <ExecutiveCardContent size="ultra-compact">
              <ExecutiveValue
                style={{
                  color: contractKPIs.finalCash.greaterThanOrEqualTo(0)
                    ? "var(--atelier-chart-proposal-b)"
                    : "var(--financial-negative)",
                }}
                size="ultra-compact"
              >
                {formatMillions(contractKPIs.finalCash.toNumber())}
              </ExecutiveValue>
              <ExecutiveTrend
                direction={
                  contractKPIs.finalCash.greaterThanOrEqualTo(0)
                    ? "positive"
                    : "negative"
                }
                size="ultra-compact"
              >
                End of Contract
              </ExecutiveTrend>
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        {/* NAV - KEY METRIC */}
        <BentoItem colSpan={2}>
          <ExecutiveCard
            className="border-2 border-primary/30 bg-primary/5 ring-2 ring-primary/10"
            size="ultra-compact"
          >
            <ExecutiveCardHeader className="pb-1" size="ultra-compact">
              <ExecutiveLabel
                className="text-primary font-semibold"
                size="ultra-compact"
              >
                NAV ⭐
              </ExecutiveLabel>
              <Calculator
                className="h-3 w-3 absolute top-3 right-3"
                style={{ color: "var(--financial-positive)" }}
              />
            </ExecutiveCardHeader>
            <ExecutiveCardContent size="ultra-compact">
              <ExecutiveValue
                style={{
                  color: parseDecimal(
                    proposal.metrics?.contractNAV,
                  ).greaterThanOrEqualTo(0)
                    ? "var(--financial-positive)"
                    : "var(--financial-negative)",
                }}
                size="ultra-compact"
              >
                {formatMillions(
                  parseDecimal(proposal.metrics?.contractNAV).toNumber(),
                )}
              </ExecutiveValue>
              <ExecutiveTrend direction="neutral" size="ultra-compact">
                Net Annualized Value
              </ExecutiveTrend>
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        {/* Row 2: Financial Analysis Charts (6 cols each) */}
        <BentoItem colSpan={6} className="min-h-[280px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>Profitability Journey</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="flex-1 min-h-0"
              size="ultra-compact"
            >
              <ProposalProfitabilityChart
                data={profitabilityData}
                contractEndYear={contractKPIs.contractEndYear}
                height={240}
              />
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        <BentoItem colSpan={6} className="min-h-[280px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>Cash Flow Waterfall</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="flex-1 min-h-0"
              size="ultra-compact"
            >
              <ProposalCashFlowChart
                data={cashFlowData}
                contractEndYear={contractKPIs.contractEndYear}
                height={240}
              />
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        {/* Row 3: Rent Trajectory & Assumptions */}
        <BentoItem colSpan={8} className="min-h-[280px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>
                Rent Trajectory (30 Years)
              </ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="flex-1 min-h-0"
              size="ultra-compact"
            >
              {rentTrajectoryData.length > 0 ? (
                <BaseAreaChart
                  data={rentTrajectoryData}
                  series={[
                    {
                      dataKey: "rent",
                      name: "Rent",
                      useGradient: true,
                      stroke: "var(--chart-1)",
                    },
                  ]}
                  xAxisKey="year"
                  xAxisFormatter={(value) =>
                    Number(value) % 5 === 0 || value === 2023 || value === 2053
                      ? String(value)
                      : ""
                  }
                  yAxisFormatter={(value) => `${Number(value).toFixed(0)}M`}
                  tooltipFormat="millions"
                  height={220}
                  showLegend={false}
                  ariaLabel="Rent trajectory over 30 years"
                />
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground text-xs">
                  No data available.
                </div>
              )}
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        <BentoItem colSpan={4} className="min-h-[280px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>Key Assumptions</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="space-y-3 overflow-y-auto"
              size="ultra-compact"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Rent Model</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] h-5"
                  >
                    {proposal.rentModel}
                  </Badge>
                </div>

                {proposal.developer && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Developer</span>
                    </div>
                    <span className="text-xs font-semibold truncate max-w-[100px]">
                      {proposal.developer}
                    </span>
                  </div>
                )}

                {proposal.enrollment && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Capacity</span>
                    </div>
                    <span className="text-xs font-semibold">
                      {(proposal.enrollment.frenchCapacity ?? 0) +
                        (proposal.enrollment.ibCapacity ?? 0) ||
                        proposal.enrollment.capacity ||
                        proposal.enrollment.totalCapacity ||
                        "N/A"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Other OpEx</span>
                  </div>
                  <span className="text-xs font-semibold">
                    {(Number(proposal.otherOpexPercent) * 100).toFixed(1)}%
                  </span>
                </div>

                {proposal.calculatedAt && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Updated</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground text-right">
                      {new Date(proposal.calculatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>
      </BentoGrid>

      {/* Hidden Report Component for PDF Generation */}
      <ProposalPDFReport proposal={proposal} id="proposal-pdf-report" />
    </div>
  );
}
