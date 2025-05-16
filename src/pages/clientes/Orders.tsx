
import React, { useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NewOrderForm from '@/components/forms/NewOrderForm';

const ClientOrders = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido por serviço, veículo..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">#12345</td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento Padrão Mercosul</td>
                <td className="px-6 py-4 whitespace-nowrap">Honda Civic - ABC-1234</td>
                <td className="px-6 py-4 whitespace-nowrap">15/05/2023</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ 195,00</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Em Andamento</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Detalhes</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">#12330</td>
                <td className="px-6 py-4 whitespace-nowrap">Transferência de Veículo</td>
                <td className="px-6 py-4 whitespace-nowrap">Toyota Corolla - DEF-5678</td>
                <td className="px-6 py-4 whitespace-nowrap">10/05/2023</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ 280,00</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Concluído</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Detalhes</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">#12320</td>
                <td className="px-6 py-4 whitespace-nowrap">Legalização de Modificações</td>
                <td className="px-6 py-4 whitespace-nowrap">Jeep Renegade - GHI-9012</td>
                <td className="px-6 py-4 whitespace-nowrap">05/05/2023</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ 350,00</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Concluído</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Detalhes</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientOrders;
