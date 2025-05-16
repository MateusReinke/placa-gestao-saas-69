
import React, { useState, useEffect } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Brand {
  codigo: string;
  nome: string;
}

interface BrandSelectorProps {
  form: any;
  onBrandSelect: (brandCode: string) => void;
  isLoading: boolean;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ form, onBrandSelect, isLoading }) => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch car brands on initialization
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      setError(null);
      
      try {
        const response = await fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas');
        if (response.ok) {
          const data = await response.json();
          setBrands(Array.isArray(data) ? data : []);
          console.log("Marcas carregadas:", data.length);
        } else {
          console.error('Erro ao buscar marcas:', response.statusText);
          setError("Não foi possível carregar as marcas de veículos.");
          toast({
            title: "Erro",
            description: "Não foi possível carregar as marcas de veículos.",
            variant: "destructive",
          });
          setBrands([]);
        }
      } catch (error) {
        console.error('Erro ao buscar marcas:', error);
        setError("Erro ao carregar marcas. Tente novamente.");
        setBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };
    
    fetchBrands();
  }, [toast]);

  // Handler for brand selection with safeguards
  const handleBrandChange = (value: string) => {
    try {
      // Find the brand in the brands array
      const selectedBrandObj = brands.find(brand => brand.codigo === value);
      const selectedBrandName = selectedBrandObj?.nome || '';
      console.log("Nome da marca:", selectedBrandName);
      
      // First close the popover to prevent rendering issues
      setOpen(false);
      
      // Then update form value
      form.setValue('brand', selectedBrandName);
      
      // Call the onBrandSelect callback
      if (value) {
        onBrandSelect(value);
      }
    } catch (error) {
      console.error("Erro ao selecionar marca:", error);
      setError("Erro ao selecionar marca. Tente novamente.");
      setOpen(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="brand"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Marca</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={loadingBrands}
                  type="button"
                >
                  {loadingBrands ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  ) : field.value ? (
                    field.value
                  ) : (
                    "Selecione uma marca"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Pesquisar marca..." />
                <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
                <CommandGroup>
                  {loadingBrands ? (
                    <CommandItem disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando marcas...
                    </CommandItem>
                  ) : brands.length > 0 ? (
                    brands.map((brand) => (
                      <CommandItem
                        key={brand.codigo}
                        value={brand.nome}
                        onSelect={() => handleBrandChange(brand.codigo)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === brand.nome ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {brand.nome}
                      </CommandItem>
                    ))
                  ) : (
                    <CommandItem disabled>
                      {error ? error : "Nenhuma marca disponível"}
                    </CommandItem>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BrandSelector;
