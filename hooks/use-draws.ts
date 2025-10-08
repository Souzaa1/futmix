"use client"

import { useState, useEffect } from "react"

export interface DrawPlayer {
    id: string
    position: string | null
    playerStats: {
        id: string
        rating: number
        goals: number
        assists: number
        user: {
            id: string
            name: string
            email: string
        } | null
        invitedPlayerName: string | null
    }
}

export interface Team {
    id: string
    name: string
    color: string
    averageRating: number
    players: DrawPlayer[]
}

export interface Draw {
    id: string
    peladaId: string
    createdById: string
    method: "MANUAL" | "AUTO_RANDOM" | "AUTO_BALANCED"
    numberOfTeams: number
    playersPerTeam: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    createdBy: {
        id: string
        name: string
        email: string
    }
    teams: Team[]
}

export function useDraws(peladaId: string) {
    const [draws, setDraws] = useState<Draw[]>([])
    const [activeDraw, setActiveDrawState] = useState<Draw | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDraws = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/peladas/${peladaId}/draws`)

            if (!response.ok) {
                throw new Error("Failed to fetch draws")
            }

            const data = await response.json()
            setDraws(data)

            // Encontrar o sorteio ativo
            const active = data.find((draw: Draw) => draw.isActive)
            setActiveDrawState(active || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const createDraw = async (data: {
        method: "MANUAL" | "AUTO_RANDOM" | "AUTO_BALANCED"
        numberOfTeams: number
        playersPerTeam: number
        manualTeams?: Array<{
            name: string
            color: string
            players: Array<{
                playerStatsId: string
                position?: "GOLEIRO" | "ZAGUEIRO" | "MEIO" | "ATACANTE"
            }>
        }>
    }) => {
        try {
            const response = await fetch(`/api/peladas/${peladaId}/draws`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create draw")
            }

            const newDraw = await response.json()
            setDraws(prev => [newDraw, ...prev])
            setActiveDrawState(newDraw)
            return newDraw
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    const setActiveDraw = async (drawId: string) => {
        try {
            const response = await fetch(`/api/peladas/${peladaId}/draws/${drawId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: true }),
            })

            if (!response.ok) {
                throw new Error("Failed to set active draw")
            }

            const updatedDraw = await response.json()
            setDraws(prev => prev.map(d => ({
                ...d,
                isActive: d.id === drawId
            })))
            setActiveDrawState(updatedDraw)
            return updatedDraw
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    const deleteDraw = async (drawId: string) => {
        try {
            const response = await fetch(`/api/peladas/${peladaId}/draws/${drawId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete draw")
            }

            setDraws(prev => prev.filter(d => d.id !== drawId))
            if (activeDraw?.id === drawId) {
                setActiveDrawState(null)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            throw err
        }
    }

    useEffect(() => {
        if (peladaId) {
            fetchDraws()
        }
    }, [peladaId])

    return {
        draws,
        activeDraw,
        loading,
        error,
        fetchDraws,
        createDraw,
        setActiveDraw,
        deleteDraw,
    }
}

