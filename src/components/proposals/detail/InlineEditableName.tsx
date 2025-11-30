"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InlineEditableNameProps {
  proposalId: string;
  initialName: string;
  status: string;
  canEdit: boolean;
  onNameUpdated: (newName: string) => void;
}

/**
 * InlineEditableName Component
 *
 * Provides inline editing for proposal names with the following features:
 * - Display mode with hover pencil icon (only if canEdit && status === "DRAFT")
 * - Edit mode with input field, save, and cancel buttons
 * - Keyboard shortcuts: Enter to save, Escape to cancel
 * - Auto-recalculation after name change
 * - Validation: non-empty, max 200 characters
 */
export function InlineEditableName({
  proposalId,
  initialName,
  status,
  canEdit,
  onNameUpdated,
}: InlineEditableNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editedName with initialName when it changes
  useEffect(() => {
    setEditedName(initialName);
  }, [initialName]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const isDraft = status === "DRAFT";
  const canEditName = canEdit && isDraft;

  const handleEditClick = () => {
    if (!canEditName) {
      if (!isDraft) {
        toast.error("Cannot edit proposal name. Only DRAFT proposals can be edited.");
      } else {
        toast.error("You don't have permission to edit this proposal.");
      }
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedName(initialName);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmedName = editedName.trim();

    // Validation: non-empty
    if (!trimmedName) {
      toast.error("Proposal name cannot be empty");
      return;
    }

    // Validation: max length
    if (trimmedName.length > 200) {
      toast.error("Proposal name cannot exceed 200 characters");
      return;
    }

    // No changes made - silently exit
    if (trimmedName === initialName) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Step 1: Update proposal name via PATCH
      const patchResponse = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!patchResponse.ok) {
        const errorData = await patchResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update proposal name");
      }

      // Step 2: Trigger recalculation
      const recalcResponse = await fetch(`/api/proposals/${proposalId}/recalculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Partial failure handling: name saved but recalc failed
      if (!recalcResponse.ok) {
        toast.warning(
          "Proposal name updated, but recalculation failed. Please recalculate manually.",
          { duration: 5000 }
        );
        onNameUpdated(trimmedName);
        setIsEditing(false);
        return;
      }

      // Full success
      onNameUpdated(trimmedName);
      toast.success("Proposal name updated and recalculated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating proposal name:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update proposal name"
      );
      // Stay in edit mode on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSaving) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape" && !isSaving) {
      e.preventDefault();
      handleCancel();
    }
  };

  // Display Mode
  if (!isEditing) {
    return (
      <div
        className="group flex items-center gap-2 cursor-pointer"
        onClick={handleEditClick}
      >
        <h1 className="text-3xl font-bold">{initialName}</h1>
        {canEditName && (
          <Pencil className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        )}
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        type="text"
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        maxLength={200}
        className="text-3xl font-bold h-12 px-3"
        placeholder="Enter proposal name"
      />
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="h-12 px-4"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCancel}
        disabled={isSaving}
        className="h-12 px-4"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
