import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Cores pré-definidas para times
const TEAM_COLORS = [
    "#3B82F6", // Azul
    "#EF4444", // Vermelho
    "#10B981", // Verde
    "#F59E0B", // Amarelo
    "#8B5CF6", // Roxo
    "#F97316", // Laranja
    "#EC4899", // Rosa
    "#06B6D4", // Cyan
];

// Algoritmo de balanceamento por draft (serpente)
function balancedDraft(
    players: any[],
    numberOfTeams: number,
    playersPerTeam: number
) {
    // Ordenar jogadores por rating (maior para menor)
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

    // Criar arrays vazios para cada time
    const teams: any[][] = Array.from({ length: numberOfTeams }, () => []);

    // Distribuir jogadores em modo serpente (draft)
    let playerIndex = 0;
    const totalPlayers = numberOfTeams * playersPerTeam;

    for (let round = 0; round < playersPerTeam; round++) {
        // Se o round é par, vai do primeiro ao último time
        // Se o round é ímpar, vai do último ao primeiro time (serpente)
        const teamOrder = round % 2 === 0
            ? Array.from({ length: numberOfTeams }, (_, i) => i)
            : Array.from({ length: numberOfTeams }, (_, i) => numberOfTeams - 1 - i);

        for (const teamIndex of teamOrder) {
            if (playerIndex < totalPlayers && playerIndex < sortedPlayers.length) {
                teams[teamIndex].push(sortedPlayers[playerIndex]);
                playerIndex++;
            }
        }
    }

    return teams;
}

// Algoritmo de sorteio aleatório
function randomDraw(
    players: any[],
    numberOfTeams: number,
    playersPerTeam: number
) {
    // Embaralhar jogadores
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    // Distribuir em times
    const teams: any[][] = Array.from({ length: numberOfTeams }, () => []);
    const totalPlayers = numberOfTeams * playersPerTeam;

    for (let i = 0; i < totalPlayers && i < shuffled.length; i++) {
        const teamIndex = i % numberOfTeams;
        teams[teamIndex].push(shuffled[i]);
    }

    return teams;
}

// GET - Listar todos os sorteios da pelada
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

        const draws = await prisma.draw.findMany({
            where: { peladaId: id },
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
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(draws);
    } catch (error) {
        console.error("Error fetching draws:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - Criar novo sorteio
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: peladaId } = await params;
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

        const body = await request.json();
        const { method, numberOfTeams, playersPerTeam, manualTeams } = body;

        // Validações
        if (!method || !numberOfTeams || !playersPerTeam) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (numberOfTeams < 2) {
            return NextResponse.json({ error: "É necessário pelo menos 2 times" }, { status: 400 });
        }

        if (playersPerTeam < 1) {
            return NextResponse.json({ error: "É necessário pelo menos 1 jogador por time" }, { status: 400 });
        }

        // Buscar jogadores ativos da pelada
        const activePlayers = await prisma.playerStats.findMany({
            where: {
                peladaId,
                isActive: true
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        const totalNeededPlayers = numberOfTeams * playersPerTeam;

        if (activePlayers.length < totalNeededPlayers) {
            return NextResponse.json({
                error: `Jogadores insuficientes. Necessário: ${totalNeededPlayers}, Disponível: ${activePlayers.length}`
            }, { status: 400 });
        }

        // Desativar sorteios anteriores
        await prisma.draw.updateMany({
            where: {
                peladaId,
                isActive: true
            },
            data: { isActive: false }
        });

        let teamsData: any[][];

        if (method === "MANUAL" && manualTeams) {
            // Sorteio manual (usuário define os times)
            teamsData = manualTeams.map((team: any) =>
                team.players.map((p: any) =>
                    activePlayers.find(ap => ap.id === p.playerStatsId)
                ).filter(Boolean)
            );
        } else if (method === "AUTO_BALANCED") {
            // Sorteio balanceado (draft)
            teamsData = balancedDraft(activePlayers, numberOfTeams, playersPerTeam);
        } else {
            // Sorteio aleatório
            teamsData = randomDraw(activePlayers, numberOfTeams, playersPerTeam);
        }

        // Criar sorteio
        const draw = await prisma.draw.create({
            data: {
                peladaId,
                createdById: session.user.id,
                method,
                numberOfTeams,
                playersPerTeam,
                isActive: true,
                teams: {
                    create: teamsData.map((teamPlayers, index) => {
                        const teamName = method === "MANUAL" && manualTeams?.[index]?.name
                            ? manualTeams[index].name
                            : `Time ${String.fromCharCode(65 + index)}`; // A, B, C...

                        const teamColor = method === "MANUAL" && manualTeams?.[index]?.color
                            ? manualTeams[index].color
                            : TEAM_COLORS[index % TEAM_COLORS.length];

                        const totalRating = teamPlayers.reduce((sum, p) => sum + p.rating, 0);
                        const averageRating = teamPlayers.length > 0 ? totalRating / teamPlayers.length : 0;

                        return {
                            name: teamName,
                            color: teamColor,
                            averageRating,
                            players: {
                                create: teamPlayers.map((player, playerIndex) => ({
                                    playerStatsId: player.id,
                                    position: method === "MANUAL" && manualTeams?.[index]?.players?.[playerIndex]?.position
                                        ? manualTeams[index].players[playerIndex].position
                                        : null
                                }))
                            }
                        };
                    })
                }
            },
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

        return NextResponse.json(draw, { status: 201 });
    } catch (error) {
        console.error("Error creating draw:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

