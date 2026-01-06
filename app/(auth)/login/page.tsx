"use client"

import { useState } from "react";
import Image from "next/image";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

const signInSchema = z.object({
    email: z.string().email("Por favor, insira um email válido"),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
})

type SignInSchema = z.infer<typeof signInSchema>

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setError("Erro ao fazer login. Verifique suas cgreenenciais e tente novamente.")
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
                        <p className="text-zinc-300 text-sm leading-relaxed max-w-xs">Organize suas peladas com estilo e profissionalismo no Futmix.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <span className="flex flex-col items-center gap-2">
                            <Image src="/logo.png" alt="Logo" width={100} height={100} />
                        </span>
                        <p className="text-xs text-white uppercase tracking-widest font-medium">
                            Entre na sua conta
                        </p>
                    </div>

                    <div className="space-y-5">
                        {error && (
                            <Alert variant="destructive" className="rounded-none border-l-2 border-green-600 bg-green-50 p-3 text-green-700 [&>svg]:hidden">
                                <AlertDescription className="text-xs font-medium text-center">{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 rounded-sm border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 uppercase tracking-wider transition-all"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 24 24">
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
                            Google
                        </Button> */}

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-300" />
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                                                        placeholder="Email"
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
                                                        placeholder="Senha"
                                                        className="h-11 w-full rounded-sm border-zinc-300 bg-white px-4 pl-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:border-green-600 transition-colors"
                                                        disabled={loading}
                                                        autoComplete="current-password"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase tracking-wide text-green-600 mt-1" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 rounded-sm bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg mt-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Entrando...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-4 w-4" />
                                            Entrar
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="pt-4 flex flex-col items-center space-y-4">
                            <a
                                href="/forgot-password"
                                className="text-xs text-zinc-200 hover:text-green-700 transition-colors font-medium"
                            >
                                Esqueceu a senha?
                            </a>
                            <button
                                onClick={() => router.push("/register")}
                                className="text-xs text-zinc-300 hover:text-zinc-800 font-medium"
                                disabled={loading}
                            >
                                Não tem uma conta? <span className="text-green-500 font-bold uppercase ml-1">Cadastre-se</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}