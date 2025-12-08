"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
} from "lucide-react";
import {
  ExecutiveCard,
  ExecutiveCardContent,
  ExecutiveCardHeader,
  ExecutiveCardTitle,
} from "@/components/ui/executive-card";

// Types (mirrored from DynamicSetupTab for now, ideally shared)
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

interface CombinedProgramTabProps {
  enrollment: EnrollmentData;
  curriculum: CurriculumData;
  onUpdateEnrollment: (field: keyof EnrollmentData, value: unknown) => void;
  onUpdateCurriculum: (field: keyof CurriculumData, value: unknown) => void;
}

export function CombinedProgramTab({
  enrollment,
  curriculum,
  onUpdateEnrollment,
  onUpdateCurriculum,
}: CombinedProgramTabProps) {
  // Helper to calculate revenue for a specific year and program
  const calculateRevenue = (
    yearIndex: number,
    isIb: boolean,
  ): { students: number; revenue: number } => {
    const year = 2028 + yearIndex;

    // 1. Calculate Total Students
    let totalStudents = enrollment.steadyStateStudents;
    if (enrollment.rampUpEnabled) {
      const percentage = enrollment.rampPlanPercentages[yearIndex] || 0;
      // Percentage is now in 0-100 format, convert to decimal for calculation
      totalStudents = Math.round(
        enrollment.steadyStateStudents * (percentage / 100),
      );
    }

    // 2. Calculate Program Students
    const programShare = isIb
      ? curriculum.ibProgramPercentage
      : curriculum.frenchProgramPercentage;

    // IB only starts in specific year
    if (isIb && year < curriculum.ibStartYear) {
      return { students: 0, revenue: 0 };
    }

    const programStudents = Math.round(totalStudents * (programShare / 100));

    // 3. Calculate Tuition
    const baseTuition = isIb
      ? curriculum.ibBaseTuition2028
      : curriculum.frenchBaseTuition2028;
    const growthRate = isIb
      ? curriculum.ibTuitionGrowthRate
      : curriculum.frenchTuitionGrowthRate;
    const growthFreq = isIb
      ? curriculum.ibTuitionGrowthFrequency
      : curriculum.frenchTuitionGrowthFrequency;

    // Simple compound growth
    // Years since 2028
    const yearsPassed = year - 2028;
    const growthPeriods = Math.floor(yearsPassed / growthFreq);
    const currentTuition =
      baseTuition * Math.pow(1 + growthRate / 100, growthPeriods);

    return {
      students: programStudents,
      revenue: programStudents * currentTuition,
    };
  };

  const renderProgramCard = (type: "FRENCH" | "IB") => {
    const isIb = type === "IB";
    const enabled = isIb
      ? curriculum.ibProgramEnabled
      : curriculum.frenchProgramEnabled;
    const title = isIb ? "International Baccalaureate (IB)" : "French Program";
    // Use Atelier chart colors - proposal-a (violet) for IB, proposal-b (teal) for French
    const colorStyle = {
      color: isIb
        ? "var(--atelier-chart-proposal-a)"
        : "var(--atelier-chart-proposal-b)",
    };
    const bgStyle = {
      backgroundColor: isIb
        ? "color-mix(in srgb, var(--atelier-chart-proposal-a) 15%, transparent)"
        : "color-mix(in srgb, var(--atelier-chart-proposal-b) 15%, transparent)",
    };
    const borderStyle = {
      borderColor: isIb
        ? "var(--atelier-chart-proposal-a)"
        : "var(--atelier-chart-proposal-b)",
    };

    if (type === "IB" && !enabled) {
      return (
        <ExecutiveCard className="border-dashed opacity-75 hover:opacity-100 transition-opacity">
          <ExecutiveCardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-muted`}>
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Optional advanced curriculum
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  onUpdateCurriculum("ibProgramEnabled", checked)
                }
              />
            </div>
          </ExecutiveCardContent>
        </ExecutiveCard>
      );
    }

    // Calculate 5-year projection
    const projections = [0, 1, 2, 3, 4].map((i) => calculateRevenue(i, isIb));
    const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);

    return (
      <ExecutiveCard className="overflow-hidden border-l-4" style={borderStyle}>
        <ExecutiveCardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" style={bgStyle}>
                <GraduationCap className="h-5 w-5" style={colorStyle} />
              </div>
              <div>
                <ExecutiveCardTitle className="text-lg">
                  {title}
                </ExecutiveCardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {isIb ? "Advanced" : "Standard"}
                  </Badge>
                  {isIb && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Starts{" "}
                      {curriculum.ibStartYear}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) =>
                onUpdateCurriculum(
                  isIb ? "ibProgramEnabled" : "frenchProgramEnabled",
                  checked,
                )
              }
            />
          </div>
        </ExecutiveCardHeader>

        <ExecutiveCardContent className="pt-6 space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Share of Students
                  </Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={
                        isIb
                          ? curriculum.ibProgramPercentage
                          : curriculum.frenchProgramPercentage
                      }
                      onChange={(e) =>
                        onUpdateCurriculum(
                          isIb
                            ? "ibProgramPercentage"
                            : "frenchProgramPercentage",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Base Tuition (2028)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                      SAR
                    </span>
                    <Input
                      type="number"
                      value={
                        isIb
                          ? curriculum.ibBaseTuition2028
                          : curriculum.frenchBaseTuition2028
                      }
                      onChange={(e) =>
                        onUpdateCurriculum(
                          isIb ? "ibBaseTuition2028" : "frenchBaseTuition2028",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="pl-12 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Annual Growth
                  </Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={
                        isIb
                          ? curriculum.ibTuitionGrowthRate
                          : curriculum.frenchTuitionGrowthRate
                      }
                      onChange={(e) =>
                        onUpdateCurriculum(
                          isIb
                            ? "ibTuitionGrowthRate"
                            : "frenchTuitionGrowthRate",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      step={0.5}
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Growth Freq (Yrs)
                  </Label>
                  <Input
                    type="number"
                    value={
                      isIb
                        ? curriculum.ibTuitionGrowthFrequency
                        : curriculum.frenchTuitionGrowthFrequency
                    }
                    onChange={(e) =>
                      onUpdateCurriculum(
                        isIb
                          ? "ibTuitionGrowthFrequency"
                          : "frenchTuitionGrowthFrequency",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    min={1}
                    className="font-mono"
                  />
                </div>
              </div>

              {isIb && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Start Year
                  </Label>
                  <Input
                    type="number"
                    value={curriculum.ibStartYear}
                    onChange={(e) =>
                      onUpdateCurriculum(
                        "ibStartYear",
                        parseInt(e.target.value) || 2028,
                      )
                    }
                    min={2028}
                    className="font-mono"
                  />
                </div>
              )}
            </div>

            {/* Right Column: Ramp Up */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Enrollment Ramp-Up
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Global Setting
                  </span>
                  <Switch
                    checked={enrollment.rampUpEnabled}
                    onCheckedChange={(checked) =>
                      onUpdateEnrollment("rampUpEnabled", checked)
                    }
                    className="scale-75 origin-right"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((index) => {
                  const year = 2028 + index;
                  const globalPercent =
                    enrollment.rampPlanPercentages[index] || 0;
                  const proj = projections[index];

                  return (
                    <div
                      key={year}
                      className="grid grid-cols-[3rem_1fr_6rem] gap-3 items-center text-sm"
                    >
                      <span className="font-mono text-muted-foreground">
                        {year}
                      </span>
                      <div className="relative h-6 flex items-center pr-8">
                        <Slider
                          value={[globalPercent]}
                          onValueChange={([val]) => {
                            if (!enrollment.rampUpEnabled) return;
                            const newPercentages = [
                              ...enrollment.rampPlanPercentages,
                            ];
                            newPercentages[index] = val;
                            onUpdateEnrollment(
                              "rampPlanPercentages",
                              newPercentages,
                            );
                          }}
                          disabled={!enrollment.rampUpEnabled}
                          max={100}
                          step={2.5}
                          className="flex-1"
                        />
                      </div>
                      <div className="text-right font-mono text-xs">
                        <div className="font-medium" style={colorStyle}>
                          {proj.students.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom: Live Revenue */}
          <div className="pt-4 border-t -mx-6 -mb-6 px-6 pb-6" style={bgStyle}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4" style={colorStyle} />
              <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Projected Revenue (5 Years)
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {projections.map((p, i) => {
                const year = 2028 + i;
                return (
                  <div key={year} className="space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      {year}
                    </div>
                    <div
                      className="font-mono font-bold text-sm truncate"
                      title={`SAR ${p.revenue.toLocaleString()}`}
                    >
                      {(p.revenue / 1000000).toFixed(1)}M
                    </div>
                    {/* Mini bar for visual relative scale */}
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isIb
                            ? "var(--atelier-chart-proposal-a)"
                            : "var(--atelier-chart-proposal-b)",
                          width: `${Math.max(0, (p.revenue / Math.max(...projections.map((pj) => pj.revenue))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ExecutiveCardContent>
      </ExecutiveCard>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Global Enrollment Settings */}
      <ExecutiveCard className="bg-muted/30">
        <ExecutiveCardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label>Steady State Capacity</Label>
                <p className="text-xs text-muted-foreground">
                  Total student capacity at full operation
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={enrollment.steadyStateStudents}
                  onChange={(e) =>
                    onUpdateEnrollment(
                      "steadyStateStudents",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="font-mono text-lg"
                />
              </div>
            </div>
          </div>
        </ExecutiveCardContent>
      </ExecutiveCard>

      <div className="space-y-6">
        {renderProgramCard("FRENCH")}
        {renderProgramCard("IB")}
      </div>
    </div>
  );
}
