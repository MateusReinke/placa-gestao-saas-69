// src/components/forms/NewOrderForm.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

import { ApiService } from "@/services/serviceTypesApi";
import { OrderStatusesService } from "@/services/orderStatusesApi";
import { ClientsService } from "@/services/clientsApi";
import { VehicleService } from "@/services/vehiclesApi";
import { OrdersService } from "@/services/ordersApi";

import NewVehicleForm from "@/components/forms/NewVehicleForm";

// --- validação com Zod ---
const orderSchema = z.object({
  serviceTypeId: z.string().nonempty("Selecione um serviço"),
  clientId: z.string().optional(),
  licensePlate: z.string().nonempty("Selecione um veículo"),
  observations: z.string().optional(),
  expectedDeliveryDate: z.date().optional(),
  statusId: z.string().optional(),
});
type OrderFormValues = z.infer<typeof orderSchema>;

export default function NewOrderForm({
  onSuccess,
}: {
  onSuccess?: (order: any) => void;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";
  const isClient = !isAdmin && !isSeller;

  // pega TUDO do RHF
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      serviceTypeId: "",
      clientId: "",
      licensePlate: "",
      observations: "",
      expectedDeliveryDate: undefined,
      statusId: "",
    },
  });
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const selectedClientId = watch("clientId");

  // dados carregados
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [vehicles, setVehicles] = useState<
    { id: string; model: string; license_plate: string }[]
  >([]);
  const [statuses, setStatuses] = useState<{ id: string; name: string }[]>([]);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);

  // carrega serviços, status, e clientes/veículos iniciais
  useEffect(() => {
    (async () => {
      try {
        const [svc, sts] = await Promise.all([
          ApiService.getServiceTypes(),
          OrderStatusesService.getOrderStatuses(),
        ]);
        setServices(svc.filter((s) => s.active));
        setStatuses(sts);
        if (sts[0]) setValue("statusId", sts[0].id);

        if (isClient && user?.id) {
          const { data: me } = await supabase
            .from("clients")
            .select("id")
            .eq("user_id", user.id)
            .single();
          setValue("clientId", me.id);
          const myV = await VehicleService.getClientVehicles(me.id);
          setVehicles(myV);
        } else if (isAdmin || isSeller) {
          const allC = await ClientsService.getClients();
          setClients(allC);
        }
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Erro ao carregar dados",
          description: err.message,
          variant: "destructive",
        });
      }
    })();
  }, [user, isClient, isAdmin, isSeller, setValue, toast]);

  // recarrega veículos ao trocar cliente
  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      try {
        const v = await VehicleService.getClientVehicles(selectedClientId);
        setVehicles(v);
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Erro ao carregar veículos",
          description: err.message,
          variant: "destructive",
        });
      }
    })();
  }, [selectedClientId, toast]);

  // submit
  const onSubmit = async (data: OrderFormValues) => {
    try {
      const payload = {
        service_type_id: data.serviceTypeId,
        client_id: isClient ? data.clientId! : data.clientId,
        license_plate: data.licensePlate,
        notes: data.observations || "",
        estimated_delivery_date: data.expectedDeliveryDate
          ? format(data.expectedDeliveryDate, "yyyy-MM-dd")
          : undefined,
        status_id: data.statusId!,
        value: 0,
        created_by: user!.id,
      };
      const created = await OrdersService.createOrder(payload);
      toast({ title: "Pedido criado com sucesso!" });
      onSuccess?.(created);
      reset();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao criar pedido",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    // 🔑 passo todo o objeto `form` aqui
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SERVIÇO */}
        <FormField
          control={control}
          name="serviceTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className={cn(
                    "w-full border rounded px-3 py-2 bg-background",
                    errors.serviceTypeId && "border-destructive"
                  )}
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage>{errors.serviceTypeId?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* CLIENTE */}
        {(isAdmin || isSeller) && (
          <FormField
            control={control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className={cn(
                      "w-full border rounded px-3 py-2 bg-background",
                      errors.clientId && "border-destructive"
                    )}
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage>{errors.clientId?.message}</FormMessage>
              </FormItem>
            )}
          />
        )}

        {/* VEÍCULO */}
        <FormField
          control={control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veículo</FormLabel>
              <div className="flex gap-2">
                <FormControl className="flex-1">
                  <select
                    {...field}
                    disabled={!selectedClientId}
                    className={cn(
                      "w-full border rounded px-3 py-2 bg-background",
                      errors.licensePlate && "border-destructive"
                    )}
                  >
                    <option value="">Selecione um veículo</option>
                    {vehicles.map((v) => (
                      <option key={v.license_plate} value={v.license_plate}>
                        {v.model} – {v.license_plate}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <Dialog
                  open={vehicleDialogOpen}
                  onOpenChange={setVehicleDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!selectedClientId}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Veículo</DialogTitle>
                      <DialogDescription>
                        Cadastre um veículo para este cliente.
                      </DialogDescription>
                    </DialogHeader>
                    <NewVehicleForm
                      clientId={selectedClientId}
                      onSuccess={(nv) => {
                        setVehicles((pv) => [...pv, nv]);
                        setValue("licensePlate", nv.license_plate);
                        setVehicleDialogOpen(false);
                      }}
                    />
                    <DialogFooter />
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage>{errors.licensePlate?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* OBSERVAÇÕES */}
        <FormField
          control={control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Observações adicionais" />
              </FormControl>
              <FormMessage>{errors.observations?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* DATA PREVISTA */}
        <FormField
          control={control}
          name="expectedDeliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Prevista para Entrega</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage>{errors.expectedDeliveryDate?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* STATUS */}
        {(isAdmin || isSeller) && (
          <FormField
            control={control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status do Pedido</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className={cn(
                      "w-full border rounded px-3 py-2 bg-background",
                      errors.statusId && "border-destructive"
                    )}
                  >
                    <option value="">Selecione um status</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage>{errors.statusId?.message}</FormMessage>
              </FormItem>
            )}
          />
        )}

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
}
