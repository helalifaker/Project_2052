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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/FormField";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Role } from "@/lib/types/roles";
import { AlertCircle, CheckCircle2, Lock, Save, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { type HistoricalDataItem } from "@/lib/validation/historical";

// Validation schemas for historical data
const plSchema = z.object({
  revenue_2023: z.number().min(0, "Revenue must be positive"),
  revenue_2024: z.number().min(0, "Revenue must be positive"),
  rent_2023: z.number().min(0, "Rent must be positive"),
  rent_2024: z.number().min(0, "Rent must be positive"),
  staff_costs_2023: z.number().min(0, "Staff costs must be positive"),
  staff_costs_2024: z.number().min(0, "Staff costs must be positive"),
  other_opex_2023: z.number().min(0, "Other OpEx must be positive"),
  other_opex_2024: z.number().min(0, "Other OpEx must be positive"),
  depreciation_2023: z.number().min(0, "Depreciation must be positive"),
  depreciation_2024: z.number().min(0, "Depreciation must be positive"),
  interest_2023: z.number().min(0, "Interest must be positive or zero"),
  interest_2024: z.number().min(0, "Interest must be positive or zero"),
});

const bsSchema = z.object({
  cash_2023: z.number().min(0, "Cash must be positive"),
  cash_2024: z.number().min(0, "Cash must be positive"),
  ar_2023: z.number().min(0, "AR must be positive"),
  ar_2024: z.number().min(0, "AR must be positive"),
  prepaid_2023: z.number().min(0, "Prepaid must be positive"),
  prepaid_2024: z.number().min(0, "Prepaid must be positive"),
  ppe_2023: z.number().min(0, "PP&E must be positive"),
  ppe_2024: z.number().min(0, "PP&E must be positive"),
  ap_2023: z.number().min(0, "AP must be positive"),
  ap_2024: z.number().min(0, "AP must be positive"),
  accrued_2023: z.number().min(0, "Accrued expenses must be positive"),
  accrued_2024: z.number().min(0, "Accrued expenses must be positive"),
  deferred_2023: z.number().min(0, "Deferred revenue must be positive"),
  deferred_2024: z.number().min(0, "Deferred revenue must be positive"),
  debt_2023: z.number().min(0, "Debt must be positive or zero"),
  debt_2024: z.number().min(0, "Debt must be positive or zero"),
  equity_2023: z.number(),
  equity_2024: z.number(),
});

function HistoricalDataPageContent() {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false); // GAP 17: Immutability flag
  const [activeTab, setActiveTab] = useState("pl");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const plForm = useProposalForm(plSchema, {
    revenue_2023: 0,
    revenue_2024: 0,
    rent_2023: 0,
    rent_2024: 0,
    staff_costs_2023: 0,
    staff_costs_2024: 0,
    other_opex_2023: 0,
    other_opex_2024: 0,
    depreciation_2023: 0,
    depreciation_2024: 0,
    interest_2023: 0,
    interest_2024: 0,
  });

  const bsForm = useProposalForm(bsSchema, {
    cash_2023: 0,
    cash_2024: 0,
    ar_2023: 0,
    ar_2024: 0,
    prepaid_2023: 0,
    prepaid_2024: 0,
    ppe_2023: 0,
    ppe_2024: 0,
    ap_2023: 0,
    ap_2024: 0,
    accrued_2023: 0,
    accrued_2024: 0,
    deferred_2023: 0,
    deferred_2024: 0,
    debt_2023: 0,
    debt_2024: 0,
    equity_2023: 0,
    equity_2024: 0,
  });

  // GAP 2: Auto-calculate working capital ratios
  const calculateWorkingCapital = (year: number) => {
    const suffix = `_${year}`;
    // Dynamic form field access requires type assertion since field names are constructed at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const revenue = plForm.watch(`revenue${suffix}` as any) || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ar = bsForm.watch(`ar${suffix}` as any) || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prepaid = bsForm.watch(`prepaid${suffix}` as any) || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ap = bsForm.watch(`ap${suffix}` as any) || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accrued = bsForm.watch(`accrued${suffix}` as any) || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deferred = bsForm.watch(`deferred${suffix}` as any) || 0;

    if (revenue === 0)
      return {
        arDays: 0,
        prepaidDays: 0,
        apDays: 0,
        accruedDays: 0,
        deferredDays: 0,
      };

    return {
      arDays: Math.round((ar / revenue) * 365),
      prepaidDays: Math.round((prepaid / revenue) * 365),
      apDays: Math.round((ap / revenue) * 365),
      accruedDays: Math.round((accrued / revenue) * 365),
      deferredDays: Math.round((deferred / revenue) * 365),
    };
  };

  const wc2023 = calculateWorkingCapital(2023);
  const wc2024 = calculateWorkingCapital(2024);

  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const res = await fetch("/api/historical");
        if (!res.ok) {
          throw new Error("Failed to load historical data");
        }
        const data = (await res.json()) as HistoricalDataItem[];

        const plDefaults = { ...plForm.getValues() };
        const bsDefaults = { ...bsForm.getValues() };
        let anyConfirmed = false;

        data.forEach((item) => {
          const amountMillions = Number(item.amount ?? 0) / 1_000_000;
          anyConfirmed = anyConfirmed || Boolean(item.confirmed);

          if (item.statementType === "PL") {
            if (item.lineItem === "revenue")
              plDefaults[`revenue_${item.year as 2023 | 2024}`] =
                amountMillions;
            if (item.lineItem === "rent")
              plDefaults[`rent_${item.year as 2023 | 2024}`] = amountMillions;
            if (item.lineItem === "staffCosts")
              plDefaults[`staff_costs_${item.year as 2023 | 2024}`] =
                amountMillions;
            if (item.lineItem === "otherOpex")
              plDefaults[`other_opex_${item.year as 2023 | 2024}`] =
                amountMillions;
            if (item.lineItem === "depreciation")
              plDefaults[`depreciation_${item.year as 2023 | 2024}`] =
                amountMillions;
            if (item.lineItem === "interest")
              plDefaults[`interest_${item.year as 2023 | 2024}`] =
                amountMillions;
          } else if (item.statementType === "BS") {
            if (item.lineItem === "cash")
              bsDefaults[`cash_${item.year as 2023 | 2024}`] = amountMillions;
            if (item.lineItem === "accountsReceivable")
              bsDefaults[`ar_${item.year as 2023 | 2024}`] = amountMillions;
            if (item.lineItem === "prepaidExpenses")
              bsDefaults[`prepaid_${item.year as 2023 | 2024}`] =
                amountMillions;
            if (item.lineItem === "ppe")
              bsDefaults[`ppe_${item.year as 2023 | 2024}`] = amountMillions;
            if (item.lineItem === "accountsPayable")
              bsDefaults[`ap_${item.year as 2023 | 2024}`] = amountMillions;
            if (item.lineItem === "accruedExpenses")
              bsDefaults[`accrued_${item.year as 2023 | 2024}`] =
                amountMillions;
            if (item.lineItem === "deferredRevenue")
              bsDefaults[`deferred_${item.year as 2023 | 2024}`] =
                amountMillions;
            if (item.lineItem === "debt")
              bsDefaults[`debt_${item.year as 2023 | 2024}`] = amountMillions;
            if (item.lineItem === "equity")
              bsDefaults[`equity_${item.year as 2023 | 2024}`] = amountMillions;
          }
        });

        plForm.reset(plDefaults);
        bsForm.reset(bsDefaults);
        setIsConfirmed(anyConfirmed);
      } catch (error) {
        console.error("Failed to load historical data", error);
        toast.error("Unable to load historical data");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoricalData();
  }, [bsForm, plForm]);

  const buildPayload = (confirmed: boolean): HistoricalDataItem[] => {
    const plValues = plForm.getValues();
    const bsValues = bsForm.getValues();

    const toAmount = (value: number) =>
      new Decimal(value || 0).mul(1_000_000).toNumber();
    const payload: HistoricalDataItem[] = [];

    [2023, 2024].forEach((year) => {
      payload.push(
        {
          year,
          statementType: "PL",
          lineItem: "revenue",
          amount: toAmount(plValues[`revenue_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "PL",
          lineItem: "rent",
          amount: toAmount(plValues[`rent_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "PL",
          lineItem: "staffCosts",
          amount: toAmount(plValues[`staff_costs_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "PL",
          lineItem: "otherOpex",
          amount: toAmount(plValues[`other_opex_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "PL",
          lineItem: "depreciation",
          amount: toAmount(plValues[`depreciation_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "PL",
          lineItem: "interest",
          amount: toAmount(plValues[`interest_${year}`]),
          confirmed,
        },
      );

      payload.push(
        {
          year,
          statementType: "BS",
          lineItem: "cash",
          amount: toAmount(bsValues[`cash_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "BS",
          lineItem: "accountsReceivable",
          amount: toAmount(bsValues[`ar_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "BS",
          lineItem: "prepaidExpenses",
          amount: toAmount(bsValues[`prepaid_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "BS",
          lineItem: "ppe",
          amount: toAmount(bsValues[`ppe_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "BS",
          lineItem: "accountsPayable",
          amount: toAmount(bsValues[`ap_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "BS",
          lineItem: "accruedExpenses",
          amount: toAmount(bsValues[`accrued_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "BS",
          lineItem: "deferredRevenue",
          amount: toAmount(bsValues[`deferred_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "BS",
          lineItem: "debt",
          amount: toAmount(bsValues[`debt_${year}`]),
          confirmed,
        },
        {
          year,
          statementType: "BS",
          lineItem: "equity",
          amount: toAmount(bsValues[`equity_${year}`]),
          confirmed,
        },
      );
    });

    return payload;
  };

  const handleSave = async () => {
    if (isConfirmed) {
      toast.error("Historical data is locked. Contact an admin to unlock.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildPayload(false);
      const res = await fetch("/api/historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save historical data");
      }

      toast.success("Historical data saved successfully");
    } catch {
      toast.error("Failed to save historical data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (isConfirmed) {
      toast.error("Historical data is already confirmed");
      return;
    }

    try {
      // TODO: Validate all forms before confirming
      const plValid = await plForm.trigger();
      const bsValid = await bsForm.trigger();

      if (!plValid || !bsValid) {
        toast.error("Please fix validation errors before confirming");
        return;
      }

      setIsSaving(true);
      const payload = buildPayload(true);
      const res = await fetch("/api/historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to confirm historical data");
      }

      setIsConfirmed(true);
      toast.success("Historical data confirmed and locked");
    } catch {
      toast.error("Failed to confirm historical data");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Loading historical data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Historical Data Entry
        </h1>
        <p className="text-muted-foreground mt-2">
          Input financial statements for 2023-2024 (GAP 17: Once confirmed, data
          becomes immutable)
        </p>
      </div>

      {/* Confirmation Status */}
      {isConfirmed && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Historical data has been confirmed and is now locked. Contact an
            administrator to make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for P&L, Balance Sheet, Cash Flow */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pl">P&L Statement</TabsTrigger>
          <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
          <TabsTrigger value="wc">Working Capital (GAP 2)</TabsTrigger>
        </TabsList>

        {/* P&L Tab */}
        <TabsContent value="pl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>
                Enter historical P&L data for 2023 and 2024 (in Millions SAR)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...plForm}>
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* 2023 Column */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">2023</h3>
                      <InputField
                        name="revenue_2023"
                        label="Revenue"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="rent_2023"
                        label="Rent Expense"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="staff_costs_2023"
                        label="Staff Costs"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="other_opex_2023"
                        label="Other OpEx"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="depreciation_2023"
                        label="Depreciation"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="interest_2023"
                        label="Interest Expense"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                    </div>

                    {/* 2024 Column */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">2024</h3>
                      <InputField
                        name="revenue_2024"
                        label="Revenue"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="rent_2024"
                        label="Rent Expense"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="staff_costs_2024"
                        label="Staff Costs"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="other_opex_2024"
                        label="Other OpEx"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="depreciation_2024"
                        label="Depreciation"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                      <InputField
                        name="interest_2024"
                        label="Interest Expense"
                        type="number"
                        suffix="M"
                        disabled={isConfirmed}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet Tab */}
        <TabsContent value="bs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
              <CardDescription>
                Enter historical balance sheet data for 2023 and 2024 (in
                Millions SAR)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...bsForm}>
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* 2023 Column */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">2023</h3>
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-muted-foreground">
                          ASSETS
                        </p>
                        <InputField
                          name="cash_2023"
                          label="Cash"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="ar_2023"
                          label="Accounts Receivable"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="prepaid_2023"
                          label="Prepaid Expenses"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="ppe_2023"
                          label="PP&E (Net)"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />

                        <p className="text-sm font-semibold text-muted-foreground pt-4">
                          LIABILITIES & EQUITY
                        </p>
                        <InputField
                          name="ap_2023"
                          label="Accounts Payable"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="accrued_2023"
                          label="Accrued Expenses"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="deferred_2023"
                          label="Deferred Revenue"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="debt_2023"
                          label="Debt"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="equity_2023"
                          label="Equity"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                      </div>
                    </div>

                    {/* 2024 Column */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">2024</h3>
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-muted-foreground">
                          ASSETS
                        </p>
                        <InputField
                          name="cash_2024"
                          label="Cash"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="ar_2024"
                          label="Accounts Receivable"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="prepaid_2024"
                          label="Prepaid Expenses"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="ppe_2024"
                          label="PP&E (Net)"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />

                        <p className="text-sm font-semibold text-muted-foreground pt-4">
                          LIABILITIES & EQUITY
                        </p>
                        <InputField
                          name="ap_2024"
                          label="Accounts Payable"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="accrued_2024"
                          label="Accrued Expenses"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="deferred_2024"
                          label="Deferred Revenue"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="debt_2024"
                          label="Debt"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                        <InputField
                          name="equity_2024"
                          label="Equity"
                          type="number"
                          suffix="M"
                          disabled={isConfirmed}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Capital Tab (GAP 2) */}
        <TabsContent value="wc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                Working Capital Ratios (Auto-Calculated - GAP 2)
              </CardTitle>
              <CardDescription>
                These ratios are automatically calculated from your historical
                data and will be locked after confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* 2023 Ratios */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">2023 Ratios</h3>
                  <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        AR Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2023.arDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Prepaid Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2023.prepaidDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        AP Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2023.apDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Accrued Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2023.accruedDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Deferred Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2023.deferredDays} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2024 Ratios */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">2024 Ratios</h3>
                  <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        AR Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2024.arDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Prepaid Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2024.prepaidDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        AP Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2024.apDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Accrued Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2024.accruedDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Deferred Days:
                      </span>
                      <span className="font-mono font-semibold">
                        {wc2024.deferredDays} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  These working capital ratios will be used to project future
                  periods. Once confirmed, they cannot be changed.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isConfirmed || isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <Button onClick={handleConfirm} disabled={isConfirmed || isSaving}>
          {isConfirmed ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmed
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Confirm & Lock Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function HistoricalDataPage() {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <HistoricalDataPageContent />
    </ProtectedRoute>
  );
}
