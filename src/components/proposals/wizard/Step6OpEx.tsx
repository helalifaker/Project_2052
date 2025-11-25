"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ArrowLeft, ArrowRight, Info, Users, DollarSign } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import type { ProposalFormData } from "./types";

const step6Schema = z.object({
  studentsPerTeacher: z
    .number()
    .positive("Students per teacher must be positive"),
  studentsPerNonTeacher: z
    .number()
    .positive("Students per non-teacher must be positive"),
  avgTeacherSalary: z
    .number()
    .positive("Average teacher salary must be positive"),
  avgAdminSalary: z.number().positive("Average admin salary must be positive"),
  cpiRate: z.number().min(0, "CPI cannot be negative").max(100, "CPI too high"),
  cpiFrequency: z.number().int().min(1).max(5),

  // Other Operating Expenses
  otherOpexPercent: z
    .number()
    .min(0, "Other OpEx % cannot be negative")
    .max(100, "Other OpEx % cannot exceed 100%"),
});

export interface Step6OpExProps {
  data: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step6OpEx({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step6OpExProps) {
  const form = useProposalForm(step6Schema, {
    studentsPerTeacher: data?.studentsPerTeacher || 14,
    studentsPerNonTeacher: data?.studentsPerNonTeacher || 50,
    avgTeacherSalary: data?.avgTeacherSalary || 60000, // $60k average
    avgAdminSalary: data?.avgAdminSalary || 50000, // $50k average
    cpiRate: data?.cpiRate ?? 3,
    cpiFrequency: data?.cpiFrequency ?? 1,

    // Other OpEx
    otherOpexPercent: data?.otherOpexPercent || 10, // 10% default (GAP 20)
  });

  const otherOpexPercent = form.watch("otherOpexPercent") || 10;

  const calculateVariableCostPerStudent = () => {
    const avgTeacherSalary = form.watch("avgTeacherSalary") || 60000;
    const avgAdminSalary = form.watch("avgAdminSalary") || 50000;
    const studentsPerTeacher = form.watch("studentsPerTeacher") || 14;
    const studentsPerNonTeacher = form.watch("studentsPerNonTeacher") || 50;

    const teacherCostPerStudent = (avgTeacherSalary * 12) / studentsPerTeacher;
    const adminCostPerStudent = (avgAdminSalary * 12) / studentsPerNonTeacher;
    return teacherCostPerStudent + adminCostPerStudent;
  };

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  const onSubmit = form.handleSubmit((formData) => {
    onUpdate({
      ...formData,
      variableCostPerStudent: calculateVariableCostPerStudent(),
    });
    onNext();
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Operating Costs Configuration</h2>
        <p className="text-muted-foreground mt-2">
          Configure staff costs and other operating expenses (GAP 20)
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>GAP 20:</strong> Operating expenses are pre-filled with
          industry-standard percentages. Staff costs typically represent 40% of
          revenue, and other OpEx around 10%. You can adjust these based on your
          specific assumptions.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Staff Costs Section */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Staff Costs</h3>
                <p className="text-sm text-muted-foreground">
                  Configure staffing parameters
                </p>
              </div>
            </div>

            {/* Model Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="studentsPerTeacher"
                label="Students per Teacher"
                type="number"
                description="Student-teacher ratio"
                placeholder="14"
              />
              <InputField
                name="studentsPerNonTeacher"
                label="Students per Non-Teacher"
                type="number"
                description="Student to non-teaching staff ratio"
                placeholder="50"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="avgTeacherSalary"
                label="Average Teacher Salary"
                type="number"
                prefix="$"
                description="Monthly average salary"
                placeholder="60000"
              />
              <InputField
                name="avgAdminSalary"
                label="Average Admin Salary"
                type="number"
                prefix="$"
                description="Monthly average salary"
                placeholder="50000"
              />
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold mb-3">Staff Cost Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Variable Cost / Student (annual):
                  </span>
                  <span className="font-mono font-bold text-primary">
                    ${calculateVariableCostPerStudent().toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Other Operating Expenses */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">
                  Other Operating Expenses
                </h3>
                <p className="text-sm text-muted-foreground">
                  Utilities, maintenance, supplies, etc.
                </p>
              </div>
            </div>

            <InputField
              name="otherOpexPercent"
              label="Other OpEx as % of Revenue"
              type="number"
              suffix="%"
              description="Typically 8-12% of revenue (GAP 20: Default 10%)"
              placeholder="10"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="cpiRate"
                label="CPI Rate"
                type="number"
                suffix="%"
                description="CPI escalation applied to staff costs"
              />
              <InputField
                name="cpiFrequency"
                label="CPI Frequency"
                type="number"
                suffix="years"
                description="How often CPI is applied (1-5 years)"
              />
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Example Calculation</h4>
              <div className="space-y-1 text-sm font-mono">
                {[50, 75, 100, 125, 150].map((revenueM) => {
                  const otherOpex =
                    revenueM * 1000000 * (otherOpexPercent / 100);
                  return (
                    <div key={revenueM} className="flex justify-between">
                      <span className="text-muted-foreground">
                        Revenue ${revenueM}M:
                      </span>
                      <span className="font-semibold">
                        ${(otherOpex / 1000000).toFixed(2)}M other OpEx
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Total OpEx Preview */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold mb-3">
              Total Operating Expense Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rent:</span>
                <span className="font-mono">Varies by model</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staff Costs:</span>
                <span className="font-mono font-semibold">
                  Ratio-based from students & salaries
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other OpEx:</span>
                <span className="font-mono font-semibold">
                  {otherOpexPercent.toFixed(1)}% of revenue
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total OpEx:</span>
                <span className="font-mono font-bold text-primary">
                  Rent + Staff + Other OpEx
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
              Next: Review & Calculate
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
