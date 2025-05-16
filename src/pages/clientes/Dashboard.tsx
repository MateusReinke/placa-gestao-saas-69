
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Car } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meu Dashboard</h1>
          <Button asChild>
            <Link to="/client/orders" className="flex gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Novo Pedido</span>
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Meus Veículos</h3>
            <p className="text-3xl font-bold">3</p>
            <Button variant="link" asChild className="p-0 mt-2">
              <Link to="/client/vehicles">Ver todos</Link>
            </Button>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Pedidos Ativos</h3>
            <p className="text-3xl font-bold">2</p>
            <Button variant="link" asChild className="p-0 mt-2">
              <Link to="/client/orders">Ver detalhes</Link>
            </Button>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Pedidos Concluídos</h3>
            <p className="text-3xl font-bold">5</p>
          </div>
        </div>
        
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Meus Veículos</h3>
              <Button variant="outline" size="sm" asChild>
                <Link to="/client/vehicles" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>Adicionar Veículo</span>
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">Honda Civic</p>
                  <p className="text-sm text-muted-foreground">ABC-1234 • 2020</p>
                </div>
                <Button variant="ghost" size="sm">Detalhes</Button>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">Toyota Corolla</p>
                  <p className="text-sm text-muted-foreground">DEF-5678 • 2021</p>
                </div>
                <Button variant="ghost" size="sm">Detalhes</Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Jeep Renegade</p>
                  <p className="text-sm text-muted-foreground">GHI-9012 • 2022</p>
                </div>
                <Button variant="ghost" size="sm">Detalhes</Button>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium mb-4">Pedidos Recentes</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">Emplacamento</p>
                  <p className="text-sm text-muted-foreground">Honda Civic • ABC-1234</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Em Andamento</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">Transferência</p>
                  <p className="text-sm text-muted-foreground">Toyota Corolla • DEF-5678</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Concluído</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Legalização</p>
                  <p className="text-sm text-muted-foreground">Jeep Renegade • GHI-9012</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Novo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
