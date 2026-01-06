import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const TEAM_COLORS = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#F97316",
    "#EC4899",
    "#06B6D4",
];

function separatePlayersByPosition(players: any[]) {
    const goalkeepers = players.filter((p: any) => p.position === "GOLEIRO")
    const linePlayers = players.filter((p: any) => p.position !== "GOLEIRO" || !p.position)
    return { goalkeepers, linePlayers }
}

function balancedDraft(
    players: any[],
    numberOfTeams: number,
    playersPerTeam: number,
    fixedGoalkeepers: boolean = false,
    linePlayersPerTeam: number = 0
) {
    const teams: any[][] = Array.from({ length: numberOfTeams }, () => []);

    if (fixedGoalkeepers && linePlayersPerTeam > 0) {
        const { goalkeepers, linePlayers } = separatePlayersByPosition(players);

        const sortedGoalkeepers = [...goalkeepers].sort((a: any, b: any) => b.rating - a.rating);
        const availableGoalkeepers = goalkeepers.length;
        const teamsWithGoalkeeper = Math.min(availableGoalkeepers, numberOfTeams);

        for (let i = 0; i < teamsWithGoalkeeper; i++) {
            teams[i].push(sortedGoalkeepers[i]);
        }


        const sortedLinePlayers = [...linePlayers].sort((a: any, b: any) => b.rating - a.rating);

        let linePlayerIndex = 0;

        const totalLinePlayersNeeded = numberOfTeams * linePlayersPerTeam;

        for (let round = 0; round < linePlayersPerTeam; round++) {
            const teamOrder = round % 2 === 0
                ? Array.from({ length: numberOfTeams }, (_, i) => i)
                : Array.from({ length: numberOfTeams }, (_, i) => numberOfTeams - 1 - i);

            for (const teamIndex of teamOrder) {
                if (linePlayerIndex < totalLinePlayersNeeded && linePlayerIndex < sortedLinePlayers.length) {
                    teams[teamIndex].push(sortedLinePlayers[linePlayerIndex]);
                    linePlayerIndex++;
                }
            }
        }
    } else {
        const sortedPlayers = [...players].sort((a: any, b: any) => b.rating - a.rating);
        let playerIndex = 0;
        const totalPlayers = numberOfTeams * playersPerTeam;

        for (let round = 0; round < playersPerTeam; round++) {
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
    }

    return teams;
}

function randomDraw(
    players: any[],
    numberOfTeams: number,
    playersPerTeam: number,
    fixedGoalkeepers: boolean = false,
    linePlayersPerTeam: number = 0
) {
    const teams: any[][] = Array.from({ length: numberOfTeams }, () => []);

    if (fixedGoalkeepers && linePlayersPerTeam > 0) {
        const { goalkeepers, linePlayers } = separatePlayersByPosition(players);

        const shuffledGoalkeepers = [...goalkeepers].sort(() => Math.random() - 0.5);
        const availableGoalkeepers = goalkeepers.length;
        const teamsWithGoalkeeper = Math.min(availableGoalkeepers, numberOfTeams);

        for (let i = 0; i < teamsWithGoalkeeper; i++) {
            teams[i].push(shuffledGoalkeepers[i]);
        }

        const shuffledLinePlayers = [...linePlayers].sort(() => Math.random() - 0.5);

        let linePlayerIndex = 0;
        const totalLinePlayersNeeded = numberOfTeams * linePlayersPerTeam;

        for (let i = linePlayerIndex; i < totalLinePlayersNeeded && i < shuffledLinePlayers.length; i++) {
            const teamIndex = (i - linePlayerIndex) % numberOfTeams;
            teams[teamIndex].push(shuffledLinePlayers[i]);
        }
    } else {
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        const totalPlayers = numberOfTeams * playersPerTeam;

        for (let i = 0; i < totalPlayers && i < shuffled.length; i++) {
            const teamIndex = i % numberOfTeams;
            teams[teamIndex].push(shuffled[i]);
        }
    }

    return teams;
}

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

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "PRESIDENT")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { method, numberOfTeams, playersPerTeam, manualTeams, fixedGoalkeepers, linePlayersPerTeam } = body;

        if (!method || !numberOfTeams || !playersPerTeam) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (numberOfTeams < 2) {
            return NextResponse.json({ error: "É necessário pelo menos 2 times" }, { status: 400 });
        }

        if (playersPerTeam < 1) {
            return NextResponse.json({ error: "É necessário pelo menos 1 jogador por time" }, { status: 400 });
        }

        const activePlayers = await prisma.playerStats.findMany({
            where: {
                peladaId,
                isActive: true,
                isWaitingList: false
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        if (fixedGoalkeepers && linePlayersPerTeam) {
            const { goalkeepers, linePlayers } = separatePlayersByPosition(activePlayers);
            const availableGoalkeepers = goalkeepers.length;
            const teamsWithGoalkeeper = Math.min(availableGoalkeepers, numberOfTeams);
            const missingGoalkeepers = Math.max(0, numberOfTeams - teamsWithGoalkeeper);
            const neededLinePlayers = numberOfTeams * linePlayersPerTeam;

            if (linePlayers.length < neededLinePlayers) {
                return NextResponse.json({
                    error: `Jogadores de linha insuficientes. Necessário: ${neededLinePlayers} jogadores de linha (${numberOfTeams * linePlayersPerTeam} para linha + ${missingGoalkeepers} para completar goleiros), Disponível: ${linePlayers.length}`
                }, { status: 400 });
            }
        } else {
            const totalNeededPlayers = numberOfTeams * playersPerTeam;
            if (activePlayers.length < totalNeededPlayers) {
                return NextResponse.json({
                    error: `Jogadores insuficientes. Necessário: ${totalNeededPlayers}, Disponível: ${activePlayers.length}`
                }, { status: 400 });
            }
        }

        await prisma.draw.updateMany({
            where: {
                peladaId,
                isActive: true
            },
            data: { isActive: false }
        });

        let teamsData: any[][];

        if (method === "MANUAL" && manualTeams) {
            teamsData = manualTeams.map((team: any) =>
                team.players.map((p: any) =>
                    activePlayers.find((ap: any) => ap.id === p.playerStatsId)
                ).filter((b: any) => Boolean(b))
            );
        } else if (method === "AUTO_BALANCED") {
            teamsData = balancedDraft(
                activePlayers,
                numberOfTeams,
                playersPerTeam,
                fixedGoalkeepers || false,
                linePlayersPerTeam || 0
            );
        } else {
            teamsData = randomDraw(
                activePlayers,
                numberOfTeams,
                playersPerTeam,
                fixedGoalkeepers || false,
                linePlayersPerTeam || 0
            );
        }

        const draw = await prisma.draw.create({
            data: {
                peladaId,
                createdById: session.user.id,
                method,
                numberOfTeams,
                playersPerTeam,
                isActive: true,
                teams: {
                    create: teamsData.map((teamPlayers: any, index: number) => {
                        const teamName = method === "MANUAL" && manualTeams?.[index]?.name
                            ? manualTeams[index].name
                            : `Time ${String.fromCharCode(65 + index)}`;

                        const teamColor = method === "MANUAL" && manualTeams?.[index]?.color
                            ? manualTeams[index].color
                            : TEAM_COLORS[index % TEAM_COLORS.length];

                        const totalRating = teamPlayers.reduce((sum: any, p: any) => sum + p.rating, 0);
                        const averageRating = teamPlayers.length > 0 ? totalRating / teamPlayers.length : 0;

                        return {
                            name: teamName,
                            color: teamColor,
                            averageRating,
                            players: {
                                create: teamPlayers.map((player: any, playerIndex: number) => ({
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

