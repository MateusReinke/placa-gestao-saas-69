import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiService } from "@/services/serviceTypesApi";
import { DashboardStats } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AppLayout from "@/components/layouts/AppLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        try {
          const data = await ApiService.getDashboardStats(user.id, user.role);
          setStats(data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [user]);

  // Bar chart colors
  const barChartColors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

  // Pie chart colors
  const pieChartColors = [
    "#3b82f6", // blue-500
    "#06b6d4", // cyan-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
  ];

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-32"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Pedidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pedidos registrados no sistema
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faturamento do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats ? formatCurrency(stats.monthlyRevenue) : "R$ 0,00"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total faturado no mês atual
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Processos Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalOrders
                      ? stats.totalOrders -
                        (stats.ordersByStatus.find(
                          (s) => s.statusName === "Concluído"
                        )?.count || 0) -
                        (stats.ordersByStatus.find(
                          (s) => s.statusName === "Cancelado"
                        )?.count || 0)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pedidos em andamento/pendentes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Orders by Month Chart */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Volume de Pedidos por Mês
                  </CardTitle>
                  <CardDescription>
                    Total de pedidos registrados mensalmente
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {stats?.ordersByMonth && stats.ordersByMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.ordersByMonth}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [
                            `${value} pedidos`,
                            "Quantidade",
                          ]}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Nenhum dado disponível
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Orders by Service Type (Pie Chart) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Distribuição por Tipo de Serviço
                  </CardTitle>
                  <CardDescription>
                    Percentual de cada tipo de serviço
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {stats?.ordersByServiceType &&
                  stats.ordersByServiceType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.ordersByServiceType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          dataKey="count"
                          nameKey="serviceName"
                          label={({ serviceName, percent }) =>
                            `${serviceName}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {stats.ordersByServiceType.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                pieChartColors[index % pieChartColors.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} pedidos`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Nenhum dado disponível
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pedidos por Status</CardTitle>
                  <CardDescription>
                    Distribuição de pedidos por status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
                    <div className="space-y-4">
                      {stats.ordersByStatus.map((statusStat) => (
                        <div key={statusStat.statusName} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {statusStat.statusName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {statusStat.count} pedidos
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${
                                  (statusStat.count / stats.totalOrders) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">
                        Nenhum dado disponível
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
