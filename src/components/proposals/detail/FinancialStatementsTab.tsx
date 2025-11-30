"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, Calculator, Calendar } from "lucide-react";
import {
  FinancialTable,
  FinancialLineItem,
} from "@/components/financial/FinancialTable";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { RevenueNetProfitGrowthChart } from "./charts/RevenueNetProfitGrowthChart";
import {
  ExecutiveCard,
  ExecutiveCardContent,
  ExecutiveCardHeader,
  ExecutiveCardTitle,
} from "@/components/ui/executive-card";
import { generateComprehensiveReport } from "@/lib/pdf-service";
import { ProposalPDFReport } from "@/components/proposals/reports/ProposalPDFReport";

/**
 * Tab 4: Financial Statements
 *
 * Displays:
 * - Year Range Selector (GAP 9)
 * - P&L Statement
 * - Balance Sheet
 * - Cash Flow Statement
 * - Profitability Analysis (Revenue vs Net Profit Growth Chart)
 * - Export buttons
 */

interface FinancialStatementsTabProps {
  proposal: any;
  onRecalculated?: () => void;
}

export function FinancialStatementsTab({
  proposal,
  onRecalculated,
}: FinancialStatementsTabProps) {
  const [activeStatement, setActiveStatement] = useState("pl");
  const [yearRange, setYearRange] = useState("all");
  const [recalculating, setRecalculating] = useState(false);
  const [proposalData, setProposalData] = useState(proposal);

  // Update proposal data when prop changes
  useEffect(() => {
    setProposalData(proposal);
  }, [proposal]);

  // Extract financial periods from proposal
  const periods = proposalData.financials || [];

  // Calculate dynamic period boundaries
  const allYears = periods.map((p: any) => p.year);
  const dynamicEndYear = allYears.length > 0 ? Math.max(...allYears) : 2057;
  const dynamicMidpoint = Math.floor((2028 + dynamicEndYear) / 2);

  // Get year range based on selection
  const getYearRange = () => {
    if (!periods || periods.length === 0) return [];

    switch (yearRange) {
      case "historical":
        return allYears.filter((y: number) => y >= 2023 && y <= 2024);
      case "transition":
        return allYears.filter((y: number) => y >= 2025 && y <= 2027);
      case "early":
        return allYears.filter(
          (y: number) => y >= 2028 && y <= dynamicMidpoint,
        );
      case "late":
        return allYears.filter(
          (y: number) => y > dynamicMidpoint && y <= dynamicEndYear,
        );
      case "all":
      default:
        return allYears;
    }
  };

  const selectedYears = getYearRange();

  // Helper to build net interest values (interest income - interest expense)
  const buildNetInterestValues = (): Record<string, number> => {
    const values: Record<string, number> = {};
    periods.forEach((period: any) => {
      const income = getNestedValue(period, "profitLoss.interestIncome") || 0;
      const expense = getNestedValue(period, "profitLoss.interestExpense") || 0;
      const incomeNum =
        typeof income === "number"
          ? income
          : parseFloat(income?.toString() || "0");
      const expenseNum =
        typeof expense === "number"
          ? expense
          : parseFloat(expense?.toString() || "0");
      values[period.year] = incomeNum - expenseNum;
    });
    return values;
  };

  // Build P&L line items (simplified - 9 key lines)
  const buildPLLineItems = (): FinancialLineItem[] => {
    if (!periods || periods.length === 0) return [];

    return [
      {
        id: "totalRevenue",
        label: "Revenue",
        values: buildYearValues("profitLoss.totalRevenue"),
      },
      {
        id: "staffCosts",
        label: "Staff Costs",
        values: buildYearValues("profitLoss.staffCosts"),
      },
      {
        id: "rentExpense",
        label: "Rent",
        values: buildYearValues("profitLoss.rentExpense"),
      },
      {
        id: "otherOpex",
        label: "Other Expenses",
        values: buildYearValues("profitLoss.otherOpex"),
      },
      {
        id: "ebitda",
        label: "EBITDA",
        values: buildYearValues("profitLoss.ebitda"),
        isTotal: true,
      },
      {
        id: "depreciation",
        label: "Depreciation",
        values: buildYearValues("profitLoss.depreciation"),
      },
      {
        id: "netInterest",
        label: "Net Interest",
        values: buildNetInterestValues(),
      },
      {
        id: "zakat",
        label: "Zakat",
        values: buildYearValues("profitLoss.zakatExpense"),
      },
      {
        id: "netIncome",
        label: "Net Profit",
        values: buildYearValues("profitLoss.netIncome"),
        isGrandTotal: true,
      },
    ];
  };

  // Build Balance Sheet line items (simplified - 10 key lines)
  const buildBSLineItems = (): FinancialLineItem[] => {
    if (!periods || periods.length === 0) return [];

    return [
      // ASSETS
      {
        id: "assets-header",
        label: "ASSETS",
        values: {},
        isHeader: true,
      },
      {
        id: "cash",
        label: "Cash",
        values: buildYearValues("balanceSheet.cash"),
        indent: 1,
      },
      {
        id: "accountsReceivable",
        label: "Accounts Receivable",
        values: buildYearValues("balanceSheet.accountsReceivable"),
        indent: 1,
      },
      {
        id: "netPPE",
        label: "PP&E (Net)",
        values: buildYearValues("balanceSheet.propertyPlantEquipment"),
        indent: 1,
      },
      {
        id: "totalAssets",
        label: "Total Assets",
        values: buildYearValues("balanceSheet.totalAssets"),
        isTotal: true,
      },

      // LIABILITIES & EQUITY
      {
        id: "liabilities-header",
        label: "LIABILITIES & EQUITY",
        values: {},
        isHeader: true,
      },
      {
        id: "accountsPayable",
        label: "Accounts Payable",
        values: buildYearValues("balanceSheet.accountsPayable"),
        indent: 1,
      },
      {
        id: "debtBalance",
        label: "Debt",
        values: buildYearValues("balanceSheet.debtBalance"),
        indent: 1,
      },
      {
        id: "totalEquity",
        label: "Equity",
        values: buildYearValues("balanceSheet.totalEquity"),
        indent: 1,
      },
      {
        id: "totalLiabilitiesEquity",
        label: "Total Liab. & Equity",
        values: buildYearValues(
          "balanceSheet.totalLiabilities",
          false,
          "balanceSheet.totalEquity",
        ),
        isGrandTotal: true,
      },
    ];
  };

  // Build Cash Flow line items (simplified - 6 key lines)
  const buildCFLineItems = (): FinancialLineItem[] => {
    if (!periods || periods.length === 0) return [];

    return [
      {
        id: "cashFlowFromOperations",
        label: "Cash from Operations",
        values: buildYearValues("cashFlow.cashFlowFromOperations"),
      },
      {
        id: "cashFlowFromInvesting",
        label: "Cash from Investing",
        values: buildYearValues("cashFlow.cashFlowFromInvesting"),
      },
      {
        id: "cashFlowFromFinancing",
        label: "Cash from Financing",
        values: buildYearValues("cashFlow.cashFlowFromFinancing"),
      },
      {
        id: "netChangeInCash",
        label: "Net Change in Cash",
        values: buildYearValues("cashFlow.netChangeInCash"),
        isTotal: true,
      },
      {
        id: "beginningCash",
        label: "Beginning Cash",
        values: buildYearValues("cashFlow.beginningCash"),
      },
      {
        id: "endingCash",
        label: "Ending Cash",
        values: buildYearValues("cashFlow.endingCash"),
        isGrandTotal: true,
      },
    ];
  };

  // Helper to build year values for a given field path
  const buildYearValues = (
    fieldPath: string,
    negate: boolean = false,
    additionalFieldPath?: string,
  ): Record<string, number> => {
    const values: Record<string, number> = {};

    periods.forEach((period: any) => {
      const year = period.year;
      const value = getNestedValue(period, fieldPath);
      const additionalValue = additionalFieldPath
        ? getNestedValue(period, additionalFieldPath)
        : 0;

      // Handle various value types: string (from API serialization), number, Decimal object, or null/undefined
      let numValue = 0;
      if (value !== undefined && value !== null) {
        // If it's already a number, use it directly
        if (typeof value === "number") {
          numValue = value;
        }
        // If it's a string, parse it
        else if (typeof value === "string") {
          const parsed = parseFloat(value);
          numValue = isNaN(parsed) ? 0 : parsed;
        }
        // If it's an object with toString (like Decimal.js), convert to string first
        else if (
          typeof value === "object" &&
          value !== null &&
          typeof value.toString === "function"
        ) {
          const parsed = parseFloat(value.toString());
          numValue = isNaN(parsed) ? 0 : parsed;
        }
      }

      // Handle additional value similarly
      let numAdditional = 0;
      if (additionalValue !== undefined && additionalValue !== null) {
        if (typeof additionalValue === "number") {
          numAdditional = additionalValue;
        } else if (typeof additionalValue === "string") {
          const parsed = parseFloat(additionalValue);
          numAdditional = isNaN(parsed) ? 0 : parsed;
        } else if (
          typeof additionalValue === "object" &&
          additionalValue !== null &&
          typeof additionalValue.toString === "function"
        ) {
          const parsed = parseFloat(additionalValue.toString());
          numAdditional = isNaN(parsed) ? 0 : parsed;
        }
      }

      // Only set the value if we have a valid number (including 0)
      if (value !== undefined && value !== null) {
        values[year] = negate
          ? -(numValue + numAdditional)
          : numValue + numAdditional;
      }
    });

    return values;
  };

  // Helper to build formulas (same for all years)
  const buildFormulas = (formula: string): Record<string, string> => {
    const formulas: Record<string, string> = {};
    selectedYears.forEach((year: number) => {
      formulas[year] = formula;
    });
    return formulas;
  };

  // Helper to get nested value from object path
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const handleExport = async (format: "excel" | "pdf") => {
    try {
      toast.info(`Generating ${format.toUpperCase()} export...`);

      if (format === "pdf") {
        // 1. Capture Chart
        const chartElement = document.getElementById("proposal-pdf-report-fs");
        let chartImage = undefined;

        if (chartElement) {
          try {
            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(chartElement, {
              scale: 2, // High resolution
              logging: false,
              useCORS: true,
              backgroundColor: "#ffffff",
            });
            chartImage = canvas.toDataURL("image/png");
          } catch (e) {
            console.error("Failed to capture chart:", e);
            toast.error(
              "Chart capture failed, generating report without chart.",
            );
          }
        }

        await generateComprehensiveReport(proposalData, chartImage);
        toast.success("PDF export downloaded");
        return;
      }

      const response = await fetch(
        `/api/proposals/${proposalData.id}/export/${format}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to generate ${format.toUpperCase()} export`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposalData.developer || "proposal"}_${proposalData.rentModel}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} export downloaded`);
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  // Handle recalculate
  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      toast.info("Recalculating financial projections...");

      const response = await fetch(
        `/api/proposals/${proposalData.id}/recalculate`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to recalculate");
      }

      const result = await response.json();

      // Update proposal data with new financials
      if (result.proposal) {
        setProposalData(result.proposal);
        toast.success("Financial projections recalculated successfully");
        // Notify parent to refresh
        if (onRecalculated) {
          onRecalculated();
        }
      } else if (result.data) {
        // If proposal is not returned, update local state
        setProposalData((prev: typeof proposal) => ({
          ...prev,
          financials: result.data.periods,
          metrics: result.data.metrics,
          calculatedAt: result.data.calculatedAt,
        }));
        toast.success("Financial projections recalculated successfully");
        // Notify parent to refresh
        if (onRecalculated) {
          onRecalculated();
        }
      }
    } catch (error) {
      console.error("Error recalculating:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to recalculate financial projections",
      );
    } finally {
      setRecalculating(false);
    }
  };

  // Empty state check
  const hasFinancialData = periods && periods.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Statements</h2>
          <p className="text-muted-foreground mt-1">
            View complete financial projections ({2023}-{dynamicEndYear})
          </p>
        </div>
        <div className="flex gap-2">
          {!hasFinancialData && (
            <Button
              variant="default"
              size="sm"
              onClick={handleRecalculate}
              disabled={recalculating}
            >
              {recalculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            disabled={!hasFinancialData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            disabled={!hasFinancialData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {!hasFinancialData && (
        <ExecutiveCard className="p-8">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-2">No Financial Data</p>
            <p className="text-sm mb-4">
              This proposal has not been calculated yet. Click the Calculate
              button above to run the financial projection.
            </p>
            <Button
              variant="default"
              onClick={handleRecalculate}
              disabled={recalculating}
            >
              {recalculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Financial Projections
                </>
              )}
            </Button>
          </div>
        </ExecutiveCard>
      )}

      {hasFinancialData && (
        <>
          {/* Year Range Selector (GAP 9) */}
          <ExecutiveCard>
            <ExecutiveCardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Period:</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={yearRange === "historical" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("historical")}
                  className={
                    yearRange === "historical"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }
                >
                  Historical (2023-2024)
                </Button>
                <Button
                  variant={yearRange === "transition" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("transition")}
                  className={
                    yearRange === "transition"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }
                >
                  Transition (2025-2027)
                </Button>
                <Button
                  variant={yearRange === "early" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("early")}
                  className={
                    yearRange === "early"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }
                >
                  Early Dynamic (2028-{dynamicMidpoint})
                </Button>
                <Button
                  variant={yearRange === "late" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("late")}
                  className={
                    yearRange === "late"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }
                >
                  Late Dynamic ({dynamicMidpoint + 1}-{dynamicEndYear})
                </Button>
                <Button
                  variant={yearRange === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("all")}
                  className={
                    yearRange === "all"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }
                >
                  All Years
                </Button>
              </div>
            </ExecutiveCardContent>
          </ExecutiveCard>

          {/* Statement Tabs */}
          <Tabs value={activeStatement} onValueChange={setActiveStatement}>
            <TabsList className="flex w-auto justify-start border-b bg-transparent p-0 mb-6">
              <TabsTrigger
                value="pl"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Profit & Loss
              </TabsTrigger>
              <TabsTrigger
                value="bs"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Balance Sheet
              </TabsTrigger>
              <TabsTrigger
                value="cf"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Cash Flow
              </TabsTrigger>
              <TabsTrigger
                value="profitability"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Profitability
              </TabsTrigger>
            </TabsList>

            {/* P&L Statement */}
            <TabsContent value="pl">
              <ExecutiveCard>
                <ExecutiveCardContent className="p-0 overflow-hidden">
                  <FinancialTable
                    title="Profit & Loss Statement"
                    years={selectedYears}
                    lineItems={buildPLLineItems()}
                    showTooltips={true}
                    highlightTotals={true}
                  />
                </ExecutiveCardContent>
              </ExecutiveCard>
            </TabsContent>

            {/* Balance Sheet */}
            <TabsContent value="bs">
              <ExecutiveCard>
                <ExecutiveCardContent className="p-0 overflow-hidden">
                  <FinancialTable
                    title="Balance Sheet"
                    years={selectedYears}
                    lineItems={buildBSLineItems()}
                    showTooltips={true}
                    highlightTotals={true}
                  />
                </ExecutiveCardContent>
              </ExecutiveCard>
            </TabsContent>

            {/* Cash Flow Statement */}
            <TabsContent value="cf">
              <ExecutiveCard>
                <ExecutiveCardContent className="p-0 overflow-hidden">
                  <FinancialTable
                    title="Cash Flow Statement (Indirect Method)"
                    years={selectedYears}
                    lineItems={buildCFLineItems()}
                    showTooltips={true}
                    highlightTotals={true}
                  />
                </ExecutiveCardContent>
              </ExecutiveCard>
            </TabsContent>

            {/* Profitability Analysis */}
            <TabsContent value="profitability">
              <ExecutiveCard>
                <ExecutiveCardContent className="p-6">
                  <RevenueNetProfitGrowthChart
                    data={periods.map((period: any) => ({
                      year: period.year,
                      revenue: new Decimal(
                        getNestedValue(period, "profitLoss.totalRevenue") || 0,
                      ),
                      netProfit: new Decimal(
                        getNestedValue(period, "profitLoss.netIncome") || 0,
                      ),
                    }))}
                    proposalId={proposalData.id}
                    proposalName={proposalData.name}
                  />
                </ExecutiveCardContent>
              </ExecutiveCard>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Hidden Report Component for PDF Generation */}
      <ProposalPDFReport proposal={proposalData} id="proposal-pdf-report-fs" />
    </div>
  );
}
