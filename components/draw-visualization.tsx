"use client"

import { Draw } from "@/hooks/use-draws"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Trash2, Check, User, Shield, Activity, Target, Calendar, Grid3X3, Users, Share2, Copy } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

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

const formatDrawMessage = (draw: Draw): string => {
    const date = format(new Date(draw.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    const method = getMethodLabel(draw.method)

    let message = `⚽ *Sorteio de Times*\n\n`
    message += `📅 ${date}\n`
    message += `🎲 Método: ${method}\n`
    message += `👥 ${draw.numberOfTeams} Times | ${draw.playersPerTeam} Jogadores/Time\n\n`
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`

    draw.teams.forEach((team, index) => {
        message += `*${team.name}*\n`

        team.players.forEach((player, playerIndex) => {
            const playerName = player.playerStats.user?.name || player.playerStats.invitedPlayerName || "Jogador"
            const rating = player.playerStats.rating.toFixed(1)
            const positionLabel = player.position ? POSITION_LABELS[player.position as keyof typeof POSITION_LABELS] : null

            message += `${playerIndex + 1}. ${playerName} (${rating}`
            if (positionLabel) {
                message += ` - ${positionLabel}`
            }
            message += `)\n`
        })

        if (index < draw.teams.length - 1) {
            message += `\n`
        }
    })

    message += `\n━━━━━━━━━━━━━━━━━━━━`

    return message
}

export function DrawVisualization({
    draw,
    showActions = false,
    onDelete,
    onSetActive,
}: DrawVisualizationProps) {
    const handleShare = () => {
        const message = formatDrawMessage(draw)
        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
        window.open(whatsappUrl, '_blank')
    }

    const handleCopy = async () => {
        try {
            const message = formatDrawMessage(draw)
            await navigator.clipboard.writeText(message)
            toast.success("Mensagem copiada para a área de transferência!")
        } catch (error) {
            toast.error("Erro ao copiar mensagem")
        }
    }

    return (
        <div className={`space-y-6 rounded-xl border bg-white p-6 shadow-sm ${draw.isActive ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-zinc-200"}`}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                                Sorteio Realizado
                            </h2>
                            {draw.isActive && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                                    <Check className="h-3 w-3" />
                                    Ativo
                                </span>
                            )}
                        </div>
                        <p className="flex items-center gap-2 text-sm text-zinc-500">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(draw.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            <span className="text-zinc-300">•</span>
                            <span>Por {draw.createdBy.name}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-600">
                        <div className="flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1.5 border border-zinc-100">
                            <Grid3X3 className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{getMethodLabel(draw.method)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1.5 border border-zinc-100">
                            <Users className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{draw.numberOfTeams} Times</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1.5 border border-zinc-100">
                            <Users className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{draw.playersPerTeam} Jogadores/Time</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        className="h-9 border-blue-200 bg-blue-50 text-xs font-semibold tracking-wide text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Compartilhar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="h-9 w-9 border-zinc-200 bg-zinc-50 p-0 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-800"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                    {showActions && (
                        <>
                            {!draw.isActive && onSetActive && (
                                <Button
                                    variant="outline"
                                    onClick={() => onSetActive(draw.id)}
                                    className="h-9 border-emerald-200 bg-emerald-50 text-xs font-semibold uppercase tracking-wide text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Ativar Sorteio
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    onClick={() => onDelete(draw.id)}
                                    className="h-9 w-9 border-rose-200 bg-rose-50 p-0 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {draw.teams.map((team) => (
                    <div
                        key={team.id}
                        className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-sm"
                    >
                        <div
                            className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3"
                            style={{ borderTop: `4px solid ${team.color}` }}
                        >
                            <h3 className="font-bold text-zinc-900">{team.name}</h3>
                            <div className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-2 py-0.5 border border-zinc-100">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold text-zinc-700">{team.averageRating.toFixed(1)}</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-1 p-3">
                            {team.players.map((player) => {
                                const playerName = player.playerStats.user?.name || player.playerStats.invitedPlayerName || "Jogador"
                                const PositionIcon = player.position ? POSITION_ICONS[player.position as keyof typeof POSITION_ICONS] : null
                                const positionLabel = player.position ? POSITION_LABELS[player.position as keyof typeof POSITION_LABELS] : null

                                return (
                                    <div
                                        key={player.id}
                                        className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-white px-3 py-2"
                                    >
                                        <Avatar className="h-8 w-8 ring-2 ring-zinc-50" style={{ backgroundColor: team.color }}>
                                            <AvatarFallback className="bg-transparent text-[10px] font-bold text-white">
                                                {getInitials(playerName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-semibold text-zinc-700">
                                                {playerName}
                                            </p>
                                            <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-400">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-2.5 w-2.5" />
                                                    <span>{player.playerStats.rating.toFixed(1)}</span>
                                                </div>
                                                {positionLabel && PositionIcon && (
                                                    <>
                                                        <span className="h-0.5 w-0.5 rounded-full bg-zinc-300" />
                                                        <div className="flex items-center gap-1">
                                                            <PositionIcon className="h-2.5 w-2.5" />
                                                            <span>{positionLabel}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {team.players.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                                    <Users className="mb-2 h-8 w-8 opacity-20" />
                                    <p className="text-xs font-medium">Sem jogadores</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
