import React, { useMemo } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";

import KanbanColumn from "./KanbanColumn";
import { Order, OrderStatus } from "@/types";

interface OrdersKanbanProps {
  /** lista já filtrada que deve aparecer no quadro */
  orders: Order[];
  /** status (colunas) vindos do banco, já ordenados  */
  statuses: OrderStatus[];
  /** devolve classes Tailwind de acordo com a cor do status  */
  badge: (color: string) => string;

  /** altera o status no back-end + state local                                        */
  onMove: (orderId: string, toStatusId: string, note?: string) => void;
  /** solicita remoção (abre modal ou deleta de vez – depende do pai)                 */
  onDelete: (orderId: string) => void;
}

const OrdersKanban: React.FC<OrdersKanbanProps> = ({
  orders,
  statuses,
  badge,
  onMove,
  onDelete,
}) => {
  /* --------------------------- agrupa orders por status -------------------------- */
  const columns = useMemo<Record<string, Order[]>>(() => {
    const map: Record<string, Order[]> = {};
    statuses.forEach((s) => (map[s.id] = []));
    orders.forEach((o) => {
      if (!map[o.status_id]) map[o.status_id] = [];
      map[o.status_id].push(o);
    });
    return map;
  }, [orders, statuses]);

  /* ------------------------------- Drag handler --------------------------------- */
  const handleDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over) return; // drop fora de colunas
    const orderId = String(active.id);
    const toStatusId = String(over.id); // id da coluna alvo

    const ord = orders.find((o) => o.id === orderId);
    if (ord && ord.status_id !== toStatusId) {
      onMove(orderId, toStatusId); // 🔥 dispara update
    }
  };

  /* --------------------------------- render ------------------------------------- */
  return (
    <div className="mt-6 pb-6 min-h-[350px] w-full">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex w-full gap-4">
          {statuses.map((st) => (
            <KanbanColumn
              key={st.id}
              status={st}
              orders={columns[st.id] ?? []}
              badge={badge}
              onDelete={onDelete}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default OrdersKanban;
