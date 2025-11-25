"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/negotiations/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { ProposalOrigin, ProposalStatus } from "@prisma/client";
import { formatMillions } from "@/lib/utils/financial";

type TimelineEntry = {
  id: string;
  version: string | null;
  origin: ProposalOrigin;
  status: ProposalStatus;
  negotiationRound: number;
  summary: string;
  updatedAt: string;
  metrics?: {
    totalRent?: number;
    npv?: number;
  };
};

export default function NegotiationTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const developer = decodeURIComponent(params.developer as string);
  const property = decodeURIComponent(params.property as string);

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/negotiations/${encodeURIComponent(developer)}/${encodeURIComponent(
            property,
          )}/timeline`,
        );
        const json = await res.json();
        setEntries(json.timeline || []);
      } catch (error) {
        console.error("Failed to load timeline", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [developer, property]);

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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {property} — {developer}
          </h1>
          <p className="text-muted-foreground">
            Negotiation timeline and versions.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Round {entry.negotiationRound} •{" "}
                  {entry.version || "Version ?"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{entry.summary}</p>
              </div>
              <StatusBadge status={entry.status} origin={entry.origin} />
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  <span>
                    Updated{" "}
                    {formatDistanceToNow(new Date(entry.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/proposals/${entry.id}`)}
                >
                  View Proposal
                </Button>
              </div>
              {entry.metrics &&
                (entry.metrics.totalRent !== undefined ||
                  entry.metrics.npv !== undefined) && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-foreground">
                    {entry.metrics.totalRent !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Rent (25Y):
                        </span>
                        <span className="font-mono font-semibold">
                          {formatMillions(entry.metrics.totalRent)}
                        </span>
                      </div>
                    )}
                    {entry.metrics.npv !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NPV:</span>
                        <span className="font-mono font-semibold">
                          {formatMillions(entry.metrics.npv)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
