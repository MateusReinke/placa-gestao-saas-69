import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewOrderForm from "@/components/forms/NewOrderForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (order?: any) => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button className="flex gap-2">
        <PlusCircle className="h-4 w-4" />
        <span>Novo Pedido</span>
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[650px]">
      <DialogHeader>
        <DialogTitle>Adicionar Novo Pedido</DialogTitle>
      </DialogHeader>
      <NewOrderForm onSuccess={onSuccess} />
    </DialogContent>
  </Dialog>
);

export default NewOrderModal;
