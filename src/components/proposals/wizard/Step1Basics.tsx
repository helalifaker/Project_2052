"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { ExecutiveCard } from "@/components/ui/executive-card";
import type { ProposalFormData } from "./types";

const step1Schema = z.object({
  developerName: z.string().min(1, "Developer name is required"),
  contractPeriodYears: z.union([z.literal(25), z.literal(30)]).default(30),
  rentModel: z.enum(["Fixed", "RevShare", "Partner"]),
});

export interface Step1BasicsProps {
  data: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
  onNext: () => void;
}

export function Step1Basics({ data, onUpdate, onNext }: Step1BasicsProps) {
  const rentModelValue =
    data?.rentModel === "Fixed" ||
      data?.rentModel === "RevShare" ||
      data?.rentModel === "Partner"
      ? data.rentModel
      : undefined;

  const form = useProposalForm(step1Schema, {
    developerName: data?.developerName || "",
    contractPeriodYears: data?.contractPeriodYears || 30,
    rentModel: rentModelValue,
  });

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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Proposal Basics</h2>
        <p className="text-muted-foreground mt-2">
          Enter the developer name and select the rent model for this proposal
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Developer Name */}
          <InputField
            name="developerName"
            label="Developer Name"
            placeholder="e.g., Developer A, Developer B"
            description="The name of the developer or organization submitting the proposal"
          />

          {/* Contract Period Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Contract Period</label>
            <p className="text-sm text-muted-foreground">
              Select the duration for the dynamic projection period (starting 2028)
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* 30 Years Option */}
              <div
                className={`p-6 rounded-xl border cursor-pointer transition-all ${form.watch("contractPeriodYears") === 30
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                onClick={() => form.setValue("contractPeriodYears", 30)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="contractPeriodYears"
                      value="30"
                      checked={form.watch("contractPeriodYears") === 30}
                      onChange={() => form.setValue("contractPeriodYears", 30)}
                      className="text-primary accent-primary"
                    />
                    <h3 className="font-semibold">30 Years (2028-2057)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Standard long-term projection period
                  </p>
                </div>
              </div>

              {/* 25 Years Option */}
              <div
                className={`p-6 rounded-xl border cursor-pointer transition-all ${form.watch("contractPeriodYears") === 25
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                onClick={() => form.setValue("contractPeriodYears", 25)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="contractPeriodYears"
                      value="25"
                      checked={form.watch("contractPeriodYears") === 25}
                      onChange={() => form.setValue("contractPeriodYears", 25)}
                      className="text-primary accent-primary"
                    />
                    <h3 className="font-semibold">25 Years (2028-2052)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Shorter contract period
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rent Model Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Rent Model</label>
            <p className="text-sm text-muted-foreground">
              Choose the rent payment structure for this proposal
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Fixed Model */}
              <div
                className={`p-6 rounded-xl border cursor-pointer transition-all ${form.watch("rentModel") === "Fixed"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                onClick={() => form.setValue("rentModel", "Fixed")}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="rentModel"
                      value="Fixed"
                      checked={form.watch("rentModel") === "Fixed"}
                      onChange={() => form.setValue("rentModel", "Fixed")}
                      className="text-primary accent-primary"
                    />
                    <h3 className="font-semibold">Fixed Rent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Fixed annual rent with CPI escalation
                  </p>
                </div>
              </div>

              {/* RevShare Model */}
              <div
                className={`p-6 rounded-xl border cursor-pointer transition-all ${form.watch("rentModel") === "RevShare"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                onClick={() => form.setValue("rentModel", "RevShare")}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="rentModel"
                      value="RevShare"
                      checked={form.watch("rentModel") === "RevShare"}
                      onChange={() => form.setValue("rentModel", "RevShare")}
                      className="text-primary accent-primary"
                    />
                    <h3 className="font-semibold">Revenue Share</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Percentage of school revenue
                  </p>
                </div>
              </div>

              {/* Partner Model */}
              <div
                className={`p-6 rounded-xl border cursor-pointer transition-all ${form.watch("rentModel") === "Partner"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                onClick={() => form.setValue("rentModel", "Partner")}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="rentModel"
                      value="Partner"
                      checked={form.watch("rentModel") === "Partner"}
                      onChange={() => form.setValue("rentModel", "Partner")}
                      className="text-primary accent-primary"
                    />
                    <h3 className="font-semibold">Partnership</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Investment-yield rent based on land + build costs
                  </p>
                </div>
              </div>
            </div>

            {form.formState.errors.rentModel?.message && (
              <p className="text-sm text-destructive">
                {String(form.formState.errors.rentModel.message)}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-end pt-6 border-t">
            <Button type="submit">
              Next: Transition Period
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
