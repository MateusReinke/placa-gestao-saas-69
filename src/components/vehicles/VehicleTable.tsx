
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
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
  clientId: string;
  client?: {
    id: string;
    name: string;
  };
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  loading: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  clientFilter: string;
}

const VehicleTable: React.FC<VehicleTableProps> = ({ 
  vehicles, 
  loading, 
  onEdit, 
  onDelete,
  searchQuery,
  clientFilter
}) => {
  return (
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
          ) : vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
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
                    onClick={() => onEdit(vehicle)}
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
                          onClick={() => onDelete(vehicle.id)}
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
  );
};

export default VehicleTable;
