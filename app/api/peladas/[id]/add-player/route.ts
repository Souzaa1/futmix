import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Adicionar jogador apenas com nome
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, rating, position, isWaitingList } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Verificar se a pelada existe
        const pelada = await prisma.pelada.findUnique({
            where: { id },
            include: { createdBy: true }
        });

        if (!pelada) {
            return NextResponse.json({ error: "Pelada not found" }, { status: 404 });
        }

        // Verificar se o usuário pode adicionar jogadores
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && pelada.createdById !== session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Verificar se já existe jogador com este nome na pelada
        const existingPlayer = await prisma.playerStats.findFirst({
            where: {
                peladaId: id,
                invitedPlayerName: name
            }
        });

        if (existingPlayer) {
            return NextResponse.json({ error: "Player with this name already exists in pelada" }, { status: 400 });
        }

        // Criar playerStats para jogador local
        const playerStats = await prisma.playerStats.create({
            data: {
                peladaId: id,
                invitedPlayerName: name,
                isInvited: false,
                rating: rating,
                goals: 0,
                assists: 0,
                position: position || null,
                isWaitingList: isWaitingList || false
            }
        });

        return NextResponse.json({
            playerStats,
            message: "Player added successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Error adding player:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
