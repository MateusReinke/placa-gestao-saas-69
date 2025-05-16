
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ClientVehicles = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meus Veículos</h1>
          <Button className="flex gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar Veículo</span>
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar veículo por placa, modelo..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Modelo</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Renavam</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Honda Civic</td>
                <td className="px-6 py-4 whitespace-nowrap">ABC-1234</td>
                <td className="px-6 py-4 whitespace-nowrap">2020</td>
                <td className="px-6 py-4 whitespace-nowrap">1234567890</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="outline" size="sm">Pedidos</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Toyota Corolla</td>
                <td className="px-6 py-4 whitespace-nowrap">DEF-5678</td>
                <td className="px-6 py-4 whitespace-nowrap">2021</td>
                <td className="px-6 py-4 whitespace-nowrap">0987654321</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="outline" size="sm">Pedidos</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Jeep Renegade</td>
                <td className="px-6 py-4 whitespace-nowrap">GHI-9012</td>
                <td className="px-6 py-4 whitespace-nowrap">2022</td>
                <td className="px-6 py-4 whitespace-nowrap">5678901234</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="outline" size="sm">Pedidos</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientVehicles;
