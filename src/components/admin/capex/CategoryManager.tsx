"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Trash2, Edit, FolderTree, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatMillions } from "@/lib/utils/financial";

// Category interface matching NEW API response
export interface CapExCategory {
  id: string;
  type: string;  // CapExCategoryType enum value
  name: string;
  usefulLife: number;  // Years for depreciation
  reinvestFrequency: number | null;  // Years between auto-reinvestments
  reinvestAmount: number | null;  // Amount per reinvestment
  reinvestStartYear: number | null;  // Year when auto-reinvestment begins (e.g., 2029)
  assetCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryManagerProps {
  categories: CapExCategory[];
  onCategoriesChange: () => void;
}

export function CategoryManager({
  categories,
  onCategoriesChange,
}: CategoryManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CapExCategory | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    usefulLife: 10,
    reinvestFrequency: 5,
    reinvestAmount: 0,
    reinvestStartYear: 2028,  // Default to dynamic period start
    autoReinvestEnabled: false,  // Derived from reinvestFrequency !== null
  });

  const resetForm = () => {
    setFormData({
      name: "",
      usefulLife: 10,
      reinvestFrequency: 5,
      reinvestAmount: 0,
      reinvestStartYear: 2028,
      autoReinvestEnabled: false,
    });
  };

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/capex/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          usefulLife: formData.usefulLife,
          reinvestFrequency: formData.autoReinvestEnabled
            ? formData.reinvestFrequency
            : null,
          reinvestAmount: formData.autoReinvestEnabled
            ? formData.reinvestAmount
            : null,
          reinvestStartYear: formData.autoReinvestEnabled
            ? formData.reinvestStartYear
            : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }

      toast.success("Category created successfully");
      setShowAddDialog(false);
      resetForm();
      onCategoriesChange();
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `/api/capex/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            usefulLife: formData.usefulLife,
            reinvestFrequency: formData.autoReinvestEnabled
              ? formData.reinvestFrequency
              : null,
            reinvestAmount: formData.autoReinvestEnabled
              ? formData.reinvestAmount
              : null,
            reinvestStartYear: formData.autoReinvestEnabled
              ? formData.reinvestStartYear
              : null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update category");
      }

      toast.success("Category updated successfully");
      setEditingCategory(null);
      resetForm();
      onCategoriesChange();
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: CapExCategory) => {
    try {
      const response = await fetch(`/api/capex/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete category");
      }

      const result = await response.json();
      toast.success(
        `Category deleted${
          result.unassignedAssets > 0
            ? ` (${result.unassignedAssets} assets unassigned)`
            : ""
        }`
      );
      onCategoriesChange();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  const openEditDialog = (category: CapExCategory) => {
    // Derive autoReinvestEnabled from whether reinvestFrequency has a value
    const hasReinvestment = category.reinvestFrequency !== null;
    setFormData({
      name: category.name,
      usefulLife: category.usefulLife,
      reinvestFrequency: category.reinvestFrequency ?? 5,
      reinvestAmount: category.reinvestAmount ?? 0,
      reinvestStartYear: category.reinvestStartYear ?? 2028,
      autoReinvestEnabled: hasReinvestment,
    });
    setEditingCategory(category);
  };

  const handleToggleAutoReinvest = async (category: CapExCategory) => {
    // Auto-reinvest is enabled when reinvestFrequency is not null
    const isCurrentlyEnabled = category.reinvestFrequency !== null;
    try {
      const response = await fetch(`/api/capex/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Toggle: if enabled, set to null; if disabled, set defaults
          reinvestFrequency: isCurrentlyEnabled ? null : 5,
          reinvestAmount: isCurrentlyEnabled ? null : 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update category");
      }

      onCategoriesChange();
    } catch (error) {
      console.error("Failed to toggle auto-reinvest:", error);
      toast.error("Failed to update category");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Asset Categories
            </CardTitle>
            <CardDescription>
              Configure reinvestment settings per asset category
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Asset Category</DialogTitle>
                <DialogDescription>
                  Create a new asset category with reinvestment settings
                </DialogDescription>
              </DialogHeader>
              <CategoryForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddCategory}
                saving={saving}
                submitLabel="Create Category"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-center">Default Life</TableHead>
              <TableHead className="text-center">Auto-Reinvest</TableHead>
              <TableHead className="text-center">Start Year</TableHead>
              <TableHead className="text-center">Frequency</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Assets</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No categories yet. Click &quot;Add Category&quot; to create
                  one.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => {
                // Derive auto-reinvest state from whether reinvestFrequency is set
                const isAutoReinvestEnabled = category.reinvestFrequency !== null;
                return (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-center font-mono">
                    {category.usefulLife} yrs
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={isAutoReinvestEnabled}
                      onCheckedChange={() => handleToggleAutoReinvest(category)}
                    />
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {isAutoReinvestEnabled
                      ? category.reinvestStartYear ?? 2028
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {isAutoReinvestEnabled && category.reinvestFrequency
                      ? `Every ${category.reinvestFrequency} yrs`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {isAutoReinvestEnabled && category.reinvestAmount
                      ? formatMillions(category.reinvestAmount)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted">
                      {category.assetCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingCategory?.id === category.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingCategory(null);
                            resetForm();
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>
                              Update the category settings
                            </DialogDescription>
                          </DialogHeader>
                          <CategoryForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleEditCategory}
                            saving={saving}
                            submitLabel="Save Changes"
                          />
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;
                              {category.name}&quot;?
                              {category.assetCount > 0 && (
                                <>
                                  {" "}
                                  This will unassign {category.assetCount}{" "}
                                  asset(s) from this category.
                                </>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );})
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Form component for add/edit dialogs
interface CategoryFormProps {
  formData: {
    name: string;
    usefulLife: number;
    reinvestFrequency: number;
    reinvestAmount: number;
    reinvestStartYear: number;  // Year when auto-reinvestment begins
    autoReinvestEnabled: boolean;  // UI-only, derived from reinvestFrequency !== null
  };
  setFormData: (data: CategoryFormProps["formData"]) => void;
  onSubmit: () => void;
  saving: boolean;
  submitLabel: string;
}

function CategoryForm({
  formData,
  setFormData,
  onSubmit,
  saving,
  submitLabel,
}: CategoryFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., IT Equipment"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="usefulLife">Useful Life (Years)</Label>
        <Input
          id="usefulLife"
          type="number"
          min={1}
          max={100}
          value={formData.usefulLife ?? 10}
          onChange={(e) =>
            setFormData({
              ...formData,
              usefulLife: parseInt(e.target.value) || 1,
            })
          }
        />
        <p className="text-xs text-muted-foreground">
          Auto-fills when adding assets in this category
        </p>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="space-y-0.5">
          <Label>Enable Auto-Reinvestment</Label>
          <p className="text-xs text-muted-foreground">
            Automatically reinvest in this category at regular intervals
          </p>
        </div>
        <Switch
          checked={formData.autoReinvestEnabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, autoReinvestEnabled: checked })
          }
        />
      </div>

      {formData.autoReinvestEnabled && (
        <div className="space-y-4 p-3 rounded-lg border bg-muted/30">
          <div className="space-y-2">
            <Label htmlFor="reinvestStartYear">Start Year</Label>
            <Input
              id="reinvestStartYear"
              type="number"
              min={2028}
              max={2053}
              value={formData.reinvestStartYear ?? 2028}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reinvestStartYear: parseInt(e.target.value) || 2028,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Year when auto-reinvestment begins (2028 = dynamic period start)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reinvestFrequency">Reinvestment Frequency</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Every</span>
              <Input
                id="reinvestFrequency"
                type="number"
                min={1}
                max={50}
                className="w-20"
                value={formData.reinvestFrequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reinvestFrequency: parseInt(e.target.value) || 1,
                  })
                }
              />
              <span className="text-sm text-muted-foreground">years</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reinvestAmount">Reinvestment Amount (M SAR)</Label>
            <Input
              id="reinvestAmount"
              type="number"
              min={0}
              step={0.1}
              value={formData.reinvestAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reinvestAmount: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={onSubmit} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}
