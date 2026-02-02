"use client"

import { useRef, useState } from "react"
import {
    BadgeCheck,
    Bell,
    Camera,
    ChevronsUpDown,
    CreditCard,
    Loader2,
    LogOut,
    Sparkles,
    Trash2,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { signOut, updateUser } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

function getInitials(name: string, email: string) {
    if (name?.trim()) {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
    }
    return email?.slice(0, 2).toUpperCase() || "?"
}

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar?: string | null
    }
}) {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleLogout = async () => {
        await signOut()
        router.push("/login")
    }

    const handleAvatarClick = () => {
        setAvatarDialogOpen(true)
        if (preview) URL.revokeObjectURL(preview)
        setPreview(null)
        setSelectedFile(null)
        setError(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validTypes = ["image/jpeg", "image/png", "image/webp"]
        if (!validTypes.includes(file.type)) {
            setError("Use JPG, PNG ou WebP")
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("Máximo 2MB")
            return
        }

        setError(null)
        if (preview) URL.revokeObjectURL(preview)
        setSelectedFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("avatar", selectedFile)

            const res = await fetch("/api/users/avatar", {
                method: "POST",
                body: formData,
                credentials: "include",
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Erro ao enviar foto")
            }

            await updateUser({ image: data.url })
            setAvatarDialogOpen(false)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao enviar foto")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        setLoading(true)
        setError(null)

        try {
            await updateUser({ image: "" })
            setAvatarDialogOpen(false)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao remover foto")
        } finally {
            setLoading(false)
        }
    }

    const initials = getInitials(user.name, user.email || "")

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleAvatarClick} className="cursor-pointer">
                                <Camera />
                                Alterar foto de perfil
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Dialog
                    open={avatarDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            if (preview) URL.revokeObjectURL(preview)
                            setPreview(null)
                            setSelectedFile(null)
                            setError(null)
                        }
                        setAvatarDialogOpen(open)
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Foto de perfil</DialogTitle>
                            <DialogDescription>
                                Envie uma imagem JPG, PNG ou WebP (máx. 2MB)
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 rounded-full">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                                <AvatarFallback className="rounded-full text-2xl">
                                                    {initials}
                                                </AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={loading}
                                    >
                                        Escolher arquivo
                                    </Button>
                                    {user.avatar && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveAvatar}
                                            disabled={loading}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="size-4" />
                                            Remover
                                        </Button>
                                    )}
                                </div>

                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setAvatarDialogOpen(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
