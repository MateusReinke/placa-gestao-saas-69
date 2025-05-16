import React, { useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown, History, Edit, Trash2, Plus, Minus, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  category: string;
  status: 'adequate' | 'low' | 'critical';
}

interface InventoryHistory {
  id: string;
  date: string;
  item: string;
  movement: 'in' | 'out';
  quantity: number;
  order?: string;
  responsible: string;
  notes?: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Placas Modelo Mercosul',
    quantity: 12,
    minQuantity: 20,
    costPrice: 95.0,
    category: 'Emplacamento',
    status: 'low'
  },
  {
    id: '2',
    name: 'Adesivos de Segurança',
    quantity: 5,
    minQuantity: 10,
    costPrice: 15.0,
    category: 'Emplacamento',
    status: 'critical'
  },
  {
    id: '3',
    name: 'Lacres',
    quantity: 25,
    minQuantity: 20,
    costPrice: 5.0,
    category: 'Emplacamento',
    status: 'adequate'
  }
];

const mockHistory: InventoryHistory[] = [
  {
    id: '1',
    date: '15/05/2023 09:45',
    item: 'Placas Modelo Mercosul',
    movement: 'out',
    quantity: 1,
    order: '#12345',
    responsible: 'Carlos (Vendedor)',
    notes: 'Emplacamento Honda Civic'
  },
  {
    id: '2',
    date: '14/05/2023 14:30',
    item: 'Adesivos de Segurança',
    movement: 'out',
    quantity: 1,
    order: '#12346',
    responsible: 'Ana (Vendedor)',
    notes: 'Transferência Toyota Corolla'
  },
  {
    id: '3',
    date: '12/05/2023 10:15',
    item: 'Lacres',
    movement: 'in',
    quantity: 50,
    responsible: 'José (Admin)',
    notes: 'Reposição de estoque'
  }
];

// Form schema for adding/editing inventory item
const itemFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  quantity: z.coerce.number().min(0, { message: "Quantidade não pode ser negativa" }),
  minQuantity: z.coerce.number().min(0, { message: "Quantidade mínima não pode ser negativa" }),
  costPrice: z.coerce.number().min(0, { message: "Preço de custo não pode ser negativo" }),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
});

// Form schema for inventory movement
const movementFormSchema = z.object({
  itemId: z.string().min(1, { message: "Item é obrigatório" }),
  movement: z.enum(['in', 'out'], { message: "Movimento inválido" }),
  quantity: z.coerce.number().min(1, { message: "Quantidade deve ser pelo menos 1" }),
  notes: z.string().optional(),
});

