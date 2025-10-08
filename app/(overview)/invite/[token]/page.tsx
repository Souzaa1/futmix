"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Trophy, Calendar, User, Mail, Lock, CheckCircle } from "lucide-react"

interface InviteData {
    name: string
    email: string
    pelada: {
        name: string
        date: string
        type: string
    }
    inviter: {
        name: string
    }
    expiresAt: string
}

export default function AcceptInvitePage() {
    const params = useParams()
    const router = useRouter()
    const [invite, setInvite] = useState<InviteData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [accepting, setAccepting] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (params.token) {
            fetchInvite()
        }
    }, [params.token])

    const fetchInvite = async () => {
        try {
            const response = await fetch(`/api/invite/accept?token=${params.token}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to fetch invite")
            }

            const data = await response.json()
            setInvite(data.invite)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptInvite = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setAccepting(true)
        setError(null)

        try {
            const response = await fetch("/api/invite/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: params.token,
                    password
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to accept invite")
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setAccepting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">Carregando convite...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Convite Inválido</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Ir para o Início
                    </button>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Conta Criada com Sucesso!</h1>
                    <p className="text-gray-600 mb-6">
                        Sua conta foi criada e você foi adicionado à pelada.
                        Redirecionando para o login...
                    </p>
                </div>
            </div>
        )
    }

    if (!invite) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Você foi convidado!</h1>
                        <p className="text-gray-600 mt-2">
                            {invite.inviter.name} te convidou para participar da pelada
                        </p>
                    </div>

                    {/* Informações do Convite */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Detalhes da Pelada</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                    <strong>{invite.pelada.name}</strong>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                    {invite.name} ({invite.email})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                    Tipo: {invite.pelada.type}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Formulário de Criação de Conta */}
                    <form onSubmit={handleAcceptInvite} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                <Lock className="w-4 h-4 inline mr-1" />
                                Senha
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Digite sua senha"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                <Lock className="w-4 h-4 inline mr-1" />
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Confirme sua senha"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={accepting}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {accepting ? "Criando Conta..." : "Aceitar Convite e Criar Conta"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Ao aceitar, você criará uma conta e será adicionado à pelada automaticamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
