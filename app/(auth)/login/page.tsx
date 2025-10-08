"use client"

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
    email: z.string().email("Por favor, insira um email válido"),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
})

type SignInSchema = z.infer<typeof signInSchema>

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSubmit = async (data: SignInSchema) => {
        setLoading(true)
        setError(null)
        try {
            await signIn.email({
                email: data.email,
                password: data.password,
            })

            router.push("/dashboard")
        } catch (error) {
            console.error("Auth error:", error)
            setError("Erro ao fazer login. Verifique suas credenciais e tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError(null)
        try {
            await signIn.social({
                provider: "google",
            })
        } catch (error) {
            console.error("Google auth error:", error)
            setError("Erro ao fazer login com Google. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Futmix
                    </h1>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Entre na sua conta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Acesse o Futmix para organizar suas peladas
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full mb-6 h-11"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continuar com Google
                    </Button>

                    <div className="relative mb-6">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                            OU
                        </span>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="seu@email.com"
                                                className="h-11"
                                                disabled={loading}
                                                autoComplete="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Senha
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-11"
                                                disabled={loading}
                                                autoComplete="current-password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-end">
                                <a
                                    href="/forgot-password"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Esqueceu a senha?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-primary"
                            >
                                {loading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>
                    </Form>
                </div>

                {/* Link para cadastro */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Não tem uma conta?{" "}
                        <button
                            onClick={() => router.push("/register")}
                            className="font-semibold text-blue-600 hover:text-blue-500"
                            disabled={loading}
                        >
                            Cadastre-se
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}