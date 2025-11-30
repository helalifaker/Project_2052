"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoleCheck } from "@/lib/hooks/useRoleCheck";
import {
  ExecutiveCard,
  ExecutiveCardContent,
  ExecutiveCardHeader,
  ExecutiveCardTitle,
  ExecutiveLabel,
  ExecutiveValue,
} from "@/components/ui/executive-card";

/**
 * Tab 2: Transition Setup (Edit Mode)
 *
 * Editable form for transition period (2025-2027)
 * Same fields as wizard Step 2
 * Has "Save" and "Recalculate" buttons
 */

interface TransitionYearData {
  year: number;
  numberOfStudents: number;
  averageTuitionPerStudent: number;
  rentGrowthPercent: number;
  preFillFromPriorYear: boolean;
}

interface TransitionSetupTabProps {
  proposal: {
    id: string;
    transition?: TransitionYearData[];
    [key: string]: unknown;
  };
  onUpdate: (updatedProposal: Record<string, unknown>) => void;
}

const DEFAULT_TRANSITION: TransitionYearData[] = [
  {
    year: 2025,
    numberOfStudents: 800,
    averageTuitionPerStudent: 30000,
    rentGrowthPercent: 0.05,
    preFillFromPriorYear: false,
  },
  {
    year: 2026,
    numberOfStudents: 850,
    averageTuitionPerStudent: 31500,
    rentGrowthPercent: 0.05,
    preFillFromPriorYear: false,
  },
  {
    year: 2027,
    numberOfStudents: 900,
    averageTuitionPerStudent: 33000,
    rentGrowthPercent: 0.05,
    preFillFromPriorYear: false,
  },
];

