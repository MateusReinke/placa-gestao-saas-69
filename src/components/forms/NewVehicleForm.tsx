
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
});

interface NewVehicleFormProps {
  onSuccess: () => void;
}

const NewVehicleForm: React.FC<NewVehicleFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchingModel, setSearchingModel] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: '',
      model: '',
      brand: '',
      year: '',
      renavam: '',
      chassis: '',
    },
  });

  // Buscar marcas de veículos na inicialização
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas');
        if (response.ok) {
          const data = await response.json();
          setBrands(data);
        } else {
          console.error('Erro ao buscar marcas:', response.statusText);
          toast({
            title: "Erro",
            description: "Não foi possível carregar as marcas de veículos.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar marcas:', error);
      } finally {
        setLoadingBrands(false);
      }
    };
    
    fetchBrands();
  }, [toast]);

  // Buscar modelos quando uma marca é selecionada
  const fetchModels = async (brandCode: string) => {
    setLoadingModels(true);
    setModels([]);
    setYears([]);
    form.setValue('model', '');
    form.setValue('year', '');
    
    try {
      const response = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos`);
      if (response.ok) {
        const data = await response.json();
        setModels(data.modelos);
      } else {
        console.error('Erro ao buscar modelos:', response.statusText);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os modelos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar modelos:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  // Buscar anos disponíveis quando um modelo é selecionado
  const fetchYears = async (brandCode: string, modelCode: string) => {
    setLoadingYears(true);
    setYears([]);
    form.setValue('year', '');
    
    try {
      const response = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos/${modelCode}/anos`);
      if (response.ok) {
        const data = await response.json();
        setYears(data);
      } else {
        console.error('Erro ao buscar anos:', response.statusText);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os anos disponíveis.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar anos:', error);
    } finally {
      setLoadingYears(false);
    }
  };

  // Manipulador de seleção de marca
  const handleBrandChange = (value: string) => {
    form.setValue('brand', brands.find(brand => brand.codigo === value)?.nome || '');
    setSelectedBrand(value);
    fetchModels(value);
  };

  // Manipulador de seleção de modelo
  const handleModelChange = (value: string) => {
    form.setValue('model', models.find(model => model.codigo === value)?.nome || '');
    setSelectedModel(value);
    if (selectedBrand) {
      fetchYears(selectedBrand, value);
    }
  };

  // Manipulador de seleção de ano
  const handleYearChange = (value: string) => {
    form.setValue('year', years.find(year => year.codigo === value)?.nome || '');
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Simulação de envio para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Veículo adicionado",
        description: "Veículo cadastrado com sucesso",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o veículo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <Select 
                  disabled={loadingBrands} 
                  onValueChange={handleBrandChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma marca" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingBrands ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Carregando...</span>
                        </div>
                      </SelectItem>
                    ) : (
                      brands.map((brand) => (
                        <SelectItem key={brand.codigo} value={brand.codigo}>
                          {brand.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <Select 
                  disabled={!selectedBrand || loadingModels} 
                  onValueChange={handleModelChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedBrand ? "Selecione uma marca primeiro" : "Selecione um modelo"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingModels ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Carregando...</span>
                        </div>
                      </SelectItem>
                    ) : (
                      models.map((model) => (
                        <SelectItem key={model.codigo} value={model.codigo}>
                          {model.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <Select 
                  disabled={!selectedModel || loadingYears} 
                  onValueChange={handleYearChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedModel ? "Selecione um modelo primeiro" : "Selecione o ano"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingYears ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Carregando...</span>
                        </div>
                      </SelectItem>
                    ) : (
                      years.map((year) => (
                        <SelectItem key={year.codigo} value={year.codigo}>
                          {year.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar Veículo
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewVehicleForm;
