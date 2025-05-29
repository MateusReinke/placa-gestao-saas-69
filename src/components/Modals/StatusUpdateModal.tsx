import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StatusUpdateModalProps {
  open: boolean;
  note: string;
  setNote: (note: string) => void;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  open,
  note,
  setNote,
  loading,
  onClose,
  onSave,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Mensagem obrigatória para atualizar status</DialogTitle>
      </DialogHeader>
      <Input
        placeholder="Descreva a razão da mudança de status..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        required
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={loading || !note.trim()} onClick={onSave}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default StatusUpdateModal;
