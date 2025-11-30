import Link from "next/link";
import { Home, FileText, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Premium 404 Not Found Page
 *
 * Executive luxury aesthetic with helpful navigation options.
 *
 * Features:
 * - Copper accent primary CTA
 * - Multiple navigation options (Dashboard, Proposals, Back)
 * - Subtle fade-in animation
 * - Premium typography with light weights
 * - Helpful context and suggestions
 * - Professional, calming error messaging
 *
 * Design Details:
 * - Sahara Twilight theme integration
 * - Copper (--copper-700) for primary action
 * - Font weight 300 for executive aesthetic
 * - Generous spacing with premium layout
 * - Smooth hover transitions
 * - Accessible keyboard navigation
 *
 * Performance:
 * - Static generation (no client-side JS)
 * - Optimized for instant loading
 * - Minimal dependencies
 */
export default function NotFound() {
  // In production, could log 404s for analytics
  if (process.env.NODE_ENV === "development") {
    console.log("[404] Page not found - URL:", typeof window !== "undefined" ? window.location.href : "Unknown");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-background to-muted/20 animate-fade-in">
      <Card className="max-w-2xl w-full p-12 shadow-lg">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* 404 Large Display Number */}
          <div className="relative">
            <h1
              className="text-[120px] font-light tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-foreground/20 to-foreground/10 select-none"
              aria-hidden="true"
            >
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search
                className="h-12 w-12 text-muted-foreground/40"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-tight text-foreground">
              Page Not Found
            </h2>
            <p className="text-base font-light text-muted-foreground max-w-md">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
              Let&apos;s get you back on track.
            </p>
          </div>

          {/* Helpful Suggestions */}
          <div className="w-full max-w-md pt-2">
            <p className="text-sm font-light text-muted-foreground/70 mb-4">
              You might want to:
            </p>
            <ul className="text-sm space-y-2 text-left text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-copper-500" aria-hidden="true" />
                <span className="font-light">Check the URL for typos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-copper-500" aria-hidden="true" />
                <span className="font-light">Return to the dashboard for an overview</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-copper-500" aria-hidden="true" />
                <span className="font-light">Browse recent proposals</span>
              </li>
            </ul>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 w-full sm:w-auto">
            {/* Primary CTA - Dashboard (Copper accent) */}
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto gap-2 bg-[hsl(var(--copper-700))] hover:bg-[hsl(var(--copper-900))] text-white font-normal transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Link href="/dashboard">
                <Home className="h-4 w-4" strokeWidth={1.5} />
                Go to Dashboard
              </Link>
            </Button>

            {/* Secondary CTA - Proposals */}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 font-light hover:bg-accent/50 transition-all duration-200"
            >
              <Link href="/proposals">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
                View Proposals
              </Link>
            </Button>

            {/* Tertiary CTA - Go Back */}
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto gap-2 font-light text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <Link href="javascript:history.back()">
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Go Back
              </Link>
            </Button>
          </div>

          {/* Subtle Divider */}
          <div className="w-full max-w-md pt-8">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Support Information */}
          <div className="pt-4">
            <p className="text-sm font-light text-muted-foreground/60">
              Need help?{" "}
              <Link
                href="/dashboard"
                className="text-[hsl(var(--copper-700))] hover:text-[hsl(var(--copper-900))] underline underline-offset-4 decoration-1 transition-colors duration-200"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
