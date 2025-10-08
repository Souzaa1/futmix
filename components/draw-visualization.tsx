"use client"

import { Draw } from "@/hooks/use-draws"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Trash2, Check, User, Shield, Activity, Target } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DrawVisualizationProps {
    draw: Draw
    showActions?: boolean
    onDelete?: (drawId: string) => void
    onSetActive?: (drawId: string) => void
}

const POSITION_ICONS = {
    GOLEIRO: Shield,
    ZAGUEIRO: User,
    MEIO: Activity,
    ATACANTE: Target,
}

const POSITION_LABELS = {
    GOLEIRO: "GOL",
    ZAGUEIRO: "ZAG",
    MEIO: "MEI",
    ATACANTE: "ATA",
}

const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
        AUTO_BALANCED: "Balanceado",
        AUTO_RANDOM: "Aleatório",
        MANUAL: "Manual",
    }
    return labels[method] || method
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function DrawVisualization({
    draw,
    showActions = false,
    onDelete,
    onSetActive,
}: DrawVisualizationProps) {
    return (
        <Card className={draw.isActive ? "border-emerald-500 border-2" : ""}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">
                                Sorteio - {format(new Date(draw.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </CardTitle>
                            {draw.isActive && (
                                <Badge className="bg-emerald-600">
                                    <Check className="w-3 h-3 mr-1" />
                                    Ativo
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{getMethodLabel(draw.method)}</Badge>
                            <span>•</span>
                            <span>{draw.numberOfTeams} times</span>
                            <span>•</span>
                            <span>{draw.playersPerTeam} jogadores/time</span>
                            <span>•</span>
                            <span>Por {draw.createdBy.name}</span>
                        </div>
                    </div>
                    {showActions && (
                        <div className="flex items-center gap-2">
                            {!draw.isActive && onSetActive && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onSetActive(draw.id)}
                                    className="text-emerald-700 hover:text-emerald-500 hover:bg-emerald-50"
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Ativar
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(draw.id)}
                                    className="text-rose-700 hover:text-rose-500 hover:bg-rose-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {draw.teams.map((team) => (
                        <Card
                            key={team.id}
                            className="overflow-hidden"
                            style={{
                                borderTop: `4px solid ${team.color}`,
                            }}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {team.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-semibold">{team.averageRating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {team.players.map((player) => {
                                    const playerName = player.playerStats.user?.name || player.playerStats.invitedPlayerName || "Jogador";
                                    const PositionIcon = player.position ? POSITION_ICONS[player.position as keyof typeof POSITION_ICONS] : null;
                                    const positionLabel = player.position ? POSITION_LABELS[player.position as keyof typeof POSITION_LABELS] : null;

                                    return (
                                        <div
                                            key={player.id}
                                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                                        >
                                            <Avatar className="h-8 w-8" style={{ backgroundColor: team.color }}>
                                                <AvatarFallback className="bg-transparent text-white text-xs font-semibold">
                                                    {getInitials(playerName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{playerName}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-yellow-500" />
                                                        <span>{player.playerStats.rating.toFixed(1)}</span>
                                                    </div>
                                                    {positionLabel && PositionIcon && (
                                                        <div className="flex items-center gap-1">
                                                            <PositionIcon className="w-3 h-3" />
                                                            <span>{positionLabel}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {team.players.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Nenhum jogador
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

