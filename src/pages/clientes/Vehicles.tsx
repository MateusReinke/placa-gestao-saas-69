
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface Vehicle {
  id: string;
  model: string;
  brand: string;
  licensePlate: string;
  year: string;
  renavam: string;
  chassis?: string;
}

const mockVehicles: Vehicle[] = [
  { 
    id: '1', 
    model: 'Civic', 
    brand: 'Honda', 
    licensePlate: 'ABC-1234', 
    year: '2020', 
    renavam: '1234567890' 
  },
  { 
    id: '2', 
    model: 'Corolla', 
    brand: 'Toyota', 
    licensePlate: 'DEF-5678', 
    year: '2021', 
    renavam: '0987654321' 
  },
  { 
    id: '3', 
    model: 'Renegade', 
    brand: 'Jeep', 
    licensePlate: 'GHI-9012', 
    year: '2022', 
    renavam: '5678901234' 
  }
];

const ClientVehicles = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Adicionar/editar veículo
  const handleAddEditVehicle = (vehicle: Vehicle) => {
    if (isEditMode && currentVehicle) {
      // Atualizar veículo existente
      setVehicles(vehicles.map(v => v.id === currentVehicle.id ? vehicle : v));
      toast({
        title: "Veículo atualizado",
        description: "Veículo atualizado com sucesso.",
      });
    } else {
      // Adicionar novo veículo
      const newVehicle = {
        ...vehicle,
        id: Date.now().toString(), // ID temporário
      };
      setVehicles([...vehicles, newVehicle]);
      toast({
        title: "Veículo adicionado",
        description: "Veículo adicionado com sucesso.",
      });
    }
    setIsDialogOpen(false);
  };

  // Abrir o modal para editar veículo
  const handleEditVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Remover veículo
  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    toast({
      title: "Veículo removido",
      description: "Veículo removido com sucesso.",
    });
  };

  // Filtrar veículos com base na pesquisa
  const filteredVehicles = vehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    return (
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.licensePlate.toLowerCase().includes(query)
    );
  });

  // Resetar o formulário ao abrir para adicionar novo veículo
  const handleNewVehicle = () => {
    setCurrentVehicle(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meus Veículos</h1>
          <Button className="flex gap-2" onClick={handleNewVehicle}>
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar Veículo</span>
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar veículo por placa, modelo..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
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
                              Tem certeza que deseja remover o veículo {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})? Esta ação não pode ser desfeita.
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
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    {searchQuery ? 'Nenhum veículo encontrado com esses termos.' : 'Nenhum veículo cadastrado.'}
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
          <NewVehicleForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ClientVehicles;
