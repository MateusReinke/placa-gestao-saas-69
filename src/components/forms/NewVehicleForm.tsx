
import React, { useState } from 'react';
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

  // Buscar informações do veículo por modelo
  const searchModelInfo = async (modelQuery: string) => {
    setSearchingModel(true);
    try {
      // Usando uma API pública de carros (simulação)
      // Em produção, você usaria uma API real de veículos
      // Exemplo: https://deividfortuna.github.io/fipe/
      
      // Simulação de API com timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Dados simulados
      const mockData = [
        { brand: 'Honda', model: 'Civic', year: '2020' },
        { brand: 'Toyota', model: 'Corolla', year: '2021' },
        { brand: 'Jeep', model: 'Renegade', year: '2022' },
        { brand: 'Fiat', model: 'Pulse', year: '2023' },
        { brand: 'Volkswagen', model: 'Golf', year: '2019' },
      ];
      
      const result = mockData.find(car => 
        car.model.toLowerCase().includes(modelQuery.toLowerCase())
      );
      
      if (result) {
        form.setValue('brand', result.brand);
        form.setValue('year', result.year);
        toast({
          title: "Modelo encontrado",
          description: `${result.brand} ${result.model} (${result.year})`,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar modelo:", error);
    } finally {
      setSearchingModel(false);
    }
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

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Modelo</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder="Ex: Civic" />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    disabled={!field.value || searchingModel}
                    onClick={() => field.value && searchModelInfo(field.value)}
                  >
                    {searchingModel ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Honda" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Ano</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 2022" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="renavam"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Renavam</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Opcional" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
