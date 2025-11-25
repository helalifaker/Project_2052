"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ArrowLeft, ArrowRight, Info, DollarSign } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import type { ProposalFormData } from "./types";

/**
 * Step 5: Rent Model Parameters
 *
 * GAP 4: Support for 3 rent models with conditional forms
 * - Fixed: Base rent + annual escalation
 * - RevShare: Revenue % + optional floor/cap
 * - Partner: Investment amount + revenue share terms
 */

// Schema for Fixed Rent Model (base rent 2028 + growth rate + frequency)
const fixedRentSchema = z.object({
  baseRent: z.number().positive("Base rent must be positive"),
  rentGrowthRate: z
    .number()
    .min(0, "Growth cannot be negative")
    .max(20, "Growth cannot exceed 20%"),
  rentFrequency: z
    .number()
    .int("Frequency must be an integer")
    .min(1, "Frequency must be at least 1 year")
    .max(5, "Frequency cannot exceed 5 years"),
});

// Schema for Revenue Share Model (percentage-only)
const revenueShareSchema = z.object({
  revenueSharePercent: z
    .number()
    .positive("Revenue share must be positive")
    .max(100, "Revenue share cannot exceed 100%"),
});

// Schema for Partner Investment Model (investment-yield)
const partnerInvestmentSchema = z.object({
  partnerLandSize: z.number().positive("Land size must be positive"),
  partnerLandPricePerSqm: z.number().positive("Land price must be positive"),
  partnerBuaSize: z.number().positive("BUA size must be positive"),
  partnerConstructionCostPerSqm: z
    .number()
    .positive("Construction cost must be positive"),
  partnerYieldRate: z
    .number()
    .positive("Yield must be positive")
    .max(100, "Yield cannot exceed 100%"),
  partnerGrowthRate: z
    .number()
    .min(0, "Growth cannot be negative")
    .max(20, "Growth cannot exceed 20%"),
  partnerFrequency: z
    .number()
    .int("Frequency must be an integer")
    .min(1, "Frequency must be at least 1 year")
    .max(5, "Frequency cannot exceed 5 years"),
});