export function TransitionSetupTab({
  proposal,
  onUpdate,
}: TransitionSetupTabProps) {
  // RBAC: Check user permissions for editing
  const { canEdit, isViewer } = useRoleCheck();

  // Parse the transition data - handle both array and object formats
  const parseTransitionData = (data: unknown): TransitionYearData[] => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        year: item.year,
        numberOfStudents: Number(item.numberOfStudents) || 0,
        averageTuitionPerStudent: Number(item.averageTuitionPerStudent) || 0,
        rentGrowthPercent: Number(item.rentGrowthPercent) || 0,
        preFillFromPriorYear: Boolean(item.preFillFromPriorYear),
      }));
    }
    return DEFAULT_TRANSITION;
  };

  const [formData, setFormData] = useState<TransitionYearData[]>(() =>
    parseTransitionData(proposal.transition)
  );
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const updateYearData = useCallback(
    (year: number, field: keyof TransitionYearData, value: number) => {
      setFormData((prev) =>
        prev.map((item) =>
          item.year === year ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transition: formData }),
      });

      if (!response.ok) {
        throw new Error("Failed to save transition setup");
      }

      const updatedProposal = await response.json();
      onUpdate(updatedProposal);
      toast.success("Transition setup saved");
    } catch (error) {
      console.error("Error saving transition setup:", error);
      toast.error("Failed to save transition setup");
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);

      // First save any pending changes
      const saveResponse = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transition: formData }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save changes before recalculation");
      }

      // Then recalculate
      const recalcResponse = await fetch(
        `/api/proposals/${proposal.id}/recalculate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!recalcResponse.ok) {
        const error = await recalcResponse.json();
        throw new Error(error.message || "Failed to recalculate");
      }

      const result = await recalcResponse.json();
      onUpdate(result.proposal);
      toast.success("Proposal recalculated successfully");
    } catch (error) {
      console.error("Error recalculating:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to recalculate"
      );
    } finally {
      setRecalculating(false);
    }
  };

  // Calculate summary values
  const totalStudents = formData.reduce(
    (sum, year) => sum + year.numberOfStudents,
    0
  );
  const avgTuition =
    formData.reduce((sum, year) => sum + year.averageTuitionPerStudent, 0) /
    formData.length;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transition Period Setup</h2>
          <p className="text-muted-foreground mt-1">
            Edit transition period assumptions (2025-2027)
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleRecalculate}
                disabled={recalculating}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${recalculating ? "animate-spin" : ""}`}
                />
                Recalculate
              </Button>
            </>
          )}
          {isViewer && (
            <Alert className="max-w-md">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You have read-only access. Only ADMIN and PLANNER roles can edit proposals.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The transition period bridges historical data (2023-2024) and dynamic
          projections (2028-2053). Rent grows from 2024 rent using the growth
          percentage specified for each year.
        </AlertDescription>
      </Alert>

      {/* Year Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {formData.map((yearData) => (
          <ExecutiveCard key={yearData.year}>
            <ExecutiveCardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <ExecutiveCardTitle>{yearData.year}</ExecutiveCardTitle>
                <span className="text-sm text-muted-foreground">
                  Year {yearData.year - 2024}
                </span>
              </div>
            </ExecutiveCardHeader>
            <ExecutiveCardContent className="pt-6 space-y-6">
              {/* Number of Students */}
              <div className="space-y-2">
                <Label htmlFor={`students-${yearData.year}`}>
                  Number of Students
                </Label>
                <Input
                  id={`students-${yearData.year}`}
                  type="number"
                  value={yearData.numberOfStudents}
                  onChange={(e) =>
                    updateYearData(
                      yearData.year,
                      "numberOfStudents",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min={0}
                  className="font-mono"
                  disabled={!canEdit}
                />
                <p className="text-xs text-muted-foreground">
                  Total enrolled students
                </p>
              </div>

              {/* Average Tuition */}
              <div className="space-y-2">
                <Label htmlFor={`tuition-${yearData.year}`}>
                  Average Tuition (SAR)
                </Label>
                <Input
                  id={`tuition-${yearData.year}`}
                  type="number"
                  value={yearData.averageTuitionPerStudent}
                  onChange={(e) =>
                    updateYearData(
                      yearData.year,
                      "averageTuitionPerStudent",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min={0}
                  step={500}
                  className="font-mono"
                  disabled={!canEdit}
                />
                <p className="text-xs text-muted-foreground">
                  Avg. tuition fee per student
                </p>
              </div>

              {/* Rent Growth */}
              <div className="space-y-2">
                <Label htmlFor={`rent-${yearData.year}`}>
                  Rent Growth (%)
                </Label>
                <Input
                  id={`rent-${yearData.year}`}
                  type="number"
                  value={(yearData.rentGrowthPercent * 100).toFixed(1)}
                  onChange={(e) =>
                    updateYearData(
                      yearData.year,
                      "rentGrowthPercent",
                      (parseFloat(e.target.value) || 0) / 100
                    )
                  }
                  min={0}
                  max={100}
                  step={0.5}
                  className="font-mono"
                  disabled={!canEdit}
                />
                <p className="text-xs text-muted-foreground">
                  Annual rent growth
                </p>
              </div>

              {/* Year Revenue Preview */}
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Est. Revenue:
                  </span>
                  <span className="font-mono font-semibold">
                    SAR{" "}
                    {(
                      yearData.numberOfStudents *
                      yearData.averageTuitionPerStudent
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </ExecutiveCardContent>
          </ExecutiveCard>
        ))}
      </div>

      {/* Summary Card */}
      <ExecutiveCard className="bg-primary/5 border-primary/20">
        <ExecutiveCardHeader>
          <ExecutiveCardTitle className="text-lg">Transition Period Summary</ExecutiveCardTitle>
        </ExecutiveCardHeader>
        <ExecutiveCardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-background rounded-lg border">
              <ExecutiveValue className="text-2xl">
                {formData[0]?.numberOfStudents || 0}
              </ExecutiveValue>
              <ExecutiveLabel className="mt-1">2025 Students</ExecutiveLabel>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border">
              <ExecutiveValue className="text-2xl">
                {formData[1]?.numberOfStudents || 0}
              </ExecutiveValue>
              <ExecutiveLabel className="mt-1">2026 Students</ExecutiveLabel>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border">
              <ExecutiveValue className="text-2xl">
                {formData[2]?.numberOfStudents || 0}
              </ExecutiveValue>
              <ExecutiveLabel className="mt-1">2027 Students</ExecutiveLabel>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border">
              <ExecutiveValue className="text-2xl">
                SAR {avgTuition.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </ExecutiveValue>
              <ExecutiveLabel className="mt-1">Avg Tuition</ExecutiveLabel>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-8">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm uppercase tracking-wider">
                Total Students (3 years)
              </span>
              <span className="text-3xl font-light mt-1">{totalStudents}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-muted-foreground text-sm uppercase tracking-wider">
                Total Est. Revenue (3 years)
              </span>
              <span className="text-3xl font-light mt-1 text-primary">
                SAR{" "}
                {formData
                  .reduce(
                    (sum, year) =>
                      sum +
                      year.numberOfStudents * year.averageTuitionPerStudent,
                    0
                  )
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </ExecutiveCardContent>
      </ExecutiveCard>
    </div>
  );
}
