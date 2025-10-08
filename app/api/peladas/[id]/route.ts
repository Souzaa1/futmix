import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar pelada específica
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

        const pelada = await prisma.pelada.findUnique({
            where: { id },
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
            }
        });

        if (!pelada) {
            return NextResponse.json({ error: "Pelada not found" }, { status: 404 });
        }

        return NextResponse.json(pelada);
    } catch (error) {
        console.error("Error fetching pelada:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT - Atualizar pelada
export async function PUT(
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

        const pelada = await prisma.pelada.findUnique({
            where: { id },
            select: { createdById: true }
        });

        if (!pelada) {
            return NextResponse.json({ error: "Pelada not found" }, { status: 404 });
        }

        // Verificar se o usuário pode editar esta pelada
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && pelada.createdById !== session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { name, type, date } = body;

        const updatedPelada = await prisma.pelada.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(date && { date: new Date(date) })
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

        return NextResponse.json(updatedPelada);
    } catch (error) {
        console.error("Error updating pelada:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Deletar pelada
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

        const pelada = await prisma.pelada.findUnique({
            where: { id },
            select: { createdById: true }
        });

        if (!pelada) {
            return NextResponse.json({ error: "Pelada not found" }, { status: 404 });
        }

        // Verificar se o usuário pode deletar esta pelada
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && pelada.createdById !== session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.pelada.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Pelada deleted successfully" });
    } catch (error) {
        console.error("Error deleting pelada:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
