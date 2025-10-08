"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import { useDraws } from "@/hooks/use-draws"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DrawVisualization } from "@/components/draw-visualization"
import { ArrowLeft, Calendar } from "lucide-react"
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
            <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-lg text-gray-600 font-medium">Carregando histórico...</p>
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
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/peladas/${peladaId}/sorteio`}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Sorteios</h1>
                        <p className="text-gray-600">{pelada.name}</p>
                    </div>
                </div>

                {/* Lista de Sorteios */}
                {draws.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Nenhum sorteio realizado
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Esta pelada ainda não possui sorteios. Crie o primeiro sorteio para começar.
                                </p>
                                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                    <Link href={`/peladas/${peladaId}/sorteio`}>
                                        Ir para Sorteios
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {draws.map((draw) => (
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

            {/* Dialog de Confirmação de Ativação */}
            <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ativar Sorteio</AlertDialogTitle>
                        <AlertDialogDescription>
                            Deseja tornar este sorteio o ativo? O sorteio atual será desativado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmActivate}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Ativar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

