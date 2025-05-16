
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
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
import { Loader2 } from 'lucide-react';
import { ServiceType } from '@/types';

const formSchema = z.object({
  licensePlate: z.string().min(7, "Placa inválida").max(8, "Placa inválida"),
  vehicleModel: z.string().min(2, "Modelo do veículo é obrigatório"),
  vehicleYear: z.string().min(4, "Ano é obrigatório"),
  serviceTypeId: z.string().min(1, "Serviço é obrigatório"),
});

interface NewOrderFormProps {
  onSuccess: () => void;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: '',
      vehicleModel: '',
      vehicleYear: '',
      serviceTypeId: '',
    },
  });

  // Carregar os tipos de serviço disponíveis
  React.useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const types = await ApiService.getServiceTypes();
        setServiceTypes(types);
      } catch (error) {
        console.error("Erro ao carregar tipos de serviço:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os tipos de serviço",
          variant: "destructive",
        });
      } finally {
        setLoadingServiceTypes(false);
      }
    };
    
    loadServiceTypes();
  }, [toast]);

  // Buscar informações de veículo pela placa (simulado)
  const searchVehicleInfo = async (licensePlate: string) => {
    // Esta é uma simulação, em produção você usaria uma API real
    const plateFormatted = licensePlate.toUpperCase().replace(/-/g, '');
    
    // Simular espera da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Apenas para demonstração, retornamos alguns modelos baseados na placa
    const models: {[key: string]: {model: string, year: string}} = {
      'ABC1234': { model: 'Honda Civic', year: '2020' },
      'DEF5678': { model: 'Toyota Corolla', year: '2021' },
      'GHI9012': { model: 'Jeep Renegade', year: '2022' },
    };
    
    return models[plateFormatted] || null;
  };

  // Função para buscar CEP
  const searchAddressByCep = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o endereço pelo CEP",
        variant: "destructive",
      });
      return null;
    }
  };

  // Função para buscar CNPJ
  const searchCompanyByCnpj = async (cnpj: string) => {
    try {
      // API pública gratuita para consulta de CNPJ
      const formattedCnpj = cnpj.replace(/[^\d]/g, '');
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${formattedCnpj}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar dados para este CNPJ",
        variant: "destructive",
      });
      return null;
    }
  };

  // Função para lidar com busca da placa
  const handleLicensePlateBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const plate = e.target.value;
    if (plate && plate.length >= 7) {
      const vehicleInfo = await searchVehicleInfo(plate);
      if (vehicleInfo) {
        form.setValue('vehicleModel', vehicleInfo.model);
        form.setValue('vehicleYear', vehicleInfo.year);
        toast({
          title: "Veículo encontrado",
          description: `${vehicleInfo.model} (${vehicleInfo.year})`,
        });
      }
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

      // Aqui estamos simulando a criação de um pedido
      // Em uma aplicação real, você pegaria o clientId do usuário logado
      const newOrder = {
        clientId: user.id,
        serviceTypeId: values.serviceTypeId,
        statusId: "1", // Status inicial (novo)
        licensePlate: values.licensePlate,
        createdBy: user.id,
        value: Math.random() * 500 + 100, // Valor simulado
      };

      await ApiService.createOrder(newOrder);
      
      toast({
        title: "Pedido criado",
        description: "Seu pedido foi criado com sucesso",
      });
      
      onSuccess();
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

        <FormField
          control={form.control}
          name="vehicleModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo do Veículo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Honda Civic" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicleYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano do Veículo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 2022" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    </SelectItem>
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
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
