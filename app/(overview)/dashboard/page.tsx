"use client"

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import { useStats } from "@/hooks/use-stats";
import { Calendar, Users, Trophy, Plus, LogOut, User, Settings, TrendingUp, Target, Award } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Home() {
    const { data: session, isPending } = useSession();
    const { canCreatePelada, role } = useRole();
    const { stats, loading: statsLoading, error: statsError } = useStats();

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
                    <div className="text-lg font-medium text-gray-700">Carregando...</div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-lg w-full">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 text-center border border-white/20">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-3">
                            Futmix
                        </h1>
                        <p className="text-gray-600 text-lg mb-8">
                            A melhor plataforma para organizar e gerenciar suas peladas de futebol
                        </p>
                        <Link
                            href="/login"
                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-8 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 inline-flex items-center justify-center gap-2"
                        >
                            <User className="w-5 h-5" />
                            Entrar na Plataforma
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30">
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo de volta, {session.user.name.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Gerencie suas peladas e acompanhe seu desempenho
                    </p>
                </div>

                {statsError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-800">Erro ao carregar estatísticas: {statsError}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                Total
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Peladas Participadas</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {statsLoading ? "..." : stats.totalPeladas}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Este mês: {statsLoading ? "..." : stats.peladasEsteMes}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/30">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                Média
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Nota Média</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {statsLoading ? "..." : stats.notaMedia}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            {statsLoading ? "..." : "⭐".repeat(Math.floor(stats.notaMedia))}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                Gols
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Gols Marcados</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {statsLoading ? "..." : stats.totalGols}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Este mês: {statsLoading ? "..." : stats.golsEsteMes}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/30">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                Rank
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Assistências</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {statsLoading ? "..." : stats.totalAssistencias}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Este mês: {statsLoading ? "..." : stats.assistenciasEsteMes}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-full">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Suas Peladas</h3>
                                        <p className="text-sm text-gray-600">Gerencie e acompanhe seus jogos</p>
                                    </div>
                                    {canCreatePelada() && (
                                        <Link
                                            href="/peladas/nova"
                                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md shadow-emerald-500/30 hover:shadow-lg inline-flex items-center gap-2 font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Nova Pelada
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {statsLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Carregando peladas...</p>
                                    </div>
                                ) : stats.peladasRecentes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Calendar className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                                            Nenhuma pelada encontrada
                                        </h4>
                                        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                                            {canCreatePelada()
                                                ? "Crie sua primeira pelada e comece a organizar os jogos com seus amigos."
                                                : "Você ainda não está participando de nenhuma pelada no momento."
                                            }
                                        </p>
                                        {canCreatePelada() && (
                                            <Link
                                                href="/peladas/nova"
                                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl inline-flex items-center gap-2 font-semibold"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Criar Primeira Pelada
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Peladas Recentes</h4>
                                        {stats.peladasRecentes.map((pelada) => (
                                            <div key={pelada.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                                        <Calendar className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="font-semibold text-gray-900">{pelada.name}</h5>
                                                            {pelada.criadaPorMim && (
                                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                                    Criada por você
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {format(new Date(pelada.date), "dd/MM/yyyy", { locale: ptBR })} • {pelada.type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                                        <span className="font-semibold text-gray-900">{pelada.rating}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {pelada.goals} gols • {pelada.assists} assistências
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t border-gray-200">
                                            <Link
                                                href="/peladas"
                                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors font-medium text-center inline-block"
                                            >
                                                Ver Todas as Peladas
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-600" />
                                Perfil
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {session.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{session.user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Função</span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${role === 'ADMIN' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                                            role === 'PRESIDENT' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                                                'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                            }`}>
                                            {role}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href="/perfil"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                                >
                                    <Settings className="w-4 h-4" />
                                    Editar Perfil
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-600" />
                                Ações Rápidas
                            </h4>
                            <div className="space-y-2">
                                <Link
                                    href="/peladas"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Ver Todas as Peladas</span>
                                </Link>
                                <Link
                                    href="/estatisticas"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                        <Trophy className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Minhas Estatísticas</span>
                                </Link>
                                <Link
                                    href="/jogadores"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Buscar Jogadores</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}