"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YearRangeSelector } from "@/components/financial/YearRangeSelector";
import { YearRangeKey, YEAR_RANGES } from "@/lib/utils/financial";
import { formatMillions, getFinancialColorClass } from "@/lib/utils/financial";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Side-by-side Financial Statements Comparison
 *
 * Track 4B: Proposal Comparison Page - Advanced Features
 *
 * Features:
 * - Side-by-side column layout (one column per proposal)
 * - Year range selector (Historical, Transition, Early Dynamic, Late Dynamic, All)
 * - Synchronized scrolling
 * - P&L, Balance Sheet, Cash Flow statements
 * - Millions (M) format (GAP 8)
 * - Color coding for positive/negative values
 * - Responsive with horizontal scroll
 */

type FinancialPeriod = {
  year: number;
  [key: string]: unknown;
};

interface ProposalFinancialData {
  id: string;
  name: string;
  developer?: string;
  rentModel: string;
  financials: FinancialPeriod[];
}

interface FinancialStatementsComparisonProps {
  proposals: ProposalFinancialData[];
  className?: string;
}

export function FinancialStatementsComparison({
  proposals,
  className,
}: FinancialStatementsComparisonProps) {
  const [activeStatement, setActiveStatement] = useState<"pl" | "bs" | "cf">(
    "pl",
  );
  const [yearRange, setYearRange] = useState<YearRangeKey>("ALL");

  // Get years based on selected range
  const getYears = () => {
    const range = YEAR_RANGES[yearRange];
    const years: number[] = [];
    for (let year = range.start; year <= range.end; year++) {
      years.push(year);
    }
    return years;
  };

  const selectedYears = getYears();

  // Helper to get nested value from financial data
  const getFinancialValue = (
    proposal: ProposalFinancialData,
    year: number,
    path: string,
  ): number | null => {
    const period = proposal.financials?.find((p) => p.year === year);
    if (!period) return null;

    const keys = path.split(".");
    let value: unknown = period;
    for (const key of keys) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[key];
      } else {
        return null;
      }
      if (value === undefined || value === null) return null;
    }

    return typeof value === "number"
      ? value
      : parseFloat(String(value)) || null;
  };

  // P&L Line Items Definition
  const plLineItems: Array<{
    id: string;
    label: string;
    path: string | null;
    isHeader?: boolean;
    isSubtotal?: boolean;
    isTotal?: boolean;
    indent?: number;
    negate?: boolean;
  }> = [
    { id: "revenue-header", label: "REVENUE", path: null, isHeader: true },
    {
      id: "tuitionRevenue",
      label: "Tuition Revenue",
      path: "profitLoss.tuitionRevenue",
      indent: 1,
    },
    {
      id: "otherRevenue",
      label: "Other Revenue",
      path: "profitLoss.otherRevenue",
      indent: 1,
    },
    {
      id: "totalRevenue",
      label: "Total Revenue",
      path: "profitLoss.totalRevenue",
      isSubtotal: true,
    },
    {
      id: "opex-header",
      label: "OPERATING EXPENSES",
      path: null,
      isHeader: true,
    },
    {
      id: "rentExpense",
      label: "Rent Expense",
      path: "profitLoss.rentExpense",
      indent: 1,
    },
    {
      id: "staffCosts",
      label: "Staff Costs",
      path: "profitLoss.staffCosts",
      indent: 1,
    },
    {
      id: "otherOpex",
      label: "Other OpEx",
      path: "profitLoss.otherOpex",
      indent: 1,
    },
    {
      id: "totalOpex",
      label: "Total OpEx",
      path: "profitLoss.totalOpex",
      isSubtotal: true,
    },
    { id: "ebitda", label: "EBITDA", path: "profitLoss.ebitda", isTotal: true },
    {
      id: "depreciation",
      label: "Depreciation",
      path: "profitLoss.depreciation",
      indent: 1,
    },
    { id: "ebit", label: "EBIT", path: "profitLoss.ebit", isTotal: true },
    {
      id: "interestExpense",
      label: "Interest Expense",
      path: "profitLoss.interestExpense",
      indent: 1,
    },
    {
      id: "interestIncome",
      label: "Interest Income",
      path: "profitLoss.interestIncome",
      indent: 1,
    },
    {
      id: "netInterest",
      label: "Net Interest",
      path: "profitLoss.netInterest",
      isSubtotal: true,
    },
    { id: "ebt", label: "EBT", path: "profitLoss.ebt", isTotal: true },
    {
      id: "zakatExpense",
      label: "Zakat Expense",
      path: "profitLoss.zakatExpense",
      indent: 1,
    },
    {
      id: "netIncome",
      label: "NET INCOME",
      path: "profitLoss.netIncome",
      isTotal: true,
    },
  ];

  // Balance Sheet Line Items Definition
  const bsLineItems: Array<{
    id: string;
    label: string;
    path: string | null;
    isHeader?: boolean;
    isSubtotal?: boolean;
    isTotal?: boolean;
    indent?: number;
    negate?: boolean;
  }> = [
    { id: "assets-header", label: "ASSETS", path: null, isHeader: true },
    {
      id: "current-assets-header",
      label: "Current Assets",
      path: null,
      indent: 1,
    },
    {
      id: "cash",
      label: "Cash & Cash Equivalents",
      path: "balanceSheet.cash",
      indent: 2,
    },
    {
      id: "accountsReceivable",
      label: "Accounts Receivable",
      path: "balanceSheet.accountsReceivable",
      indent: 2,
    },
    {
      id: "prepaidExpenses",
      label: "Prepaid Expenses",
      path: "balanceSheet.prepaidExpenses",
      indent: 2,
    },
    {
      id: "totalCurrentAssets",
      label: "Total Current Assets",
      path: "balanceSheet.totalCurrentAssets",
      isSubtotal: true,
    },
    {
      id: "non-current-assets-header",
      label: "Non-Current Assets",
      path: null,
      indent: 1,
    },
    {
      id: "ppe",
      label: "PP&E (Gross)",
      path: "balanceSheet.propertyPlantEquipment",
      indent: 2,
    },
    {
      id: "accumulatedDepreciation",
      label: "Less: Accumulated Depreciation",
      path: "balanceSheet.accumulatedDepreciation",
      indent: 2,
      negate: true,
    },
    {
      id: "totalNonCurrentAssets",
      label: "Total Non-Current Assets",
      path: "balanceSheet.totalNonCurrentAssets",
      isSubtotal: true,
    },
    {
      id: "totalAssets",
      label: "TOTAL ASSETS",
      path: "balanceSheet.totalAssets",
      isTotal: true,
    },
    {
      id: "liabilities-header",
      label: "LIABILITIES & EQUITY",
      path: null,
      isHeader: true,
    },
    {
      id: "current-liabilities-header",
      label: "Current Liabilities",
      path: null,
      indent: 1,
    },
    {
      id: "accountsPayable",
      label: "Accounts Payable",
      path: "balanceSheet.accountsPayable",
      indent: 2,
    },
    {
      id: "accruedExpenses",
      label: "Accrued Expenses",
      path: "balanceSheet.accruedExpenses",
      indent: 2,
    },
    {
      id: "deferredRevenue",
      label: "Deferred Revenue",
      path: "balanceSheet.deferredRevenue",
      indent: 2,
    },
    {
      id: "totalCurrentLiabilities",
      label: "Total Current Liabilities",
      path: "balanceSheet.totalCurrentLiabilities",
      isSubtotal: true,
    },
    {
      id: "non-current-liabilities-header",
      label: "Non-Current Liabilities",
      path: null,
      indent: 1,
    },
    {
      id: "debtBalance",
      label: "Debt Balance (PLUG)",
      path: "balanceSheet.debtBalance",
      indent: 2,
    },
    {
      id: "totalNonCurrentLiabilities",
      label: "Total Non-Current Liabilities",
      path: "balanceSheet.totalNonCurrentLiabilities",
      isSubtotal: true,
    },
    {
      id: "totalLiabilities",
      label: "TOTAL LIABILITIES",
      path: "balanceSheet.totalLiabilities",
      isTotal: true,
    },
    { id: "equity-header", label: "Equity", path: null, indent: 1 },
    {
      id: "retainedEarnings",
      label: "Retained Earnings",
      path: "balanceSheet.retainedEarnings",
      indent: 2,
    },
    {
      id: "totalEquity",
      label: "Total Equity",
      path: "balanceSheet.totalEquity",
      isSubtotal: true,
    },
    {
      id: "totalLiabilitiesEquity",
      label: "TOTAL LIABILITIES & EQUITY",
      path: "balanceSheet.totalLiabilitiesEquity",
      isTotal: true,
    },
  ];

  // Cash Flow Line Items Definition
  const cfLineItems: Array<{
    id: string;
    label: string;
    path: string | null;
    isHeader?: boolean;
    isSubtotal?: boolean;
    isTotal?: boolean;
    indent?: number;
    negate?: boolean;
  }> = [
    {
      id: "operating-header",
      label: "OPERATING ACTIVITIES",
      path: null,
      isHeader: true,
    },
    {
      id: "netIncome",
      label: "Net Income",
      path: "cashFlow.netIncome",
      indent: 1,
    },
    {
      id: "depreciation",
      label: "Depreciation",
      path: "cashFlow.depreciation",
      indent: 1,
    },
    {
      id: "changeInAR",
      label: "(Increase) / Decrease in AR",
      path: "cashFlow.changeInAR",
      indent: 1,
      negate: true,
    },
    {
      id: "changeInPrepaid",
      label: "(Increase) / Decrease in Prepaid",
      path: "cashFlow.changeInPrepaid",
      indent: 1,
      negate: true,
    },
    {
      id: "changeInAP",
      label: "Increase / (Decrease) in AP",
      path: "cashFlow.changeInAP",
      indent: 1,
    },
    {
      id: "changeInAccrued",
      label: "Increase / (Decrease) in Accrued",
      path: "cashFlow.changeInAccrued",
      indent: 1,
    },
    {
      id: "changeInDeferredRevenue",
      label: "Increase / (Decrease) in Deferred",
      path: "cashFlow.changeInDeferredRevenue",
      indent: 1,
    },
    {
      id: "cashFlowFromOperations",
      label: "Net Cash from Operating Activities",
      path: "cashFlow.cashFlowFromOperations",
      isTotal: true,
    },
    {
      id: "investing-header",
      label: "INVESTING ACTIVITIES",
      path: null,
      isHeader: true,
    },
    {
      id: "capex",
      label: "Capital Expenditures",
      path: "cashFlow.capex",
      indent: 1,
      negate: true,
    },
    {
      id: "cashFlowFromInvesting",
      label: "Net Cash from Investing Activities",
      path: "cashFlow.cashFlowFromInvesting",
      isTotal: true,
    },
    {
      id: "financing-header",
      label: "FINANCING ACTIVITIES",
      path: null,
      isHeader: true,
    },
    {
      id: "debtIssuance",
      label: "Debt Issuance",
      path: "cashFlow.debtIssuance",
      indent: 1,
    },
    {
      id: "debtRepayment",
      label: "Debt Repayment",
      path: "cashFlow.debtRepayment",
      indent: 1,
      negate: true,
    },
    {
      id: "cashFlowFromFinancing",
      label: "Net Cash from Financing Activities",
      path: "cashFlow.cashFlowFromFinancing",
      isTotal: true,
    },
    {
      id: "netChangeInCash",
      label: "NET CHANGE IN CASH",
      path: "cashFlow.netChangeInCash",
      isTotal: true,
    },
    {
      id: "beginningCash",
      label: "Beginning Cash Balance",
      path: "cashFlow.beginningCash",
      indent: 1,
    },
    {
      id: "endingCash",
      label: "Ending Cash Balance",
      path: "cashFlow.endingCash",
      isTotal: true,
    },
  ];

  const getLineItems = () => {
    switch (activeStatement) {
      case "pl":
        return plLineItems;
      case "bs":
        return bsLineItems;
      case "cf":
        return cfLineItems;
      default:
        return [];
    }
  };

  const lineItems = getLineItems();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Financial Statements Comparison</h2>
        <p className="text-muted-foreground mt-1">
          Side-by-side comparison of financial statements across{" "}
          {proposals.length} proposals
        </p>
      </div>

      {/* Year Range Selector */}
      <Card className="p-4">
        <YearRangeSelector selected={yearRange} onChange={setYearRange} />
      </Card>

      {/* Statement Tabs */}
      <Tabs
        value={activeStatement}
        onValueChange={(value) =>
          setActiveStatement(value as "pl" | "bs" | "cf")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cf">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value={activeStatement} className="mt-6">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* First column: Line Item labels */}
                    <TableHead className="sticky left-0 z-20 bg-background min-w-[250px] border-r-2">
                      Line Item
                    </TableHead>

                    {/* Year columns for each proposal */}
                    {proposals.map((proposal, proposalIdx) => (
                      <TableHead
                        key={proposal.id}
                        colSpan={selectedYears.length}
                        className={cn(
                          "text-center border-r-2 bg-muted/50",
                          proposalIdx % 2 === 0
                            ? "bg-blue-50/50 dark:bg-blue-950/20"
                            : "bg-green-50/50 dark:bg-green-950/20",
                        )}
                      >
                        <div className="font-semibold text-sm">
                          {proposal.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {proposal.developer} • {proposal.rentModel}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>

                  {/* Year sub-headers */}
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 bg-background border-r-2">
                      Years
                    </TableHead>
                    {proposals.map((proposal, proposalIdx) =>
                      selectedYears.map((year, yearIdx) => (
                        <TableHead
                          key={`${proposal.id}-${year}`}
                          className={cn(
                            "text-right font-mono text-xs",
                            yearIdx === selectedYears.length - 1 &&
                              "border-r-2",
                            proposalIdx % 2 === 0
                              ? "bg-blue-50/30 dark:bg-blue-950/10"
                              : "bg-green-50/30 dark:bg-green-950/10",
                          )}
                        >
                          {year}
                        </TableHead>
                      )),
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {lineItems.map((item) => {
                    const isSpecial =
                      item.isSubtotal || item.isTotal || item.isHeader;
                    const indentClass = item.indent
                      ? `pl-${Math.min(item.indent * 4, 12)}`
                      : "";

                    return (
                      <TableRow
                        key={item.id}
                        className={cn(
                          isSpecial && "bg-muted/30",
                          item.isTotal && "font-bold bg-primary/5",
                        )}
                      >
                        {/* Line Item Label */}
                        <TableCell
                          className={cn(
                            "sticky left-0 z-10 bg-background border-r-2",
                            indentClass,
                            item.isSubtotal && "font-semibold",
                            item.isTotal && "font-bold",
                            item.isHeader && "font-bold uppercase text-xs",
                          )}
                        >
                          {item.label}
                        </TableCell>

                        {/* Values for each proposal and year */}
                        {proposals.map((proposal, proposalIdx) =>
                          selectedYears.map((year, yearIdx) => {
                            let value: number | null = null;

                            if (item.path) {
                              value = getFinancialValue(
                                proposal,
                                year,
                                item.path,
                              );
                              if (value !== null && item.negate) {
                                value = -value;
                              }
                            }

                            return (
                              <TableCell
                                key={`${proposal.id}-${year}-${item.id}`}
                                className={cn(
                                  "text-right font-mono tabular-nums text-xs",
                                  item.isSubtotal && "font-semibold",
                                  item.isTotal && "font-bold",
                                  yearIdx === selectedYears.length - 1 &&
                                    "border-r-2",
                                  proposalIdx % 2 === 0
                                    ? "bg-blue-50/10 dark:bg-blue-950/5"
                                    : "bg-green-50/10 dark:bg-green-950/5",
                                )}
                              >
                                {value !== null ? (
                                  <span
                                    className={cn(
                                      getFinancialColorClass(value),
                                    )}
                                  >
                                    {formatMillions(value)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            );
                          }),
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
