"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  RefreshCw,
  Info,
  DollarSign,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { CombinedProgramTab } from "./CombinedProgramTab";
import { useRoleCheck } from "@/lib/hooks/useRoleCheck";
import {
  ExecutiveCard,
  ExecutiveCardContent,
  ExecutiveCardHeader,
  ExecutiveCardTitle,
} from "@/components/ui/executive-card";

interface EnrollmentData {
  rampUpEnabled: boolean;
  rampUpStartYear: number;
  rampUpEndYear: number;
  steadyStateStudents: number;
  rampUpTargetStudents: number;
  rampPlanPercentages: number[];
  gradeDistribution: number[];
}

interface CurriculumData {
  frenchProgramEnabled: boolean;
  frenchProgramPercentage: number;
  frenchBaseTuition2028: number;
  frenchTuitionGrowthRate: number;
  frenchTuitionGrowthFrequency: number;
  ibProgramEnabled: boolean;
  ibProgramPercentage: number;
  ibBaseTuition2028: number;
  ibStartYear: number;
  ibTuitionGrowthRate: number;
  ibTuitionGrowthFrequency: number;
}

interface StaffData {
  studentsPerTeacher: number;
  studentsPerNonTeacher: number;
  avgTeacherSalary: number;
  avgAdminSalary: number;
  cpiRate: number;
  cpiFrequency: number;
}

interface RentParamsData {
  baseRent?: number;
  rentGrowthRate?: number;
  rentFrequency?: number;
  revenueSharePercent?: number;
  partnerLandSize?: number;
  partnerLandPricePerSqm?: number;
  partnerBuaSize?: number;
  partnerConstructionCostPerSqm?: number;
  partnerYieldRate?: number;
  partnerGrowthRate?: number;
  partnerFrequency?: number;
}

interface DynamicSetupTabProps {
  proposal: {
    id: string;
    rentModel: string;
    enrollment?: EnrollmentData;
    curriculum?: CurriculumData;
    rentParams?: RentParamsData;
    staff?: StaffData;
    otherOpexPercent?: number;
    [key: string]: unknown;
  };
  onUpdate: (updatedProposal: Record<string, unknown>) => void;
}

const DEFAULT_ENROLLMENT: EnrollmentData = {
  rampUpEnabled: true,
  rampUpStartYear: 2028,
  rampUpEndYear: 2032,
  steadyStateStudents: 2000,
  rampUpTargetStudents: 2000,
  rampPlanPercentages: [0.2, 0.4, 0.6, 0.8, 1],
  gradeDistribution: [],
};

const DEFAULT_CURRICULUM: CurriculumData = {
  frenchProgramEnabled: true,
  frenchProgramPercentage: 100,
  frenchBaseTuition2028: 30000,
  frenchTuitionGrowthRate: 3,
  frenchTuitionGrowthFrequency: 1,
  ibProgramEnabled: false,
  ibProgramPercentage: 0,
  ibBaseTuition2028: 45000,
  ibStartYear: 2028,
  ibTuitionGrowthRate: 3,
  ibTuitionGrowthFrequency: 1,
};

const DEFAULT_STAFF: StaffData = {
  studentsPerTeacher: 14,
  studentsPerNonTeacher: 50,
  avgTeacherSalary: 60000,
  avgAdminSalary: 50000,
  cpiRate: 3,
  cpiFrequency: 1,
};

/**
 * Helper to convert Decimal.js or string values to number
 */
