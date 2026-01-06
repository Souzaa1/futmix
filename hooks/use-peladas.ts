"use client"

import { useState, useEffect } from "react"

export interface Pelada {
    id: string
    name: string
    type: "RECORRENTE" | "UNICA"
    date: string
    createdById: string
    createdAt: string
    updatedAt: string
    createdBy: {
        id: string
        name: string
        email: string
    }
    players: Array<{
        id: string
        rating: number
        goals: number
        assists: number
        position: "GOLEIRO" | "ZAGUEIRO" | "MEIO" | "ATACANTE" | null
        isActive: boolean
        isInvited: boolean
        isWaitingList: boolean
        invitedPlayerName: string | null
        invitedPlayerEmail: string | null
        user: {
            id: string
            name: string
            email: string
        } | null
    }>
    _count: {
        players: number
    }
}

export interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}

export function usePeladas(initialPage = 1, initialLimit = 10) {
    const [peladas, setPeladas] = useState<Pelada[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: initialPage,
        limit: initialLimit,
        total: 0,
        totalPages: 0
    })

    const fetchPeladas = async (page = pagination.page, limit = pagination.limit) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/peladas?page=${page}&limit=${limit}`)

            if (!response.ok) {
                throw new Error("Failed to fetch peladas")
            }

            const data = await response.json()
            setPeladas(data.peladas)
            setPagination(data.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const createPelada = async (data: { name: string; type: "RECORRENTE" | "UNICA"; date: string }) => {
        try {
            const response = await fetch("/api/peladas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to create pelada")
            }

            const newPelada = await response.json()
            setPeladas((prev: any) => [newPelada, ...prev])
            return newPelada
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    const updatePelada = async (id: string, data: { name?: string; type?: "RECORRENTE" | "UNICA"; date?: string }) => {
        try {
            const response = await fetch(`/api/peladas/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to update pelada")
            }

            const updatedPelada = await response.json()
            setPeladas((prev: any) => prev.map((p: any) => p.id === id ? updatedPelada : p))
            return updatedPelada
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    const deletePelada = async (id: string) => {
        try {
            const response = await fetch(`/api/peladas/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete pelada")
            }

            setPeladas((prev: any) => prev.filter((p: any) => p.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    const addPlayer = async (peladaId: string, userId: string) => {
        try {
            const response = await fetch(`/api/peladas/${peladaId}/players`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            })

            if (!response.ok) {
                throw new Error("Failed to add player")
            }

            // Refresh peladas to get updated data
            await fetchPeladas()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    const removePlayer = async (peladaId: string, userId: string) => {
        try {
            const response = await fetch(`/api/peladas/${peladaId}/players?userId=${userId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to remove player")
            }

            // Refresh peladas to get updated data
            await fetchPeladas()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    const updatePlayerStats = async (peladaId: string, playerId: string, stats: { rating?: number; goals?: number; assists?: number }) => {
        try {
            const response = await fetch(`/api/peladas/${peladaId}/players/${playerId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(stats),
            })

            if (!response.ok) {
                throw new Error("Failed to update player stats")
            }

            // Refresh peladas to get updated data
            await fetchPeladas()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    const goToPage = (page: number) => {
        fetchPeladas(page, pagination.limit)
    }

    const changeLimit = (limit: number) => {
        fetchPeladas(1, limit)
    }

    useEffect(() => {
        fetchPeladas(initialPage, initialLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        peladas,
        loading,
        error,
        pagination,
        fetchPeladas,
        goToPage,
        changeLimit,
        createPelada,
        updatePelada,
        deletePelada,
        addPlayer,
        removePlayer,
        updatePlayerStats,
    }
}
