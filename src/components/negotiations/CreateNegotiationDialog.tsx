"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building2, MapPin, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";

/**
 * Validation schema for creating a negotiation
 */
const createNegotiationFormSchema = z.object({
  developer: z
    .string()
    .min(1, "Developer name is required")
    .max(255, "Developer name too long"),
  property: z
    .string()
    .min(1, "Property name is required")
    .max(255, "Property name too long"),
  notes: z.string().max(2000, "Notes too long").optional(),
});

type CreateNegotiationFormData = z.infer<typeof createNegotiationFormSchema>;

interface CreateNegotiationDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (negotiation: {
    id: string;
    developer: string;
    property: string;
  }) => void;
}

/**
 * Dialog for creating a new Negotiation entity
 *
 * Creates a negotiation container that proposals can be linked to.
 * Enforces unique developer+property combination.
 */
export function CreateNegotiationDialog({
  trigger,
  onSuccess,
}: CreateNegotiationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateNegotiationFormData>({
    resolver: zodResolver(createNegotiationFormSchema),
    defaultValues: {
      developer: "",
      property: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: CreateNegotiationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/negotiations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(
            "A negotiation already exists for this developer and property.",
          );
        } else {
          setError(result.error || "Failed to create negotiation");
        }
        return;
      }

      // Success
      form.reset();
      setOpen(false);
      onSuccess?.(result);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Negotiation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Start New Negotiation
          </DialogTitle>
          <DialogDescription>
            Create a negotiation container to track offers with a developer for
            a specific property.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Developer field */}
            <FormField
              control={form.control}
              name="developer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Developer / Landlord
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Olayan Group"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The company or entity you are negotiating with.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property field */}
            <FormField
              control={form.control}
              name="property"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Property / Site
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., King Fahd Road Campus"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The specific property or location for this negotiation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any initial notes about this negotiation..."
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                onClick={() => setOpen(false)}
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
                    <Plus className="h-4 w-4 mr-2" />
                    Create Negotiation
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
