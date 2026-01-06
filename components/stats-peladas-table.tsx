"use client"

import { useState, useMemo } from "react"
import { PeladaStats } from "@/hooks/use-detailed-stats"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Search, Filter, Star, Target, Award } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatsPeladasTableProps {
    peladas: PeladaStats[]
}

const POSITION_LABELS: Record<string, string> = {
    GOLEIRO: "GOL",
    ZAGUEIRO: "ZAG",
    MEIO: "MEI",
    ATACANTE: "ATA",
}

export function StatsPeladasTable({ peladas }: StatsPeladasTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [positionFilter, setPositionFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")

    const filteredPeladas = useMemo(() => {
        return peladas.filter(pelada => {
            const matchesSearch = pelada.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesPosition = positionFilter === "all" || pelada.position === positionFilter
            const matchesType = typeFilter === "all" || pelada.type === typeFilter

            return matchesSearch && matchesPosition && matchesType
        })
    }, [peladas, searchTerm, positionFilter, typeFilter])

    if (peladas.length === 0) {
        return (
            <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                <p className="text-sm text-zinc-500 text-center">Sem peladas para exibir</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-sm border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                        Histórico de Peladas
                    </h3>
                    <span className="text-xs text-zinc-500">
                        {filteredPeladas.length} de {peladas.length} peladas
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar pelada..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9 text-sm"
                        />
                    </div>
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Todas as posições" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as posições</SelectItem>
                            <SelectItem value="GOLEIRO">Goleiro</SelectItem>
                            <SelectItem value="ZAGUEIRO">Zagueiro</SelectItem>
                            <SelectItem value="MEIO">Meio Campo</SelectItem>
                            <SelectItem value="ATACANTE">Atacante</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os tipos</SelectItem>
                            <SelectItem value="RECORRENTE">Recorrente</SelectItem>
                            <SelectItem value="UNICA">Única</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                Pelada
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                Posição
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                Rating
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                Gols
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                Assist.
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {filteredPeladas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-500">
                                    Nenhuma pelada encontrada
                                </td>
                            </tr>
                        ) : (
                            filteredPeladas.map((pelada) => (
                                <tr key={pelada.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-400" />
                                            <span className="text-sm font-medium text-zinc-900">
                                                {pelada.name}
                                            </span>
                                        </div>
                                        <span className="text-xs text-zinc-500 mt-0.5 block">
                                            {pelada.type === "RECORRENTE" ? "Recorrente" : "Única"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-700">
                                            {format(new Date(pelada.date), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {pelada.position ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-sm bg-zinc-100 text-xs font-medium text-zinc-700">
                                                {POSITION_LABELS[pelada.position] || pelada.position}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-zinc-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-sm font-semibold text-zinc-900">
                                                {pelada.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Target className="w-3.5 h-3.5 text-blue-600" />
                                            <span className="text-sm font-semibold text-zinc-900">
                                                {pelada.goals}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-amber-600" />
                                            <span className="text-sm font-semibold text-zinc-900">
                                                {pelada.assists}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

