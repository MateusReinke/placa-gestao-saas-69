// src/components/forms/NewVehicleForm.tsx
import React, { useEffect, useState } from "react";
import { Car, Bike, Truck, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import LicensePlate from "@/components/LicensePlate";

// Endpoints FIPE por categoria
const FIPE_BASE = {
  carros: "https://parallelum.com.br/fipe/api/v1/carros",
  motos: "https://parallelum.com.br/fipe/api/v1/motos",
  caminhoes: "https://parallelum.com.br/fipe/api/v1/caminhoes",
};

interface NewVehicleFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export default function NewVehicleForm({
  initialData,
  onSuccess,
}: NewVehicleFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // — Estados principais —
  const [category, setCategory] = useState<"carros" | "motos" | "caminhoes">(
    initialData?.category || "carros"
  );
  const [brands, setBrands] = useState<{ nome: string; codigo: string }[]>([]);
  const [models, setModels] = useState<{ nome: string; codigo: string }[]>([]);
  const [years, setYears] = useState<{ nome: string; codigo: string }[]>([]);
  const [plateTypes, setPlateTypes] = useState<
    { id: string; label: string; code: string; color: string }[]
  >([]);

  const [brandCode, setBrandCode] = useState(initialData?.brandCode || "");
  const [modelCode, setModelCode] = useState(initialData?.modelCode || "");
  const [yearCode, setYearCode] = useState(initialData?.yearCode || "");
  const [plateTypeId, setPlateTypeId] = useState(
    initialData?.plate_type_id || ""
  );
  const [licensePlate, setLicensePlate] = useState(
    initialData?.license_plate || ""
  );
  const [renavam, setRenavam] = useState(initialData?.renavam || "");
  const [submitting, setSubmitting] = useState(false);

  // — Carrega tipos de placa —
  useEffect(() => {
    supabase
      .from("plate_types")
      .select("id,label,code,color")
      .then(({ data, error }) => {
        if (!error) setPlateTypes(data || []);
      });
  }, []);

  // — Filtra plate types por categoria —
  const filteredPlateTypes = plateTypes.filter((pt) => {
    if (category === "motos") return pt.code.includes("moto");
    if (category === "caminhoes") return pt.code.includes("comercial");
    // carros: todos exceto moto
    return !pt.code.includes("moto");
  });

  // — Ao trocar de categoria, reseta ou pré-seleciona tipo de placa —
  useEffect(() => {
    if (filteredPlateTypes.length === 1) {
      setPlateTypeId(filteredPlateTypes[0].id);
    } else {
      setPlateTypeId("");
    }
  }, [category, plateTypes]);

  // — FIPE: carregar marcas ao mudar categoria —
  useEffect(() => {
    setBrands([]);
    setModels([]);
    setYears([]);
    setBrandCode("");
    setModelCode("");
    setYearCode("");
    fetch(`${FIPE_BASE[category]}/marcas`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setBrands)
      .catch(() =>
        toast({
          title: "FIPE",
          description: "Erro ao buscar marcas",
          variant: "destructive",
        })
      );
  }, [category, toast]);

  // — FIPE: carregar modelos ao escolher marca —
  useEffect(() => {
    if (!brandCode) return setModels([]);
    fetch(`${FIPE_BASE[category]}/marcas/${brandCode}/modelos`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setModels(j.modelos))
      .catch(() =>
        toast({
          title: "FIPE",
          description: "Erro ao buscar modelos",
          variant: "destructive",
        })
      );
  }, [brandCode, category, toast]);

  // — FIPE: carregar anos ao escolher modelo —
  useEffect(() => {
    if (!brandCode || !modelCode) return setYears([]);
    fetch(
      `${FIPE_BASE[category]}/marcas/${brandCode}/modelos/${modelCode}/anos`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setYears)
      .catch(() =>
        toast({
          title: "FIPE",
          description: "Erro ao buscar anos",
          variant: "destructive",
        })
      );
  }, [brandCode, modelCode, category, toast]);

  // — Submissão —
  const handleSubmit = async () => {
    if (
      !licensePlate ||
      !plateTypeId ||
      !brandCode ||
      !modelCode ||
      !yearCode
    ) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      // pega client_id
      const { data: cli } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      const payload = {
        category,
        license_plate: licensePlate.toUpperCase(),
        renavam: renavam || null,
        plate_type_id: plateTypeId,
        brand: brands.find((b) => b.codigo === brandCode)!.nome,
        model: models.find((m) => m.codigo === modelCode)!.nome,
        year: years.find((y) => y.codigo === yearCode)!.nome,
        client_id: cli!.id,
      };

      let res;
      if (initialData?.id) {
        res = await supabase
          .from("vehicles")
          .update(payload)
          .eq("id", initialData.id);
      } else {
        res = await supabase.from("vehicles").insert(payload);
      }
      if (res.error) throw res.error;

      toast({
        title: initialData ? "Atualizado" : "Adicionado",
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro",
        description: "Falha ao salvar veículo",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // — Preview props —
  const pt = plateTypes.find((t) => t.id === plateTypeId);
  const previewColor = pt?.color || "#000";
  const previewCode = pt?.code || "";

  return (
    <div className="space-y-6 w-full">
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Editar Veículo" : "Novo Veículo"}
        </DialogTitle>
      </DialogHeader>

      {/* 1) Preview da placa */}
      <div className="flex justify-center">
        <LicensePlate
          plate={licensePlate || "AAA1A11"}
          plateColor={previewColor}
          plateTypeCode={previewCode}
        />
      </div>

      {/* 2) Categoria */}
      <div className="flex gap-2">
        <Button
          variant={category === "carros" ? "default" : "outline"}
          onClick={() => setCategory("carros")}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Car className="h-4 w-4" />
          Carro
        </Button>
        <Button
          variant={category === "motos" ? "default" : "outline"}
          onClick={() => setCategory("motos")}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Bike className="h-4 w-4" />
          Moto
        </Button>
        <Button
          variant={category === "caminhoes" ? "default" : "outline"}
          onClick={() => setCategory("caminhoes")}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Truck className="h-4 w-4" />
          Caminhão
        </Button>
      </div>

      {/* ... keep existing code (FIPE selectors and inputs) */}
      
      {/* 3) Marca FIPE */}
      <Select onValueChange={setBrandCode} value={brandCode}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione a marca" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {brands.map((b) => (
              <SelectItem key={b.codigo} value={b.codigo}>
                {b.nome}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 4) Modelo FIPE */}
      <Select
        onValueChange={setModelCode}
        value={modelCode}
        disabled={!brandCode}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o modelo" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {models.map((m) => (
              <SelectItem key={m.codigo} value={m.codigo}>
                {m.nome}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 5) Ano FIPE */}
      <Select
        onValueChange={setYearCode}
        value={yearCode}
        disabled={!modelCode}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {years.map((y) => (
              <SelectItem key={y.codigo} value={y.codigo}>
                {y.nome}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 6) Tipo de placa filtrado */}
      <Select
        onValueChange={setPlateTypeId}
        value={plateTypeId}
        disabled={filteredPlateTypes.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o tipo de placa" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {filteredPlateTypes.map((pt) => (
              <SelectItem key={pt.id} value={pt.id}>
                {pt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 7) Inputs Placa e Renavam */}
      <Input
        placeholder="Placa (AAA1A11)"
        value={licensePlate}
        maxLength={7}
        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
      />
      <Input
        placeholder="Renavam (opcional)"
        value={renavam}
        onChange={(e) => setRenavam(e.target.value)}
      />

      {/* 8) Botão salvar */}
      <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
        {submitting ? (
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        {initialData ? "Atualizar Veículo" : "Adicionar Veículo"}
      </Button>
    </div>
  );
}
