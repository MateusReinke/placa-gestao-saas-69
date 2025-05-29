// src/components/Orders/OrdersList.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrdersListProps {
  orders: Order[];
  statuses: OrderStatus[];
  setDeleteModal: (modalState: { open: boolean; orderId?: string }) => void;
  // onEdit?: (order: Order) => void; // Adicionar se precisar de edição
  // onViewDetails?: (order: Order) => void; // Adicionar para ver detalhes
}

const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  statuses,
  setDeleteModal,
}) => {
  const getStatusDisplay = (statusId?: string | null) => {
    const status = statuses.find((s) => s.id === statusId);
    if (!status) return <Badge variant="outline">Indefinido</Badge>;

    let badgeStyle: React.CSSProperties = {};
    if (status.color) {
      badgeStyle = { backgroundColor: status.color, color: "white" };
      // Para melhor contraste com cores claras, pode ser necessário ajustar a cor do texto
      // Exemplo: if (isLight(status.color)) badgeStyle.color = 'black';
    }

    return (
      <Badge
        style={badgeStyle}
        className={!status.color ? "text-foreground" : ""}
      >
        {status.name}
      </Badge>
    );
  };

  const formatValue = (value?: number | null) => {
    if (typeof value !== "number") return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Nº Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Veículo (Placa)</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data Criação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhum pedido encontrado.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.order_number || `#${order.id.substring(0, 8)}`}
                </TableCell>
                <TableCell>{order.client?.name || "N/A"}</TableCell>
                <TableCell>{order.serviceType?.name || "N/A"}</TableCell>
                <TableCell>{order.vehicle?.license_plate || "N/A"}</TableCell>
                <TableCell>{formatValue(order.value)}</TableCell>
                <TableCell>
                  {order.created_at
                    ? format(new Date(order.created_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "N/A"}
                </TableCell>
                <TableCell>{getStatusDisplay(order.status_id)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          alert(`Implementar: Detalhes do pedido ${order.id}`)
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          alert(`Implementar: Editar pedido ${order.id}`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() =>
                          setDeleteModal({ open: true, orderId: order.id })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersList;
