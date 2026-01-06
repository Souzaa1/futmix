"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import { useDraws } from "@/hooks/use-draws"
import { Button } from "@/components/ui/button"
import { DrawVisualization } from "@/components/draw-visualization"
import { ArrowLeft, Calendar, Loader2, AlertCircle } from "lucide-react"
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

export default function HistoricoSorteioPage() {
    const params = useParams()
    const peladaId = params.id as string
    const { canCreatePelada } = useRole()
    const { peladas, loading: peladasLoading } = usePeladas()
    const { draws, loading: drawsLoading, setActiveDraw, deleteDraw } = useDraws(peladaId)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [drawToDelete, setDrawToDelete] = useState<string | null>(null)
    const [activateDialogOpen, setActivateDialogOpen] = useState(false)
    const [drawToActivate, setDrawToActivate] = useState<string | null>(null)

    const pelada = peladas.find(p => p.id === peladaId)

    if (peladasLoading || drawsLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
                    <span className="text-sm font-medium text-zinc-500">Carregando histórico...</span>
                </div>
            </div>
        )
    }

    if (!pelada) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-white p-6">
                <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
                        <AlertCircle className="h-6 w-6 text-zinc-900" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-lg font-bold uppercase tracking-tight text-zinc-900">Pelada não encontrada</h1>
                        <p className="text-sm text-zinc-500">A pelada que você está procurando não existe ou foi removida.</p>
                    </div>
                    <Button
                        variant="outline"
                        asChild
                        className="h-10 w-full border-zinc-200 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                    >
                        <Link href="/peladas">Voltar às Peladas</Link>
                    </Button>
                </div>
            </div>
        )
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

    const handleActivateClick = (drawId: string) => {
        setDrawToActivate(drawId)
        setActivateDialogOpen(true)
    }

    const handleConfirmActivate = async () => {
        if (drawToActivate) {
            try {
                await setActiveDraw(drawToActivate)
                toast.success("Sorteio ativado com sucesso")
                setActivateDialogOpen(false)
                setDrawToActivate(null)
            } catch (error) {
                toast.error("Erro ao ativar sorteio")
            }
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-6 py-4">
                <div className="mx-auto flex max-w-[1920px] items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href={`/peladas/${peladaId}/sorteio`}
                            className="group flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="h-8 w-px bg-zinc-100" />
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold uppercase tracking-tight text-zinc-900">Histórico</h1>
                                <span className="bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-600">
                                    {pelada.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 bg-white px-6 py-8">
                <div className="mx-auto max-w-[1920px]">
                    {draws.length === 0 ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                                <Calendar className="h-8 w-8 text-zinc-300" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold uppercase tracking-tight text-zinc-900">
                                Nenhum sorteio realizado
                            </h3>
                            <p className="mb-8 max-w-md text-center text-sm text-zinc-500">
                                Esta pelada ainda não possui sorteios registrados.
                            </p>
                            <Button
                                asChild
                                className="h-10 px-8 text-sm font-semibold uppercase tracking-wide text-white"
                            >
                                <Link href={`/peladas/${peladaId}/sorteio`}>
                                    Voltar para Sorteio
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {draws.map((draw: any) => (
                                <DrawVisualization
                                    key={draw.id}
                                    draw={draw}
                                    showActions={canCreatePelada()}
                                    onDelete={handleDeleteClick}
                                    onSetActive={handleActivateClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="border-zinc-200 bg-white p-6 shadow-none sm:max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold uppercase tracking-tight text-zinc-900">
                            Deletar Sorteio
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-zinc-500">
                            Tem certeza que deseja deletar este sorteio? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
                        <AlertDialogCancel className="h-9 border-zinc-200 bg-white text-xs font-semibold uppercase tracking-wide text-zinc-700 hover:bg-zinc-50">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="h-9 bg-red-600 text-xs font-semibold uppercase tracking-wide text-white hover:bg-red-700"
                        >
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
                <AlertDialogContent className="border-zinc-200 bg-white p-6 shadow-none sm:max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold uppercase tracking-tight text-zinc-900">
                            Ativar Sorteio
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-zinc-500">
                            Deseja tornar este sorteio o ativo? O sorteio atual será desativado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
                        <AlertDialogCancel className="h-9 border-zinc-200 bg-white text-xs font-semibold uppercase tracking-wide text-zinc-700 hover:bg-zinc-50">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmActivate}
                            className="h-9 bg-emerald-600 text-xs font-semibold uppercase tracking-wide text-white hover:bg-emerald-700"
                        >
                            Ativar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
