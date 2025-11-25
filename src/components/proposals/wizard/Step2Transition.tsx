"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ArrowRight, ArrowLeft, Info, Lock } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ProposalFormData } from "./types";

const step2Schema = z.object({
  transition2025Students: z.number().min(0, "Students must be positive"),
  transition2025AvgTuition: z.number().min(0, "Tuition must be positive"),
  transition2026Students: z.number().min(0, "Students must be positive"),
  transition2026AvgTuition: z.number().min(0, "Tuition must be positive"),
  transition2027Students: z.number().min(0, "Students must be positive"),
  transition2027AvgTuition: z.number().min(0, "Tuition must be positive"),
  transitionRentGrowthPercent: z
    .number()
    .min(0, "Rent growth must be non-negative"),
});

export interface Step2TransitionProps {
  data: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * Step 2: Transition Period (2025-2027)
 *
 * GAP 19: Pre-fill transition period data
 * - Users can input actual/expected values for 2025-2027
 * - These years bridge historical (2023-2024) and dynamic projection (2028-2053)
 */
export function Step2Transition({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step2TransitionProps) {
  // GAP 19: Pre-fill with default values based on historical growth
  const form = useProposalForm(step2Schema, {
    transition2025Students: data?.transition2025Students || 800,
    transition2025AvgTuition: data?.transition2025AvgTuition || 30000,
    transition2026Students: data?.transition2026Students || 850,
    transition2026AvgTuition: data?.transition2026AvgTuition || 31500,
    transition2027Students: data?.transition2027Students || 900,
    transition2027AvgTuition: data?.transition2027AvgTuition || 33000,
    transitionRentGrowthPercent: data?.transitionRentGrowthPercent ?? 5,
  });

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  // Load admin-managed transition config and lock fields
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/transition-config");
        if (!res.ok) return;
        const json = await res.json();
        form.reset({
          transition2025Students: json.year2025Students,
          transition2025AvgTuition: Number(json.year2025AvgTuition),
          transition2026Students: json.year2026Students,
          transition2026AvgTuition: Number(json.year2026AvgTuition),
          transition2027Students: json.year2027Students,
          transition2027AvgTuition: Number(json.year2027AvgTuition),
          transitionRentGrowthPercent: Number(json.rentGrowthPercent) * 100,
        });
      } catch (error) {
        console.error("Failed to load transition config", error);
      }
    };
    loadConfig();
  }, [form]);

  const onSubmit = form.handleSubmit((formData) => {
    onUpdate(formData);
    onNext();
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Transition Period (2025-2027)</h2>
        <p className="text-muted-foreground mt-2">
          Enter students, average tuition, and rent growth for transition years
          (GAP 19)
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>GAP 19:</strong> The transition period bridges historical data
          (2023-2024) and dynamic projections (2028-2053). Values are managed by
          Admin under Transition Setup. Rent grows from 2024 rent using a single
          growth percentage (no rent models in transition).
        </AlertDescription>
      </Alert>
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Transition inputs are read-only here. Update them in{" "}
          <strong>Admin → Transition Setup</strong>.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          {/* 2025 */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <h3 className="font-semibold text-lg">2025</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="transition2025Students"
                label="Students (FR only)"
                type="number"
                suffix="students"
                description="Total students (IB off in transition)"
                disabled
              />
              <InputField
                name="transition2025AvgTuition"
                label="Average Tuition"
                type="number"
                prefix="SAR "
                description="Average tuition per student"
                disabled
              />
            </div>
          </div>

          {/* 2026 */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <h3 className="font-semibold text-lg">2026</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="transition2026Students"
                label="Students (FR only)"
                type="number"
                suffix="students"
                description="Total students (IB off in transition)"
                disabled
              />
              <InputField
                name="transition2026AvgTuition"
                label="Average Tuition"
                type="number"
                prefix="SAR "
                description="Average tuition per student"
                disabled
              />
            </div>
          </div>

          {/* 2027 */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <h3 className="font-semibold text-lg">2027</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="transition2027Students"
                label="Students (FR only)"
                type="number"
                suffix="students"
                description="Total students (IB off in transition)"
                disabled
              />
              <InputField
                name="transition2027AvgTuition"
                label="Average Tuition"
                type="number"
                prefix="SAR "
                description="Average tuition per student"
                disabled
              />
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-lg border bg-primary/5">
            <h3 className="font-semibold text-lg">Rent Growth</h3>
            <InputField
              name="transitionRentGrowthPercent"
              label="Annual Rent Growth % (from 2024 base)"
              type="number"
              suffix="%"
              description="Single growth rate applied to 2024 rent for 2025-2027"
              disabled
            />
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg border bg-primary/5">
            <h4 className="font-semibold mb-3">Transition Period Summary</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Students (2025/26/27):
                </span>
                <span className="font-mono font-semibold">
                  {form.watch("transition2025Students") || 0} /{" "}
                  {form.watch("transition2026Students") || 0} /{" "}
                  {form.watch("transition2027Students") || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Avg Tuition (2025/26/27):
                </span>
                <span className="font-mono font-semibold">
                  {form.watch("transition2025AvgTuition") || 0} /{" "}
                  {form.watch("transition2026AvgTuition") || 0} /{" "}
                  {form.watch("transition2027AvgTuition") || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Rent Growth % (2025-2027):
                </span>
                <span className="font-mono font-semibold">
                  {(form.watch("transitionRentGrowthPercent") || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onPrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button type="submit">
              Next: Enrollment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
