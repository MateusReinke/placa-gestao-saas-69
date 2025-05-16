
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown, Pencil, Trash2, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewVehicleForm from '@/components/forms/NewVehicleForm';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ApiService } from '@/services/api';
import { Client } from '@/types';

interface Vehicle {
  id: string;
  model: string;
  brand: string;
  licensePlate: string;
  year: string;
  renavam: string;
  chassis?: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
  };
}

const mockVehicles: Vehicle[] = [
  { 
    id: '1', 
    model: 'Civic', 
    brand: 'Honda', 
    licensePlate: 'ABC-1234', 
    year: '2020', 
    renavam: '1234567890',
    clientId: '1',
    client: {
      id: '1',
      name: 'João Silva'
    }
  },
  { 
    id: '2', 
    model: 'Corolla', 
    brand: 'Toyota', 
    licensePlate: 'DEF-5678', 
    year: '2021', 
    renavam: '0987654321',
    clientId: '2',
    client: {
      id: '2',
      name: 'Maria Oliveira'
    }
  },
  { 
    id: '3', 
    model: 'Renegade', 
    brand: 'Jeep', 
    licensePlate: 'GHI-9012', 
    year: '2022', 
    renavam: '5678901234',
    clientId: '1',
    client: {
      id: '1',
      name: 'João Silva'
    }
  }
];

const AdminVehicles = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('all');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const fetchedClients = await ApiService.getClients();
        setClients(fetchedClients);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de clientes.",
          variant: "destructive",
        });
      }
    };
    
    fetchClients();
  }, [toast]);

  // Add/edit vehicle
  const handleAddEditVehicle = (vehicle: Vehicle) => {
    if (isEditMode && currentVehicle) {
      // Update existing vehicle
      setVehicles(vehicles.map(v => v.id === currentVehicle.id ? {...vehicle, id: currentVehicle.id} : v));
      toast({
        title: "Veículo atualizado",
        description: "Veículo atualizado com sucesso.",
      });
    } else {
      // Add new vehicle
      const newVehicle = {
        ...vehicle,
        id: Date.now().toString(), // Temporary ID
      };
      setVehicles([...vehicles, newVehicle]);
      toast({
        title: "Veículo adicionado",
        description: "Veículo adicionado com sucesso.",
      });
    }
    setIsDialogOpen(false);
  };

  // Open modal to edit vehicle
  const handleEditVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Remove vehicle
  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    toast({
      title: "Veículo removido",
      description: "Veículo removido com sucesso.",
    });
  };

  // Filter vehicles based on search and client filter
  const filteredVehicles = vehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    
    // Check if vehicle matches the search query
    const matchesSearch = 
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.licensePlate.toLowerCase().includes(query) ||
      vehicle.year.toLowerCase().includes(query) ||
      vehicle.client?.name.toLowerCase().includes(query);
    
    // Apply client filter if selected
    if (clientFilter !== 'all') {
      return matchesSearch && vehicle.clientId === clientFilter;
    }
    
    return matchesSearch;
  });

  // Reset form when opening to add new vehicle
  const handleNewVehicle = () => {
    setCurrentVehicle(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Veículos</h1>
          <Button className="flex gap-2" onClick={handleNewVehicle}>
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar Veículo</span>
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar veículo por placa, modelo, cliente..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                <Filter className="h-4 w-4" />
                <span>Filtrar por Cliente</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setClientFilter('all')}>
                Todos os clientes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {clients.map(client => (
                <DropdownMenuItem 
                  key={client.id}
                  onClick={() => setClientFilter(client.id)}
                >
                  {client.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Modelo</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Renavam</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{vehicle.client?.name || 'Cliente não atribuído'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehicle.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehicle.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehicle.licensePlate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehicle.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vehicle.renavam}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover veículo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o veículo {vehicle.brand} {vehicle.model} ({vehicle.licensePlate}) do cliente {vehicle.client?.name}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                    {searchQuery || clientFilter !== 'all' ? 'Nenhum veículo encontrado com esses filtros.' : 'Nenhum veículo cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para adicionar/editar veículo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
            </DialogTitle>
          </DialogHeader>
          <NewVehicleForm 
            onSuccess={() => setIsDialogOpen(false)} 
            initialData={currentVehicle}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminVehicles;
