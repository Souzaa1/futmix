"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"

export interface UserStats {
    totalPeladas: number
    peladasEsteMes: number
    notaMedia: number
    totalGols: number
    golsEsteMes: number
    totalAssistencias: number
    assistenciasEsteMes: number
    peladasRecentes: Array<{
        id: string
        name: string
        date: string
        type: string
        rating: number
        goals: number
        assists: number
        criadaPorMim?: boolean
    }>
}

export function useStats() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<UserStats>({
        totalPeladas: 0,
        peladasEsteMes: 0,
        notaMedia: 5.0,
        totalGols: 0,
        golsEsteMes: 0,
        totalAssistencias: 0,
        assistenciasEsteMes: 0,
        peladasRecentes: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = async () => {
        if (!session?.user?.id) return

        try {
            setLoading(true)
            const response = await fetch(`/api/stats?userId=${session.user.id}`)

            if (!response.ok) {
                throw new Error("Failed to fetch stats")
            }

            const data = await response.json()
            setStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.id) {
            fetchStats()
        }
    }, [session?.user?.id])

    return {
        stats,
        loading,
        error,
        refetch: fetchStats
    }
}
