"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ArrowLeft, Info, GraduationCap, Check } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { ProposalFormData } from "./types";

const step4Schema = z
  .object({
    frenchProgramEnabled: z.boolean(),
    frenchProgramPercentage: z.number().min(0).max(100),
    ibProgramEnabled: z.boolean(),
    ibProgramPercentage: z.number().min(0).max(100),
    frenchBaseTuition2028: z
      .number()
      .positive("French base tuition must be positive"),
    ibBaseTuition2028: z
      .number()
      .nonnegative("IB base tuition cannot be negative"),
    ibStartYear: z.number().int().min(2028).max(2053).optional(),
    frenchTuitionGrowthRate: z.number().min(0).max(100).optional(),
    frenchTuitionGrowthFrequency: z.number().int().min(1).max(5).optional(),
    ibTuitionGrowthRate: z.number().min(0).max(100).optional(),
    ibTuitionGrowthFrequency: z.number().int().min(1).max(5).optional(),
  })
  .refine(
    (data) => {
      const total = data.frenchProgramPercentage + data.ibProgramPercentage;
      return total >= 0 && total <= 100;
    },
    {
      message: "Total curriculum percentage cannot exceed 100%",
      path: ["ibProgramPercentage"],
    },
  )
  .refine((data) => data.frenchProgramEnabled || data.ibProgramEnabled, {
    message: "At least one curriculum program must be enabled",
    path: ["ibProgramEnabled"],
  });

