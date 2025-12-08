"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link2, Loader2, Search, FileText } from "lucide-react";
import {
  ProposalOrigin,
  ProposalStatus,
  ProposalPurpose,
} from "@/lib/types/roles";
import { cn } from "@/lib/utils";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./StatusBadge";

/**
 * Proposal search result
 */
interface ProposalOption {
  id: string;
  name: string;
  rentModel: string;
  status: ProposalStatus;
  origin: ProposalOrigin;
  purpose: ProposalPurpose;
  createdAt: string;
  negotiationId: string | null;
}

/**
 * Validation schema for linking a proposal
 */
const linkProposalFormSchema = z.object({
  proposalId: z.string().uuid("Please select a proposal"),
  origin: z.enum(["OUR_OFFER", "THEIR_COUNTER"] as const),
  offerNumber: z.number().int().positive().optional(),
});

type LinkProposalFormData = z.infer<typeof linkProposalFormSchema>;

interface LinkProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negotiationId: string;
  currentOfferCount: number;
  onSuccess?: (proposal: {
    id: string;
    name: string;
    offerNumber: number;
  }) => void;
}

/**
 * Dialog for linking an existing proposal to a negotiation
 *
 * Shows proposals that are not yet linked to any negotiation
 * (purpose = SIMULATION or no negotiationId)
 */
export function LinkProposalDialog({
  open,
  onOpenChange,
  negotiationId,
  currentOfferCount,
  onSuccess,
}: LinkProposalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [proposals, setProposals] = useState<ProposalOption[]>([]);

  const form = useForm<LinkProposalFormData>({
    resolver: zodResolver(linkProposalFormSchema),
    defaultValues: {
      proposalId: "",
      origin: "OUR_OFFER",
      offerNumber: currentOfferCount + 1,
    },
  });

  // Fetch unlinked proposals when dialog opens
  useEffect(() => {
    if (open) {
      fetchUnlinkedProposals();
      form.reset({
        proposalId: "",
        origin: "OUR_OFFER",
        offerNumber: currentOfferCount + 1,
      });
    }
    // form.reset is stable, no need to track form in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentOfferCount]);

  const fetchUnlinkedProposals = async () => {
    setIsLoading(true);
    try {
      // Fetch proposals that are not linked to any negotiation
      const response = await fetch("/api/proposals?unlinked=true");
      const data = await response.json();

      if (response.ok) {
        // API returns { data: [...], pagination: {...} }
        setProposals(data.data || []);
      } else {
        setError("Failed to load proposals");
      }
    } catch {
      setError("Network error loading proposals");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter proposals by search term
  const filteredProposals = proposals.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (data: LinkProposalFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/negotiations/${negotiationId}/proposals`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposalId: data.proposalId,
            origin: data.origin,
            offerNumber: data.offerNumber,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to link proposal");
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

  const selectedProposal = proposals.find(
    (p) => p.id === form.watch("proposalId"),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Link Existing Proposal
          </DialogTitle>
          <DialogDescription>
            Select a proposal to add to this negotiation timeline.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>

            {/* Proposal selection */}
            <FormField
              control={form.control}
              name="proposalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Proposal</FormLabel>
                  <FormControl>
                    <ScrollArea className="h-[200px] rounded-md border">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full p-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredProposals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                          <FileText className="h-8 w-8 mb-2 opacity-50" />
                          <p>No unlinked proposals found</p>
                          <p className="text-xs mt-1">
                            Create a new proposal first
                          </p>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {filteredProposals.map((proposal) => (
                            <div
                              key={proposal.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                field.value === proposal.id
                                  ? "bg-primary/10 border border-primary"
                                  : "hover:bg-muted",
                              )}
                              onClick={() => field.onChange(proposal.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {proposal.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {proposal.rentModel} •{" "}
                                  {new Date(
                                    proposal.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <StatusBadge
                                status={proposal.status}
                                origin={proposal.origin}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Origin selection */}
            {selectedProposal && (
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
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="OUR_OFFER" id="link_our" />
                          <Label htmlFor="link_our">🟦 Our Offer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="THEIR_COUNTER"
                            id="link_their"
                          />
                          <Label htmlFor="link_their">🟥 Their Counter</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Offer number */}
            {selectedProposal && (
              <FormField
                control={form.control}
                name="offerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                        className="w-24"
                      />
                    </FormControl>
                    <FormDescription>
                      Position in the negotiation timeline
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
              <Button
                type="submit"
                disabled={isSubmitting || !selectedProposal}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Link Proposal
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
