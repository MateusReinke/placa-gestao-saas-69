import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface Option {
  id: string;
  name: string;
}

interface OrdersHeaderProps {
  /* dialogs */
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  /* busca */
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  /* filtros */
  clientFilter: string;
  setClientFilter: (v: string) => void;
  serviceFilter: string;
  setServiceFilter: (v: string) => void;
  /* modo */
  organizationMode: "list" | "kanban";
  setOrganizationMode: (m: "list" | "kanban") => void;
  /* opções */
  uniqueClients: Option[];
  uniqueServices: Option[];
  /* callback pós-criação */
  onOrderCreated: () => void;
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  searchQuery,
  setSearchQuery,
  clientFilter,
  setClientFilter,
  serviceFilter,
  setServiceFilter,
  organizationMode,
  setOrganizationMode,
  uniqueClients,
  uniqueServices,
  onOrderCreated,
}) => {
  /* sempre arrays */
  const safeClients = Array.isArray(uniqueClients) ? uniqueClients : [];
  const safeServices = Array.isArray(uniqueServices) ? uniqueServices : [];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* BOTÃO NOVO */}
      <Button onClick={() => setIsDialogOpen(true)}>Novo Pedido</Button>

      {/* BUSCA */}
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar pedidos por número, cliente, veículo..."
          className="pl-10"
        />
      </div>

      {/* FILTROS */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex gap-1">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Cliente</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setClientFilter("all")}>
            Todos os clientes
          </DropdownMenuItem>
          {safeClients.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => setClientFilter(c.id)}>
              {c.name}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Serviço</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setServiceFilter("all")}>
            Todos os serviços
          </DropdownMenuItem>
          {safeServices.map((s) => (
            <DropdownMenuItem key={s.id} onClick={() => setServiceFilter(s.id)}>
              {s.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* MODO LISTA / KANBAN */}
      <Button
        variant={organizationMode === "list" ? "default" : "outline"}
        onClick={() => setOrganizationMode("list")}
      >
        Lista
      </Button>
      <Button
        variant={organizationMode === "kanban" ? "default" : "outline"}
        onClick={() => setOrganizationMode("kanban")}
      >
        Kanban
      </Button>
    </div>
  );
};

export default OrdersHeader;
