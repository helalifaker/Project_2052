"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRoleCheck } from "@/lib/hooks/useRoleCheck";
import { useWizardPersistence } from "@/lib/hooks/useWizardPersistence";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Save, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { LivePreview } from "@/components/proposals/wizard/LivePreview";
import { ErrorState } from "@/components/states/ErrorState";
import { StepSummaryCard } from "@/components/proposals/wizard/StepSummaryCard";
import {
  ExecutiveCard,
  ExecutiveCardContent,
} from "@/components/ui/executive-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import wizard steps
import { Step1Basics } from "@/components/proposals/wizard/Step1Basics";
import { Step3Enrollment } from "@/components/proposals/wizard/Step3Enrollment";
import { Step4Curriculum } from "@/components/proposals/wizard/Step4Curriculum";
import { Step5RentModel } from "@/components/proposals/wizard/Step5RentModel";
import { Step6OpEx } from "@/components/proposals/wizard/Step6OpEx";
import { Step7Review } from "@/components/proposals/wizard/Step7Review";
import type { ProposalFormData } from "@/components/proposals/wizard/types";

/**
 * Error Types for Wizard
 */
type WizardError =
  | { type: "network"; message: string; retry?: () => void }
  | { type: "validation"; message: string; field?: string }
  | { type: "calculation"; message: string; retry?: () => void }
  | { type: "generic"; message: string };

// Wizard steps configuration (6 steps - Transition removed, now admin-only)
const wizardSteps = [
  {
    id: "basics",
    title: "Basics",
    description: "Developer name and rent model",
  },
  {
    id: "enrollment",
    title: "Enrollment",
    description: "Capacity and ramp-up",
  },
  {
    id: "curriculum",
    title: "Curriculum",
    description: "French and IB programs",
  },
  {
    id: "rentModel",
    title: "Rent Model",
    description: "Fixed/RevShare/Partner",
  },
  {
    id: "opex",
    title: "Operating Costs",
    description: "Staff and OpEx",
  },
  {
    id: "review",
    title: "Review & Calculate",
    description: "Summary and calculation",
  },
];

function NewProposalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canCreate, loading } = useRoleCheck();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(false);
  const [prefillSource, setPrefillSource] = useState<string | null>(null);
  const [error, setError] = useState<WizardError | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<ProposalFormData>>({
    // Step 1 Defaults
    rentModel: "",

    // Step 3 Defaults
    frenchCapacity: 1000,
    ibCapacity: 0,
    rampUpFRYear1Percentage: 20,
    rampUpFRYear2Percentage: 40,
    rampUpFRYear3Percentage: 60,
    rampUpFRYear4Percentage: 80,
    rampUpFRYear5Percentage: 100,
    rampUpIBYear1Percentage: 10,
    rampUpIBYear2Percentage: 30,
    rampUpIBYear3Percentage: 50,
    rampUpIBYear4Percentage: 75,
    rampUpIBYear5Percentage: 100,

    // Step 4 Defaults
    frenchProgramEnabled: true,
    frenchProgramPercentage: 100,
    ibProgramEnabled: false,
    ibProgramPercentage: 0,
    frenchBaseTuition2028: 30000,
    ibBaseTuition2028: 45000,
    ibStartYear: 2028,
    frenchTuitionGrowthRate: 3,
    frenchTuitionGrowthFrequency: 1,
    ibTuitionGrowthRate: 3,
    ibTuitionGrowthFrequency: 1,

    // Step 6 Defaults
    otherOpexPercent: 10,
    studentsPerTeacher: 14,
    studentsPerNonTeacher: 50,
    avgTeacherSalary: 60000,
    avgAdminSalary: 50000,
    cpiRate: 3,
    cpiFrequency: 1,
  });

  // Wizard persistence
  const { clearDraft, hasDraft } = useWizardPersistence(
    currentStep,
    formData,
    (state) => {
      setCurrentStep(state.currentStep);
      setFormData(state.formData);
      toast.success("Draft restored successfully");
    },
  );

  // Redirect VIEWER users away from create page
  useEffect(() => {
    if (!loading && !canCreate) {
      router.push("/proposals");
    }
  }, [canCreate, loading, router]);

  // Pre-fill logic: Load proposal data based on URL parameters
  useEffect(() => {
    const prefillId = searchParams.get("prefillId");
    const useRecent = searchParams.get("useRecent") === "true";

    if (!prefillId && !useRecent) return;

    const loadPrefillData = async () => {
      setIsLoadingPrefill(true);
      setError(null);

      try {
        let url: string;
        if (prefillId) {
          url = `/api/proposals/${prefillId}/prefill`;
        } else {
          url = `/api/proposals/recent?includeFormData=true`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("No previous proposals found");
            return;
          }
          if (response.status >= 500) {
            throw new Error("Server error. Please try again later.");
          }
          throw new Error("Failed to load proposal");
        }

        const result = await response.json();
        const prefillData = prefillId ? result.data : result.formData;
        const sourceName = result.name || "previous proposal";

        // Merge pre-fill data with defaults (pre-fill takes precedence)
        setFormData((current) => ({
          ...current,
          ...prefillData,
        }));

        setPrefillSource(sourceName);
        toast.success(`Pre-filled from "${sourceName}"`);
      } catch (error) {
        console.error("Failed to load pre-fill data:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load proposal data";

        setError({
          type: "network",
          message: errorMessage,
          retry: () => {
            setError(null);
            loadPrefillData();
          },
        });

        toast.error(errorMessage);
      } finally {
        setIsLoadingPrefill(false);
      }
    };

    loadPrefillData();
  }, [searchParams]);

  // Early returns AFTER all hooks are called
  if (loading || isLoadingPrefill) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isLoadingPrefill ? "Loading proposal data..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!canCreate) {
    return null; // Will redirect
  }

  // Show error state if there's a critical error
  if (error && error.type === "network") {
    return (
      <div className="container max-w-4xl mx-auto px-6 py-24">
        <ErrorState
          title="Failed to Load Proposal"
          description={error.message}
          reset={error.retry}
          showBackButton
          size="full-page"
        />
      </div>
    );
  }

  const activeSteps = wizardSteps;
  const progress = ((currentStep + 1) / activeSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null); // Clear errors when moving forward
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null); // Clear errors when moving backward
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < activeSteps.length) {
      setCurrentStep(stepIndex);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = async () => {
    const rentModel = (() => {
      switch (formData.rentModel) {
        case "RevShare":
          return "REVSHARE";
        case "Partner":
          return "PARTNER";
        case "Fixed":
        default:
          return "FIXED";
      }
    })();

    const rentParams =
      rentModel === "REVSHARE"
        ? {
            model: "REVSHARE" as const,
            revenueSharePercent: (formData.revenueSharePercent ?? 15) / 100,
          }
        : rentModel === "PARTNER"
          ? {
              model: "PARTNER" as const,
              landSize: formData.partnerLandSize ?? 10000,
              landPricePerSqm: formData.partnerLandPricePerSqm ?? 5000,
              buaSize: formData.partnerBuaSize ?? 20000,
              constructionCostPerSqm:
                formData.partnerConstructionCostPerSqm ?? 2500,
              yieldRate: (formData.partnerYieldRate ?? 9) / 100,
              growthRate: (formData.partnerGrowthRate ?? 2) / 100,
              frequency: formData.partnerFrequency ?? 1,
            }
          : {
              model: "FIXED" as const,
              baseRent2028: formData.baseRent ?? 10_000_000,
              growthRate: (formData.rentGrowthRate ?? 3) / 100,
              frequency: formData.rentFrequency ?? 1,
            };

    const payload = {
      name:
        formData.developerName && formData.rentModel
          ? `${formData.developerName} - ${formData.rentModel} Draft`
          : "Draft Proposal",
      rentModel,
      enrollment: {
        capacity: (formData.frenchCapacity ?? 0) + (formData.ibCapacity ?? 0),
        rampUp: [
          formData.rampUpFRYear1Percentage ?? 0,
          formData.rampUpFRYear2Percentage ?? 0,
          formData.rampUpFRYear3Percentage ?? 0,
          formData.rampUpFRYear4Percentage ?? 0,
          formData.rampUpFRYear5Percentage ?? 0,
        ],
      },
      curriculum: {
        fr: {
          baseTuition2028: formData.frenchBaseTuition2028 ?? 30000,
          growthRate: (formData.frenchTuitionGrowthRate ?? 3) / 100,
          frequency: formData.frenchTuitionGrowthFrequency ?? 1,
        },
        ib: {
          enabled: formData.ibProgramEnabled ?? false,
          baseTuition2028: formData.ibBaseTuition2028 ?? 45000,
          growthRate: (formData.ibTuitionGrowthRate ?? 3) / 100,
          frequency: formData.ibTuitionGrowthFrequency ?? 1,
        },
      },
      staff: {
        cpi: {
          rate: (formData.cpiRate ?? 3) / 100,
          frequency: formData.cpiFrequency ?? 1,
        },
      },
      rentParams,
      otherOpexPercent: (formData.otherOpexPercent ?? 10) / 100,
      calculatedAt: null,
    };

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(
          "Save draft failed:",
          res.status,
          res.statusText,
          errorData,
        );

        if (res.status >= 500) {
          setError({
            type: "network",
            message: "Server error. Please try again later.",
            retry: handleSaveDraft,
          });
          throw new Error("Server error");
        }

        throw new Error(errorData.error || "Failed to save draft");
      }

      const created = await res.json();
      toast.success("Draft saved successfully");

      // Clear localStorage draft after successful save
      clearDraft();

      router.push(`/proposals/${created.id}`);
    } catch (error) {
      console.error("Failed to save draft", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save draft",
      );
    }
  };

  const handleUpdateFormData = (stepData: Partial<ProposalFormData>) => {
    setFormData({ ...formData, ...stepData });
  };

  const handleClearAndRestart = () => {
    clearDraft();
    setFormData({
      rentModel: "",
      frenchCapacity: 1000,
      ibCapacity: 0,
      rampUpFRYear1Percentage: 20,
      rampUpFRYear2Percentage: 40,
      rampUpFRYear3Percentage: 60,
      rampUpFRYear4Percentage: 80,
      rampUpFRYear5Percentage: 100,
      rampUpIBYear1Percentage: 10,
      rampUpIBYear2Percentage: 30,
      rampUpIBYear3Percentage: 50,
      rampUpIBYear4Percentage: 75,
      rampUpIBYear5Percentage: 100,
      frenchProgramEnabled: true,
      frenchProgramPercentage: 100,
      ibProgramEnabled: false,
      ibProgramPercentage: 0,
      frenchBaseTuition2028: 30000,
      ibBaseTuition2028: 45000,
      ibStartYear: 2028,
      frenchTuitionGrowthRate: 3,
      frenchTuitionGrowthFrequency: 1,
      ibTuitionGrowthRate: 3,
      ibTuitionGrowthFrequency: 1,
      otherOpexPercent: 10,
      studentsPerTeacher: 14,
      studentsPerNonTeacher: 50,
      avgTeacherSalary: 60000,
      avgAdminSalary: 50000,
      cpiRate: 3,
      cpiFrequency: 1,
    });
    setCurrentStep(0);
    setPrefillSource(null);
    setError(null);
    setShowClearDialog(false);
    toast.success("Wizard cleared and restarted");
  };

  const renderStep = () => {
    const step = activeSteps[currentStep];

    // Show error state if there's a step-specific error
    if (
      error &&
      (error.type === "validation" || error.type === "calculation")
    ) {
      return (
        <div className="py-8">
          <ErrorState
            title={
              error.type === "validation"
                ? "Validation Error"
                : "Calculation Error"
            }
            description={error.message}
            reset={error.type === "calculation" ? error.retry : undefined}
            size="compact"
          />
          <div className="flex justify-between pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={() => setError(null)}>Try Again</Button>
          </div>
        </div>
      );
    }

    switch (step.id) {
      case "basics":
        return (
          <Step1Basics
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNext}
          />
        );
      case "enrollment":
        return (
          <Step3Enrollment
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case "curriculum":
        return (
          <Step4Curriculum
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case "rentModel":
        return (
          <Step5RentModel
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case "opex":
        return (
          <Step6OpEx
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case "review":
        return <Step7Review data={formData} onPrevious={handlePrevious} />;
      default:
        return <div>Step not implemented</div>;
    }
  };

  const handleLoadRecent = () => {
    router.push("/proposals/new?useRecent=true");
  };

  return (
    <div className="container max-w-[1920px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/proposals")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Proposal
          </h1>
          <p className="text-muted-foreground mt-1">
            Step {currentStep + 1} of {activeSteps.length}:{" "}
            {activeSteps[currentStep].title}
          </p>
          {!prefillSource && (
            <Button
              variant="link"
              size="sm"
              onClick={handleLoadRecent}
              className="mt-1 px-0 h-auto text-sm"
            >
              Load from most recent proposal
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasDraft() && (
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(true)}
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear & Restart
            </Button>
          )}
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 w-full">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground overflow-x-auto pb-2">
          {activeSteps.map((step, index) => (
            <span
              key={step.id}
              className={`whitespace-nowrap px-2 ${
                index === currentStep
                  ? "font-semibold text-foreground"
                  : index < currentStep
                    ? "text-primary"
                    : ""
              }`}
            >
              {index + 1}. {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Auto-save Indicator */}
      {hasDraft() && (
        <Alert className="bg-blue-500/5 border-blue-500/20">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            Your progress is automatically saved. You can safely leave and
            return later.
          </AlertDescription>
        </Alert>
      )}

      {/* Pre-fill Indicator Banner */}
      {prefillSource && (
        <Alert>
          <AlertDescription>
            Pre-filled from &quot;{prefillSource}&quot;. Update the fields below
            to create a new proposal.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Form Steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step Summaries (show completed steps) */}
          {currentStep > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Completed Steps
              </h3>
              {activeSteps.slice(0, currentStep).map((step, index) => (
                <StepSummaryCard
                  key={step.id}
                  stepNumber={index + 1}
                  title={step.title}
                  data={formData}
                  onEdit={() => handleGoToStep(index)}
                  isCurrentStep={false}
                />
              ))}
            </div>
          )}

          {/* Current Step */}
          <ExecutiveCard>
            <ExecutiveCardContent className="pt-8">
              {renderStep()}
            </ExecutiveCardContent>
          </ExecutiveCard>

          {/* Mobile-only Preview Hint */}
          <div className="lg:hidden p-4 bg-muted/20 rounded-lg text-center text-sm text-muted-foreground">
            Scroll down for Live Preview
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <LivePreview data={formData} />
          </div>
        </div>
      </div>

      {/* Clear & Restart Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear and Restart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your progress and restart the wizard from the
              beginning. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAndRestart}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear & Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function NewProposalPageEnhanced() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewProposalPageContent />
    </Suspense>
  );
}
