// src/components/Orders/OrdersHeader.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Search,
  Filter,
  ChevronDown,
  List,
  LayoutGrid,
} from "lucide-react";
import NewOrderForm from "@/components/forms/NewOrderForm";
import { Order, Client, ServiceType } from "@/types";

interface OrdersHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clientFilter: string;
  setClientFilter: (filter: string) => void;
  serviceFilter: string;
  setServiceFilter: (filter: string) => void;
  organizationMode: "list" | "kanban";
  setOrganizationMode: (mode: "list" | "kanban") => void;
  uniqueClients: Pick<Client, "id" | "name">[];
  uniqueServices: Pick<ServiceType, "id" | "name">[];
  onOrderCreated: (newOrder: Order) => void;
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
  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Gerenciar Pedidos
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualize, filtre e adicione novos pedidos.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por Nº, cliente, serviço..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial justify-between min-w-[180px]"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="truncate">
                {clientFilter === "all"
                  ? "Todos Clientes"
                  : uniqueClients.find((c) => c.id === clientFilter)?.name ||
                    "Filtrar Cliente"}
              </span>
              <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[250px]">
            <DropdownMenuLabel>Filtrar por Cliente</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setClientFilter("all")}>
              Todos os Clientes
            </DropdownMenuItem>
            {uniqueClients.map((client) => (
              <DropdownMenuItem
                key={client.id}
                onSelect={() => setClientFilter(client.id)}
              >
                {client.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial justify-between min-w-[180px]"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="truncate">
                {serviceFilter === "all"
                  ? "Todos Serviços"
                  : uniqueServices.find((s) => s.id === serviceFilter)?.name ||
                    "Filtrar Serviço"}
              </span>
              <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[250px]">
            <DropdownMenuLabel>Filtrar por Tipo de Serviço</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setServiceFilter("all")}>
              Todos os Serviços
            </DropdownMenuItem>
            {uniqueServices.map((service) => (
              <DropdownMenuItem
                key={service.id}
                onSelect={() => setServiceFilter(service.id)}
              >
                {service.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-1">
          <Button
            variant={organizationMode === "list" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setOrganizationMode("list")}
            aria-label="Visualizar como lista"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={organizationMode === "kanban" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setOrganizationMode("kanban")}
            aria-label="Visualizar como kanban"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 sm:flex-initial">
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Pedido</DialogTitle>
            </DialogHeader>
            <NewOrderForm
              onSuccess={(newOrder) => {
                if (newOrder) {
                  // Garante que newOrder não é undefined
                  onOrderCreated(newOrder);
                }
                setIsDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrdersHeader;
