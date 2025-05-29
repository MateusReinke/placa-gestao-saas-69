import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  text?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
  text,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirmação</DialogTitle>
      </DialogHeader>
      <div className="mb-4">
        {text ?? "Tem certeza que deseja remover este pedido?"}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="destructive"
          disabled={loading}
          type="button"
        >
          {loading ? "Removendo..." : "Remover"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default ConfirmDeleteModal;
