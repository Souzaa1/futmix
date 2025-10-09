"use client"

import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Save, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function EditarPeladaPage() {
    const params = useParams()
    const router = useRouter()
    const { user, canCreatePelada, isPending: roleLoading } = useRole()
    const { peladas, loading, error, updatePelada } = usePeladas()
    const [pelada, setPelada] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: "",
        type: "UNICA" as "RECORRENTE" | "UNICA",
        date: ""
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (peladas.length > 0) {
            const foundPelada = peladas.find(p => p.id === params.id)
            if (foundPelada) {
                setPelada(foundPelada)
                setFormData({
                    name: foundPelada.name,
                    type: foundPelada.type,
                    date: new Date(foundPelada.date).toISOString().slice(0, 16)
                })
            }
        }
    }, [peladas, params.id])

    if (roleLoading || loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">Carregando...</div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
                    <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
                    <Link
                        href="/login"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Fazer Login
                    </Link>
                </div>
            </div>
        )
    }

    if (!canCreatePelada()) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
                    <p className="text-gray-600 mb-4">Você não tem permissão para editar peladas.</p>
                    <Link
                        href="/peladas"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Voltar às Peladas
                    </Link>
                </div>
            </div>
        )
    }

    if (!pelada) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Pelada não encontrada</h1>
                    <Link
                        href="/peladas"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Voltar às Peladas
                    </Link>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await updatePelada(pelada.id, formData)
            router.push(`/peladas/${pelada.id}`)
        } catch (error) {
            console.error("Erro ao atualizar pelada:", error)
            alert("Erro ao atualizar pelada. Tente novamente.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="h-full flex items-center justify-center w-full">
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Pelada</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Pelada
                            </Label>
                            <Input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-9"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo da Pelada
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as "RECORRENTE" | "UNICA" })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UNICA">Única</SelectItem>
                                    <SelectItem value="RECORRENTE">Recorrente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                Data e Hora
                            </Label>
                            <Input
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1 h-9 border bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                            <Link
                                href={`/peladas/${pelada.id}`}
                                className="flex-1 h-9 flex items-center justify-center gap-2 text-rose-700 hover:text-rose-500 hover:bg-rose-50 border border-rose-100 px-4 py-2 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
