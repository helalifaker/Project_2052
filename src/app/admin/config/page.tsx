"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Role } from "@/lib/types/roles";
import { BackButton } from "@/components/navigation/BackButton";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Save, Info } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Decimal from "decimal.js";

// Validation schema for system configuration
const configSchema = z.object({
  zakatRate: z.number().min(0).max(100, "Zakat rate must be between 0 and 100"),
  debtInterestRate: z
    .number()
    .min(0)
    .max(100, "Debt interest rate must be between 0 and 100"),
  depositInterestRate: z
    .number()
    .min(0)
    .max(100, "Deposit interest rate must be between 0 and 100"),
  discountRate: z
    .number()
    .min(0)
    .max(100, "Discount rate must be between 0 and 100"),
  minCashBalance: z.number().min(0, "Minimum cash balance must be positive"),
});

function SystemConfigPageContent() {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with pre-filled values (GAPs 14, 16, 18)
  const form = useProposalForm(configSchema, {
    zakatRate: 2.5, // GAP 18: Default Zakat Rate
    debtInterestRate: 5.0, // Default Debt Interest Rate
    depositInterestRate: 2.0, // GAP 16: Default Deposit Interest Rate
    discountRate: 8.0, // Default NPV Discount Rate (WACC/hurdle rate)
    minCashBalance: 1.0, // GAP 14: Default Minimum Cash Balance (in Millions SAR)
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (!res.ok) {
          throw new Error("Failed to load system configuration");
        }
        const data = await res.json();
        setConfigId(data.id);
        form.reset({
          zakatRate: Number(data.zakatRate ?? 0) * 100,
          debtInterestRate: Number(data.debtInterestRate ?? 0) * 100,
          depositInterestRate: Number(data.depositInterestRate ?? 0) * 100,
          discountRate: Number(data.discountRate ?? 0) * 100,
          minCashBalance: Number(data.minCashBalance ?? 0) / 1_000_000,
        });
      } catch (error) {
        console.error("Failed to load system configuration", error);
        toast.error("Unable to load current configuration");
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [form]);

  const onSubmit = form.handleSubmit((_data) => {
    setShowConfirmDialog(true);
  });

  const handleConfirmSave = async () => {
    if (!configId) {
      toast.error("Configuration record not found");
      setShowConfirmDialog(false);
      return;
    }

    setIsSaving(true);
    try {
      const data = form.getValues();
      const payload = {
        id: configId,
        zakatRate: new Decimal(data.zakatRate).div(100).toNumber(),
        debtInterestRate: new Decimal(data.debtInterestRate)
          .div(100)
          .toNumber(),
        depositInterestRate: new Decimal(data.depositInterestRate)
          .div(100)
          .toNumber(),
        discountRate: new Decimal(data.discountRate)
          .div(100)
          .toNumber(),
        minCashBalance: new Decimal(data.minCashBalance)
          .mul(1_000_000)
          .toNumber(),
      };

      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save configuration");
      }

      toast.success("System configuration saved successfully");
      setShowConfirmDialog(false);
    } catch {
      toast.error("Failed to save system configuration");
      setShowConfirmDialog(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Loading system configuration...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Navigation */}
      <div className="space-y-4">
        <BackButton href="/admin" label="Back to Admin" />
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/admin" },
          { label: "System Config" }
        ]} />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          System Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure global settings that affect all financial calculations
        </p>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Parameters</CardTitle>
          <CardDescription>
            These settings will be applied to all proposal calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Zakat Rate (GAP 18) */}
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Zakat Rate (GAP 18)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The Zakat rate applied to earnings before tax (EBT).
                      Default: 2.5% as per Islamic guidelines.
                    </p>
                    <InputField
                      name="zakatRate"
                      label="Zakat Rate"
                      type="number"
                      suffix="%"
                      description="Applied to Earnings Before Tax (EBT)"
                    />
                  </div>
                </div>
              </div>

              {/* Debt Interest Rate */}
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Debt Interest Rate</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The annual interest rate charged on outstanding debt. Used
                      to calculate interest expense.
                    </p>
                    <InputField
                      name="debtInterestRate"
                      label="Debt Interest Rate"
                      type="number"
                      suffix="%"
                      description="Applied to beginning debt balance"
                    />
                  </div>
                </div>
              </div>

              {/* Deposit Interest Rate (GAP 16) */}
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">
                      Deposit Interest Rate (GAP 16)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The annual interest rate earned on bank deposits when cash
                      balance is positive.
                    </p>
                    <InputField
                      name="depositInterestRate"
                      label="Deposit Interest Rate"
                      type="number"
                      suffix="%"
                      description="Applied to cash balance above minimum"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Rate for NPV Calculations */}
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">
                      Discount Rate (NPV Calculations)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The discount rate used for Net Present Value (NPV) calculations.
                      Represents the weighted average cost of capital (WACC) or required return rate.
                      Typical range: 8-12% for real estate investments.
                    </p>
                    <InputField
                      name="discountRate"
                      label="Discount Rate"
                      type="number"
                      suffix="%"
                      description="Applied to future cash flows for NPV calculations"
                    />
                  </div>
                </div>
              </div>

              {/* Minimum Cash Balance (GAP 14) */}
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">
                      Minimum Cash Balance (GAP 14)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The minimum cash balance that must be maintained at all
                      times. Prevents cash from going negative.
                    </p>
                    <InputField
                      name="minCashBalance"
                      label="Minimum Cash Balance"
                      type="number"
                      suffix="M SAR"
                      description="Minimum cash the school must maintain (in Millions)"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset to Defaults
                </Button>
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Current Values Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Overview of active system settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">Zakat Rate:</span>
              <span className="font-mono font-semibold">
                {form.watch("zakatRate")}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">Debt Interest Rate:</span>
              <span className="font-mono font-semibold">
                {form.watch("debtInterestRate")}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">
                Deposit Interest Rate:
              </span>
              <span className="font-mono font-semibold">
                {form.watch("depositInterestRate")}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">Discount Rate (NPV):</span>
              <span className="font-mono font-semibold">
                {form.watch("discountRate")}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">Minimum Cash Balance:</span>
              <span className="font-mono font-semibold">
                {form.watch("minCashBalance")} M SAR
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Configuration Changes</AlertDialogTitle>
            <AlertDialogDescription>
              These changes will affect all future proposal calculations. Are
              you sure you want to save these settings?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Zakat Rate:</span>
              <span className="font-mono font-semibold">
                {form.watch("zakatRate")}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Debt Interest Rate:</span>
              <span className="font-mono font-semibold">
                {form.watch("debtInterestRate")}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Deposit Interest Rate:</span>
              <span className="font-mono font-semibold">
                {form.watch("depositInterestRate")}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount Rate (NPV):</span>
              <span className="font-mono font-semibold">
                {form.watch("discountRate")}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Minimum Cash Balance:</span>
              <span className="font-mono font-semibold">
                {form.watch("minCashBalance")} M SAR
              </span>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SystemConfigPage() {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <SystemConfigPageContent />
    </ProtectedRoute>
  );
}
