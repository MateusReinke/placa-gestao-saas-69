import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from '@/lib/supabaseClient';
import { Plus, Pencil, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { confirm } from "@/components/ui/confirm"

// Define the schema for the form
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.string().refine((value) => {
    // Allow empty string
    if (!value) {
      return true;
    }
    // Check if the value matches the pattern for a number with up to two decimal places
    return /^\d+(\.\d{1,2})?$/.test(value);
  }, {
    message: "Preço deve ser um número válido com até duas casas decimais.",
  }),
  active: z.boolean().default(true).optional(),
  service_category_id: z.string().uuid({ message: "Categoria inválida" }),
});

// Define the type for the form values
type ServiceTypeFormValues = z.infer<typeof formSchema>;

// Define the type for the service data
export type ServiceType = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  active: boolean;
  created_at: string;
  service_category_id: string;
  service_categories: {
    name: string;
  };
};

const Services = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isNewService, setIsNewService] = useState(true);
  const { toast } = useToast()

  // Initialize react-hook-form
  const form = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      active: true,
      service_category_id: "",
    },
    mode: "onChange",
  })

  // Function to fetch services from Supabase
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select(`
          id,
          name,
          description,
          price,
          active,
          created_at,
          service_category_id,
          service_categories ( name )
        `);

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast({
        title: "Erro ao buscar serviços",
        description: "Ocorreu um erro ao carregar os serviços. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format the date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  };

  // Function to fetch service categories from Supabase
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name');

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro ao buscar categorias",
        description: "Ocorreu um erro ao carregar as categorias. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to fetch services and categories on component mount
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Function to handle service creation/edit form submission
  const onSubmit = async (values: ServiceTypeFormValues) => {
    setIsLoading(true);
    try {
      const price = values.price ? parseFloat(values.price) : null;

      if (isNewService) {
        // Creating a new service
        const { error } = await supabase
          .from('service_types')
          .insert({
            name: values.name,
            description: values.description,
            price: price,
            active: values.active,
            service_category_id: values.service_category_id,
          });

        if (error) throw error;

        toast({
          title: "Serviço criado com sucesso!",
        })
      } else {
        // Editing an existing service
        const { error } = await supabase
          .from('service_types')
          .update({
            name: values.name,
            description: values.description,
            price: price,
            active: values.active,
            service_category_id: values.service_category_id,
          })
          .eq('id', selectedService?.id);

        if (error) throw error;

        toast({
          title: "Serviço atualizado com sucesso!",
        })
      }

      // Refresh services and close the drawer
      fetchServices();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast({
        title: "Erro ao salvar serviço",
        description: "Ocorreu um erro ao salvar o serviço. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle service deletion
  const deleteService = async (id: string) => {
    const confirmed = await confirm({
      title: 'Você tem certeza?',
      description: 'Esta ação irá deletar o serviço permanentemente. Você tem certeza que quer continuar?',
    });

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Serviço deletado com sucesso!",
      })

      // Refresh services
      fetchServices();
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      toast({
        title: "Erro ao deletar serviço",
        description: "Ocorreu um erro ao deletar o serviço. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const updateService = async (id: string, data: Partial<ServiceType>) => {
    setIsLoading(true);
    try {
      // Make sure 'active' is always included
      const updatedData = {
        ...data,
        active: data.active ?? true, // Default to true if not provided
      };
      
      const { error } = await supabase
        .from('service_types')
        .update(updatedData)
        .eq('id', id);
        
      if (error) throw error;
      toast.success('Serviço atualizado com sucesso!');
      fetchServices();
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('Erro ao atualizar serviço');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open the drawer in edit mode
  const openEditDrawer = (service: ServiceType) => {
    setIsNewService(false);
    setSelectedService(service);
    form.reset({
      name: service.name,
      description: service.description || "",
      price: service.price?.toString() || "",
      active: service.active,
      service_category_id: service.service_category_id,
    });
    setIsDrawerOpen(true);
  };

  // Function to open the drawer in create mode
  const openCreateDrawer = () => {
    setIsNewService(true);
    setSelectedService(null);
    form.reset({
      name: "",
      description: "",
      price: "",
      active: true,
      service_category_id: "",
    });
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <Button onClick={openCreateDrawer}><Plus className="mr-2 h-4 w-4" /> Adicionar Serviço</Button>
      </div>
      <Table>
        <TableCaption>Lista de todos os serviços.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.id}</TableCell>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.service_categories.name}</TableCell>
              <TableCell>{service.price ? service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Grátis'}</TableCell>
              <TableCell>
                <Checkbox
                  checked={service.active}
                  onCheckedChange={(checked) => {
                    if (checked !== undefined) {
                      updateService(service.id, { active: checked });
                    }
                  }}
                />
              </TableCell>
              <TableCell>{formatDate(service.created_at)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => openEditDrawer(service)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteService(service.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Deletar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isNewService ? 'Criar Serviço' : 'Editar Serviço'}</DrawerTitle>
            <DrawerDescription>
              {isNewService ? 'Crie um novo serviço.' : 'Edite o serviço existente.'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do serviço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição do serviço"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço</FormLabel>
                      <FormControl>
                        <Input placeholder="Preço do serviço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Ativo</FormLabel>
                        <FormDescription>
                          Defina se o serviço está ativo ou não.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DrawerFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (isNewService ? 'Criando...' : 'Salvando...') : (isNewService ? 'Criar' : 'Salvar')}
                  </Button>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Services;
