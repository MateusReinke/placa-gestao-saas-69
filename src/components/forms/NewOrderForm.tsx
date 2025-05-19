// src/components/forms/NewOrderForm.tsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import {
  FipeService,
  FipeBrand,
  FipeModel,
  FipeYear,
} from "@/services/fipeApi";

// ————— Helper para exibir erros do PostgREST —————
function showPostgrestError(
  error: { message: string; code?: string; details?: string; hint?: string },
  toast: (opts: {
    title: string;
    description?: string;
    variant?: string;
  }) => void
) {
  let description = error.message;
  if (error.details) description += `\nDetalhes: ${error.details}`;
  if (error.hint) description += `\nSugestão: ${error.hint}`;

  toast({
    title: `Erro (code: ${error.code ?? "?"})`,
    description,
    variant: "destructive",
  });
}

// ————— Tipagens —————————————————————————————————
type OrderStatus = {
  id: string;
  name: string;
  sort_order: number;
  color: string;
  active?: boolean;
};
type Client = {
  id: string;
  name: string;
  document: string;
  phone?: string;
  email?: string;
  type?: string;
  active?: boolean;
};
type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year?: string;
  license_plate: string;
  color?: string;
  renavam?: string | null;
  client_id: string;
  plate_type_id: string;
};
type ServiceType = { id: string; name: string; active?: boolean };
type PlateType = { id: string; code: string; label: string; color: string };

const orderSchema = z.object({
  serviceTypeId: z.string({ required_error: "Selecione um serviço" }),
  clientId: z.string({ required_error: "Selecione um cliente" }),
  licensePlate: z.string({ required_error: "Selecione um veículo" }),
  observations: z.string().optional(),
  expectedDeliveryDate: z.date().optional(),
  statusId: z.string().optional(),
});
type OrderFormValues = z.infer<typeof orderSchema>;

const colorOptions = ["Branco", "Preto", "Prata", "Vermelho", "Azul", "Outro"];

interface NewOrderFormProps {
  onSuccess?: (order?: any) => void;
}

