
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from "lucide-react";

interface Brand {
  codigo: string;
  nome: string;
}

interface Model {
  codigo: string;
  nome: string;
}

interface Year {
  codigo: string;
  nome: string;
}

const formSchema = z.object({
  licensePlate: z.string().min(7, "Placa inválida").max(8, "Placa inválida"),
  model: z.string().min(2, "Modelo do veículo é obrigatório"),
  brand: z.string().min(2, "Marca do veículo é obrigatória"),
  year: z.string().min(4, "Ano é obrigatório"),
  renavam: z.string().optional(),
  chassis: z.string().optional(),
  clientId: z.string().optional(),
});

interface NewVehicleFormProps {
  onSuccess: (vehicle: any) => void;
  initialData?: any;
  clientId?: string;
  simplified?: boolean;
}

const NewVehicleForm: React.FC<NewVehicleFormProps> = ({ 
  onSuccess, 
  initialData, 
  clientId,
  simplified = false
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [searchModel, setSearchModel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const defaultValues = {
    licensePlate: initialData?.licensePlate || '',
    model: initialData?.model || '',
    brand: initialData?.brand || '',
    year: initialData?.year || '',
    renavam: initialData?.renavam || '',
    chassis: initialData?.chassis || '',
    clientId: clientId || initialData?.clientId || '',
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Fetch car brands on initialization
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      setError(null);
      
      try {
        const response = await fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas');
        if (response.ok) {
          const data = await response.json();
          // Ensure we're setting an array, even if empty
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
          // Set empty array to prevent undefined
          setBrands([]);
        }
      } catch (error) {
        console.error('Erro ao buscar marcas:', error);
        setError("Erro ao carregar marcas. Tente novamente.");
        // Set empty array to prevent undefined
        setBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };
    
    fetchBrands();
  }, [toast]);

  // Fetch models when a brand is selected
  const fetchModels = async (brandCode: string) => {
    if (!brandCode) return;
    
    setLoadingModels(true);
    setModels([]); // Initialize with empty array
    setYears([]);  // Initialize with empty array
    form.setValue('model', '');
    form.setValue('year', '');
    setError(null);
    
    try {
      console.log("Buscando modelos para marca:", brandCode);
      const response = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos`);
      if (response.ok) {
        const data = await response.json();
        // Ensure we're setting an array, even if empty
        setModels(Array.isArray(data.modelos) ? data.modelos : []);
        console.log("Modelos carregados:", Array.isArray(data.modelos) ? data.modelos.length : 0);
      } else {
        console.error('Erro ao buscar modelos:', response.statusText);
        setError("Não foi possível carregar os modelos para esta marca.");
        toast({
          title: "Erro",
          description: "Não foi possível carregar os modelos.",
          variant: "destructive",
        });
        // Set empty array to prevent undefined
        setModels([]);
      }
    } catch (error) {
      console.error('Erro ao buscar modelos:', error);
      setError("Erro ao carregar modelos. Tente novamente.");
      // Set empty array to prevent undefined
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // Fetch available years when a model is selected
  const fetchYears = async (brandCode: string, modelCode: string) => {
    if (!brandCode || !modelCode) return;
    
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

  // Handler for brand selection with safeguards
  const handleBrandChange = (value: string) => {
    try {
      console.log("Marca selecionada código:", value);
      // Find the brand in the brands array, with a fallback if not found
      const selectedBrandObj = brands.find(brand => brand.codigo === value);
      const selectedBrandName = selectedBrandObj?.nome || '';
      console.log("Nome da marca:", selectedBrandName);
      
      form.setValue('brand', selectedBrandName);
      setSelectedBrand(value);
      // Close the popover first to prevent rendering issues
      setOpenBrand(false);
      
      // Fetch models with a delay to allow UI to update first
      setTimeout(() => {
        if (value) {
          fetchModels(value);
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao selecionar marca:", error);
      setError("Erro ao selecionar marca. Tente novamente.");
      setOpenBrand(false); // Always close popover on error
    }
  };

  // Handler for model selection with safeguards
  const handleModelChange = (value: string) => {
    try {
      console.log("Modelo selecionado código:", value);
      // Find the model in the models array, with a fallback if not found
      const selectedModelObj = models.find(model => model.codigo === value);
      const selectedModelName = selectedModelObj?.nome || '';
      console.log("Nome do modelo:", selectedModelName);
      
      form.setValue('model', selectedModelName);
      setSelectedModel(value);
      // Close the popover first to prevent rendering issues
      setOpenModel(false);
      
      // Fetch years with a delay to allow UI to update first
      setTimeout(() => {
        if (selectedBrand && value) {
          fetchYears(selectedBrand, value);
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao selecionar modelo:", error);
      setError("Erro ao selecionar modelo. Tente novamente.");
      setOpenModel(false); // Always close popover on error
    }
  };

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
      setOpenYear(false);
    } catch (error) {
      console.error("Erro ao selecionar ano:", error);
      setError("Erro ao selecionar ano. Tente novamente.");
      setOpenYear(false); // Always close popover on error
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Dados do veículo:", values);
      // Simulation of API submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: initialData ? "Veículo atualizado" : "Veículo adicionado",
        description: initialData ? "Veículo atualizado com sucesso" : "Veículo cadastrado com sucesso",
      });
      
      onSuccess(values);
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
      setError("Erro ao salvar o veículo. Tente novamente.");
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o veículo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter models based on search query
  const filteredModels = models.filter(model => 
    model.nome.toLowerCase().includes(searchModel.toLowerCase())
  );

  // Handle any errors that occurred during API calls
  if (error) {
    console.log("Erro no formulário:", error);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        {error && (
          <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        {!simplified && (
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa do Veículo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="AAA-0000 ou AAA0000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          {/* Brand Selection with Search */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <Popover open={openBrand} onOpenChange={setOpenBrand}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBrand}
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
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {/* Ensure brands is always iterable */}
                        {Array.isArray(brands) && brands.length > 0 ? (
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
                            {loadingBrands ? "Carregando marcas..." : "Nenhuma marca disponível"}
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

          {/* Model Selection with Search */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <Popover open={openModel} onOpenChange={setOpenModel}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openModel}
                        className="w-full justify-between"
                        disabled={!selectedBrand || loadingModels}
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
                          !selectedBrand ? "Selecione uma marca primeiro" : "Selecione um modelo"
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
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {/* Ensure filteredModels is always iterable */}
                        {Array.isArray(filteredModels) && filteredModels.length > 0 ? (
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
                            {loadingModels ? "Carregando modelos..." : "Nenhum modelo disponível"}
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

          {/* Year Selection with Search */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <Popover open={openYear} onOpenChange={setOpenYear}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openYear}
                        className="w-full justify-between"
                        disabled={!selectedModel || loadingYears}
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
                          !selectedModel ? "Selecione um modelo primeiro" : "Selecione o ano"
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
                        {/* Ensure years is always iterable */}
                        {Array.isArray(years) && years.length > 0 ? (
                          years.map((year) => (
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
                            {loadingYears ? "Carregando anos..." : "Nenhum ano disponível"}
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
        </div>

        {!simplified && (
          <>
            <FormField
              control={form.control}
              name="renavam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renavam</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Opcional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chassis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chassi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Opcional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onSuccess(null)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Atualizar' : 'Adicionar'} Veículo
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewVehicleForm;
