import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, PlusCircle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewOrderForm from "@/components/forms/NewOrderForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  id: string;
  order_number: string;
  service: string;
  modelo: string;
  placa: string;
  created_at: string;
  valor: number;
  status: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
    case "pendente":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        >
          Pendente
        </Badge>
      );
    case "in-progress":
    case "em andamento":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 hover:bg-amber-200"
        >
          Em Andamento
        </Badge>
      );
    case "completed":
    case "concluido":
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-200"
        >
          Concluído
        </Badge>
      );
    case "cancelled":
    case "cancelado":
      return (
        <Badge
          variant="secondary"
          className="bg-red-100 text-red-800 hover:bg-red-200"
        >
          Cancelado
        </Badge>
      );
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

const ClientOrders = () => {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Buscar client_id
  useEffect(() => {
    if (!user) return;
    supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setClientId(data.id);
      });
  }, [user]);

  // Buscar pedidos
  useEffect(() => {
    if (!clientId) return;
    supabase
      .from("orders")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOrders(data);
      });
  }, [clientId]);

  // Filtros
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    let matchesSearch = true;
    let matchesStatus = true;

    if (searchQuery) {
      matchesSearch =
        order.order_number?.toLowerCase().includes(query) ||
        order.service?.toLowerCase().includes(query) ||
        order.modelo?.toLowerCase().includes(query) ||
        order.placa?.toLowerCase().includes(query);
    }

    if (statusFilter !== "all") {
      matchesStatus = order.status === statusFilter;
    }

    if (filterType === "service") {
      return matchesStatus && order.service?.toLowerCase().includes(query);
    } else if (filterType === "vehicle") {
      return (
        matchesStatus &&
        (order.modelo?.toLowerCase().includes(query) ||
          order.placa?.toLowerCase().includes(query))
      );
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Novo Pedido</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Pedido</DialogTitle>
              </DialogHeader>
              <NewOrderForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por serviço, modelo, placa..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filtrar por</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tipo</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilterType("all")}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("service")}>
                  Serviço
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("vehicle")}>
                  Veículo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Todos Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pendente")}>
                  Pendente
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("em andamento")}
                >
                  Em Andamento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("concluido")}>
                  Concluído
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("cancelado")}>
                  Cancelado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Nº Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 font-medium">
                      {order.order_number ?? order.id}
                    </td>
                    <td className="px-6 py-4">{order.service}</td>
                    <td className="px-6 py-4">
                      {order.modelo} - {order.placa}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(order.valor)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <Button variant="outline" size="sm">
                        Detalhes
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
      </div>
    </AppLayout>
  );
};

export default ClientOrders;
