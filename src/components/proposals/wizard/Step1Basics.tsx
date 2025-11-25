"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField, SelectField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import type { ProposalFormData } from "./types";

const step1Schema = z.object({
  developerName: z.string().min(1, "Developer name is required"),
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Proposal Basics</h2>
        <p className="text-muted-foreground mt-2">
          Enter the developer name and select the rent model for this proposal
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Developer Name */}
          <InputField
            name="developerName"
            label="Developer Name"
            placeholder="e.g., Developer A, Developer B"
            description="The name of the developer or organization submitting the proposal"
          />

          {/* Rent Model Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Rent Model</label>
            <p className="text-sm text-muted-foreground">
              Choose the rent payment structure for this proposal
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Fixed Model */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  form.watch("rentModel") === "Fixed"
                    ? "border-primary ring-2 ring-primary"
                    : "hover:border-primary/50"
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
                      className="text-primary"
                    />
                    <h3 className="font-semibold">Fixed Rent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fixed annual rent with CPI escalation
                  </p>
                </div>
              </Card>

              {/* RevShare Model */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  form.watch("rentModel") === "RevShare"
                    ? "border-primary ring-2 ring-primary"
                    : "hover:border-primary/50"
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
                      className="text-primary"
                    />
                    <h3 className="font-semibold">Revenue Share</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Percentage of school revenue
                  </p>
                </div>
              </Card>

              {/* Partner Model */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  form.watch("rentModel") === "Partner"
                    ? "border-primary ring-2 ring-primary"
                    : "hover:border-primary/50"
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
                      className="text-primary"
                    />
                    <h3 className="font-semibold">Partnership</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Investment-yield rent based on land + build costs
                  </p>
                </div>
              </Card>
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
