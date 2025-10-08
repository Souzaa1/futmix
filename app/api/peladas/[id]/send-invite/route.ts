import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";

// POST - Enviar convite para jogador existente
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
        const { playerId, email } = body;

        if (!playerId || !email) {
            return NextResponse.json({ error: "Player ID and email are required" }, { status: 400 });
        }

        // Verificar se a pelada existe
        const pelada = await prisma.pelada.findUnique({
            where: { id }
        });

        if (!pelada) {
            return NextResponse.json({ error: "Pelada not found" }, { status: 404 });
        }

        // Verificar se o usuário pode enviar convites
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && pelada.createdById !== session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Buscar o jogador
        const player = await prisma.playerStats.findUnique({
            where: { id: playerId }
        });

        if (!player) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        if (player.peladaId !== id) {
            return NextResponse.json({ error: "Player not in this pelada" }, { status: 400 });
        }

        // Gerar token de convite
        const inviteToken = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias para aceitar

        // Atualizar playerStats com dados do convite
        const updatedPlayer = await prisma.playerStats.update({
            where: { id: playerId },
            data: {
                invitedPlayerEmail: email,
                isInvited: true,
                inviteToken,
                inviteExpiresAt: expiresAt
            }
        });

        // Criar registro de convite
        const invite = await prisma.invite.create({
            data: {
                token: inviteToken,
                email,
                name: player.invitedPlayerName || "Jogador",
                peladaId: id,
                invitedBy: session.user.id,
                expiresAt
            }
        });

        return NextResponse.json({
            player: updatedPlayer,
            invite,
            message: "Invite sent successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error sending invite:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
