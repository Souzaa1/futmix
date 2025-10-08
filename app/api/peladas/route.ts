import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar peladas
export async function GET(request: NextRequest) {
    try {
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

        // Contar total de peladas
        const totalPeladas = await prisma.pelada.count({
            where: {
                OR: [
                    { createdById: session.user.id },
                    { players: { some: { userId: session.user.id } } }
                ]
            }
        });

        const peladas = await prisma.pelada.findMany({
            where: {
                OR: [
                    { createdById: session.user.id },
                    { players: { some: { userId: session.user.id } } }
                ]
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                players: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                _count: {
                    select: { players: true }
                }
            },
            orderBy: { date: "desc" },
            skip,
            take: limit
        });

        return NextResponse.json({
            peladas,
            pagination: {
                page,
                limit,
                total: totalPeladas,
                totalPages: Math.ceil(totalPeladas / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching peladas:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - Criar nova pelada
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verificar se o usuário pode criar peladas
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "PRESIDENT")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { name, type, date } = body;

        if (!name || !type || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const pelada = await prisma.pelada.create({
            data: {
                name,
                type,
                date: new Date(date),
                createdById: session.user.id
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                players: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        return NextResponse.json(pelada, { status: 201 });
    } catch (error) {
        console.error("Error creating pelada:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
