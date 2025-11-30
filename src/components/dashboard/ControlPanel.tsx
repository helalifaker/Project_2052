"use client";

import React from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { RotateCcw, TrendingUp, Percent } from "lucide-react";
import { formatPercent } from "@/lib/utils/financial";

export function ControlPanel() {
    const {
        discountRate,
        inflationRate,
        rentGrowthFactor,
        updateAssumption,
        resetAssumptions,
    } = useScenario();

    return (
        <Card className="glass-card w-full">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Scenario Controls
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetAssumptions}
                        title="Reset to Defaults"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
                <CardDescription>
                    Adjust assumptions to see real-time impact on NPV and Cash Flow.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Discount Rate */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Percent className="h-4 w-4 text-muted-foreground" />
                            Discount Rate
                        </label>
                        <span className="text-sm font-bold text-primary">
                            {formatPercent(discountRate, 1)}
                        </span>
                    </div>
                    <Slider
                        value={[discountRate * 100]}
                        min={0}
                        max={20}
                        step={0.5}
                        onValueChange={(vals) => updateAssumption("discountRate", vals[0] / 100)}
                        className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                        Used to calculate Net Present Value (NPV). Higher rates reduce NPV.
                    </p>
                </div>

                {/* Inflation Rate */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            Inflation Rate
                        </label>
                        <span className="text-sm font-bold text-primary">
                            {formatPercent(inflationRate, 1)}
                        </span>
                    </div>
                    <Slider
                        value={[inflationRate * 100]}
                        min={0}
                        max={10}
                        step={0.5}
                        onValueChange={(vals) => updateAssumption("inflationRate", vals[0] / 100)}
                        className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                        Projected annual inflation affecting operational costs.
                    </p>
                </div>

                {/* Rent Growth Factor */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            Rent Growth Factor
                        </label>
                        <span className="text-sm font-bold text-primary">
                            {formatPercent(rentGrowthFactor, 0)}
                        </span>
                    </div>
                    <Slider
                        value={[rentGrowthFactor * 100]}
                        min={50}
                        max={150}
                        step={5}
                        onValueChange={(vals) => updateAssumption("rentGrowthFactor", vals[0] / 100)}
                        className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                        Multiplier for projected rent growth (100% = Baseline).
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
