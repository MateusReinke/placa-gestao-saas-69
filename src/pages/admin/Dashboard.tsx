
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';

const AdminDashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Administrador</h1>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Dashboard cards will go here */}
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Total de Vendedores</h3>
            <p className="text-3xl font-bold">15</p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Total de Clientes</h3>
            <p className="text-3xl font-bold">124</p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Pedidos em Aberto</h3>
            <p className="text-3xl font-bold">32</p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium">Itens em Estoque</h3>
            <p className="text-3xl font-bold">450</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium mb-4">Serviços Mais Vendidos</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Emplacamento</span>
                <span className="font-medium">120</span>
              </div>
              <div className="flex justify-between">
                <span>Transferência</span>
                <span className="font-medium">86</span>
              </div>
              <div className="flex justify-between">
                <span>Legalização</span>
                <span className="font-medium">64</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
            <h3 className="font-medium mb-4">Estoque em Alerta</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Placas Modelo Mercosul</span>
                <span className="text-orange-500 font-medium">12 unidades</span>
              </div>
              <div className="flex justify-between">
                <span>Adesivos de Segurança</span>
                <span className="text-red-500 font-medium">5 unidades</span>
              </div>
              <div className="flex justify-between">
                <span>Lacres</span>
                <span className="text-amber-500 font-medium">25 unidades</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
