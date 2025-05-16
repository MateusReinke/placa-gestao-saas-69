
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminOrders = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Pedidos</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="flex gap-1">
              <span>Ver como Kanban</span>
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido por cliente, serviço..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="flex gap-1">
            <span>Filtrar</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nº Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">#12345</td>
                <td className="px-6 py-4 whitespace-nowrap">João Silva</td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                <td className="px-6 py-4 whitespace-nowrap">Honda Civic - ABC-1234</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Em Andamento</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Carlos (Vendedor)</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Detalhes</Button>
                  <Button variant="outline" size="sm">Atualizar</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">#12346</td>
                <td className="px-6 py-4 whitespace-nowrap">Maria Souza</td>
                <td className="px-6 py-4 whitespace-nowrap">Transferência</td>
                <td className="px-6 py-4 whitespace-nowrap">Toyota Corolla - DEF-5678</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Concluído</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Ana (Vendedor)</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Detalhes</Button>
                  <Button variant="outline" size="sm">Atualizar</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">#12347</td>
                <td className="px-6 py-4 whitespace-nowrap">José Santos</td>
                <td className="px-6 py-4 whitespace-nowrap">Legalização</td>
                <td className="px-6 py-4 whitespace-nowrap">Jeep Renegade - GHI-9012</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Novo</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Não atribuído</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Detalhes</Button>
                  <Button variant="outline" size="sm">Atribuir</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminOrders;
