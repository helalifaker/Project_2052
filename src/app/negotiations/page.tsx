"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, GitCompare, History, Filter } from "lucide-react";
import { StatusBadge } from "@/components/negotiations/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { ProposalOrigin, ProposalStatus } from "@/lib/types/roles";

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
    <DashboardLayout
      breadcrumbs={[{ label: "Negotiations" }]}
      actions={
        <Button onClick={() => router.push("/proposals/new")} size="sm">
          <GitCompare className="h-4 w-4 mr-2" />
          New Offer
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
              Negotiations
            </h1>
            <p className="text-muted-foreground">
              Threaded view of active negotiations (offers & counters).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Active
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {threads.map((thread, index) => {
            const statusColor =
              thread.latestStatus === "ACCEPTED"
                ? "var(--financial-positive)"
                : thread.latestStatus === "REJECTED"
                  ? "var(--financial-negative)"
                  : "var(--executive-accent)";

            const headerGradient =
              thread.latestStatus === "ACCEPTED"
                ? "linear-gradient(to bottom, rgba(16, 185, 129, 0.1), transparent)"
                : thread.latestStatus === "REJECTED"
                  ? "linear-gradient(to bottom, rgba(244, 63, 94, 0.1), transparent)"
                  : "linear-gradient(to bottom, rgba(201, 168, 108, 0.05), transparent)";

            return (
              <Card
                key={`${thread.developer}-${thread.property}`}
                className="group relative overflow-hidden glass-card p-0 hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                </div>

                {/* Header */}
                <div
                  className="relative z-10 px-6 py-4 border-b border-white/5 flex flex-col gap-3 backdrop-blur-[2px]"
                  style={{ background: headerGradient }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-serif font-medium text-foreground group-hover:text-accent-gold transition-colors">
                        {thread.property}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {thread.developer}
                      </div>
                    </div>
                    <StatusBadge
                      status={thread.latestStatus}
                      origin={thread.latestOrigin}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-wider">
                    <span>
                      Round {thread.currentRound} • Ver{" "}
                      {thread.latestVersion || "1.0"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      Updated{" "}
                      {formatDistanceToNow(new Date(thread.lastActivity), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <CardContent className="relative z-10 p-6 space-y-5">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/5">
                    <History className="h-4 w-4 opacity-70" />
                    <span>
                      {thread.proposals.length} versions in this thread
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {thread.proposals.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <StatusBadge status={p.status} origin={p.origin} />
                      </div>
                    ))}
                    {thread.proposals.length > 4 && (
                      <span className="text-[10px] flex items-center px-2 text-muted-foreground bg-white/5 rounded-full">
                        +{thread.proposals.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 border border-white/10 hover:bg-white/5 hover:text-accent-gold transition-colors"
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
                      variant="default"
                      size="sm"
                      className="flex-1 bg-accent-gold/90 hover:bg-accent-gold text-white shadow-lg shadow-accent-gold/20"
                      onClick={() => router.push("/proposals/new")}
                    >
                      Add Counter
                    </Button>
                  </div>
                </CardContent>

                {/* Bottom Accent Line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-current to-transparent"
                  style={{ color: statusColor }}
                />
              </Card>
            );
          })}
        </div>

        {threads.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No negotiations yet. Start by creating an offer.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
