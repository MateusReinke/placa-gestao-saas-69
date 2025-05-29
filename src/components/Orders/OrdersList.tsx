// src/components/Orders/OrdersList.tsx
import React from "react";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types";

interface OrdersListProps {
  orders: Order[];
  statuses: OrderStatus[];
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

const getStatusBadgeClass = (color?: string) => {
  switch (color) {
    case "#3498db":
      return "bg-blue-500 text-white";
    case "#f39c12":
      return "bg-yellow-500 text-white";
    case "#9b59b6":
      return "bg-purple-400 text-white";
    case "#e74c3c":
      return "bg-red-500 text-white";
    case "#2ecc71":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  statuses,
  onEdit,
  onDelete,
}) => (
  <div className="rounded-lg border bg-background mt-6 overflow-x-auto">
    <table className="min-w-full divide-y divide-border">
      <thead>
        <tr className="bg-muted/50">
          <th className="px-6 py-3 text-left text-xs font-semibold">Código</th>
          <th className="px-6 py-3 text-left text-xs font-semibold">Cliente</th>
          <th className="px-6 py-3 text-left text-xs font-semibold">Serviço</th>
          <th className="px-6 py-3 text-left text-xs font-semibold">Placa</th>
          <th className="px-6 py-3 text-left text-xs font-semibold">Status</th>
          <th className="px-6 py-3 text-left text-xs font-semibold">Valor</th>
          <th className="px-6 py-3 text-left text-xs font-semibold">Data</th>
          <th className="px-6 py-3 text-left text-xs font-semibold">Ações</th>
        </tr>
      </thead>
      <tbody className="bg-card divide-y divide-border">
        {orders.length > 0 ? (
          orders.map((order) => (
            <tr key={order.id} className="hover:bg-muted/40">
              <td className="px-6 py-4 font-bold">{order.order_number}</td>
              <td className="px-6 py-4 font-semibold">{order.client?.name}</td>
              <td className="px-6 py-4">{order.serviceType?.name}</td>
              <td className="px-6 py-4 tracking-widest font-mono text-base">
                {order.vehicle?.license_plate ?? "-"}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(
                    order.status?.color
                  )}`}
                >
                  {order.status?.name}
                </span>
              </td>
              <td className="px-6 py-4 font-semibold text-primary">
                {order.value
                  ? order.value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "-"}
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1 text-xs">
                  <Calendar className="h-4 w-4 opacity-60" />
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString("pt-BR")
                    : "-"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(order)}
                    className="hover:bg-blue-100 hover:text-blue-700 transition"
                    aria-label="Editar"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(order)}
                    className="hover:bg-red-100 hover:text-red-700 transition"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={8}
              className="px-6 py-8 text-center text-muted-foreground"
            >
              Nenhum pedido cadastrado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default OrdersList;
