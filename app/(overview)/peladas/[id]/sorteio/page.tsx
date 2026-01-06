"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import { useDraws } from "@/hooks/use-draws"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DrawVisualization } from "@/components/draw-visualization"
import { DrawConfigDialog } from "@/components/draw-config-dialog"
import { Shuffle, History, AlertCircle, Users, ArrowLeft, Loader2 } from "lucide-react"
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
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!pelada) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                <Card className="max-w-md w-full p-8 text-center border-zinc-200 shadow-sm rounded-sm">
                    <h1 className="text-xl font-bold text-zinc-900 mb-2">Pelada não encontrada</h1>
                    <Button variant="outline" onClick={() => router.push('/peladas')} className="w-full rounded-sm mt-4">
                        Voltar para Lista
                    </Button>
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
        <div className="min-h-full bg-zinc-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link
                        href={`/peladas/${peladaId}`}
                        className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        Voltar para detalhes
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Sorteio de Times</h1>
                            <p className="text-sm text-zinc-500 mt-1">
                                {pelada.name}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {canCreatePelada() && (
                                <Button
                                    onClick={() => setShowConfigDialog(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm h-9 shadow-sm"
                                    disabled={activePlayers.length === 0}
                                >
                                    <Shuffle className="w-3.5 h-3.5 mr-2" />
                                    Novo Sorteio
                                </Button>
                            )}
                            <Button variant="outline" asChild className="rounded-sm border-zinc-200 h-9">
                                <Link href={`/peladas/${peladaId}/sorteio/historico`}>
                                    <History className="w-3.5 h-3.5 mr-2" />
                                    Histórico
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Available Players Box */}
                <div className="bg-white border border-zinc-200 shadow-sm rounded-sm p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                            <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900">Jogadores Disponíveis</h3>
                            <p className="text-xs text-zinc-500">
                                {activePlayers.length} ativo{activePlayers.length !== 1 ? 's' : ''} para o sorteio
                            </p>
                        </div>
                    </div>
                    {activePlayers.length === 0 && (
                        <div className="flex items-center gap-2 text-amber-600 text-xs font-medium bg-amber-50 px-3 py-1.5 rounded-sm border border-amber-100">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Nenhum jogador ativo
                        </div>
                    )}
                </div>

                {/* Active Draw / Empty State */}
                {activeDraw ? (
                    <div className="space-y-6">
                        <DrawVisualization
                            draw={activeDraw}
                            showActions={canCreatePelada()}
                            onDelete={handleDeleteClick}
                        />
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-zinc-200 rounded-sm p-12 text-center bg-zinc-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100 shadow-sm">
                            <Shuffle className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">
                            Nenhum sorteio ativo
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                            {activePlayers.length === 0
                                ? "Adicione jogadores ativos na pelada para começar a sortear os times."
                                : "Crie um novo sorteio para distribuir os jogadores."
                            }
                        </p>
                        {canCreatePelada() && activePlayers.length > 0 && (
                            <Button
                                onClick={() => setShowConfigDialog(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm h-9"
                            >
                                Criar Primeiro Sorteio
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Dialogs */}
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="rounded-sm border-zinc-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Sorteio</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja deletar este sorteio? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-sm">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 rounded-sm"
                        >
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
