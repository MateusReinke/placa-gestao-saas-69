
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Search } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  document: z.string().min(11, "CPF/CNPJ inválido"),
  type: z.enum(['physical', 'juridical']),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

interface NewClientFormProps {
  onSuccess: () => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [searchingDocument, setSearchingDocument] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      document: '',
      type: 'physical',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
      state: '',
    },
  });

  // Função para buscar CEP
  const handleSearchCep = async () => {
    const cep = form.getValues('postalCode');
    if (!cep || cep.length < 8) {
      toast({
        title: "CEP inválido",
        description: "Por favor, digite um CEP válido",
        variant: "destructive",
      });
      return;
    }

    setSearchingCep(true);
    try {
      const formattedCep = cep.replace(/[^\d]/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${formattedCep}/json/`);
      
      if (!response.ok) throw new Error('CEP não encontrado');
      
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado",
          variant: "destructive",
        });
        return;
      }
      
      form.setValue('address', `${data.logradouro}, ${data.bairro}`);
      form.setValue('city', data.localidade);
      form.setValue('state', data.uf);
      
      toast({
        title: "Endereço encontrado",
        description: `${data.logradouro}, ${data.bairro}, ${data.localidade}-${data.uf}`,
      });
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o endereço",
        variant: "destructive",
      });
    } finally {
      setSearchingCep(false);
    }
  };

  // Função para buscar CNPJ
  const handleSearchDocument = async () => {
    const document = form.getValues('document');
    const type = form.getValues('type');
    
    if (!document || document.length < 14 || type !== 'juridical') {
      if (type !== 'juridical') {
        toast({
          title: "Tipo incorreto",
          description: "A busca de CNPJ só está disponível para Pessoa Jurídica",
          variant: "destructive",
        });
      } else {
        toast({
          title: "CNPJ inválido",
          description: "Por favor, digite um CNPJ válido",
          variant: "destructive",
        });
      }
      return;
    }

    setSearchingDocument(true);
    try {
      const formattedCnpj = document.replace(/[^\d]/g, '');
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${formattedCnpj}`);
      
      if (!response.ok) throw new Error('CNPJ não encontrado');
      
      const data = await response.json();
      
      form.setValue('name', data.razao_social);
      form.setValue('email', data.email || '');
      form.setValue('phone', data.ddd_telefone_1 || '');
      
      // Se tiver endereço completo
      if (data.cep) {
        form.setValue('postalCode', data.cep);
        form.setValue('address', `${data.logradouro}, ${data.numero}, ${data.bairro}`);
        form.setValue('city', data.municipio);
        form.setValue('state', data.uf);
      }
      
      toast({
        title: "Empresa encontrada",
        description: data.razao_social,
      });
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar os dados da empresa",
        variant: "destructive",
      });
    } finally {
      setSearchingDocument(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um cliente",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fullAddress = values.address && values.city ?
        `${values.address}, ${values.city}${values.state ? `-${values.state}` : ''}` : 
        undefined;
      
      const newClient = {
        name: values.name,
        document: values.document,
        type: values.type,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: fullAddress,
        createdBy: user.id,
      };

      await ApiService.createClient(newClient);
      
      toast({
        title: "Cliente criado",
        description: "Cliente cadastrado com sucesso",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente",
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
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Cliente</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="physical" id="type-physical" />
                    <label htmlFor="type-physical" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Pessoa Física
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="juridical" id="type-juridical" />
                    <label htmlFor="type-juridical" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Pessoa Jurídica
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-start">
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{form.watch('type') === 'physical' ? 'CPF' : 'CNPJ'}</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder={form.watch('type') === 'physical' ? '123.456.789-00' : '12.345.678/0001-90'} />
                  </FormControl>
                  {form.watch('type') === 'juridical' && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      disabled={!field.value || field.value.length < 14 || searchingDocument}
                      onClick={handleSearchDocument}
                    >
                      {searchingDocument ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{form.watch('type') === 'physical' ? 'Nome Completo' : 'Razão Social'}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={form.watch('type') === 'physical' ? 'João da Silva' : 'Empresa LTDA'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="exemplo@email.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="(11) 98765-4321" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 items-start">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem className="w-40">
                <FormLabel>CEP</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder="00000-000" />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    disabled={!field.value || field.value.length < 8 || searchingCep}
                    onClick={handleSearchCep}
                  >
                    {searchingCep ? (
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
            name="address"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Rua, número, bairro" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="São Paulo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="w-20">
                <FormLabel>UF</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="SP" maxLength={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar Cliente
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewClientForm;
