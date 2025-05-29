// src/components/dashboard/ConfigureCustomWidgetDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardWidget, WidgetConfig } from "@/types/dashboardWidgets"; // Importando WidgetConfig

interface ConfigureCustomWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: DashboardWidget | null;
  onSave: (widgetId: string, newConfig: WidgetConfig) => void; // Usando WidgetConfig
}

const availableQueries = [
  { id: "query_total_clients_by_type", name: "Total de Clientes por Tipo" },
  { id: "query_orders_last_7_days", name: "Pedidos nos Últimos 7 Dias" },
  { id: "query_top_5_services", name: "Top 5 Serviços Mais Pedidos" },
];

// Tipo CORRETO para displayType, alinhado com DashboardWidget['config']['displayType']
type DisplayType =
  | "table"
  | "barChart"
  | "lineChart"
  | "pieChart"
  | "singleValueCard"
  | "textList";

const ConfigureCustomWidgetDialog: React.FC<
  ConfigureCustomWidgetDialogProps
> = ({ open, onOpenChange, widget, onSave }) => {
  const [title, setTitle] = useState("");
  const [queryId, setQueryId] = useState("");
  const [displayType, setDisplayType] = useState<DisplayType>("table");
  const [unit, setUnit] = useState(""); // Para o campo 'unit'

  useEffect(() => {
    if (widget) {
      setTitle(widget.config?.title || widget.type || "");
      setQueryId(widget.config?.queryId || "");
      setDisplayType(widget.config?.displayType || "table");
      setUnit(widget.config?.displayConfig?.unit || "");
    }
  }, [widget]);

  const handleSave = () => {
    if (widget) {
      const newConfig: WidgetConfig = {
        // Tipando explicitamente como WidgetConfig
        ...widget.config,
        title: title,
        queryId: queryId,
        displayType: displayType,
        displayConfig: {
          ...widget.config?.displayConfig, // Preserva outras configs de display
          unit: unit, // Salva a unidade
          // Exemplo de como você poderia definir outras configs de display:
          ...(displayType === "table" && {
            columns: widget.config?.displayConfig?.columns || [
              { key: "name", label: "Nome" },
              { key: "value", label: "Valor" },
            ],
          }),
          ...(displayType === "barChart" && {
            xAxisKey: widget.config?.displayConfig?.xAxisKey || "name",
            yAxisKey: widget.config?.displayConfig?.yAxisKey || "value",
          }),
          ...(displayType === "singleValueCard" && {
            valueKey: widget.config?.displayConfig?.valueKey || "total",
            valueLabel: title,
          }),
        },
      };
      onSave(widget.id, newConfig);
    }
  };

  if (!widget) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            Configurar Widget: {widget.config?.title || widget.type}
          </DialogTitle>
          <DialogDescription>
            Ajuste as opções de visualização e fonte de dados para este widget.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="widget-title" className="text-right col-span-1">
              Título
            </Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Título do Widget"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="query-id" className="text-right col-span-1">
              Fonte de Dados
            </Label>
            <Select
              value={queryId}
              onValueChange={(value) => setQueryId(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione uma consulta" />
              </SelectTrigger>
              <SelectContent>
                {availableQueries.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="display-type" className="text-right col-span-1">
              Exibir Como
            </Label>
            <Select
              value={displayType}
              onValueChange={(value) => setDisplayType(value as DisplayType)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione como exibir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Tabela</SelectItem>
                <SelectItem value="barChart">Gráfico de Barras</SelectItem>
                <SelectItem value="lineChart">Gráfico de Linhas</SelectItem>
                <SelectItem value="pieChart">Gráfico de Pizza</SelectItem>
                <SelectItem value="singleValueCard">
                  Card de Valor Único
                </SelectItem>
                <SelectItem value="textList">Lista de Texto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Campo para 'unit', relevante para singleValueCard ou gráficos */}
          {(displayType === "singleValueCard" ||
            displayType.includes("Chart")) && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="widget-unit" className="text-right col-span-1">
                Unidade
              </Label>
              <Input
                id="widget-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="col-span-3"
                placeholder="Ex: R$, %, unidades"
              />
            </div>
          )}
          {/* Aqui você adicionaria mais campos para displayConfig se necessário */}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigureCustomWidgetDialog;
