"use client"

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import { useStats } from "@/hooks/use-stats";
import { Calendar, Users, Trophy, Plus, Settings, TrendingUp, Target, Award, ArrowUpRight, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Home() {
    const { data: session, isPending } = useSession();
    const { canCreatePelada, role } = useRole();
    const { stats, loading: statsLoading, error: statsError } = useStats();

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600"></div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
                <div className="max-w-md w-full bg-white rounded-sm border border-zinc-200 shadow-sm p-8 text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
                        Futmix
                    </h1>
                    <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                        Plataforma profissional para gestão esportiva.
                    </p>
                    <Link
                        href="/login"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-sm font-medium transition-colors inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                    >
                        Entrar na Plataforma
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-zinc-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
                            Visão Geral
                        </h2>
                        <p className="text-sm text-zinc-500 mt-1">
                            Bem-vindo de volta, {session.user.name.split(' ')[0]}.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canCreatePelada() && (
                            <Link
                                href="/peladas/nova"
                                className="bg-emerald-900 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Nova Pelada
                            </Link>
                        )}
                    </div>
                </div>

                {statsError && (
                    <div className="bg-red-50 border-l-2 border-red-600 p-4 mb-6 rounded-r-sm">
                        <p className="text-xs text-red-700 font-medium">Erro ao carregar estatísticas: {statsError}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-sm p-5 border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Peladas</span>
                            <Activity className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                {statsLoading ? "-" : stats.totalPeladas}
                            </h3>
                            <span className="text-xs text-emerald-600 font-medium flex items-center">
                                +{statsLoading ? "0" : stats.peladasEsteMes}
                                <span className="ml-1 text-zinc-400">mês</span>
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-sm p-5 border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Média</span>
                            <Trophy className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                {statsLoading ? "-" : stats.notaMedia}
                            </h3>
                            <span className="text-xs text-zinc-400 font-normal">
                                {statsLoading ? "-" : "⭐".repeat(Math.floor(stats.notaMedia))}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-sm p-5 border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gols</span>
                            <Target className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                {statsLoading ? "-" : stats.totalGols}
                            </h3>
                            <span className="text-xs text-emerald-600 font-medium flex items-center">
                                +{statsLoading ? "0" : stats.golsEsteMes}
                                <span className="ml-1 text-zinc-400">mês</span>
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-sm p-5 border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Assist.</span>
                            <Award className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                {statsLoading ? "-" : stats.totalAssistencias}
                            </h3>
                            <span className="text-xs text-emerald-600 font-medium flex items-center">
                                +{statsLoading ? "0" : stats.assistenciasEsteMes}
                                <span className="ml-1 text-zinc-400">mês</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Peladas Recentes</h3>
                            <Link href="/peladas" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1">
                                Ver todas <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                            {statsLoading ? (
                                <div className="p-8 text-center">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600 mx-auto mb-3"></div>
                                    <p className="text-xs text-zinc-500">Carregando dados...</p>
                                </div>
                            ) : stats.peladasRecentes.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                                        <Calendar className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-zinc-900 mb-1">
                                        Nenhuma atividade recente
                                    </h4>
                                    <p className="text-xs text-zinc-500 mb-6 max-w-xs mx-auto">
                                        Comece a participar ou criar peladas para ver suas estatísticas aqui.
                                    </p>
                                    {canCreatePelada() && (
                                        <Link
                                            href="/peladas/nova"
                                            className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold uppercase tracking-wide border-b border-emerald-600/20 hover:border-emerald-600 pb-0.5"
                                        >
                                            Criar primeira pelada
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100">
                                    {stats.peladasRecentes.map((pelada: any) => (
                                        <div key={pelada.id} className="group flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-zinc-100 rounded-sm flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:border group-hover:border-zinc-200 transition-all">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="text-sm font-medium text-zinc-900">{pelada.name}</h5>
                                                        {pelada.criadaPorMim && (
                                                            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 rounded-sm">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-zinc-500 mt-0.5">
                                                        {format(new Date(pelada.date), "dd 'de' MMM, yyyy", { locale: ptBR })} • <span className="uppercase tracking-wide text-[10px]">{pelada.type}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-1.5 mb-1">
                                                    <span className="text-sm font-bold text-zinc-900">{pelada.rating}</span>
                                                    <Trophy className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                </div>
                                                <div className="text-[10px] text-zinc-500 font-medium">
                                                    {pelada.goals} GOLS • {pelada.assists} ASSIST.
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Menu Rápido</h4>
                            <div className="space-y-2">
                                <Link
                                    href="/peladas"
                                    className="flex items-center gap-3 p-3 bg-white border border-zinc-200 hover:border-emerald-500/50 hover:shadow-sm rounded-sm transition-all group"
                                >
                                    <div className="w-8 h-8 bg-zinc-50 rounded-sm flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                        <Calendar className="w-4 h-4 text-zinc-500 group-hover:text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-medium text-zinc-700 group-hover:text-zinc-900">Minhas Peladas</span>
                                </Link>
                                <Link
                                    href="/estatisticas"
                                    className="flex items-center gap-3 p-3 bg-white border border-zinc-200 hover:border-emerald-500/50 hover:shadow-sm rounded-sm transition-all group"
                                >
                                    <div className="w-8 h-8 bg-zinc-50 rounded-sm flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                        <TrendingUp className="w-4 h-4 text-zinc-500 group-hover:text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-medium text-zinc-700 group-hover:text-zinc-900">Estatísticas Detalhadas</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}