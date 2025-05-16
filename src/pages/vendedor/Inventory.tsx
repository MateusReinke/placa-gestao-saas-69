
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SellerInventory = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Visualizar Estoque</h1>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar item por nome..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Serviços</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Placas Modelo Mercosul</td>
                <td className="px-6 py-4 whitespace-nowrap">12</td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Baixo Estoque</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento Padrão, Emplacamento Personalizado</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Adesivos de Segurança</td>
                <td className="px-6 py-4 whitespace-nowrap">5</td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Crítico</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento Padrão</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Lacres</td>
                <td className="px-6 py-4 whitespace-nowrap">25</td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Adequado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento Padrão, Emplacamento Personalizado</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Formulários</td>
                <td className="px-6 py-4 whitespace-nowrap">45</td>
                <td className="px-6 py-4 whitespace-nowrap">Documentação</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Adequado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Transferência de Veículo, Legalização</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Selos</td>
                <td className="px-6 py-4 whitespace-nowrap">18</td>
                <td className="px-6 py-4 whitespace-nowrap">Documentação</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Baixo Estoque</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Transferência de Veículo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default SellerInventory;
