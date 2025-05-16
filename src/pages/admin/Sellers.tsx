
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminSellers = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Vendedores</h1>
          <Button className="flex gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Novo Vendedor</span>
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendedor por nome..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Clientes</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pedidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Carlos Santos</td>
                <td className="px-6 py-4 whitespace-nowrap">carlos@email.com</td>
                <td className="px-6 py-4 whitespace-nowrap">(11) 98765-4321</td>
                <td className="px-6 py-4 whitespace-nowrap">24</td>
                <td className="px-6 py-4 whitespace-nowrap">86</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativo</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="destructive" size="sm">Desativar</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Ana Silva</td>
                <td className="px-6 py-4 whitespace-nowrap">ana@email.com</td>
                <td className="px-6 py-4 whitespace-nowrap">(11) 98765-1234</td>
                <td className="px-6 py-4 whitespace-nowrap">18</td>
                <td className="px-6 py-4 whitespace-nowrap">70</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativo</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="destructive" size="sm">Desativar</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Pedro Oliveira</td>
                <td className="px-6 py-4 whitespace-nowrap">pedro@email.com</td>
                <td className="px-6 py-4 whitespace-nowrap">(11) 91234-5678</td>
                <td className="px-6 py-4 whitespace-nowrap">0</td>
                <td className="px-6 py-4 whitespace-nowrap">0</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Novo</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="destructive" size="sm">Desativar</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminSellers;
