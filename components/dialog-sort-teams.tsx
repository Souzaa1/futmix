"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shuffle, Loader2, Users, AlertCircle, Check, Scale, Trophy, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Player {
    id: string
    rating: number
    position: string | null
    user: {
        name: string
    } | null
    invitedPlayerName: string | null
}

interface DialogSortTeamsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    activePlayers: Player[]
    onCreateDraw: (config: {
        method: "MANUAL" | "AUTO_RANDOM" | "AUTO_BALANCED"
        numberOfTeams: number
        playersPerTeam: number
        fixedGoalkeepers: boolean
        linePlayersPerTeam?: number
    }) => Promise<void>
}

export function DialogSortTeams({
    open,
    onOpenChange,
    activePlayers,
    onCreateDraw,
}: DialogSortTeamsProps) {
    const [method, setMethod] = useState<"MANUAL" | "AUTO_RANDOM" | "AUTO_BALANCED">("AUTO_BALANCED")
    const [numberOfTeams, setNumberOfTeams] = useState(2)
    const [linePlayersPerTeam, setLinePlayersPerTeam] = useState(6)
    const [fixedGoalkeepers, setFixedGoalkeepers] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const goalkeepers = activePlayers.filter(p => p.position === "GOLEIRO")
    const linePlayers = activePlayers.filter(p => p.position !== "GOLEIRO" || !p.position)

    let neededGoalkeepers = 0
    let neededLinePlayers = 0
    let missingGoalkeepers = 0
    let availableGoalkeepers = 0
    let teamsWithGoalkeeper = 0

    if (fixedGoalkeepers) {
        availableGoalkeepers = goalkeepers.length
        teamsWithGoalkeeper = Math.min(availableGoalkeepers, numberOfTeams)
        missingGoalkeepers = Math.max(0, numberOfTeams - teamsWithGoalkeeper)
        neededGoalkeepers = availableGoalkeepers
        // Jogadores de linha necessários: apenas para linha
        // Times sem goleiro fixo não precisam de jogador de linha como goleiro
        // Eles usam o goleiro do time que estão substituindo
        neededLinePlayers = numberOfTeams * linePlayersPerTeam
    } else {
        neededGoalkeepers = 0
        neededLinePlayers = numberOfTeams * (linePlayersPerTeam + 1)
        missingGoalkeepers = 0
    }

    const totalNeededPlayers = neededGoalkeepers + (numberOfTeams * linePlayersPerTeam)

    const hasEnoughGoalkeepers = fixedGoalkeepers ? true : true
    const hasEnoughLinePlayers = linePlayers.length >= neededLinePlayers
    const hasEnoughTotalPlayers = fixedGoalkeepers
        ? (linePlayers.length >= neededLinePlayers)
        : (activePlayers.length >= neededLinePlayers)

    const canCompleteWithLinePlayers = fixedGoalkeepers
        ? (linePlayers.length >= neededLinePlayers)
        : hasEnoughLinePlayers

    const hasEnoughPlayers = hasEnoughTotalPlayers && canCompleteWithLinePlayers

    const remainingGoalkeepers = fixedGoalkeepers ? Math.max(0, goalkeepers.length - teamsWithGoalkeeper) : 0
    const remainingLinePlayers = linePlayers.length - neededLinePlayers

    useEffect(() => {
        if (fixedGoalkeepers) {
            const maxLinePlayers = Math.floor(linePlayers.length / numberOfTeams)
            if (linePlayersPerTeam > maxLinePlayers) {
                setLinePlayersPerTeam(Math.max(1, maxLinePlayers))
            }
        } else {
            const maxPlayersPerTeam = Math.floor(activePlayers.length / numberOfTeams)
            const maxLinePlayers = Math.max(1, maxPlayersPerTeam - 1)
            if (linePlayersPerTeam > maxLinePlayers) {
                setLinePlayersPerTeam(Math.max(1, maxLinePlayers))
            }
        }
    }, [numberOfTeams, linePlayers.length, activePlayers.length, fixedGoalkeepers, linePlayersPerTeam])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!hasEnoughPlayers) {
            setError("Jogadores insuficientes para criar este sorteio")
            return
        }

        setLoading(true)
        try {
            await onCreateDraw({
                method,
                numberOfTeams,
                playersPerTeam: linePlayersPerTeam + 1,
                fixedGoalkeepers,
                linePlayersPerTeam: fixedGoalkeepers ? linePlayersPerTeam : undefined,
            })
            onOpenChange(false)
            setMethod("AUTO_BALANCED")
            setNumberOfTeams(2)
            setLinePlayersPerTeam(6)
            setFixedGoalkeepers(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar sorteio")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] md:max-w-[800px] h-[80vh] max-h-[800px] p-0 gap-0 overflow-hidden border-border flex flex-col">
                <div className="relative bg-gradient-to-br from-emerald-200 via-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:via-emerald-900/20 dark:to-emerald-800/20 px-6 py-8 border-b border-border/50 flex-shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.1),transparent_50%)]" />
                    <DialogHeader className="relative space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative size-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-emerald-600 dark:to-emerald-400 shadow-lg">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-foreground">
                                    Novo Sorteio de Times
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground mt-1">
                                    Configure o sorteio para distribuir os jogadores em times balanceados
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-6 space-y-4">

                            <div className="space-y-2">
                                <Label htmlFor="method">Método de Sorteio</Label>
                                <Select
                                    value={method}
                                    onValueChange={(value) => setMethod(value as any)}
                                >
                                    <SelectTrigger className="w-full" data-size="lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AUTO_BALANCED">
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    <Scale className="w-4 h-4" />
                                                    <span className="font-medium">Balanceado (Recomendado)</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">Distribui jogadores por rating em modo draft</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="AUTO_RANDOM">
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    <Shuffle className="w-4 h-4" />
                                                    <span className="font-medium">Aleatório</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">Distribui jogadores aleatoriamente</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="fixedGoalkeepers" className="text-sm font-medium">
                                            Goleiros Fixos
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {fixedGoalkeepers
                                                ? `${goalkeepers.length} goleiro(s) fixo(s) (distribuídos entre os times, completar com linha se necessário)`
                                                : "Todos os jogadores participam do sorteio (linha pode ir no gol)"}
                                        </p>
                                    </div>
                                    <Switch
                                        id="fixedGoalkeepers"
                                        checked={fixedGoalkeepers}
                                        onCheckedChange={setFixedGoalkeepers}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="numberOfTeams">Número de Times</Label>
                                        <Input
                                            id="numberOfTeams"
                                            type="number"
                                            min="2"
                                            max="8"
                                            value={numberOfTeams}
                                            onChange={(e) => setNumberOfTeams(Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linePlayersPerTeam">
                                            {fixedGoalkeepers ? "Jogadores de Linha por Time" : "Jogadores por Time"}
                                        </Label>
                                        <Input
                                            id="linePlayersPerTeam"
                                            type="number"
                                            min="1"
                                            max={fixedGoalkeepers
                                                ? Math.floor(linePlayers.length / numberOfTeams)
                                                : Math.floor(activePlayers.length / numberOfTeams) - 1}
                                            value={linePlayersPerTeam}
                                            onChange={(e) => setLinePlayersPerTeam(Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                </div>

                                {!fixedGoalkeepers && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-blue-900">
                                                    Jogadores de linha podem ser sorteados como goleiros
                                                </p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Todos os {activePlayers.length} jogadores participam do sorteio normalmente
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {fixedGoalkeepers && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-blue-900">
                                                    {goalkeepers.length} goleiro(s) fixo(s) serão usados
                                                </p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    {missingGoalkeepers > 0
                                                        ? `${teamsWithGoalkeeper} time(s) com goleiro fixo, ${missingGoalkeepers} time(s) usarão o goleiro do time que substituírem. Sorteio apenas entre jogadores de linha.`
                                                        : `Todos os ${numberOfTeams} times terão goleiro fixo. Sorteio apenas entre jogadores de linha.`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-lg bg-muted p-4 space-y-3">
                                {fixedGoalkeepers ? (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Shield className="w-4 h-4" />
                                                    Goleiros disponíveis:
                                                </span>
                                                <span className="font-semibold">{goalkeepers.length}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground ml-6">Goleiros fixos:</span>
                                                <span className="font-semibold text-emerald-600">
                                                    {availableGoalkeepers}
                                                </span>
                                            </div>
                                            {remainingGoalkeepers > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground ml-6">Goleiros de fora:</span>
                                                    <span className="font-semibold text-yellow-600">{remainingGoalkeepers}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="h-px bg-zinc-200" />
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    Jogadores de linha disponíveis:
                                                </span>
                                                <span className="font-semibold">{linePlayers.length}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground ml-6">Jogadores de linha necessários:</span>
                                                <span className={`font-semibold ${canCompleteWithLinePlayers ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {neededLinePlayers}
                                                </span>
                                            </div>
                                            {remainingLinePlayers > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground ml-6">Jogadores de linha de fora:</span>
                                                    <span className="font-semibold text-yellow-600">{remainingLinePlayers}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Total de jogadores disponíveis:
                                            </span>
                                            <span className="font-semibold">{activePlayers.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground ml-6">Jogadores necessários:</span>
                                            <span className={`font-semibold ${hasEnoughLinePlayers ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {neededLinePlayers} ({numberOfTeams} times × {linePlayersPerTeam + 1} jogadores)
                                            </span>
                                        </div>
                                        {remainingLinePlayers > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground ml-6">Ficarão de fora:</span>
                                                <span className="font-semibold text-yellow-600">{remainingLinePlayers}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!hasEnoughPlayers && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {fixedGoalkeepers && !canCompleteWithLinePlayers && (
                                            <div>
                                                Jogadores insuficientes. Você precisa de {neededLinePlayers - linePlayers.length} jogador(es) de linha a mais
                                                {missingGoalkeepers > 0 && ` (incluindo ${missingGoalkeepers} para completar como goleiro)`} ou ajuste as configurações.
                                            </div>
                                        )}
                                        {!fixedGoalkeepers && !hasEnoughLinePlayers && (
                                            <div>
                                                Jogadores insuficientes. Você precisa de {neededLinePlayers - activePlayers.length} jogador(es) a mais ou ajuste as configurações.
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {activePlayers.length > 0 && (
                                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-3">
                                    {goalkeepers.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                                                <Shield className="w-4 h-4" />
                                                <span>Goleiros ({goalkeepers.length})</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {goalkeepers.map((player) => (
                                                    <div key={player.id} className="text-sm flex items-center gap-2">
                                                        <span className="font-medium text-yellow-600">{player.rating.toFixed(1)}</span>
                                                        <span className="truncate">
                                                            {player.user?.name || player.invitedPlayerName}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {linePlayers.length > 0 && (
                                        <div>
                                            {goalkeepers.length > 0 && <div className="h-px bg-zinc-200 my-2" />}
                                            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span>Jogadores de Linha ({linePlayers.length})</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {linePlayers.map((player) => (
                                                    <div key={player.id} className="text-sm flex items-center gap-2">
                                                        <span className="font-medium text-yellow-600">{player.rating.toFixed(1)}</span>
                                                        <span className="truncate">
                                                            {player.user?.name || player.invitedPlayerName}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-4 py-4 border-t border-border bg-zinc-200/30 flex-shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="rounded-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !hasEnoughPlayers}
                            className="rounded-sm bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sorteando...
                                </>
                            ) : (
                                <>
                                    <Shuffle className="w-4 h-4" />
                                    Sortear Times
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

