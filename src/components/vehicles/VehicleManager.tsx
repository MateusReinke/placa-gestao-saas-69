
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApiService } from '@/services/api';
import { Client } from '@/types';
import NewVehicleForm from '@/components/forms/NewVehicleForm';
import VehicleTable from '@/components/vehicles/VehicleTable';
import VehicleSearch from '@/components/vehicles/VehicleSearch';

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

interface VehicleManagerProps {
  initialVehicles?: Vehicle[];
}

const VehicleManager: React.FC<VehicleManagerProps> = ({ initialVehicles = [] }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
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
    if (!vehicle) {
      setIsDialogOpen(false);
      return;
    }
    
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Veículos</h1>
        <Button className="flex gap-2" onClick={handleNewVehicle}>
          <PlusCircle className="h-4 w-4" />
          <span>Adicionar Veículo</span>
        </Button>
      </div>
      
      <VehicleSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        clients={clients}
        onClientFilterChange={setClientFilter}
      />
      
      <VehicleTable 
        vehicles={filteredVehicles} 
        loading={loading}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
        searchQuery={searchQuery}
        clientFilter={clientFilter}
      />

      {/* Modal para adicionar/editar veículo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
            </DialogTitle>
          </DialogHeader>
          <NewVehicleForm 
            onSuccess={handleAddEditVehicle} 
            initialData={currentVehicle}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleManager;
