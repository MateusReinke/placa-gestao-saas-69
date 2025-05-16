
import React, { useState, useEffect } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Year {
  codigo: string;
  nome: string;
}

interface YearSelectorProps {
  form: any;
  brandCode: string | null;
  modelCode: string | null;
  isLoading: boolean;
}

const YearSelector: React.FC<YearSelectorProps> = ({ form, brandCode, modelCode, isLoading }) => {
  const { toast } = useToast();
  const [years, setYears] = useState<Year[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available years when a model is selected
  useEffect(() => {
    if (!brandCode || !modelCode) return;
    
    const fetchYears = async () => {
      setLoadingYears(true);
      setYears([]); // Initialize with empty array
      form.setValue('year', '');
      setError(null);
      
      try {
        console.log(`Buscando anos para marca ${brandCode} e modelo ${modelCode}`);
        const response = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos/${modelCode}/anos`);
        if (response.ok) {
          const data = await response.json();
          // Ensure we're setting an array, even if empty
          setYears(Array.isArray(data) ? data : []);
          console.log("Anos carregados:", Array.isArray(data) ? data.length : 0);
        } else {
          console.error('Erro ao buscar anos:', response.statusText);
          setError("Não foi possível carregar os anos disponíveis para este modelo.");
          toast({
            title: "Erro",
            description: "Não foi possível carregar os anos disponíveis.",
            variant: "destructive",
          });
          // Set empty array to prevent undefined
          setYears([]);
        }
      } catch (error) {
        console.error('Erro ao buscar anos:', error);
        setError("Erro ao carregar anos. Tente novamente.");
        // Set empty array to prevent undefined
        setYears([]);
      } finally {
        setLoadingYears(false);
      }
    };

    fetchYears();
  }, [brandCode, modelCode, toast, form]);

  // Handler for year selection with safeguards
  const handleYearChange = (value: string) => {
    try {
      console.log("Ano selecionado código:", value);
      // Find the year in the years array, with a fallback if not found
      const selectedYearObj = years.find(year => year.codigo === value);
      const yearName = selectedYearObj?.nome || '';
      console.log("Ano:", yearName);
      
      form.setValue('year', yearName);
      // Close the popover first to prevent rendering issues
      setOpen(false);
    } catch (error) {
      console.error("Erro ao selecionar ano:", error);
      setError("Erro ao selecionar ano. Tente novamente.");
      setOpen(false); // Always close popover on error
    }
  };

  // Make sure years is always an array
  const safeYears = Array.isArray(years) ? years : [];

  return (
    <FormField
      control={form.control}
      name="year"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ano</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={!modelCode || loadingYears}
                  type="button"
                >
                  {loadingYears ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  ) : field.value ? (
                    field.value
                  ) : (
                    !modelCode ? "Selecione um modelo primeiro" : "Selecione o ano"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Pesquisar ano..." />
                <CommandEmpty>Nenhum ano encontrado.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {loadingYears ? (
                    <CommandItem disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando anos...
                    </CommandItem>
                  ) : safeYears.length > 0 ? (
                    safeYears.map((year) => (
                      <CommandItem
                        key={year.codigo}
                        value={year.nome}
                        onSelect={() => handleYearChange(year.codigo)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === year.nome ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {year.nome}
                      </CommandItem>
                    ))
                  ) : (
                    <CommandItem disabled>
                      {error ? error : "Nenhum ano disponível"}
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

export default YearSelector;
