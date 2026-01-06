"use client"

import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import { useDraws } from "@/hooks/use-draws"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Calendar, Users, Plus, Edit, Trash2, ArrowLeft, Star, Clock, UserPlus, X, Pencil, Shuffle, Mail, Loader2, Trophy, MoreHorizontal, Save, ClipboardPaste, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PeladaDetailPage() {
    const params = useParams()
    const { user, canCreatePelada, isPending: roleLoading } = useRole()
    const { peladas, loading, error, addPlayer, removePlayer, updatePlayerStats, fetchPeladas } = usePeladas()
    const { activeDraw, loading: drawsLoading } = useDraws(params.id as string)
    const [pelada, setPelada] = useState<any>(null)
    const [showAddPlayer, setShowAddPlayer] = useState(false)
    const [newPlayerName, setNewPlayerName] = useState("")
    const [newPlayerRating, setNewPlayerRating] = useState(5.0)
    const [newPlayerPosition, setNewPlayerPosition] = useState<string>("")
    const [newPlayerEmail, setNewPlayerEmail] = useState("")
    const [showInviteDialog, setShowInviteDialog] = useState(false)
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [playerToDelete, setPlayerToDelete] = useState<string | null>(null)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editingPlayer, setEditingPlayer] = useState<any>(null)
    const [editForm, setEditForm] = useState({
        rating: 5.0,
        goals: 0,
        assists: 0,
        position: "",
        isActive: true
    })
    const [players, setPlayers] = useState<any[]>([])
    const [playersPagination, setPlayersPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })
    const [loadingPlayers, setLoadingPlayers] = useState(false)

    // WhatsApp Import State
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [importText, setImportText] = useState("")
    const [parsedPlayers, setParsedPlayers] = useState<{ name: string, position: string | null }[]>([])
    const [isImporting, setIsImporting] = useState(false)

    const parseWhatsAppMessage = (text: string) => {
        const lines = text.split('\n')
        const players: { name: string, position: string | null }[] = []
        let section: 'GOLEIRO' | 'LINHA' | null = null

        for (const line of lines) {
            const trimLine = line.trim().toUpperCase()
            // Detect Sections
            if (trimLine.includes("GOLEIROS")) {
                section = 'GOLEIRO'
                continue
            }
            if (trimLine.includes("LINHA")) {
                section = 'LINHA'
                continue
            }
            // Stop at other lists
            if (trimLine.includes("LISTA DE ESPERA") || trimLine.includes("AUSENTES")) {
                break
            }

            // Parse Names if in a section
            if (section && line.trim().length > 0) {
                // Remove numbers, emojis, and common bullets
                // This regex removes leading non-letter characters to clean "1️⃣ Name" -> "Name"
                const cleanName = line.replace(/^[\d\s\p{Emoji}\W]+/u, '').trim()

                // Only add if we have a valid name left
                if (cleanName.length > 1 && !cleanName.match(/^[0-9]+$/)) {
                    players.push({
                        name: cleanName,
                        position: section === 'GOLEIRO' ? 'GOLEIRO' : null
                    })
                }
            }
        }
        setParsedPlayers(players)
    }

    useEffect(() => {
        parseWhatsAppMessage(importText)
    }, [importText])

    const handleImportPlayers = async () => {
        if (parsedPlayers.length === 0) return
        setIsImporting(true)

        let successCount = 0
        let failCount = 0

        // Process sequentially to avoid race conditions/bans
        for (const player of parsedPlayers) {
            try {
                const response = await fetch(`/api/peladas/${params.id}/add-player`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: player.name,
                        rating: 5.0, // Default rating
                        position: player.position
                    }),
                })
                if (response.ok) successCount++
                else failCount++
            } catch (e) {
                failCount++
            }
        }

        toast.success(`Importação finalizada: ${successCount} adicionados, ${failCount} erros.`)
        setIsImporting(false)
        setShowImportDialog(false)
        setImportText("")
        setParsedPlayers([])
        await fetchPlayers(playersPagination.page)
        await fetchPeladas()
    }

    const fetchPlayers = async (page = 1) => {
        if (!params.id) return
        setLoadingPlayers(true)
        try {
            const response = await fetch(`/api/peladas/${params.id}/players?page=${page}&limit=${playersPagination.limit}`)
            if (response.ok) {
                const data = await response.json()
                setPlayers(data.players)
                setPlayersPagination(data.pagination)
            }
        } catch (error) {
            console.error("Error fetching players:", error)
        } finally {
            setLoadingPlayers(false)
        }
    }

    useEffect(() => {
        if (peladas.length > 0) {
            const foundPelada = peladas.find(p => p.id === params.id)
            setPelada(foundPelada)
        }
    }, [peladas, params.id])

    useEffect(() => {
        if (params.id) {
            fetchPlayers(1)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    if (roleLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
                <div className="max-w-md w-full bg-white rounded-sm border border-zinc-200 shadow-sm p-8 text-center">
                    <h1 className="text-xl font-bold text-zinc-900 mb-2">Acesso Restrito</h1>
                    <p className="text-zinc-500 text-sm mb-6">
                        Faça login para visualizar esta pelada.
                    </p>
                    <Link href="/login">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm">
                            Fazer Login
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (!pelada) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                <div className="max-w-md w-full bg-white rounded-sm border border-zinc-200 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                        <Calendar className="w-8 h-8 text-zinc-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                        Pelada não encontrada
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6">
                        A pelada que você está procurando não existe ou foi removida.
                    </p>
                    <Link href="/peladas">
                        <Button variant="outline" className="rounded-sm border-zinc-200">
                            Voltar às Peladas
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const handleAddPlayer = async () => {
        if (!newPlayerName) {
            toast.error("Digite o nome do jogador")
            return
        }

        try {
            const response = await fetch(`/api/peladas/${pelada.id}/add-player`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newPlayerName,
                    rating: newPlayerRating,
                    position: newPlayerPosition || null
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erro ao adicionar jogador")
            }

            toast.success(`${newPlayerName} adicionado com sucesso!`)
            setNewPlayerName("")
            setNewPlayerRating(5.0)
            setNewPlayerPosition("")
            setShowAddPlayer(false)
            await fetchPlayers(playersPagination.page)
            await fetchPeladas()

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao adicionar jogador")
        }
    }

    const handleSendInvite = async () => {
        if (!newPlayerEmail) {
            toast.error("Digite o email do jogador")
            return
        }

        try {
            const response = await fetch(`/api/peladas/${pelada.id}/send-invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerId: selectedPlayer.id,
                    email: newPlayerEmail
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erro ao enviar convite")
            }

            toast.success(`Convite enviado para ${newPlayerEmail}!`)
            setNewPlayerEmail("")
            setShowInviteDialog(false)
            setSelectedPlayer(null)
            await fetchPlayers(playersPagination.page)
            await fetchPeladas()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao enviar convite")
        }
    }

    const handleRemoveClick = (playerId: string) => {
        setPlayerToDelete(playerId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (playerToDelete) {
            try {
                await removePlayer(pelada.id, playerToDelete)
                toast.success("Jogador removido com sucesso")
                setDeleteDialogOpen(false)
                setPlayerToDelete(null)
                await fetchPlayers(playersPagination.page)
                await fetchPeladas()
            } catch (error) {
                toast.error("Erro ao remover jogador")
            }
        }
    }

    const handleEditClick = (player: any) => {
        setEditingPlayer(player)
        setEditForm({
            rating: player.rating,
            goals: player.goals,
            assists: player.assists,
            isActive: player.isActive,
            position: player.position
        })
        setShowEditDialog(true)
    }

    const handleSaveEdit = async () => {
        if (!editingPlayer) return
        try {
            const playerId = editingPlayer.user?.id || editingPlayer.id
            const response = await fetch(`/api/peladas/${pelada.id}/players/${playerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erro ao atualizar jogador")
            }

            toast.success("Jogador atualizado com sucesso!")
            setShowEditDialog(false)
            setEditingPlayer(null)
            await fetchPlayers(playersPagination.page)
            await fetchPeladas()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar jogador")
        }
    }

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const confirmedPlayers = players.filter((p: any) => p.user || (!p.user && !p.isInvited))
    const pendingInvites = players.filter((p: any) => p.isInvited && !p.user)

    return (
        <div className="min-h-full bg-zinc-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link
                        href="/peladas"
                        className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        Voltar para lista
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{pelada.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${pelada.type === 'RECORRENTE'
                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                                    }`}>
                                    {pelada.type}
                                </span>
                                <div className="flex items-center gap-1.5 text-zinc-600 text-sm">
                                    <Clock className="w-4 h-4 text-zinc-400" />
                                    <span>{format(new Date(pelada.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm h-9 shadow-sm">
                                <Link href={`/peladas/${pelada.id}/sorteio`}>
                                    <Shuffle className="w-3.5 h-3.5" />
                                    Sorteio
                                </Link>
                            </Button>
                            {canCreatePelada() && (
                                <Button asChild variant="outline" className="rounded-sm border-zinc-200 h-9">
                                    <Link href={`/peladas/${pelada.id}/editar`}>
                                        <Edit className="w-3.5 h-3.5" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {activeDraw && !drawsLoading && (
                    <div className="mb-8 rounded-sm border border-emerald-200 bg-emerald-50/30 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">Sorteio Ativo</h3>
                            </div>
                            <Link href={`/peladas/${pelada.id}/sorteio`}>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50">
                                    Ver Detalhes
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {activeDraw.teams.map((team: any) => (
                                <div key={team.id} className="bg-white rounded-sm border border-zinc-200 p-3 shadow-sm border-l-4" style={{ borderLeftColor: team.color }}>
                                    <div className="font-semibold text-sm text-zinc-900 truncate">{team.name}</div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-zinc-500">{team.players.length} jog.</span>
                                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-700">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            {team.averageRating.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-zinc-200 shadow-sm rounded-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Jogadores</h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {loadingPlayers ? "..." : `${playersPagination.total} confirmados`}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setShowImportDialog(true)}
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs font-semibold uppercase tracking-wide border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    >
                                        <ClipboardPaste className="w-3.5 h-3.5" />
                                        Importar
                                    </Button>
                                    <Button
                                        onClick={() => setShowAddPlayer(!showAddPlayer)}
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm h-8 text-xs font-semibold uppercase tracking-wide group"
                                    >
                                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-all duration-300 ease-in-out" />
                                        Adicionar
                                    </Button>
                                </div>
                            </div>

                            {showAddPlayer && (
                                <div className="p-6 bg-zinc-50 border-b border-zinc-100">
                                    <h3 className="text-sm font-semibold text-zinc-900 mb-4">Novo Jogador</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2 space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Nome</Label>
                                            <Input
                                                placeholder="Ex: João Silva"
                                                value={newPlayerName}
                                                onChange={(e) => setNewPlayerName(e.target.value)}
                                                className="h-9 rounded-sm border-zinc-200"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Rating</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={newPlayerRating}
                                                onChange={(e) => setNewPlayerRating(Number(e.target.value))}
                                                className="h-9 rounded-sm border-zinc-200"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Posição</Label>
                                            <Select value={newPlayerPosition} onValueChange={setNewPlayerPosition}>
                                                <SelectTrigger className="h-9 rounded-sm border-zinc-200 w-full">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GOLEIRO">Goleiro</SelectItem>
                                                    <SelectItem value="ZAGUEIRO">Zagueiro</SelectItem>
                                                    <SelectItem value="MEIO">Meio Campo</SelectItem>
                                                    <SelectItem value="ATACANTE">Atacante</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="ghost" size="sm" onClick={() => setShowAddPlayer(false)} className="h-8 text-zinc-500 hover:text-zinc-900 rounded-sm">Cancelar</Button>
                                        <Button
                                            size="sm"
                                            onClick={handleAddPlayer}
                                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm"
                                        >
                                            <Save className="w-2 h-2" />
                                            Salvar
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* List */}
                            {loadingPlayers ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                </div>
                            ) : confirmedPlayers.length === 0 ? (
                                <div className="p-12 text-center text-zinc-500 text-sm">
                                    Nenhum jogador confirmado.
                                </div>
                            ) : (
                                <div>
                                    <Table>
                                        <TableHeader className="bg-zinc-50">
                                            <TableRow className="border-zinc-100 hover:bg-zinc-50">
                                                <TableHead className="py-2 h-9 text-xs font-bold uppercase tracking-wider text-zinc-500">Jogador</TableHead>
                                                <TableHead className="py-2 h-9 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Pos</TableHead>
                                                <TableHead className="py-2 h-9 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Rat</TableHead>
                                                <TableHead className="py-2 h-9 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Gols</TableHead>
                                                <TableHead className="py-2 h-9 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Ass</TableHead>
                                                <TableHead className="py-2 h-9 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Sts</TableHead>
                                                <TableHead className="py-2 h-9 text-right"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {confirmedPlayers.map((player: any) => (
                                                <TableRow key={player.id} className="border-zinc-100 hover:bg-zinc-50/50">
                                                    <TableCell className="py-2">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 rounded-sm bg-zinc-100 border border-zinc-200">
                                                                <AvatarFallback className="text-[10px] font-bold text-zinc-500 bg-transparent rounded-sm">
                                                                    {getInitials(player.user ? player.user.name : player.invitedPlayerName || "?")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold text-zinc-700">
                                                                    {player.user ? player.user.name : player.invitedPlayerName}
                                                                </span>
                                                                {player.user && (
                                                                    <span className="text-[10px] text-zinc-400 font-medium">
                                                                        {player.user.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-2">
                                                        {player.position ? (
                                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{player.position.substring(0, 3)}</span>
                                                        ) : <span className="text-zinc-300">-</span>}
                                                    </TableCell>
                                                    <TableCell className="text-center py-2">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className="text-sm font-medium text-zinc-700">{player.rating.toFixed(1)}</span>
                                                            <Star className="w-3 h-3 text-zinc-300 fill-zinc-300" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-2 text-sm text-zinc-600 font-medium">{player.goals}</TableCell>
                                                    <TableCell className="text-center py-2 text-sm text-zinc-600 font-medium">{player.assists}</TableCell>
                                                    <TableCell className="text-center py-2">
                                                        <div className={`w-2 h-2 rounded-full mx-auto ${player.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                    </TableCell>
                                                    <TableCell className="text-right py-2">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm"
                                                                onClick={() => handleEditClick(player)}
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Button>
                                                            {!player.user && !player.isInvited && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm"
                                                                    onClick={() => {
                                                                        setSelectedPlayer(player)
                                                                        setShowInviteDialog(true)
                                                                    }}
                                                                >
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-sm"
                                                                onClick={() => handleRemoveClick(player.user?.id || player.id)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Pagination */}
                            {playersPagination.totalPages > 1 && (
                                <div className="border-t border-zinc-100 p-4 flex items-center justify-center">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => playersPagination.page > 1 && fetchPlayers(playersPagination.page - 1)}
                                            disabled={playersPagination.page === 1}
                                            className="h-8 px-2 border-zinc-200 text-zinc-600"
                                        >
                                            Anterior
                                        </Button>
                                        <span className="text-xs font-medium text-zinc-500">
                                            {playersPagination.page} / {playersPagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => playersPagination.page < playersPagination.totalPages && fetchPlayers(playersPagination.page + 1)}
                                            disabled={playersPagination.page === playersPagination.totalPages}
                                            className="h-8 px-2 border-zinc-200 text-zinc-600"
                                        >
                                            Próximo
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pending Invites */}
                        {pendingInvites.length > 0 && (
                            <div className="bg-yellow-50/50 border border-yellow-200 rounded-sm p-6">
                                <h3 className="text-sm font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Convites Pendentes ({pendingInvites.length})
                                </h3>
                                <div className="space-y-2">
                                    {pendingInvites.map((player: any) => (
                                        <div key={player.id} className="flex items-center justify-between bg-white border border-yellow-100 rounded-sm p-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 bg-yellow-100 text-yellow-700 rounded-sm">
                                                    <AvatarFallback className="text-xs font-bold">{getInitials(player.invitedPlayerName || "?")}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-medium text-zinc-900">{player.invitedPlayerName}</div>
                                                    <div className="text-xs text-zinc-500">{player.invitedPlayerEmail}</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wide border-yellow-200 text-yellow-700 bg-yellow-50">
                                                Pendente
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white border border-zinc-200 shadow-sm rounded-sm p-6">
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Resumo</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-500">Total Jogadores</span>
                                    <span className="text-sm font-semibold text-zinc-900">{pelada._count.players}</span>
                                </div>
                                <div className="h-px bg-zinc-100" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-500">Confirmados</span>
                                    <span className="text-sm font-semibold text-emerald-600">{confirmedPlayers.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-500">Pendentes</span>
                                    <span className="text-sm font-semibold text-yellow-600">{pendingInvites.length}</span>
                                </div>
                                <div className="h-px bg-zinc-100" />
                                <div className="pt-2">
                                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block mb-1">Organizador</span>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 rounded-sm">
                                            <AvatarFallback className="text-[10px] bg-zinc-100 text-zinc-600">{getInitials(pelada.createdBy.name)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-zinc-700">{pelada.createdBy.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-md rounded-sm border-zinc-200">
                    <DialogHeader>
                        <DialogTitle>Editar Jogador</DialogTitle>
                        <DialogDescription>Atualize as estatísticas do jogador.</DialogDescription>
                    </DialogHeader>
                    {editingPlayer && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-zinc-500">Rating</Label>
                                    <Input
                                        type="number" step="0.1" min="0" max="10"
                                        value={editForm.rating}
                                        onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                                        className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-zinc-500">Posição</Label>
                                    <Select value={editForm.position} onValueChange={(v) => setEditForm({ ...editForm, position: v })}>
                                        <SelectTrigger className="rounded-sm">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GOLEIRO">Goleiro</SelectItem>
                                            <SelectItem value="ZAGUEIRO">Zagueiro</SelectItem>
                                            <SelectItem value="MEIO">Meio Campo</SelectItem>
                                            <SelectItem value="ATACANTE">Atacante</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-zinc-500">Gols</Label>
                                    <Input
                                        type="number" min="0"
                                        value={editForm.goals}
                                        onChange={(e) => setEditForm({ ...editForm, goals: Number(e.target.value) })}
                                        className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-zinc-500">Assistências</Label>
                                    <Input
                                        type="number" min="0"
                                        value={editForm.assists}
                                        onChange={(e) => setEditForm({ ...editForm, assists: Number(e.target.value) })}
                                        className="rounded-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <Label className="text-sm font-medium text-zinc-700">Ativo na pelada?</Label>
                                <input
                                    type="checkbox"
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-sm">Cancelar</Button>
                        <Button onClick={handleSaveEdit} className="rounded-sm bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogContent className="max-w-sm rounded-sm border-zinc-200">
                    <DialogHeader>
                        <DialogTitle>Convidar Jogador</DialogTitle>
                        <DialogDescription>Envie um convite por e-mail para este jogador.</DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">E-mail</Label>
                        <Input
                            placeholder="email@exemplo.com"
                            value={newPlayerEmail}
                            onChange={(e) => setNewPlayerEmail(e.target.value)}
                            className="rounded-sm"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="rounded-sm">Cancelar</Button>
                        <Button onClick={handleSendInvite} className="rounded-sm bg-blue-600 hover:bg-blue-700">Enviar Convite</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="rounded-sm border-zinc-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Jogador</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover este jogador da pelada?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-sm">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="rounded-sm bg-red-600 hover:bg-red-700">Remover</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent className="max-w-3xl rounded-sm border-zinc-200">
                    <DialogHeader>
                        <DialogTitle>Importar do WhatsApp</DialogTitle>
                        <DialogDescription>Cole a lista de presença abaixo para importar os jogadores automaticamente.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-zinc-500">Cole a mensagem aqui</Label>
                            <Textarea
                                placeholder="PELADA ARENA..."
                                className="h-[300px] resize-none rounded-sm font-mono text-xs"
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 text-end">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase text-zinc-500">Pré-visualização ({parsedPlayers.length})</Label>
                            </div>
                            <div className="h-[300px] border border-zinc-200 rounded-sm bg-zinc-50 p-2 overflow-y-auto space-y-1">
                                {parsedPlayers.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center p-4">
                                        <ClipboardPaste className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-xs">Nenhum jogador detectado.</p>
                                        <p className="text-[10px] mt-1">Cole uma lista com sessões "GOLEIROS" e "LINHA".</p>
                                    </div>
                                ) : (
                                    parsedPlayers.map((player, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white px-2 py-1.5 rounded-sm border border-zinc-100 text-xs">
                                            <span className="font-medium text-zinc-700 truncate">{player.name}</span>
                                            {player.position === 'GOLEIRO' ? (
                                                <span className="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-sm uppercase">Goleiro</span>
                                            ) : (
                                                <span className="text-[9px] font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-sm uppercase">Linha</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            {parsedPlayers.length > 0 && (
                                <span className="text-[10px] text-emerald-600 font-medium">
                                    {parsedPlayers.filter(p => p.position === 'GOLEIRO').length} Goleiros, {parsedPlayers.filter(p => p.position !== 'GOLEIRO').length} Linha
                                </span>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImportDialog(false)} className="rounded-sm">Cancelar</Button>
                        <Button
                            onClick={handleImportPlayers}
                            disabled={parsedPlayers.length === 0 || isImporting}
                            className="rounded-sm bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    Importar {parsedPlayers.length} Jogadores
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}