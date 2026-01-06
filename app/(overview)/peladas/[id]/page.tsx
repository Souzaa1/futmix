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
import { ScrollArea } from "@/components/ui/scroll-area"
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
import DialogAddPlayer from "@/components/dialog-add-player"
import DialogSendInvite from "@/components/dialog-send-invite"
import DialogEditPlayer from "@/components/dialog-edit-player"

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
        isActive: true,
        isWaitingList: false
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
    const [parsedPlayers, setParsedPlayers] = useState<{ name: string, position: string | null, rating: number, isWaitingList: boolean }[]>([])
    const [isImporting, setIsImporting] = useState(false)
    const [waitingListPlayers, setWaitingListPlayers] = useState<any[]>([])
    const [loadingWaitingList, setLoadingWaitingList] = useState(false)

    const parseWhatsAppMessage = (text: string) => {
        const lines = text.split('\n')
        const players: { name: string, position: string | null, rating: number, isWaitingList: boolean }[] = []
        let section: 'GOLEIRO' | 'LINHA' | 'WAITING' | null = null

        for (const line of lines) {
            const trimLine = line.trim().toUpperCase()
            // Detect Sections
            if (trimLine.includes("GOLEIROS")) {
                section = 'GOLEIRO'
                continue
            }
            if (trimLine.includes("LINHA") && !trimLine.includes("ESPERA")) {
                section = 'LINHA'
                continue
            }
            if (trimLine.includes("LISTA DE ESPERA")) {
                section = 'WAITING'
                continue
            }
            // Stop at ausentes
            if (trimLine.includes("AUSENTES")) {
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
                        position: section === 'GOLEIRO' ? 'GOLEIRO' : null,
                        rating: 5.0,
                        isWaitingList: section === 'WAITING'
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
                        rating: player.rating,
                        position: player.position,
                        isWaitingList: player.isWaitingList
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
        await fetchWaitingList()
        await fetchPeladas()
    }

    const fetchWaitingList = async () => {
        if (!params.id) return
        setLoadingWaitingList(true)
        try {
            const response = await fetch(`/api/peladas/${params.id}/players?waitingList=true`)
            if (response.ok) {
                const data = await response.json()
                setWaitingListPlayers(data.players)
            }
        } catch (error) {
            console.error("Error fetching waiting list:", error)
        } finally {
            setLoadingWaitingList(false)
        }
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
            fetchWaitingList()
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
                await fetchWaitingList()
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
            position: player.position,
            isWaitingList: player.isWaitingList || false
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
            await fetchWaitingList()
            await fetchPeladas()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar jogador")
        }
    }

    const handleToggleWaitingList = async (player: any, moveToWaiting: boolean) => {
        try {
            const playerId = player.user?.id || player.id
            const response = await fetch(`/api/peladas/${pelada.id}/players/${playerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isWaitingList: moveToWaiting }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erro ao mover jogador")
            }

            toast.success(moveToWaiting ? "Jogador movido para lista de espera" : "Jogador movido para lista principal")
            await fetchPlayers(playersPagination.page)
            await fetchWaitingList()
            await fetchPeladas()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao mover jogador")
        }
    }

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const confirmedPlayers = players.filter((p: any) => (p.user || (!p.user && !p.isInvited)) && !p.isWaitingList)
    const pendingInvites = players.filter((p: any) => p.isInvited && !p.user && !p.isWaitingList)

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-stretch">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-zinc-200 shadow-sm rounded-sm overflow-hidden flex flex-col h-full">
                            <div className="px-6 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-2 justify-between bg-zinc-50/50">
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
                                                            <Star className="w-3 h-3 text-orange-300 fill-orange-300" />
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
                                                                className="h-7 w-7 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 rounded-sm"
                                                                onClick={() => handleToggleWaitingList(player, true)}
                                                                title="Mover para lista de espera"
                                                            >
                                                                <Clock className="w-3.5 h-3.5" />
                                                            </Button>
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
                    </div>

                    <div className="flex flex-col h-full min-h-0">
                        <div className="bg-white border border-zinc-200 shadow-sm rounded-sm p-6 flex-shrink-0">
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
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-500">Lista de Espera</span>
                                    <span className="text-sm font-semibold text-orange-600">{waitingListPlayers.length}</span>
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

                        {waitingListPlayers.length > 0 && (
                            <div className="bg-white border border-orange-200 shadow-sm rounded-sm flex flex-col flex-1 min-h-0 mt-4">
                                <div className="px-6 py-4 border-b border-orange-100 flex-shrink-0">
                                    <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Lista de Espera ({waitingListPlayers.length})
                                    </h3>
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="p-6 space-y-2">
                                        {waitingListPlayers.map((player: any) => (
                                            <div key={player.id} className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-sm p-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <Avatar className="h-8 w-8 rounded-sm bg-orange-100 border border-orange-200">
                                                        <AvatarFallback className="text-[10px] font-bold text-orange-700 bg-transparent rounded-sm">
                                                            {getInitials(player.user ? player.user.name : player.invitedPlayerName || "?")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-sm font-semibold text-zinc-700 truncate">
                                                            {player.user ? player.user.name : player.invitedPlayerName}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {player.position && (
                                                                <span className="text-[10px] font-bold text-orange-600 uppercase">{player.position.substring(0, 3)}</span>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                                                <span className="text-xs text-zinc-500">{player.rating.toFixed(1)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleWaitingList(player, false)}
                                                    className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-sm flex-shrink-0"
                                                >
                                                    Mover
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                </div>

                {pendingInvites.length > 0 && (
                    <div className="bg-yellow-50/50 border border-yellow-200 rounded-sm p-6 mt-6">
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
            </main>

            <DialogEditPlayer
                showEditDialog={showEditDialog}
                setShowEditDialog={setShowEditDialog}
                editingPlayer={editingPlayer}
                editForm={editForm}
                setEditForm={setEditForm}
                handleSaveEdit={handleSaveEdit}
            />

            <DialogSendInvite
                showInviteDialog={showInviteDialog}
                setShowInviteDialog={setShowInviteDialog}
                newPlayerEmail={newPlayerEmail}
                setNewPlayerEmail={setNewPlayerEmail}
                handleSendInvite={handleSendInvite}
            />

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

            <DialogAddPlayer
                showImportDialog={showImportDialog}
                setShowImportDialog={setShowImportDialog}
                importText={importText}
                setImportText={setImportText}
                parsedPlayers={parsedPlayers}
                setParsedPlayers={setParsedPlayers}
                isImporting={isImporting}
                handleImportPlayers={handleImportPlayers}
            />
        </div>
    )
}