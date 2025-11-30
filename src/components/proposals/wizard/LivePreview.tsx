"use client";

import { useMemo, useState, useEffect } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { formatMillions } from "@/lib/utils/financial";
import { ProposalFormData } from "./types";
import {
    ExecutiveCard,
    ExecutiveCardContent,
    ExecutiveCardHeader,
    ExecutiveCardTitle,
} from "@/components/ui/executive-card";
import { Activity, Info } from "lucide-react";

interface LivePreviewProps {
    data: Partial<ProposalFormData>;
}

export function LivePreview({ data }: LivePreviewProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Use setTimeout to avoid synchronous setState in effect
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const chartData = useMemo(() => {
        // Simple projection logic for preview
        // This mimics the server-side logic but simplified for instant feedback
        const years = Array.from({ length: 30 }, (_, i) => 2028 + i);

        // Default values if missing
        const frCapacity = data.frenchCapacity || 0;
        const ibCapacity = data.ibCapacity || 0;
        const frTuition = data.frenchBaseTuition2028 || 30000;
        const ibTuition = data.ibBaseTuition2028 || 45000;

        return years.map((year, index) => {
            // Ramp up logic (simplified)
            let rampUp = 1.0;
            if (index === 0) rampUp = (data.rampUpFRYear1Percentage || 20) / 100;
            else if (index === 1) rampUp = (data.rampUpFRYear2Percentage || 40) / 100;
            else if (index === 2) rampUp = (data.rampUpFRYear3Percentage || 60) / 100;
            else if (index === 3) rampUp = (data.rampUpFRYear4Percentage || 80) / 100;
            else if (index >= 4) rampUp = (data.rampUpFRYear5Percentage || 100) / 100;

            const students = (frCapacity + ibCapacity) * rampUp;

            // Tuition growth (simplified 3% default)
            const growth = Math.pow(1.03, index);
            const revenue = students * ((frTuition * 0.7 + ibTuition * 0.3) * growth); // Weighted avg tuition

            // Rent logic
            let rent = 0;
            if (data.rentModel === "Fixed") {
                const baseRent = data.baseRent || 10000000;
                rent = baseRent * Math.pow(1 + (data.rentGrowthRate || 3) / 100, index);
            } else if (data.rentModel === "RevShare") {
                rent = revenue * ((data.revenueSharePercent || 15) / 100);
            } else {
                // Partner model simplified
                rent = revenue * 0.12;
            }

            return {
                year,
                revenue,
                rent,
                net: revenue - rent
            };
        });
    }, [data]);

    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalRent = chartData.reduce((sum, d) => sum + d.rent, 0);

    return (
        <div className="space-y-6 sticky top-6">
            <ExecutiveCard>
                <ExecutiveCardHeader className="border-b pb-4">
                    <ExecutiveCardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            <span>Live Preview</span>
                        </div>
                        <span className="text-xs font-normal text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded-full">
                            ESTIMATE
                        </span>
                    </ExecutiveCardTitle>
                </ExecutiveCardHeader>
                <ExecutiveCardContent className="pt-6">
                    <div className="h-[200px] w-full min-w-[200px]">
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--executive-positive)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--executive-positive)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--executive-negative)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--executive-negative)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="year"
                                        hide
                                    />
                                    <YAxis
                                        hide
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-popover border border-border p-2 rounded shadow-xl text-xs">
                                                        <p className="font-bold mb-1">{payload[0].payload.year}</p>
                                                        <p className="text-[var(--executive-positive)]">
                                                            Rev: {formatMillions(payload[0].value as number)}
                                                        </p>
                                                        <p className="text-[var(--executive-negative)]">
                                                            Rent: {formatMillions(payload[1].value as number)}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--executive-positive)"
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="rent"
                                        stroke="var(--executive-negative)"
                                        fillOpacity={1}
                                        fill="url(#colorRent)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="animate-pulse bg-muted rounded h-full w-full" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue (30Y)</p>
                            <p className="text-xl font-light tracking-tight text-[var(--executive-positive)]">
                                {formatMillions(totalRevenue)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Rent (30Y)</p>
                            <p className="text-xl font-light tracking-tight text-[var(--executive-negative)]">
                                {formatMillions(totalRent)}
                            </p>
                        </div>
                    </div>
                </ExecutiveCardContent>
            </ExecutiveCard>

            {/* Contextual Insights based on current step data */}
            <ExecutiveCard className="bg-muted/30 border-none">
                <ExecutiveCardContent className="p-6">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Analysis</h4>
                            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                                {data.rentModel === "RevShare" && (
                                    <li>Revenue Share model aligns incentives but risks higher costs in good years.</li>
                                )}
                                {data.rentModel === "Fixed" && (
                                    <li>Fixed rent provides certainty but higher risk in early years.</li>
                                )}
                                {(data.frenchCapacity || 0) > 1500 && (
                                    <li className="text-amber-500">High capacity ({data.frenchCapacity}) may require larger land allocation.</li>
                                )}
                                {data.rentModel === "" && (
                                    <li>Select a rent model to see financial projections.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </ExecutiveCardContent>
            </ExecutiveCard>
        </div>
    );
}
