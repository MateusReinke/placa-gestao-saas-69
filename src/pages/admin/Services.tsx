// src/pages/admin/Services.tsx
import React, { useState, useEffect, useMemo } from "react";

import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

import {
  PlusCircle,
  Pencil,
  Trash2,
  Check,
  X,
  Table,
  LayoutGrid,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  ApiService,
  CategoryService,
  ServiceType,
  ServiceCategory,
} from "@/services/serviceTypesApi";

/* --------------------------------------------------------------------- */
/*              LABELS DE CATEGORIA (apenas fallback em memória)         */
/* --------------------------------------------------------------------- */
const labelFromCategory = (c: ServiceCategory | undefined) =>
  c ? c.name : "—";

/* --------------------------------------------------------------------- */
/*                                Zod                                    */
/* --------------------------------------------------------------------- */
const formSchema = z.object({
  name: z.string().min(3, "Obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Obrigatório"),
  active: z.boolean().default(true),
  category_id: z.string().min(1, "Selecione a categoria"),
});

/* --------------------------------------------------------------------- */
/*                            Switch                                     */
/* --------------------------------------------------------------------- */
const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
      checked ? "bg-green-500" : "bg-gray-400"
    }`}
    onClick={() => onChange(!checked)}
  >
    <span className="sr-only">toggle</span>
    <span
      className={`h-5 w-5 bg-white rounded-full transform transition ${
        checked ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
);

