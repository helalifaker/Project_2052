"use client";

/**
 * State Components Showcase
 *
 * Visual demonstration of all state components.
 * Use this file as a reference for implementing states in your pages.
 *
 * To view: Import and render in a page component
 *
 * @example
 * ```tsx
 * import StateShowcase from '@/components/states/showcase';
 *
 * export default function ShowcasePage() {
 *   return <StateShowcase />;
 * }
 * ```
 */

import { useState } from "react";
import {
  PageSkeleton,
  EmptyState,
  ErrorState,
  ProgressIndicator,
  ProgressBar,
  SkeletonBlocks,
} from "./index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react";

export default function StateShowcase() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="container mx-auto p-8 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          State Components Showcase
        </h1>
        <p className="text-lg text-muted-foreground">
          Week 2 UI/UX Transformation - Loading & Error States
        </p>
      </div>

      <Tabs defaultValue="skeleton" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skeleton">Skeletons</TabsTrigger>
          <TabsTrigger value="empty">Empty States</TabsTrigger>
          <TabsTrigger value="error">Error States</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* ============================================================
            1. PAGE SKELETON SHOWCASE
            ============================================================ */}
        <TabsContent value="skeleton" className="space-y-8 mt-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Page Skeletons</h2>

            {/* Dashboard Skeleton */}
            <div className="mb-12">
              <h3 className="text-lg font-medium mb-2">Dashboard Variant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                KPI cards grid + chart placeholders
              </p>
              <div className="border rounded-lg p-6 bg-muted/20">
                <PageSkeleton variant="dashboard" />
              </div>
            </div>

            {/* Detail Skeleton */}
            <div className="mb-12">
              <h3 className="text-lg font-medium mb-2">Detail Variant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Header + tabs + content sections
              </p>
              <div className="border rounded-lg p-6 bg-muted/20">
                <PageSkeleton variant="detail" />
              </div>
            </div>

            {/* List Skeleton */}
            <div className="mb-12">
              <h3 className="text-lg font-medium mb-2">List Variant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Table with rows and pagination
              </p>
              <div className="border rounded-lg p-6 bg-muted/20">
                <PageSkeleton variant="list" />
              </div>
            </div>

            {/* Custom Skeleton Blocks */}
            <div>
              <h3 className="text-lg font-medium mb-2">Custom Skeleton Blocks</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build custom layouts with SkeletonBlocks
              </p>
              <div className="border rounded-lg p-6 bg-muted/20 space-y-6">
                <SkeletonBlocks.Chart />
                <div className="grid grid-cols-2 gap-6">
                  <SkeletonBlocks.Chart />
                  <SkeletonBlocks.Table rows={4} columns={3} />
                </div>
                <SkeletonBlocks.Text lines={5} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            2. EMPTY STATE SHOWCASE
            ============================================================ */}
        <TabsContent value="empty" className="space-y-8 mt-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Empty States</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Default Variant */}
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Default Variant
                </h3>
                <EmptyState
                  variant="default"
                  title="No data available"
                  description="There's nothing here yet"
                  size="compact"
                />
              </Card>

              {/* Search Variant */}
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Search Variant
                </h3>
                <EmptyState
                  variant="search"
                  title="No results found"
                  description="Try adjusting your search filters"
                  size="compact"
                />
              </Card>

              {/* Folder Variant with Action */}
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Folder Variant with Action
                </h3>
                <EmptyState
                  variant="folder"
                  title="No proposals yet"
                  description="Create your first lease proposal to get started"
                  action={{
                    label: "Create Proposal",
                    onClick: () => alert("Create clicked!"),
                  }}
                  size="compact"
                />
              </Card>

              {/* Custom Icon with Secondary Action */}
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Custom Icon with Secondary Action
                </h3>
                <EmptyState
                  icon={Database}
                  title="No historical data"
                  description="Import your 2023-2024 financial data"
                  action={{
                    label: "Import Data",
                    onClick: () => alert("Import clicked!"),
                  }}
                  secondaryAction={{
                    label: "Learn More",
                    onClick: () => alert("Learn more clicked!"),
                  }}
                  size="compact"
                />
              </Card>
            </div>

            {/* Size Variants */}
            <div className="mt-12 space-y-6">
              <h3 className="text-lg font-medium">Size Variants</h3>

              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    Compact
                  </h4>
                  <EmptyState
                    variant="inbox"
                    title="Compact size"
                    description="Minimal spacing for inline use"
                    size="compact"
                  />
                </Card>

                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    Default
                  </h4>
                  <EmptyState
                    variant="inbox"
                    title="Default size"
                    description="Standard spacing for most use cases"
                    size="default"
                  />
                </Card>

                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    Spacious
                  </h4>
                  <EmptyState
                    variant="inbox"
                    title="Spacious size"
                    description="Maximum spacing for dedicated empty pages"
                    size="spacious"
                  />
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            3. ERROR STATE SHOWCASE
            ============================================================ */}
        <TabsContent value="error" className="space-y-8 mt-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Error States</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Error */}
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Basic Error with Retry
                </h3>
                <ErrorState
                  error="Failed to load data"
                  reset={() => alert("Retry clicked!")}
                  size="compact"
                />
              </Card>

              {/* Custom Error */}
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Custom Error Message
                </h3>
                <ErrorState
                  title="Failed to save changes"
                  description="Your changes could not be saved. Please try again."
                  reset={() => alert("Retry clicked!")}
                  size="compact"
                />
              </Card>

              {/* Error with Navigation */}
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Error with Back Button
                </h3>
                <ErrorState
                  title="Page not found"
                  description="The page you're looking for doesn't exist"
                  showBackButton
                  size="compact"
                />
              </Card>

              {/* Error with Home Button */}
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Error with Home Button
                </h3>
                <ErrorState
                  title="Access denied"
                  description="You don't have permission to access this resource"
                  showHomeButton
                  size="compact"
                />
              </Card>
            </div>

            {/* Full Page Error */}
            <div className="mt-12">
              <h3 className="text-lg font-medium mb-4">Full Page Error</h3>
              <Card className="p-6">
                <ErrorState
                  error={new Error("Critical application error")}
                  reset={() => alert("Retry clicked!")}
                  size="full-page"
                  showBackButton
                  showHomeButton
                  showDetails
                />
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            4. PROGRESS INDICATOR SHOWCASE
            ============================================================ */}
        <TabsContent value="progress" className="space-y-8 mt-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Progress Indicators</h2>

            {/* Interactive Progress */}
            <Card className="p-8 mb-8">
              <h3 className="text-lg font-medium mb-6">
                Interactive Progress (Click Steps)
              </h3>
              <ProgressIndicator
                steps={[
                  { label: "Basics", description: "Proposal details" },
                  { label: "Program", description: "Student & curriculum" },
                  { label: "Financials", description: "Costs & rent" },
                  { label: "Review", description: "Confirm & submit" },
                ]}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
                variant="detailed"
              />
              <div className="mt-8 flex justify-between">
                <Button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                  disabled={currentStep === 3}
                >
                  Next
                </Button>
              </div>
            </Card>

            {/* Variants */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Compact Variant
                </h3>
                <ProgressIndicator
                  steps={[
                    { label: "Step 1" },
                    { label: "Step 2" },
                    { label: "Step 3" },
                    { label: "Step 4" },
                  ]}
                  currentStep={1}
                  variant="compact"
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Default Variant
                </h3>
                <ProgressIndicator
                  steps={[
                    { label: "Basics" },
                    { label: "Program" },
                    { label: "Review" },
                  ]}
                  currentStep={1}
                  variant="default"
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Detailed Variant
                </h3>
                <ProgressIndicator
                  steps={[
                    { label: "Basics", description: "Enter proposal details" },
                    { label: "Program", description: "Configure curriculum" },
                    { label: "Review", description: "Confirm and submit" },
                  ]}
                  currentStep={1}
                  variant="detailed"
                />
              </Card>
            </div>

            {/* Vertical Orientation */}
            <Card className="p-6 mt-6">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Vertical Orientation
              </h3>
              <div className="max-w-md">
                <ProgressIndicator
                  steps={[
                    { label: "Basics", description: "Proposal details" },
                    { label: "Program", description: "Student setup" },
                    { label: "Review", description: "Confirm" },
                  ]}
                  currentStep={1}
                  orientation="vertical"
                  variant="detailed"
                />
              </div>
            </Card>

            {/* Progress Bar */}
            <Card className="p-6 mt-6">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Progress Bar (Alternative)
              </h3>
              <ProgressBar current={3} total={7} showLabel />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Usage Examples */}
      <div className="mt-16 p-8 bg-muted/30 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Usage Examples</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">Import:</h3>
            <pre className="bg-background p-4 rounded border overflow-x-auto">
              <code>{`import {
  PageSkeleton,
  EmptyState,
  ErrorState,
  ProgressIndicator
} from '@/components/states';`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">Loading State:</h3>
            <pre className="bg-background p-4 rounded border overflow-x-auto">
              <code>{`if (isLoading) return <PageSkeleton variant="dashboard" />;`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">Empty State:</h3>
            <pre className="bg-background p-4 rounded border overflow-x-auto">
              <code>{`if (!data.length) return (
  <EmptyState
    variant="folder"
    title="No proposals yet"
    description="Create your first lease proposal"
    action={{ label: "Create", onClick: handleCreate }}
  />
);`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">Error State:</h3>
            <pre className="bg-background p-4 rounded border overflow-x-auto">
              <code>{`if (error) return <ErrorState error={error} reset={refetch} />;`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
