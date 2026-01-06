"use client"

import { TimeSeriesData } from "@/hooks/use-detailed-stats"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { TrendingUp, Target, Award } from "lucide-react"

interface StatsTimeSeriesChartProps {
    data: TimeSeriesData[]
}

const chartConfig = {
    rating: {
        label: "Rating",
        color: "#10b981",
    },
    goals: {
        label: "Gols",
        color: "#3b82f6",
    },
    assists: {
        label: "Assistências",
        color: "#f59e0b",
    },
}

export function StatsTimeSeriesChart({ data }: StatsTimeSeriesChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-zinc-50 rounded-sm border border-zinc-200">
                <p className="text-sm text-zinc-500">Sem dados para exibir</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Rating Chart */}
            <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                        Evolução do Rating
                    </h3>
                </div>
                <ChartContainer config={chartConfig}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200" />
                        <XAxis
                            dataKey="period"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-xs"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-xs"
                            domain={[0, 10]}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            type="monotone"
                            dataKey="rating"
                            stroke="var(--color-rating)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-rating)", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </div>

            {/* Goals and Assists Chart */}
            <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                        Gols e Assistências
                    </h3>
                </div>
                <ChartContainer config={chartConfig}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200" />
                        <XAxis
                            dataKey="period"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-xs"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-xs"
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="goals"
                            stroke="var(--color-goals)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-goals)", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="assists"
                            stroke="var(--color-assists)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-assists)", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </div>
        </div>
    )
}

