"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { formatMillions } from "@/lib/utils/financial";

type ProposalSummary = {
  id: string;
  name: string;
  developer: string | null;
  rentModel: string;
  metrics?: {
    totalRent?: number;
    npv?: number;
    totalEbitda?: number;
    finalCash?: number;
  };
};

function ProposalCompareContent() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedIds = params.getAll("ids");

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/proposals?includeMetrics=true");
        const data = await res.json();
        const all: ProposalSummary[] = data.proposals || [];
        const filtered =
          selectedIds.length > 0
            ? all.filter((p) => selectedIds.includes(p.id))
            : all.slice(0, 3);
        setProposals(filtered);
      } catch (error) {
        console.error("Failed to load proposals for comparison", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedIds]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Proposal Comparison
          </h1>
          <p className="text-muted-foreground">
            Compare up to three proposals side-by-side (using stored metrics).
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {proposals.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-lg">{p.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {p.developer || "Unknown"} • {p.rentModel}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Rent (25Y)</span>
                <span className="font-mono font-semibold">
                  {formatMillions(p.metrics?.totalRent ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NPV</span>
                <span className="font-mono font-semibold">
                  {formatMillions(p.metrics?.npv ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total EBITDA</span>
                <span className="font-mono font-semibold">
                  {formatMillions(p.metrics?.totalEbitda ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Final Cash</span>
                <span className="font-mono font-semibold">
                  {formatMillions(p.metrics?.finalCash ?? 0)}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/proposals/${p.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {proposals.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          No proposals available for comparison.
        </div>
      )}
    </div>
  );
}

export default function ProposalComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ProposalCompareContent />
    </Suspense>
  );
}
