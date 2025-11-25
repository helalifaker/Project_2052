"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, GitCompare, History, Filter } from "lucide-react";
import { StatusBadge } from "@/components/negotiations/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { ProposalOrigin, ProposalStatus } from "@prisma/client";

type NegotiationThread = {
  developer: string;
  property: string;
  totalRounds: number;
  currentRound: number;
  latestVersion?: string | null;
  latestStatus: ProposalStatus;
  latestOrigin: ProposalOrigin;
  lastActivity: string;
  proposals: Array<{
    id: string;
    version: string | null;
    origin: ProposalOrigin;
    status: ProposalStatus;
    negotiationRound: number;
    updatedAt: string;
  }>;
};

export default function NegotiationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<NegotiationThread[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/negotiations?status=active");
        const json = await res.json();
        setThreads(json.negotiations || []);
      } catch (error) {
        console.error("Failed to load negotiations", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight">Negotiations</h1>
          <p className="text-muted-foreground">
            Threaded view of active negotiations (offers & counters).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Active
          </Button>
          <Button onClick={() => router.push("/proposals/new")}>
            <GitCompare className="h-4 w-4 mr-2" />
            New Offer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {threads.map((thread) => (
          <Card
            key={`${thread.developer}-${thread.property}`}
            className="shadow-sm"
          >
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {thread.property} — {thread.developer}
                </CardTitle>
                <StatusBadge
                  status={thread.latestStatus}
                  origin={thread.latestOrigin}
                />
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>
                  Round {thread.currentRound} • Version{" "}
                  {thread.latestVersion || "?"}
                </span>
                <span>
                  Updated{" "}
                  {formatDistanceToNow(new Date(thread.lastActivity), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="h-4 w-4" />
                <span>{thread.proposals.length} versions in thread</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {thread.proposals.slice(0, 3).map((p) => (
                  <StatusBadge key={p.id} status={p.status} origin={p.origin} />
                ))}
                {thread.proposals.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{thread.proposals.length - 3} more
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/negotiations/${encodeURIComponent(thread.developer)}/${encodeURIComponent(
                        thread.property,
                      )}`,
                    )
                  }
                >
                  View Timeline
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push("/proposals/new")}
                >
                  Add Counter
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {threads.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No negotiations yet. Start by creating an offer.
        </div>
      )}
    </div>
  );
}
