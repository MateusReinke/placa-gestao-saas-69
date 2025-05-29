// src/components/Orders/KanbanCard.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Order } from "@/types";
import { Trash2 } from "lucide-react";

interface KanbanCardProps {
  order: Order;
  onDelete: (id: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ order, onDelete }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="mb-3 cursor-grab select-none rounded-lg border bg-card p-3 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="font-bold">{order.order_number}</span>
        <button
          onClick={() => onDelete(order.id)}
          className="text-destructive hover:text-destructive/80"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Cliente: <strong>{order.client?.name ?? "-"}</strong>
      </p>
      <p className="text-xs text-muted-foreground">
        Serviço: <strong>{order.serviceType?.name ?? "-"}</strong>
      </p>
      <p className="text-xs text-muted-foreground">
        Veículo: <strong>{order.vehicle?.placa ?? "-"}</strong>
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-semibold">
          {order.value?.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <span className="text-xs">
          {order.created_at
            ? new Date(order.created_at).toLocaleDateString("pt-BR")
            : "-"}
        </span>
      </div>
    </div>
  );
};

export default KanbanCard;
