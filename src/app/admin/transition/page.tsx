"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BackButton } from "@/components/navigation/BackButton";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Info, Save, AlertCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Role } from "@/lib/types/roles";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { toast } from "sonner";

const transitionSchema = z.object({
  year2025Students: z.number().int().nonnegative(),
  year2025AvgTuition: z.number().nonnegative(),
  year2026Students: z.number().int().nonnegative(),
  year2026AvgTuition: z.number().nonnegative(),
  year2027Students: z.number().int().nonnegative(),
  year2027AvgTuition: z.number().nonnegative(),
  rentGrowthPercent: z.number().nonnegative(),
});

function TransitionConfigPageContent() {
  const [loading, setLoading] = useState(false);

  const form = useProposalForm(transitionSchema, {
    year2025Students: 800,
    year2025AvgTuition: 30000,
    year2026Students: 850,
    year2026AvgTuition: 31500,
    year2027Students: 900,
    year2027AvgTuition: 33000,
    rentGrowthPercent: 5,
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/transition-config");
        if (!res.ok) return;
        const json = await res.json();
        form.reset({
          year2025Students: json.year2025Students,
          year2025AvgTuition: Number(json.year2025AvgTuition),
          year2026Students: json.year2026Students,
          year2026AvgTuition: Number(json.year2026AvgTuition),
          year2027Students: json.year2027Students,
          year2027AvgTuition: Number(json.year2027AvgTuition),
          rentGrowthPercent: Number(json.rentGrowthPercent) * 100,
        });
      } catch (error) {
        console.error("Failed to load transition config", error);
      }
    };
    loadConfig();
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        rentGrowthPercent: values.rentGrowthPercent / 100,
      };
      const res = await fetch("/api/transition-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error("Failed to save transition configuration");
      } else {
        toast.success("Transition configuration saved");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save transition configuration");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Navigation */}
      <div className="space-y-4">
        <BackButton href="/admin" label="Back to Admin" />
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin", href: "/admin" },
            { label: "Transition Setup" },
          ]}
        />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Transition Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Admin-only setup for 2025-2027 transition assumptions (students,
          tuition, rent growth).
        </p>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Global Impact Warning</AlertTitle>
        <AlertDescription>
          Changes to this configuration will affect{" "}
          <strong>ALL proposals</strong> when recalculated. All proposals use
          this single source of truth for the transition period (2025-2027).
          Historical proposals will use these updated values on next
          recalculation.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Transition Years (2025-2027)</CardTitle>
          <CardDescription>
            Values here apply to all proposals; wizard inputs are read-only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {[2025, 2026, 2027].map((year) => (
                <div
                  key={year}
                  className="space-y-4 p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-lg">{year}</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      name={`year${year}Students` as const}
                      label="Students (FR only)"
                      type="number"
                      suffix="students"
                    />
                    <InputField
                      name={`year${year}AvgTuition` as const}
                      label="Average Tuition"
                      type="number"
                      prefix="SAR "
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-4 p-4 rounded-lg border bg-primary/5">
                <h3 className="font-semibold text-lg">Rent Growth</h3>
                <InputField
                  name="rentGrowthPercent"
                  label="Annual Rent Growth % (from 2024 base)"
                  type="number"
                  suffix="%"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TransitionConfigPage() {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <TransitionConfigPageContent />
    </ProtectedRoute>
  );
}
