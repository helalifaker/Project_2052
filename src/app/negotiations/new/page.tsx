"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, MapPin, FileText, Loader2, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

/**
 * Validation schema for creating a negotiation
 */
const createNegotiationSchema = z.object({
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

type FormData = z.infer<typeof createNegotiationSchema>;

/**
 * Page for creating a new Negotiation entity
 *
 * Creates a negotiation container that proposals can be linked to.
 * After creation, redirects to the negotiation detail page.
 */
export default function NewNegotiationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(createNegotiationSchema),
    defaultValues: {
      developer: "",
      property: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
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
            `A negotiation already exists for ${data.developer} - ${data.property}. ` +
              "Would you like to view it instead?",
          );
        } else {
          setError(result.error || "Failed to create negotiation");
        }
        return;
      }

      // Success - redirect to the new negotiation's detail page
      router.push(`/negotiations/detail/${result.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Negotiations", href: "/negotiations" },
        { label: "New" },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/negotiations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Negotiations
        </Link>

        {/* Main form card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Start New Negotiation
            </CardTitle>
            <CardDescription>
              Create a negotiation container to track offers with a developer
              for a specific property. You can then add proposals to this
              negotiation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
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
                          rows={4}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Internal notes for tracking negotiation context.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
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
                      "Create Negotiation"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Help text */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>A negotiation container will be created</li>
              <li>You can then add proposals to track offers and counters</li>
              <li>
                Each proposal can be marked as &quot;Our Offer&quot; or
                &quot;Their Counter&quot;
              </li>
              <li>The timeline will track the negotiation history</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
