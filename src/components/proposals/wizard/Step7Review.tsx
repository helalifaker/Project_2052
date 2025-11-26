"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calculator, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Role } from "@prisma/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ProposalFormData } from "./types";

/**
 * Step 7: Review & Calculate
 *
 * Final wizard step that:
 * 1. Displays a summary of all inputs
 * 2. Allows user to review before calculation
 * 3. POST to /api/proposals/calculate
 * 4. Shows loading state (target <1s)
 * 5. Redirects to proposal detail page on success
 */

export interface Step7ReviewProps {
  data: Partial<ProposalFormData>;
  onPrevious: () => void;
}

export function Step7Review({ data, onPrevious }: Step7ReviewProps) {
  const { hasRole } = useAuth();
  const canCalculate = hasRole([Role.ADMIN, Role.PLANNER]);
  const router = useRouter();
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!canCalculate) {
      toast.error(
        "Only Admin or Planner users can run the 30-year calculation. Request an elevated role to proceed.",
      );
      return;
    }

    try {
      setIsCalculating(true);

      // Prepare payload for calculation API
      const payload = {
        name: `${data.developerName} - ${data.rentModel}`,
        developer: data.developerName,
        rentModel: data.rentModel,

        // Transition data (Steps 2)
        transition: {
          year2025: {
            students: data.transition2025Students,
            avgTuition: data.transition2025AvgTuition,
          },
          year2026: {
            students: data.transition2026Students,
            avgTuition: data.transition2026AvgTuition,
          },
          year2027: {
            students: data.transition2027Students,
            avgTuition: data.transition2027AvgTuition,
          },
          rentGrowthPercent: data.transitionRentGrowthPercent,
        },

        // Enrollment data (Step 3)
        enrollment: {
          frenchCapacity: data.frenchCapacity,
          ibCapacity: data.ibCapacity,
          totalCapacity: (data.frenchCapacity || 0) + (data.ibCapacity || 0),
          rampUpFRYear1Percentage: data.rampUpFRYear1Percentage,
          rampUpFRYear2Percentage: data.rampUpFRYear2Percentage,
          rampUpFRYear3Percentage: data.rampUpFRYear3Percentage,
          rampUpFRYear4Percentage: data.rampUpFRYear4Percentage,
          rampUpFRYear5Percentage: data.rampUpFRYear5Percentage,
          rampUpIBYear1Percentage: data.rampUpIBYear1Percentage,
          rampUpIBYear2Percentage: data.rampUpIBYear2Percentage,
          rampUpIBYear3Percentage: data.rampUpIBYear3Percentage,
          rampUpIBYear4Percentage: data.rampUpIBYear4Percentage,
          rampUpIBYear5Percentage: data.rampUpIBYear5Percentage,
        },

        // Curriculum data (Step 4)
        curriculum: {
          frenchProgramEnabled: data.frenchProgramEnabled,
          frenchProgramPercentage: data.frenchProgramPercentage,
          ibProgramEnabled: data.ibProgramEnabled,
          ibProgramPercentage: data.ibProgramPercentage,
          frenchBaseTuition2028: data.frenchBaseTuition2028,
          ibBaseTuition2028: data.ibBaseTuition2028,
          ibStartYear: data.ibStartYear,
          frenchTuitionGrowthRate: data.frenchTuitionGrowthRate,
          frenchTuitionGrowthFrequency: data.frenchTuitionGrowthFrequency,
          ibTuitionGrowthRate: data.ibTuitionGrowthRate,
          ibTuitionGrowthFrequency: data.ibTuitionGrowthFrequency,
        },

        // Rent parameters (Step 5)
        rentParams: getRentParams(),

        // Staff and OpEx (Step 6)
        staff: {
          studentsPerTeacher: data.studentsPerTeacher,
          studentsPerNonTeacher: data.studentsPerNonTeacher,
          avgTeacherSalary: data.avgTeacherSalary,
          avgAdminSalary: data.avgAdminSalary,
          cpiRate: data.cpiRate,
          cpiFrequency: data.cpiFrequency,
        },
        otherOpex: data.otherOpexPercent,
      };

      console.log("Calculating proposal with payload:", payload);

      // POST to /api/proposals/calculate
      const response = await fetch("/api/proposals/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Calculation failed");
      }

      const result = await response.json();

      // Show success and redirect
      toast.success("Proposal calculated successfully! Redirecting...");

      // Redirect to proposal detail page
      setTimeout(() => {
        router.push(`/proposals/${result.id}`);
      }, 500);
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to calculate proposal",
      );
    } finally {
      setIsCalculating(false);
    }
  };

  // Get rent parameters based on selected model
  const getRentParams = () => {
    switch (data.rentModel) {
      case "Fixed":
        return {
          baseRent: data.baseRent,
          growthRate: data.rentGrowthRate,
          frequency: data.rentFrequency,
        };
      case "RevShare":
        return {
          revenueSharePercent: data.revenueSharePercent,
        };
      case "Partner":
        return {
          landSize: data.partnerLandSize,
          landPricePerSqm: data.partnerLandPricePerSqm,
          buaSize: data.partnerBuaSize,
          constructionCostPerSqm: data.partnerConstructionCostPerSqm,
          yieldRate: data.partnerYieldRate,
          growthRate: data.partnerGrowthRate,
          frequency: data.partnerFrequency,
        };
      default:
        return {};
    }
  };

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return "N/A";
    return `$${(value / 1000000).toFixed(2)}M`;
  };

  // Format percentage (values are already in 0-100 range)
  const formatPercent = (value?: number) => {
    if (value === undefined) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review & Calculate</h2>
        <p className="text-muted-foreground mt-2">
          Review your proposal inputs before calculating the 30-year financial
          projections
        </p>
      </div>

      {/* Success Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertDescription>
          All inputs are complete! Review the summary below and click
          &quot;Calculate 30 Years&quot; to generate financial projections.
        </AlertDescription>
      </Alert>

      {/* Step 1: Basics */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
            1
          </span>
          Proposal Basics
        </h3>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Developer Name:</span>
            <span className="font-semibold">{data.developerName || "N/A"}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Rent Model:</span>
            <span className="font-semibold">{data.rentModel || "N/A"}</span>
          </div>
        </div>
      </Card>

      {/* Step 2: Transition Period */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
            2
          </span>
          Transition Period (2025-2027)
        </h3>
        <div className="grid gap-3 text-sm">
          {[
            {
              year: 2025,
              students: data.transition2025Students,
              tuition: data.transition2025AvgTuition,
            },
            {
              year: 2026,
              students: data.transition2026Students,
              tuition: data.transition2026AvgTuition,
            },
            {
              year: 2027,
              students: data.transition2027Students,
              tuition: data.transition2027AvgTuition,
            },
          ].map((row) => (
            <div key={row.year} className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">{row.year}:</span>
              <span className="font-mono">
                {row.students ?? "N/A"} students @ {formatCurrency(row.tuition)}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">
              Rent Growth % from 2024:
            </span>
            <span className="font-mono">
              {formatPercent(data.transitionRentGrowthPercent)}
            </span>
          </div>
        </div>
      </Card>

      {/* Step 3: Enrollment */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
            3
          </span>
          Enrollment & Capacity
        </h3>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">
              Capacity (FR / IB / Total):
            </span>
            <span className="font-semibold">
              {data.frenchCapacity ?? 0} / {data.ibCapacity ?? 0} /{" "}
              {(data.frenchCapacity ?? 0) + (data.ibCapacity ?? 0)} students
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Ramp-Up (FR):</span>
            <span className="font-mono">
              Y1 {data.rampUpFRYear1Percentage}% | Y2{" "}
              {data.rampUpFRYear2Percentage}% | Y3{" "}
              {data.rampUpFRYear3Percentage}% | Y4{" "}
              {data.rampUpFRYear4Percentage}% | Y5{" "}
              {data.rampUpFRYear5Percentage}%
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Ramp-Up (IB):</span>
            <span className="font-mono">
              Y1 {data.rampUpIBYear1Percentage}% | Y2{" "}
              {data.rampUpIBYear2Percentage}% | Y3{" "}
              {data.rampUpIBYear3Percentage}% | Y4{" "}
              {data.rampUpIBYear4Percentage}% | Y5{" "}
              {data.rampUpIBYear5Percentage}%
            </span>
          </div>
        </div>
      </Card>

      {/* Step 4: Curriculum */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
            4
          </span>
          Curriculum Configuration
        </h3>
        <div className="grid gap-3 text-sm">
          {data.frenchProgramEnabled && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">French Program:</span>
              <span className="font-semibold">
                {data.frenchProgramPercentage}% of students @{" "}
                {formatCurrency(data.frenchBaseTuition2028)} (2028)
              </span>
            </div>
          )}
          {data.ibProgramEnabled && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">IB Program:</span>
              <span className="font-semibold">
                {data.ibProgramPercentage}% of students @{" "}
                {formatCurrency(data.ibBaseTuition2028)} (start{" "}
                {data.ibStartYear || 2028})
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Step 5: Rent Model Parameters */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
            5
          </span>
          Rent Model Parameters
        </h3>
        <div className="grid gap-3 text-sm">
          {data.rentModel === "Fixed" && (
            <>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">
                  Base Rent (Year 1):
                </span>
                <span className="font-mono">
                  {formatCurrency(data.baseRent)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Growth Rate:</span>
                <span className="font-mono">
                  {formatPercent(data.rentGrowthRate)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Growth Frequency:</span>
                <span className="font-mono">
                  {data.rentFrequency ?? "N/A"} years
                </span>
              </div>
            </>
          )}
          {data.rentModel === "RevShare" && (
            <>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Revenue Share:</span>
                <span className="font-mono">
                  {formatPercent(data.revenueSharePercent)}
                </span>
              </div>
            </>
          )}
          {data.rentModel === "Partner" && (
            <>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Land Size:</span>
                <span className="font-mono">
                  {(data.partnerLandSize ?? 0).toLocaleString()} m²
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Land Price / m²:</span>
                <span className="font-mono">
                  {formatCurrency(data.partnerLandPricePerSqm)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">BUA Size:</span>
                <span className="font-mono">
                  {(data.partnerBuaSize ?? 0).toLocaleString()} m²
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">
                  Construction Cost / m²:
                </span>
                <span className="font-mono">
                  {formatCurrency(data.partnerConstructionCostPerSqm)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Yield Rate:</span>
                <span className="font-mono">
                  {formatPercent(data.partnerYieldRate)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Growth:</span>
                <span className="font-mono">
                  {formatPercent(data.partnerGrowthRate)} every{" "}
                  {data.partnerFrequency ?? "N/A"} yrs
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Step 6: Operating Costs */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
            6
          </span>
          Operating Costs
        </h3>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Staff Costs:</span>
            <span className="font-mono">
              Ratios: {data.studentsPerTeacher || "?"}:1 teacher,{" "}
              {data.studentsPerNonTeacher || "?"}:1 non-teacher
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Other OpEx:</span>
            <span className="font-mono">
              {formatPercent(data.otherOpexPercent)} of revenue
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">CPI on Staff:</span>
            <span className="font-mono">
              {formatPercent(data.cpiRate)} every {data.cpiFrequency ?? "N/A"}{" "}
              yrs
            </span>
          </div>
        </div>
      </Card>

      {/* Calculate Button */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isCalculating}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleCalculate}
          size="lg"
          disabled={isCalculating || !canCalculate}
          className="min-w-[200px]"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-5 w-5 mr-2" />
              Calculate 30 Years
            </>
          )}
        </Button>
      </div>

      {!canCalculate && (
        <p className="text-sm text-destructive text-center mt-2">
          Calculations require Admin or Planner permissions. Ask your
          administrator to update your role if this is a mistake.
        </p>
      )}

      {/* Performance Note */}
      <p className="text-xs text-muted-foreground text-center">
        Financial projections are typically calculated in under 1 second
      </p>
    </div>
  );
}
