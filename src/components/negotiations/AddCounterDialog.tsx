"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

/**
 * Validation schema for creating a counter-offer
 */
const addCounterFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  origin: z.enum(["OUR_OFFER", "THEIR_COUNTER"] as const),
});

type AddCounterFormData = z.infer<typeof addCounterFormSchema>;

interface AddCounterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negotiationId: string;
  sourceProposalId: string;
  sourceProposalName: string;
  sourceOfferNumber: number | null;
  onSuccess?: (newProposal: {
    id: string;
    name: string;
    offerNumber: number;
  }) => void;
}

/**
 * Dialog for creating a counter-offer
 *
 * Creates a new proposal by duplicating an existing one and linking
 * it to the same negotiation. The new proposal gets the next offer number.
 *
 * Key user requirement: "Add counter should create a new proposal
 * for a duplication of the current one"
 */
export function AddCounterDialog({
  open,
  onOpenChange,
  negotiationId,
  sourceProposalId,
  sourceProposalName,
  sourceOfferNumber,
  onSuccess,
}: AddCounterDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddCounterFormData>({
    resolver: zodResolver(addCounterFormSchema),
    defaultValues: {
      name: "",
      origin: "OUR_OFFER",
    },
  });

  const handleSubmit = async (data: AddCounterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/negotiations/${negotiationId}/counter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceProposalId,
            name: data.name || undefined, // Let API generate name if not provided
            origin: data.origin,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create counter-offer");
        return;
      }

      // Success
      form.reset();
      onOpenChange(false);
      onSuccess?.(result);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchOrigin = form.watch("origin");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Add Counter-Offer
          </DialogTitle>
          <DialogDescription>
            Create a new offer by duplicating{" "}
            <span className="font-medium">
              #{sourceOfferNumber ?? "?"} - {sourceProposalName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Origin selection */}
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Who made this offer?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div
                        className="flex items-center space-x-3 p-3 rounded-lg border transition-colors"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--atelier-chart-proposal-b) 30%, transparent)",
                          backgroundColor:
                            "color-mix(in srgb, var(--atelier-chart-proposal-b) 8%, transparent)",
                        }}
                      >
                        <RadioGroupItem value="OUR_OFFER" id="our_offer" />
                        <Label
                          htmlFor="our_offer"
                          className="flex-1 cursor-pointer"
                        >
                          <span className="font-medium inline-flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  "var(--atelier-chart-proposal-b)",
                              }}
                            />
                            Our Offer
                          </span>
                          <p className="text-sm text-muted-foreground">
                            We prepared this proposal
                          </p>
                        </Label>
                      </div>
                      <div
                        className="flex items-center space-x-3 p-3 rounded-lg border transition-colors"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--accent-gold) 30%, transparent)",
                          backgroundColor: "var(--atelier-craft-gold-soft)",
                        }}
                      >
                        <RadioGroupItem
                          value="THEIR_COUNTER"
                          id="their_counter"
                        />
                        <Label
                          htmlFor="their_counter"
                          className="flex-1 cursor-pointer"
                        >
                          <span className="font-medium inline-flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: "var(--accent-gold)" }}
                            />
                            Their Counter
                          </span>
                          <p className="text-sm text-muted-foreground">
                            We received this proposal from them
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom name (optional) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`e.g., ${sourceProposalName} - Counter ${(sourceOfferNumber ?? 0) + 1}`}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty to auto-generate: &quot;
                    {watchOrigin === "OUR_OFFER"
                      ? `Our Offer #${(sourceOfferNumber ?? 0) + 1}`
                      : `Their Counter #${(sourceOfferNumber ?? 0) + 1}`}
                    &quot;
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info box */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">What happens:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  All parameters from #{sourceOfferNumber ?? "?"} will be copied
                </li>
                <li>
                  New offer will be assigned #{(sourceOfferNumber ?? 0) + 1}
                </li>
                <li>You can edit the new proposal afterwards</li>
              </ul>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Create Counter
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
