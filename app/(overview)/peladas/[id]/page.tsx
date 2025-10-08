"use client"

import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import { useDraws } from "@/hooks/use-draws"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Calendar, Users, Trophy, Plus, Edit, Trash2, ArrowLeft, Star, Mail, Clock, UserPlus, X, Pencil, Shuffle, Shield, BrickWallShield, Medal, Volleyball, WandSparkles } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-lg text-gray-600 font-medium">Carregando pelada...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl">Acesso Negado</CardTitle>
                        <CardDescription>
                            Você precisa estar logado para acessar esta página.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                            <Link href="/login">Fazer Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!pelada) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-yellow-600" />
                        </div>
                        <CardTitle className="text-2xl">Pelada não encontrada</CardTitle>
                        <CardDescription>
                            A pelada que você está procurando não existe ou foi removida.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                            <Link href="/peladas">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar às Peladas
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
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
                headers: {
                    "Content-Type": "application/json",
                },
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
                headers: {
                    "Content-Type": "application/json",
                },
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
                headers: {
                    "Content-Type": "application/json",
                },
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const confirmedPlayers = players.filter((p: any) => p.user || (!p.user && !p.isInvited))
    const pendingInvites = players.filter((p: any) => p.isInvited && !p.user)

    return (
        <>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pelada.name}</h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">{format(new Date(pelada.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                </div>
                                <Badge
                                    variant={pelada.type === 'RECORRENTE' ? 'default' : 'secondary'}
                                    className={pelada.type === 'RECORRENTE'
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                                    }
                                >
                                    {pelada.type}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                <Link href={`/peladas/${pelada.id}/sorteio`}>
                                    <Shuffle className="w-4 h-4 mr-2" />
                                    Sorteio
                                </Link>
                            </Button>
                            {canCreatePelada() && (
                                <Button asChild variant="outline" className="text-yellow-700 hover:text-yellow-500 hover:bg-yellow-50">
                                    <Link href={`/peladas/${pelada.id}/editar`}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sorteio Ativo */}
                {activeDraw && !drawsLoading && (
                    <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shuffle className="w-5 h-5 text-emerald-600" />
                                        Sorteio Ativo
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {activeDraw.numberOfTeams} times • {activeDraw.playersPerTeam} jogadores por time
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/peladas/${pelada.id}/sorteio`}>
                                        Ver Detalhes
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap w-full justify-center gap-3">
                                {activeDraw.teams.map((team) => (
                                    <div
                                        key={team.id}
                                        className="bg-white rounded-lg p-3 border w-full max-w-xs"
                                        style={{
                                            borderLeft: `4px solid ${team.color}`,
                                        }}
                                    >
                                        <div className="font-semibold text-sm mb-1">{team.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {team.players.length} jogador{team.players.length !== 1 ? 'es' : ''}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs mt-1">
                                            <Star className="w-3 h-3 text-yellow-500" />
                                            <span>{team.averageRating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">Jogadores</CardTitle>
                                        <CardDescription className="mt-1">
                                            {loadingPlayers ? "Carregando..." : `${playersPagination.total} jogador${playersPagination.total !== 1 ? 'es' : ''} confirmado${playersPagination.total !== 1 ? 's' : ''}`}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => setShowAddPlayer(!showAddPlayer)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {showAddPlayer && (
                                    <Card className="bg-green-50 border-green-200">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">Novo Jogador</CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowAddPlayer(false)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="player-name">Nome do Jogador</Label>
                                                <Input
                                                    id="player-name"
                                                    type="text"
                                                    placeholder="Ex: João Silva"
                                                    value={newPlayerName}
                                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="player-rating">Rating (0-10)</Label>
                                                <Input
                                                    id="player-rating"
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={newPlayerRating}
                                                    onChange={(e) => setNewPlayerRating(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="player-position">Posição (Opcional)</Label>
                                                <Select
                                                    value={newPlayerPosition}
                                                    onValueChange={setNewPlayerPosition}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Selecione uma posição" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="GOLEIRO">Goleiro</SelectItem>
                                                        <SelectItem value="ZAGUEIRO">Zagueiro</SelectItem>
                                                        <SelectItem value="MEIO">Meio Campo</SelectItem>
                                                        <SelectItem value="ATACANTE">Atacante</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleAddPlayer}
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Adicionar Jogador
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowAddPlayer(false)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {loadingPlayers ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Carregando jogadores...</p>
                                    </div>
                                ) : confirmedPlayers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Nenhum jogador confirmado
                                        </h3>
                                        <p className="text-gray-500">
                                            Adicione jogadores para começar a montar seu time!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[40%]">Jogador</TableHead>
                                                    <TableHead className="text-center">Posição</TableHead>
                                                    <TableHead className="text-center">Rating</TableHead>
                                                    <TableHead className="text-center">Gols</TableHead>
                                                    <TableHead className="text-center">Assist.</TableHead>
                                                    <TableHead className="text-center">Ativo</TableHead>
                                                    <TableHead className="text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {confirmedPlayers.map((player: any) => (
                                                    <TableRow key={player.id} className="hover:bg-gray-50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10 bg-gradient-to-br from-green-400 to-green-600">
                                                                    <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
                                                                        {getInitials(player.user ? player.user.name : player.invitedPlayerName || "?")}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-900">
                                                                        {player.user ? player.user.name : player.invitedPlayerName}
                                                                    </span>
                                                                    {player.user && (
                                                                        <span className="text-xs text-gray-500">
                                                                            {player.user.email}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {player.position ? (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {player.position === "GOLEIRO" && "GOL"}
                                                                    {player.position === "ZAGUEIRO" && "ZAG"}
                                                                    {player.position === "MEIO" && "MEI"}
                                                                    {player.position === "ATACANTE" && "ATA"}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                <span className="font-semibold">{player.rating.toFixed(1)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="font-medium">{player.goals}</span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="font-medium">{player.assists}</span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {player.isActive ? (
                                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Sim</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Não</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEditClick(player)}
                                                                    className="text-yellow-700 hover:text-yellow-500 hover:bg-yellow-50"
                                                                    title="Editar jogador"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                {!player.user && !player.isInvited && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedPlayer(player)
                                                                            setShowInviteDialog(true)
                                                                        }}
                                                                        className="text-blue-700 hover:text-blue-500 hover:bg-blue-50"
                                                                        title="Enviar convite"
                                                                    >
                                                                        <Mail className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveClick(player.user?.id || player.id)}
                                                                    className="text-rose-700 hover:text-rose-500 hover:bg-rose-50"
                                                                    title="Remover jogador"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {/* Paginação */}
                                {playersPagination.totalPages > 1 && (
                                    <div className="mt-6 flex flex-col items-center gap-4">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => playersPagination.page > 1 && fetchPlayers(playersPagination.page - 1)}
                                                        className={playersPagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>

                                                {[...Array(playersPagination.totalPages)].map((_, index) => {
                                                    const pageNumber = index + 1;
                                                    const isCurrentPage = pageNumber === playersPagination.page;

                                                    if (
                                                        pageNumber === 1 ||
                                                        pageNumber === playersPagination.totalPages ||
                                                        (pageNumber >= playersPagination.page - 1 && pageNumber <= playersPagination.page + 1)
                                                    ) {
                                                        return (
                                                            <PaginationItem key={pageNumber}>
                                                                <PaginationLink
                                                                    onClick={() => fetchPlayers(pageNumber)}
                                                                    isActive={isCurrentPage}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {pageNumber}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        );
                                                    } else if (
                                                        pageNumber === playersPagination.page - 2 ||
                                                        pageNumber === playersPagination.page + 2
                                                    ) {
                                                        return (
                                                            <PaginationItem key={pageNumber}>
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        );
                                                    }
                                                    return null;
                                                })}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() => playersPagination.page < playersPagination.totalPages && fetchPlayers(playersPagination.page + 1)}
                                                        className={playersPagination.page === playersPagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                        <div className="text-sm text-muted-foreground">
                                            Mostrando {confirmedPlayers.length} de {playersPagination.total} jogadores
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {pendingInvites.length > 0 && (
                            <Card className="border-yellow-200 bg-yellow-50">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-yellow-600" />
                                        Convites Pendentes
                                    </CardTitle>
                                    <CardDescription>
                                        {pendingInvites.length} convite{pendingInvites.length !== 1 ? 's' : ''} aguardando confirmação
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border border-yellow-200 bg-white">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Jogador</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pendingInvites.map((player: any) => (
                                                    <TableRow key={player.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-9 w-9 bg-yellow-100">
                                                                    <AvatarFallback className="bg-transparent text-yellow-700 font-semibold text-sm">
                                                                        {getInitials(player.invitedPlayerName || "?")}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-medium text-gray-900">
                                                                    {player.invitedPlayerName}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-gray-600">
                                                            {player.invitedPlayerEmail}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                                                Pendente
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Estatísticas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Jogadores
                                    </span>
                                    <span className="font-semibold text-lg">{pelada._count.players}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Confirmados</span>
                                    <span className="font-semibold text-green-600">{confirmedPlayers.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Pendentes</span>
                                    <span className="font-semibold text-yellow-600">{pendingInvites.length}</span>
                                </div>
                                <Separator />
                                <div>
                                    <span className="text-gray-600 text-sm">Criada por</span>
                                    <p className="font-medium text-gray-900 mt-1">{pelada.createdBy.name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Informações</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Data e Hora</p>
                                        <p className="font-medium">{format(new Date(pelada.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                        <p className="text-sm text-gray-600">{format(new Date(pelada.date), "HH:mm", { locale: ptBR })}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <Trophy className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Tipo</p>
                                        <p className="font-medium">{pelada.type}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Jogador</DialogTitle>
                        <DialogDescription>
                            Altere as estatísticas e informações de {editingPlayer?.user?.name || editingPlayer?.invitedPlayerName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-rating">Rating (0-10)</Label>
                            <Input
                                id="edit-rating"
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={editForm.rating}
                                onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-goals">Gols</Label>
                                <Input
                                    id="edit-goals"
                                    type="number"
                                    min="0"
                                    value={editForm.goals}
                                    onChange={(e) => setEditForm({ ...editForm, goals: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-assists">Assistências</Label>
                                <Input
                                    id="edit-assists"
                                    type="number"
                                    min="0"
                                    value={editForm.assists}
                                    onChange={(e) => setEditForm({ ...editForm, assists: Number(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="edit-position">Posição</Label>
                                <Select
                                    value={editForm.position}
                                    onValueChange={(value) => setEditForm({ ...editForm, position: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione uma posição" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GOLEIRO">
                                            <span className="flex items-center gap-2">
                                                <BrickWallShield className="w-4 h-4" />
                                                Goleiro
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="ZAGUEIRO">
                                            <span className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Zagueiro
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="MEIO">
                                            <span className="flex items-center gap-2">
                                                <WandSparkles className="w-4 h-4" />
                                                Meio Campo
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="ATACANTE">
                                            <span className="flex items-center gap-2">
                                                <Volleyball className="w-4 h-4" />
                                                Atacante
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="edit-active">Jogador Ativo</Label>
                            <p className="text-sm text-muted-foreground">
                                Jogador pode participar da pelada
                            </p>
                        </div>
                        <Switch
                            id="edit-active"
                            checked={editForm.isActive}
                            onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowEditDialog(false)
                            setEditingPlayer(null)
                        }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                            <Pencil className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent >
            </Dialog >

            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar Convite</DialogTitle>
                        <DialogDescription>
                            Envie um convite por email para {selectedPlayer?.invitedPlayerName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="invite-email">Email do Jogador</Label>
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="exemplo@email.com"
                                value={newPlayerEmail}
                                onChange={(e) => setNewPlayerEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowInviteDialog(false)
                            setSelectedPlayer(null)
                            setNewPlayerEmail("")
                        }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSendInvite} className="bg-blue-600 hover:bg-blue-700">
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar Convite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Jogador</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover este jogador da pelada? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remover Jogador
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}