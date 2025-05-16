
import React, { useState, useEffect } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Model {
  codigo: string;
  nome: string;
}

interface ModelSelectorProps {
  form: any;
  brandCode: string | null;
  onModelSelect: (modelCode: string) => void;
  isLoading: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ form, brandCode, onModelSelect, isLoading }) => {
  const { toast } = useToast();
  const [models, setModels] = useState<Model[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [searchModel, setSearchModel] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch models when a brand is selected
  useEffect(() => {
    if (!brandCode) return;
    
    const fetchModels = async () => {
      setLoadingModels(true);
      setModels([]);
      form.setValue('model', '');
      setError(null);
      
      try {
        console.log("Buscando modelos para marca:", brandCode);
        const response = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos`);
        if (response.ok) {
          const data = await response.json();
          const modelosArray = data && data.modelos ? data.modelos : [];
          setModels(Array.isArray(modelosArray) ? modelosArray : []);
          console.log("Modelos carregados:", modelosArray.length);
        } else {
          console.error('Erro ao buscar modelos:', response.statusText);
          setError("Não foi possível carregar os modelos para esta marca.");
          toast({
            title: "Erro",
            description: "Não foi possível carregar os modelos.",
            variant: "destructive",
          });
          setModels([]);
        }
      } catch (error) {
        console.error('Erro ao buscar modelos:', error);
        setError("Erro ao carregar modelos. Tente novamente.");
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [brandCode, toast, form]);

  // Handler for model selection with safeguards
  const handleModelChange = (value: string) => {
    try {
      // First close the popover to prevent rendering issues
      setOpen(false);

      // Find the model in the models array
      const selectedModelObj = models.find(model => model.codigo === value);
      const selectedModelName = selectedModelObj?.nome || '';
      console.log("Nome do modelo:", selectedModelName);
      
      form.setValue('model', selectedModelName);
      
      // Call the onModelSelect callback
      if (value) {
        onModelSelect(value);
      }
    } catch (error) {
      console.error("Erro ao selecionar modelo:", error);
      setError("Erro ao selecionar modelo. Tente novamente.");
    }
  };

  // Filter models based on search query
  const filteredModels = models.filter(model => 
    model.nome.toLowerCase().includes(searchModel.toLowerCase())
  );

  return (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Modelo</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={!brandCode || loadingModels}
                  type="button"
                >
                  {loadingModels ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  ) : field.value ? (
                    field.value
                  ) : (
                    !brandCode ? "Selecione uma marca primeiro" : "Selecione um modelo"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Pesquisar modelo..." 
                  value={searchModel}
                  onValueChange={setSearchModel}
                />
                <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
                <CommandGroup>
                  {loadingModels ? (
                    <CommandItem disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando modelos...
                    </CommandItem>
                  ) : filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <CommandItem
                        key={model.codigo}
                        value={model.nome}
                        onSelect={() => handleModelChange(model.codigo)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === model.nome ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {model.nome}
                      </CommandItem>
                    ))
                  ) : (
                    <CommandItem disabled>
                      {error ? error : "Nenhum modelo disponível"}
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

export default ModelSelector;
