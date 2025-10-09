"use client"

import { useState } from "react";
import Image from "next/image";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LockIcon, LogInIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
            setError("Erro ao fazer login. Verifique suas credenciais e tente novamente.")
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full bg-[linear-gradient(to_right,rgba(0,0,0,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.2)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            </div>

            <svg
                id="noice"
                className="absolute inset-0 z-10 h-full w-full opacity-30"
            >
                <filter id="noise-filter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="1.34"
                        numOctaves="4"
                        stitchTiles="stitch"
                    ></feTurbulence>
                    <feColorMatrix type="saturate" values="0"></feColorMatrix>
                    <feComponentTransfer>
                        <feFuncR type="linear" slope="0.46"></feFuncR>
                        <feFuncG type="linear" slope="0.46"></feFuncG>
                        <feFuncB type="linear" slope="0.47"></feFuncB>
                        <feFuncA type="linear" slope="0.37"></feFuncA>
                    </feComponentTransfer>
                    <feComponentTransfer>
                        <feFuncR type="linear" slope="1.47" intercept="-0.23" />
                        <feFuncG type="linear" slope="1.47" intercept="-0.23" />
                        <feFuncB type="linear" slope="1.47" intercept="-0.23" />
                    </feComponentTransfer>
                </filter>
                <rect width="100%" height="100%" filter="url(#noise-filter)"></rect>
            </svg>

            <div className="w-1/2 h-screen flex items-center justify-center border-r border-emerald-500 relative overflow-hidden">
                <Image src="/footbol.png" alt="Login" width={500} height={500} className="absolute top-20 left-20 w-10 h-10" />
                <Image src="/ft.svg" alt="Login" width={500} height={500} className="absolute top-32 right-24 w-10 h-10" />
                <Image src="/lm.png" alt="Login" width={500} height={500} className="absolute bottom-20 left-28 w-10 h-10" />
                <Image src="/ln.png" alt="Login" width={500} height={500} className="absolute top-1/4 right-32 w-10 h-10" />
                <Image src="/lç.png" alt="Login" width={500} height={500} className="absolute bottom-24 right-20 w-10 h-10" />
                <Image src="/lv.png" alt="Login" width={500} height={500} className="absolute top-96 left-20 w-10 h-10" />

                <div className="z-10">
                    <Image src="/login.png" alt="Login" width={500} height={500} />
                </div>
            </div>

            <div className="w-1/2 h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 flex items-center justify-center">

                <Card className="flex w-full max-w-md z-50">
                    <CardHeader>
                        <div className="flex items-center justify-center">
                            <Image src="/FFC.png" alt="Login" width={100} height={100} quality={100} />
                            <div className="flex flex-col">
                                <CardTitle>FUTMIX FUTEBOL CLUBE</CardTitle>
                                <CardDescription>Faça login para continuar</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="z-50 w-full">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 w-full z-50">

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="seu@email.com"
                                                        className="w-full pl-7"
                                                        disabled={loading}
                                                    />
                                                    <MailIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                                                </div>
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
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        placeholder="Mínimo 8 caracteres"
                                                        className="w-full pl-7"
                                                        disabled={loading}
                                                    />
                                                    <LockIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Entrando...
                                        </>
                                    ) : (
                                        <>
                                            <LogInIcon className="w-4 h-4" />
                                            Entrar
                                        </>
                                    )}
                                </Button>

                                {error && (
                                    <Alert variant="destructive" className="mb-6">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex flex-col gap-2 w-full items-center">
                                    <div className="text-xs text-gray-500">
                                        Termos de Uso e Política de Privacidade
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Não tem uma conta?
                                        <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                                            Crie uma conta
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}