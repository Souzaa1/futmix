"use client"

import { useSession } from "@/lib/auth-client"

export function useRole() {
    const { data: session, isPending } = useSession()

    const hasRole = (role: string) => {
        if (!session?.user) return false
        return (session.user as any).role === role
    }

    const hasAnyRole = (roles: string[]) => {
        if (!session?.user) return false
        return roles.includes((session.user as any).role)
    }

    const isAdmin = () => hasRole('ADMIN')
    const isPresident = () => hasRole('PRESIDENT')
    const isPlayer = () => hasRole('PLAYER')
    const canCreatePelada = () => hasAnyRole(['ADMIN', 'PRESIDENT'])

    return {
        session,
        isPending,
        user: session?.user,
        role: (session?.user as any)?.role,
        hasRole,
        hasAnyRole,
        isAdmin,
        isPresident,
        isPlayer,
        canCreatePelada,
    }
}
