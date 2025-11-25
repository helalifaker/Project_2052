"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

// Import wizard steps
import { Step1Basics } from "@/components/proposals/wizard/Step1Basics";
import { Step2Transition } from "@/components/proposals/wizard/Step2Transition";
import { Step3Enrollment } from "@/components/proposals/wizard/Step3Enrollment";
import { Step4Curriculum } from "@/components/proposals/wizard/Step4Curriculum";
import { Step5RentModel } from "@/components/proposals/wizard/Step5RentModel";
import { Step6OpEx } from "@/components/proposals/wizard/Step6OpEx";
import { Step7Review } from "@/components/proposals/wizard/Step7Review";
import type { ProposalFormData } from "@/components/proposals/wizard/types";

// Wizard steps configuration
const wizardSteps = [
  {
    id: "basics",
    title: "Basics",
    description: "Developer name and rent model",
  },
  {
    id: "transition",
    title: "Transition Period",
    description: "2025-2027 setup",
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
  const [currentStep, setCurrentStep] = useState(0);
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

    // Transition defaults
    transition2025Students: 800,
    transition2025AvgTuition: 30000,
    transition2026Students: 850,
    transition2026AvgTuition: 31500,
    transition2027Students: 900,
    transition2027AvgTuition: 33000,
    transitionRentGrowthPercent: 5,
  });

  const activeSteps = wizardSteps;
  const progress = ((currentStep + 1) / activeSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
      transition: {
        year2025: {
          students: formData.transition2025Students ?? 0,
          avgTuition: formData.transition2025AvgTuition ?? 0,
          rentGrowth: (formData.transitionRentGrowthPercent ?? 0) / 100,
        },
        year2026: {
          students: formData.transition2026Students ?? 0,
          avgTuition: formData.transition2026AvgTuition ?? 0,
          rentGrowth: (formData.transitionRentGrowthPercent ?? 0) / 100,
        },
        year2027: {
          students: formData.transition2027Students ?? 0,
          avgTuition: formData.transition2027AvgTuition ?? 0,
          rentGrowth: (formData.transitionRentGrowthPercent ?? 0) / 100,
        },
      },
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
      otherOpex: (formData.otherOpexPercent ?? 10) / 100,
      calculatedAt: null,
    };

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save draft");
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
      case "transition":
        return (
          <Step2Transition
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
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

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/proposals")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mt-4">
            Create New Proposal
          </h1>
          <p className="text-muted-foreground mt-2">
            Step {currentStep + 1} of {activeSteps.length}:{" "}
            {activeSteps[currentStep].title}
          </p>
        </div>
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          {activeSteps.map((step, index) => (
            <span
              key={step.id}
              className={
                index === currentStep
                  ? "font-semibold text-foreground"
                  : index < currentStep
                    ? "text-primary"
                    : ""
              }
            >
              {index + 1}. {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>
    </div>
  );
}
