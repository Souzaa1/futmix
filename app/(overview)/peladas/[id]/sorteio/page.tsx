"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import { useDraws } from "@/hooks/use-draws"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DrawVisualization } from "@/components/draw-visualization"
import { DrawConfigDialog } from "@/components/draw-config-dialog"
import { Shuffle, History, AlertCircle, Users, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

export default function SorteioPage() {
    const params = useParams()
    const router = useRouter()
    const peladaId = params.id as string
    const { user, canCreatePelada } = useRole()
    const { peladas, loading: peladasLoading } = usePeladas()
    const { draws, activeDraw, loading: drawsLoading, createDraw, deleteDraw } = useDraws(peladaId)
    const [showConfigDialog, setShowConfigDialog] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [drawToDelete, setDrawToDelete] = useState<string | null>(null)

    const pelada = peladas.find(p => p.id === peladaId)
    const activePlayers = pelada?.players.filter(p => p.isActive) || []

    if (peladasLoading || drawsLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-lg text-gray-600 font-medium">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!pelada) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>Pelada não encontrada</CardTitle>
                        <CardDescription>
                            A pelada que você está procurando não existe ou foi removida.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/peladas">Voltar às Peladas</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleCreateDraw = async (config: any) => {
        try {
            await createDraw(config)
            toast.success("Sorteio criado com sucesso!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao criar sorteio")
            throw error
        }
    }

    const handleDeleteClick = (drawId: string) => {
        setDrawToDelete(drawId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (drawToDelete) {
            try {
                await deleteDraw(drawToDelete)
                toast.success("Sorteio deletado com sucesso")
                setDeleteDialogOpen(false)
                setDrawToDelete(null)
            } catch (error) {
                toast.error("Erro ao deletar sorteio")
            }
        }
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/peladas/${peladaId}`}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sorteio de Times</h1>
                            <p className="text-gray-600">{pelada.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {canCreatePelada() && (
                                <Button
                                    onClick={() => setShowConfigDialog(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    disabled={activePlayers.length === 0}
                                >
                                    <Shuffle className="w-4 h-4 mr-2" />
                                    Novo Sorteio
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <Link href={`/peladas/${peladaId}/sorteio/historico`}>
                                    <History className="w-4 h-4 mr-2" />
                                    Histórico
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Jogadores Ativos Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Jogadores Disponíveis
                                </CardTitle>
                                <CardDescription>
                                    {activePlayers.length} jogador{activePlayers.length !== 1 ? 'es' : ''} ativo{activePlayers.length !== 1 ? 's' : ''} para o sorteio
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    {activePlayers.length === 0 && (
                        <CardContent>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Nenhum jogador ativo disponível. Adicione jogadores e ative-os para poder sortear times.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    )}
                </Card>

                {/* Sorteio Ativo */}
                {activeDraw ? (
                    <div className="space-y-6">
                        <div>
                            <DrawVisualization
                                draw={activeDraw}
                                showActions={canCreatePelada()}
                                onDelete={handleDeleteClick}
                            />
                        </div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Shuffle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Nenhum sorteio ativo
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {activePlayers.length === 0
                                        ? "Adicione jogadores ativos para começar a sortear times."
                                        : "Crie um novo sorteio para distribuir os jogadores em times balanceados."
                                    }
                                </p>
                                {canCreatePelada() && activePlayers.length > 0 && (
                                    <Button
                                        onClick={() => setShowConfigDialog(true)}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Shuffle className="w-4 h-4 mr-2" />
                                        Criar Primeiro Sorteio
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Dialog de Configuração */}
            <DrawConfigDialog
                open={showConfigDialog}
                onOpenChange={setShowConfigDialog}
                activePlayers={activePlayers.map(p => ({
                    id: p.id,
                    rating: p.rating,
                    user: p.user,
                    invitedPlayerName: p.invitedPlayerName
                }))}
                onCreateDraw={handleCreateDraw}
            />

            {/* Dialog de Confirmação de Delete */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Sorteio</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja deletar este sorteio? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

