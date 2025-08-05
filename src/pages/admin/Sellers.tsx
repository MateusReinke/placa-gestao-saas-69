
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SellersService, type Seller } from '@/services/sellersApi';
import { toast } from '@/hooks/use-toast';

const AdminSellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await SellersService.getSellers();
      setSellers(data);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar vendedores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await SellersService.deleteSeller(id);
      setSellers(sellers.filter(s => s.id !== id));
      toast({
        title: "Sucesso",
        description: "Vendedor removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar vendedor:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover vendedor",
        variant: "destructive",
      });
    }
  };

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
              placeholder="Buscar vendedor por nome ou email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando vendedores...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhum vendedor encontrado
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{seller.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{seller.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{seller.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">{seller.clientsCount}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">{seller.ordersCount}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Ativo
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(seller.id)}
                      >
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminSellers;
