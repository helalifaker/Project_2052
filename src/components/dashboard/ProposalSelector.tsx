"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProposalItem {
  proposalId: string;
  proposalName: string;
  developer: string;
}

interface ProposalSelectorProps {
  /** List of available proposals to select from */
  proposals: ProposalItem[];
  /** Currently selected proposal IDs */
  selectedIds: string[];
  /** Maximum number of proposals that can be selected */
  maxProposals: number;
  /** Callback when selection changes */
  onSelectionChange: (ids: string[]) => void;
}

/**
 * ProposalSelector Component
 *
 * A popover-based multi-select component for filtering dashboard charts
 * to display only selected proposals. Enforces a maximum selection limit.
 */
export function ProposalSelector({
  proposals,
  selectedIds,
  maxProposals,
  onSelectionChange,
}: ProposalSelectorProps) {
  const isMaxReached = selectedIds.length >= maxProposals;
  const hasSelection = selectedIds.length > 0;

  // Toggle a single proposal selection
  const handleToggle = useCallback(
    (proposalId: string) => {
      const isSelected = selectedIds.includes(proposalId);

      if (isSelected) {
        // Always allow deselection
        onSelectionChange(selectedIds.filter((id) => id !== proposalId));
      } else if (!isMaxReached) {
        // Only allow selection if under max limit
        onSelectionChange([...selectedIds, proposalId]);
      }
    },
    [selectedIds, isMaxReached, onSelectionChange],
  );

  // Clear all selections
  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  // Select first N proposals (up to max)
  const handleSelectAll = useCallback(() => {
    const idsToSelect = proposals
      .slice(0, maxProposals)
      .map((p) => p.proposalId);
    onSelectionChange(idsToSelect);
  }, [proposals, maxProposals, onSelectionChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasSelection ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>
            Filter
            {hasSelection && ` (${selectedIds.length})`}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Select Proposals</h4>
            <span className="text-xs text-muted-foreground">
              {selectedIds.length}/{proposals.length} selected
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Maximum {maxProposals} proposals for chart clarity
          </p>
        </div>

        {/* Proposal List */}
        <div className="max-h-[240px] overflow-y-auto px-2 py-2">
          {proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No proposals available
            </p>
          ) : (
            <div className="space-y-1">
              {proposals.map((proposal) => {
                const isSelected = selectedIds.includes(proposal.proposalId);
                const isDisabled = !isSelected && isMaxReached;

                return (
                  <label
                    key={proposal.proposalId}
                    className={cn(
                      "flex items-start gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors",
                      isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => handleToggle(proposal.proposalId)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">
                        {proposal.proposalName}
                      </p>
                      {proposal.developer && (
                        <p className="text-xs text-muted-foreground truncate">
                          {proposal.developer}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t px-3 py-2 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={!hasSelection}
            className="text-xs h-7"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            disabled={
              proposals.length <= maxProposals &&
              selectedIds.length === proposals.length
            }
            className="text-xs h-7"
          >
            <CheckSquare className="h-3 w-3 mr-1" />
            Select First {Math.min(maxProposals, proposals.length)}
          </Button>
        </div>

        {/* Max reached warning */}
        {isMaxReached && (
          <div className="px-3 pb-2">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Maximum {maxProposals} proposals selected. Deselect one to add
              another.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
