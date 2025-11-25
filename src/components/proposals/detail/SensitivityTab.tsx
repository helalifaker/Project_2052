"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  const handleRunAnalysis = async () => {
    setIsRunning(true);

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
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data.result);
      toast.success(
        `Analysis completed in ${data.performance.totalTimeMs.toFixed(0)}ms`,
      );
    } catch (error) {
      console.error("Error running sensitivity analysis:", error);
      toast.error("Failed to run sensitivity analysis");
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

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const getVariableName = (variable: string) => {
    const names: Record<string, string> = {
      enrollment: "Enrollment Capacity",
      tuitionGrowth: "Tuition Growth Rate",
      cpi: "CPI Inflation Rate",
      rentEscalation: "Rent Escalation Rate",
      staffCosts: "Staff Cost Growth",
      otherOpex: "Other OpEx %",
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
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Configuration</h3>
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
                <SelectItem value="enrollment">Enrollment Capacity</SelectItem>
                <SelectItem value="tuitionGrowth">
                  Tuition Growth Rate
                </SelectItem>
                <SelectItem value="cpi">CPI Inflation Rate</SelectItem>
                <SelectItem value="rentEscalation">
                  Rent Escalation Rate
                </SelectItem>
                <SelectItem value="staffCosts">Staff Cost Growth</SelectItem>
                <SelectItem value="otherOpex">Other OpEx %</SelectItem>
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
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Variable</Label>
                <p className="text-lg font-semibold">
                  {getVariableName(result.variable)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Impact Metric</Label>
                <p className="text-lg font-semibold">
                  {getMetricName(result.metric)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Baseline Value</Label>
                <p className="text-lg font-semibold">
                  {formatCurrency(result.baselineMetricValue)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Total Impact Range
                </Label>
                <p className="text-lg font-semibold">
                  {formatCurrency(result.impact.totalImpact)}
                </p>
              </div>
            </div>
          </Card>

          {/* Tornado Chart Visualization */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Impact Visualization</h3>
            <div className="space-y-4">
              {result.dataPoints.map((dp, idx) => {
                const baseline = parseFloat(result.baselineMetricValue);
                const current = parseFloat(dp.metricValue);
                const diff = current - baseline;
                const diffPercent = (diff / baseline) * 100;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {getVariableName(result.variable)}:{" "}
                        {dp.variablePercent >= 0 ? "+" : ""}
                        {dp.variablePercent}%
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(dp.metricValue)} (
                        {diffPercent >= 0 ? "+" : ""}
                        {diffPercent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full ${
                          diff > 0
                            ? "bg-green-500 left-1/2"
                            : "bg-red-500 right-1/2"
                        }`}
                        style={{
                          width: `${Math.abs(diffPercent) / 2}%`,
                        }}
                      />
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Data Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Sensitivity Data Points
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">
                      Variable Value
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      % from Baseline
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Metric Value
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Change from Baseline
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Calc Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.dataPoints.map((dp, idx) => {
                    const baseline = parseFloat(result.baselineMetricValue);
                    const current = parseFloat(dp.metricValue);
                    const diff = current - baseline;
                    const diffPercent = (diff / baseline) * 100;

                    return (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">
                          {dp.variableValue}%
                        </td>
                        <td className="text-right py-3 px-4">
                          {dp.variablePercent >= 0 ? "+" : ""}
                          {dp.variablePercent}%
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(dp.metricValue)}
                        </td>
                        <td
                          className={`text-right py-3 px-4 font-semibold ${
                            diff > 0
                              ? "text-green-600"
                              : diff < 0
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          {diff >= 0 ? "+" : ""}
                          {formatCurrency(diff.toString())} (
                          {diffPercent >= 0 ? "+" : ""}
                          {diffPercent.toFixed(2)}%)
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {dp.calculationTimeMs.toFixed(0)}ms
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!result && !isRunning && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">
              Configure your analysis above and click &quot;Run Analysis&quot;
              to start
            </p>
            <p className="text-sm">
              Results will show how the selected variable impacts the chosen
              metric
            </p>
          </div>
        </Card>
      )}

      {isRunning && (
        <Card className="p-12">
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
        </Card>
      )}

      {/* Analysis Description */}
      <Card className="p-6 bg-muted/50">
        <h4 className="font-semibold mb-2">How Sensitivity Analysis Works:</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
          <li>
            Select a variable to vary (e.g., Enrollment Capacity) and a range
            (e.g., ±20%)
          </li>
          <li>
            Choose an impact metric to measure (e.g., NPV, IRR, Total Rent)
          </li>
          <li>
            The system will run calculations across the variable range (e.g.,
            80% to 120% of baseline)
          </li>
          <li>
            Results are visualized showing the impact on your chosen metric
          </li>
          <li>
            This helps identify which variables have the greatest influence on
            your chosen metric
          </li>
        </ol>
      </Card>
    </div>
  );
}
