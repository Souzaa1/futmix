import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar jogadores da pelada com paginação
export async function GET(
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

        // Paginação
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Contar total de jogadores
        const totalPlayers = await prisma.playerStats.count({
            where: { peladaId: id }
        });

        const players = await prisma.playerStats.findMany({
            where: { peladaId: id },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: [
                { isActive: "desc" },
                { rating: "desc" }
            ],
            skip,
            take: limit
        });

        return NextResponse.json({
            players,
            pagination: {
                page,
                limit,
                total: totalPlayers,
                totalPages: Math.ceil(totalPlayers / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching players:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - Adicionar jogador à pelada
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
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Verificar se a pelada existe
        const pelada = await prisma.pelada.findUnique({
            where: { id }
        });

        if (!pelada) {
            return NextResponse.json({ error: "Pelada not found" }, { status: 404 });
        }

        // Verificar se o usuário já está na pelada
        const existingPlayer = await prisma.playerStats.findUnique({
            where: {
                userId_peladaId: {
                    userId,
                    peladaId: id
                }
            }
        });

        if (existingPlayer) {
            return NextResponse.json({ error: "User already in pelada" }, { status: 400 });
        }

        // Adicionar jogador à pelada
        const playerStats = await prisma.playerStats.create({
            data: {
                userId,
                peladaId: id,
                rating: 5.0,
                goals: 0,
                assists: 0
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return NextResponse.json(playerStats, { status: 201 });
    } catch (error) {
        console.error("Error adding player to pelada:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Remover jogador da pelada
export async function DELETE(
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

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Verificar se o jogador está na pelada
        const playerStats = await prisma.playerStats.findUnique({
            where: {
                userId_peladaId: {
                    userId,
                    peladaId: id
                }
            }
        });

        if (!playerStats) {
            return NextResponse.json({ error: "Player not found in pelada" }, { status: 404 });
        }

        // Remover jogador da pelada
        await prisma.playerStats.delete({
            where: {
                userId_peladaId: {
                    userId,
                    peladaId: id
                }
            }
        });

        return NextResponse.json({ message: "Player removed from pelada successfully" });
    } catch (error) {
        console.error("Error removing player from pelada:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
