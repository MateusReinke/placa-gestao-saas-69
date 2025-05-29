// src/components/dashboard/widgets/MonthlyRevenueChart.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardStats } from "@/types";

interface MonthlyRevenueChartProps {
  stats: DashboardStats | null;
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      {" "}
      {/* Mantenha o col-span se você quiser um tamanho padrão */}
      <CardHeader>
        <CardTitle>Tendência de Faturamento e Pedidos</CardTitle>
        <CardDescription>
          Faturamento e total de pedidos dos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {stats?.ordersByMonth && stats.ordersByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.ordersByMonth}>
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "revenue") {
                    return [formatCurrency(value), "Faturamento"];
                  } else {
                    return [`${value} pedidos`, "Quantidade"];
                  }
                }}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Faturamento"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="count"
                name="Pedidos"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Nenhum dado disponível para o gráfico de faturamento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenueChart;
