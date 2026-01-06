"use client"

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, UserPlus } from "lucide-react";

const signUpSchema = z.object({
    name: z.string().min(1, "Por favor, insira seu nome"),
    email: z.string().email("Por favor, insira um email válido"),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
})

type SignUpSchema = z.infer<typeof signUpSchema>

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const handleSubmit = async (data: SignUpSchema) => {
        setLoading(true)
        setError(null)
        try {
            await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
            })
            // Auth client likely handles redirection or session creation, 
            // but we can route to dashboard or login as fallback/confirmation
            // Assuming typically auto-login or redirect on success
            router.push("/dashboard")
        } catch (error) {
            console.error("Auth error:", error)
            setError("Erro ao criar conta. Tente novamente ou use um email diferente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative p-4 bg-zinc-900">
            {/* Background with overlay */}
            <div
                className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("/stadium.jpg")',
                }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-green-950/60" />

            <div className="w-full max-w-4xl bg-white/30 backdrop-blur-none rounded-sm shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Left Panel - Hero */}
                <div className="relative w-full md:w-1/2 bg-zinc-900 overflow-hidden hidden md:block group">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1886&auto=format&fit=crop")',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 text-white">
                        <div className="w-12 h-1 bg-green-600 mb-4" />
                        <h2 className="text-3xl font-bold leading-tight mb-2 tracking-tight">O futebol organizado.</h2>
                        <p className="text-zinc-300 text-sm leading-relaxed max-w-xs">Crie sua conta no Futmix e leve suas peladas para o próximo nível.</p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <span className="flex flex-col items-center gap-2">
                            <Image src="/logo.png" alt="Logo" width={100} height={100} />
                        </span>
                        <p className="text-xs text-white uppercase tracking-widest font-medium">
                            Crie sua conta
                        </p>
                    </div>

                    <div className="space-y-5">
                        {error && (
                            <Alert variant="destructive" className="rounded-none border-l-2 border-green-600 bg-green-50 p-3 text-green-700 [&>svg]:hidden">
                                <AlertDescription className="text-xs font-medium text-center">{error}</AlertDescription>
                            </Alert>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0 group">
                                            <FormLabel className="text-xs text-zinc-100">Nome completo</FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-600 transition-all duration-200 opacity-0 group-focus-within:opacity-100" />
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        placeholder="João Silva"
                                                        className="h-11 w-full rounded-sm border-zinc-300 bg-white px-4 pl-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:border-green-600 focus-visible:rounded-sm transition-colors"
                                                        disabled={loading}
                                                        autoComplete="name"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase tracking-wide text-green-600 mt-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0 group">
                                            <FormLabel className="text-xs text-zinc-100">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-600 transition-all duration-200 opacity-0 group-focus-within:opacity-100" />
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="seu@email.com"
                                                        className="h-11 w-full rounded-sm border-zinc-300 bg-white px-4 pl-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:border-green-600 focus-visible:rounded-sm transition-colors"
                                                        disabled={loading}
                                                        autoComplete="email"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase tracking-wide text-green-600 mt-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0 group">
                                            <FormLabel className="text-xs text-zinc-100">Senha</FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-600 transition-all duration-200 opacity-0 group-focus-within:opacity-100" />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        placeholder="Mínimo 8 caracteres"
                                                        className="h-11 w-full rounded-sm border-zinc-300 bg-white px-4 pl-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:border-green-600 transition-colors"
                                                        disabled={loading}
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase tracking-wide text-green-600 mt-1" />
                                        </FormItem>
                                    )}
                                />

                                <div className="text-[10px] text-zinc-200 pt-2 text-center">
                                    Ao criar uma conta, você concorda com nossos{" "}
                                    <a href="/terms" className="text-zinc-100 hover:text-green-500 font-medium underline">
                                        Termos de Uso
                                    </a>{" "}
                                    e{" "}
                                    <a href="/privacy" className="text-zinc-100 hover:text-green-500 font-medium underline">
                                        Política de Privacidade
                                    </a>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 rounded-sm bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Criando conta...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Criar conta
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="pt-4 flex flex-col items-center space-y-4">
                            <button
                                onClick={() => router.push("/login")}
                                className="text-xs text-zinc-300 hover:text-zinc-100 font-medium"
                                disabled={loading}
                            >
                                Já tem uma conta? <span className="text-green-500 font-bold uppercase ml-1">Faça login</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}