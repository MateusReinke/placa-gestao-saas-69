
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusCircle, Search, MoreVertical } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import '@/styles/kanban.css';
import { ApiService } from '@/services/api';
import { Order, OrderStatus } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminOrders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationMode, setOrganizationMode] = useState<'list' | 'kanban'>('kanban');

  // Buscar pedidos e status na inicialização
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedOrders, fetchedStatuses] = await Promise.all([
          ApiService.getOrders(user?.id, user?.role),
          ApiService.getOrderStatuses()
        ]);
        
        setOrders(fetchedOrders);
        setStatuses(fetchedStatuses.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast, user?.id, user?.role]);

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    
    // Se não houver destino válido, ignorar o drop
    if (!destination) return;
    
    // Se o item for solto na mesma posição, ignorar
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Encontrar o pedido que foi arrastado
    const orderId = draggableId;
    const newStatusId = destination.droppableId;
    
    // Atualizar o estado localmente para feedback imediato
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              statusId: newStatusId,
              status: statuses.find(s => s.id === newStatusId)
            } 
          : order
      )
    );
    
    // Enviar a atualização para a API
    try {
      await ApiService.updateOrder(orderId, { statusId: newStatusId });
      toast({
        title: "Atualizado",
        description: "Status do pedido atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive"
      });
      
      // Reverter a alteração local em caso de erro
      const originalOrder = orders.find(order => order.id === orderId);
      if (originalOrder) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? originalOrder : order
          )
        );
      }
    }
  };

  const getOrdersForStatus = (statusId: string) => {
    return orders.filter(order => order.statusId === statusId);
  };

  const getStatusColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'red': 'bg-red-500',
      'yellow': 'bg-yellow-500',
      'green': 'bg-green-500',
      'blue': 'bg-blue-500',
      'purple': 'bg-purple-500',
      'gray': 'bg-gray-500',
    };
    
    return colorMap[colorName.toLowerCase()] || 'bg-gray-500';
  };

  const handleRemoveOrder = async (orderId: string) => {
    try {
      await ApiService.deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      toast({
        title: "Pedido removido",
        description: "Pedido removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover pedido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o pedido.",
        variant: "destructive"
      });
    }
  };

  // Renderização condicional do conteúdo com base no modo
  const renderOrderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-primary/30"></div>
            <div className="mt-4 text-muted-foreground">Carregando...</div>
          </div>
        </div>
      );
    }

    if (organizationMode === 'kanban') {
      return (
        <div className="mt-6 overflow-x-auto pb-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-4">
              {statuses.filter(status => status.active).map((status) => (
                <Droppable droppableId={status.id} key={status.id}>
                  {(provided) => (
                    <div
                      className="kanban-column"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <div className="p-3 font-medium text-sm flex items-center justify-between bg-muted/50 border-b">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(status.color)}`}></div>
                          <span>{status.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getOrdersForStatus(status.id).length}
                        </Badge>
                      </div>
                      <div className="p-2 flex-grow overflow-y-auto">
                        {getOrdersForStatus(status.id).map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided) => (
                              <Card 
                                className="kanban-card mb-3" 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <CardHeader className="p-3 pb-0">
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium">
                                      {order.client?.name || 'Cliente'}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem 
                                          onClick={() => {/* Implementar edição */}}
                                        >
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-destructive"
                                          onClick={() => handleRemoveOrder(order.id)}
                                        >
                                          Remover
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-1">
                                  <div className="text-sm text-muted-foreground">
                                    {order.serviceType?.name || 'Serviço'}
                                  </div>
                                  <div className="text-sm">
                                    Placa: <span className="font-medium">{order.licensePlate}</span>
                                  </div>
                                </CardContent>
                                <CardFooter className="p-3 pt-0 text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </CardFooter>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      );
    } else {
      // Modo de visualização em lista
      return (
        <div className="rounded-md border mt-6">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{order.client?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.serviceType?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.licensePlate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(order.status?.color || 'gray')}`}></div>
                      {order.status?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {/* Implementar edição */}}>
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive" 
                      onClick={() => handleRemoveOrder(order.id)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Pedidos</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Novo Pedido</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Pedido</DialogTitle>
              </DialogHeader>
              {/* Aqui seria incluído o formulário de criação de pedidos */}
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={organizationMode === 'list' ? 'default' : 'outline'}
              onClick={() => setOrganizationMode('list')}
              className="whitespace-nowrap"
            >
              Visualizar em Lista
            </Button>
            <Button
              variant={organizationMode === 'kanban' ? 'default' : 'outline'}
              onClick={() => setOrganizationMode('kanban')}
              className="whitespace-nowrap"
            >
              Visualizar em Kanban
            </Button>
          </div>
        </div>
        
        {renderOrderContent()}
      </div>
    </AppLayout>
  );
};

export default AdminOrders;
