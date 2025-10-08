import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'

export async function withAuth(
    request: NextRequest,
    allowedRoles: string[] = []
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return { session }
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
}

export function requireAuth(allowedRoles: string[] = []) {
    return async (request: NextRequest) => {
        return withAuth(request, allowedRoles)
    }
}
