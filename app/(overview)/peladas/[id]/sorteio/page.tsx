"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import { useDraws } from "@/hooks/use-draws"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DrawVisualization } from "@/components/draw-visualization"
import { DialogSortTeams } from "@/components/dialog-sort-teams"
import { Shuffle, History, AlertCircle, Users, ArrowLeft, Loader2, Trophy } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
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

    const pelada = peladas.find((p: any) => p.id === peladaId)
    const activePlayers = pelada?.players.filter((p: any) => p.isActive && !p.isWaitingList) || []

    if (peladasLoading || drawsLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
                    <span className="text-sm font-medium text-zinc-500">Carregando dados...</span>
                </div>
            </div>
        )
    }

    if (!pelada) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-white p-6">
                <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center  border border-zinc-200 bg-zinc-50">
                        <AlertCircle className="h-6 w-6 text-zinc-900" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-lg font-bold uppercase tracking-tight text-zinc-900">Pelada não encontrada</h1>
                        <p className="text-sm text-zinc-500">Não foi possível localizar os dados desta pelada.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/peladas')}
                        className="h-10 w-full  border-zinc-200 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                    >
                        Voltar para Lista
                    </Button>
                </div>
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
        <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-6 py-4">
                <div className="mx-auto flex max-w-[1920px] items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href={`/peladas/${peladaId}`}
                            className="group rounded-full flex h-8 w-8 items-center justify-center  border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="h-8 w-px bg-zinc-100" />
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="sm:text-lg text-base font-bold uppercase tracking-tight text-zinc-900">Sorteio de Times</h1>
                                <span className="bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 hidden sm:block">
                                    {pelada.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-4 border-r border-zinc-100 pr-6 mr-3 sm:flex">
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Jogadores</p>
                                <p className="text-sm font-bold text-zinc-900">{activePlayers.length} Ativos</p>
                            </div>
                        </div>

                        <Button
                        
                            variant="outline"
                            asChild
                            className="h-9  border-zinc-200 bg-white px-4 text-xs font-semibold uppercase tracking-wide text-zinc-700 hover:bg-zinc-50"
                        >
                            <Link href={`/peladas/${peladaId}/sorteio/historico`}>
                                <History className="h-3.5 w-3.5" />
                                <p className="hidden sm:block">Histórico</p>
                            </Link>
                        </Button>

                        {canCreatePelada() && (
                            <Button
                                onClick={() => setShowConfigDialog(true)}
                                className="h-9 px-4 text-xs font-semibold uppercase tracking-wide text-white"
                                disabled={activePlayers.length === 0}
                            >
                                <Shuffle className="h-3.5 w-3.5" />
                                <p className="hidden sm:block">Novo Sorteio</p>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 bg-white px-6 py-8">
                <div className="mx-auto max-w-[1920px]">
                    {activePlayers.length === 0 && (
                        <div className="mb-6 flex items-center gap-3 border border-amber-200 bg-amber-50 p-4">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <p className="text-sm font-medium text-amber-900">
                                Nenhum jogador ativo para o sorteio. Adicione jogadores ou marque-os como presentes.
                            </p>
                        </div>
                    )}

                    {activeDraw ? (
                        <div className="animate-in fade-in duration-500">
                            <DrawVisualization
                                draw={activeDraw}
                                showActions={canCreatePelada()}
                                onDelete={handleDeleteClick}
                            />
                        </div>
                    ) : (
                        <div className="flex rounded-xl min-h-[400px] flex-col items-center justify-center border border-dashed border-zinc-200 bg-zinc-50/50 p-12">
                            <div className="mb-6 rounded-full flex h-16 w-16 items-center justify-center  border border-zinc-200 bg-white shadow-sm">
                                <Trophy className="h-8 w-8 text-zinc-300" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold uppercase tracking-tight text-zinc-900">
                                Nenhum sorteio ativo
                            </h3>
                            <p className="mb-8 max-w-md text-center text-sm text-zinc-500">
                                {activePlayers.length === 0
                                    ? "Adicione jogadores ativos na pelada para começar a sortear os times de forma equilibrada."
                                    : "Utilize o botão 'Novo Sorteio' para gerar os times automaticamente com base no nível técnico."
                                }
                            </p>
                            {canCreatePelada() && activePlayers.length > 0 && (
                                <Button
                                    onClick={() => setShowConfigDialog(true)}
                                    className="h-10 px-8 text-sm font-semibold uppercase tracking-wide text-white"
                                >
                                    Criar Primeiro Sorteio
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <DialogSortTeams
                open={showConfigDialog}
                onOpenChange={setShowConfigDialog}
                activePlayers={activePlayers.map(p => ({
                    id: p.id,
                    rating: p.rating,
                    position: p.position,
                    user: p.user,
                    invitedPlayerName: p.invitedPlayerName
                }))}
                onCreateDraw={handleCreateDraw}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className=" border-zinc-200 bg-white p-6 shadow-none sm:max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold uppercase tracking-tight text-zinc-900">
                            Deletar Sorteio
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-zinc-500">
                            Esta ação removerá permanentemente este sorteio e não poderá ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
                        <AlertDialogCancel className="h-9  border-zinc-200 bg-white text-xs font-semibold uppercase tracking-wide text-zinc-700 hover:bg-zinc-50">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="h-9  bg-red-600 text-xs font-semibold uppercase tracking-wide text-white hover:bg-red-700"
                        >
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
