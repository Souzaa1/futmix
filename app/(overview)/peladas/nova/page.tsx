"use client"

import { useState } from "react"
import { useRole } from "@/hooks/use-role"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Dribbble, Loader2 } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    type: z.enum(["UNICA", "RECORRENTE"]),
    date: z.string().min(1, "Selecione uma data e hora"),
})

export default function NovaPeladaPage() {
    const { canCreatePelada, isPending } = useRole()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "UNICA",
            date: "",
        },
    })

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!canCreatePelada()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                <Card className="w-full max-w-md text-center p-8 border border-zinc-200 shadow-sm rounded-sm">
                    <h1 className="text-xl font-bold text-zinc-900 mb-2">Acesso Restrito</h1>
                    <p className="text-zinc-500 text-sm mb-6">
                        Você não tem permissão para criar novas peladas.
                    </p>
                    <Button variant="outline" onClick={() => router.back()} className="w-full rounded-sm">
                        Voltar
                    </Button>
                </Card>
            </div>
        )
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)
        try {
            const response = await fetch("/api/peladas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) throw new Error("Erro ao criar pelada")

            router.push("/peladas")
            router.refresh()
        } catch (error) {
            console.error("Erro:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-full bg-zinc-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link
                        href="/peladas"
                        className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        Voltar para lista
                    </Link>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Nova Pelada</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Preencha as informações para organizar um novo jogo.
                    </p>
                </div>

                <div className="bg-white border border-zinc-200 shadow-sm rounded-sm overflow-hidden">
                    <div className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                                Nome da Pelada
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Futebol de Quarta"
                                                    {...field}
                                                    className="h-10 rounded-sm border-zinc-200 focus-visible:ring-emerald-600"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-1">
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                                    Tipo
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-sm border-zinc-200 focus:ring-emerald-600 w-full">
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="UNICA">Única</SelectItem>
                                                        <SelectItem value="RECORRENTE">Recorrente</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-[10px] text-zinc-400">
                                                    {field.value === "UNICA" ? "Acontece apenas uma vez." : "Repete semanalmente."}
                                                </FormDescription>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                                    Data e Hora
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="datetime-local"
                                                        {...field}
                                                        className="rounded-sm border-zinc-200 focus-visible:ring-emerald-600 block accent-emerald-600"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-[10px] text-zinc-400">
                                                    Selecione a data e hora da pelada.
                                                </FormDescription>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="h-10 rounded-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-10 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium min-w-[120px] group"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Dribbble className="w-4 h-4 group-hover:translate-x-1 transition ease-in-out group-hover:rotate-45" />
                                                Criar Pelada
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
