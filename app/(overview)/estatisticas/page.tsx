"use client"

import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { useDetailedStats } from "@/hooks/use-detailed-stats"
import { StatsTimeSeriesChart } from "@/components/stats-time-series-chart"
import { StatsPositionTable } from "@/components/stats-position-table"
import { StatsPeladasTable } from "@/components/stats-peladas-table"
import { StatsRankings } from "@/components/stats-rankings"
import { TrendingUp, ArrowLeft, Star, Target, Award, Calendar, Activity } from "lucide-react"

export default function EstatisticasPage() {
    const { data: session, isPending } = useSession()
    const { stats, loading, error } = useDetailedStats()

    if (isPending || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600"></div>
                    <p className="text-xs text-zinc-500 mt-2">Carregando estatísticas...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
                <div className="max-w-md w-full bg-white rounded-sm border border-zinc-200 shadow-sm p-8 text-center">
                    <p className="text-zinc-500 text-sm mb-4">Você precisa estar logado para ver as estatísticas.</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-sm font-medium transition-colors text-sm"
                    >
                        Entrar
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full bg-zinc-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 hover:bg-white rounded-sm border border-zinc-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 text-zinc-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
                                Estatísticas Detalhadas
                            </h1>
                            <p className="text-sm text-zinc-500 mt-1">
                                Análise completa do seu desempenho
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-2 border-red-600 p-4 mb-6 rounded-r-sm">
                        <p className="text-xs text-red-700 font-medium">
                            Erro ao carregar estatísticas: {error}
                        </p>
                    </div>
                )}

                {/* Summary Cards */}
                {stats && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-sm p-5 border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        Rating Médio
                                    </span>
                                    <Star className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                        {stats.rankings.avgRating.toFixed(1)}
                                    </h3>
                                    <span className="text-xs text-zinc-400">
                                        ⭐{Math.floor(stats.rankings.avgRating)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-sm p-5 border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        Total de Gols
                                    </span>
                                    <Target className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                        {stats.rankings.totalGoals}
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white rounded-sm p-5 border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        Total de Assistências
                                    </span>
                                    <Award className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                        {stats.rankings.totalAssists}
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white rounded-sm p-5 border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        Total de Peladas
                                    </span>
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                        {stats.rankings.totalPeladas}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Rankings and Comparisons */}
                        <div className="mb-8">
                            <StatsRankings rankings={stats.rankings} comparisons={stats.comparisons} />
                        </div>

                        {/* Time Series Charts */}
                        {stats.timeSeries.length > 0 && (
                            <div className="mb-8">
                                <StatsTimeSeriesChart data={stats.timeSeries} />
                            </div>
                        )}

                        {/* Position Stats */}
                        <div className="mb-8">
                            <StatsPositionTable byPosition={stats.byPosition} />
                        </div>

                        {/* Peladas Table */}
                        <div className="mb-8">
                            <StatsPeladasTable peladas={stats.byPelada} />
                        </div>
                    </>
                )}

                {/* Empty State */}
                {stats && stats.rankings.totalPeladas === 0 && (
                    <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-12 text-center">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                            <Activity className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                            Nenhuma estatística disponível
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                            Participe de peladas para começar a gerar estatísticas detalhadas.
                        </p>
                        <Link
                            href="/peladas"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-sm font-medium transition-colors text-sm"
                        >
                            Ver Peladas
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

