import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; drawId: string }> }
) {
    try {
        const { drawId } = await params;
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const draw = await prisma.draw.findUnique({
            where: { id: drawId },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                teams: {
                    include: {
                        players: {
                            include: {
                                playerStats: {
                                    include: {
                                        user: {
                                            select: { id: true, name: true, email: true }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { name: "asc" }
                }
            }
        });

        if (!draw) {
            return NextResponse.json({ error: "Draw not found" }, { status: 404 });
        }

        return NextResponse.json(draw);
    } catch (error) {
        console.error("Error fetching draw:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; drawId: string }> }
) {
    try {
        const { id: peladaId, drawId } = await params;
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "PRESIDENT")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { isActive } = body;

        if (typeof isActive !== "boolean") {
            return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
        }

        if (isActive) {
            await prisma.draw.updateMany({
                where: {
                    peladaId,
                    isActive: true,
                    id: { not: drawId }
                },
                data: { isActive: false }
            });
        }

        const draw = await prisma.draw.update({
            where: { id: drawId },
            data: { isActive },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                teams: {
                    include: {
                        players: {
                            include: {
                                playerStats: {
                                    include: {
                                        user: {
                                            select: { id: true, name: true, email: true }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { name: "asc" }
                }
            }
        });

        return NextResponse.json(draw);
    } catch (error) {
        console.error("Error updating draw:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Deletar sorteio
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; drawId: string }> }
) {
    try {
        const { drawId } = await params;
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verificar permissões
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "PRESIDENT")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Verificar se o sorteio existe
        const draw = await prisma.draw.findUnique({
            where: { id: drawId }
        });

        if (!draw) {
            return NextResponse.json({ error: "Draw not found" }, { status: 404 });
        }

        // Deletar sorteio (cascade deleta teams e teamPlayers automaticamente)
        await prisma.draw.delete({
            where: { id: drawId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting draw:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

