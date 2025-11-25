"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Tab 2: Transition Setup (Edit Mode)
 *
 * Editable form for transition period (2025-2027)
 * Same fields as wizard Step 2
 * Has "Save" and "Recalculate" buttons
 */

interface TransitionSetupTabProps {
  proposal: any;
  onUpdate: (updatedProposal: any) => void;
}

export function TransitionSetupTab({
  proposal,
  onUpdate,
}: TransitionSetupTabProps) {
  const [formData, setFormData] = useState(proposal.transition || {});
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transition: formData }),
      });

      if (!response.ok) {
        throw new Error("Failed to save transition setup");
      }

      const updatedProposal = await response.json();
      onUpdate(updatedProposal);
      toast.success("Transition setup saved");
    } catch (error) {
      console.error("Error saving transition setup:", error);
      toast.error("Failed to save transition setup");
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
        body: JSON.stringify({ transition: formData }),
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
          <h2 className="text-2xl font-bold">Transition Period Setup</h2>
          <p className="text-muted-foreground mt-1">
            Edit transition period assumptions (2025-2027)
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

      {/* Transition Period Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg font-semibold mb-2">
              Editable Form Coming Soon
            </p>
            <p className="text-sm">
              This tab will allow you to edit transition period inputs and
              recalculate the proposal.
            </p>
            <div className="mt-4 text-left max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Current Transition Data:</h4>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
