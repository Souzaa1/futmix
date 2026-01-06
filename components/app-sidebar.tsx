"use client"

import * as React from "react"
import { Trophy, LayoutDashboard, Calendar } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { NavUser } from "./nav-user"
import { useSession } from "@/lib/auth-client"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Peladas",
    url: "/peladas",
    icon: Calendar,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user ? {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || "/placeholder-user.jpg"
  } : null;

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <span className="flex items-center gap-2 border border-emerald-600 rounded-md">
                  <Image src="/logo.png" alt="Futmix" width={40} height={40} />
                </span>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Futmix</span>
                  <span className="text-xs text-muted-foreground">Gerencie suas peladas</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {navigationItems.map((item: any) => {
              const isActive = pathname === item.url || pathname?.startsWith(item.url + "/")
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url} className="font-medium">
                      <Icon className="size-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
