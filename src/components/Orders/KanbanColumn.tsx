import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Order, OrderStatus } from "@/types";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
  status: OrderStatus;
  orders: Order[];
  badge: (color: string) => string;
  onDelete: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  orders,
  badge,
  onDelete,
}) => {
  const { setNodeRef } = useDroppable({
    id: status.id,
  });

  return (
    <div className="flex-1 min-w-[260px] max-w-sm bg-background rounded-lg border border-border flex flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${badge(
            status.color
          )}`}
        >
          {status.name}
        </span>
        <span className="text-xs bg-muted/30 px-2 py-1 rounded-full text-muted-foreground">
          {orders.length}
        </span>
      </div>

      <div ref={setNodeRef} className="p-2 flex-grow min-h-[100px]">
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.map((order) => (
            <KanbanCard key={order.id} order={order} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
