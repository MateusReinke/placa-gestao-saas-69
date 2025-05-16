
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, PlusCircle, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NewOrderForm from '@/components/forms/NewOrderForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  orderNumber: string;
  service: string;
  vehicle: string;
  date: string;
  value: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#12345',
    service: 'Emplacamento Padrão Mercosul',
    vehicle: 'Honda Civic - ABC-1234',
    date: '15/05/2023',
    value: 195.0,
    status: 'in-progress'
  },
  {
    id: '2',
    orderNumber: '#12330',
    service: 'Transferência de Veículo',
    vehicle: 'Toyota Corolla - DEF-5678',
    date: '10/05/2023',
    value: 280.0,
    status: 'completed'
  },
  {
    id: '3',
    orderNumber: '#12320',
    service: 'Legalização de Modificações',
    vehicle: 'Jeep Renegade - GHI-9012',
    date: '05/05/2023',
    value: 350.0,
    status: 'completed'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>;
    case 'in-progress':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Em Andamento</Badge>;
    case 'completed':
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">Concluído</Badge>;
    case 'cancelled':
      return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">Cancelado</Badge>;
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

const ClientOrders = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter orders based on search query and selected filters
  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    let matchesSearch = true;
    let matchesStatus = true;
    
    // Apply search filter
    if (searchQuery) {
      matchesSearch = 
        order.orderNumber.toLowerCase().includes(query) ||
        order.service.toLowerCase().includes(query) ||
        order.vehicle.toLowerCase().includes(query);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      matchesStatus = order.status === statusFilter;
    }
    
    // Apply type filter (service, vehicle, etc.)
    if (filterType !== 'all') {
      if (filterType === 'service') {
        return matchesStatus && order.service.toLowerCase().includes(query);
      } else if (filterType === 'vehicle') {
        return matchesStatus && order.vehicle.toLowerCase().includes(query);
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
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
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido por número, serviço, veículo..."
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
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('service')}>
                  Serviço
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('vehicle')}>
                  Veículo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  Todos Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pendente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('in-progress')}>
                  Em Andamento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                  Concluído
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                  Cancelado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nº Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.vehicle}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button variant="outline" size="sm">Detalhes</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' ? 
                      'Nenhum pedido encontrado com esses filtros.' : 
                      'Nenhum pedido cadastrado.'
                    }
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
