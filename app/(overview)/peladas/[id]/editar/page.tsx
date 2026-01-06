"use client"

import { useRole } from "@/hooks/use-role"
import { usePeladas } from "@/hooks/use-peladas"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Save, X, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!user || (pelada && !canCreatePelada())) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                <Card className="max-w-md w-full p-8 text-center border-zinc-200 shadow-sm rounded-sm">
                    <h1 className="text-xl font-bold text-zinc-900 mb-2">Acesso Negado</h1>
                    <p className="text-zinc-500 text-sm mb-6">Você não tem permissão para editar esta pelada.</p>
                    <Button variant="outline" onClick={() => router.back()} className="w-full rounded-sm">
                        Voltar
                    </Button>
                </Card>
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await updatePelada(pelada.id, formData)
            router.push(`/peladas/${pelada.id}`)
        } catch (error) {
            console.error("Erro ao atualizar pelada:", error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-full bg-zinc-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link
                        href={`/peladas/${pelada.id}`}
                        className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        Voltar para detalhes
                    </Link>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Editar Pelada</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Atualize as informações do jogo.
                    </p>
                </div>

                <div className="bg-white border border-zinc-200 shadow-sm rounded-sm overflow-hidden">
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-6 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Nome da Pelada
                                </Label>
                                <Input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-10 rounded-sm border-zinc-200 focus-visible:ring-emerald-600"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="type" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Tipo
                                    </Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value as "RECORRENTE" | "UNICA" })}
                                    >
                                        <SelectTrigger className="rounded-sm border-zinc-200 w-full">
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UNICA">Única</SelectItem>
                                            <SelectItem value="RECORRENTE">Recorrente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Data e Hora
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        id="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="rounded-sm border-zinc-200 focus-visible:ring-emerald-600 block accent-emerald-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <Link href={`/peladas/${pelada.id}`}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium"
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="h-10 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Salvar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