/* --------------------------------------------------------------------- */
/*                           COMPONENTE                                  */
/* --------------------------------------------------------------------- */
const AdminServices = () => {
  const { toast } = useToast();

  /* -------------------- dados -------------------- */
  const [services, setServices] = useState<ServiceType[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------- modal -------------------- */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  /* -------------------- inline ------------------- */
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);
  const [inlineValue, setInlineValue] = useState("");

  /* -------------------- filtros ------------------ */
  const [view, setView] = useState<"table" | "cards">("table");
  const [filterName, setFilterName] = useState("");

  /* -------------------- form --------------------- */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      active: true,
      category_id: "",
    },
  });

  /* --------- carregar serviços + categorias ------ */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [svc, cat] = await Promise.all([
          ApiService.getServiceTypes(),
          CategoryService.getCategories(),
        ]);
        setServices(svc);
        setCategories(cat);
      } catch {
        toast({
          title: "Erro",
          description: "Falha ao buscar dados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  /* ----------------- filtros simples ------------- */
  const filtered = useMemo(
    () =>
      services.filter((s) =>
        s.name.toLowerCase().includes(filterName.toLowerCase())
      ),
    [services, filterName]
  );

  /* ---------------- helpers inline --------------- */
  const startInline = (id: string, field: string, val: string) => {
    setEditingCell({ id, field });
    setInlineValue(val);
  };
  const cancelInline = () => setEditingCell(null);

  const saveInline = async (id: string, field: string) => {
    const value =
      field === "price"
        ? Number(inlineValue)
        : field === "category_id"
        ? inlineValue
        : inlineValue;

    try {
      const up = await ApiService.updateServiceType(id, { [field]: value });
      setServices((v) => v.map((s) => (s.id === id ? { ...s, ...up } : s)));
      setEditingCell(null);
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao salvar",
        variant: "destructive",
      });
    }
  };

  /* ---------------- helpers modal ---------------- */
  const openDialog = (s?: ServiceType) => {
    setIsEditMode(!!s);
    setEditId(s?.id ?? null);
    form.reset(
      s ?? {
        name: "",
        description: "",
        price: 0,
        active: true,
        category_id: "",
      }
    );
    setIsDialogOpen(true);
  };

  const submitModal = async (vals: z.infer<typeof formSchema>) => {
    try {
      if (editId) {
        const up = await ApiService.updateServiceType(editId, vals);
        setServices((v) =>
          v.map((s) => (s.id === editId ? { ...s, ...up } : s))
        );
      } else {
        const nw = await ApiService.createServiceType({
          name: vals.name || '',
          description: vals.description,
          category_id: vals.category_id || '',
          active: vals.active ?? true,
          price: vals.price || 0
        });
        setServices((v) => [...v, nw]);
      }
      setIsDialogOpen(false);
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao salvar",
        variant: "destructive",
      });
    }
  };

  const remove = async (id: string) => {
    try {
      await ApiService.deleteServiceType(id);
      setServices((v) => v.filter((s) => s.id !== id));
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao remover",
        variant: "destructive",
      });
    }
  };

  /* --------------------- UI ---------------------- */
  if (loading)
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-60">Carregando…</div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-3 py-4 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Gerenciar Serviços</h1>
            <Input
              placeholder="Filtrar por nome…"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={view === "table" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setView("table")}
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "cards" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setView("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button className="gap-2" onClick={() => openDialog()}>
              <PlusCircle className="h-4 w-4" /> Novo
            </Button>
          </div>
        </header>

        {/* ---------------- TABLE VIEW ---------------- */}
        {view === "table" && (
          <div className="border rounded overflow-x-auto">
            <table className="min-w-full text-center divide-y">
              <thead className="bg-muted/50 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-muted-foreground">
                      Nenhum serviço.
                    </td>
                  </tr>
                )}

                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted transition">
                    {/* Nome */}
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onDoubleClick={() => startInline(s.id, "name", s.name)}
                    >
                      {editingCell?.id === s.id &&
                      editingCell.field === "name" ? (
                        <InlineEdit
                          value={inlineValue}
                          setValue={setInlineValue}
                          save={() => saveInline(s.id, "name")}
                          cancel={cancelInline}
                        />
                      ) : (
                        s.name
                      )}
                    </td>

                    {/* Preço */}
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onDoubleClick={() =>
                        startInline(s.id, "price", String(s.price))
                      }
                    >
                      {editingCell?.id === s.id &&
                      editingCell.field === "price" ? (
                        <InlineEdit
                          value={inlineValue}
                          setValue={setInlineValue}
                          save={() => saveInline(s.id, "price")}
                          cancel={cancelInline}
                          isNumber
                        />
                      ) : (
                        `R$ ${Number(s.price).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}`
                      )}
                    </td>

                    {/* Descrição */}
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onDoubleClick={() =>
                        startInline(s.id, "description", s.description || "")
                      }
                    >
                      {editingCell?.id === s.id &&
                      editingCell.field === "description" ? (
                        <InlineEdit
                          value={inlineValue}
                          setValue={setInlineValue}
                          save={() => saveInline(s.id, "description")}
                          cancel={cancelInline}
                        />
                      ) : (
                        s.description || "—"
                      )}
                    </td>

                    {/* Categoria (select inline) */}
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onDoubleClick={() =>
                        startInline(s.id, "category_id", s.category_id)
                      }
                    >
                      {editingCell?.id === s.id &&
                      editingCell.field === "category_id" ? (
                        <InlineSelectEdit
                          value={inlineValue}
                          options={categories}
                          setValue={setInlineValue}
                          save={() => saveInline(s.id, "category_id")}
                          cancel={cancelInline}
                        />
                      ) : (
                        labelFromCategory(
                          categories.find((c) => c.id === s.category_id)
                        )
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                          s.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                        onClick={() =>
                          ApiService.updateServiceType(s.id, {
                            active: !s.active,
                          }).then((u) =>
                            setServices((v) =>
                              v.map((x) =>
                                x.id === s.id ? { ...x, active: u.active } : x
                              )
                            )
                          )
                        }
                      >
                        {s.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(s)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> {/*Editar */}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" /> {/*Remover */}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover serviço</AlertDialogTitle>
                            <AlertDialogDescription>
                              Confirmar remoção de "{s.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(s.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- CARDS VIEW ---------------- */}
        {view === "cards" && (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 && (
              <li className="col-span-full text-center text-muted-foreground py-8">
                Nenhum serviço.
              </li>
            )}
            {filtered.map((s) => (
              <li
                key={s.id}
                className="border rounded-lg p-4 bg-card space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{s.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      s.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    onClick={() =>
                      ApiService.updateServiceType(s.id, {
                        active: !s.active,
                      }).then((u) =>
                        setServices((v) =>
                          v.map((x) =>
                            x.id === s.id ? { ...x, active: u.active } : x
                          )
                        )
                      )
                    }
                  >
                    {s.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {labelFromCategory(
                    categories.find((c) => c.id === s.category_id)
                  )}
                </p>
                <p className="text-sm">{s.description || "—"}</p>
                <p className="font-medium">
                  {`R$ ${Number(s.price).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDialog(s)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover serviço</AlertDialogTitle>
                        <AlertDialogDescription>
                          Confirmar remoção de "{s.name}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(s.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* -------------------- MODAL -------------------- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {isEditMode ? "Editar" : "Novo"} Serviço
              </DialogTitle>
              <div className="flex items-center gap-2 ml-6 mt-8">
                <span
                  className={
                    form.watch("active") ? "text-green-600" : "text-red-600"
                  }
                >
                  {form.watch("active") ? "Ativo" : "Inativo"}
                </span>
                <Switch
                  checked={form.watch("active")}
                  onChange={(v) => form.setValue("active", v)}
                />
              </div>
            </div>
            <DialogDescription />
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitModal)}
              className="space-y-4 py-2"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="
                        w-full
                        rounded-md
                        border
                        border-border
                        bg-background
                        px-3
                        py-2
                        text-sm
                        placeholder:text-muted-foreground
                        focus:outline-none
                        focus:ring-2
                        focus:ring-primary
                        disabled:opacity-50
                        disabled:pointer-events-none
                      "
                      >
                        <option value="">Selecione…</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditMode ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

/* ---------------- componentes inline ---------------- */
const InlineEdit = ({
  value,
  setValue,
  save,
  cancel,
  isNumber,
}: {
  value: string;
  setValue: (v: string) => void;
  save: () => void;
  cancel: () => void;
  isNumber?: boolean;
}) => (
  <div className="flex items-center gap-1 justify-center">
    <Input
      type={isNumber ? "number" : "text"}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-32"
      autoFocus
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
      }}
    />
    <Button size="icon" variant="outline" onClick={save}>
      <Check className="w-4 h-4" />
    </Button>
    <Button size="icon" variant="outline" onClick={cancel}>
      <X className="w-4 h-4" />
    </Button>
  </div>
);

const InlineSelectEdit = ({
  value,
  options,
  setValue,
  save,
  cancel,
}: {
  value: string;
  options: ServiceCategory[];
  setValue: (v: string) => void;
  save: () => void;
  cancel: () => void;
}) => (
  <div className="flex items-center gap-1 justify-center">
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="
    border
    rounded-md
    bg-background
    px-2
    py-1
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-primary
  "
      autoFocus
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
      }}
    >
      {options.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
    <Button size="icon" variant="outline" onClick={save}>
      <Check className="w-4 h-4" />
    </Button>
    <Button size="icon" variant="outline" onClick={cancel}>
      <X className="w-4 h-4" />
    </Button>
  </div>
);

export default AdminServices;
