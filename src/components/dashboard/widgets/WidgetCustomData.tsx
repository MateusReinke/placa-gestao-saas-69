// src/components/dashboard/widgets/WidgetCustomData.tsx
import React, { useEffect, useState } from "react";
// Card* não é usado diretamente como wrapper aqui, mas sim dentro dos cases de display
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart as RechartsBarChart, // Renomeado para evitar conflito com ícone
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  // LineChart, Line, PieChart, Pie, Cell // Descomente se for usar outros tipos de gráfico
} from "recharts";
import { DashboardWidget } from "@/types/dashboardWidgets"; // IMPORTANTE: Importação do tipo

interface WidgetCustomDataProps {
  config?: DashboardWidget["config"];
}

const WidgetCustomData: React.FC<WidgetCustomDataProps> = ({ config }) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (config?.queryId) {
      setLoading(true);
      setError(null);
      const fetchData = async () => {
        try {
          console.log(
            `WidgetCustomData: Buscando dados para queryId: ${config.queryId}, displayType: ${config.displayType}`
          );

          // --- Dados de Placeholder para Demonstração ---
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 + Math.random() * 1000)
          );

          if (config.displayType === "table") {
            setData([
              { id: 1, produto: "Placa Mercosul Carro", qtd: 50, valor: 120.0 },
              { id: 2, produto: "Lacre de Segurança", qtd: 200, valor: 5.5 },
              {
                id: 3,
                produto: "Suporte de Placa Universal",
                qtd: 75,
                valor: 15.0,
              },
            ]);
          } else if (config.displayType === "barChart") {
            setData([
              {
                name: "Serviço A",
                pedidos: Math.floor(Math.random() * 100) + 10,
              },
              {
                name: "Serviço B",
                pedidos: Math.floor(Math.random() * 100) + 10,
              },
              {
                name: "Serviço C",
                pedidos: Math.floor(Math.random() * 100) + 10,
              },
              {
                name: "Serviço D",
                pedidos: Math.floor(Math.random() * 100) + 10,
              },
            ]);
          } else if (config.displayType === "singleValueCard") {
            setData([
              { total_vendas: Math.floor(Math.random() * 50000) + 10000 },
            ]);
          } else if (config.displayType === "textList") {
            setData([
              { text: "Lembrete: Verificar estoque de placas especiais." },
              { text: "Próxima reunião de equipe: 03/06 às 10h." },
              { text: "Atualizar tabela de preços dos serviços." },
            ]);
          } else {
            setData([]);
          }
        } catch (e: any) {
          setError(e.message || "Erro ao buscar dados para o widget.");
          console.error("Erro em WidgetCustomData:", e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setError("Configuração de consulta (queryId) ausente para este widget.");
      setLoading(false);
    }
  }, [config]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-destructive text-xs p-3 text-center">
        <Info className="h-5 w-5 mb-1" />
        {error}
      </div>
    );
  }
  if (
    !data ||
    (data.length === 0 && config?.displayType !== "singleValueCard")
  ) {
    // singleValueCard pode ter data[0] mas length 1
    if (
      config?.displayType === "singleValueCard" &&
      data &&
      data.length === 1 &&
      data[0] !== null &&
      typeof data[0] === "object"
    ) {
      // Prossiga para renderizar singleValueCard
    } else {
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-3 text-center">
          Sem dados para exibir.
        </div>
      );
    }
  }

  switch (config?.displayType) {
    case "table":
      if (!data || data.length === 0)
        return (
          <div className="p-2 text-xs text-muted-foreground">
            Sem dados para a tabela.
          </div>
        );
      const columns =
        config.displayConfig?.columns ||
        (data[0]
          ? Object.keys(data[0]).map((key) => ({
              key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
            }))
          : []);
      if (columns.length === 0)
        return (
          <div className="p-2 text-xs text-muted-foreground">
            Configuração de colunas ausente.
          </div>
        );
      return (
        <div className="overflow-auto h-full w-full text-[11px]">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="py-1.5 px-2 h-auto whitespace-nowrap"
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className="py-1 px-2 whitespace-nowrap"
                    >
                      {String(row[col.key] ?? "N/A")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    case "barChart":
      if (!data || data.length === 0)
        return (
          <div className="p-2 text-xs text-muted-foreground">
            Sem dados para o gráfico.
          </div>
        );
      const xAxisKeyBar = config.displayConfig?.xAxisKey || "name";
      const yAxisKeyBar =
        config.displayConfig?.yAxisKey ||
        (data[0]
          ? Object.keys(data[0]).find(
              (k) => k !== xAxisKeyBar && typeof data[0][k] === "number"
            )
          : undefined) ||
        "value";
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
          >
            <XAxis
              dataKey={xAxisKeyBar}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted)/0.3)" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: "12px",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "10px", paddingTop: "2px" }}
              height={20}
              verticalAlign="top"
            />
            <Bar
              dataKey={yAxisKeyBar}
              fill="hsl(var(--primary))"
              radius={[3, 3, 0, 0]}
              barSize={20}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    case "singleValueCard":
      if (
        !data ||
        data.length === 0 ||
        data[0] === null ||
        typeof data[0] !== "object"
      )
        return (
          <div className="p-2 text-xs text-muted-foreground">
            Dados inválidos para o card.
          </div>
        );
      const valueKey =
        config.displayConfig?.valueKey || Object.keys(data[0])[0];
      const value =
        valueKey && data[0][valueKey] !== undefined ? data[0][valueKey] : "N/A";
      const label = config.displayConfig?.valueLabel || "Valor Principal";
      const unit = config.displayConfig?.unit || "";
      return (
        <div className="flex flex-col items-center justify-center h-full p-2 text-center">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold">
            {String(value)}
            {unit}
          </p>
        </div>
      );
    case "textList":
      if (!data || data.length === 0)
        return (
          <div className="p-2 text-xs text-muted-foreground">
            Sem itens para a lista.
          </div>
        );
      return (
        <ul className="space-y-1.5 p-1 text-xs h-full overflow-y-auto">
          {data.map((item, index) => (
            <li
              key={index}
              className="border-b border-border/50 pb-1.5 last:border-b-0 last:pb-0"
            >
              {item.text || JSON.stringify(item)}
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <div className="text-xs p-2 text-muted-foreground">
          Tipo de display '{config?.displayType}' não configurado ou dados
          insuficientes.
        </div>
      );
  }
};

export default WidgetCustomData; // <<< GARANTA QUE ESTA LINHA EXISTE E É A ÚNICA EXPORTAÇÃO PADRÃO
