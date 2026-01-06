import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

interface DialogSendInviteProps {
    showInviteDialog: boolean
    setShowInviteDialog: (show: boolean) => void
    newPlayerEmail: string
    setNewPlayerEmail: (email: string) => void
    handleSendInvite: () => void
}

export default function DialogSendInvite({ showInviteDialog, setShowInviteDialog, newPlayerEmail, setNewPlayerEmail, handleSendInvite }: DialogSendInviteProps) {
    return (
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden border-border flex flex-col">
                <div className="relative bg-gradient-to-br from-cyan-200 via-blue-100 to-cyan-200 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-cyan-800/20 px-6 py-8 border-b border-border/50 shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_50%)]" />
                    <DialogHeader className="relative space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500/20 dark:bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative size-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-600 dark:to-blue-400 shadow-lg">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-foreground">
                                    Convidar Jogador
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground mt-1">
                                    Envie um convite por e-mail para este jogador.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>
                <div className="p-6">
                    <Label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">E-mail</Label>
                    <Input
                        placeholder="email@exemplo.com"
                        value={newPlayerEmail}
                        onChange={(e) => setNewPlayerEmail(e.target.value)}
                        className="rounded-sm"
                    />
                </div>
                <DialogFooter className="px-4 py-4 border-t border-border bg-zinc-200/30">
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="rounded-sm">Cancelar</Button>
                    <Button onClick={handleSendInvite} className="rounded-sm bg-blue-600 hover:bg-blue-700">Enviar Convite</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}