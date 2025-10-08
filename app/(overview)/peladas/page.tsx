"use client"

import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import Link from "next/link"
import { Calendar, Users, Trophy, Plus, Edit, Trash2, Eye, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

export default function PeladasPage() {
    const { user, canCreatePelada, isPending: roleLoading } = useRole()
    const { peladas, loading, error, pagination, goToPage, deletePelada } = usePeladas()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [peladaToDelete, setPeladaToDelete] = useState<string | null>(null)

    if (roleLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-lg text-gray-600 font-medium">Carregando peladas...</p>
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
        <div className="min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Peladas</h1>
                            <p className="text-gray-600">
                                Gerencie e participe das peladas de futebol
                            </p>
                        </div>
                        {canCreatePelada() && peladas.length > 0 && (
                            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                                <Link href="/peladas/nova">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Nova Pelada
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">Suas Peladas</CardTitle>
                                <CardDescription className="mt-1">
                                    {peladas.length > 0
                                        ? `${peladas.length} pelada${peladas.length > 1 ? 's' : ''} encontrada${peladas.length > 1 ? 's' : ''}`
                                        : "Nenhuma pelada cadastrada"
                                    }
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {peladas.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Nenhuma pelada encontrada
                                </h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    {canCreatePelada()
                                        ? "Comece criando sua primeira pelada e convide seus amigos para jogar!"
                                        : "Você ainda não está participando de nenhuma pelada. Aguarde um convite!"
                                    }
                                </p>
                                {canCreatePelada() && (
                                    <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                                        <Link href="/peladas/nova">
                                            <Plus className="w-5 h-5 mr-2" />
                                            Criar Primeira Pelada
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {peladas.map((pelada) => (
                                    <Card key={pelada.id} className="hover:shadow-lg transition-shadow duration-200">
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <CardTitle className="text-lg line-clamp-2">{pelada.name}</CardTitle>
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
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{format(new Date(pelada.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">{pelada._count.players} jogadores</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                    <span className="truncate max-w-[120px]">por {pelada.createdBy.name}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button asChild variant="default" size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                                    <Link href={`/peladas/${pelada.id}`}>
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Ver
                                                    </Link>
                                                </Button>
                                                {canCreatePelada() && (
                                                    <>
                                                        <Button asChild variant="outline" size="sm" className="border-yellow-600 text-yellow-700 hover:bg-yellow-50">
                                                            <Link href={`/peladas/${pelada.id}/editar`}>
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteClick(pelada.id)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-red-600 text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => pagination.page > 1 && goToPage(pagination.page - 1)}
                                        className={pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {[...Array(pagination.totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    const isCurrentPage = pageNumber === pagination.page;

                                    // Mostrar apenas algumas páginas ao redor da página atual
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === pagination.totalPages ||
                                        (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    onClick={() => goToPage(pageNumber)}
                                                    isActive={isCurrentPage}
                                                    className="cursor-pointer"
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (
                                        pageNumber === pagination.page - 2 ||
                                        pageNumber === pagination.page + 2
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
                                        onClick={() => pagination.page < pagination.totalPages && goToPage(pagination.page + 1)}
                                        className={pagination.page === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                <div className="text-center text-sm text-muted-foreground mt-4">
                    Mostrando {peladas.length} de {pagination.total} peladas
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A pelada será permanentemente deletada e todos os dados associados serão removidos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Deletar Pelada
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}