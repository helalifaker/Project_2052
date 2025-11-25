"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Tab 3: Dynamic Setup (Edit Mode)
 *
 * Sub-tabs for:
 * - Enrollment
 * - Curriculum
 * - Rent Model
 * - Operating Expenses
 *
 * Same fields as wizard Steps 3-6
 * Has "Save" and "Recalculate" buttons
 */

interface DynamicSetupTabProps {
  proposal: Record<string, unknown>;
  onUpdate: (updatedProposal: Record<string, unknown>) => void;
}

export function DynamicSetupTab({ proposal, onUpdate }: DynamicSetupTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("enrollment");
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  // Local state for editable fields
  const [formData, setFormData] = useState({
    enrollment: proposal.enrollment || {},
    curriculum: proposal.curriculum || {},
    rentParams: proposal.rentParams || {},
    staff: proposal.staff || {},
    otherOpex: proposal.otherOpex,
  });

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment: formData.enrollment,
          curriculum: formData.curriculum,
          rentParams: formData.rentParams,
          staff: formData.staff,
          otherOpex: formData.otherOpex,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save dynamic setup");
      }

      const updatedProposal = await response.json();
      onUpdate(updatedProposal);
      toast.success("Dynamic setup saved");
    } catch (error) {
      console.error("Error saving dynamic setup:", error);
      toast.error("Failed to save dynamic setup");
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);

      // First save any pending changes
      const saveResponse = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment: formData.enrollment,
          curriculum: formData.curriculum,
          rentParams: formData.rentParams,
          staff: formData.staff,
          otherOpex: formData.otherOpex,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save changes before recalculation");
      }

      // Then recalculate
      const recalcResponse = await fetch(
        `/api/proposals/${proposal.id}/recalculate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!recalcResponse.ok) {
        const error = await recalcResponse.json();
        throw new Error(error.message || "Failed to recalculate");
      }

      const result = await recalcResponse.json();
      onUpdate(result.proposal);
      toast.success("Proposal recalculated successfully");
    } catch (error) {
      console.error("Error recalculating:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to recalculate",
      );
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dynamic Period Setup</h2>
          <p className="text-muted-foreground mt-1">
            Edit enrollment, curriculum, rent, and operating expense assumptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="outline"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${recalculating ? "animate-spin" : ""}`}
            />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="rent">Rent Model</TabsTrigger>
          <TabsTrigger value="opex">Operating Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment">
          <Card className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-semibold mb-2">
                Enrollment Configuration
              </p>
              <p className="text-sm mb-4">
                Edit capacity and ramp-up percentages
              </p>
              <pre className="bg-muted p-4 rounded-md text-xs text-left max-w-md mx-auto overflow-auto">
                {JSON.stringify(proposal.enrollment, null, 2)}
              </pre>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <Card className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-semibold mb-2">
                Curriculum Configuration
              </p>
              <p className="text-sm mb-4">
                Edit French and IB program settings
              </p>
              <pre className="bg-muted p-4 rounded-md text-xs text-left max-w-md mx-auto overflow-auto">
                {JSON.stringify(proposal.curriculum, null, 2)}
              </pre>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rent">
          <Card className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-semibold mb-2">
                Rent Model Parameters
              </p>
              <p className="text-sm mb-4">
                Edit rent model specific parameters
              </p>
              <pre className="bg-muted p-4 rounded-md text-xs text-left max-w-md mx-auto overflow-auto">
                {JSON.stringify(proposal.rentParams, null, 2)}
              </pre>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="opex">
          <Card className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-semibold mb-2">
                Operating Expenses Configuration
              </p>
              <p className="text-sm mb-4">
                Edit staff costs and other operating expenses
              </p>
              <div className="text-left max-w-md mx-auto space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Staff Configuration:</h4>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                    {JSON.stringify(proposal.staff, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Other OpEx:</h4>
                  <p className="text-sm">
                    {(Number(proposal.otherOpex) * 100).toFixed(1)}% of revenue
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
