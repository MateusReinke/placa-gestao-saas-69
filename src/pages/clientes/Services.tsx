
/* -------------------------------------------------------------------------- */
/*  Cliente – Serviços (visualização + solicitação)                           */
/* -------------------------------------------------------------------------- */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";

import {
  ApiService,
  CategoryService,
  ServiceCategory,
  ServiceType,
} from "@/services/serviceTypesApi";

/* ------------------------- UI Kit (imports individuais) ------------------- */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { Table, LayoutGrid, PlusCircle } from "lucide-react";

/* ----------------------------- Utilidades --------------------------------- */
const categoryName = (id: string, all: ServiceCategory[]) =>
  all.find((c) => c.id === id)?.name ?? "—";

/* -------------------------------------------------------------------------- */

const ClienteServices: React.FC = () => {
  /* estado */
  const { toast } = useToast();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  /* UI */
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"table" | "cards">("cards");

  /* ------------------------------ Load ----------------------------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        /* ambas as consultas rodam em paralelo */
        const [srv, cat] = await Promise.all([
          ApiService.getServiceTypes(),
          CategoryService.getCategories(),
        ]);
        // Filtrar apenas serviços ativos
        setServices(srv.filter(s => s.active));
        setCategories(cat);
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os serviços.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  /* ------------------------- Filtro (memo) ------------------------------- */
  const filtered = useMemo(() => {
    const text = filter.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(text) ||
        categoryName(s.category_id, categories).toLowerCase().includes(text)
    );
  }, [filter, services, categories]);

  /* --------------- Navegação para criar novo pedido --------------------- */
  const solicitarServico = (serviceId: string) => {
    navigate(`/client/orders/new?serviceId=${serviceId}`);
  };

  /* ----------------------------- Render ---------------------------------- */
  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-60">Carregando…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-3 py-4 space-y-6">
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Serviços Disponíveis</h1>
            <p className="text-muted-foreground">
              Conheça nossos serviços e solicite um orçamento
            </p>
            <Input
              placeholder="Buscar serviço ou categoria…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Botões de visualização */}
          <div className="flex gap-2">
            <Button
              variant={view === "table" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setView("table")}
            >
              <Table className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "cards" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setView("cards")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* --------------------------- TABLE VIEW --------------------------- */}
        {view === "table" && (
          <div className="border rounded overflow-x-auto">
            <table className="min-w-full text-center divide-y">
              <thead className="bg-muted/50 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-muted-foreground">
                      Nenhum serviço encontrado.
                    </td>
                  </tr>
                )}

                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">
                      {`R$ ${Number(s.price).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}`}
                    </td>
                    <td className="px-4 py-3">{s.description || "—"}</td>
                    <td className="px-4 py-3">
                      {categoryName(s.category_id, categories)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => solicitarServico(s.id)}
                        className="gap-2"
                        size="sm"
                      >
                        <PlusCircle className="h-4 w-4" /> Solicitar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --------------------------- CARDS VIEW --------------------------- */}
        {view === "cards" && (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 && (
              <li className="col-span-full text-center text-muted-foreground py-8">
                Nenhum serviço encontrado.
              </li>
            )}

            {filtered.map((s) => (
              <li
                key={s.id}
                className="border rounded-lg p-4 bg-card space-y-3 hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="font-semibold text-lg">{s.name}</span>
                  <p className="text-sm text-muted-foreground">
                    {categoryName(s.category_id, categories)}
                  </p>
                </div>
                <p className="text-sm">{s.description || "—"}</p>
                <p className="font-medium text-lg">
                  {`R$ ${Number(s.price).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`}
                </p>
                <Button
                  onClick={() => solicitarServico(s.id)}
                  className="w-full gap-2"
                >
                  <PlusCircle className="h-4 w-4" /> Solicitar Serviço
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
};

export default ClienteServices;
