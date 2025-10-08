"use client"

import { useState } from "react"

export interface InvitePlayerData {
    name: string
    email: string
}

export function useInvites() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const invitePlayer = async (peladaId: string, data: InvitePlayerData) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/peladas/${peladaId}/invite-player`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to invite player")
            }

            const result = await response.json()
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred"
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const checkInvite = async (token: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/invite/accept?token=${token}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to check invite")
            }

            const data = await response.json()
            return data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred"
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const acceptInvite = async (token: string, password: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/invite/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to accept invite")
            }

            const data = await response.json()
            return data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred"
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        invitePlayer,
        checkInvite,
        acceptInvite,
    }
}
