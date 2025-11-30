"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProposalFormData } from "./types";

/**
 * Step Summary Card Props
 */
interface StepSummaryCardProps {
  stepNumber: number;
  title: string;
  data: Partial<ProposalFormData>;
  onEdit: () => void;
  isCurrentStep?: boolean;
}

/**
 * Step Summary Card Component
 *
 * Shows a collapsible summary of completed wizard steps.
 * Provides quick overview and edit functionality.
 *
 * Features:
 * - Collapsible content
 * - Edit button to jump back to step
 * - Highlights current step
 * - Shows key data from each step
 *
 * @example
 * ```tsx
 * <StepSummaryCard
 *   stepNumber={1}
 *   title="Proposal Basics"
 *   data={formData}
 *   onEdit={() => setCurrentStep(0)}
 *   isCurrentStep={currentStep === 0}
 * />
 * ```
 */
export function StepSummaryCard({
  stepNumber,
  title,
  data,
  onEdit,
  isCurrentStep = false,
}: StepSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderSummary = () => {
    switch (stepNumber) {
      case 1:
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Developer:</span>
              <span className="font-medium">{data.developerName || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rent Model:</span>
              <span className="font-medium">{data.rentModel || "Not selected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract Period:</span>
              <span className="font-medium">
                {data.contractPeriodYears || 30} years
              </span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Capacity:</span>
              <span className="font-medium">
                {(data.frenchCapacity || 0) + (data.ibCapacity || 0)} students
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">French / IB:</span>
              <span className="font-medium">
                {data.frenchCapacity || 0} / {data.ibCapacity || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Year 1 Ramp-up:</span>
              <span className="font-medium">
                FR {data.rampUpFRYear1Percentage}% / IB{" "}
                {data.rampUpIBYear1Percentage}%
              </span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">French Program:</span>
              <span className="font-medium">
                {data.frenchProgramEnabled
                  ? `${data.frenchProgramPercentage}% @ ${formatCurrency(data.frenchBaseTuition2028)}`
                  : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IB Program:</span>
              <span className="font-medium">
                {data.ibProgramEnabled
                  ? `${data.ibProgramPercentage}% @ ${formatCurrency(data.ibBaseTuition2028)}`
                  : "Disabled"}
              </span>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-2 text-sm">
            {data.rentModel === "Fixed" && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Rent:</span>
                  <span className="font-medium">
                    {formatCurrency(data.baseRent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Growth Rate:</span>
                  <span className="font-medium">{data.rentGrowthRate}%</span>
                </div>
              </>
            )}
            {data.rentModel === "RevShare" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue Share:</span>
                <span className="font-medium">{data.revenueSharePercent}%</span>
              </div>
            )}
            {data.rentModel === "Partner" && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yield Rate:</span>
                  <span className="font-medium">{data.partnerYieldRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Investment:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      ((data.partnerLandSize || 0) *
                        (data.partnerLandPricePerSqm || 0) +
                        (data.partnerBuaSize || 0) *
                          (data.partnerConstructionCostPerSqm || 0))
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Staff Ratios:</span>
              <span className="font-medium">
                {data.studentsPerTeacher}:1 / {data.studentsPerNonTeacher}:1
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Other OpEx:</span>
              <span className="font-medium">{data.otherOpexPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPI Rate:</span>
              <span className="font-medium">{data.cpiRate}%</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "SAR 0";
    if (value >= 1000000) {
      return `SAR ${(value / 1000000).toFixed(1)}M`;
    }
    return `SAR ${value.toLocaleString()}`;
  };

  return (
    <Card
      className={cn(
        "transition-all",
        isCurrentStep && "ring-2 ring-primary shadow-lg"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                  isCurrentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {stepNumber}
              </div>
              <h4 className="font-semibold text-sm truncate">{title}</h4>
            </div>

            {isExpanded && <div className="mt-3 pl-8">{renderSummary()}</div>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 px-3"
              aria-label={`Edit ${title}`}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
