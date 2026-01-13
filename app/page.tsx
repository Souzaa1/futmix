"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, Trophy, Calendar, Users, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans selection:bg-green-500/20">
      <div
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/stadium.jpg")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-950/95 via-zinc-950/90 to-green-950/70" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex w-full items-center justify-between border-b border-white/5 bg-zinc-950/50 px-4 py-3 backdrop-blur-md sm:px-6 md:px-12 md:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src="/logo.png" alt="Futmix" width={30} height={30} className="rounded-md" />
            <span className="text-xl font-bold text-white sm:text-2xl">Futmix</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              asChild
              variant="ghost"
              className="h-8 rounded-none border-b border-transparent px-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400 hover:bg-transparent hover:text-primary sm:h-9 sm:px-4 sm:text-xs"
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              variant="default"
              asChild
              className="h-8 rounded-sm px-3 text-[10px] font-semibold uppercase tracking-wider text-white sm:h-9 sm:px-6 sm:text-xs"
            >
              <Link href="/register">Cadastre-se</Link>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-12">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 sm:gap-16 md:grid-cols-2 lg:gap-24">
            <div className="flex flex-col justify-center space-y-6 sm:space-y-8 md:space-y-10">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex rounded items-center gap-2 border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary sm:px-3 sm:py-1 sm:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Plataforma Oficial
                </div>
                <h1 className="text-4xl font-black leading-[0.9] tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-8xl">
                  FUTEBOL
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-emerald-950">
                    ORGANIZADO
                  </span>
                </h1>
                <p className="max-w-md text-xs font-medium leading-relaxed text-zinc-500 sm:text-sm">
                  Gerenciamento profissional de peladas. Controle de estatísticas, sorteio de times e organização de jogadores em uma interface de alta densidade.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  variant="default"
                  asChild
                  className="h-11 w-full rounded-sm px-6 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white sm:h-12 sm:w-auto sm:px-8 sm:text-xs"
                >
                  <Link href="/register">
                    Começar
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full rounded-sm border-zinc-800 bg-transparent px-6 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-transparent hover:text-white sm:h-12 sm:w-auto sm:px-8 sm:text-xs"
                >
                  <Link href="/login">
                    Acessar Conta
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col gap-3 border border-white/5 bg-zinc-900/20 p-4 backdrop-blur-sm rounded-sm sm:gap-4 sm:p-6">
                <Calendar className="h-4 w-4 text-zinc-500 sm:h-5 sm:w-5" />
                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white sm:text-xs">Agenda</h3>
                  <p className="text-[9px] font-medium leading-relaxed text-zinc-500 sm:text-[10px]">
                    Cronograma completo e histórico de partidas.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border border-white/5 bg-zinc-900/20 p-4 backdrop-blur-sm rounded-sm sm:gap-4 sm:p-6">
                <Users className="h-4 w-4 text-zinc-500 sm:h-5 sm:w-5" />
                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white sm:text-xs">Elenco</h3>
                  <p className="text-[9px] font-medium leading-relaxed text-zinc-500 sm:text-[10px]">
                    Gestão detalhada de jogadores e posições.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border border-white/5 bg-zinc-900/20 p-4 backdrop-blur-sm rounded-sm sm:gap-4 sm:p-6">
                <Trophy className="h-4 w-4 text-zinc-500 sm:h-5 sm:w-5" />
                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white sm:text-xs">Sorteio</h3>
                  <p className="text-[9px] font-medium leading-relaxed text-zinc-500 sm:text-[10px]">
                    Algoritmo de balanceamento de times.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border border-white/5 bg-zinc-900/20 p-4 backdrop-blur-sm rounded-sm sm:gap-4 sm:p-6">
                <BarChart3 className="h-4 w-4 text-zinc-500 sm:h-5 sm:w-5" />
                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white sm:text-xs">Dados</h3>
                  <p className="text-[9px] font-medium leading-relaxed text-zinc-500 sm:text-[10px]">
                    Métricas de performance individual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/5 py-6 text-center sm:py-8">
          <p className="text-[9px] font-medium uppercase tracking-widest text-zinc-600 sm:text-[10px]">
            Futmix © 2025 - Sistema de Gestão Esportiva
          </p>
        </footer>
      </div>
    </div>
  )
}
