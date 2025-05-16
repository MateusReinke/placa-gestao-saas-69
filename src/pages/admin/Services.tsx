
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ApiService } from '@/services/api';
import { ServiceType } from '@/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Preço deve ser um valor positivo"),
  category: z.string().min(1, "Categoria é obrigatória"),
  items: z.string().optional(),
  active: z.boolean().default(true),
});

const AdminServices = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      items: '',
      active: true,
    },
  });

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getServiceTypes();
        setServices(data);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os serviços.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [toast]);

  const handleOpenDialog = (service?: ServiceType) => {
    if (service) {
      // Modo de edição
      setIsEditMode(true);
      setCurrentServiceId(service.id);
      form.reset({
        name: service.name,
        description: service.description || '',
        // Valores simulados, pois o modelo de dados não inclui todos estes campos
        price: 195, // Valor simulado
        category: 'Emplacamento', // Valor simulado
        items: 'Placa Mercosul, Lacre', // Valor simulado
        active: service.active,
      });
    } else {
      // Modo de criação
      setIsEditMode(false);
      setCurrentServiceId(null);
      form.reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        items: '',
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    try {
      await ApiService.deleteServiceType(id);
      setServices(services.filter(service => service.id !== id));
      toast({
        title: "Serviço removido",
        description: "Serviço removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o serviço.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const serviceData = {
      name: values.name,
      description: values.description,
      active: values.active,
      // Outros campos seriam adicionados aqui se o modelo de dados os suportasse
    };

    try {
      if (isEditMode && currentServiceId) {
        // Atualizar serviço existente
        const updated = await ApiService.updateServiceType(currentServiceId, serviceData);
        setServices(services.map(service => 
          service.id === currentServiceId ? { ...service, ...updated } : service
        ));
        toast({
          title: "Serviço atualizado",
          description: "Serviço atualizado com sucesso.",
        });
      } else {
        // Criar novo serviço
        const created = await ApiService.createServiceType(serviceData);
        setServices([...services, created]);
        toast({
          title: "Serviço adicionado",
          description: "Serviço adicionado com sucesso.",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-primary/30"></div>
            <div className="mt-4 text-muted-foreground">Carregando...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Serviços</h1>
          <Button className="flex gap-2" onClick={() => handleOpenDialog()}>
            <PlusCircle className="h-4 w-4" />
            <span>Novo Serviço</span>
          </Button>
        </div>
        
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Items do Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">R$ 195,00</td>
                  <td className="px-6 py-4 whitespace-nowrap">Emplacamento</td>
                  <td className="px-6 py-4 whitespace-nowrap">Placa Mercosul, Lacre</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {service.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDialog(service)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover serviço</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o serviço "{service.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteService(service.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhum serviço cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de criação/edição de serviço */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações para {isEditMode ? 'atualizar o' : 'adicionar um novo'} serviço.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Emplacamento Padrão Mercosul" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Emplacamento">Emplacamento</SelectItem>
                          <SelectItem value="Documentação">Documentação</SelectItem>
                          <SelectItem value="Legalização">Legalização</SelectItem>
                          <SelectItem value="Inspeção">Inspeção</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Breve descrição do serviço" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itens do Estoque (separados por vírgula)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Placa Mercosul, Lacre" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditMode ? 'Atualizar' : 'Adicionar'} Serviço
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminServices;
