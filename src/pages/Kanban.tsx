import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useAuth } from "@/contexts/AuthContext";
import { ApiService } from "@/services/serviceTypesApi";
import { Order, OrderStatus } from "@/types";
import AppLayout from "@/components/layouts/AppLayout";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Clock, Loader2 } from "lucide-react";
import "@/styles/kanban.css";

const Kanban = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [fetchedOrders, fetchedStatuses] = await Promise.all([
          ApiService.getOrders(user.id, user.role),
          ApiService.getOrderStatuses(),
        ]);

        setOrders(fetchedOrders);
        setStatuses(fetchedStatuses.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a valid dropzone
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Get the order that was dragged
    const orderId = draggableId;

    // Get the new status id from the destination droppable id
    const newStatusId = destination.droppableId;

    try {
      // Update the order with the new status
      const updatedOrder = await ApiService.updateOrder(orderId, {
        statusId: newStatusId,
      });

      if (updatedOrder) {
        // Update the local state
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? updatedOrder : order))
        );

        toast.success("Status do pedido atualizado");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Erro ao atualizar status do pedido");
    }
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Helper to show time since creation
  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  // Helper to determine status CSS class
  const getStatusClass = (statusName?: string) => {
    if (!statusName) return "";

    const statusMap: Record<string, string> = {
      Novo: "status-new",
      "Em Andamento": "status-processing",
      Pendente: "status-pending",
      Concluído: "status-completed",
      Cancelado: "status-cancelled",
    };

    return statusMap[statusName] || "";
  };

  // Helper to determine badge style
  const getStatusBadgeClass = (statusName?: string) => {
    if (!statusName) return "";

    const statusMap: Record<string, string> = {
      Novo: "status-badge-new",
      "Em Andamento": "status-badge-processing",
      Pendente: "status-badge-pending",
      Concluído: "status-badge-completed",
      Cancelado: "status-badge-cancelled",
    };

    return statusMap[statusName] || "";
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Carregando quadro Kanban...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kanban de Pedidos
          </h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos arrastando-os entre as colunas.
          </p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 pb-8 overflow-x-auto">
            {statuses.map((status) => (
              <div key={status.id} className="flex-shrink-0">
                <div
                  className="kanban-column"
                  style={{
                    borderTop: `3px solid ${status.color}`,
                  }}
                >
                  <div className="flex items-center justify-between p-2 mb-2">
                    <h3 className="font-medium">{status.name}</h3>
                    <Badge variant="outline" className="ml-2">
                      {
                        orders.filter((order) => order.statusId === status.id)
                          .length
                      }
                    </Badge>
                  </div>

                  <Droppable droppableId={status.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 overflow-y-auto"
                      >
                        {orders
                          .filter((order) => order.statusId === status.id)
                          .map((order, index) => (
                            <Draggable
                              key={order.id}
                              draggableId={order.id}
                              index={index}
                            >
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`kanban-card ${getStatusClass(
                                    status.name
                                  )}`}
                                >
                                  <CardHeader className="p-3 pb-1">
                                    <div className="flex items-center justify-between">
                                      <Badge
                                        variant="outline"
                                        className={`text-xs font-normal ${getStatusBadgeClass(
                                          status.name
                                        )}`}
                                      >
                                        {order.serviceType?.name}
                                      </Badge>
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: status.color,
                                        }}
                                      />
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-3 pt-1">
                                    <h4 className="font-medium truncate">
                                      {order.client?.name}
                                    </h4>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      Placa:{" "}
                                      <span className="font-medium">
                                        {order.licensePlate}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Valor:{" "}
                                      <span className="font-medium">
                                        {formatCurrency(order.value)}
                                      </span>
                                    </div>
                                  </CardContent>
                                  <CardFooter className="p-3 pt-0">
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{getTimeAgo(order.createdAt)}</span>
                                    </div>
                                    {status.name === "Concluído" && (
                                      <div className="ml-auto flex items-center text-emerald-500">
                                        <Check className="h-4 w-4 mr-1" />
                                        <span className="text-xs">
                                          Concluído
                                        </span>
                                      </div>
                                    )}
                                  </CardFooter>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}

                        {orders.filter((order) => order.statusId === status.id)
                          .length === 0 && (
                          <div className="flex items-center justify-center h-24 bg-secondary/50 rounded-md">
                            <p className="text-sm text-muted-foreground">
                              Nenhum pedido
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </AppLayout>
  );
};

export default Kanban;
