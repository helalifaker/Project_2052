"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import {
  FinancialTable,
  FinancialLineItem,
} from "@/components/financial/FinancialTable";
import { toast } from "sonner";

/**
 * Tab 4: Financial Statements
 *
 * Displays:
 * - Year Range Selector (GAP 9)
 * - P&L Statement
 * - Balance Sheet
 * - Cash Flow Statement
 * - Export buttons
 */

interface FinancialStatementsTabProps {
  proposal: any;
}

export function FinancialStatementsTab({
  proposal,
}: FinancialStatementsTabProps) {
  const [activeStatement, setActiveStatement] = useState("pl");
  const [yearRange, setYearRange] = useState("all");

  // Extract financial periods from proposal
  const periods = proposal.financials || [];

  // Get year range based on selection
  const getYearRange = () => {
    if (!periods || periods.length === 0) return [];

    const allYears = periods.map((p: any) => p.year);

    switch (yearRange) {
      case "historical":
        return allYears.filter((y: number) => y >= 2023 && y <= 2024);
      case "transition":
        return allYears.filter((y: number) => y >= 2025 && y <= 2027);
      case "early":
        return allYears.filter((y: number) => y >= 2028 && y <= 2037);
      case "late":
        return allYears.filter((y: number) => y >= 2038 && y <= 2057);
      case "all":
      default:
        return allYears;
    }
  };

  const selectedYears = getYearRange();

  // Build P&L line items
  const buildPLLineItems = (): FinancialLineItem[] => {
    if (!periods || periods.length === 0) return [];

    return [
      // REVENUE SECTION
      {
        id: "revenue-header",
        label: "REVENUE",
        values: {},
        isHeader: true,
      },
      {
        id: "tuitionRevenue",
        label: "Tuition Revenue",
        values: buildYearValues("profitLoss.tuitionRevenue"),
        indent: 1,
      },
      {
        id: "otherRevenue",
        label: "Other Revenue",
        values: buildYearValues("profitLoss.otherRevenue"),
        indent: 1,
      },
      {
        id: "totalRevenue",
        label: "Total Revenue",
        values: buildYearValues("profitLoss.totalRevenue"),
        isSubtotal: true,
      },

      // OPERATING EXPENSES
      {
        id: "opex-header",
        label: "OPERATING EXPENSES",
        values: {},
        isHeader: true,
      },
      {
        id: "rentExpense",
        label: "Rent Expense",
        values: buildYearValues("profitLoss.rentExpense"),
        formula: buildFormulas("Rent paid to property owner"),
        indent: 1,
      },
      {
        id: "staffCosts",
        label: "Staff Costs",
        values: buildYearValues("profitLoss.staffCosts"),
        formula: buildFormulas("Fixed + Variable * Students"),
        indent: 1,
      },
      {
        id: "otherOpex",
        label: "Other OpEx",
        values: buildYearValues("profitLoss.otherOpex"),
        indent: 1,
      },
      {
        id: "totalOpex",
        label: "Total OpEx",
        values: buildYearValues("profitLoss.totalOpex"),
        isSubtotal: true,
      },

      // EBITDA
      {
        id: "ebitda",
        label: "EBITDA",
        values: buildYearValues("profitLoss.ebitda"),
        formula: buildFormulas("Total Revenue - Total OpEx"),
        isTotal: true,
      },

      // DEPRECIATION
      {
        id: "depreciation",
        label: "Depreciation",
        values: buildYearValues("profitLoss.depreciation"),
        formula: buildFormulas("PP&E depreciation expense"),
        indent: 1,
      },

      // EBIT
      {
        id: "ebit",
        label: "EBIT",
        values: buildYearValues("profitLoss.ebit"),
        formula: buildFormulas("EBITDA - Depreciation"),
        isTotal: true,
      },

      // INTEREST
      {
        id: "interest-header",
        label: "INTEREST",
        values: {},
        isHeader: true,
      },
      {
        id: "interestExpense",
        label: "Interest Expense",
        values: buildYearValues("profitLoss.interestExpense"),
        formula: buildFormulas("Debt * Interest Rate"),
        indent: 1,
      },
      {
        id: "interestIncome",
        label: "Interest Income",
        values: buildYearValues("profitLoss.interestIncome"),
        formula: buildFormulas("Cash * Deposit Rate (GAP 16)"),
        indent: 1,
      },
      {
        id: "netInterest",
        label: "Net Interest",
        values: buildYearValues("profitLoss.netInterest"),
        formula: buildFormulas("Interest Income - Interest Expense"),
        isSubtotal: true,
      },

      // EBT
      {
        id: "ebt",
        label: "EBT (Earnings Before Tax)",
        values: buildYearValues("profitLoss.ebt"),
        formula: buildFormulas("EBIT + Net Interest"),
        isTotal: true,
      },

      // ZAKAT
      {
        id: "zakatExpense",
        label: "Zakat Expense",
        values: buildYearValues("profitLoss.zakatExpense"),
        formula: buildFormulas("2.5% of EBT (GAP 14)"),
        indent: 1,
      },

      // NET INCOME
      {
        id: "netIncome",
        label: "NET INCOME",
        values: buildYearValues("profitLoss.netIncome"),
        formula: buildFormulas("EBT - Zakat"),
        isTotal: true,
      },
    ];
  };

  // Build Balance Sheet line items
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

      // Current Assets
      {
        id: "current-assets-header",
        label: "Current Assets",
        values: {},
        indent: 1,
      },
      {
        id: "cash",
        label: "Cash & Cash Equivalents",
        values: buildYearValues("balanceSheet.cash"),
        formula: buildFormulas("Minimum cash balance enforced (GAP 14)"),
        indent: 2,
      },
      {
        id: "accountsReceivable",
        label: "Accounts Receivable",
        values: buildYearValues("balanceSheet.accountsReceivable"),
        formula: buildFormulas("AR % * Revenue"),
        indent: 2,
      },
      {
        id: "prepaidExpenses",
        label: "Prepaid Expenses",
        values: buildYearValues("balanceSheet.prepaidExpenses"),
        formula: buildFormulas("Prepaid % * OpEx"),
        indent: 2,
      },
      {
        id: "totalCurrentAssets",
        label: "Total Current Assets",
        values: buildYearValues("balanceSheet.totalCurrentAssets"),
        isSubtotal: true,
      },

      // Non-Current Assets
      {
        id: "non-current-assets-header",
        label: "Non-Current Assets",
        values: {},
        indent: 1,
      },
      {
        id: "ppe",
        label: "Property, Plant & Equipment (Gross)",
        values: buildYearValues("balanceSheet.propertyPlantEquipment"),
        indent: 2,
      },
      {
        id: "accumulatedDepreciation",
        label: "Less: Accumulated Depreciation",
        values: buildYearValues("balanceSheet.accumulatedDepreciation", true),
        indent: 2,
      },
      {
        id: "totalNonCurrentAssets",
        label: "Total Non-Current Assets (Net PP&E)",
        values: buildYearValues("balanceSheet.totalNonCurrentAssets"),
        isSubtotal: true,
      },

      {
        id: "totalAssets",
        label: "TOTAL ASSETS",
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

      // Current Liabilities
      {
        id: "current-liabilities-header",
        label: "Current Liabilities",
        values: {},
        indent: 1,
      },
      {
        id: "accountsPayable",
        label: "Accounts Payable",
        values: buildYearValues("balanceSheet.accountsPayable"),
        formula: buildFormulas("AP % * OpEx"),
        indent: 2,
      },
      {
        id: "accruedExpenses",
        label: "Accrued Expenses",
        values: buildYearValues("balanceSheet.accruedExpenses"),
        formula: buildFormulas("Accrued % * OpEx"),
        indent: 2,
      },
      {
        id: "deferredRevenue",
        label: "Deferred Revenue",
        values: buildYearValues("balanceSheet.deferredRevenue"),
        formula: buildFormulas("Deferred % * Revenue"),
        indent: 2,
      },
      {
        id: "totalCurrentLiabilities",
        label: "Total Current Liabilities",
        values: buildYearValues("balanceSheet.totalCurrentLiabilities"),
        isSubtotal: true,
      },

      // Non-Current Liabilities
      {
        id: "non-current-liabilities-header",
        label: "Non-Current Liabilities",
        values: {},
        indent: 1,
      },
      {
        id: "debtBalance",
        label: "Debt Balance (PLUG)",
        values: buildYearValues("balanceSheet.debtBalance"),
        formula: buildFormulas("Balancing plug to match Assets (GAP 12)"),
        indent: 2,
      },
      {
        id: "totalNonCurrentLiabilities",
        label: "Total Non-Current Liabilities",
        values: buildYearValues("balanceSheet.totalNonCurrentLiabilities"),
        isSubtotal: true,
      },

      {
        id: "totalLiabilities",
        label: "TOTAL LIABILITIES",
        values: buildYearValues("balanceSheet.totalLiabilities"),
        isTotal: true,
      },

      // Equity
      {
        id: "equity-header",
        label: "Equity",
        values: {},
        indent: 1,
      },
      {
        id: "retainedEarnings",
        label: "Retained Earnings",
        values: buildYearValues("balanceSheet.retainedEarnings"),
        indent: 2,
      },
      {
        id: "netIncomeCurrentYear",
        label: "Net Income (Current Year)",
        values: buildYearValues("balanceSheet.netIncomeCurrentYear"),
        indent: 2,
      },
      {
        id: "totalEquity",
        label: "Total Equity",
        values: buildYearValues("balanceSheet.totalEquity"),
        isSubtotal: true,
      },

      {
        id: "totalLiabilitiesEquity",
        label: "TOTAL LIABILITIES & EQUITY",
        values: buildYearValues(
          "balanceSheet.totalLiabilities",
          false,
          "balanceSheet.totalEquity",
        ),
        isTotal: true,
      },

      // Balance Check
      {
        id: "balanceDifference",
        label: "Balance Check (Should be ~0)",
        values: buildYearValues("balanceSheet.balanceDifference"),
        formula: buildFormulas(
          "Total Assets - (Total Liabilities + Total Equity)",
        ),
        isTotal: true,
      },
    ];
  };

  // Build Cash Flow line items
  const buildCFLineItems = (): FinancialLineItem[] => {
    if (!periods || periods.length === 0) return [];

    return [
      // OPERATING ACTIVITIES
      {
        id: "operating-header",
        label: "CASH FLOW FROM OPERATING ACTIVITIES",
        values: {},
        isHeader: true,
      },
      {
        id: "netIncome",
        label: "Net Income",
        values: buildYearValues("cashFlow.netIncome"),
        indent: 1,
      },
      {
        id: "adjustments-header",
        label: "Adjustments for non-cash items:",
        values: {},
        indent: 1,
      },
      {
        id: "depreciation",
        label: "Depreciation",
        values: buildYearValues("cashFlow.depreciation"),
        indent: 2,
      },
      {
        id: "working-capital-header",
        label: "Changes in working capital:",
        values: {},
        indent: 1,
      },
      {
        id: "changeInAR",
        label: "(Increase) / Decrease in AR",
        values: buildYearValues("cashFlow.changeInAR", true),
        indent: 2,
      },
      {
        id: "changeInPrepaid",
        label: "(Increase) / Decrease in Prepaid",
        values: buildYearValues("cashFlow.changeInPrepaid", true),
        indent: 2,
      },
      {
        id: "changeInAP",
        label: "Increase / (Decrease) in AP",
        values: buildYearValues("cashFlow.changeInAP"),
        indent: 2,
      },
      {
        id: "changeInAccrued",
        label: "Increase / (Decrease) in Accrued",
        values: buildYearValues("cashFlow.changeInAccrued"),
        indent: 2,
      },
      {
        id: "changeInDeferredRevenue",
        label: "Increase / (Decrease) in Deferred",
        values: buildYearValues("cashFlow.changeInDeferredRevenue"),
        indent: 2,
      },
      {
        id: "cashFlowFromOperations",
        label: "Net Cash from Operating Activities",
        values: buildYearValues("cashFlow.cashFlowFromOperations"),
        isTotal: true,
      },

      // INVESTING ACTIVITIES
      {
        id: "investing-header",
        label: "CASH FLOW FROM INVESTING ACTIVITIES",
        values: {},
        isHeader: true,
      },
      {
        id: "capex",
        label: "Capital Expenditures (CapEx)",
        values: buildYearValues("cashFlow.capex", true),
        indent: 1,
      },
      {
        id: "cashFlowFromInvesting",
        label: "Net Cash from Investing Activities",
        values: buildYearValues("cashFlow.cashFlowFromInvesting"),
        isTotal: true,
      },

      // FINANCING ACTIVITIES
      {
        id: "financing-header",
        label: "CASH FLOW FROM FINANCING ACTIVITIES",
        values: {},
        isHeader: true,
      },
      {
        id: "debtIssuance",
        label: "Debt Issuance",
        values: buildYearValues("cashFlow.debtIssuance"),
        indent: 1,
      },
      {
        id: "debtRepayment",
        label: "Debt Repayment",
        values: buildYearValues("cashFlow.debtRepayment", true),
        indent: 1,
      },
      {
        id: "cashFlowFromFinancing",
        label: "Net Cash from Financing Activities",
        values: buildYearValues("cashFlow.cashFlowFromFinancing"),
        isTotal: true,
      },

      // NET CHANGE
      {
        id: "netChangeInCash",
        label: "NET CHANGE IN CASH",
        values: buildYearValues("cashFlow.netChangeInCash"),
        formula: buildFormulas("Operating + Investing + Financing"),
        isTotal: true,
      },

      // RECONCILIATION
      {
        id: "reconciliation-header",
        label: "CASH RECONCILIATION",
        values: {},
        isHeader: true,
      },
      {
        id: "beginningCash",
        label: "Beginning Cash Balance",
        values: buildYearValues("cashFlow.beginningCash"),
        indent: 1,
      },
      {
        id: "netChangeInCash2",
        label: "Net Change in Cash",
        values: buildYearValues("cashFlow.netChangeInCash"),
        indent: 1,
      },
      {
        id: "endingCash",
        label: "Ending Cash Balance",
        values: buildYearValues("cashFlow.endingCash"),
        isTotal: true,
      },

      // VALIDATION
      {
        id: "cashReconciliationDiff",
        label: "Cash Reconciliation Check (Should be ~0)",
        values: buildYearValues("cashFlow.cashReconciliationDiff"),
        formula: buildFormulas("Ending Cash - Balance Sheet Cash"),
        isTotal: true,
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

      if (value !== undefined && value !== null) {
        const numValue = parseFloat(value);
        const numAdditional = parseFloat(additionalValue || 0);
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

      const response = await fetch(
        `/api/proposals/${proposal.id}/export/${format}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to generate ${format.toUpperCase()} export`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = format === "excel" ? "xlsx" : "pdf";
      a.download = `${proposal.developer}_${proposal.rentModel}_${new Date().toISOString().split("T")[0]}.${extension}`;
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

  // Empty state check
  const hasFinancialData = periods && periods.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Statements</h2>
          <p className="text-muted-foreground mt-1">
            View complete financial projections over 30 years
          </p>
        </div>
        <div className="flex gap-2">
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
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-2">No Financial Data</p>
            <p className="text-sm">
              This proposal has not been calculated yet. Please run the 30-year
              calculation first.
            </p>
          </div>
        </Card>
      )}

      {hasFinancialData && (
        <>
          {/* Year Range Selector (GAP 9) */}
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Year Range:</span>
              <div className="flex gap-2">
                <Button
                  variant={yearRange === "historical" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("historical")}
                >
                  Historical (2023-2024)
                </Button>
                <Button
                  variant={yearRange === "transition" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("transition")}
                >
                  Transition (2025-2027)
                </Button>
                <Button
                  variant={yearRange === "early" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("early")}
                >
                  Early Dynamic (2028-2037)
                </Button>
                <Button
                  variant={yearRange === "late" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("late")}
                >
                  Late Dynamic (2038-2057)
                </Button>
                <Button
                  variant={yearRange === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setYearRange("all")}
                >
                  All Years
                </Button>
              </div>
            </div>
          </Card>

          {/* Statement Tabs */}
          <Tabs value={activeStatement} onValueChange={setActiveStatement}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
              <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
              <TabsTrigger value="cf">Cash Flow</TabsTrigger>
            </TabsList>

            {/* P&L Statement */}
            <TabsContent value="pl" className="mt-6">
              <FinancialTable
                title="Profit & Loss Statement"
                years={selectedYears}
                lineItems={buildPLLineItems()}
                showTooltips={true}
                highlightTotals={true}
              />
            </TabsContent>

            {/* Balance Sheet */}
            <TabsContent value="bs" className="mt-6">
              <FinancialTable
                title="Balance Sheet"
                years={selectedYears}
                lineItems={buildBSLineItems()}
                showTooltips={true}
                highlightTotals={true}
              />
            </TabsContent>

            {/* Cash Flow Statement */}
            <TabsContent value="cf" className="mt-6">
              <FinancialTable
                title="Cash Flow Statement (Indirect Method)"
                years={selectedYears}
                lineItems={buildCFLineItems()}
                showTooltips={true}
                highlightTotals={true}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
