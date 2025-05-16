
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';

const SellerDashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard do Vendedor</h1>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Meus Clientes</h3>
            <p className="text-3xl font-bold">42</p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Pedidos em Aberto</h3>
            <p className="text-3xl font-bold">8</p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Pedidos Finalizados</h3>
            <p className="text-3xl font-bold">156</p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Taxa de Conversão</h3>
            <p className="text-3xl font-bold">76%</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium mb-4">Últimos Pedidos</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>João Silva - Emplacamento</span>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Em Andamento</span>
              </div>
              <div className="flex justify-between">
                <span>Maria Souza - Transferência</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Concluído</span>
              </div>
              <div className="flex justify-between">
                <span>José Santos - Legalização</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Novo</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium mb-4">Serviços Mais Vendidos</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Emplacamento</span>
                <span className="font-medium">32</span>
              </div>
              <div className="flex justify-between">
                <span>Transferência</span>
                <span className="font-medium">28</span>
              </div>
              <div className="flex justify-between">
                <span>Legalização</span>
                <span className="font-medium">15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SellerDashboard;
