import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ClipboardPaste, Clock, Loader2, Save, UserPlusIcon } from "lucide-react"
import { Textarea } from "./ui/textarea"

interface DialogAddPlayerProps {
    showImportDialog: boolean
    setShowImportDialog: (show: boolean) => void
    importText: string
    setImportText: (text: string) => void
    parsedPlayers: { name: string, position: string | null, rating: number, isWaitingList: boolean }[]
    setParsedPlayers: (players: { name: string, position: string | null, rating: number, isWaitingList: boolean }[]) => void
    isImporting: boolean
    handleImportPlayers: () => void
}

export default function DialogAddPlayer({ showImportDialog, setShowImportDialog, importText, setImportText, parsedPlayers, setParsedPlayers, isImporting, handleImportPlayers }: DialogAddPlayerProps) {
    return (
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent className="max-w-[90vw] md:max-w-[800px] p-0 gap-0 overflow-hidden border-border flex flex-col">
                <div className="relative bg-gradient-to-br from-emerald-200 via-sky-100 to-emerald-200 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-emerald-800/20 px-6 py-8 border-b border-border/50 shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.1),transparent_50%)]" />
                    <DialogHeader className="relative space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative size-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-400 shadow-lg">
                                    <UserPlusIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-foreground">
                                    Importar Jogadores
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground mt-1">
                                    Cole a lista de presença abaixo para importar os jogadores automaticamente.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-zinc-500">Cole a mensagem aqui</Label>
                        <Textarea
                            placeholder="PELADA ARENA..."
                            className="h-[500px] resize-none rounded-sm font-mono text-xs"
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase text-zinc-500">Pré-visualização ({parsedPlayers.length})</Label>
                        </div>
                        <div className="h-[500px] border border-zinc-200 rounded-sm bg-zinc-50 p-2 overflow-y-auto space-y-2">
                            {parsedPlayers.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center p-4">
                                    <ClipboardPaste className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-xs">Nenhum jogador detectado.</p>
                                    <p className="text-[10px] mt-1">Cole uma lista com sessões "GOLEIROS" e "LINHA".</p>
                                </div>
                            ) : (
                                parsedPlayers.map((player: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-sm border border-zinc-100 space-y-2">
                                        <div className="flex flex-col items-start justify-start gap-1">
                                            <span className="font-medium text-zinc-700 text-xs truncate flex-1">{player.name}</span>
                                            {player.isWaitingList && (
                                                <Badge variant="outline" className="rounded-none text-[9px] uppercase font-bold border-orange-200 text-orange-700 bg-orange-50">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Espera
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-500">Rating</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={player.rating}
                                                    onChange={(e) => {
                                                        const updated = [...parsedPlayers]
                                                        updated[idx].rating = Number(e.target.value)
                                                        setParsedPlayers(updated)
                                                    }}
                                                    className="text-xs rounded-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-500">Posição</Label>
                                                <Select
                                                    value={player.position || ""}
                                                    onValueChange={(value) => {
                                                        const updated = [...parsedPlayers]
                                                        updated[idx].position = value || null
                                                        setParsedPlayers(updated)
                                                    }}
                                                    disabled={player.position === 'GOLEIRO'}
                                                >
                                                    <SelectTrigger className="text-xs rounded-sm max-w-[95px]">
                                                        <SelectValue placeholder="Selecione" className="text-xs" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="GOLEIRO" >Goleiro</SelectItem>
                                                        <SelectItem value="ZAGUEIRO">Zagueiro</SelectItem>
                                                        <SelectItem value="MEIO">Meio Campo</SelectItem>
                                                        <SelectItem value="ATACANTE">Atacante</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {parsedPlayers.length > 0 && (
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-emerald-600 font-medium">
                                    {parsedPlayers.filter((p: any) => p.position === 'GOLEIRO').length} Goleiros, {parsedPlayers.filter((p: any) => p.position !== 'GOLEIRO' && !p.isWaitingList).length} Linha
                                </span>
                                {parsedPlayers.filter((p: any) => p.isWaitingList).length > 0 && (
                                    <span className="text-orange-600 font-medium">
                                        {parsedPlayers.filter((p: any) => p.isWaitingList).length} em Espera
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-4 py-4 border-t border-border bg-zinc-200/30">
                    <Button variant="outline" onClick={() => setShowImportDialog(false)} className="rounded-sm">Cancelar</Button>
                    <Button
                        onClick={handleImportPlayers}
                        disabled={parsedPlayers.length === 0 || isImporting}
                        className="rounded-sm bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Importando...
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                Importar {parsedPlayers.length} Jogadores
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}