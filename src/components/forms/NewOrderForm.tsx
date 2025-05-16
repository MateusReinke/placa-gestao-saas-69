
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Order, OrderStatus, Client, Vehicle, ServiceType } from '@/types';

// Schema for the form validation
const orderSchema = z.object({
  serviceTypeId: z.string({ required_error: "Selecione um serviço" }),
  clientId: z.string({ required_error: "Selecione um cliente" }),
  licensePlate: z.string({ required_error: "Selecione um veículo" }),
  observations: z.string().optional(),
  expectedDeliveryDate: z.date().optional(),
  statusId: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface NewOrderFormProps {
  onSuccess?: (order?: Order) => void;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';
  const isClient = user?.role === 'physical' || user?.role === 'juridical';
  
  // States for the form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Form setup with zod validation
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      serviceTypeId: '',
      clientId: isClient ? user?.id || '' : '',
      licensePlate: '',
      observations: '',
      statusId: '',
    },
  });
  
  // Client form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientDocument, setNewClientDocument] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);
  
  // Vehicle form states
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleYear, setNewVehicleYear] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleColor, setNewVehicleColor] = useState('');
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  
  // Fetch initial data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedServices, fetchedStatuses] = await Promise.all([
          ApiService.getServices(),
          ApiService.getOrderStatuses(),
        ]);
        
        setServices(fetchedServices.filter(service => service.active));
        setStatuses(fetchedStatuses.filter(status => status.active));
        
        // Set default status if available
        const defaultStatus = fetchedStatuses.find(s => s.order === 1);
        if (defaultStatus) {
          form.setValue('statusId', defaultStatus.id);
        }
        
        // For clients, fetch their own vehicles
        if (isClient && user?.id) {
          const clientVehicles = await ApiService.getClientVehicles(user.id);
          setVehicles(clientVehicles);
        } 
        // For admin/seller, fetch all clients
        else if (isAdmin || isSeller) {
          const fetchedClients = await ApiService.getClients();
          setClients(fetchedClients.filter(c => c.active !== false));
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, [user, isAdmin, isSeller, isClient, form, toast]);
  
  // Fetch vehicles when client is selected
  useEffect(() => {
    const fetchVehicles = async () => {
      if (selectedClientId) {
        try {
          const clientVehicles = await ApiService.getClientVehicles(selectedClientId);
          setVehicles(clientVehicles);
        } catch (error) {
          console.error('Erro ao carregar veículos:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os veículos do cliente.",
            variant: "destructive",
          });
        }
      } else {
        setVehicles([]);
      }
    };
    
    fetchVehicles();
  }, [selectedClientId, toast]);
  
  // Handle client change
  const handleClientChange = (clientId: string) => {
    form.setValue('clientId', clientId);
    setSelectedClientId(clientId);
    form.setValue('licensePlate', ''); // Reset vehicle selection
  };
  
  // Handle vehicle change
  const handleVehicleChange = (licensePlate: string) => {
    form.setValue('licensePlate', licensePlate);
  };
  
  // Create new client
  const handleCreateClient = async () => {
    if (!newClientName || !newClientDocument) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e documento são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingClient(true);
    
    try {
      const newClient = await ApiService.createClient({
        name: newClientName,
        document: newClientDocument,
        phone: newClientPhone,
        email: newClientEmail,
        active: true,
      });
      
      setClients(prevClients => [...prevClients, newClient]);
      form.setValue('clientId', newClient.id);
      setSelectedClientId(newClient.id);
      
      // Reset form
      setNewClientName('');
      setNewClientDocument('');
      setNewClientPhone('');
      setNewClientEmail('');
      setClientDialogOpen(false);
      
      toast({
        title: "Cliente adicionado",
        description: "Cliente criado com sucesso",
      });
      
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingClient(false);
    }
  };
  
  // Create new vehicle
  const handleCreateVehicle = async () => {
    if (!newVehiclePlate || !newVehicleModel || !selectedClientId) {
      toast({
        title: "Campos obrigatórios",
        description: "Placa e modelo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingVehicle(true);
    
    try {
      const newVehicle = await ApiService.createVehicle({
        brand: newVehicleBrand,
        model: newVehicleModel,
        year: newVehicleYear,
        licensePlate: newVehiclePlate,
        color: newVehicleColor,
        clientId: selectedClientId,
      });
      
      setVehicles(prevVehicles => [...prevVehicles, newVehicle]);
      form.setValue('licensePlate', newVehiclePlate);
      
      // Reset form
      setNewVehicleBrand('');
      setNewVehicleModel('');
      setNewVehicleYear('');
      setNewVehiclePlate('');
      setNewVehicleColor('');
      setVehicleDialogOpen(false);
      
      toast({
        title: "Veículo adicionado",
        description: "Veículo criado com sucesso",
      });
      
    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o veículo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingVehicle(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get default status if not provided (for client role)
      let statusToUse = data.statusId;
      if (!statusToUse && statuses.length > 0) {
        const defaultStatus = statuses.find(s => s.order === 1);
        if (defaultStatus) {
          statusToUse = defaultStatus.id;
        }
      }
      
      // Create order object
      const orderData = {
        serviceTypeId: data.serviceTypeId,
        clientId: isClient ? user?.id || '' : data.clientId,
        licensePlate: data.licensePlate,
        observations: data.observations || '',
        expectedDeliveryDate: data.expectedDeliveryDate,
        statusId: statusToUse || '',
      };
      
      // Save order
      const createdOrder = await ApiService.createOrder(orderData);
      
      toast({
        title: "Pedido criado",
        description: "Pedido criado com sucesso",
      });
      
      if (onSuccess) {
        onSuccess(createdOrder);
      }
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pedido.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Selection */}
        <FormField
          control={form.control}
          name="serviceTypeId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Serviço</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? services.find((service) => service.id === field.value)?.name
                        : "Selecione um serviço"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Buscar serviço..." />
                    <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                    <CommandGroup>
                      {services.map((service) => (
                        <CommandItem
                          value={service.name}
                          key={service.id}
                          onSelect={() => {
                            form.setValue("serviceTypeId", service.id);
                          }}
                        >
                          {service.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Client Selection - Only for admin and seller */}
        {(isAdmin || isSeller) && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Cliente</FormLabel>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between flex-1",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? clients.find((client) => client.id === field.value)?.name
                              : "Selecione um cliente"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Buscar cliente..." />
                          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                          <CommandGroup>
                            {clients.map((client) => (
                              <CommandItem
                                value={client.name}
                                key={client.id}
                                onSelect={() => {
                                  handleClientChange(client.id);
                                }}
                              >
                                {client.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <FormLabel htmlFor="name">Nome</FormLabel>
                            <Input
                              id="name"
                              value={newClientName}
                              onChange={(e) => setNewClientName(e.target.value)}
                              placeholder="Nome do cliente"
                            />
                          </div>
                          <div className="grid gap-2">
                            <FormLabel htmlFor="document">CPF/CNPJ</FormLabel>
                            <Input
                              id="document"
                              value={newClientDocument}
                              onChange={(e) => setNewClientDocument(e.target.value)}
                              placeholder="CPF ou CNPJ"
                            />
                          </div>
                          <div className="grid gap-2">
                            <FormLabel htmlFor="phone">Telefone</FormLabel>
                            <Input
                              id="phone"
                              value={newClientPhone}
                              onChange={(e) => setNewClientPhone(e.target.value)}
                              placeholder="Telefone"
                            />
                          </div>
                          <div className="grid gap-2">
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <Input
                              id="email"
                              type="email"
                              value={newClientEmail}
                              onChange={(e) => setNewClientEmail(e.target.value)}
                              placeholder="Email"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleCreateClient} 
                          disabled={isSubmittingClient || !newClientName || !newClientDocument}
                        >
                          {isSubmittingClient ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Adicionar Cliente
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedClientId && clients.length > 0 && (
              <div className="rounded-md border p-4 bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Informações do Cliente</h4>
                {(() => {
                  const selectedClient = clients.find(c => c.id === selectedClientId);
                  return selectedClient ? (
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nome:</span> {selectedClient.name}</p>
                      <p><span className="font-medium">Documento:</span> {selectedClient.document}</p>
                      {selectedClient.phone && <p><span className="font-medium">Telefone:</span> {selectedClient.phone}</p>}
                      {selectedClient.email && <p><span className="font-medium">Email:</span> {selectedClient.email}</p>}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}
        
        {/* Vehicle Selection */}
        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Veículo</FormLabel>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!selectedClientId && !isClient}
                        className={cn(
                          "justify-between flex-1",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? vehicles.find((vehicle) => vehicle.licensePlate === field.value)?.model || field.value
                          : (isAdmin || isSeller) && !selectedClientId 
                              ? "Selecione um cliente primeiro"
                              : "Selecione um veículo"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Buscar veículo..." />
                      <CommandEmpty>
                        Nenhum veículo encontrado.
                      </CommandEmpty>
                      <CommandGroup>
                        {vehicles.map((vehicle) => (
                          <CommandItem
                            value={`${vehicle.model} - ${vehicle.licensePlate}`}
                            key={vehicle.id}
                            onSelect={() => {
                              handleVehicleChange(vehicle.licensePlate);
                            }}
                          >
                            {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                            {vehicle.color && ` (${vehicle.color})`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {(selectedClientId || isClient) && (
                  <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Veículo</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <FormLabel htmlFor="brand">Marca</FormLabel>
                          <Input
                            id="brand"
                            value={newVehicleBrand}
                            onChange={(e) => setNewVehicleBrand(e.target.value)}
                            placeholder="Marca"
                          />
                        </div>
                        <div className="grid gap-2">
                          <FormLabel htmlFor="model">Modelo</FormLabel>
                          <Input
                            id="model"
                            value={newVehicleModel}
                            onChange={(e) => setNewVehicleModel(e.target.value)}
                            placeholder="Modelo"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <FormLabel htmlFor="year">Ano</FormLabel>
                            <Input
                              id="year"
                              value={newVehicleYear}
                              onChange={(e) => setNewVehicleYear(e.target.value)}
                              placeholder="Ano"
                            />
                          </div>
                          <div className="grid gap-2">
                            <FormLabel htmlFor="color">Cor</FormLabel>
                            <Input
                              id="color"
                              value={newVehicleColor}
                              onChange={(e) => setNewVehicleColor(e.target.value)}
                              placeholder="Cor"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <FormLabel htmlFor="plate">Placa</FormLabel>
                          <Input
                            id="plate"
                            value={newVehiclePlate}
                            onChange={(e) => setNewVehiclePlate(e.target.value)}
                            placeholder="Placa"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleCreateVehicle} 
                        disabled={isSubmittingVehicle || !newVehicleModel || !newVehiclePlate}
                      >
                        {isSubmittingVehicle ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Adicionar Veículo
                      </Button>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Observations */}
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Expected Delivery Date */}
        <FormField
          control={form.control}
          name="expectedDeliveryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Prevista para Entrega</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Selection - Only for admin and seller */}
        {(isAdmin || isSeller) && (
          <FormField
            control={form.control}
            name="statusId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Status do Pedido</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? statuses.find((status) => status.id === field.value)?.name
                          : "Selecione um status"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Buscar status..." />
                      <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
                      <CommandGroup>
                        {statuses.map((status) => (
                          <CommandItem
                            value={status.name}
                            key={status.id}
                            onSelect={() => {
                              form.setValue("statusId", status.id);
                            }}
                          >
                            <div className="flex items-center">
                              <div 
                                className={`h-3 w-3 rounded-full mr-2 bg-${status.color}-500`}
                              ></div>
                              {status.name}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Criar Pedido"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default NewOrderForm;
