// src/pages/clientes/Vehicles.tsx
import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Loader2,
  Car,
  Bike,
  Truck,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import LicensePlate from "@/components/LicensePlate";
import NewVehicleForm from "@/components/forms/NewVehicleForm";

// Tipos
type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  renavam: string | null;
  plate_type_id: string;
  client_id: string;
};
type PlateType = { id: string; code: string; label: string; color: string };

export default function Vehicles() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [clientId, setClientId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plateTypes, setPlateTypes] = useState<PlateType[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog Add/Edit
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  // Dialog Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Vehicle | null>(null);
  const [confirmPlate, setConfirmPlate] = useState("");

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "carros" | "motos" | "caminhoes"
  >("all");

  // 1) Cliente
  useEffect(() => {
    if (!user) return;
    supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        setClientId(data.id);
      })
      .catch(() =>
        toast({
          title: "Erro",
          description: "Não achei seu cliente.",
          variant: "destructive",
        })
      );
  }, [user, toast]);

  // 2) Dados
  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    Promise.all([
      supabase.from<Vehicle>("vehicles").select("*").eq("client_id", clientId),
      supabase.from<PlateType>("plate_types").select("*"),
    ])
      .then(([vRes, ptRes]) => {
        if (vRes.error) throw vRes.error;
        if (ptRes.error) throw ptRes.error;
        setVehicles(vRes.data || []);
        setPlateTypes(ptRes.data || []);
      })
      .catch(() =>
        toast({
          title: "Erro",
          description: "Falha ao carregar.",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, [clientId, toast]);

  // New/Edit handlers
  const handleNew = () => {
    setEditVehicle(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (v: Vehicle) => {
    setEditVehicle(v);
    setIsDialogOpen(true);
  };
  const handleSuccess = () => {
    setIsDialogOpen(false);
    if (!clientId) return;
    supabase
      .from<Vehicle>("vehicles")
      .select("*")
      .eq("client_id", clientId)
      .then(({ data }) => data && setVehicles(data));
  };

  // Delete handlers
  const openDelete = (v: Vehicle) => {
    setToDelete(v);
    setConfirmPlate("");
    setDeleteDialogOpen(true);
  };
  const handleDelete = async () => {
    if (!toDelete || confirmPlate !== toDelete.license_plate) return;
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", toDelete.id);
    if (error)
      toast({
        title: "Erro",
        description: "Não removido.",
        variant: "destructive",
      });
    else {
      setVehicles((prev) => prev.filter((x) => x.id !== toDelete.id));
      toast({ title: "Removido", description: "Veículo removido." });
    }
    setDeleteDialogOpen(false);
  };

  // Filtragem
  const filtered = useMemo(
    () =>
      vehicles.filter((v) => {
        const q = searchQuery.toLowerCase();
        const matchText =
          v.license_plate.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q);
        const pt = plateTypes.find((t) => t.id === v.plate_type_id)?.code || "";
        const matchType =
          filterType === "all" ||
          (filterType === "carros" &&
            !pt.includes("moto") &&
            !pt.includes("caminhao")) ||
          (filterType === "motos" && pt.includes("moto")) ||
          (filterType === "caminhoes" && pt.includes("caminhao"));
        return matchText && matchType;
      }),
    [vehicles, searchQuery, filterType, plateTypes]
  );

  // Copiar
  const copyToClipboard = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    toast({ title: `${label} copiado`, description: txt });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Linha 1 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meus Veículos</h1>
          <Button onClick={handleNew} className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Adicionar Veículo
          </Button>
        </div>

        {/* Linha 2 */}
        <div className="flex items-center justify-between">
          <Tabs
            value={filterType}
            onValueChange={setFilterType}
            className="flex-1 max-w-md"
          >
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="carros">
                <Car className="inline h-4 w-4 mr-1" />
                Carro
              </TabsTrigger>
              <TabsTrigger value="motos">
                <Bike className="inline h-4 w-4 mr-1" />
                Moto
              </TabsTrigger>
              <TabsTrigger value="caminhoes">
                <Truck className="inline h-4 w-4 mr-1" />
                Caminhão
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            placeholder="Buscar por placa, marca ou modelo…"
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Loading / Lista */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v) => {
              const pt = plateTypes.find((t) => t.id === v.plate_type_id);
              let Icon = Car;
              if (pt?.code.includes("moto")) Icon = Bike;
              if (pt?.code.includes("caminhao")) Icon = Truck;

              return (
                <div
                  key={v.id}
                  className="relative bg-gray-800 p-6 rounded-lg space-y-4 text-white"
                >
                  {/* Menu Opções */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="absolute top-3 right-3 p-1 hover:bg-gray-700 rounded">
                      <MoreVertical className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(v)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDelete(v)}>
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Placa */}
                  <div className="flex justify-center mb-4">
                    <LicensePlate
                      plate={v.license_plate}
                      plateColor={pt?.color || "#000"}
                      plateTypeCode={pt?.code || ""}
                    />
                  </div>

                  {/* Marca | Modelo com logo */}
                  <div className="flex items-center justify-center space-x-2 text-xl font-semibold">
                    {/* Supondo logos em /public/logos/{brand}.png */}
                    <img
                      src={`/logos/${v.brand.toLowerCase()}.png`}
                      alt={v.brand}
                      className="h-6 w-auto"
                      onError={(e) => {
                        (e.currentTarget as any).style.display = "none";
                      }}
                    />
                    <span>{v.model}</span>
                  </div>

                  {/* Detalhes em tópicos */}
                  <ul className="list-disc list-inside space-y-1">
                    <li>Marca: {v.brand}</li>
                    <li>Cor: {pt?.color ?? "—"}</li>
                    <li>
                      <button
                        onClick={() =>
                          copyToClipboard(v.renavam || "", "RENAVAM")
                        }
                        className="hover:underline"
                      >
                        RENAVAM: {v.renavam ?? "Não informado"}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() =>
                          copyToClipboard(v.year.split(" ")[0], "Ano")
                        }
                        className="hover:underline"
                      >
                        Ano: {v.year.split(" ")[0]}
                      </button>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Dialog Novo/Editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md w-full">
            <DialogHeader>
              <DialogTitle>
                {editVehicle ? "Editar Veículo" : "Novo Veículo"}
              </DialogTitle>
            </DialogHeader>
            <NewVehicleForm
              initialData={editVehicle ?? undefined}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog Remover */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Confirmar remoção</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center mb-4">
              {toDelete && (
                <LicensePlate
                  plate={toDelete.license_plate}
                  plateColor={
                    plateTypes.find((t) => t.id === toDelete.plate_type_id)
                      ?.color || "#000"
                  }
                  plateTypeCode={
                    plateTypes.find((t) => t.id === toDelete.plate_type_id)
                      ?.code || ""
                  }
                />
              )}
            </div>
            <p className="mb-4 text-center">
              Para confirmar, digite a placa do veículo{" "}
              <strong>"{toDelete?.license_plate}"</strong>
            </p>
            <Input
              placeholder="Digite a placa exatamente"
              value={confirmPlate}
              onChange={(e) => setConfirmPlate(e.target.value)}
            />
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={confirmPlate !== toDelete?.license_plate}
                onClick={handleDelete}
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
