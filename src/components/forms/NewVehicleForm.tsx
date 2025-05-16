
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
import { Loader2 } from 'lucide-react';
import BrandSelector from '@/components/vehicles/BrandSelector';
import ModelSelector from '@/components/vehicles/ModelSelector';
import YearSelector from '@/components/vehicles/YearSelector';

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
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
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
          {/* Brand Selector Component */}
          <BrandSelector 
            form={form} 
            onBrandSelect={(brandCode) => setSelectedBrand(brandCode)} 
            isLoading={isLoading}
          />

          {/* Model Selector Component */}
          <ModelSelector 
            form={form} 
            brandCode={selectedBrand} 
            onModelSelect={(modelCode) => setSelectedModel(modelCode)} 
            isLoading={isLoading}
          />

          {/* Year Selector Component */}
          <YearSelector 
            form={form} 
            brandCode={selectedBrand} 
            modelCode={selectedModel} 
            isLoading={isLoading}
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
