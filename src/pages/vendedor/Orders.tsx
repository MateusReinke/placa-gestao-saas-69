import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  PlusCircle,
  Search,
  ChevronDown,
  Filter,
  MoreVertical,
  FileText,
  Calendar,
  User,
  Car,
} from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import NewOrderForm from "@/components/forms/NewOrderForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ApiService } from "@/services/serviceTypesApi";
import { Order, OrderStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const SellerOrders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationMode, setOrganizationMode] = useState<"list" | "kanban">(
    "list"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch orders and statuses on initialization
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedOrders, fetchedStatuses] = await Promise.all([
          ApiService.getOrders(user?.id, user?.role),
          ApiService.getOrderStatuses(),
        ]);

        setOrders(fetchedOrders);
        setStatuses(fetchedStatuses.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, user?.id, user?.role]);

  // Handle success after creating new order
  const handleOrderCreationSuccess = (newOrder?: Order) => {
    setIsDialogOpen(false);
    if (newOrder) {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    }
    toast({
      title: "Sucesso",
      description: "Pedido criado com sucesso",
    });
  };

  // Filter orders based on search query and filters
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    let matchesSearch = true;
    let matchesStatus = true;

    // Apply search filter
    if (searchQuery) {
      matchesSearch =
        order.id?.toLowerCase().includes(query) ||
        false ||
        order.licensePlate?.toLowerCase().includes(query) ||
        false ||
        order.client?.name.toLowerCase().includes(query) ||
        false ||
        order.serviceType?.name.toLowerCase().includes(query) ||
        false;
    }

    // Apply status filter
    if (statusFilter !== "all" && order.statusId) {
      matchesStatus = order.statusId === statusFilter;
    }

    // Apply type filter
    if (filterType !== "all") {
      if (filterType === "service" && order.serviceType) {
        return (
          matchesStatus && order.serviceType.name.toLowerCase().includes(query)
        );
      } else if (filterType === "client" && order.client) {
        return matchesStatus && order.client.name.toLowerCase().includes(query);
      } else if (filterType === "vehicle" && order.licensePlate) {
        return (
          matchesStatus && order.licensePlate.toLowerCase().includes(query)
        );
      }
    }

    return matchesSearch && matchesStatus;
  });

  // Funções para o modo kanban
  const getOrdersForStatus = (statusId: string) => {
    return filteredOrders.filter((order) => order.statusId === statusId);
  };

  const getStatusColor = (colorName?: string) => {
    if (!colorName) return "bg-gray-500";

    const colorMap: Record<string, string> = {
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      gray: "bg-gray-500",
    };

    return colorMap[colorName.toLowerCase()] || "bg-gray-500";
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there is no valid destination, ignore the drop
    if (!destination) return;

    // If the item is dropped at the same position, ignore
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Find the order that was dragged
    const orderId = draggableId;
    const newStatusId = destination.droppableId;

    // Update state locally for immediate feedback
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              statusId: newStatusId,
              status: statuses.find((s) => s.id === newStatusId),
            }
          : order
      )
    );

    // Send the update to the API
    try {
      await ApiService.updateOrder(orderId, { statusId: newStatusId });
      toast({
        title: "Atualizado",
        description: "Status do pedido atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
      });

      // Revert the local change in case of error
      const originalOrder = orders.find((order) => order.id === orderId);
      if (originalOrder) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? originalOrder : order
          )
        );
      }
    }
  };

  // Renderização condicional baseada no modo
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-primary/30"></div>
            <div className="mt-4 text-muted-foreground">Carregando...</div>
          </div>
        </div>
      );
    }

    if (organizationMode === "kanban") {
      return (
        <div className="mt-6 overflow-x-auto pb-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-4">
              {statuses
                .filter((status) => status.active)
                .map((status) => (
                  <Droppable droppableId={status.id} key={status.id}>
                    {(provided) => (
                      <div
                        className="kanban-column"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div className="p-3 font-medium text-sm flex items-center justify-between bg-muted/50 border-b">
                          <div className="flex items-center">
                            <div
                              className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(
                                status.color
                              )}`}
                            ></div>
                            <span>{status.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getOrdersForStatus(status.id).length}
                          </Badge>
                        </div>
                        <div className="p-2 flex-grow overflow-y-auto">
                          {getOrdersForStatus(status.id).map((order, index) => (
                            <Draggable
                              key={order.id}
                              draggableId={order.id}
                              index={index}
                            >
                              {(provided) => (
                                <Card
                                  className="kanban-card mb-3 hover:shadow-md transition-all"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <CardHeader className="p-3 pb-0">
                                    <div className="flex justify-between items-start">
                                      <div className="font-medium flex items-center gap-1">
                                        <User className="h-3.5 w-3.5" />
                                        <span>
                                          {order.client?.name || "Cliente"}
                                        </span>
                                      </div>
                                      <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                        #{order.id.substring(0, 5)}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-3 pt-1">
                                    <div className="text-sm flex items-center gap-1 mb-1">
                                      <FileText className="h-3.5 w-3.5" />
                                      <span className="text-muted-foreground">
                                        {order.serviceType?.name || "Serviço"}
                                      </span>
                                    </div>
                                    <div className="text-sm flex items-center gap-1 mb-1">
                                      <Car className="h-3.5 w-3.5" />
                                      <span className="font-medium">
                                        {order.licensePlate}
                                      </span>
                                    </div>
                                    {order.value && (
                                      <div className="text-sm font-medium mt-2 bg-primary/10 text-primary rounded-md px-2 py-0.5 inline-block">
                                        {new Intl.NumberFormat("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        }).format(order.value)}
                                      </div>
                                    )}
                                  </CardContent>
                                  <CardFooter className="p-3 pt-0 text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(
                                      order.createdAt
                                    ).toLocaleDateString("pt-BR")}
                                  </CardFooter>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
            </div>
          </DragDropContext>
        </div>
      );
    } else {
      // Vista em lista
      return (
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Nº Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      #{order.id.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.client?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.serviceType?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.licensePlate || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(
                            order.status?.color
                          )}`}
                        ></div>
                        <span
                          className={`
                        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          order.status?.color === "green"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                        ${
                          order.status?.color === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          order.status?.color === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        }
                        ${
                          order.status?.color === "red"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                        ${
                          order.status?.color === "purple"
                            ? "bg-purple-100 text-purple-800"
                            : ""
                        }
                        ${
                          order.status?.color === "gray" || !order.status?.color
                            ? "bg-gray-100 text-gray-800"
                            : ""
                        }
                      `}
                        >
                          {order.status?.name || "Indefinido"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                      <Button variant="outline" size="sm">
                        Atualizar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    {searchQuery || statusFilter !== "all"
                      ? "Nenhum pedido encontrado com esses filtros."
                      : "Nenhum pedido cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Gerenciar Pedidos
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex gap-1"
              onClick={() =>
                setOrganizationMode((prev) =>
                  prev === "kanban" ? "list" : "kanban"
                )
              }
            >
              <span>
                Ver como {organizationMode === "kanban" ? "Lista" : "Kanban"}
              </span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex gap-1">
                  <PlusCircle className="h-4 w-4" />
                  <span>Novo Pedido</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Pedido</DialogTitle>
                </DialogHeader>
                <NewOrderForm onSuccess={handleOrderCreationSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido por cliente, serviço..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                <Filter className="h-4 w-4" />
                <span>Filtrar</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tipo de Busca</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterType("all")}>
                Todos os Campos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("service")}>
                Por Serviço
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("client")}>
                Por Cliente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("vehicle")}>
                Por Veículo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Todos os Status
              </DropdownMenuItem>
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status.id}
                  onClick={() => setStatusFilter(status.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(
                        status.color
                      )}`}
                    ></div>
                    {status.name}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {renderContent()}
      </div>
    </AppLayout>
  );
};

export default SellerOrders;
