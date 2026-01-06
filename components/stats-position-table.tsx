"use client"

import { PositionStats } from "@/hooks/use-detailed-stats"
import { Shield, User, Activity, Target, Star } from "lucide-react"

interface StatsPositionTableProps {
    byPosition: Record<string, PositionStats>
}

const POSITION_CONFIG = {
    GOLEIRO: {
        label: "Goleiro",
        icon: Shield,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    ZAGUEIRO: {
        label: "Zagueiro",
        icon: User,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
    },
    MEIO: {
        label: "Meio Campo",
        icon: Activity,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    ATACANTE: {
        label: "Atacante",
        icon: Target,
        color: "text-rose-600",
        bgColor: "bg-rose-50",
    },
}

export function StatsPositionTable({ byPosition }: StatsPositionTableProps) {
    const positions = Object.entries(byPosition).filter(([_, stats]: any) => stats.count > 0)

    if (positions.length === 0) {
        return (
            <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                <p className="text-sm text-zinc-500 text-center">Sem estatísticas por posição</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                    Estatísticas por Posição
                </h3>
            </div>
            <div className="divide-y divide-zinc-100">
                {positions.map(([position, stats]: any) => {
                    const config = POSITION_CONFIG[position as keyof typeof POSITION_CONFIG]
                    const Icon = config?.icon || User

                    return (
                        <div
                            key={position}
                            className="p-6 hover:bg-zinc-50/50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${config?.bgColor || "bg-zinc-50"} rounded-sm flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${config?.color || "text-zinc-600"}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-zinc-900">
                                            {config?.label || position}
                                        </h4>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {stats.count} {stats.count === 1 ? "pelada" : "peladas"}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6 text-right">
                                    <div>
                                        <div className="flex items-center justify-end gap-1 mb-1">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-sm font-bold text-zinc-900">
                                                {stats.avgRating.toFixed(1)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500">Rating Médio</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 mb-1">
                                            {stats.totalGoals}
                                        </p>
                                        <p className="text-xs text-zinc-500">Gols</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 mb-1">
                                            {stats.totalAssists}
                                        </p>
                                        <p className="text-xs text-zinc-500">Assistências</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

