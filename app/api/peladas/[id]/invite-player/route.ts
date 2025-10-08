import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";

// POST - Adicionar jogador convidado à pelada
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
        const { name, email } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
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

        // Verificar se o jogador já está na pelada
        const existingPlayer = await prisma.playerStats.findFirst({
            where: {
                peladaId: id,
                OR: [
                    { userId: { not: null }, user: { email } },
                    { invitedPlayerEmail: email }
                ]
            }
        });

        if (existingPlayer) {
            return NextResponse.json({ error: "Player already in pelada" }, { status: 400 });
        }

        // Gerar token de convite
        const inviteToken = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias para aceitar

        // Criar playerStats para jogador convidado
        const playerStats = await prisma.playerStats.create({
            data: {
                peladaId: id,
                invitedPlayerName: name,
                invitedPlayerEmail: email,
                isInvited: true,
                inviteToken,
                inviteExpiresAt: expiresAt,
                rating: 5.0,
                goals: 0,
                assists: 0
            }
        });

        // Criar registro de convite
        const invite = await prisma.invite.create({
            data: {
                token: inviteToken,
                email,
                name,
                peladaId: id,
                invitedBy: session.user.id,
                expiresAt
            }
        });

        return NextResponse.json({
            playerStats,
            invite,
            message: "Player invited successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Error inviting player:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