const AdminInventory = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [history, setHistory] = useState<InventoryHistory[]>(mockHistory);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Item form
  const itemForm = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      minQuantity: 0,
      costPrice: 0,
      category: '',
    },
  });

  // Movement form
  const movementForm = useForm<z.infer<typeof movementFormSchema>>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      itemId: '',
      movement: 'in',
      quantity: 1,
      notes: '',
    },
  });

  // Reset and set up the item form
  const handleAddItem = () => {
    setIsEditMode(false);
    setCurrentItem(null);
    itemForm.reset({
      name: '',
      quantity: 0,
      minQuantity: 0,
      costPrice: 0,
      category: '',
    });
    setItemDialogOpen(true);
  };

  // Set up editing an item
  const handleEditItem = (item: InventoryItem) => {
    setIsEditMode(true);
    setCurrentItem(item);
    itemForm.reset({
      name: item.name,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      costPrice: item.costPrice,
      category: item.category,
    });
    setItemDialogOpen(true);
  };

  // Handle deleting an item
  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    toast({
      title: "Item removido",
      description: "Item removido do estoque com sucesso.",
    });
  };

  // Open movement dialog
  const handleMovementDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    movementForm.reset({
      itemId: item.id,
      movement: 'in',
      quantity: 1,
      notes: '',
    });
    setMovementDialogOpen(true);
  };

  // Submit handler for item form
  const onItemSubmit = (data: z.infer<typeof itemFormSchema>) => {
    if (isEditMode && currentItem) {
      // Update existing item
      const status = calculateStatus(data.quantity, data.minQuantity);
      const updatedItem: InventoryItem = {
        ...currentItem,
        name: data.name,
        quantity: data.quantity,
        minQuantity: data.minQuantity,
        costPrice: data.costPrice,
        category: data.category,
        status,
      };
      setInventory(inventory.map(item => item.id === currentItem.id ? updatedItem : item));
      toast({
        title: "Item atualizado",
        description: "Item do estoque atualizado com sucesso.",
      });
    } else {
      // Add new item
      const status = calculateStatus(data.quantity, data.minQuantity);
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: data.name,
        quantity: data.quantity,
        minQuantity: data.minQuantity,
        costPrice: data.costPrice,
        category: data.category,
        status,
      };
      setInventory([...inventory, newItem]);
      toast({
        title: "Item adicionado",
        description: "Novo item adicionado ao estoque.",
      });
    }
    setItemDialogOpen(false);
  };

  // Submit handler for movement form
  const onMovementSubmit = (data: z.infer<typeof movementFormSchema>) => {
    if (!currentItem) return;

    // Update item quantity
    const updatedInventory = inventory.map(item => {
      if (item.id === data.itemId) {
        const newQuantity = data.movement === 'in' 
          ? item.quantity + data.quantity 
          : Math.max(0, item.quantity - data.quantity);
        
        const status = calculateStatus(newQuantity, item.minQuantity);
        
        return {
          ...item,
          quantity: newQuantity,
          status,
        };
      }
      return item;
    });
    
    setInventory(updatedInventory);
    
    // Add to history
    const newHistoryEntry: InventoryHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('pt-BR'),
      item: currentItem.name,
      movement: data.movement,
      quantity: data.quantity,
      responsible: 'Admin',
      notes: data.notes,
    };
    
    setHistory([newHistoryEntry, ...history]);
    
    toast({
      title: "Movimento registrado",
      description: `${data.movement === 'in' ? 'Entrada' : 'Saída'} de ${data.quantity} unidades registrada.`,
    });
    
    setMovementDialogOpen(false);
  };

  // Helper function to determine item status
  const calculateStatus = (quantity: number, minQuantity: number): 'adequate' | 'low' | 'critical' => {
    if (quantity <= minQuantity * 0.3) return 'critical';
    if (quantity <= minQuantity) return 'low';
    return 'adequate';
  };

  // Get status badge for an item
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'adequate':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Adequado</span>;
      case 'low':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Baixo Estoque</span>;
      case 'critical':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Crítico</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Desconhecido</span>;
    }
  };

  // Filter inventory items
  const filteredInventory = inventory.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query);
    
    if (categoryFilter === 'all') {
      return matchesQuery;
    } else {
      return matchesQuery && item.category === categoryFilter;
    }
  });

  // Get unique categories
  const categories = Array.from(new Set(inventory.map(item => item.category)));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Estoque</h1>
          <Button className="flex gap-2" onClick={handleAddItem}>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                    Todas as categorias
                  </DropdownMenuItem>
                  {categories.map(category => (
                    <DropdownMenuItem 
                      key={category} 
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.minQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.costPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <History className="h-4 w-4 mr-1" />
                                Movimento
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setCurrentItem(item);
                                movementForm.setValue('itemId', item.id);
                                movementForm.setValue('movement', 'in');
                                setMovementDialogOpen(true);
                              }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Registrar Entrada
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setCurrentItem(item);
                                movementForm.setValue('itemId', item.id);
                                movementForm.setValue('movement', 'out');
                                setMovementDialogOpen(true);
                              }}>
                                <Minus className="h-4 w-4 mr-2" />
                                Registrar Saída
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover {item.name} do estoque? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        {searchQuery || categoryFilter !== 'all' ? 
                          'Nenhum item encontrado com esses filtros.' : 
                          'Nenhum item cadastrado no estoque.'}
                      </td>
                    </tr>
                  )}
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
                <Filter className="h-4 w-4" />
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
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{entry.item}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${entry.movement === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {entry.movement === 'in' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{entry.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{entry.order || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{entry.responsible}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{entry.notes || '-'}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum movimento registrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para adicionar/editar item */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Atualize as informações do item no estoque.' : 'Preencha as informações para adicionar um novo item ao estoque.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4">
              <FormField
                control={itemForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Item</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Placas Modelo Mercosul" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={itemForm.control}
                  name="minQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Mínima</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Custo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={itemForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Emplacamento">Emplacamento</SelectItem>
                          <SelectItem value="Documentação">Documentação</SelectItem>
                          <SelectItem value="Lacres">Lacres</SelectItem>
                          <SelectItem value="Adesivos">Adesivos</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditMode ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para registrar movimentação */}
      <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Movimento de Estoque</DialogTitle>
            <DialogDescription>
              {movementForm.watch('movement') === 'in' ? 'Registrar entrada de itens no estoque.' : 'Registrar saída de itens do estoque.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...movementForm}>
            <form onSubmit={movementForm.handleSubmit(onMovementSubmit)} className="space-y-4">
              <FormField
                control={movementForm.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item</FormLabel>
                    <FormControl>
                      <Input 
                        value={currentItem?.name || ''}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={movementForm.control}
                name="movement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de movimento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in">Entrada</SelectItem>
                        <SelectItem value="out">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={movementForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={movementForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Reposição de estoque" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMovementDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar {movementForm.watch('movement') === 'in' ? 'Entrada' : 'Saída'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminInventory;
