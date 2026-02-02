import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
            <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-[95vw] md:max-w-[800px] h-[68dvh] sm:h-[80vh] max-h-[800px] p-0 gap-0 overflow-hidden border-border flex flex-col">
                <div className="relative bg-gradient-to-br from-emerald-200 via-green-100 to-emerald-200 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-emerald-800/20 px-6 py-8 border-b border-border/50 shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.1),transparent_50%)]" />
                    <DialogHeader className="relative space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative size-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-400 shadow-lg">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <SelectTrigger className="rounded-sm w-full">
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
                                <Label htmlFor="isActive" className="text-sm font-medium text-zinc-700 cursor-pointer">
                                    Ativo na pelada?
                                </Label>
                                <Checkbox
                                    id="isActive"
                                    checked={editForm.isActive}
                                    onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked === true })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="isWaitingList" className="text-sm font-medium text-zinc-700 cursor-pointer">
                                    Lista de espera?
                                </Label>
                                <Checkbox
                                    id="isWaitingList"
                                    checked={editForm.isWaitingList}
                                    onCheckedChange={(checked) => setEditForm({ ...editForm, isWaitingList: checked === true })}
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