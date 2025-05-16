
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminInventory = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Estoque</h1>
          <Button className="flex gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Novo Item</span>
          </Button>
        </div>
        
        <Tabs defaultValue="items">
          <TabsList>
            <TabsTrigger value="items">Itens em Estoque</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="space-y-4 pt-4">
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quantidade Mínima</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Preço de Custo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Placas Modelo Mercosul</td>
                    <td className="px-6 py-4 whitespace-nowrap">12</td>
                    <td className="px-6 py-4 whitespace-nowrap">20</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ 95,00</td>
                    <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Baixo Estoque</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Histórico</Button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Adesivos de Segurança</td>
                    <td className="px-6 py-4 whitespace-nowrap">5</td>
                    <td className="px-6 py-4 whitespace-nowrap">10</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ 15,00</td>
                    <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Crítico</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Histórico</Button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Lacres</td>
                    <td className="px-6 py-4 whitespace-nowrap">25</td>
                    <td className="px-6 py-4 whitespace-nowrap">20</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ 5,00</td>
                    <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Adequado</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Histórico</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4 pt-4">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por item ou pedido..."
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Movimento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quantidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Responsável</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Observação</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">15/05/2023 09:45</td>
                    <td className="px-6 py-4 whitespace-nowrap">Placas Modelo Mercosul</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Saída</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">1</td>
                    <td className="px-6 py-4 whitespace-nowrap">#12345</td>
                    <td className="px-6 py-4 whitespace-nowrap">Carlos (Vendedor)</td>
                    <td className="px-6 py-4 whitespace-nowrap">Emplacamento Honda Civic</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">14/05/2023 14:30</td>
                    <td className="px-6 py-4 whitespace-nowrap">Adesivos de Segurança</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Saída</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">1</td>
                    <td className="px-6 py-4 whitespace-nowrap">#12346</td>
                    <td className="px-6 py-4 whitespace-nowrap">Ana (Vendedor)</td>
                    <td className="px-6 py-4 whitespace-nowrap">Transferência Toyota Corolla</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">12/05/2023 10:15</td>
                    <td className="px-6 py-4 whitespace-nowrap">Lacres</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Entrada</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">50</td>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap">José (Admin)</td>
                    <td className="px-6 py-4 whitespace-nowrap">Reposição de estoque</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminInventory;
