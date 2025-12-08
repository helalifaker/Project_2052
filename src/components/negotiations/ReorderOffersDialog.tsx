"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, GripVertical, Loader2 } from "lucide-react";
import { ProposalOrigin, ProposalStatus } from "@/lib/types/roles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OfferItem {
  id: string;
  name: string;
  offerNumber: number | null;
  origin: ProposalOrigin;
  status: ProposalStatus;
}

interface ReorderOffersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negotiationId: string;
  offers: OfferItem[];
  onSuccess?: () => void;
}

/**
 * Dialog for manually reordering offer numbers
 *
 * User requirement: "Simple counter, but I need to be able to adjust
 * the order to keep the flow"
 *
 * Allows users to:
 * - Manually assign offer numbers to each proposal
 * - Reorder after uploading offers in wrong sequence
 */
export function ReorderOffersDialog({
  open,
  onOpenChange,
  negotiationId,
  offers,
  onSuccess,
}: ReorderOffersDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerNumbers, setOfferNumbers] = useState<Record<string, number>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize offer numbers when dialog opens
  useEffect(() => {
    if (open) {
      const initial: Record<string, number> = {};
      offers.forEach((offer, index) => {
        initial[offer.id] = offer.offerNumber ?? index + 1;
      });
      setOfferNumbers(initial);
      setError(null);
      setValidationError(null);
    }
  }, [open, offers]);

  // Validate offer numbers
  useEffect(() => {
    const numbers = Object.values(offerNumbers);
    const uniqueNumbers = new Set(numbers);

    if (numbers.length !== uniqueNumbers.size) {
      setValidationError("Each offer must have a unique number");
    } else if (numbers.some((n) => n < 1)) {
      setValidationError("Offer numbers must be positive");
    } else {
      setValidationError(null);
    }
  }, [offerNumbers]);

  const handleNumberChange = (offerId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setOfferNumbers((prev) => ({
        ...prev,
        [offerId]: num,
      }));
    }
  };

  const handleSubmit = async () => {
    if (validationError) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const orderedOffers = Object.entries(offerNumbers).map(
        ([proposalId, offerNumber]) => ({
          proposalId,
          offerNumber,
        }),
      );

      const response = await fetch(
        `/api/negotiations/${negotiationId}/reorder`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offers: orderedOffers }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to reorder offers");
        return;
      }

      // Success
      onOpenChange(false);
      onSuccess?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-assign sequential numbers
  const handleAutoAssign = () => {
    const sorted = [...offers].sort((a, b) => {
      // Sort by current offer number, then by created date
      const aNum = offerNumbers[a.id] ?? 999;
      const bNum = offerNumbers[b.id] ?? 999;
      return aNum - bNum;
    });

    const newNumbers: Record<string, number> = {};
    sorted.forEach((offer, index) => {
      newNumbers[offer.id] = index + 1;
    });
    setOfferNumbers(newNumbers);
  };

  // Sorted offers for display
  const sortedOffers = [...offers].sort((a, b) => {
    const aNum = offerNumbers[a.id] ?? 999;
    const bNum = offerNumbers[b.id] ?? 999;
    return aNum - bNum;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Reorder Offers
          </DialogTitle>
          <DialogDescription>
            Adjust offer numbers to correct the negotiation timeline sequence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auto-assign button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoAssign}
              disabled={isSubmitting}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Auto-assign Sequential
            </Button>
          </div>

          {/* Offers list */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {sortedOffers.map((offer) => {
              const isOurOffer = offer.origin === "OUR_OFFER";
              // Atelier colors for origin indicators
              const rowStyle = {
                borderColor: isOurOffer
                  ? "var(--atelier-chart-proposal-b)"
                  : "var(--accent-gold)",
                backgroundColor: isOurOffer
                  ? "color-mix(in srgb, var(--atelier-chart-proposal-b) 8%, transparent)"
                  : "var(--atelier-craft-gold-soft)",
              };
              const badgeStyle = {
                backgroundColor: isOurOffer
                  ? "color-mix(in srgb, var(--atelier-chart-proposal-b) 15%, transparent)"
                  : "var(--atelier-craft-gold-soft)",
                color: isOurOffer
                  ? "var(--atelier-chart-proposal-b)"
                  : "var(--accent-gold)",
              };
              return (
                <div
                  key={offer.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={rowStyle}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />

                  {/* Offer number input */}
                  <div className="w-16 shrink-0">
                    <Input
                      type="number"
                      min={1}
                      value={offerNumbers[offer.id] ?? ""}
                      onChange={(e) =>
                        handleNumberChange(offer.id, e.target.value)
                      }
                      className="h-8 text-center font-mono"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Origin badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded shrink-0"
                    style={badgeStyle}
                  >
                    {isOurOffer ? "🟦 Us" : "🟨 Them"}
                  </span>

                  {/* Name */}
                  <span className="flex-1 truncate text-sm font-medium">
                    {offer.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Validation error */}
          {validationError && (
            <div
              className="text-sm p-3 rounded-md"
              style={{
                color: "var(--financial-warning)",
                backgroundColor:
                  "color-mix(in srgb, var(--financial-warning) 10%, transparent)",
              }}
            >
              ⚠️ {validationError}
            </div>
          )}

          {/* API error */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !!validationError}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
