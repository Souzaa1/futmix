"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"

export interface TimeSeriesData {
    period: string
    month: string
    rating: number
    goals: number
    assists: number
    peladas: number
}

export interface PositionStats {
    count: number
    avgRating: number
    totalGoals: number
    totalAssists: number
}

export interface PeladaStats {
    id: string
    name: string
    date: string
    type: string
    rating: number
    goals: number
    assists: number
    position: string | null
}

export interface Rankings {
    bestRating: number
    worstRating: number
    bestGoals: number
    bestAssists: number
    avgRating: number
    totalGoals: number
    totalAssists: number
    totalPeladas: number
}

export interface MonthStats {
    peladas: number
    avgRating: number
    totalGoals: number
    totalAssists: number
}

export interface Comparisons {
    thisMonth: MonthStats
    lastMonth: MonthStats
    trends: {
        rating: number
        goals: number
        assists: number
        peladas: number
    }
}

export interface DetailedStats {
    timeSeries: TimeSeriesData[]
    byPosition: Record<string, PositionStats>
    byPelada: PeladaStats[]
    rankings: Rankings
    comparisons: Comparisons
}

export function useDetailedStats() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<DetailedStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = async () => {
        if (!session?.user?.id) return

        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`/api/stats/detailed?userId=${session.user.id}`)

            if (!response.ok) {
                throw new Error("Failed to fetch detailed stats")
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

