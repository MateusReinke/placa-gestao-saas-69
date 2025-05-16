
import React from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Client } from '@/types';

interface VehicleSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  clients: Client[];
  onClientFilterChange: (clientId: string) => void;
}

const VehicleSearch: React.FC<VehicleSearchProps> = ({ 
  searchQuery, 
  onSearchChange, 
  clients, 
  onClientFilterChange 
}) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar veículo por placa, modelo, cliente..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
          <DropdownMenuItem onClick={() => onClientFilterChange('all')}>
            Todos os clientes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {clients.map(client => (
            <DropdownMenuItem 
              key={client.id}
              onClick={() => onClientFilterChange(client.id)}
            >
              {client.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default VehicleSearch;
