import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Aceitar convite e criar conta
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        // Buscar convite válido
        const invite = await prisma.invite.findUnique({
            where: { token },
            include: {
                pelada: true,
                inviter: { select: { name: true, email: true } }
            }
        });

        if (!invite) {
            return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
        }

        if (invite.used) {
            return NextResponse.json({ error: "Invite already used" }, { status: 400 });
        }

        if (new Date() > invite.expiresAt) {
            return NextResponse.json({ error: "Invite expired" }, { status: 400 });
        }

        // Verificar se já existe usuário com este email
        const existingUser = await prisma.user.findUnique({
            where: { email: invite.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                name: invite.name,
                email: invite.email,
                password: password, // Em produção, hash a senha
                role: "PLAYER"
            }
        });

        // Atualizar playerStats para vincular ao usuário
        await prisma.playerStats.updateMany({
            where: {
                inviteToken: token
            },
            data: {
                userId: user.id,
                isInvited: false,
                inviteToken: null,
                inviteExpiresAt: null
            }
        });

        // Marcar convite como usado
        await prisma.invite.update({
            where: { id: invite.id },
            data: {
                used: true,
                usedAt: new Date()
            }
        });

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: "Account created successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Error accepting invite:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET - Verificar convite
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const invite = await prisma.invite.findUnique({
            where: { token },
            include: {
                pelada: { select: { name: true, date: true, type: true } },
                inviter: { select: { name: true } }
            }
        });

        if (!invite) {
            return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
        }

        if (invite.used) {
            return NextResponse.json({ error: "Invite already used" }, { status: 400 });
        }

        if (new Date() > invite.expiresAt) {
            return NextResponse.json({ error: "Invite expired" }, { status: 400 });
        }

        return NextResponse.json({
            invite: {
                name: invite.name,
                email: invite.email,
                pelada: invite.pelada,
                inviter: invite.inviter,
                expiresAt: invite.expiresAt
            }
        });
    } catch (error) {
        console.error("Error checking invite:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
