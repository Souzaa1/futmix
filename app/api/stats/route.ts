import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

        // Buscar todas as peladas relacionadas ao usuário (onde participou OU criou)
        const peladasRelacionadas = await prisma.pelada.findMany({
            where: {
                OR: [
                    { createdById: userId }, // Peladas criadas pelo usuário
                    { players: { some: { userId } } } // Peladas onde o usuário participa
                ]
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                players: {
                    where: { userId },
                    select: {
                        rating: true,
                        goals: true,
                        assists: true
                    }
                }
            },
            orderBy: { date: "desc" }
        });

        // Processar as peladas para o formato esperado
        const todasAsPeladas = peladasRelacionadas.map(pelada => {
            const playerStat = pelada.players[0]; // Se o usuário participou, pegar suas estatísticas

            return {
                id: pelada.id,
                name: pelada.name,
                date: pelada.date,
                type: pelada.type,
                rating: playerStat ? playerStat.rating : 5.0, // Nota padrão se não participou
                goals: playerStat ? playerStat.goals : 0,
                assists: playerStat ? playerStat.assists : 0,
                participou: !!playerStat, // true se tem playerStats
                criadaPorMim: pelada.createdById === userId
            };
        });

        // Calcular estatísticas
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const peladasEsteMes = todasAsPeladas.filter(pelada =>
            new Date(pelada.date) >= startOfMonth
        );

        const totalPeladas = todasAsPeladas.length;
        const totalGols = todasAsPeladas.reduce((sum, pelada) => sum + pelada.goals, 0);
        const totalAssistencias = todasAsPeladas.reduce((sum, pelada) => sum + pelada.assists, 0);
        const golsEsteMes = peladasEsteMes.reduce((sum, pelada) => sum + pelada.goals, 0);
        const assistenciasEsteMes = peladasEsteMes.reduce((sum, pelada) => sum + pelada.assists, 0);

        const notaMedia = totalPeladas > 0
            ? todasAsPeladas.reduce((sum, pelada) => sum + pelada.rating, 0) / totalPeladas
            : 5.0;

        // Peladas recentes (últimas 5)
        const peladasRecentes = todasAsPeladas.slice(0, 5).map(pelada => ({
            id: pelada.id,
            name: pelada.name,
            date: pelada.date.toISOString(),
            type: pelada.type,
            rating: pelada.rating,
            goals: pelada.goals,
            assists: pelada.assists
        }));

        const stats = {
            totalPeladas,
            peladasEsteMes: peladasEsteMes.length,
            notaMedia: Math.round(notaMedia * 10) / 10, // Arredondar para 1 casa decimal
            totalGols,
            golsEsteMes,
            totalAssistencias,
            assistenciasEsteMes,
            peladasRecentes
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