export default function NewOrderForm({ onSuccess }: NewOrderFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";
  const isClient = ["physical", "juridical"].includes(user?.role ?? "");

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      serviceTypeId: "",
      clientId: isClient ? user?.id || "" : "",
      licensePlate: "",
      observations: "",
      statusId: "",
    },
  });

  // — States gerais —————————————————————————————————
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [plateTypes, setPlateTypes] = useState<PlateType[]>([]);

  // — FIPE ————————————————————————————————————————
  const [brands, setBrands] = useState<FipeBrand[]>([]);
  const [models, setModels] = useState<FipeModel[]>([]);
  const [years, setYears] = useState<FipeYear[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPlateTypeId, setSelectedPlateTypeId] = useState("");

  // — Diálogos ————————————————————————————————————
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);

  // — Novo cliente —————————————————————————————
  const [newClientName, setNewClientName] = useState("");
  const [newClientDocument, setNewClientDocument] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  // — Novo veículo —————————————————————————————
  const [newVehiclePlate, setNewVehiclePlate] = useState("");
  const [newVehicleRenavam, setNewVehicleRenavam] = useState("");
  const [newVehicleColor, setNewVehicleColor] = useState("");
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  // — Seleções ————————————————————————————————
  const [selectedClientId, setSelectedClientId] = useState<string>(
    isClient ? user?.id || "" : ""
  );

  // — Carrega dados iniciais —————————————————————
  useEffect(() => {
    (async () => {
      try {
        // serviços ativos
        const { data: svc } = await supabase
          .from("service_types")
          .select("*")
          .eq("active", true);
        setServices(svc ?? []);

        // statuses
        const { data: sts } = await supabase
          .from("order_statuses")
          .select("*")
          .order("sort_order", { ascending: true });
        setStatuses((sts ?? []).filter((s) => s.active !== false));
        const def = sts?.find((s) => s.sort_order === 1);
        if (def) form.setValue("statusId", def.id);

        // tipos de placa
        const { data: pt } = await supabase.from("plate_types").select("*");
        setPlateTypes(pt ?? []);

        // clients / vehicles
        if (isClient && user?.id) {
          // busca client_id vinculado
          const { data: c } = await supabase
            .from("clients")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);
          const cid = c?.[0]?.id;
          if (cid) {
            setSelectedClientId(cid);
            form.setValue("clientId", cid);
            const { data: v } = await supabase
              .from("vehicles")
              .select("*")
              .eq("client_id", cid);
            setVehicles(v ?? []);
          }
        } else if (isAdmin || isSeller) {
          const { data: cl } = await supabase
            .from("clients")
            .select("*")
            .eq("active", true);
          setClients(cl ?? []);
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados iniciais:", err);
        showPostgrestError(err, toast);
      }
    })();
  }, [user]);

  // — FIPE: Carrega marcas quando abre diálogo —————
  useEffect(() => {
    if (vehicleDialogOpen) {
      FipeService.getBrands()
        .then(setBrands)
        .catch((err) => {
          console.error("FIPE getBrands:", err);
          toast({
            title: "Erro FIPE",
            description: err.message,
            variant: "destructive",
          });
        });
    }
  }, [vehicleDialogOpen]);

  // — FIPE: Modelos & anos ——————————————————————
  useEffect(() => {
    if (selectedBrand) {
      FipeService.getModels(selectedBrand)
        .then(setModels)
        .catch((err) => {
          console.error("FIPE getModels:", err);
          toast({
            title: "Erro FIPE",
            description: err.message,
            variant: "destructive",
          });
        });
    } else {
      setModels([]);
      setSelectedModel("");
    }
    setYears([]);
    setSelectedYear("");
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedBrand && selectedModel) {
      FipeService.getYears(selectedBrand, selectedModel)
        .then(setYears)
        .catch((err) => {
          console.error("FIPE getYears:", err);
          toast({
            title: "Erro FIPE",
            description: err.message,
            variant: "destructive",
          });
        });
    } else {
      setYears([]);
      setSelectedYear("");
    }
  }, [selectedBrand, selectedModel]);

  // — Helpers ————————————————————————————————————
  const handleClientChange = async (cid: string) => {
    form.setValue("clientId", cid);
    setSelectedClientId(cid);
    form.setValue("licensePlate", "");
    try {
      const { data: v } = await supabase
        .from("vehicles")
        .select("*")
        .eq("client_id", cid);
      setVehicles(v ?? []);
    } catch (err: any) {
      console.error("Erro ao carregar veículos:", err);
      showPostgrestError(err, toast);
    }
  };

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
      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            name: newClientName,
            document: newClientDocument,
            phone: newClientPhone,
            email: newClientEmail,
            created_by: user!.id,
            type: "physical",
            active: true,
          },
        ])
        .select();
      if (error) throw error;
      const created = data![0];
      setClients((c) => [...c, created]);
      handleClientChange(created.id);
      setClientDialogOpen(false);
      toast({ title: "Cliente adicionado." });
      setNewClientName("");
      setNewClientDocument("");
      setNewClientPhone("");
      setNewClientEmail("");
    } catch (err: any) {
      console.error("Erro criar cliente:", err);
      showPostgrestError(err, toast);
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (
      !newVehiclePlate ||
      !selectedBrand ||
      !selectedModel ||
      !selectedYear ||
      !selectedPlateTypeId ||
      !selectedClientId
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha placa, tipo, marca, modelo e ano.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmittingVehicle(true);
    try {
      const marca = brands.find((b) => b.codigo === selectedBrand)?.nome || "";
      const modelo = models.find((m) => m.codigo === selectedModel)?.nome || "";
      const { data, error } = await supabase
        .from("vehicles")
        .insert([
          {
            brand: marca,
            model: modelo,
            year: selectedYear,
            license_plate: newVehiclePlate,
            color: newVehicleColor,
            renavam: newVehicleRenavam || null,
            client_id: selectedClientId,
            plate_type_id: selectedPlateTypeId,
          },
        ])
        .select();
      if (error) throw error;
      const created = data![0];
      setVehicles((v) => [...v, created]);
      form.setValue("licensePlate", created.license_plate);
      setVehicleDialogOpen(false);
      toast({ title: "Veículo adicionado." });
      // limpa campos
      setSelectedBrand("");
      setSelectedModel("");
      setSelectedYear("");
      setNewVehiclePlate("");
      setNewVehicleRenavam("");
      setNewVehicleColor("");
      setSelectedPlateTypeId("");
    } catch (err: any) {
      console.error("Erro criar veículo:", err);
      showPostgrestError(err, toast);
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      let sid = data.statusId;
      if (!sid && statuses.length)
        sid = statuses.find((s) => s.sort_order === 1)!.id;
      const payload = {
        service_type_id: data.serviceTypeId,
        client_id: isClient ? selectedClientId : data.clientId,
        license_plate: data.licensePlate,
        notes: data.observations || "",
        estimated_delivery_date: data.expectedDeliveryDate
          ? format(data.expectedDeliveryDate, "yyyy-MM-dd")
          : null,
        status_id: sid!,
        value: 0,
        created_by: user!.id,
      };
      const { data: od, error } = await supabase
        .from("orders")
        .insert([payload])
        .select();
      if (error) throw error;
      toast({ title: "Pedido criado com sucesso." });
      onSuccess?.(od![0]);
      form.reset();
    } catch (err: any) {
      console.error("Erro criar pedido:", err);
      showPostgrestError(err, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  // — Render do formulário ——————————————————————————
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* SERVIÇO */}
        <FormField
          control={form.control}
          name="serviceTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between w-full",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? services.find((s) => s.id === field.value)?.name
                        : "Selecione um serviço"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command onValueChange={field.onChange}>
                    <CommandInput placeholder="Buscar serviço..." />
                    <CommandList>
                      <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                      <CommandGroup>
                        {services.map((s) => (
                          <CommandItem key={s.id} value={s.id}>
                            {s.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CLIENTE (admin/seller) */}
        {(isAdmin || isSeller) && (
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
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
                            ? clients.find((c) => c.id === field.value)?.name
                            : "Selecione um cliente"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command onValueChange={handleClientChange}>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandList>
                          <CommandEmpty>
                            Nenhum cliente encontrado.
                          </CommandEmpty>
                          <CommandGroup>
                            {clients.map((c) => (
                              <CommandItem key={c.id} value={c.id}>
                                {c.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Dialog
                    open={clientDialogOpen}
                    onOpenChange={setClientDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo Cliente</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <FormLabel>Nome</FormLabel>
                        <Input
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                        />
                        <FormLabel>Documento</FormLabel>
                        <Input
                          value={newClientDocument}
                          onChange={(e) => setNewClientDocument(e.target.value)}
                        />
                        <FormLabel>Telefone</FormLabel>
                        <Input
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(e.target.value)}
                        />
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          value={newClientEmail}
                          onChange={(e) => setNewClientEmail(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleCreateClient}
                        disabled={isSubmittingClient}
                      >
                        {isSubmittingClient && (
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        )}
                        Adicionar Cliente
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* VEÍCULO */}
        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
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
                          ? vehicles.find(
                              (v) => v.license_plate === field.value
                            )?.model || field.value
                          : "Selecione um veículo"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command onValueChange={field.onChange}>
                      <CommandInput placeholder="Buscar veículo..." />
                      <CommandList>
                        <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                        <CommandGroup>
                          {vehicles.map((v) => (
                            <CommandItem key={v.id} value={v.license_plate}>
                              {v.brand} {v.model} – {v.license_plate}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Dialog
                  open={vehicleDialogOpen}
                  onOpenChange={setVehicleDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!selectedClientId && !isClient}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Veículo</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FormLabel>Tipo de Placa</FormLabel>
                      <select
                        value={selectedPlateTypeId}
                        onChange={(e) => setSelectedPlateTypeId(e.target.value)}
                        className="bg-background text-foreground border rounded px-3 py-2 w-full"
                      >
                        <option value="">Selecione o tipo</option>
                        {plateTypes.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.label}
                          </option>
                        ))}
                      </select>

                      <FormLabel>Marca</FormLabel>
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-background text-foreground border rounded px-3 py-2 w-full"
                      >
                        <option value="">Selecione a marca</option>
                        {brands.map((b) => (
                          <option key={b.codigo} value={b.codigo}>
                            {b.nome}
                          </option>
                        ))}
                      </select>

                      <FormLabel>Modelo</FormLabel>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        disabled={!selectedBrand}
                        className="bg-background text-foreground border rounded px-3 py-2 w-full"
                      >
                        <option value="">Selecione o modelo</option>
                        {models.map((m) => (
                          <option key={m.codigo} value={m.codigo}>
                            {m.nome}
                          </option>
                        ))}
                      </select>

                      <FormLabel>Ano</FormLabel>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        disabled={!selectedModel}
                        className="bg-background text-foreground border rounded px-3 py-2 w-full"
                      >
                        <option value="">Selecione o ano</option>
                        {years.map((y) => (
                          <option key={y.codigo} value={y.nome}>
                            {y.nome}
                          </option>
                        ))}
                      </select>

                      <FormLabel>Placa</FormLabel>
                      <Input
                        placeholder="AAA1A11"
                        value={newVehiclePlate}
                        onChange={(e) => setNewVehiclePlate(e.target.value)}
                      />

                      <FormLabel>Renavam (opcional)</FormLabel>
                      <Input
                        placeholder="Renavam"
                        value={newVehicleRenavam}
                        onChange={(e) => setNewVehicleRenavam(e.target.value)}
                      />

                      <FormLabel>Cor</FormLabel>
                      <select
                        value={newVehicleColor}
                        onChange={(e) => setNewVehicleColor(e.target.value)}
                        className="bg-background text-foreground border rounded px-3 py-2 w-full"
                      >
                        <option value="">Selecione a cor</option>
                        {colorOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={handleCreateVehicle}
                      disabled={isSubmittingVehicle}
                    >
                      {isSubmittingVehicle && (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      )}
                      Adicionar Veículo
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* OBSERVAÇÕES */}
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Observações adicionais" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DATA PREVISTA */}
        <FormField
          control={form.control}
          name="expectedDeliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Prevista para Entrega</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-between w-full",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? format(field.value, "dd/MM/yyyy")
                        : "Selecione uma data"}
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(d) =>
                      d < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* STATUS */}
        {(isAdmin || isSeller) && (
          <FormField
            control={form.control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status do Pedido</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? statuses.find((s) => s.id === field.value)?.name
                          : "Selecione um status"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command onValueChange={field.onChange}>
                      <CommandInput placeholder="Buscar status..." />
                      <CommandList>
                        <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
                        <CommandGroup>
                          {statuses.map((s) => (
                            <CommandItem key={s.id} value={s.id}>
                              <span
                                className="inline-block mr-2 w-3 h-3 rounded-full"
                                style={{ backgroundColor: s.color }}
                              />
                              {s.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* BOTÃO CRIAR */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Processando...
            </>
          ) : (
            "Criar Pedido"
          )}
        </Button>
      </form>
    </Form>
  );
}
