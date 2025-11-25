import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

export function useProposalForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  defaultValues?: Partial<z.infer<TSchema>>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for zodResolver compatibility with generic types
  const resolver = (zodResolver as any)(schema);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for zodResolver compatibility with generic types
  return useForm<any>({
    resolver,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- defaultValues type inference limitation
    defaultValues: defaultValues as any,
    mode: "onChange",
  });
}

interface Step {
  id: string;
  title: string;
  description?: string;
}

export function useWizardForm<TSchemas extends Record<string, z.ZodTypeAny>>(
  steps: Step[],
  schemas: TSchemas,
  defaultValues?: Partial<{ [K in keyof TSchemas]: z.infer<TSchemas[K]> }>,
) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepId = steps[currentStep].id as keyof TSchemas;
  const currentSchema = schemas[currentStepId];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zodResolver compatibility
  const resolver = (zodResolver as any)(currentSchema);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for zodResolver compatibility with generic types
  const form = useForm<any>({
    resolver,
    defaultValues:
      (defaultValues?.[currentStepId] as
        | z.infer<typeof currentSchema>
        | undefined) ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- defaultValues fallback type
      ({} as any),
    mode: "onChange",
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const isStepComplete = (step: number) => completedSteps.has(step);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return {
    form,
    currentStep,
    currentStepId,
    steps,
    nextStep,
    previousStep,
    goToStep,
    isStepComplete,
    isFirstStep,
    isLastStep,
    progress,
  };
}
