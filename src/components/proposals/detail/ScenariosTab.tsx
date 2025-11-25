"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, RotateCcw, Loader2, Download, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { debounce } from "lodash";

/**
 * Tab 5: Scenarios (Interactive Sliders - GAP 6)
 *
 * Allows user to adjust key variables with sliders:
 * - Enrollment %
 * - CPI %
 * - Tuition Growth %
 * - Rent Escalation %
 *
 * Shows real-time metric updates (<200ms target)
 * Metric comparison table (Baseline vs Current vs Change %)
 * Save/Load/Delete scenarios
 */

interface ScenariosTabProps {
  proposal: any;
}

interface ScenarioMetrics {
  totalRent: string;
  npv: string;
  totalEbitda: string;
  finalCash: string;
  maxDebt: string;
}

interface MetricComparison {
  baseline: string;
  current: string;
  absoluteChange: string;
  percentChange: string;
}

export function ScenariosTab({ proposal }: ScenariosTabProps) {
  // Baseline values (from proposal)
  const baseline = {
    enrollment: 100,
    cpi: 3.0,
    tuitionGrowth: 5.0,
    rentEscalation: 3.0,
  };

  const [enrollmentPercent, setEnrollmentPercent] = useState(
    baseline.enrollment,
  );
  const [cpiPercent, setCpiPercent] = useState(baseline.cpi);
  const [tuitionGrowthPercent, setTuitionGrowthPercent] = useState(
    baseline.tuitionGrowth,
  );
  const [rentEscalationPercent, setRentEscalationPercent] = useState(
    baseline.rentEscalation,
  );

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationTime, setCalculationTime] = useState<number | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<ScenarioMetrics | null>(
    null,
  );
  const [comparison, setComparison] = useState<Record<
    string,
    MetricComparison
  > | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [scenarioName, setScenarioName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Fetch saved scenarios on mount
  useEffect(() => {
    fetchSavedScenarios();
  }, [proposal.id]);

  const fetchSavedScenarios = async () => {
    try {
      const response = await fetch(
        `/api/proposals/${proposal.id}/scenarios/saved`,
      );
      if (response.ok) {
        const data = await response.json();
        setSavedScenarios(data.scenarios);
      }
    } catch (error) {
      console.error("Error fetching saved scenarios:", error);
    }
  };

  // Debounced calculation function
  const calculateScenario = useCallback(
    debounce(async (variables: any) => {
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

        if (!response.ok) {
          throw new Error("Calculation failed");
        }

        const data = await response.json();

        setCurrentMetrics(data.metrics);
        setComparison(data.comparison);
        setCalculationTime(data.performance.totalTimeMs);
      } catch (error) {
        console.error("Error calculating scenario:", error);
        toast.error("Failed to calculate scenario");
      } finally {
        setIsCalculating(false);
      }
    }, 300), // 300ms debounce
    [proposal.id],
  );

  // Trigger calculation when sliders change
  useEffect(() => {
    const variables = {
      enrollmentPercent,
      cpiPercent,
      tuitionGrowthPercent,
      rentEscalationPercent,
    };

    calculateScenario(variables);
  }, [
    enrollmentPercent,
    cpiPercent,
    tuitionGrowthPercent,
    rentEscalationPercent,
    calculateScenario,
  ]);

  const handleReset = () => {
    setEnrollmentPercent(baseline.enrollment);
    setCpiPercent(baseline.cpi);
    setTuitionGrowthPercent(baseline.tuitionGrowth);
    setRentEscalationPercent(baseline.rentEscalation);
    toast.success("Reset to baseline values");
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }

    if (!currentMetrics) {
      toast.error("No scenario calculated to save");
      return;
    }

    try {
      const response = await fetch(
        `/api/proposals/${proposal.id}/scenarios/saved`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: scenarioName,
            enrollmentPercent,
            cpiPercent,
            tuitionGrowthPercent,
            rentEscalationPercent,
            metrics: currentMetrics,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save scenario");
      }

      toast.success("Scenario saved successfully");
      setScenarioName("");
      setShowSaveDialog(false);
      fetchSavedScenarios();
    } catch (error) {
      console.error("Error saving scenario:", error);
      toast.error("Failed to save scenario");
    }
  };

  const handleLoadScenario = (scenario: any) => {
    setEnrollmentPercent(scenario.variables.enrollmentPercent);
    setCpiPercent(scenario.variables.cpiPercent);
    setTuitionGrowthPercent(scenario.variables.tuitionGrowthPercent);
    setRentEscalationPercent(scenario.variables.rentEscalationPercent);
    toast.success(`Loaded scenario: ${scenario.name}`);
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      const response = await fetch(
        `/api/proposals/${proposal.id}/scenarios/saved?scenarioId=${scenarioId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete scenario");
      }

      toast.success("Scenario deleted");
      fetchSavedScenarios();
    } catch (error) {
      console.error("Error deleting scenario:", error);
      toast.error("Failed to delete scenario");
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const formatPercent = (value: string) => {
    const num = parseFloat(value);
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scenario Analysis</h2>
          <p className="text-muted-foreground mt-1">
            Adjust key variables and see real-time impact on metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Baseline
          </Button>
          <Button
            size="sm"
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            disabled={!currentMetrics}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Scenario
          </Button>
        </div>
      </div>

      {/* Interactive Sliders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Adjust Variables</h3>
        <div className="space-y-8">
          {/* Enrollment % Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Enrollment Capacity (%)</Label>
              <span className="text-sm font-mono font-semibold">
                {enrollmentPercent}%
              </span>
            </div>
            <Slider
              value={[enrollmentPercent]}
              onValueChange={(value) => setEnrollmentPercent(value[0])}
              min={50}
              max={150}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Range: 50% to 150% of baseline capacity
            </p>
          </div>

          {/* CPI % Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Consumer Price Index (CPI) Growth (%)</Label>
              <span className="text-sm font-mono font-semibold">
                {cpiPercent.toFixed(1)}%
              </span>
            </div>
            <Slider
              value={[cpiPercent]}
              onValueChange={(value) => setCpiPercent(value[0])}
              min={0}
              max={10}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Range: 0% to 10% annual CPI growth
            </p>
          </div>

          {/* Tuition Growth % Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Tuition Growth Rate (%)</Label>
              <span className="text-sm font-mono font-semibold">
                {tuitionGrowthPercent.toFixed(1)}%
              </span>
            </div>
            <Slider
              value={[tuitionGrowthPercent]}
              onValueChange={(value) => setTuitionGrowthPercent(value[0])}
              min={0}
              max={15}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Range: 0% to 15% annual tuition growth
            </p>
          </div>

          {/* Rent Escalation % Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Rent Escalation Rate (%)</Label>
              <span className="text-sm font-mono font-semibold">
                {rentEscalationPercent.toFixed(1)}%
              </span>
            </div>
            <Slider
              value={[rentEscalationPercent]}
              onValueChange={(value) => setRentEscalationPercent(value[0])}
              min={0}
              max={10}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Range: 0% to 10% annual rent escalation
            </p>
          </div>
        </div>
      </Card>

      {/* Metric Comparison Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Metric Comparison</h3>
            {calculationTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Calculated in {calculationTime.toFixed(0)}ms
              </p>
            )}
          </div>
          {isCalculating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating...
            </div>
          )}
        </div>

        {comparison ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Metric</th>
                  <th className="text-right py-3 px-4 font-semibold">
                    Baseline
                  </th>
                  <th className="text-right py-3 px-4 font-semibold">
                    Current
                  </th>
                  <th className="text-right py-3 px-4 font-semibold">
                    Absolute Change
                  </th>
                  <th className="text-right py-3 px-4 font-semibold">
                    % Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(comparison).map(([metric, data]) => (
                  <tr key={metric} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">
                      {metric === "totalRent" && "Total Rent (30Y)"}
                      {metric === "npv" && "Net Present Value"}
                      {metric === "totalEbitda" && "Total EBITDA (30Y)"}
                      {metric === "finalCash" && "Final Cash Balance"}
                      {metric === "maxDebt" && "Maximum Debt"}
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(data.baseline)}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      {formatCurrency(data.current)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(data.absoluteChange)}
                    </td>
                    <td
                      className={`text-right py-3 px-4 font-semibold ${
                        parseFloat(data.percentChange) > 0
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
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Calculating initial scenario...</p>
          </div>
        )}
      </Card>

      {/* Saved Scenarios */}
      {savedScenarios.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Saved Scenarios</h3>
          <div className="space-y-2">
            {savedScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{scenario.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(scenario.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadScenario(scenario)}
                  >
                    <FolderOpen className="h-4 w-4 mr-1" />
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteScenario(scenario.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <Card className="p-6 border-2 border-primary">
          <h3 className="text-lg font-semibold mb-4">Save Current Scenario</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scenarioName">Scenario Name</Label>
              <Input
                id="scenarioName"
                placeholder="e.g., High Growth Scenario"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveScenario}>Save Scenario</Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
