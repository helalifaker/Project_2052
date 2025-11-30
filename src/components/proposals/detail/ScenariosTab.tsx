"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RotateCcw, Loader2, Info, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { debounce } from "lodash";
import { ScenarioCashFlowChart, ScenarioRentChart } from "./charts";
import {
  ExecutiveCard,
  ExecutiveCardContent,
  ExecutiveCardHeader,
  ExecutiveCardTitle,
} from "@/components/ui/executive-card";

/**
 * Tab 5: Scenarios (Interactive Sliders - GAP 6)
 *
 * REDESIGNED LAYOUT:
 * - Top: Two side-by-side charts (Cash Flow + Rent over 30 years)
 * - Bottom: Sliders (left) + Metrics comparison (right)
 *
 * KEY FIXES:
 * - Baseline values extracted from actual proposal configuration
 * - All sliders show absolute values
 * - Enrollment = % of max capacity (50-100%)
 * - Rent escalation disabled for REVENUE_SHARE model
 */

interface ScenariosTabProps {
  proposal: {
    id: string;
    rentModel: string;
    [key: string]: unknown;
  };
}

interface BaselineSliderValues {
  enrollment: number;
  cpi: number;
  tuitionGrowth: number;
  rentEscalation: number;
}

interface TimeSeriesDataPoint {
  year: number;
  baselineCashFlow: number;
  scenarioCashFlow: number;
  baselineRent: number;
  scenarioRent: number;
}

interface MetricComparison {
  baseline: string;
  current: string;
  absoluteChange: string;
  percentChange: string;
}