export interface Step5RentModelProps {
  data: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step5RentModel({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step5RentModelProps) {
  const rentModel = data?.rentModel || "";

  // Select schema based on rent model
  const getSchema = () => {
    switch (rentModel) {
      case "Fixed":
        return fixedRentSchema;
      case "RevShare":
        return revenueShareSchema;
      case "Partner":
        return partnerInvestmentSchema;
      default:
        return fixedRentSchema; // Default fallback
    }
  };

  // Get default values based on rent model
  const getDefaultValues = () => {
    switch (rentModel) {
      case "Fixed":
        return {
          baseRent: data?.baseRent || 10000000, // 10M default
          rentGrowthRate: data?.rentGrowthRate ?? 3, // 3% default
          rentFrequency: data?.rentFrequency ?? 1,
        };
      case "RevShare":
        return {
          revenueSharePercent: data?.revenueSharePercent || 15, // 15% default
        };
      case "Partner":
        return {
          partnerLandSize: data?.partnerLandSize || 10000, // m²
          partnerLandPricePerSqm: data?.partnerLandPricePerSqm || 5000, // SAR/m²
          partnerBuaSize: data?.partnerBuaSize || 20000, // m²
          partnerConstructionCostPerSqm:
            data?.partnerConstructionCostPerSqm || 2500, // SAR/m²
          partnerYieldRate: data?.partnerYieldRate ?? 9, // 9% yield
          partnerGrowthRate: data?.partnerGrowthRate ?? 2, // 2% default growth
          partnerFrequency: data?.partnerFrequency ?? 1,
        };
      default:
        return {};
    }
  };

  const schema = getSchema();
  type FormSchema = typeof schema;
  const form = useProposalForm<FormSchema>(
    schema,
    getDefaultValues() as Partial<z.infer<FormSchema>>,
  );

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

  // Render conditional form based on rent model
  const renderRentModelForm = () => {
    switch (rentModel) {
      case "Fixed":
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Fixed Rent Model:</strong> Annual rent starts at a base
                amount and increases by a fixed percentage each year (CPI
                escalation).
              </AlertDescription>
            </Alert>

            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <DollarSign className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Fixed Rent Parameters</h3>
              </div>

              <InputField
                name="baseRent"
                label="Base Rent (Year 1)"
                type="number"
                prefix="$"
                description="Starting rent amount for the first year"
                placeholder="10000000"
              />

              <InputField
                name="rentGrowthRate"
                label="Growth Rate"
                type="number"
                suffix="%"
                description="Percentage increase applied per frequency"
                placeholder="3"
              />

              <InputField
                name="rentFrequency"
                label="Growth Frequency"
                type="number"
                suffix="years"
                description="How often the growth rate is applied (1-5 years)"
                placeholder="1"
              />

              {/* Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">5-Year Preview</h4>
                <div className="space-y-1 text-sm font-mono">
                  {[1, 2, 3, 4, 5].map((year) => {
                    const baseRent = form.watch("baseRent") || 10000000;
                    const growth = (form.watch("rentGrowthRate") || 3) / 100;
                    const freq = form.watch("rentFrequency") || 1;
                    const periodsElapsed = Math.floor((year - 1) / freq);
                    const rent =
                      baseRent * Math.pow(1 + growth, periodsElapsed);
                    return (
                      <div key={year} className="flex justify-between">
                        <span className="text-muted-foreground">
                          Year {year}:
                        </span>
                        <span className="font-semibold">
                          ${(rent / 1000000).toFixed(2)}M
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        );

      case "RevShare":
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Revenue Share Model:</strong> Rent is calculated as a
                percentage of total school revenue, with optional minimum and
                maximum caps.
              </AlertDescription>
            </Alert>

            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <DollarSign className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">
                  Revenue Share Parameters
                </h3>
              </div>

              <InputField
                name="revenueSharePercent"
                label="Revenue Share Percentage"
                type="number"
                suffix="%"
                description="Percentage of total revenue paid as rent"
                placeholder="15"
              />

              {/* Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Example Calculation</h4>
                <div className="space-y-1 text-sm font-mono">
                  {[50, 75, 100, 125, 150].map((revenueM) => {
                    const sharePercent =
                      (form.watch("revenueSharePercent") || 15) / 100;
                    const revenue = revenueM * 1000000;
                    const rent = revenue * sharePercent;

                    return (
                      <div key={revenueM} className="flex justify-between">
                        <span className="text-muted-foreground">
                          Revenue ${revenueM}M:
                        </span>
                        <span className="font-semibold">
                          ${(rent / 1000000).toFixed(2)}M
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        );

      case "Partner":
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Partner Investment Model:</strong> Developer makes
                upfront investment, receives revenue share during recovery
                period, then reduced share after investment is recovered.
              </AlertDescription>
            </Alert>

            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <DollarSign className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">
                  Partnership Parameters
                </h3>
              </div>

              <InputField
                name="partnerLandSize"
                label="Land Size (m²)"
                type="number"
                suffix="m²"
                description="Land size of the project"
                placeholder="10000"
              />

              <InputField
                name="partnerLandPricePerSqm"
                label="Land Price per m²"
                type="number"
                prefix="$"
                description="Cost of land per square meter"
                placeholder="5000"
              />

              <InputField
                name="partnerBuaSize"
                label="BUA Size (m²)"
                type="number"
                suffix="m²"
                description="Built-up area size"
                placeholder="20000"
              />

              <InputField
                name="partnerConstructionCostPerSqm"
                label="Construction Cost per m²"
                type="number"
                prefix="$"
                description="Construction cost per square meter"
                placeholder="2500"
              />

              <InputField
                name="partnerYieldRate"
                label="Yield Rate"
                type="number"
                suffix="%"
                description="Yield applied to total investment to derive base rent"
                placeholder="9"
              />

              <InputField
                name="partnerGrowthRate"
                label="Growth Rate"
                type="number"
                suffix="%"
                description="Growth applied to base rent at each frequency step"
                placeholder="2"
              />

              <InputField
                name="partnerFrequency"
                label="Growth Frequency"
                type="number"
                suffix="years"
                description="How often the growth rate is applied (1-5 years)"
                placeholder="1"
              />

              {/* Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Investment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Land Size:</span>
                    <span className="font-mono font-semibold">
                      {(
                        form.watch("partnerLandSize") || 10000
                      ).toLocaleString()}{" "}
                      m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">BUA Size:</span>
                    <span className="font-mono font-semibold">
                      {(form.watch("partnerBuaSize") || 20000).toLocaleString()}{" "}
                      m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yield:</span>
                    <span className="font-mono font-semibold">
                      {(form.watch("partnerYieldRate") || 9).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Growth:</span>
                    <span className="font-mono font-semibold text-primary">
                      {(form.watch("partnerGrowthRate") || 2).toFixed(1)}% every{" "}
                      {form.watch("partnerFrequency") || 1} yrs
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please select a rent model in Step 1 to configure the rent
              parameters.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Rent Model Configuration</h2>
        <p className="text-muted-foreground mt-2">
          Configure parameters for the <strong>{rentModel}</strong> rent model
          (GAP 4)
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {renderRentModelForm()}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onPrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button type="submit">
              Next: Operating Costs
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
