"use client"

import { Rankings, Comparisons } from "@/hooks/use-detailed-stats"
import { Trophy, TrendingUp, TrendingDown, Minus, Star, Target, Award, Calendar } from "lucide-react"

interface StatsRankingsProps {
    rankings: Rankings
    comparisons: Comparisons
}

export function StatsRankings({ rankings, comparisons }: StatsRankingsProps) {
    const formatTrend = (value: number) => {
        if (value > 0) {
            return (
                <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">+{value.toFixed(1)}</span>
                </div>
            )
        } else if (value < 0) {
            return (
                <div className="flex items-center gap-1 text-rose-600">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{value.toFixed(1)}</span>
                </div>
            )
        } else {
            return (
                <div className="flex items-center gap-1 text-zinc-400">
                    <Minus className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">0</span>
                </div>
            )
        }
    }

    return (
        <div className="space-y-4">
            {/* Rankings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Melhor Rating
                        </span>
                        <Trophy className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                            {rankings.bestRating.toFixed(1)}
                        </h3>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Mais Gols
                        </span>
                        <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                            {rankings.bestGoals}
                        </h3>
                        <span className="text-xs text-zinc-400">em uma pelada</span>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Mais Assistências
                        </span>
                        <Award className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                            {rankings.bestAssists}
                        </h3>
                        <span className="text-xs text-zinc-400">em uma pelada</span>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Total de Peladas
                        </span>
                        <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                            {rankings.totalPeladas}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Comparisons */}
            <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide mb-4">
                    Comparação: Este Mês vs Mês Anterior
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-zinc-600">Rating Médio</span>
                            {formatTrend(comparisons.trends.rating)}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-zinc-900">
                                {comparisons.thisMonth.avgRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-zinc-400">
                                (antes: {comparisons.lastMonth.avgRating.toFixed(1)})
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-zinc-600">Gols</span>
                            {formatTrend(comparisons.trends.goals)}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-zinc-900">
                                {comparisons.thisMonth.totalGoals}
                            </span>
                            <span className="text-xs text-zinc-400">
                                (antes: {comparisons.lastMonth.totalGoals})
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-zinc-600">Assistências</span>
                            {formatTrend(comparisons.trends.assists)}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-zinc-900">
                                {comparisons.thisMonth.totalAssists}
                            </span>
                            <span className="text-xs text-zinc-400">
                                (antes: {comparisons.lastMonth.totalAssists})
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-zinc-600">Peladas</span>
                            {formatTrend(comparisons.trends.peladas)}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-zinc-900">
                                {comparisons.thisMonth.peladas}
                            </span>
                            <span className="text-xs text-zinc-400">
                                (antes: {comparisons.lastMonth.peladas})
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

