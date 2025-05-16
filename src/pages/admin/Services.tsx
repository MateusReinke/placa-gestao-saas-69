
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const AdminServices = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Serviços</h1>
          <Button className="flex gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Novo Serviço</span>
          </Button>
        </div>
        
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Items do Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento Padrão Mercosul</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ 195,00</td>
                <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                <td className="px-6 py-4 whitespace-nowrap">Placa Mercosul, Lacre</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="destructive" size="sm">Remover</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Transferência de Veículo</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ 280,00</td>
                <td className="px-6 py-4 whitespace-nowrap">Documentação</td>
                <td className="px-6 py-4 whitespace-nowrap">Formulário, Selo</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="destructive" size="sm">Remover</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Legalização de Modificações</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ 350,00</td>
                <td className="px-6 py-4 whitespace-nowrap">Legalização</td>
                <td className="px-6 py-4 whitespace-nowrap">Formulário, Selo, Certificado</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="destructive" size="sm">Remover</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminServices;