export function ScenariosTab({ proposal }: ScenariosTabProps) {
  // ==========================================================================
  // STATE
  // ==========================================================================

  // Baseline values - fetched from API on mount
  const [baseline, setBaseline] = useState<BaselineSliderValues>({
    enrollment: 100,
    cpi: 3.0,
    tuitionGrowth: 5.0,
    rentEscalation: 3.0,
  });

  // Current slider values
  const [enrollmentPercent, setEnrollmentPercent] = useState(100);
  const [cpiPercent, setCpiPercent] = useState(3.0);
  const [tuitionGrowthPercent, setTuitionGrowthPercent] = useState(5.0);
  const [rentEscalationPercent, setRentEscalationPercent] = useState(3.0);

  // Chart data
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>(
    [],
  );

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [rentModel, setRentModel] = useState<string>(proposal.rentModel || "");
  const [comparison, setComparison] = useState<Record<
    string,
    MetricComparison
  > | null>(null);
  const [calculationTime, setCalculationTime] = useState<number | null>(null);

  // ==========================================================================
  // FETCH BASELINE ON MOUNT
  // ==========================================================================

  useEffect(() => {
    const fetchBaseline = async () => {
      try {
        const response = await fetch(
          `/api/proposals/${proposal.id}/scenarios`,
        );
        if (response.ok) {
          const data = await response.json();

          if (data.baselineSliderValues) {
            setBaseline(data.baselineSliderValues);
            setEnrollmentPercent(data.baselineSliderValues.enrollment);
            setCpiPercent(data.baselineSliderValues.cpi);
            setTuitionGrowthPercent(data.baselineSliderValues.tuitionGrowth);
            setRentEscalationPercent(data.baselineSliderValues.rentEscalation);
          }

          if (data.rentModel) {
            setRentModel(data.rentModel);
          }

          // Initialize chart with baseline data
          if (data.baselineTimeSeries) {
            setTimeSeriesData(
              data.baselineTimeSeries.map(
                (d: { year: number; cashFlow: number; rent: number }) => ({
                  year: d.year,
                  baselineCashFlow: d.cashFlow,
                  scenarioCashFlow: d.cashFlow, // Same as baseline initially
                  baselineRent: d.rent,
                  scenarioRent: d.rent,
                }),
              ),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching baseline:", error);
        toast.error("Failed to load baseline values");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBaseline();
  }, [proposal.id]);

  // ==========================================================================
  // DEBOUNCED CALCULATION
  // ==========================================================================

  const calculateScenario = useCallback(
    debounce(async (variables: {
      enrollmentPercent: number;
      cpiPercent: number;
      tuitionGrowthPercent: number;
      rentEscalationPercent: number;
    }) => {
      setIsCalculating(true);

      try {
        const response = await fetch(
          `/api/proposals/${proposal.id}/scenarios`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(variables),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "Calculation failed");
        }

        // Update time series for charts
        if (data.timeSeriesData) {
          setTimeSeriesData(data.timeSeriesData);
        }

        setComparison(data.comparison);
        setCalculationTime(data.performance?.totalTimeMs ?? null);
      } catch (error) {
        console.error("Error calculating scenario:", error);
        const message =
          error instanceof Error ? error.message : "Failed to calculate";
        toast.error(message);
      } finally {
        setIsCalculating(false);
      }
    }, 300),
    [proposal.id],
  );

  // Trigger calculation when sliders change
  useEffect(() => {
    if (isLoading) return; // Don't calculate while loading baseline

    calculateScenario({
      enrollmentPercent,
      cpiPercent,
      tuitionGrowthPercent,
      rentEscalationPercent,
    });
  }, [
    enrollmentPercent,
    cpiPercent,
    tuitionGrowthPercent,
    rentEscalationPercent,
    calculateScenario,
    isLoading,
  ]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleReset = () => {
    setEnrollmentPercent(baseline.enrollment);
    setCpiPercent(baseline.cpi);
    setTuitionGrowthPercent(baseline.tuitionGrowth);
    setRentEscalationPercent(baseline.rentEscalation);
    toast.success("Reset to baseline values");
  };

  // ==========================================================================
  // DERIVED DATA FOR CHARTS
  // ==========================================================================

  const cashFlowChartData = useMemo(
    () =>
      timeSeriesData.map((d) => ({
        year: d.year,
        baseline: d.baselineCashFlow,
        scenario: d.scenarioCashFlow,
      })),
    [timeSeriesData],
  );

  const rentChartData = useMemo(
    () =>
      timeSeriesData.map((d) => ({
        year: d.year,
        baseline: d.baselineRent,
        scenario: d.scenarioRent,
      })),
    [timeSeriesData],
  );

  // Is rent escalation slider applicable?
  const isRentEscalationDisabled = rentModel === "REVENUE_SHARE";

  // ==========================================================================
  // FORMAT HELPERS
  // ==========================================================================

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    const millions = num / 1_000_000;
    return `${millions.toFixed(1)}M SAR`;
  };

  const formatPercent = (value: string) => {
    const num = parseFloat(value);
    return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  const formatMetricName = (metric: string): string => {
    const names: Record<string, string> = {
      totalRent: "Total Rent (30Y)",
      npv: "Net Present Value",
      totalEbitda: "Total EBITDA (30Y)",
      finalCash: "Final Cash",
      maxDebt: "Max Debt",
    };
    return names[metric] || metric;
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scenario Analysis</h2>
          <p className="text-muted-foreground mt-1">
            Adjust variables and see real-time impact on 30-year projections
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Baseline
        </Button>
      </div>

      {/* Charts Row - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExecutiveCard>
          <ExecutiveCardHeader>
            <ExecutiveCardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Cash Flow Over 30 Years
            </ExecutiveCardTitle>
          </ExecutiveCardHeader>
          <ExecutiveCardContent>
            <ScenarioCashFlowChart
              data={cashFlowChartData}
              isLoading={isCalculating}
            />
          </ExecutiveCardContent>
        </ExecutiveCard>

        <ExecutiveCard>
          <ExecutiveCardHeader>
            <ExecutiveCardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Rent Over 30 Years
            </ExecutiveCardTitle>
          </ExecutiveCardHeader>
          <ExecutiveCardContent>
            <ScenarioRentChart data={rentChartData} isLoading={isCalculating} />
          </ExecutiveCardContent>
        </ExecutiveCard>
      </div>

      {/* Bottom Row - Sliders and Metrics Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Card */}
        <ExecutiveCard>
          <ExecutiveCardHeader className="border-b pb-4">
            <ExecutiveCardTitle>Adjust Variables</ExecutiveCardTitle>
          </ExecutiveCardHeader>
          <ExecutiveCardContent className="pt-6 space-y-8">
            {/* Enrollment Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">Capacity Utilization</Label>
                <span className="text-sm font-mono font-semibold bg-primary/10 px-2 py-1 rounded text-primary">
                  {enrollmentPercent}%
                </span>
              </div>
              <Slider
                value={[enrollmentPercent]}
                onValueChange={(value) => setEnrollmentPercent(value[0])}
                min={50}
                max={100}
                step={5}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Baseline: {baseline.enrollment}% | Range: 50% to 100% of max
                capacity
              </p>
            </div>

            {/* CPI Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">CPI Growth Rate</Label>
                <span className="text-sm font-mono font-semibold bg-primary/10 px-2 py-1 rounded text-primary">
                  {cpiPercent.toFixed(1)}%
                </span>
              </div>
              <Slider
                value={[cpiPercent]}
                onValueChange={(value) => setCpiPercent(value[0])}
                min={0}
                max={10}
                step={0.5}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Baseline: {baseline.cpi.toFixed(1)}% | Range: 0% to 10%
              </p>
            </div>

            {/* Tuition Growth Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">Tuition Growth Rate</Label>
                <span className="text-sm font-mono font-semibold bg-primary/10 px-2 py-1 rounded text-primary">
                  {tuitionGrowthPercent.toFixed(1)}%
                </span>
              </div>
              <Slider
                value={[tuitionGrowthPercent]}
                onValueChange={(value) => setTuitionGrowthPercent(value[0])}
                min={0}
                max={15}
                step={0.5}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Baseline: {baseline.tuitionGrowth.toFixed(1)}% | Range: 0% to
                15%
              </p>
            </div>

            {/* Rent Escalation Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label
                  className={`text-base ${isRentEscalationDisabled ? "text-muted-foreground" : ""
                    }`}
                >
                  Rent Escalation Rate
                </Label>
                <span className="text-sm font-mono font-semibold bg-primary/10 px-2 py-1 rounded text-primary">
                  {rentEscalationPercent.toFixed(1)}%
                </span>
              </div>
              <Slider
                value={[rentEscalationPercent]}
                onValueChange={(value) => setRentEscalationPercent(value[0])}
                min={0}
                max={10}
                step={0.5}
                disabled={isRentEscalationDisabled}
                className={`py-2 ${isRentEscalationDisabled ? "opacity-50" : ""}`}
              />
              {isRentEscalationDisabled ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Not applicable for Revenue Share model (rent scales with
                  revenue)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Baseline: {baseline.rentEscalation.toFixed(1)}% | Range: 0% to
                  10%
                </p>
              )}
            </div>
          </ExecutiveCardContent>
        </ExecutiveCard>

        {/* Metrics Comparison Card */}
        <ExecutiveCard>
          <ExecutiveCardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <ExecutiveCardTitle>Metric Comparison</ExecutiveCardTitle>
              <div className="flex items-center gap-2">
                {calculationTime && (
                  <span className="text-xs text-muted-foreground">
                    {calculationTime.toFixed(0)}ms
                  </span>
                )}
                {isCalculating && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          </ExecutiveCardHeader>

          <ExecutiveCardContent className="pt-6">
            {comparison ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Metric</th>
                      <th className="text-right py-2 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Baseline</th>
                      <th className="text-right py-2 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Scenario</th>
                      <th className="text-right py-2 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparison).map(([metric, data]) => (
                      <tr key={metric} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-medium">
                          {formatMetricName(metric)}
                        </td>
                        <td className="text-right py-3 text-muted-foreground font-mono">
                          {formatCurrency(data.baseline)}
                        </td>
                        <td className="text-right py-3 font-semibold font-mono">
                          {formatCurrency(data.current)}
                        </td>
                        <td
                          className={`text-right py-3 font-semibold font-mono ${parseFloat(data.percentChange) > 0
                              ? "text-green-600"
                              : parseFloat(data.percentChange) < 0
                                ? "text-red-600"
                                : ""
                            }`}
                        >
                          {formatPercent(data.percentChange)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {/* Interpretation Helper */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">Green</span> =
                favorable change |{" "}
                <span className="text-red-600 font-medium">Red</span> = unfavorable
                change
              </p>
            </div>
          </ExecutiveCardContent>
        </ExecutiveCard>
      </div>
    </div>
  );
}
