"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Role } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatMillions } from "@/lib/utils/financial";

// Auto Reinvestment Schema
const autoReinvestmentSchema = z.object({
  enabled: z.boolean(),
  frequency: z.number().min(1, "Frequency must be at least 1 year"),
  amountType: z.enum(["fixed", "percentage"]),
  fixedAmount: z.number().min(0).optional(),
  percentageOfRevenue: z.number().min(0).max(100).optional(),
});

// Manual CapEx Item Schema
const manualCapExSchema = z.object({
  year: z.number().min(2025).max(2053),
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0, "Amount must be positive"),
  usefulLife: z.number().min(1, "Useful life must be at least 1 year"),
});

interface ManualCapExItem {
  id: string;
  year: number;
  assetName: string;
  amount: number;
  usefulLife: number;
  depreciationMethod: "OLD" | "NEW";
  nbv: number;
}

function CapExModulePageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Auto Reinvestment Form
  const autoForm = useProposalForm(autoReinvestmentSchema, {
    enabled: false,
    frequency: 5,
    amountType: "fixed",
    fixedAmount: 10.0,
    percentageOfRevenue: 5.0,
  });

  const isAutoReinvestmentEnabled = autoForm.watch("enabled");
  const amountType = autoForm.watch("amountType");

  // Manual CapEx Items
  const [manualItems, setManualItems] = useState<ManualCapExItem[]>([]);

  // Add Manual Item Form
  const manualForm = useProposalForm(manualCapExSchema, {
    year: 2028,
    name: "",
    amount: 0,
    usefulLife: 10,
  });

  const [showAddDialog, setShowAddDialog] = useState(false);

  // Load CapEx data from API
  const loadCapExData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/capex");
      if (!response.ok) throw new Error("Failed to fetch CapEx data");

      const data = await response.json();

      // Populate auto-reinvestment form
      if (data.config) {
        autoForm.setValue("enabled", data.config.autoReinvestEnabled);
        if (data.config.reinvestFrequency) {
          autoForm.setValue("frequency", data.config.reinvestFrequency);
        }
        if (data.config.reinvestAmount !== null) {
          autoForm.setValue("amountType", "fixed");
          autoForm.setValue("fixedAmount", data.config.reinvestAmount);
        } else if (data.config.reinvestAmountPercent !== null) {
          autoForm.setValue("amountType", "percentage");
          autoForm.setValue(
            "percentageOfRevenue",
            data.config.reinvestAmountPercent,
          );
        }
      }

      // Populate manual items
      if (data.manualItems) {
        setManualItems(data.manualItems);
      }
    } catch (error) {
      console.error("Failed to load CapEx data:", error);
      toast.error("Failed to load CapEx configuration");
    } finally {
      setLoading(false);
    }
  }, [autoForm]);

  useEffect(() => {
    loadCapExData();
  }, [loadCapExData]);

  // Calculate summary metrics
  const calculateSummary = () => {
    const totalCapEx = manualItems.reduce((sum, item) => sum + item.amount, 0);
    const totalNBV = manualItems.reduce((sum, item) => sum + item.nbv, 0);
    const annualDepreciation = manualItems.reduce(
      (sum, item) => sum + item.amount / item.usefulLife,
      0,
    );

    return { totalCapEx, totalNBV, annualDepreciation };
  };

  const summary = calculateSummary();

  const handleSaveAutoReinvestment = async () => {
    try {
      setSaving(true);
      const data = autoForm.getValues();

      const payload = {
        autoReinvestEnabled: data.enabled,
        reinvestFrequency: data.enabled ? data.frequency : null,
        reinvestAmountType: data.amountType,
        reinvestAmount: data.amountType === "fixed" ? data.fixedAmount : null,
        reinvestAmountPercent:
          data.amountType === "percentage" ? data.percentageOfRevenue : null,
      };

      const response = await fetch("/api/capex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save configuration");
      }

      toast.success("Auto-reinvestment configuration saved");
    } catch (error) {
      console.error("Failed to save auto-reinvestment:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save auto-reinvestment configuration",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddManualItem = manualForm.handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/capex/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: data.year,
          assetName: data.name,
          amount: data.amount,
          usefulLife: data.usefulLife,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add CapEx item");
      }

      const result = await response.json();
      setManualItems([...manualItems, result.item]);
      toast.success("CapEx item added successfully");
      setShowAddDialog(false);
      manualForm.reset();
    } catch (error) {
      console.error("Failed to add CapEx item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add CapEx item",
      );
    }
  });

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/capex/items?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete CapEx item");
      }

      setManualItems(manualItems.filter((item) => item.id !== id));
      toast.success("CapEx item deleted");
    } catch (error) {
      console.error("Failed to delete CapEx item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete CapEx item",
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
          CapEx Module (GAP 1)
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure automatic reinvestment and manage manual CapEx items
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total CapEx Committed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatMillions(summary.totalCapEx)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Annual Depreciation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatMillions(summary.annualDepreciation)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>PP&E Balance (NBV)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatMillions(summary.totalNBV)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto Reinvestment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Auto Reinvestment Configuration</CardTitle>
          <CardDescription>
            Set up recurring CapEx investments that occur automatically every N
            years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...autoForm}>
            <form className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="auto-reinvestment-toggle"
                    className="text-base font-medium"
                  >
                    Enable Auto-Reinvestment
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically schedule CapEx investments at regular
                    intervals
                  </p>
                </div>
                <Switch
                  id="auto-reinvestment-toggle"
                  checked={isAutoReinvestmentEnabled}
                  onCheckedChange={(checked) =>
                    autoForm.setValue("enabled", checked)
                  }
                />
              </div>

              {/* Configuration Fields (shown when enabled) */}
              {isAutoReinvestmentEnabled && (
                <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                  <InputField
                    name="frequency"
                    label="Frequency (Years)"
                    type="number"
                    description="How often (in years) the reinvestment occurs"
                  />

                  {/* Amount Type Radio Group */}
                  <div className="space-y-3">
                    <Label>Amount Type</Label>
                    <RadioGroup
                      value={amountType}
                      onValueChange={(value) =>
                        autoForm.setValue(
                          "amountType",
                          value as "fixed" | "percentage",
                        )
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed" className="font-normal">
                          Fixed Amount (SAR)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="percentage" />
                        <Label htmlFor="percentage" className="font-normal">
                          Percentage of Revenue
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Conditional Input based on amount type */}
                  {amountType === "fixed" ? (
                    <InputField
                      name="fixedAmount"
                      label="Fixed Amount"
                      type="number"
                      suffix="M SAR"
                      description="Fixed SAR amount to invest each cycle"
                    />
                  ) : (
                    <InputField
                      name="percentageOfRevenue"
                      label="Percentage of Revenue"
                      type="number"
                      suffix="%"
                      description="Percentage of annual revenue to invest each cycle"
                    />
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveAutoReinvestment}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Saving..." : "Save Auto-Reinvestment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Manual CapEx Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manual CapEx Items</CardTitle>
              <CardDescription>
                Add specific one-time CapEx investments for individual years
              </CardDescription>
            </div>
            <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <AlertDialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <Form {...manualForm}>
                  <form onSubmit={handleAddManualItem}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Add Manual CapEx Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Enter the details for a specific CapEx investment
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                      <InputField
                        name="year"
                        label="Year"
                        type="number"
                        description="Year when investment occurs (2025-2053)"
                      />
                      <InputField
                        name="name"
                        label="Item Name"
                        type="text"
                        description="Description of the investment"
                      />
                      <InputField
                        name="amount"
                        label="Amount"
                        type="number"
                        suffix="M SAR"
                        description="Investment amount in Millions SAR"
                      />
                      <InputField
                        name="usefulLife"
                        label="Useful Life"
                        type="number"
                        suffix="years"
                        description="Number of years to depreciate over"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel type="button">
                        Cancel
                      </AlertDialogCancel>
                      <Button type="submit">Add Item</Button>
                    </AlertDialogFooter>
                  </form>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">Amount (M SAR)</TableHead>
                <TableHead className="text-right">Useful Life</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">NBV (M SAR)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manualItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No manual CapEx items yet. Click &quot;Add Item&quot; to
                    create one.
                  </TableCell>
                </TableRow>
              ) : (
                manualItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.year}</TableCell>
                    <TableCell>{item.assetName}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatMillions(item.amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {item.usefulLife} years
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.depreciationMethod === "OLD"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.depreciationMethod}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatMillions(item.nbv)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete CapEx Item
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {item.assetName}&quot;? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Depreciation Method Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Depreciation Methods
          </CardTitle>
          <CardDescription>
            Understanding OLD vs NEW depreciation methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  OLD
                </span>
                <h4 className="font-semibold">OLD Assets (Pre-2028)</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Assets purchased before the dynamic period (2028+) use the OLD
                depreciation method with historical patterns.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  NEW
                </span>
                <h4 className="font-semibold">NEW Assets (2028+)</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Assets purchased during the dynamic period (2028+) use the NEW
                depreciation method with straight-line depreciation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CapExModulePage() {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <CapExModulePageContent />
    </ProtectedRoute>
  );
}
