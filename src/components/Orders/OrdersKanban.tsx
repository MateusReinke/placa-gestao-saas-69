// src/components/Orders/OrdersKanban.tsx
import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Trash2,
  Edit,
  DollarSign,
  CalendarDays,
  User,
  FileText,
  Car,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "@/styles/kanban.css"; // Importando os estilos Kanban

interface OrdersKanbanProps {
  orders: Order[];
  statuses: OrderStatus[];
  badge: (colorValue?: string) => string; // Função para obter classe de cor do badge
  onMove: (orderId: string, toStatusId: string, note?: string) => Promise<void>;
  onDelete: (orderId: string) => void;
  // onEdit?: (order: Order) => void; // Opcional para edição
}

const OrdersKanban: React.FC<OrdersKanbanProps> = ({
  orders,
  statuses,
  badge,
  onMove,
  onDelete,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    onMove(draggableId, destination.droppableId);
  };

  const formatValue = (value?: number) => {
    if (typeof value !== "number") return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {statuses.map((status) => (
          <Droppable droppableId={status.id} key={status.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="kanban-column flex-shrink-0" // Estilo definido em kanban.css
                style={{ borderTop: `4px solid ${status.color || "#ccc"}` }}
              >
                <div className="p-2 sticky top-0 bg-card z-10 border-b">
                  <h3 className="font-semibold text-sm flex items-center justify-between">
                    <span>{status.name}</span>
                    <Badge variant="secondary">
                      {
                        orders.filter((order) => order.status_id === status.id)
                          .length
                      }
                    </Badge>
                  </h3>
                </div>
                <div
                  className={`p-2 space-y-3 overflow-y-auto flex-grow ${
                    snapshot.isDraggingOver ? "bg-muted/50" : ""
                  }`}
                >
                  {orders
                    .filter((order) => order.status_id === status.id)
                    .map((order, index) => (
                      <Draggable
                        key={order.id}
                        draggableId={order.id}
                        index={index}
                      >
                        {(providedCard) => (
                          <Card
                            ref={providedCard.innerRef}
                            {...providedCard.draggableProps}
                            {...providedCard.dragHandleProps}
                            className="kanban-card" // Estilo definido em kanban.css
                          >
                            <CardHeader className="p-3 pb-1">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-sm font-semibold leading-tight truncate">
                                  {order.order_number ||
                                    `#${order.id.substring(0, 5)}`}
                                </CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 -mr-2 -mt-1"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        alert(`Editar ${order.id}`)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => onDelete(order.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />{" "}
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                                <FileText className="h-3 w-3" />{" "}
                                {order.serviceType?.name ||
                                  "Serviço não definido"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 pt-1 space-y-1">
                              <div className="text-xs flex items-center gap-1 text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span className="font-medium text-foreground truncate">
                                  {order.client?.name || "Cliente não definido"}
                                </span>
                              </div>
                              <div className="text-xs flex items-center gap-1 text-muted-foreground">
                                <Car className="h-3 w-3" />
                                <span className="font-medium text-foreground">
                                  {order.vehicle?.placa ||
                                    order.license_plate ||
                                    "Placa não definida"}
                                </span>
                              </div>
                              <div className="text-xs flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span className="font-medium text-foreground">
                                  {formatValue(order.value)}
                                </span>
                              </div>
                            </CardContent>
                            <CardFooter className="p-3 pt-2 text-xs text-muted-foreground flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {order.created_at
                                  ? format(
                                      new Date(order.created_at),
                                      "dd/MM/yy",
                                      { locale: ptBR }
                                    )
                                  : "N/A"}
                              </div>
                              <Badge
                                className={`${badge(status.color)} text-xs`}
                              >
                                {status.name}
                              </Badge>
                            </CardFooter>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  {orders.filter((order) => order.status_id === status.id)
                    .length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-4">
                      Nenhum pedido neste status.
                    </div>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default OrdersKanban;
