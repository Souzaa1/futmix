import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT - Atualizar estatísticas do jogador
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; playerId: string }> }
) {
    try {
        const { id, playerId } = await params;
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { rating, goals, assists, isActive } = body;

        // Verificar se o jogador está na pelada (buscar por userId ou id)
        let playerStats = await prisma.playerStats.findFirst({
            where: {
                AND: [
                    { peladaId: id },
                    {
                        OR: [
                            { userId: playerId },
                            { id: playerId }
                        ]
                    }
                ]
            }
        });

        if (!playerStats) {
            return NextResponse.json({ error: "Player not found in pelada" }, { status: 404 });
        }

        // Atualizar estatísticas usando o ID do playerStats
        const updatedStats = await prisma.playerStats.update({
            where: {
                id: playerStats.id
            },
            data: {
                ...(rating !== undefined && { rating }),
                ...(goals !== undefined && { goals }),
                ...(assists !== undefined && { assists }),
                ...(isActive !== undefined && { isActive })
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return NextResponse.json(updatedStats);
    } catch (error) {
        console.error("Error updating player stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
