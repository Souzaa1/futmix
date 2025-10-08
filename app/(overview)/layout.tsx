"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

const getPageTitle = (pathname: string) => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname.startsWith("/peladas")) return "Peladas"
    if (pathname.startsWith("/invite")) return "Convites"
    return "Futmix"
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "19rem",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-white/50 backdrop-blur-sm">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <h1 className="text-xs italic">
                        {getPageTitle(pathname)}
                    </h1>
                </header>
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
