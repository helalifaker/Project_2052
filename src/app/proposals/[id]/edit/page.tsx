"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { InputField } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { useProposalForm } from "@/lib/hooks/useProposalForm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  developer: z.string().optional(),
  property: z.string().optional(),
  version: z.string().optional(),
  status: z.string().optional(),
});

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  const [loading, setLoading] = useState(true);

  const form = useProposalForm(schema, {
    name: "",
    developer: "",
    property: "",
    version: "",
    status: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/proposals/${proposalId}`);
        if (!res.ok) throw new Error("Failed to load proposal");
        const data = await res.json();
        form.reset({
          name: data.name,
          developer: data.developer || "",
          property: data.property || "",
          version: data.version || "",
          status: data.status || "",
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load proposal");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [proposalId, form, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to save proposal");
      toast.success("Proposal updated");
      router.push(`/proposals/${proposalId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save proposal");
    }
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Proposal</h1>
          <p className="text-muted-foreground">
            Update basic proposal metadata.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <InputField name="name" label="Name" />
              <InputField name="developer" label="Developer" />
              <InputField name="property" label="Property" />
              <InputField name="version" label="Version" />
              <InputField name="status" label="Status" />
              <div className="flex justify-end gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
