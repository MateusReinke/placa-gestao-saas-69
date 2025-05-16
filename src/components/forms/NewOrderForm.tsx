
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command';
import { 
  Calendar 
} from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  AlertCircle, 
  Search, 
  User, 
  Car, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  ClipboardCheck, 
  ClipboardPen, 
  X, 
  Plus 
} from 'lucide-react';
import { ServiceType, Order, Client, Vehicle } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Form validation schema
const formSchema = z.object({
  serviceTypeId: z.string().min(1, "Serviço é obrigatório"),
  clientId: z.string().min(1, "Cliente é obrigatório"),
  vehicleId: z.string().optional(),
  licensePlate: z.string().min(1, "Placa é obrigatória"),
  vehicleBrand: z.string().min(1, "Marca é obrigatória"),
  vehicleModel: z.string().min(1, "Modelo do veículo é obrigatório"),
  vehicleYear: z.string().min(1, "Ano é obrigatório"),
  vehicleColor: z.string().optional(),
  notes: z.string().optional(),
  estimatedDeliveryDate: z.date().optional(),
  statusId: z.string().optional(),
  // For quick client creation
  clientName: z.string().optional(),
  clientDocument: z.string().optional(),
  clientAddress: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email("Email inválido").optional(),
  clientType: z.enum(['physical', 'juridical']).optional(),
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
  
  // States for loading data
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statuses, setStatuses] = useState<{id: string, name: string, color: string}[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [vehicleYears, setVehicleYears] = useState<VehicleYear[]>([]);
  
  // UI control states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Dialog control states
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isNewVehicleDialogOpen, setIsNewVehicleDialogOpen] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceTypeId: '',
      clientId: user?.role === 'physical' || user?.role === 'juridical' ? user.id : '',
      vehicleId: '',
      licensePlate: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      notes: '',
      clientName: '',
      clientDocument: '',
      clientAddress: '',
      clientPhone: '',
      clientEmail: '',
      clientType: 'physical',
      statusId: '1', // Default to 'pendente'
    },
  });

  // Load service types
  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const types = await ApiService.getServiceTypes();
        setServiceTypes(types.filter(type => type.active));
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

  // Load clients (except for physical/juridical users who can only create orders for themselves)
  useEffect(() => {
    const loadClients = async () => {
      if (user?.role === 'physical' || user?.role === 'juridical') {
        setLoadingClients(false);
        return;
      }
      
      try {
        const fetchedClients = await ApiService.getClients();
        setClients(fetchedClients);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        setErrorMessage("Não foi possível carregar os clientes");
      } finally {
        setLoadingClients(false);
      }
    };
    
    loadClients();
  }, [user?.role]);

  // Load order statuses (only for admin and seller roles)
  useEffect(() => {
    const loadStatuses = async () => {
      if (user?.role !== 'admin' && user?.role !== 'seller') {
        return;
      }
      
      try {
        const fetchedStatuses = await ApiService.getOrderStatuses();
        setStatuses(fetchedStatuses);
      } catch (error) {
        console.error("Erro ao carregar status:", error);
      }
    };
    
    loadStatuses();
  }, [user?.role]);

  // Load vehicle brands
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

  // Load vehicles when a client is selected
  const loadClientVehicles = async (clientId: string) => {
    if (!clientId) return;
    
    setLoadingVehicles(true);
    try {
      const fetchedVehicles = await ApiService.getClientVehicles(clientId);
      setVehicles(fetchedVehicles);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      setErrorMessage("Não foi possível carregar os veículos deste cliente");
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Handle client selection
  const handleClientChange = (clientId: string) => {
    form.setValue('clientId', clientId);
    form.setValue('vehicleId', '');
    
    // Find the selected client
    const selectedClient = clients.find(c => c.id === clientId);
    
    // Auto-fill client information fields
    if (selectedClient) {
      form.setValue('clientName', selectedClient.name);
      form.setValue('clientDocument', selectedClient.document);
      form.setValue('clientAddress', selectedClient.address || '');
      form.setValue('clientPhone', selectedClient.phone || '');
      form.setValue('clientEmail', selectedClient.email || '');
      form.setValue('clientType', selectedClient.type);
      
      // Load vehicles for this client
      loadClientVehicles(clientId);
    }
  };

  // Handle vehicle selection
  const handleVehicleChange = (vehicleId: string) => {
    form.setValue('vehicleId', vehicleId);
    
    // Find the selected vehicle
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    
    // Auto-fill vehicle information fields
    if (selectedVehicle) {
      form.setValue('licensePlate', selectedVehicle.licensePlate);
      form.setValue('vehicleBrand', selectedVehicle.brand);
      form.setValue('vehicleModel', selectedVehicle.model);
      form.setValue('vehicleYear', selectedVehicle.year);
      form.setValue('vehicleColor', selectedVehicle.color || '');
    }
  };

  // Load models when brand is selected
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

  // Load years when model is selected
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

  // Search vehicle info by license plate
  const searchVehicleInfo = async (licensePlate: string) => {
    if (!licensePlate || licensePlate.length < 7) return;
    
    const plateFormatted = licensePlate.toUpperCase().replace(/-/g, '');
    
    // Simulate vehicle search by license plate
    // This would be a real API call in production
    const plateToModel: Record<string, {brand: string, model: string, year: string}> = {
      'ABC1234': { brand: 'chevrolet', model: 'onix', year: 'onix-2022' },
      'DEF5678': { brand: 'volkswagen', model: 'gol', year: 'gol-2021' },
      'GHI9012': { brand: 'fiat', model: 'argo', year: 'argo-2023' },
    };
    
    const vehicleInfo = plateToModel[plateFormatted];
    if (vehicleInfo) {
      // First set the brand and wait for models to load
      form.setValue('vehicleBrand', vehicleInfo.brand);
      await handleBrandChange(vehicleInfo.brand);
      
      // Then set the model and wait for years to load
      form.setValue('vehicleModel', vehicleInfo.model);
      await handleModelChange(vehicleInfo.model);
      
      // Finally set the year
      form.setValue('vehicleYear', vehicleInfo.year);
      
      toast({
        title: "Veículo encontrado",
        description: `Dados do veículo carregados automaticamente.`,
      });
    }
  };

  // Handle license plate blur event
  const handleLicensePlateBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const plate = e.target.value;
    if (plate && plate.length >= 7) {
      await searchVehicleInfo(plate);
    }
  };

  // Create new client handler
  const handleCreateNewClient = async () => {
    const clientData = {
      name: form.getValues('clientName'),
      document: form.getValues('clientDocument'),
      type: form.getValues('clientType') || 'physical',
      address: form.getValues('clientAddress'),
      phone: form.getValues('clientPhone'),
      email: form.getValues('clientEmail'),
    };
    
    try {
      const newClient = await ApiService.createClient({
        ...clientData,
        createdBy: user?.id || '',
      });
      
      // Add the new client to the list
      setClients(prev => [...prev, newClient]);
      
      // Select the new client
      form.setValue('clientId', newClient.id);
      
      setIsNewClientDialogOpen(false);
      toast({
        title: "Cliente criado",
        description: "Novo cliente adicionado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente",
        variant: "destructive"
      });
    }
  };

  // Create new vehicle handler
  const handleCreateNewVehicle = async () => {
    const clientId = form.getValues('clientId');
    if (!clientId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente antes de adicionar um veículo",
        variant: "destructive"
      });
      return;
    }
    
    const vehicleData = {
      licensePlate: form.getValues('licensePlate'),
      brand: form.getValues('vehicleBrand'),
      model: form.getValues('vehicleModel'),
      year: form.getValues('vehicleYear'),
      color: form.getValues('vehicleColor'),
      clientId: clientId,
    };
    
    try {
      const newVehicle = await ApiService.createVehicle(vehicleData);
      
      // Add the new vehicle to the list
      setVehicles(prev => [...prev, newVehicle]);
      
      // Select the new vehicle
      form.setValue('vehicleId', newVehicle.id);
      
      setIsNewVehicleDialogOpen(false);
      toast({
        title: "Veículo criado",
        description: "Novo veículo adicionado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar veículo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o veículo",
        variant: "destructive"
      });
    }
  };

  // Form submission handler
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

      // Get client data
      let clientData: Client;
      if (user.role === 'physical' || user.role === 'juridical') {
        // For physical/juridical users, use their own data
        clientData = {
          id: user.id,
          name: user.name,
          document: user.document || '00000000000', // Default value
          type: user.role as 'physical' | 'juridical',
          createdBy: user.id,
          email: user.email,
          phone: user.phone,
        };
      } else {
        // For admin/seller, use the selected client
        const selectedClient = clients.find(c => c.id === values.clientId);
        if (!selectedClient) throw new Error("Cliente não encontrado");
        clientData = selectedClient;
      }

      // Create order object
      const newOrder: Omit<Order, 'id' | 'createdAt'> = {
        clientId: clientData.id,
        serviceTypeId: values.serviceTypeId,
        serviceType: serviceType,
        statusId: values.statusId || "1", // Default to 'pendente'
        licensePlate: values.licensePlate,
        createdBy: user.id,
        value: Math.random() * 500 + 100, // Simulated value
        status: statuses.find(s => s.id === (values.statusId || "1")) || {
          id: "1",
          name: "Pendente",
          color: "yellow",
          active: true,
          order: 1
        },
        client: clientData,
        notes: values.notes,
        estimatedDeliveryDate: values.estimatedDeliveryDate?.toISOString(),
        // Include vehicle data if available
        vehicle: values.vehicleId ? vehicles.find(v => v.id === values.vehicleId) : {
          id: `VEH${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          licensePlate: values.licensePlate,
          brand: values.vehicleBrand,
          model: values.vehicleModel,
          year: values.vehicleYear,
          color: values.vehicleColor,
          clientId: clientData.id
        }
      };

      await ApiService.createOrder(newOrder);
      
      toast({
        title: "Pedido criado",
        description: "Seu pedido foi criado com sucesso",
      });
      
      // Adding id and createdAt to satisfy the Order interface in the callback
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "1": // Pendente
        return <ClipboardList className="h-4 w-4" />;
      case "2": // Em andamento
        return <ClipboardPen className="h-4 w-4" />;
      case "3": // Finalizado
        return <ClipboardCheck className="h-4 w-4" />;
      case "4": // Cancelado
        return <X className="h-4 w-4" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
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

        {/* Service Type Field */}
        <FormField
          control={form.control}
          name="serviceTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <div className="relative">
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
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Client Field */}
        {(user?.role === 'admin' || user?.role === 'seller') ? (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Cliente</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={loadingClients}
                        >
                          {loadingClients ? (
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Carregando...</span>
                            </div>
                          ) : field.value ? (
                            clients.find((client) => client.id === field.value)?.name || "Cliente"
                          ) : (
                            "Selecione um cliente"
                          )}
                          <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." className="h-9" />
                        <CommandEmpty>
                          <div className="flex flex-col items-center justify-center py-4 px-2">
                            <p className="text-sm text-muted-foreground mb-2">Nenhum cliente encontrado.</p>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setIsNewClientDialogOpen(true)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Cadastrar Novo Cliente
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {clients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.id}
                              onSelect={() => {
                                handleClientChange(client.id);
                              }}
                            >
                              <User className="mr-2 h-4 w-4" />
                              <span>{client.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {client.document}
                              </span>
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

            {/* Client Info Display */}
            {form.getValues('clientId') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md border bg-muted/40 p-4">
                <div>
                  <p className="text-sm font-medium">Nome</p>
                  <p className="text-sm">{form.getValues('clientName')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Documento</p>
                  <p className="text-sm">{form.getValues('clientDocument') || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm">{form.getValues('clientPhone') || "—"}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md border bg-muted/40 p-4">
            <div>
              <p className="text-sm font-medium">Cliente</p>
              <p className="text-sm">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Documento</p>
              <p className="text-sm">{user?.document || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Telefone</p>
              <p className="text-sm">{user?.phone || "—"}</p>
            </div>
          </div>
        )}

        {/* Vehicle Field */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Veículo</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loadingVehicles || !form.getValues('clientId')}
                      >
                        {loadingVehicles ? (
                          <div className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Carregando...</span>
                          </div>
                        ) : !form.getValues('clientId') ? (
                          "Selecione um cliente primeiro"
                        ) : field.value ? (
                          vehicles.find((vehicle) => vehicle.id === field.value)?.licensePlate || "Veículo"
                        ) : (
                          "Selecione ou cadastre um veículo"
                        )}
                        <Car className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar veículo..." className="h-9" />
                      <CommandEmpty>
                        <div className="flex flex-col items-center justify-center py-4 px-2">
                          <p className="text-sm text-muted-foreground mb-2">Nenhum veículo encontrado.</p>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsNewVehicleDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Cadastrar Novo Veículo
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {vehicles.map((vehicle) => (
                          <CommandItem
                            key={vehicle.id}
                            value={vehicle.id}
                            onSelect={() => {
                              handleVehicleChange(vehicle.id);
                            }}
                          >
                            <Car className="mr-2 h-4 w-4" />
                            <span>{vehicle.licensePlate}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {!field.value && form.getValues('clientId') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsNewVehicleDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Cadastrar Novo Veículo
                  </Button>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Manual Vehicle Entry - Always show these fields */}
          <div className="space-y-4">
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
                      disabled={!!form.getValues('vehicleId')}
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
                      value={field.value}
                      disabled={loadingBrands || !!form.getValues('vehicleId')}
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
                      value={field.value}
                      disabled={loadingModels || !form.getValues('vehicleBrand') || !!form.getValues('vehicleId')}
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
                      value={field.value}
                      disabled={loadingYears || !form.getValues('vehicleModel') || !!form.getValues('vehicleId')}
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
              
              <FormField
                control={form.control}
                name="vehicleColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Cor do veículo" 
                        disabled={!!form.getValues('vehicleId')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Estimated Delivery Date Field */}
        <FormField
          control={form.control}
          name="estimatedDeliveryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Prevista para Entrega (opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: pt })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes Field */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Observações adicionais sobre o pedido"
                  className="resize-none"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Field - Only for admin/seller */}
        {(user?.role === 'admin' || user?.role === 'seller') && (
          <FormField
            control={form.control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status do Pedido</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Status do pedido" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        <div className="flex items-center">
                          {getStatusIcon(status.id)}
                          <span className="ml-2">{status.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

      {/* New Client Dialog */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do cliente" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CPF ou CNPJ do cliente" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="clientType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cliente</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="physical">Pessoa Física</SelectItem>
                      <SelectItem value="juridical">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Endereço completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Telefone de contato" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Email do cliente" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewClientDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleCreateNewClient}
            >
              Salvar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Vehicle Dialog */}
      <Dialog open={isNewVehicleDialogOpen} onOpenChange={setIsNewVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                      value={field.value}
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
                      value={field.value}
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
                      value={field.value}
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
              name="vehicleColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cor do veículo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewVehicleDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleCreateNewVehicle}
            >
              Salvar Veículo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
};

export default NewOrderForm;
