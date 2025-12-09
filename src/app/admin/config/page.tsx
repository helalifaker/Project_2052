"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Save, Info, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { DEFAULT_FINANCIAL_RATES } from "@/lib/constants";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with pre-filled values (GAPs 14, 16, 18)
  const form = useProposalForm(configSchema, {
    zakatRate: DEFAULT_FINANCIAL_RATES.zakatRate, // GAP 18: Default Zakat Rate
    debtInterestRate: DEFAULT_FINANCIAL_RATES.debtInterestRate, // Default Debt Interest Rate
    depositInterestRate: DEFAULT_FINANCIAL_RATES.depositInterestRate, // GAP 16: Default Deposit Interest Rate
    discountRate: DEFAULT_FINANCIAL_RATES.npvDiscountRate, // Default NPV Discount Rate (WACC/hurdle rate)
    minCashBalance: DEFAULT_FINANCIAL_RATES.minCashBalanceMillions, // GAP 14: Default Minimum Cash Balance (in Millions SAR)
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
        discountRate: new Decimal(data.discountRate).div(100).toNumber(),
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
    <div className="container mx-auto py-8 space-y-8 animate-fade-in-up">
      {/* Navigation */}
      <div className="space-y-4">
        <BackButton href="/admin" label="Back to Admin" />
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin", href: "/admin" },
            { label: "System Config" },
          ]}
        />
      </div>

      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          System Configuration
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Configure global settings that affect all financial calculations.
          Changes here propagate to all new and recalculated proposals.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Configuration Form - Executive Style */}
        <Card className="lg:col-span-2 glass-card p-0 overflow-hidden border-0">
          <div className="px-8 py-6 border-b border-white/5 bg-white/5 backdrop-blur-[2px]">
            <CardTitle className="font-serif text-xl">
              Financial Parameters
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              These settings will be applied to all proposal calculations
            </CardDescription>
          </div>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-8">
                {/* Zakat Rate */}
                <div className="group space-y-4 p-5 rounded-xl border border-white/5 bg-card/20 hover:border-accent-gold/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-accent-gold/10 text-accent-gold">
                      <Info className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-medium text-foreground">
                          Zakat Rate
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          The Zakat rate applied to earnings before tax (EBT).
                          Default: 2.5%.
                        </p>
                      </div>
                      <InputField
                        name="zakatRate"
                        label=""
                        type="number"
                        suffix="%"
                        placeholder="2.5"
                        className="bg-background/50 border-white/10 focus:border-accent-gold/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Rates Group */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Debt Interest Rate */}
                  <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-card/10 hover:border-white/10 transition-colors">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-foreground">
                        Debt Interest
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Annual interest on outstanding debt.
                      </p>
                    </div>
                    <InputField
                      name="debtInterestRate"
                      label=""
                      type="number"
                      suffix="%"
                      className="bg-background/50 border-white/10"
                    />
                  </div>

                  {/* Deposit Interest Rate */}
                  <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-card/10 hover:border-white/10 transition-colors">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-foreground">
                        Deposit Interest
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Interest earned on positive cash.
                      </p>
                    </div>
                    <InputField
                      name="depositInterestRate"
                      label=""
                      type="number"
                      suffix="%"
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Discount Rate */}
                  <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-card/10 hover:border-white/10 transition-colors">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-foreground">
                        Discount Rate (NPV)
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        SARA / WACC Rate (8-12%).
                      </p>
                    </div>
                    <InputField
                      name="discountRate"
                      label=""
                      type="number"
                      suffix="%"
                      className="bg-background/50 border-white/10"
                    />
                  </div>

                  {/* Minimum Cash */}
                  <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-card/10 hover:border-white/10 transition-colors">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-foreground">
                        Min Cash Balance
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Minimum liquidity constraint.
                      </p>
                    </div>
                    <InputField
                      name="minCashBalance"
                      label=""
                      type="number"
                      suffix="M SAR"
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    variant="ghost"
                    className="hover:bg-white/5 text-muted-foreground"
                    onClick={() => form.reset()}
                  >
                    Reset Defaults
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-accent-gold hover:bg-accent-gold/90 text-white min-w-[140px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Current Values Display - Executive Summary Card */}
        <Card className="h-fit glass-card p-0 overflow-hidden border-0">
          <div className="px-6 py-5 border-b border-white/5 bg-accent-gold/5 backdrop-blur-[2px]">
            <CardTitle className="font-serif text-lg text-foreground">
              Current Status
            </CardTitle>
          </div>
          <CardContent className="p-6 space-y-1">
            {[
              { label: "Zakat Rate", value: form.watch("zakatRate") + "%" },
              {
                label: "Debt Interest",
                value: form.watch("debtInterestRate") + "%",
              },
              {
                label: "Deposit Interest",
                value: form.watch("depositInterestRate") + "%",
              },
              {
                label: "Discount Rate",
                value: form.watch("discountRate") + "%",
              },
              {
                label: "Min Cash",
                value: form.watch("minCashBalance") + " M SAR",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-3 -mx-3 rounded-lg transition-colors"
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {item.label}
                </span>
                <span className="font-serif text-lg font-light text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="glass-panel border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">
              Confirm Configuration Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              These changes will affect all future proposal calculations. Are
              you sure you want to save these settings?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2 bg-card/30 rounded-lg p-4 my-2 border border-white/5">
            {[
              { label: "Zakat Rate", value: form.watch("zakatRate") + "%" },
              {
                label: "Debt Interest",
                value: form.watch("debtInterestRate") + "%",
              },
              {
                label: "Deposit Interest",
                value: form.watch("depositInterestRate") + "%",
              },
              {
                label: "Discount Rate",
                value: form.watch("discountRate") + "%",
              },
              {
                label: "Min Cash",
                value: form.watch("minCashBalance") + " M SAR",
              },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              className="bg-accent-gold hover:bg-accent-gold/90 text-white"
            >
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
      <DashboardLayout>
        <SystemConfigPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
