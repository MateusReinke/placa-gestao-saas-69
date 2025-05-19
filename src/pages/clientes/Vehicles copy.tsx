// src/pages/clientes/Vehicles.tsx
import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Loader2,
  Car,
  Bike,
  Truck,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
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
type PlateType = {
  id: string;
  code: string;
  label: string;
  color: string;
};

export default function Vehicles() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [clientId, setClientId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plateTypes, setPlateTypes] = useState<PlateType[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Vehicle | null>(null);
  const [confirmPlate, setConfirmPlate] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "carros" | "motos" | "caminhoes"
  >("all");

  // 1) pega client_id
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
          description: "Não foi possível identificar o cliente.",
          variant: "destructive",
        })
      );
  }, [user]);

  // 2) carrega veículos e tipos
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
          description: "Falha ao carregar veículos.",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, [clientId]);

  // abrir modal novo/editar
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

  // abrir diálogo de exclusão
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
    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover.",
        variant: "destructive",
      });
    } else {
      setVehicles((prev) => prev.filter((x) => x.id !== toDelete.id));
      toast({ title: "Removido", description: "Veículo removido." });
    }
    setDeleteDialogOpen(false);
  };

  // aplicar filtros e busca
  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const q = searchQuery.toLowerCase();
      const textMatch =
        v.license_plate.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q);
      const pt = plateTypes.find((t) => t.id === v.plate_type_id);
      const code = pt?.code || "";
      const typeMatch =
        filterType === "all" ||
        (filterType === "carros" &&
          !code.includes("moto") &&
          !code.includes("caminhao")) ||
        (filterType === "motos" && code.includes("moto")) ||
        (filterType === "caminhoes" && code.includes("caminhao"));
      return textMatch && typeMatch;
    });
  }, [vehicles, searchQuery, filterType, plateTypes]);

  // atalho de cópia
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado`, description: text });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* === LINHA 1: título + botão "Adicionar Veículo" === */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meus Veículos</h1>
          <Button onClick={handleNew} className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Adicionar Veículo
          </Button>
        </div>

        {/* === LINHA 2: filtros + busca === */}
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

        {/* separador */}
        <hr className="border-gray-700" />

        {/* === GRID DE CARDS === */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filtered.map((v) => {
              const pt = plateTypes.find((t) => t.id === v.plate_type_id) || {
                code: "",
                color: "#000",
              };
              let Icon = Car;
              if (pt.code.includes("moto")) Icon = Bike;
              if (pt.code.includes("caminhao")) Icon = Truck;

              return (
                <div
                  key={v.id}
                  className="relative flex flex-col justify-between bg-gray-800 p-6 rounded-lg text-white h-full"
                >
                  {/* menu de contexto (⋮) */}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4 text-gray-400 hover:text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(v)}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openDelete(v)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* placa */}
                  <div className="flex justify-center mb-4">
                    <LicensePlate
                      plate={v.license_plate}
                      plateColor={pt.color}
                      plateTypeCode={pt.code}
                    />
                  </div>

                  {/* título marca | modelo */}
                  <div className="flex items-center justify-center text-2xl font-semibold mb-3 text-center">
                    <Icon className="h-5 w-5 mr-2" />
                    {v.brand} | {v.model}
                  </div>

                  {/* detalhes em lista */}
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    <li>
                      <button
                        onClick={() =>
                          copyToClipboard(v.license_plate, "Placa")
                        }
                        className="hover:underline"
                      >
                        Placa: {v.license_plate}
                      </button>
                    </li>
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
                        onClick={() => copyToClipboard(v.year, "Ano")}
                        className="hover:underline"
                      >
                        Ano: {v.year}
                      </button>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* modal Novo/Editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md w-full">
            <DialogHeader>
              <DialogTitle>
                {editVehicle ? "Editar Veículo" : "Novo Veículo"}
              </DialogTitle>
            </DialogHeader>
            <NewVehicleForm
              initialData={editVehicle || undefined}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>

        {/* modal Confirmar Remoção */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Confirmar remoção</DialogTitle>
            </DialogHeader>
            {toDelete && (
              <div className="flex justify-center mb-4">
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
              </div>
            )}
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
