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
import { Role } from "@/lib/types/roles";
import { BackButton } from "@/components/navigation/BackButton";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
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
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMillions } from "@/lib/utils/financial";
import {
  CategoryManager,
  type CapExCategory,
} from "@/components/admin/capex/CategoryManager";

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
  categoryId: string | null;
  categoryName: string | null;
}

function CapExModulePageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Manual CapEx Items
  const [manualItems, setManualItems] = useState<ManualCapExItem[]>([]);

  // Categories for per-category reinvestment
  const [categories, setCategories] = useState<CapExCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

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

      // Populate manual items
      if (data.manualItems) {
        setManualItems(data.manualItems);
      }

      // Populate categories for per-category reinvestment
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to load CapEx data:", error);
      toast.error("Failed to load CapEx configuration");
    } finally {
      setLoading(false);
    }
  }, []);

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
          categoryId: selectedCategoryId,
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
      setSelectedCategoryId(null);
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
      {/* Navigation */}
      <div className="space-y-4">
        <BackButton href="/admin" label="Back to Admin" />
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/admin" },
          { label: "CapEx Management" }
        ]} />
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

      {/* Category Manager - per-category reinvestment settings */}
      <CategoryManager
        categories={categories}
        onCategoriesChange={loadCapExData}
      />

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
                      {categories.length > 0 && (
                        <div className="space-y-2">
                          <Label>Category (Optional)</Label>
                          <Select
                            value={selectedCategoryId ?? "none"}
                            onValueChange={(value) =>
                              setSelectedCategoryId(
                                value === "none" ? null : value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No category</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name} ({cat.usefulLife} yrs)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Assigning a category enables per-category tracking
                          </p>
                        </div>
                      )}
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
                <TableHead>Category</TableHead>
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
                    colSpan={8}
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
                    <TableCell>
                      {item.categoryName ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted">
                          {item.categoryName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
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
