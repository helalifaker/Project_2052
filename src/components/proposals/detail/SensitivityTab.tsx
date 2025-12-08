"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Play,
  Loader2,
  AlertTriangle,
  Info,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  ExecutiveCard,
  ExecutiveCardContent,
  ExecutiveCardHeader,
  ExecutiveCardTitle,
} from "@/components/ui/executive-card";

/**
 * Tab 6: Sensitivity Analysis (GAP 7)
 *
 * Formal sensitivity analysis with:
 * - Configuration panel (variable, range, impact metric)
 * - Tornado chart (ranked by impact)
 * - Table view with data points
 * - Export results
 */

interface SensitivityTabProps {
  proposal: any;
}

interface SensitivityDataPoint {
  variableValue: number;
  variablePercent: number;
  metricValue: string;
  calculationTimeMs: number;
}

interface SensitivityResult {
  variable: string;
  metric: string;
  baselineMetricValue: string;
  dataPoints: SensitivityDataPoint[];
  totalTimeMs: number;
  impact: {
    positiveDeviation: string;
    negativeDeviation: string;
    totalImpact: string;
  };
}

export function SensitivityTab({ proposal }: SensitivityTabProps) {
  const [selectedVariable, setSelectedVariable] = useState("enrollment");
  const [selectedMetric, setSelectedMetric] = useState("totalRent");
  const [rangePercent, setRangePercent] = useState("20");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SensitivityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSuspiciousValues, setHasSuspiciousValues] = useState(false);

  const validateSensitivityResult = (
    result: unknown,
  ): result is SensitivityResult => {
    if (!result || typeof result !== "object") {
      return false;
    }

    const r = result as Record<string, unknown>;

    // Check required fields
    if (
      !r.variable ||
      !r.metric ||
      !r.baselineMetricValue ||
      !Array.isArray(r.dataPoints)
    ) {
      return false;
    }

    // Validate data points
    if (r.dataPoints.length === 0) {
      return false;
    }

    // Check each data point has required fields
    for (const dp of r.dataPoints) {
      if (
        typeof dp !== "object" ||
        !dp ||
        typeof (dp as Record<string, unknown>).variableValue !== "number" ||
        typeof (dp as Record<string, unknown>).metricValue !== "string"
      ) {
        return false;
      }
    }

    return true;
  };

  const checkForSuspiciousValues = (result: SensitivityResult): boolean => {
    const baseline = parseFloat(result.baselineMetricValue);

    // Check baseline
    if (isNaN(baseline) || !isFinite(baseline) || Math.abs(baseline) > 1e12) {
      console.warn(
        "⚠️ Baseline value is suspicious:",
        result.baselineMetricValue,
      );
      return true;
    }

    // Check if baseline is 0 (which would be suspicious for most metrics)
    if (Math.abs(baseline) < 0.01) {
      console.warn(
        "⚠️ Baseline value is zero or near-zero:",
        result.baselineMetricValue,
      );
      return true;
    }

    // Check all data points
    let suspiciousCount = 0;
    for (const dp of result.dataPoints) {
      const value = parseFloat(dp.metricValue);

      // Check for invalid values
      if (isNaN(value) || !isFinite(value)) {
        console.warn(
          `⚠️ Invalid metric value for ${dp.variableValue}%:`,
          dp.metricValue,
        );
        suspiciousCount++;
        continue;
      }

      // Check for extremely large values
      if (Math.abs(value) > 1e12) {
        console.warn(
          `⚠️ Extremely large metric value for ${dp.variableValue}%:`,
          dp.metricValue,
        );
        suspiciousCount++;
        continue;
      }

      // Check if value is 0 when baseline is not (suspicious)
      if (Math.abs(value) < 0.01 && Math.abs(baseline) > 0.01) {
        console.warn(
          `⚠️ Metric value is zero for ${dp.variableValue}% but baseline is ${result.baselineMetricValue}`,
        );
        suspiciousCount++;
        continue;
      }

      // Check for extreme differences from baseline (more than 100x)
      if (Math.abs(baseline) > 0.01) {
        const diffRatio = Math.abs(value - baseline) / Math.abs(baseline);
        if (diffRatio > 100) {
          console.warn(
            `⚠️ Extreme difference from baseline for ${dp.variableValue}%:`,
            `${value} vs baseline ${baseline} (${(diffRatio * 100).toFixed(1)}x difference)`,
          );
          suspiciousCount++;
        }
      }
    }

    // Return true if more than half the data points are suspicious
    if (suspiciousCount > result.dataPoints.length / 2) {
      console.warn(
        `⚠️ ${suspiciousCount} out of ${result.dataPoints.length} data points are suspicious`,
      );
      return true;
    }

    return false;
  };

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    setError(null);
    setHasSuspiciousValues(false);
    setResult(null);

    try {
      const response = await fetch(
        `/api/proposals/${proposal.id}/sensitivity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variable: selectedVariable,
            rangePercent: parseInt(rangePercent),
            metric: selectedMetric,
            dataPoints: 5,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Analysis failed",
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data.result) {
        throw new Error("Invalid response: missing result data");
      }

      // Validate result structure
      if (!validateSensitivityResult(data.result)) {
        throw new Error("Invalid response: result data structure is invalid");
      }

      // Check for suspicious values
      const hasSuspicious = checkForSuspiciousValues(data.result);
      setHasSuspiciousValues(hasSuspicious);

      // Log the actual values for debugging
      console.log("📊 Sensitivity Analysis Results:", {
        variable: data.result.variable,
        metric: data.result.metric,
        baseline: data.result.baselineMetricValue,
        dataPoints: data.result.dataPoints.map((dp: SensitivityDataPoint) => ({
          variableValue: dp.variableValue,
          metricValue: dp.metricValue,
        })),
      });

      if (hasSuspicious) {
        console.warn("⚠️ Sensitivity analysis contains suspicious values");
        // Only show error if ALL values are suspicious (likely calculation error)
        const allZero = data.result.dataPoints.every(
          (dp: SensitivityDataPoint) =>
            Math.abs(parseFloat(dp.metricValue)) < 0.01,
        );
        if (
          allZero &&
          Math.abs(parseFloat(data.result.baselineMetricValue)) > 0.01
        ) {
          setError(
            "All calculated values are zero, which indicates a calculation error. Please check the console for details and try recalculating the proposal.",
          );
        } else {
          // Just a warning, not a hard error
          setError(null);
        }
        toast.warning(
          "Analysis completed but some values may be incorrect. Check console for details.",
        );
      } else {
        setError(null);
        toast.success(
          `Analysis completed in ${data.performance.totalTimeMs.toFixed(0)}ms`,
        );
      }

      setResult(data.result);
    } catch (error) {
      console.error("Error running sensitivity analysis:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to run sensitivity analysis";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = () => {
    if (!result) {
      toast.error("No results to export");
      return;
    }

    // Create CSV
    const headers = [
      "Variable Value",
      "% from Baseline",
      "Metric Value",
      "Calculation Time (ms)",
    ];
    const rows = result.dataPoints.map((dp) => [
      dp.variableValue,
      dp.variablePercent,
      dp.metricValue,
      dp.calculationTimeMs.toFixed(0),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensitivity-${result.variable}-${result.metric}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Results exported");
  };

  const formatCurrency = (value: string | number) => {
    // Handle both string and number inputs
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    // Validate the value is a reasonable number
    if (isNaN(numValue) || !isFinite(numValue)) {
      return "N/A";
    }

    // Check for unreasonably large values (likely calculation error)
    // If value is > 1 trillion, something is wrong
    if (Math.abs(numValue) > 1e12) {
      console.error("Suspiciously large value detected:", numValue);
      return "Error";
    }

    // Format in millions if > 1,000,000
    if (Math.abs(numValue) >= 1_000_000) {
      return (
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "SAR",
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(numValue / 1_000_000) + "M"
      );
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const getVariableName = (variable: string) => {
    const names: Record<string, string> = {
      enrollment: "Enrollment Capacity",
      tuitionGrowth: "Tuition Growth Rate",
      cpi: "CPI Inflation Rate",
      rentEscalation: "Rent Escalation Rate",
      staffCosts: "Staff Cost Growth",
      otherOpexPercent: "Other OpEx %",
    };
    return names[variable] || variable;
  };

  const getMetricName = (metric: string) => {
    const names: Record<string, string> = {
      npv: "Net Present Value (NPV)",
      totalRent: "Total Rent (30Y)",
      ebitda: "Total EBITDA",
      irr: "Internal Rate of Return (IRR)",
      payback: "Payback Period",
      maxDebt: "Maximum Debt",
      finalCash: "Final Cash Balance",
    };
    return names[metric] || metric;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sensitivity Analysis</h2>
          <p className="text-muted-foreground mt-1">
            Analyze how changes in key variables impact financial metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!result}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button size="sm" onClick={handleRunAnalysis} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <ExecutiveCard>
        <ExecutiveCardHeader className="border-b pb-4">
          <ExecutiveCardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Configuration
          </ExecutiveCardTitle>
        </ExecutiveCardHeader>
        <ExecutiveCardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Variable Selection */}
            <div className="space-y-2">
              <Label>Variable to Analyze</Label>
              <Select
                value={selectedVariable}
                onValueChange={setSelectedVariable}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrollment">
                    Enrollment Capacity
                  </SelectItem>
                  <SelectItem value="tuitionGrowth">
                    Tuition Growth Rate
                  </SelectItem>
                  <SelectItem value="cpi">CPI Inflation Rate</SelectItem>
                  <SelectItem value="rentEscalation">
                    Rent Escalation Rate
                  </SelectItem>
                  <SelectItem value="staffCosts">Staff Cost Growth</SelectItem>
                  <SelectItem value="otherOpexPercent">Other OpEx %</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Range Selection */}
            <div className="space-y-2">
              <Label>Variation Range</Label>
              <Select value={rangePercent} onValueChange={setRangePercent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">±10%</SelectItem>
                  <SelectItem value="20">±20%</SelectItem>
                  <SelectItem value="30">±30%</SelectItem>
                  <SelectItem value="50">±50%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Impact Metric Selection */}
            <div className="space-y-2">
              <Label>Impact Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalRent">Total Rent (30Y)</SelectItem>
                  <SelectItem value="ebitda">Total EBITDA</SelectItem>
                  <SelectItem value="maxDebt">Maximum Debt</SelectItem>
                  <SelectItem value="finalCash">Final Cash Balance</SelectItem>
                  <SelectItem value="npv">Net Present Value (NPV)</SelectItem>
                  <SelectItem value="irr">
                    Internal Rate of Return (IRR)
                  </SelectItem>
                  <SelectItem value="payback">Payback Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ExecutiveCardContent>
      </ExecutiveCard>

      {/* Error Display */}
      {error && (
        <ExecutiveCard className="border-destructive bg-destructive/5">
          <ExecutiveCardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                  Analysis Error
                </h3>
                <p className="text-sm text-destructive/90">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunAnalysis}
                  className="mt-4 border-destructive/20 hover:bg-destructive/10 text-destructive"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Retry Analysis
                </Button>
              </div>
            </div>
          </ExecutiveCardContent>
        </ExecutiveCard>
      )}

      {/* Warning for Suspicious Values */}
      {hasSuspiciousValues && result && (
        <ExecutiveCard className="border-yellow-500 bg-yellow-500/5">
          <ExecutiveCardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                  Data Quality Warning
                </h3>
                <p className="text-sm text-yellow-700/90 dark:text-yellow-400/90">
                  Some calculated values appear to be outside expected ranges.
                  This may indicate a calculation error. Please check the
                  browser console for details and consider recalculating the
                  proposal.
                </p>
              </div>
            </div>
          </ExecutiveCardContent>
        </ExecutiveCard>
      )}

      {/* Results */}
      {result && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary */}
          <ExecutiveCard className="lg:col-span-2">
            <ExecutiveCardHeader className="border-b pb-4">
              <ExecutiveCardTitle>Analysis Summary</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Variable
                  </Label>
                  <p className="text-lg font-semibold mt-1">
                    {getVariableName(result.variable)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Impact Metric
                  </Label>
                  <p className="text-lg font-semibold mt-1">
                    {getMetricName(result.metric)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Baseline Value
                  </Label>
                  <p className="text-lg font-semibold mt-1 font-mono">
                    {formatCurrency(result.baselineMetricValue)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Total Impact Range
                  </Label>
                  <p className="text-lg font-semibold mt-1 font-mono text-primary">
                    {formatCurrency(result.impact.totalImpact)}
                  </p>
                </div>
              </div>
            </ExecutiveCardContent>
          </ExecutiveCard>

          {/* Tornado Chart Visualization */}
          <ExecutiveCard>
            <ExecutiveCardHeader className="border-b pb-4">
              <ExecutiveCardTitle>Impact Visualization</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent className="pt-6">
              <div className="space-y-6">
                {result.dataPoints
                  .map((dp, idx) => {
                    const baseline = parseFloat(result.baselineMetricValue);
                    const current = parseFloat(dp.metricValue);

                    // Validate values
                    if (
                      isNaN(baseline) ||
                      isNaN(current) ||
                      !isFinite(baseline) ||
                      !isFinite(current)
                    ) {
                      return null;
                    }

                    // Check for unreasonably large values
                    if (Math.abs(baseline) > 1e12 || Math.abs(current) > 1e12) {
                      return null;
                    }

                    const diff = current - baseline;
                    const diffPercent =
                      Math.abs(baseline) > 0.01 ? (diff / baseline) * 100 : 0;

                    return { dp, idx, baseline, current, diff, diffPercent };
                  })
                  .filter(
                    (item): item is NonNullable<typeof item> => item !== null,
                  )
                  .map(({ dp, idx, baseline, current, diff, diffPercent }) => {
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {getVariableName(result.variable)}:{" "}
                            <span
                              style={{
                                color:
                                  dp.variablePercent >= 0
                                    ? "var(--financial-positive)"
                                    : "var(--financial-negative)",
                              }}
                            >
                              {dp.variablePercent >= 0 ? "+" : ""}
                              {dp.variablePercent}%
                            </span>
                          </span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {formatCurrency(dp.metricValue)} (
                            <span
                              style={{
                                color:
                                  diffPercent >= 0
                                    ? "var(--financial-positive)"
                                    : "var(--financial-negative)",
                              }}
                            >
                              {diffPercent >= 0 ? "+" : ""}
                              {diffPercent.toFixed(1)}%
                            </span>
                            )
                          </span>
                        </div>
                        <div className="relative h-6 bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full transition-all duration-500 ${
                              diff > 0
                                ? "left-1/2 rounded-r-full"
                                : "right-1/2 rounded-l-full"
                            }`}
                            style={{
                              width: `${Math.min(Math.abs(diffPercent) / 2, 50)}%`,
                              backgroundColor:
                                diff > 0
                                  ? "var(--financial-positive)"
                                  : "var(--financial-negative)",
                              opacity: 0.8,
                            }}
                          />
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/20" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ExecutiveCardContent>
          </ExecutiveCard>

          {/* Data Table */}
          <ExecutiveCard>
            <ExecutiveCardHeader className="border-b pb-4">
              <ExecutiveCardTitle>Sensitivity Data Points</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent className="pt-6 p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Variable Value
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        % from Baseline
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Metric Value
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.dataPoints
                      .map((dp, idx) => {
                        const baseline = parseFloat(result.baselineMetricValue);
                        const current = parseFloat(dp.metricValue);

                        // Validate values
                        if (
                          isNaN(baseline) ||
                          isNaN(current) ||
                          !isFinite(baseline) ||
                          !isFinite(current)
                        ) {
                          return null;
                        }

                        // Check for unreasonably large values
                        if (
                          Math.abs(baseline) > 1e12 ||
                          Math.abs(current) > 1e12
                        ) {
                          return null;
                        }

                        const diff = current - baseline;
                        const diffPercent =
                          Math.abs(baseline) > 0.01
                            ? (diff / baseline) * 100
                            : 0;

                        return {
                          dp,
                          idx,
                          baseline,
                          current,
                          diff,
                          diffPercent,
                        };
                      })
                      .filter(
                        (item): item is NonNullable<typeof item> =>
                          item !== null,
                      )
                      .map(
                        ({ dp, idx, baseline, current, diff, diffPercent }) => {
                          return (
                            <tr
                              key={idx}
                              className="border-b hover:bg-muted/50 transition-colors"
                            >
                              <td className="py-3 px-4 font-medium">
                                {dp.variableValue}%
                              </td>
                              <td className="text-right py-3 px-4 font-mono text-muted-foreground">
                                {dp.variablePercent >= 0 ? "+" : ""}
                                {dp.variablePercent}%
                              </td>
                              <td className="text-right py-3 px-4 font-semibold font-mono">
                                {formatCurrency(dp.metricValue)}
                              </td>
                              <td
                                className="text-right py-3 px-4 font-semibold font-mono"
                                style={{
                                  color:
                                    diff > 0
                                      ? "var(--financial-positive)"
                                      : diff < 0
                                        ? "var(--financial-negative)"
                                        : undefined,
                                }}
                              >
                                {diffPercent >= 0 ? "+" : ""}
                                {diffPercent.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        },
                      )}
                  </tbody>
                </table>
              </div>
            </ExecutiveCardContent>
          </ExecutiveCard>
        </div>
      )}

      {!result && !isRunning && (
        <ExecutiveCard className="p-12 border-dashed">
          <div className="text-center text-muted-foreground">
            <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-semibold mb-2 text-foreground">
              Ready to Analyze
            </p>
            <p className="text-sm max-w-md mx-auto">
              Configure your analysis parameters above and click &quot;Run
              Analysis&quot; to see how sensitive your financial model is to
              variable changes.
            </p>
          </div>
        </ExecutiveCard>
      )}

      {isRunning && (
        <ExecutiveCard className="p-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold mb-2">
              Running Sensitivity Analysis
            </p>
            <p className="text-sm text-muted-foreground">
              Calculating {getVariableName(selectedVariable)} impact on{" "}
              {getMetricName(selectedMetric)}...
            </p>
          </div>
        </ExecutiveCard>
      )}

      {/* Analysis Description */}
      <ExecutiveCard className="bg-muted/30 border-none">
        <ExecutiveCardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2 text-sm">
                How Sensitivity Analysis Works
              </h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>
                  Select a variable to vary (e.g., Enrollment Capacity) and a
                  range (e.g., ±20%)
                </li>
                <li>
                  Choose an impact metric to measure (e.g., NPV, IRR, Total
                  Rent)
                </li>
                <li>
                  The system will run calculations across the variable range
                  (e.g., 80% to 120% of baseline)
                </li>
                <li>
                  Results are visualized showing the impact on your chosen
                  metric
                </li>
                <li>
                  This helps identify which variables have the greatest
                  influence on your chosen metric
                </li>
              </ol>
            </div>
          </div>
        </ExecutiveCardContent>
      </ExecutiveCard>
    </div>
  );
}
