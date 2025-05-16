
import React, { useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NewClientForm from '@/components/forms/NewClientForm';

const SellerClients = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meus Clientes</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Novo Cliente</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              </DialogHeader>
              <NewClientForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente por nome, CPF/CNPJ..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">CPF/CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Veículos</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">João Silva</td>
                <td className="px-6 py-4 whitespace-nowrap">123.456.789-00</td>
                <td className="px-6 py-4 whitespace-nowrap">Pessoa Física</td>
                <td className="px-6 py-4 whitespace-nowrap">(11) 98765-4321</td>
                <td className="px-6 py-4 whitespace-nowrap">joao@email.com</td>
                <td className="px-6 py-4 whitespace-nowrap">2</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="outline" size="sm">Pedidos</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Auto Center S.A.</td>
                <td className="px-6 py-4 whitespace-nowrap">12.345.678/0001-90</td>
                <td className="px-6 py-4 whitespace-nowrap">Pessoa Jurídica</td>
                <td className="px-6 py-4 whitespace-nowrap">(11) 3456-7890</td>
                <td className="px-6 py-4 whitespace-nowrap">contato@autocenter.com</td>
                <td className="px-6 py-4 whitespace-nowrap">8</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="outline" size="sm">Pedidos</Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Maria Souza</td>
                <td className="px-6 py-4 whitespace-nowrap">987.654.321-00</td>
                <td className="px-6 py-4 whitespace-nowrap">Pessoa Física</td>
                <td className="px-6 py-4 whitespace-nowrap">(11) 91234-5678</td>
                <td className="px-6 py-4 whitespace-nowrap">maria@email.com</td>
                <td className="px-6 py-4 whitespace-nowrap">1</td>
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

export default SellerClients;
