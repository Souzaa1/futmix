"use client"

import { useState } from "react"
import { useRole } from "@/hooks/use-role"
import { useRouter } from "next/navigation"

export default function NovaPeladaPage() {
    const { canCreatePelada, isPending } = useRole()
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        type: "UNICA" as "RECORRENTE" | "UNICA",
        date: "",
    })
    const [loading, setLoading] = useState(false)

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (!canCreatePelada()) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
                    <p className="text-gray-600 mb-4">
                        Você não tem permissão para criar peladas.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/peladas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error("Erro ao criar pelada")
            }

            // Redirecionar para lista de peladas
            router.push("/peladas")
        } catch (error) {
            console.error("Erro ao criar pelada:", error)
            alert("Erro ao criar pelada. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-800 mb-4"
                    >
                        ← Voltar
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Nova Pelada</h1>
                    <p className="mt-2 text-gray-600">
                        Crie uma nova pelada de futebol
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nome da Pelada
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ex: Pelada do Sábado"
                            />
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                Tipo da Pelada
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as "RECORRENTE" | "UNICA" })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="UNICA">Única</option>
                                <option value="RECORRENTE">Recorrente</option>
                            </select>
                            <p className="mt-1 text-sm text-gray-500">
                                {formData.type === "UNICA"
                                    ? "Pelada que acontece apenas uma vez"
                                    : "Pelada que se repete regularmente"
                                }
                            </p>
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Data e Hora
                            </label>
                            <input
                                type="datetime-local"
                                id="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Criando..." : "Criar Pelada"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
