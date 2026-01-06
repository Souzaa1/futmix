"use client"

import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import Link from "next/link"
import { Calendar, Users, Plus, Edit, Trash2, Eye, Clock, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"
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

export default function PeladasPage() {
    const { user, canCreatePelada, isPending: roleLoading } = useRole()
    const { peladas, loading, error, pagination, goToPage, deletePelada } = usePeladas()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [peladaToDelete, setPeladaToDelete] = useState<string | null>(null)

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
                        Faça login para visualizar as peladas.
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

    const handleDeleteClick = (id: string) => {
        setPeladaToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (peladaToDelete) {
            try {
                await deletePelada(peladaToDelete)
                setDeleteDialogOpen(false)
                setPeladaToDelete(null)
            } catch (error) {
                alert("Erro ao deletar pelada")
            }
        }
    }

    return (
        <div className="min-h-full bg-zinc-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Peladas</h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Gerencie os jogos organizados na plataforma.
                        </p>
                    </div>
                    {canCreatePelada() && (
                        <Link href="/peladas/nova">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm font-medium h-10 px-4 shadow-sm group">
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition ease-in-out" />
                                Nova Pelada
                            </Button>
                        </Link>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 rounded-sm border-red-200 bg-red-50 text-red-800">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {peladas.length === 0 ? (
                    <div className="text-center py-24 bg-white border border-zinc-200 border-dashed rounded-sm">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                            <Calendar className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                            Nenhuma pelada encontrada
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                            {canCreatePelada()
                                ? "Crie a primeira pelada para começar a organizar os jogos."
                                : "Não há jogos disponíveis no momento."
                            }
                        </p>
                        {canCreatePelada() && (
                            <Link href="/peladas/nova">
                                <Button variant="outline" className="border-zinc-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-sm">
                                    Criar Primeira Pelada
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {peladas.map((pelada) => (
                                <div
                                    key={pelada.id}
                                    className="group bg-white rounded-sm border border-zinc-200 p-5 hover:border-emerald-500/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between h-full"
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h3 className="font-semibold text-zinc-900 truncate leading-tight group-hover:text-emerald-700 transition-colors">
                                                    {pelada.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${pelada.type === 'RECORRENTE'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-zinc-100 text-zinc-600'
                                                        }`}>
                                                        {pelada.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                <Clock className="w-4 h-4 text-zinc-400" />
                                                <span>{format(new Date(pelada.date), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                <Users className="w-4 h-4 text-zinc-400" />
                                                <span>{pelada._count.players} jogadores</span>
                                            </div>
                                            <div className="text-xs text-zinc-400 pt-1">
                                                Org. por {pelada.createdBy.name.split(' ')[0]}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
                                        <Link href={`/peladas/${pelada.id}`} className="flex-1">
                                            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm text-xs font-medium uppercase tracking-wide">
                                                <Eye className="w-3.5 h-3.5 mr-2" />
                                                Detalhes
                                            </Button>
                                        </Link>

                                        {canCreatePelada() && (
                                            <div className="flex items-center gap-1">
                                                <Link href={`/peladas/${pelada.id}/editar`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    onClick={() => handleDeleteClick(pelada.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-sm"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center pt-8">
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => pagination.page > 1 && goToPage(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="h-8 w-8 rounded-sm border-zinc-200 disabled:opacity-30"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs font-medium text-zinc-500 px-3">
                                        Página {pagination.page} de {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => pagination.page < pagination.totalPages && goToPage(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="h-8 w-8 rounded-sm border-zinc-200 disabled:opacity-30"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="rounded-sm border-zinc-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A pelada e todos os dados serão removidos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-sm border-zinc-200">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 rounded-sm"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}