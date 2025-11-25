"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { Role } from "@prisma/client";
import {
  Edit,
  Copy,
  Trash2,
  Download,
  TrendingUp,
  DollarSign,
  PiggyBank,
  CreditCard,
} from "lucide-react";
import { formatMillions } from "@/lib/utils/financial";
import { toast } from "sonner";
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

/**
 * Tab 1: Overview
 *
 * Displays:
 * - Key metrics (Total Rent, NPV, EBITDA, Cash, Debt)
 * - Rent trajectory chart (placeholder)
 * - Assumptions summary
 * - Actions (Edit, Duplicate, Delete, Export)
 */

interface ProposalOverviewTabProps {
  proposal: any;
  onUpdate: (updatedProposal: any) => void;
}

export function ProposalOverviewTab({
  proposal,
  onUpdate,
}: ProposalOverviewTabProps) {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [deleting, setDeleting] = useState(false);

  // Check if user can edit/delete (PLANNER or ADMIN)
  const canEdit = hasRole([Role.ADMIN, Role.PLANNER]);
  const canDelete = hasRole([Role.ADMIN, Role.PLANNER]);

  // Extract key metrics from proposal.metrics
  const metrics = proposal.metrics || {};
  const totalRent = metrics.totalRent || 0;
  const npv = metrics.npv || 0;
  const totalEbitda = metrics.totalEbitda || 0;
  const finalCash = metrics.finalCash || 0;
  const maxDebt = metrics.maxDebt || 0;

  // Handle duplicate
  const handleDuplicate = async () => {
    try {
      toast.info("Duplicating proposal...");

      const response = await fetch(`/api/proposals/${proposal.id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate proposal");
      }

      const newProposal = await response.json();
      toast.success("Proposal duplicated successfully");
      router.push(`/proposals/${newProposal.id}`);
    } catch (error) {
      console.error("Error duplicating proposal:", error);
      toast.error("Failed to duplicate proposal");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete proposal");
      }

      toast.success("Proposal deleted successfully");
      router.push("/proposals");
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast.error("Failed to delete proposal");
      setDeleting(false);
    }
  };

  // Handle export
  const handleExportExcel = async () => {
    try {
      toast.info("Generating Excel export...");

      const response = await fetch(
        `/api/proposals/${proposal.id}/export/excel`,
      );

      if (!response.ok) {
        throw new Error("Failed to generate Excel export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposal.developer}_${proposal.rentModel}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel export downloaded");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Generating PDF export...");

      const response = await fetch(`/api/proposals/${proposal.id}/export/pdf`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposal.developer}_${proposal.rentModel}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF export downloaded");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export to PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {canEdit && (
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleExportExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Proposal?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  proposal &quot;{proposal.name}&quot; and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Rent (30 Years)
              </p>
              <p className="text-2xl font-bold mt-2">
                {formatMillions(totalRent)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Net Present Value
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  npv >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatMillions(npv)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total EBITDA
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  totalEbitda >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatMillions(totalEbitda)}
              </p>
            </div>
            <PiggyBank className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Final Cash Balance
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  finalCash >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatMillions(finalCash)}
              </p>
            </div>
            <PiggyBank className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Max Debt
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  maxDebt <= 0 ? "text-green-600" : "text-orange-600"
                }`}
              >
                {formatMillions(maxDebt)}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Rent Trajectory Chart Placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Rent Trajectory (30 Years)
        </h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground">
          Rent trajectory visualization coming in the next build. Use the
          comparison view to review rent paths meanwhile.
        </div>
      </Card>

      {/* Assumptions Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Key Assumptions</h3>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Rent Model:</span>
            <span className="font-semibold">{proposal.rentModel}</span>
          </div>
          {proposal.developer && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Developer:</span>
              <span className="font-semibold">{proposal.developer}</span>
            </div>
          )}
          {proposal.enrollment && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Total Capacity:</span>
              <span className="font-semibold">
                {(proposal.enrollment.frenchCapacity ?? 0) +
                  (proposal.enrollment.ibCapacity ?? 0) ||
                  proposal.enrollment.capacity ||
                  proposal.enrollment.totalCapacity ||
                  "N/A"}{" "}
                students
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Other OpEx:</span>
            <span className="font-semibold">
              {(Number(proposal.otherOpex) * 100).toFixed(1)}% of revenue
            </span>
          </div>
          {proposal.calculatedAt && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Last Calculated:</span>
              <span className="font-semibold">
                {new Date(proposal.calculatedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
