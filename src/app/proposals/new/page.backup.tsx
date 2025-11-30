"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRoleCheck } from "@/lib/hooks/useRoleCheck";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { LivePreview } from "@/components/proposals/wizard/LivePreview";
import { ProgressIndicator } from "@/components/states/ProgressIndicator";
import {
  ExecutiveCard,
  ExecutiveCardContent,
} from "@/components/ui/executive-card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import wizard steps
import { Step1Basics } from "@/components/proposals/wizard/Step1Basics";
import { Step3Enrollment } from "@/components/proposals/wizard/Step3Enrollment";
import { Step4Curriculum } from "@/components/proposals/wizard/Step4Curriculum";
import { Step5RentModel } from "@/components/proposals/wizard/Step5RentModel";
import { Step6OpEx } from "@/components/proposals/wizard/Step6OpEx";
import { Step7Review } from "@/components/proposals/wizard/Step7Review";
import type { ProposalFormData } from "@/components/proposals/wizard/types";

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

export default function NewProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canCreate, loading } = useRoleCheck();

  // All hooks must be called before any conditional returns (React Rules of Hooks)
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(false);
  const [prefillSource, setPrefillSource] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProposalFormData>>({
    // Step 1 Defaults
    rentModel: "",

    // Step 3 Defaults
    frenchCapacity: 1000,
    ibCapacity: 0,
    rampUpFRYear1Percentage: 20, // GAP 20: Default 20% for year 1
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
    frenchProgramEnabled: true, // GAP 3: FR program default
    frenchProgramPercentage: 100,
    ibProgramEnabled: false, // GAP 3: IB program optional
    ibProgramPercentage: 0,
    frenchBaseTuition2028: 30000,
    ibBaseTuition2028: 45000,
    ibStartYear: 2028,
    frenchTuitionGrowthRate: 3,
    frenchTuitionGrowthFrequency: 1,
    ibTuitionGrowthRate: 3,
    ibTuitionGrowthFrequency: 1,

    // Step 6 Defaults (GAP 20)
    otherOpexPercent: 10, // 10% default
    studentsPerTeacher: 14,
    studentsPerNonTeacher: 50,
    avgTeacherSalary: 60000,
    avgAdminSalary: 50000,
    cpiRate: 3,
    cpiFrequency: 1,
  });

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
        toast.error("Failed to load proposal data");
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

  const activeSteps = wizardSteps;

  // Validate step data before navigation
  const validateStep = (stepIndex: number): boolean => {
    const step = activeSteps[stepIndex];

    switch (step.id) {
      case "basics":
        return !!(
          formData.developerName &&
          formData.rentModel &&
          formData.contractPeriodYears
        );
      case "enrollment":
        return !!(
          formData.frenchCapacity !== undefined &&
          formData.ibCapacity !== undefined
        );
      case "curriculum":
        return !!(
          formData.frenchProgramEnabled !== undefined ||
          formData.ibProgramEnabled !== undefined
        );
      case "rentModel":
        if (formData.rentModel === "Fixed") {
          return !!formData.baseRent;
        }
        if (formData.rentModel === "RevShare") {
          return formData.revenueSharePercent !== undefined;
        }
        if (formData.rentModel === "Partner") {
          return !!(
            formData.partnerLandSize &&
            formData.partnerLandPricePerSqm &&
            formData.partnerBuaSize &&
            formData.partnerConstructionCostPerSqm
          );
        }
        return true;
      case "opex":
        return !!(
          formData.studentsPerTeacher && formData.otherOpexPercent !== undefined
        );
      case "review":
        return true; // Always valid
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < activeSteps.length - 1) {
      // Mark current step as completed if valid
      if (validateStep(currentStep)) {
        setCompletedSteps((prev) => new Set(prev).add(currentStep));
        setCurrentStep(currentStep + 1);
      } else {
        toast.error("Please complete all required fields before continuing");
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to previous steps or the next immediate step
    if (stepIndex < currentStep) {
      // Going back is always allowed
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1) {
      // Going forward one step requires validation
      handleNext();
    } else if (completedSteps.has(stepIndex)) {
      // Can jump to any completed step
      setCurrentStep(stepIndex);
    } else {
      toast.info("Complete the current step to proceed");
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
        console.error("Save draft failed:", res.status, res.statusText, errorData);
        throw new Error(errorData.error || "Failed to save draft");
      }

      const created = await res.json();
      toast.success("Draft saved successfully");
      router.push(`/proposals/${created.id}`);
    } catch (error) {
      console.error("Failed to save draft", error);
      toast.error("Failed to save draft");
    }
  };

  const handleUpdateFormData = (stepData: Partial<ProposalFormData>) => {
    setFormData({ ...formData, ...stepData });
  };

  // Get step summary for completed steps
  const getStepSummary = (stepIndex: number): string | null => {
    const step = activeSteps[stepIndex];
    if (!completedSteps.has(stepIndex)) return null;

    switch (step.id) {
      case "basics":
        return `${formData.developerName || "N/A"} - ${formData.rentModel || "N/A"}`;
      case "enrollment":
        return `${(formData.frenchCapacity || 0) + (formData.ibCapacity || 0)} total capacity`;
      case "curriculum":
        const programs = [];
        if (formData.frenchProgramEnabled) programs.push("French");
        if (formData.ibProgramEnabled) programs.push("IB");
        return programs.length > 0 ? programs.join(" + ") : null;
      case "rentModel":
        if (formData.rentModel === "Fixed") {
          return `${((formData.baseRent || 0) / 1_000_000).toFixed(1)}M SAR base`;
        }
        if (formData.rentModel === "RevShare") {
          return `${formData.revenueSharePercent || 0}% of revenue`;
        }
        if (formData.rentModel === "Partner") {
          return `${(formData.partnerLandSize || 0).toLocaleString()} m² land`;
        }
        return null;
      case "opex":
        return `${formData.studentsPerTeacher || 0}:1 teacher ratio`;
      default:
        return null;
    }
  };

  const renderStep = () => {
    const step = activeSteps[currentStep];

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
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        steps={activeSteps.map((step) => ({
          label: step.title,
          description: step.description,
        }))}
        currentStep={currentStep}
        variant="detailed"
        onStepClick={handleStepClick}
        className="mb-6"
      />

      {/* Step Summaries for Completed Steps */}
      {completedSteps.size > 0 && currentStep < activeSteps.length - 1 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Completed Steps</h3>
          </div>
          <div className="grid gap-2">
            {Array.from(completedSteps)
              .sort((a, b) => a - b)
              .map((stepIndex) => {
                const summary = getStepSummary(stepIndex);
                if (!summary) return null;
                return (
                  <div
                    key={stepIndex}
                    className="flex items-center justify-between text-sm group hover:bg-background/50 rounded px-2 py-1 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {activeSteps[stepIndex].title}:
                      </span>
                      <span className="font-medium">{summary}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(stepIndex)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-auto py-1 px-2"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Pre-fill Indicator Banner */}
      {prefillSource && (
        <Alert>
          <AlertDescription>
            Pre-filled from &quot;{prefillSource}&quot;. Update the fields below to create a new proposal.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Form Steps */}
        <div className="lg:col-span-7 space-y-6">
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
          <LivePreview data={formData} />
        </div>
      </div>
    </div>
  );
}
