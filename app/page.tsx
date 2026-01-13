"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, Trophy, Calendar, Users, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden relative bg-zinc-900">
      <div
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/stadium.jpg")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-950/95 via-zinc-950/90 to-green-950/70" />

      <div className="relative z-10 h-full w-full flex flex-col">
        <header className="w-full p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Futmix" width={50} height={50} className="rounded-md" />
            <span className="text-2xl font-bold text-white">Futmix</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              className="text-white hover:text-green-500 hover:bg-white/10"
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white"
            >
              <Link href="/register">Cadastre-se</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 md:px-12">
          <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="w-16 h-1 bg-green-600 mx-auto md:mx-0" />
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
                  O futebol
                  <br />
                  <span className="text-green-500">organizado.</span>
                </h1>
                <p className="text-xl text-zinc-300 leading-relaxed max-w-lg mx-auto md:mx-0">
                  Organize suas peladas com estilo e profissionalismo. Gerencie jogadores,
                  sorteie times e acompanhe estatísticas de forma simples e eficiente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white text-base px-8 py-6 h-auto"
                >
                  <Link href="/register" className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Começar agora
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-zinc-300 text-white hover:bg-white/10 hover:text-green-500 text-base px-8 py-6 h-auto"
                >
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Fazer login
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 space-y-3 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-white font-semibold text-lg">Peladas</h3>
                <p className="text-zinc-300 text-sm">
                  Crie e gerencie suas peladas de forma organizada
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 space-y-3 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-white font-semibold text-lg">Jogadores</h3>
                <p className="text-zinc-300 text-sm">
                  Convide e gerencie seus jogadores facilmente
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 space-y-3 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-white font-semibold text-lg">Sorteios</h3>
                <p className="text-zinc-300 text-sm">
                  Sorteie times equilibrados automaticamente
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 space-y-3 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-white font-semibold text-lg">Estatísticas</h3>
                <p className="text-zinc-300 text-sm">
                  Acompanhe o desempenho dos jogadores
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full p-6 border-t border-white/10">
          <p className="text-center text-zinc-400 text-sm">
            © 2025 Futmix. Organize suas peladas com profissionalismo.
          </p>
        </footer>
      </div>
    </div>
  )
}
