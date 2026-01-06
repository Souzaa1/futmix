import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"

interface DialogEditPlayerProps {
    showEditDialog: boolean
    setShowEditDialog: (show: boolean) => void
    editingPlayer: any
    editForm: any
    setEditForm: (form: any) => void
    handleSaveEdit: () => void
}

export default function DialogEditPlayer({ showEditDialog, setShowEditDialog, editingPlayer, editForm, setEditForm, handleSaveEdit }: DialogEditPlayerProps) {
    return (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-border flex flex-col">
                <div className="relative bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-200 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-blue-800/20 px-6 py-8 border-b border-border/50 shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)]" />
                    <DialogHeader className="relative space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative size-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-400 shadow-lg">
                                    <Pencil className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-foreground">
                                    Editar Jogador
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground mt-1">
                                    Atualize as estatísticas do jogador.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>
                {editingPlayer && (
                    <div className="grid gap-4 p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-zinc-500">Rating</Label>
                                <Input
                                    type="number" step="0.1" min="0" max="10"
                                    value={editForm.rating}
                                    onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                                    className="rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-zinc-500">Posição</Label>
                                <Select value={editForm.position} onValueChange={(v) => setEditForm({ ...editForm, position: v })}>
                                    <SelectTrigger className="rounded-sm">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GOLEIRO">Goleiro</SelectItem>
                                        <SelectItem value="ZAGUEIRO">Zagueiro</SelectItem>
                                        <SelectItem value="MEIO">Meio Campo</SelectItem>
                                        <SelectItem value="ATACANTE">Atacante</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-zinc-500">Gols</Label>
                                <Input
                                    type="number" min="0"
                                    value={editForm.goals}
                                    onChange={(e) => setEditForm({ ...editForm, goals: Number(e.target.value) })}
                                    className="rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-zinc-500">Assistências</Label>
                                <Input
                                    type="number" min="0"
                                    value={editForm.assists}
                                    onChange={(e) => setEditForm({ ...editForm, assists: Number(e.target.value) })}
                                    className="rounded-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium text-zinc-700">Ativo na pelada?</Label>
                                <input
                                    type="checkbox"
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium text-zinc-700">Lista de espera?</Label>
                                <input
                                    type="checkbox"
                                    checked={editForm.isWaitingList}
                                    onChange={(e) => setEditForm({ ...editForm, isWaitingList: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter className="px-4 py-4 border-t border-border bg-zinc-200/30">
                    <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-sm">Cancelar</Button>
                    <Button onClick={handleSaveEdit} className="rounded-sm bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}