import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || session.user.id;

        // Buscar todas as peladas onde o usuário participou (tem playerStats)
        const playerStats = await prisma.playerStats.findMany({
            where: {
                userId: userId,
                isActive: true,
            },
            include: {
                pelada: {
                    select: {
                        id: true,
                        name: true,
                        date: true,
                        type: true,
                    }
                }
            },
            orderBy: {
                pelada: {
                    date: "desc"
                }
            }
        });

        // Time Series: Agrupar por mês
        const now = new Date();
        const sixMonthsAgo = subMonths(now, 6);
        const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

        const timeSeries = months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            const statsInMonth = playerStats.filter(stat => {
                const peladaDate = new Date(stat.pelada.date);
                return peladaDate >= monthStart && peladaDate <= monthEnd;
            });

            return {
                period: format(month, "MMM/yyyy", { locale: ptBR }),
                month: format(month, "yyyy-MM"),
                rating: statsInMonth.length > 0
                    ? statsInMonth.reduce((sum, s) => sum + s.rating, 0) / statsInMonth.length
                    : 0,
                goals: statsInMonth.reduce((sum, s) => sum + s.goals, 0),
                assists: statsInMonth.reduce((sum, s) => sum + s.assists, 0),
                peladas: statsInMonth.length
            };
        }).filter(item => item.peladas > 0); // Remover meses sem peladas

        // Por Posição
        const byPosition: Record<string, { count: number; avgRating: number; totalGoals: number; totalAssists: number }> = {
            GOLEIRO: { count: 0, avgRating: 0, totalGoals: 0, totalAssists: 0 },
            ZAGUEIRO: { count: 0, avgRating: 0, totalGoals: 0, totalAssists: 0 },
            MEIO: { count: 0, avgRating: 0, totalGoals: 0, totalAssists: 0 },
            ATACANTE: { count: 0, avgRating: 0, totalGoals: 0, totalAssists: 0 },
        };

        playerStats.forEach(stat => {
            if (stat.position) {
                const pos = stat.position as keyof typeof byPosition;
                if (byPosition[pos]) {
                    byPosition[pos].count++;
                    byPosition[pos].totalGoals += stat.goals;
                    byPosition[pos].totalAssists += stat.assists;
                }
            }
        });

        // Calcular médias por posição
        Object.keys(byPosition).forEach(pos => {
            const posKey = pos as keyof typeof byPosition;
            if (byPosition[posKey].count > 0) {
                const statsInPosition = playerStats.filter(s => s.position === pos);
                byPosition[posKey].avgRating = statsInPosition.reduce((sum, s) => sum + s.rating, 0) / statsInPosition.length;
            }
        });

        // Por Pelada: Lista completa
        const byPelada = playerStats.map(stat => ({
            id: stat.pelada.id,
            name: stat.pelada.name,
            date: stat.pelada.date.toISOString(),
            type: stat.pelada.type,
            rating: stat.rating,
            goals: stat.goals,
            assists: stat.assists,
            position: stat.position
        }));

        // Rankings
        const ratings = playerStats.map(s => s.rating);
        const goals = playerStats.map(s => s.goals);
        const assists = playerStats.map(s => s.assists);

        const rankings = {
            bestRating: ratings.length > 0 ? Math.max(...ratings) : 0,
            worstRating: ratings.length > 0 ? Math.min(...ratings) : 0,
            bestGoals: goals.length > 0 ? Math.max(...goals) : 0,
            bestAssists: assists.length > 0 ? Math.max(...assists) : 0,
            avgRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
            totalGoals: goals.reduce((a, b) => a + b, 0),
            totalAssists: assists.reduce((a, b) => a + b, 0),
            totalPeladas: playerStats.length,
        };

        // Comparações: Este mês vs Mês anterior
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const thisMonthStats = playerStats.filter(stat => {
            const peladaDate = new Date(stat.pelada.date);
            return peladaDate >= currentMonthStart && peladaDate <= currentMonthEnd;
        });

        const lastMonthStats = playerStats.filter(stat => {
            const peladaDate = new Date(stat.pelada.date);
            return peladaDate >= lastMonthStart && peladaDate <= lastMonthEnd;
        });

        const calculateMonthStats = (stats: typeof playerStats) => {
            if (stats.length === 0) {
                return {
                    peladas: 0,
                    avgRating: 0,
                    totalGoals: 0,
                    totalAssists: 0,
                };
            }
            return {
                peladas: stats.length,
                avgRating: stats.reduce((sum, s) => sum + s.rating, 0) / stats.length,
                totalGoals: stats.reduce((sum, s) => sum + s.goals, 0),
                totalAssists: stats.reduce((sum, s) => sum + s.assists, 0),
            };
        };

        const thisMonth = calculateMonthStats(thisMonthStats);
        const lastMonth = calculateMonthStats(lastMonthStats);

        const comparisons = {
            thisMonth,
            lastMonth,
            trends: {
                rating: thisMonth.avgRating - lastMonth.avgRating,
                goals: thisMonth.totalGoals - lastMonth.totalGoals,
                assists: thisMonth.totalAssists - lastMonth.totalAssists,
                peladas: thisMonth.peladas - lastMonth.peladas,
            }
        };

        const detailedStats = {
            timeSeries,
            byPosition,
            byPelada,
            rankings,
            comparisons,
        };

        return NextResponse.json(detailedStats);
    } catch (error) {
        console.error("Error fetching detailed stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

