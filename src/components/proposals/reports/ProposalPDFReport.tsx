import { Proposal } from "@/lib/types/proposal";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

interface ProposalPDFReportProps {
    proposal: Proposal;
    id: string;
}

export function ProposalPDFReport({ proposal, id }: ProposalPDFReportProps) {
    const rentTrajectoryData = proposal.financials?.map((f: any) => ({
        year: f.year,
        rent: f.profitLoss?.rentExpense ? Number(f.profitLoss.rentExpense) / 1_000_000 : 0,
    })) || [];

    return (
        <div
            id={id}
            style={{
                width: "800px",
                height: "450px",
                position: "absolute",
                top: "-10000px",
                left: "-10000px",
                backgroundColor: "white",
            }}
        >
            {/* Chart Only */}
            <div className="h-full w-full p-4 bg-white">
                <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">Rent Trajectory (2028-2053)</h2>
                <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={rentTrajectoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="year"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `${val}M`}
                        />
                        <Area
                            type="monotone"
                            dataKey="rent"
                            stroke="#3b82f6"
                            fill="#eff6ff"
                            strokeWidth={3}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
