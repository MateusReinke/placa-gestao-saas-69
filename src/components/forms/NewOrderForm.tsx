import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { getBrands, getModelsByBrand, getYearsByModel } from '@/services/vehicleData';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { ServiceType, Order, Client } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  licensePlate: z.string().min(7, "Placa inválida").max(8, "Placa inválida"),
  vehicleBrand: z.string().min(1, "Marca é obrigatória"),
  vehicleModel: z.string().min(1, "Modelo do veículo é obrigatório"),
  vehicleYear: z.string().min(1, "Ano é obrigatório"),
  serviceTypeId: z.string().min(1, "Serviço é obrigatório"),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  notes: z.string().optional(),
});

interface NewOrderFormProps {
  onSuccess: (order?: Order) => void;
}

interface VehicleBrand {
  code: string;
  name: string;
}

interface VehicleModel {
  code: string;
  name: string;
  brand: string;
}

interface VehicleYear {
  code: string;
  name: string;
  model: string;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [vehicleYears, setVehicleYears] = useState<VehicleYear[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: '',
      serviceTypeId: '',
      clientName: '',
      clientContact: '',
      notes: '',
    },
  });

  // Carregar os tipos de serviço disponíveis
  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const types = await ApiService.getServiceTypes();
        setServiceTypes(types);
        setErrorMessage(null);
      } catch (error) {
        console.error("Erro ao carregar tipos de serviço:", error);
        setErrorMessage("Não foi possível carregar os tipos de serviço");
      } finally {
        setLoadingServiceTypes(false);
      }
    };
    
    loadServiceTypes();
  }, []);

  // Carregar as marcas de veículos
  useEffect(() => {
    const loadVehicleBrands = async () => {
      try {
        const brands = await getBrands();
        setVehicleBrands(brands);
        setErrorMessage(null);
      } catch (error) {
        console.error("Erro ao carregar marcas de veículos:", error);
        setErrorMessage("Não foi possível carregar as marcas de veículos");
      } finally {
        setLoadingBrands(false);
      }
    };
    
    loadVehicleBrands();
  }, []);

  // Carregar modelos quando a marca for selecionada
  const handleBrandChange = async (brandCode: string) => {
    form.setValue('vehicleModel', '');
    form.setValue('vehicleYear', '');
    setVehicleModels([]);
    setVehicleYears([]);
    
    if (!brandCode) return;
    
    setLoadingModels(true);
    try {
      const models = await getModelsByBrand(brandCode);
      setVehicleModels(models);
      setErrorMessage(null);
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
      setErrorMessage("Não foi possível carregar os modelos para esta marca");
    } finally {
      setLoadingModels(false);
    }
  };

  // Carregar anos quando o modelo for selecionado
  const handleModelChange = async (modelCode: string) => {
    form.setValue('vehicleYear', '');
    setVehicleYears([]);
    
    if (!modelCode) return;
    
    setLoadingYears(true);
    try {
      const years = await getYearsByModel(modelCode);
      setVehicleYears(years);
      setErrorMessage(null);
    } catch (error) {
      console.error("Erro ao carregar anos:", error);
      setErrorMessage("Não foi possível carregar os anos para este modelo");
    } finally {
      setLoadingYears(false);
    }
  };

  // Função para buscar veículo pela placa
  const searchVehicleInfo = async (licensePlate: string) => {
    if (!licensePlate || licensePlate.length < 7) return;
    
    const plateFormatted = licensePlate.toUpperCase().replace(/-/g, '');
    
    // Simulação de busca por placa
    // Em produção, isto seria uma chamada de API real
    const plateToModel: Record<string, {brand: string, model: string, year: string}> = {
      'ABC1234': { brand: 'chevrolet', model: 'onix', year: 'onix-2022' },
      'DEF5678': { brand: 'volkswagen', model: 'gol', year: 'gol-2021' },
      'GHI9012': { brand: 'fiat', model: 'argo', year: 'argo-2023' },
    };
    
    const vehicleInfo = plateToModel[plateFormatted];
    if (vehicleInfo) {
      // Primeiro definimos a marca e esperamos os modelos carregarem
      form.setValue('vehicleBrand', vehicleInfo.brand);
      await handleBrandChange(vehicleInfo.brand);
      
      // Depois definimos o modelo e esperamos os anos carregarem
      form.setValue('vehicleModel', vehicleInfo.model);
      await handleModelChange(vehicleInfo.model);
      
      // Por fim definimos o ano
      form.setValue('vehicleYear', vehicleInfo.year);
      
      toast({
        title: "Veículo encontrado",
        description: `Dados do veículo carregados automaticamente.`,
      });
    }
  };

  // Função para lidar com busca da placa quando o usuário sai do campo
  const handleLicensePlateBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const plate = e.target.value;
    if (plate && plate.length >= 7) {
      await searchVehicleInfo(plate);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um pedido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const serviceType = serviceTypes.find(type => type.id === values.serviceTypeId);
      if (!serviceType) throw new Error("Tipo de serviço não encontrado");

      // Obter o nome do modelo para exibição
      const selectedModel = vehicleModels.find(m => m.code === values.vehicleModel);
      const selectedYear = vehicleYears.find(y => y.code === values.vehicleYear);
      const vehicleDisplay = selectedModel ? `${selectedModel.name} (${selectedYear?.name || ''})` : '';

      // Criando um cliente que satisfaz a interface Client
      const clientData: Client = {
        id: user.id,
        name: values.clientName || user.name || 'Cliente',
        document: user.document || '00000000000', // Valor padrão para documento
        type: 'physical', // Tipo padrão
        createdBy: user.id,
        email: user.email || '',
        phone: values.clientContact || '',
      };

      // Aqui estamos simulando a criação de um pedido
      const newOrder: Omit<Order, 'id' | 'createdAt'> = {
        clientId: user.id,
        serviceTypeId: values.serviceTypeId,
        serviceType: serviceType,
        statusId: "1", // Status inicial (novo)
        licensePlate: values.licensePlate,
        createdBy: user.id,
        value: Math.random() * 500 + 100, // Valor simulado
        status: {
          id: "1",
          name: "Novo",
          color: "blue",
          active: true,
          order: 1
        },
        client: clientData
      };

      await ApiService.createOrder(newOrder);
      
      toast({
        title: "Pedido criado",
        description: "Seu pedido foi criado com sucesso",
      });
      
      // Adicionando id e createdAt para satisfazer a interface Order no callback
      const orderWithId: Order = {
        ...newOrder,
        id: `ORD${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        createdAt: new Date().toISOString()
      };
      
      onSuccess(orderWithId);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pedido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa do Veículo</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="AAA-0000 ou AAA0000" 
                  onBlur={handleLicensePlateBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="vehicleBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleBrandChange(value);
                  }} 
                  defaultValue={field.value}
                  disabled={loadingBrands}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingBrands ? (
                      <div className="flex items-center p-2">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      vehicleBrands.map((brand) => (
                        <SelectItem key={brand.code} value={brand.code}>
                          {brand.name}
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
            name="vehicleModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleModelChange(value);
                  }} 
                  defaultValue={field.value}
                  disabled={loadingModels || !form.getValues('vehicleBrand')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingModels ? (
                      <div className="flex items-center p-2">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : vehicleModels.length > 0 ? (
                      vehicleModels.map((model) => (
                        <SelectItem key={model.code} value={model.code}>
                          {model.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        {form.getValues('vehicleBrand') 
                          ? "Nenhum modelo disponível para esta marca" 
                          : "Selecione uma marca primeiro"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loadingYears || !form.getValues('vehicleModel')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingYears ? (
                      <div className="flex items-center p-2">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : vehicleYears.length > 0 ? (
                      vehicleYears.map((year) => (
                        <SelectItem key={year.code} value={year.code}>
                          {year.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        {form.getValues('vehicleModel') 
                          ? "Nenhum ano disponível para este modelo" 
                          : "Selecione um modelo primeiro"}
                      </div>
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
          name="serviceTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={loadingServiceTypes}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingServiceTypes ? (
                    <div className="flex items-center p-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  ) : (
                    serviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
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
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cliente (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome do cliente" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contato do Cliente (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Telefone ou email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Observações adicionais" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onSuccess()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Pedido
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewOrderForm;
