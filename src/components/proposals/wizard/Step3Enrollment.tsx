"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ArrowRight, ArrowLeft, Info, Users } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { ProposalFormData } from "./types";

const rampRefinement = (prefix: string) =>
  z
    .object({
      [`${prefix}Year1Percentage`]: z.number().min(0).max(100),
      [`${prefix}Year2Percentage`]: z.number().min(0).max(100),
      [`${prefix}Year3Percentage`]: z.number().min(0).max(100),
      [`${prefix}Year4Percentage`]: z.number().min(0).max(100),
      [`${prefix}Year5Percentage`]: z.number().min(0).max(100),
    })
    .refine(
      (data) => {
        const seq = [
          data[`${prefix}Year1Percentage` as const],
          data[`${prefix}Year2Percentage` as const],
          data[`${prefix}Year3Percentage` as const],
          data[`${prefix}Year4Percentage` as const],
          data[`${prefix}Year5Percentage` as const],
        ];
        for (let i = 1; i < seq.length; i += 1) {
          if (seq[i] < seq[i - 1]) return false;
        }
        return true;
      },
      {
        message: "Ramp-up percentages must increase over time",
        path: [`${prefix}Year5Percentage`],
      },
    );

const step3Schema = z
  .object({
    frenchCapacity: z.number().min(0, "Capacity must be non-negative"),
    ibCapacity: z.number().min(0, "Capacity must be non-negative"),
  })
  .and(rampRefinement("rampUpFR"))
  .and(rampRefinement("rampUpIB"));

export interface Step3EnrollmentProps {
  data: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * Step 3: Enrollment & Ramp-Up
 *
 * Collect per-curriculum capacities and ramp plans (5-year) for FR and IB.
 */
export function Step3Enrollment({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step3EnrollmentProps) {
  const form = useProposalForm(step3Schema, {
    frenchCapacity: data?.frenchCapacity ?? 1000,
    ibCapacity: data?.ibCapacity ?? 0,
    rampUpFRYear1Percentage: data?.rampUpFRYear1Percentage ?? 20,
    rampUpFRYear2Percentage: data?.rampUpFRYear2Percentage ?? 40,
    rampUpFRYear3Percentage: data?.rampUpFRYear3Percentage ?? 60,
    rampUpFRYear4Percentage: data?.rampUpFRYear4Percentage ?? 80,
    rampUpFRYear5Percentage: data?.rampUpFRYear5Percentage ?? 100,
    rampUpIBYear1Percentage: data?.rampUpIBYear1Percentage ?? 10,
    rampUpIBYear2Percentage: data?.rampUpIBYear2Percentage ?? 30,
    rampUpIBYear3Percentage: data?.rampUpIBYear3Percentage ?? 50,
    rampUpIBYear4Percentage: data?.rampUpIBYear4Percentage ?? 75,
    rampUpIBYear5Percentage: data?.rampUpIBYear5Percentage ?? 100,
  });

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

  const frCapacity = form.watch("frenchCapacity") || 0;
  const ibCapacity = form.watch("ibCapacity") || 0;
  const frPercents = [
    form.watch("rampUpFRYear1Percentage") || 0,
    form.watch("rampUpFRYear2Percentage") || 0,
    form.watch("rampUpFRYear3Percentage") || 0,
    form.watch("rampUpFRYear4Percentage") || 0,
    form.watch("rampUpFRYear5Percentage") || 0,
  ];
  const ibPercents = [
    form.watch("rampUpIBYear1Percentage") || 0,
    form.watch("rampUpIBYear2Percentage") || 0,
    form.watch("rampUpIBYear3Percentage") || 0,
    form.watch("rampUpIBYear4Percentage") || 0,
    form.watch("rampUpIBYear5Percentage") || 0,
  ];
  const frStudents = frPercents.map((pct) =>
    Math.round((frCapacity * pct) / 100),
  );
  const ibStudents = ibPercents.map((pct) =>
    Math.round((ibCapacity * pct) / 100),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enrollment & Ramp-Up</h2>
        <p className="text-muted-foreground mt-2">
          Define per-curriculum capacity and ramp-up (FR required, IB optional).
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>GAP 20:</strong> 5-year ramp plan feeds dynamic period
          enrollment. FR is always active; IB can start later via Step 4.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-4 p-4 rounded-lg border bg-primary/5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Capacities</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="frenchCapacity"
                label="French Capacity"
                type="number"
                suffix="students"
                description="FR capacity (always active)"
              />
              <InputField
                name="ibCapacity"
                label="IB Capacity"
                type="number"
                suffix="students"
                description="IB capacity (optional program)"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-lg">
              Ramp-Up Schedule (2028-2032)
            </h3>
            {["FR", "IB"].map((track) => {
              const isFR = track === "FR";
              const capacity = isFR ? frCapacity : ibCapacity;
              const percents = isFR ? frPercents : ibPercents;
              const label = isFR ? "French" : "IB";
              return (
                <div
                  key={track}
                  className="space-y-4 p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">
                      {label} Ramp
                    </Label>
                    <span className="font-mono text-sm">
                      Steady state: {capacity} students
                    </span>
                  </div>
                  {[0, 1, 2, 3, 4].map((index) => {
                    const yearLabel = 2028 + index;
                    const value = percents[index];
                    return (
                      <div key={yearLabel} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">
                            Year {index + 1} ({yearLabel})
                          </span>
                          <span className="font-mono text-sm">
                            {value}% = {Math.round((capacity * value) / 100)}{" "}
                            students
                          </span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={(val) =>
                            form.setValue(
                              (isFR ? "rampUpFRYear" : "rampUpIBYear") +
                                (index + 1).toString() +
                                "Percentage",
                              val[0],
                            )
                          }
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-lg border bg-primary/5">
            <h4 className="font-semibold mb-3">Ramp-Up Summary</h4>
            <div className="grid gap-2 text-sm">
              {[0, 1, 2, 3, 4].map((index) => {
                const yearLabel = 2028 + index;
                return (
                  <div key={yearLabel} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {yearLabel} (Year {index + 1}):
                    </span>
                    <span className="font-mono font-semibold">
                      FR {frStudents[index]} | IB {ibStudents[index]}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground font-semibold">
                  Steady State (2032+):
                </span>
                <span className="font-mono font-bold text-primary">
                  FR {frCapacity} | IB {ibCapacity} | Total{" "}
                  {frCapacity + ibCapacity}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onPrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button type="submit">
              Next: Curriculum
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
