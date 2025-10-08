"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shuffle, Loader2, Users, AlertCircle, Check, Scale } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Player {
    id: string
    rating: number
    user: {
        name: string
    } | null
    invitedPlayerName: string | null
}

interface DrawConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    activePlayers: Player[]
    onCreateDraw: (config: {
        method: "MANUAL" | "AUTO_RANDOM" | "AUTO_BALANCED"
        numberOfTeams: number
        playersPerTeam: number
    }) => Promise<void>
}

export function DrawConfigDialog({
    open,
    onOpenChange,
    activePlayers,
    onCreateDraw,
}: DrawConfigDialogProps) {
    const [method, setMethod] = useState<"MANUAL" | "AUTO_RANDOM" | "AUTO_BALANCED">("AUTO_BALANCED")
    const [numberOfTeams, setNumberOfTeams] = useState(2)
    const [playersPerTeam, setPlayersPerTeam] = useState(5)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const totalNeededPlayers = numberOfTeams * playersPerTeam
    const hasEnoughPlayers = activePlayers.length >= totalNeededPlayers
    const remainingPlayers = activePlayers.length - totalNeededPlayers

    useEffect(() => {
        if (activePlayers.length > 0) {
            const maxPlayersPerTeam = Math.floor(activePlayers.length / numberOfTeams)
            if (playersPerTeam > maxPlayersPerTeam) {
                setPlayersPerTeam(maxPlayersPerTeam)
            }
        }
    }, [activePlayers.length, numberOfTeams])

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
                playersPerTeam,
            })
            onOpenChange(false)
            setMethod("AUTO_BALANCED")
            setNumberOfTeams(2)
            setPlayersPerTeam(5)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar sorteio")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Novo Sorteio de Times</DialogTitle>
                    <DialogDescription>
                        Configure o sorteio para distribuir os jogadores em times balanceados
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                            <Label htmlFor="playersPerTeam">Jogadores por Time</Label>
                            <Input
                                id="playersPerTeam"
                                type="number"
                                min="1"
                                max={Math.floor(activePlayers.length / numberOfTeams)}
                                value={playersPerTeam}
                                onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Jogadores disponíveis:</span>
                            <span className="font-semibold">{activePlayers.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Jogadores necessários:</span>
                            <span className="font-semibold">{totalNeededPlayers}</span>
                        </div>
                        {remainingPlayers > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Ficarão de fora:</span>
                                <span className="font-semibold text-yellow-600">{remainingPlayers}</span>
                            </div>
                        )}
                    </div>

                    {!hasEnoughPlayers && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Jogadores insuficientes. Você precisa de {totalNeededPlayers - activePlayers.length} jogador(es) a mais ou ajuste as configurações.
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
                        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>Jogadores Ativos</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {activePlayers.map((player) => (
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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !hasEnoughPlayers}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sorteando...
                                </>
                            ) : (
                                <>
                                    <Shuffle className="w-4 h-4 mr-2" />
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