export interface Step4CurriculumProps {
  data: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * Step 4: Curriculum Configuration
 *
 * GAP 3: Support for French Program and IB Program
 * - French Program: Default enabled at 100%
 * - IB Program: Optional toggle
 * - Total must not exceed 100%
 */
export function Step4Curriculum({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step4CurriculumProps) {
  // GAP 3: Pre-fill with French program enabled by default
  const form = useProposalForm(step4Schema, {
    frenchProgramEnabled: data?.frenchProgramEnabled ?? true, // GAP 3: Default enabled
    frenchProgramPercentage: data?.frenchProgramPercentage || 100,
    ibProgramEnabled: data?.ibProgramEnabled ?? false, // GAP 3: Optional
    ibProgramPercentage: data?.ibProgramPercentage || 0,
    frenchBaseTuition2028: data?.frenchBaseTuition2028 || 30000,
    ibBaseTuition2028: data?.ibBaseTuition2028 || 45000,
    ibStartYear: data?.ibStartYear ?? 2028,
    frenchTuitionGrowthRate: data?.frenchTuitionGrowthRate ?? 3,
    frenchTuitionGrowthFrequency: data?.frenchTuitionGrowthFrequency ?? 1,
    ibTuitionGrowthRate: data?.ibTuitionGrowthRate ?? 3,
    ibTuitionGrowthFrequency: data?.ibTuitionGrowthFrequency ?? 1,
  });

  const frenchEnabled = form.watch("frenchProgramEnabled");
  const ibEnabled = form.watch("ibProgramEnabled");
  const frenchPct = form.watch("frenchProgramPercentage") || 0;
  const ibPct = form.watch("ibProgramPercentage") || 0;

  // Auto-adjust percentages when toggling
  useEffect(() => {
    if (!frenchEnabled && ibEnabled) {
      form.setValue("ibProgramPercentage", 100);
    } else if (frenchEnabled && !ibEnabled) {
      form.setValue("frenchProgramPercentage", 100);
    } else if (frenchEnabled && ibEnabled && frenchPct + ibPct > 100) {
      // Proportionally adjust if total exceeds 100%
      form.setValue("frenchProgramPercentage", 60);
      form.setValue("ibProgramPercentage", 40);
    }
  }, [frenchEnabled, ibEnabled]);

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  const onSubmit = form.handleSubmit((formData) => {
    onUpdate(formData);
    onNext();
  });

  const totalPercentage = frenchPct + ibPct;
  const isValid = totalPercentage >= 0 && totalPercentage <= 100;
  const ibProgramError = form.formState.errors.ibProgramEnabled?.message;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Curriculum Configuration</h2>
        <p className="text-muted-foreground mt-2">
          Configure French and IB programs (GAP 3)
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>GAP 3:</strong> The system supports French Program (default)
          and International Baccalaureate (IB) program. You can enable one or
          both programs. The percentages represent the proportion of students
          enrolled in each program.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* French Program */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">French Program</h3>
                  <p className="text-sm text-muted-foreground">
                    Standard curriculum (Default enabled)
                  </p>
                </div>
              </div>
              <Switch
                checked={frenchEnabled}
                onCheckedChange={(checked) =>
                  form.setValue("frenchProgramEnabled", checked)
                }
              />
            </div>

            {frenchEnabled && (
              <div className="pt-4 border-t space-y-4">
                <InputField
                  name="frenchProgramPercentage"
                  label="Student Percentage"
                  type="number"
                  suffix="%"
                  description="Percentage of students enrolled in French Program"
                />
                <InputField
                  name="frenchBaseTuition2028"
                  label="Base Tuition 2028 (French)"
                  type="number"
                  prefix="SAR "
                  description="Base tuition per French student in 2028"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    name="frenchTuitionGrowthRate"
                    label="Tuition Growth Rate"
                    type="number"
                    suffix="%"
                    description="Annual growth applied per frequency"
                  />
                  <InputField
                    name="frenchTuitionGrowthFrequency"
                    label="Growth Frequency"
                    type="number"
                    suffix="years"
                    description="How often the growth applies (1-5 years)"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  <span>
                    Approximately{" "}
                    <strong className="text-foreground">
                      {Math.round(
                        ((form.watch("frenchProgramPercentage") || 0) *
                          ((data?.frenchCapacity ?? 0) +
                            (data?.ibCapacity ?? 0) || 1000)) /
                          100,
                      )}
                    </strong>{" "}
                    students at full capacity
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* IB Program */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">
                    International Baccalaureate (IB)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Optional advanced curriculum
                  </p>
                </div>
              </div>
              <Switch
                checked={ibEnabled}
                onCheckedChange={(checked) =>
                  form.setValue("ibProgramEnabled", checked)
                }
              />
            </div>

            {ibEnabled && (
              <div className="pt-4 border-t space-y-4">
                <InputField
                  name="ibProgramPercentage"
                  label="Student Percentage"
                  type="number"
                  suffix="%"
                  description="Percentage of students enrolled in IB Program"
                />
                <InputField
                  name="ibBaseTuition2028"
                  label="Base Tuition 2028 (IB)"
                  type="number"
                  prefix="SAR "
                  description="Base tuition per IB student in 2028"
                />
                <InputField
                  name="ibStartYear"
                  label="IB Start Year"
                  type="number"
                  description="Year IB program begins (>=2028)"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    name="ibTuitionGrowthRate"
                    label="Tuition Growth Rate"
                    type="number"
                    suffix="%"
                    description="Annual growth applied per frequency"
                  />
                  <InputField
                    name="ibTuitionGrowthFrequency"
                    label="Growth Frequency"
                    type="number"
                    suffix="years"
                    description="How often the growth applies (1-5 years)"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  <span>
                    Approximately{" "}
                    <strong className="text-foreground">
                      {Math.round(
                        ((form.watch("ibProgramPercentage") || 0) *
                          ((data?.frenchCapacity ?? 0) +
                            (data?.ibCapacity ?? 0) || 1000)) /
                          100,
                      )}
                    </strong>{" "}
                    students at full capacity
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Summary */}
          <div
            className={`p-4 rounded-lg border ${
              isValid
                ? "bg-primary/5 border-primary/20"
                : "bg-destructive/5 border-destructive/20"
            }`}
          >
            <h4 className="font-semibold mb-3">Curriculum Summary</h4>
            <div className="space-y-2 text-sm">
              {frenchEnabled && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">French Program:</span>
                  <span className="font-mono font-semibold">{frenchPct}%</span>
                </div>
              )}
              {ibEnabled && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IB Program:</span>
                  <span className="font-mono font-semibold">{ibPct}%</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground font-semibold">
                  Total:
                </span>
                <span
                  className={`font-mono font-bold ${
                    isValid ? "text-primary" : "text-destructive"
                  }`}
                >
                  {totalPercentage}%
                </span>
              </div>
            </div>

            {!isValid && (
              <p className="text-sm text-destructive mt-3">
                Total percentage must be between 0% and 100%
              </p>
            )}

            {typeof ibProgramError === "string" && (
              <p className="text-sm text-destructive mt-3">{ibProgramError}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onPrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button type="submit" disabled={!isValid}>
              Save Progress
              <Check className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