const toNumber = (value: unknown, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  // Handle Decimal.js objects (which have toString)
  if (typeof value === "object" && value !== null && "toString" in value) {
    const parsed = parseFloat((value as { toString: () => string }).toString());
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

/**
 * Helper to convert decimal percentages to display percentages
 * If value is between 0 and 1 (inclusive), treat as decimal and multiply by 100
 * Otherwise, assume it's already in percentage format
 */
const toPercent = (value: unknown, defaultValue: number = 0): number => {
  const num = toNumber(value, defaultValue);
  // Handles edge case: 1.0 (100% as decimal) → 100
  return num >= 0 && num <= 1 ? num * 100 : num;
};

/**
 * Parse staff data from proposal, handling Decimal conversions and cpiRate format
 * Note: cpiRate is stored as decimal (0.03) but displayed as percentage (3)
 */
const parseStaffData = (staff: unknown): StaffData => {
  const s = staff as Record<string, unknown> | undefined;
  if (!s) return DEFAULT_STAFF;

  return {
    studentsPerTeacher: toNumber(s.studentsPerTeacher, DEFAULT_STAFF.studentsPerTeacher),
    studentsPerNonTeacher: toNumber(s.studentsPerNonTeacher, DEFAULT_STAFF.studentsPerNonTeacher),
    avgTeacherSalary: toNumber(s.avgTeacherSalary, DEFAULT_STAFF.avgTeacherSalary),
    avgAdminSalary: toNumber(s.avgAdminSalary, DEFAULT_STAFF.avgAdminSalary),
    cpiRate: toPercent(s.cpiRate, 0.03), // Convert decimal to percentage
    cpiFrequency: toNumber(s.cpiFrequency, DEFAULT_STAFF.cpiFrequency),
  };
};

/**
 * Parse curriculum data from proposal, converting decimal percentages to display format
 * Handles both wizard field names (frenchBaseTuition2028) and engine field names (nationalCurriculumFee)
 */
const parseCurriculumData = (curriculum: unknown): CurriculumData => {
  const c = curriculum as Record<string, unknown> | undefined;
  if (!c) return DEFAULT_CURRICULUM;

  return {
    frenchProgramEnabled: Boolean(c.frenchProgramEnabled),
    frenchProgramPercentage: toPercent(c.frenchProgramPercentage, 1), // Convert 1.0 or 100
    // Handle both wizard (frenchBaseTuition2028) and engine (nationalCurriculumFee) field names
    frenchBaseTuition2028: toNumber(
      c.frenchBaseTuition2028 || c.nationalCurriculumFee,
      DEFAULT_CURRICULUM.frenchBaseTuition2028
    ),
    frenchTuitionGrowthRate: toPercent(
      c.frenchTuitionGrowthRate || c.nationalTuitionGrowthRate,
      0.03
    ),
    frenchTuitionGrowthFrequency: toNumber(
      c.frenchTuitionGrowthFrequency || c.nationalTuitionGrowthFrequency,
      DEFAULT_CURRICULUM.frenchTuitionGrowthFrequency
    ),
    ibProgramEnabled: Boolean(c.ibProgramEnabled),
    ibProgramPercentage: toPercent(c.ibProgramPercentage || c.ibStudentPercentage, 0),
    ibBaseTuition2028: toNumber(c.ibBaseTuition2028 || c.ibCurriculumFee, DEFAULT_CURRICULUM.ibBaseTuition2028),
    ibStartYear: toNumber(c.ibStartYear, DEFAULT_CURRICULUM.ibStartYear),
    ibTuitionGrowthRate: toPercent(c.ibTuitionGrowthRate, 0.03),
    ibTuitionGrowthFrequency: toNumber(c.ibTuitionGrowthFrequency, DEFAULT_CURRICULUM.ibTuitionGrowthFrequency),
  };
};

/**
 * Parse rent parameters from proposal, converting decimal percentages to display format
 */
const parseRentParams = (rentParams: unknown): RentParamsData => {
  const r = rentParams as Record<string, unknown> | undefined;
  if (!r) return {};

  return {
    // Fixed rent model
    baseRent: toNumber(r.baseRent),
    rentGrowthRate: toPercent(r.rentGrowthRate), // Convert 0.03 → 3
    rentFrequency: toNumber(r.rentFrequency),
    // Revenue share model
    revenueSharePercent: toPercent(r.revenueSharePercent), // Convert 0.15 → 15
    // Partner investment model
    partnerLandSize: toNumber(r.partnerLandSize || r.landSize), // Handle both formats
    partnerLandPricePerSqm: toNumber(r.partnerLandPricePerSqm || r.landPricePerSqm),
    partnerBuaSize: toNumber(r.partnerBuaSize || r.buaSize),
    partnerConstructionCostPerSqm: toNumber(r.partnerConstructionCostPerSqm || r.constructionCostPerSqm),
    partnerYieldRate: toPercent(r.partnerYieldRate || r.yieldRate), // Convert 0.09 → 9
    partnerGrowthRate: toPercent(r.partnerGrowthRate || r.growthRate), // Convert 0.02 → 2
    partnerFrequency: toNumber(r.partnerFrequency || r.frequency),
  };
};

/**
 * Parse enrollment data from proposal, converting decimal percentages to display format
 */
const parseEnrollmentData = (enrollment: unknown): EnrollmentData => {
  const e = enrollment as Record<string, unknown> | undefined;
  if (!e) return DEFAULT_ENROLLMENT;

  // Convert ramp plan percentages from decimals to percentages for display
  const rampPlanPercentages = Array.isArray(e.rampPlanPercentages)
    ? e.rampPlanPercentages.map((p: unknown) => toPercent(p, 0))
    : DEFAULT_ENROLLMENT.rampPlanPercentages;

  return {
    rampUpEnabled: Boolean(e.rampUpEnabled ?? DEFAULT_ENROLLMENT.rampUpEnabled),
    rampUpStartYear: toNumber(e.rampUpStartYear, DEFAULT_ENROLLMENT.rampUpStartYear),
    rampUpEndYear: toNumber(e.rampUpEndYear, DEFAULT_ENROLLMENT.rampUpEndYear),
    steadyStateStudents: toNumber(e.steadyStateStudents, DEFAULT_ENROLLMENT.steadyStateStudents),
    rampUpTargetStudents: toNumber(e.rampUpTargetStudents, DEFAULT_ENROLLMENT.rampUpTargetStudents),
    rampPlanPercentages, // Converted from [0.925, 0.95, 0.975, 1.0, 1.0] to [92.5, 95, 97.5, 100, 100]
    gradeDistribution: Array.isArray(e.gradeDistribution) ? e.gradeDistribution : [],
  };
};

export function DynamicSetupTab({ proposal, onUpdate }: DynamicSetupTabProps) {
  const { canEdit, isViewer } = useRoleCheck();
  const [activeSubTab, setActiveSubTab] = useState("program");
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  // Parse and initialize form data
  const [enrollment, setEnrollment] = useState<EnrollmentData>(() =>
    parseEnrollmentData(proposal.enrollment)
  );

  // Use parsing helpers to convert decimal percentages to display format
  const [curriculum, setCurriculum] = useState<CurriculumData>(() =>
    parseCurriculumData(proposal.curriculum)
  );

  const [rentParams, setRentParams] = useState<RentParamsData>(() =>
    parseRentParams(proposal.rentParams)
  );

  const [staff, setStaff] = useState<StaffData>(() =>
    parseStaffData(proposal.staff)
  );

  const [otherOpexPercent, setOtherOpexPercent] = useState<number>(() => {
    const value = Number(proposal.otherOpexPercent) || 0.1;
    // Convert decimal to percentage if needed (0.3 → 30)
    return value < 1 ? value * 100 : value;
  });

  const updateEnrollment = useCallback(
    (field: keyof EnrollmentData, value: unknown) => {
      setEnrollment((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateCurriculum = useCallback(
    (field: keyof CurriculumData, value: unknown) => {
      setCurriculum((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateRentParams = useCallback(
    (field: keyof RentParamsData, value: unknown) => {
      setRentParams((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateStaff = useCallback((field: keyof StaffData, value: unknown) => {
    setStaff((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert percentages from display format (3) to decimal format (0.03) for API
      const curriculumForApi = {
        ...curriculum,
        frenchProgramPercentage: curriculum.frenchProgramPercentage / 100,
        frenchTuitionGrowthRate: curriculum.frenchTuitionGrowthRate / 100,
        ibProgramPercentage: curriculum.ibProgramPercentage / 100,
        ibTuitionGrowthRate: curriculum.ibTuitionGrowthRate / 100,
      };

      const rentParamsForApi = {
        ...rentParams,
        rentGrowthRate: rentParams.rentGrowthRate ? rentParams.rentGrowthRate / 100 : undefined,
        revenueSharePercent: rentParams.revenueSharePercent ? rentParams.revenueSharePercent / 100 : undefined,
        partnerYieldRate: rentParams.partnerYieldRate ? rentParams.partnerYieldRate / 100 : undefined,
        partnerGrowthRate: rentParams.partnerGrowthRate ? rentParams.partnerGrowthRate / 100 : undefined,
      };

      const staffForApi = {
        ...staff,
        cpiRate: staff.cpiRate / 100,
      };

      // Convert enrollment percentages from display format (92.5) to decimal format (0.925) for API
      const enrollmentForApi = {
        ...enrollment,
        rampPlanPercentages: enrollment.rampPlanPercentages.map(p => p / 100),
      };

      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment: enrollmentForApi,
          curriculum: curriculumForApi,
          rentParams: rentParamsForApi,
          staff: staffForApi,
          otherOpexPercent: otherOpexPercent / 100, // Convert 30 → 0.3
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save dynamic setup");
      }

      const updatedProposal = await response.json();
      onUpdate(updatedProposal);
      toast.success("Dynamic setup saved");
    } catch (error) {
      console.error("Error saving dynamic setup:", error);
      toast.error("Failed to save dynamic setup");
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);

      // Convert percentages from display format to decimal format for API
      const curriculumForApi = {
        ...curriculum,
        frenchProgramPercentage: curriculum.frenchProgramPercentage / 100,
        frenchTuitionGrowthRate: curriculum.frenchTuitionGrowthRate / 100,
        ibProgramPercentage: curriculum.ibProgramPercentage / 100,
        ibTuitionGrowthRate: curriculum.ibTuitionGrowthRate / 100,
      };

      const rentParamsForApi = {
        ...rentParams,
        rentGrowthRate: rentParams.rentGrowthRate ? rentParams.rentGrowthRate / 100 : undefined,
        revenueSharePercent: rentParams.revenueSharePercent ? rentParams.revenueSharePercent / 100 : undefined,
        partnerYieldRate: rentParams.partnerYieldRate ? rentParams.partnerYieldRate / 100 : undefined,
        partnerGrowthRate: rentParams.partnerGrowthRate ? rentParams.partnerGrowthRate / 100 : undefined,
      };

      const staffForApi = {
        ...staff,
        cpiRate: staff.cpiRate / 100,
      };

      const enrollmentForApi = {
        ...enrollment,
        rampPlanPercentages: enrollment.rampPlanPercentages.map(p => p / 100),
      };

      // First save any pending changes
      const saveResponse = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment: enrollmentForApi,
          curriculum: curriculumForApi,
          rentParams: rentParamsForApi,
          staff: staffForApi,
          otherOpexPercent: otherOpexPercent / 100,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save changes before recalculation");
      }

      // Then recalculate
      const recalcResponse = await fetch(
        `/api/proposals/${proposal.id}/recalculate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!recalcResponse.ok) {
        const error = await recalcResponse.json();
        throw new Error(error.message || "Failed to recalculate");
      }

      const result = await recalcResponse.json();
      onUpdate(result.proposal);
      toast.success("Proposal recalculated successfully");
    } catch (error) {
      console.error("Error recalculating:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to recalculate"
      );
    } finally {
      setRecalculating(false);
    }
  };

  const renderRentForm = () => {
    const rentModel = proposal.rentModel;
    const contractPeriodYears = (proposal.contractPeriodYears as number) || 30;
    const contractEndYear = 2028 + contractPeriodYears - 1;

    return (
      <ExecutiveCard>
        <ExecutiveCardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" />
              <div>
                <ExecutiveCardTitle className="text-lg">Rent Model Parameters</ExecutiveCardTitle>
                <p className="text-sm text-muted-foreground">
                  Model: <strong>{rentModel}</strong>
                </p>
              </div>
            </div>

            {/* Contract Period Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-medium text-amber-900 dark:text-amber-100">
                  Contract Period
                </span>
              </div>
              <div className="h-4 w-px bg-amber-300 dark:bg-amber-700" />
              <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
                2028-{contractEndYear}
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                ({contractPeriodYears} years)
              </div>
            </div>
          </div>
        </ExecutiveCardHeader>

        <ExecutiveCardContent className="pt-6 space-y-6">
          {rentModel === "FIXED_ESCALATION" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fixed Escalation:</strong> Base rent increases by a fixed
                  percentage at specified intervals.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Base Rent (SAR)</Label>
                  <Input
                    type="number"
                    value={rentParams.baseRent || 10000000}
                    onChange={(e) =>
                      updateRentParams(
                        "baseRent",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Growth Rate (%)</Label>
                  <Input
                    type="number"
                    value={rentParams.rentGrowthRate || 3}
                    onChange={(e) =>
                      updateRentParams(
                        "rentGrowthRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    step={0.5}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency (years)</Label>
                  <Input
                    type="number"
                    value={rentParams.rentFrequency || 1}
                    onChange={(e) =>
                      updateRentParams(
                        "rentFrequency",
                        parseInt(e.target.value) || 1
                      )
                    }
                    min={1}
                    max={5}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {rentModel === "REVENUE_SHARE" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Revenue Share:</strong> Rent is calculated as a percentage
                  of total school revenue.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Revenue Share (%)</Label>
                <Input
                  type="number"
                  value={rentParams.revenueSharePercent || 15}
                  onChange={(e) =>
                    updateRentParams(
                      "revenueSharePercent",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  step={0.5}
                  min={0}
                  max={100}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of total revenue paid as rent
                </p>
              </div>
            </div>
          )}

          {rentModel === "PARTNER_INVESTMENT" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Partner Investment:</strong> Rent based on total investment
                  (land + construction) multiplied by yield rate.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Land Size (m2)</Label>
                  <Input
                    type="number"
                    value={rentParams.partnerLandSize || 10000}
                    onChange={(e) =>
                      updateRentParams(
                        "partnerLandSize",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Land Price (SAR/m2)</Label>
                  <Input
                    type="number"
                    value={rentParams.partnerLandPricePerSqm || 5000}
                    onChange={(e) =>
                      updateRentParams(
                        "partnerLandPricePerSqm",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>BUA Size (m2)</Label>
                  <Input
                    type="number"
                    value={rentParams.partnerBuaSize || 20000}
                    onChange={(e) =>
                      updateRentParams(
                        "partnerBuaSize",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Construction Cost (SAR/m2)</Label>
                  <Input
                    type="number"
                    value={rentParams.partnerConstructionCostPerSqm || 2500}
                    onChange={(e) =>
                      updateRentParams(
                        "partnerConstructionCostPerSqm",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yield Rate (%)</Label>
                  <Input
                    type="number"
                    value={rentParams.partnerYieldRate || 9}
                    onChange={(e) =>
                      updateRentParams(
                        "partnerYieldRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    step={0.5}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Growth Rate (%)</Label>
                  <Input
                    type="number"
                    value={rentParams.partnerGrowthRate || 2}
                    onChange={(e) =>
                      updateRentParams(
                        "partnerGrowthRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    step={0.5}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Growth Frequency (years)</Label>
                  <Input
                    type="number"
                    value={rentParams.partnerFrequency || 1}
                    onChange={(e) =>
                      updateRentParams(
                        "partnerFrequency",
                        parseInt(e.target.value) || 1
                      )
                    }
                    min={1}
                    max={5}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    How often the growth rate is applied (1-5 years)
                  </p>
                </div>
              </div>

              {/* Investment Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Investment Summary</h4>
                <div className="space-y-1 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Land Cost:</span>
                    <span>
                      SAR{" "}
                      {(
                        (rentParams.partnerLandSize || 10000) *
                        (rentParams.partnerLandPricePerSqm || 5000)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Construction Cost:
                    </span>
                    <span>
                      SAR{" "}
                      {(
                        (rentParams.partnerBuaSize || 20000) *
                        (rentParams.partnerConstructionCostPerSqm || 2500)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total Investment:</span>
                    <span>
                      SAR{" "}
                      {(
                        (rentParams.partnerLandSize || 10000) *
                        (rentParams.partnerLandPricePerSqm || 5000) +
                        (rentParams.partnerBuaSize || 20000) *
                        (rentParams.partnerConstructionCostPerSqm || 2500)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t text-primary">
                    <span className="text-muted-foreground">Growth:</span>
                    <span>
                      {rentParams.partnerGrowthRate || 2}% every{" "}
                      {rentParams.partnerFrequency || 1} year(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ExecutiveCardContent>
      </ExecutiveCard>
    );
  };

  const renderOpExForm = () => (
    <ExecutiveCard>
      <ExecutiveCardHeader className="border-b pb-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <div>
            <ExecutiveCardTitle className="text-lg">Operating Expenses</ExecutiveCardTitle>
            <p className="text-sm text-muted-foreground">
              Configure staff costs and other OpEx
            </p>
          </div>
        </div>
      </ExecutiveCardHeader>

      <ExecutiveCardContent className="pt-6 space-y-6">
        {/* Staff Configuration */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-semibold">Staff Configuration</h4>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Students per Teacher</Label>
              <Input
                type="number"
                value={staff.studentsPerTeacher}
                onChange={(e) =>
                  updateStaff("studentsPerTeacher", parseInt(e.target.value) || 1)
                }
                min={1}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Student-to-teacher ratio
              </p>
            </div>
            <div className="space-y-2">
              <Label>Students per Admin Staff</Label>
              <Input
                type="number"
                value={staff.studentsPerNonTeacher}
                onChange={(e) =>
                  updateStaff(
                    "studentsPerNonTeacher",
                    parseInt(e.target.value) || 1
                  )
                }
                min={1}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Student-to-admin ratio
              </p>
            </div>
            <div className="space-y-2">
              <Label>Avg Teacher Salary (SAR/month)</Label>
              <Input
                type="number"
                value={staff.avgTeacherSalary}
                onChange={(e) =>
                  updateStaff("avgTeacherSalary", parseInt(e.target.value) || 0)
                }
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Avg Admin Salary (SAR/month)</Label>
              <Input
                type="number"
                value={staff.avgAdminSalary}
                onChange={(e) =>
                  updateStaff("avgAdminSalary", parseInt(e.target.value) || 0)
                }
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>CPI Rate (%)</Label>
              <Input
                type="number"
                value={staff.cpiRate}
                onChange={(e) =>
                  updateStaff("cpiRate", parseFloat(e.target.value) || 0)
                }
                step={0.5}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Annual salary escalation
              </p>
            </div>
            <div className="space-y-2">
              <Label>CPI Frequency (years)</Label>
              <Input
                type="number"
                value={staff.cpiFrequency}
                onChange={(e) =>
                  updateStaff("cpiFrequency", parseInt(e.target.value) || 1)
                }
                min={1}
                max={5}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Other OpEx */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-semibold">Other Operating Expenses</h4>

          <div className="space-y-2">
            <Label>Other OpEx (% of Revenue)</Label>
            <Input
              type="number"
              value={otherOpexPercent.toFixed(1)}
              onChange={(e) =>
                setOtherOpexPercent(parseFloat(e.target.value) || 0)
              }
              step={0.5}
              min={0}
              max={100}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Utilities, maintenance, supplies, etc. (typically 8-12%)
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-primary/5 rounded-lg">
          <h4 className="font-semibold mb-2">Cost per Student (Annual)</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teacher Cost:</span>
              <span className="font-mono font-semibold">
                SAR{" "}
                {Math.round(
                  (staff.avgTeacherSalary * 12) / staff.studentsPerTeacher
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Cost:</span>
              <span className="font-mono font-semibold">
                SAR{" "}
                {Math.round(
                  (staff.avgAdminSalary * 12) / staff.studentsPerNonTeacher
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground font-semibold">
                Total Staff Cost/Student:
              </span>
              <span className="font-mono font-bold">
                SAR{" "}
                {Math.round(
                  (staff.avgTeacherSalary * 12) / staff.studentsPerTeacher +
                  (staff.avgAdminSalary * 12) / staff.studentsPerNonTeacher
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </ExecutiveCardContent>
    </ExecutiveCard>
  );

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dynamic Period Setup</h2>
          <p className="text-muted-foreground mt-1">
            Edit enrollment, curriculum, rent, and operating expense assumptions
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleRecalculate}
                disabled={recalculating}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${recalculating ? "animate-spin" : ""}`}
                />
                Recalculate
              </Button>
            </>
          )}
          {isViewer && (
            <Alert className="max-w-md">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You have read-only access. Only ADMIN and PLANNER roles can edit proposals.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Sub-Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="flex w-auto justify-start border-b bg-transparent p-0 mb-6">
          <TabsTrigger
            value="program"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Program Setup
          </TabsTrigger>
          <TabsTrigger
            value="rent"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Rent Model
          </TabsTrigger>
          <TabsTrigger
            value="opex"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Operating Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="program">
          <CombinedProgramTab
            enrollment={enrollment}
            curriculum={curriculum}
            onUpdateEnrollment={updateEnrollment}
            onUpdateCurriculum={updateCurriculum}
          />
        </TabsContent>
        <TabsContent value="rent">{renderRentForm()}</TabsContent>
        <TabsContent value="opex">{renderOpExForm()}</TabsContent>
      </Tabs>
    </div>
  );
}
