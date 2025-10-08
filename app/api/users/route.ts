import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar usuários
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (email) {
            // Buscar usuário específico por email
            const user = await prisma.user.findUnique({
                where: { email },
                select: { id: true, name: true, email: true, role: true }
            });

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            return NextResponse.json(user);
        }

        // Buscar todos os usuários (apenas para ADMIN)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
